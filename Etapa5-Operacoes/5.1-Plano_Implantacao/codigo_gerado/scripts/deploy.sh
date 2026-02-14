#!/usr/bin/env bash
# =============================================================================
# scripts/deploy.sh — Script de deploy manual / rollback
#
# USO:
#   ./deploy.sh staging  v1.2.3     # deploy versão específica em staging
#   ./deploy.sh prod     v1.2.3     # deploy em produção (pede confirmação)
#   ./deploy.sh rollback             # volta para a versão anterior
#   ./deploy.sh status               # mostra status dos containers
#
# DEPENDÊNCIAS: docker, docker compose, curl
# =============================================================================

set -euo pipefail

# ── Cores para output legível ─────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info()    { echo -e "${BLUE}[INFO]${NC}    $1"; }
log_success() { echo -e "${GREEN}[OK]${NC}      $1"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC}    $1"; }
log_error()   { echo -e "${RED}[ERRO]${NC}    $1" >&2; }

# ── Validações ────────────────────────────────────────────────────────────────
COMMAND="${1:-help}"
AMBIENTE="${2:-}"
TAG="${3:-latest}"

APP_DIR="/opt/hotel-reservas"
BACKUP_FILE="$APP_DIR/docker-compose.backup.yml"

check_dependencies() {
  for cmd in docker curl; do
    if ! command -v "$cmd" &>/dev/null; then
      log_error "Dependência ausente: $cmd"
      exit 1
    fi
  done
}

# ── Funções principais ────────────────────────────────────────────────────────

deploy() {
  local env="$1"
  local tag="$2"

  log_info "Iniciando deploy — ambiente: $env | tag: $tag"

  if [[ "$env" == "prod" || "$env" == "production" ]]; then
    echo -e "${YELLOW}⚠️  Deploy em PRODUÇÃO para tag $tag${NC}"
    read -r -p "Confirma? (digite 'sim' para continuar): " confirm
    if [[ "$confirm" != "sim" ]]; then
      log_warn "Deploy cancelado pelo operador"
      exit 0
    fi
  fi

  cd "$APP_DIR"

  # Backup do compose atual
  if [[ -f docker-compose.yml ]]; then
    cp docker-compose.yml "$BACKUP_FILE"
    log_info "Backup salvo em $BACKUP_FILE"
  fi

  # Atualiza tag das imagens no compose
  export IMAGE_TAG="$tag"

  # Pull das novas imagens
  log_info "Fazendo pull das imagens com tag $tag..."
  docker compose pull

  # Deploy
  log_info "Subindo serviços..."
  docker compose up -d --remove-orphans

  # Aguarda inicialização
  log_info "Aguardando inicialização (15s)..."
  sleep 15

  # Health check
  health_check "$env"
}

health_check() {
  local env="$1"
  local url

  case "$env" in
    staging)    url="https://staging.hotel-reservas.app/health" ;;
    prod|production) url="https://hotel-reservas.app/health" ;;
    local)      url="http://localhost/health" ;;
    *)          url="http://localhost/health" ;;
  esac

  log_info "Verificando saúde em $url..."

  local max_retries=8
  local delay=10

  for i in $(seq 1 $max_retries); do
    local status
    status=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")

    if [[ "$status" == "200" ]]; then
      log_success "Health check OK (HTTP $status)"
      return 0
    fi

    log_warn "Tentativa $i/$max_retries — status: $status. Aguardando ${delay}s..."
    sleep $delay
  done

  log_error "Health check falhou após $max_retries tentativas"
  return 1
}

rollback() {
  log_warn "Iniciando ROLLBACK para versão anterior..."

  if [[ ! -f "$BACKUP_FILE" ]]; then
    log_error "Arquivo de backup não encontrado: $BACKUP_FILE"
    exit 1
  fi

  cd "$APP_DIR"
  cp "$BACKUP_FILE" docker-compose.yml
  docker compose up -d --remove-orphans

  log_info "Aguardando reinicialização (10s)..."
  sleep 10

  docker compose ps
  log_success "Rollback concluído"
}

status() {
  cd "$APP_DIR"
  echo ""
  echo "═══════════════════════════════════════"
  echo "  Status dos Containers"
  echo "═══════════════════════════════════════"
  docker compose ps
  echo ""
  echo "═══════════════════════════════════════"
  echo "  Uso de Recursos"
  echo "═══════════════════════════════════════"
  docker stats --no-stream --format \
    "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
}

usage() {
  cat <<EOF
Uso: $0 <comando> [ambiente] [tag]

Comandos:
  deploy <staging|prod> <tag>   Deploya uma versão específica
  rollback                       Volta para a versão anterior
  status                         Exibe status e uso de recursos
  health <ambiente>              Verifica saúde do ambiente

Exemplos:
  $0 deploy staging v1.2.3
  $0 deploy prod v1.2.3
  $0 rollback
  $0 status
  $0 health staging
EOF
}

# ── Dispatcher ────────────────────────────────────────────────────────────────
check_dependencies

case "$COMMAND" in
  deploy)
    if [[ -z "$AMBIENTE" ]]; then
      log_error "Informe o ambiente: staging ou prod"
      usage
      exit 1
    fi
    deploy "$AMBIENTE" "$TAG"
    ;;
  rollback)
    rollback
    ;;
  status)
    status
    ;;
  health)
    health_check "${AMBIENTE:-local}"
    ;;
  help|--help|-h)
    usage
    ;;
  *)
    log_error "Comando desconhecido: $COMMAND"
    usage
    exit 1
    ;;
esac
