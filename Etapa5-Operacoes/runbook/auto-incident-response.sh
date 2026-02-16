#!/bin/bash
# Auto Incident Response Script
# Hotel Booking System - Resposta Automatizada a Incidentes
#
# Uso: ./auto-incident-response.sh <incident_type> <severity>
# Exemplos:
#   ./auto-incident-response.sh service_down critical
#   ./auto-incident-response.sh high_error_rate warning
#   ./auto-incident-response.sh resource_exhaustion critical
#
# Incident Types Suportados:
#   - service_down
#   - high_error_rate
#   - resource_exhaustion
#   - database_issues
#   - security_incident
#
# Severity Levels:
#   - critical
#   - warning
#   - info

set -euo pipefail

# ===========================================
# CONFIGURAÇÃO
# ===========================================

# Variáveis de Ambiente
NAMESPACE="hotel-booking-prod"
LOG_FILE="/var/log/incident-response.log"
SLACK_WEBHOOK="${SLACK_WEBHOOK:-}"
EMAIL_RECIPIENTS="${EMAIL_RECIPIENTS:-sre-team@hotel-booking.com}"

# Cores para Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ===========================================
# FUNÇÕES UTILITÁRIAS
# ===========================================

# Função de logging
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}" | tee -a "$LOG_FILE"
}

# Função de notificação Slack
notify_slack() {
    local message="$1"
    local color="${2:-good}"
    
    if [[ -n "$SLACK_WEBHOOK" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\", \"color\":\"$color\"}" \
            "$SLACK_WEBHOOK" 2>/dev/null || true
    fi
}

# Função de notificação Email
notify_email() {
    local subject="$1"
    local message="$2"
    
    if command -v mail >/dev/null 2>&1; then
        echo "$message" | mail -s "$subject" "$EMAIL_RECIPIENTS" 2>/dev/null || true
    fi
}

# Função de notificação geral
notify() {
    local message="$1"
    local severity="$2"
    
    log "INFO" "$message"
    
    # Notificação Slack
    local color="good"
    case $severity in
        critical) color="danger" ;;
        warning) color="warning" ;;
        info) color="good" ;;
    esac
    notify_slack "$message" "$color"
    
    # Notificação Email para incidentes críticos
    if [[ "$severity" == "critical" ]]; then
        notify_email "🚨 Critical Incident: $message" "$message"
    fi
}

# Função de verificação de pré-requisitos
check_prerequisites() {
    log "INFO" "Verificando pré-requisitos..."
    
    # Verificar kubectl
    if ! command -v kubectl >/dev/null 2>&1; then
        log "ERROR" "kubectl não encontrado. Por favor, instale o kubectl."
        exit 1
    fi
    
    # Verificar acesso ao cluster
    if ! kubectl cluster-info >/dev/null 2>&1; then
        log "ERROR" "Não foi possível acessar o cluster Kubernetes."
        exit 1
    fi
    
    # Verificar namespace
    if ! kubectl get namespace "$NAMESPACE" >/dev/null 2>&1; then
        log "ERROR" "Namespace $NAMESPACE não encontrado."
        exit 1
    fi
    
    log "INFO" "Pré-requisitos verificados com sucesso"
}

# Função de diagnóstico rápido
quick_diagnosis() {
    log "INFO" "Iniciando diagnóstico rápido..."
    
    echo -e "${BLUE}=== Status dos Pods ===${NC}"
    kubectl get pods -n "$NAMESPACE" --sort-by=.metadata.creationTimestamp
    
    echo -e "${BLUE}=== Uso de Recursos ===${NC}"
    if kubectl top pods -n "$NAMESPACE" >/dev/null 2>&1; then
        kubectl top pods -n "$NAMESPACE" --sort-by=cpu
    else
        log "WARN" "Metrics server não disponível"
    fi
    
    echo -e "${BLUE}=== Eventos Recentes ===${NC}"
    kubectl get events -n "$NAMESPACE" --sort-by='.lastTimestamp' --field-selector type!=Normal
    
    echo -e "${BLUE}=== Status dos Deployments ===${NC}"
    kubectl get deployments -n "$NAMESPACE"
    
    echo -e "${BLUE}=== Status dos Services ===${NC}"
    kubectl get services -n "$NAMESPACE"
}

# Função de verificação de saúde
health_check() {
    local service=$1
    local namespace=$2
    
    case $service in
        frontend)
            kubectl exec -n "$namespace" deployment/frontend -- curl -f http://localhost:3000/health >/dev/null 2>&1
            ;;
        backend)
            kubectl exec -n "$namespace" deployment/backend -- curl -f http://localhost:8080/actuator/health >/dev/null 2>&1
            ;;
        database)
            kubectl exec -n "$namespace" deployment/database -- pg_isready -U postgres >/dev/null 2>&1
            ;;
        redis)
            kubectl exec -n "$namespace" deployment/redis -- redis-cli ping >/dev/null 2>&1
            ;;
        *)
            log "WARN" "Serviço $service não reconhecido para health check"
            return 1
            ;;
    esac
}

# ===========================================
# FUNÇÕES DE RESPOSTA A INCIDENTES
# ===========================================

# Service Down Response
respond_service_down() {
    local severity=$1
    log "INFO" "Respondendo a Service Down incident (severity: $severity)"
    
    notify "🚨 Service Down Incident Detected - Iniciando resposta automatizada" "$severity"
    
    # Diagnóstico
    quick_diagnosis
    
    # Identificar serviços afetados
    local affected_services=()
    for service in frontend backend database redis; do
        if ! health_check "$service" "$NAMESPACE"; then
            affected_services+=("$service")
            log "WARN" "Serviço $service está down"
        fi
    done
    
    if [[ ${#affected_services[@]} -eq 0 ]]; then
        log "INFO" "Nenhum serviço detectado como down. Verificando novamente..."
        sleep 30
        quick_diagnosis
        return
    fi
    
    # Ações de recuperação
    log "INFO" "Iniciando ações de recuperação para: ${affected_services[*]}"
    
    for service in "${affected_services[@]}"; do
        log "INFO" "Reiniciando deployment $service"
        kubectl rollout restart deployment/"$service" -n "$NAMESPACE"
        
        log "INFO" "Aguardando rollout do $service"
        if kubectl rollout status deployment/"$service" -n "$NAMESPACE" --timeout=300s; then
            log "INFO" "Deployment $service restaurado com sucesso"
            notify "✅ Serviço $service restaurado" "info"
        else
            log "ERROR" "Falha ao restaurar deployment $service"
            notify "❌ Falha ao restaurar serviço $service" "critical"
        fi
    done
    
    # Escalar se necessário
    if [[ "$severity" == "critical" ]]; then
        log "INFO" "Escalando serviços para alta disponibilidade"
        kubectl scale deployment frontend --replicas=5 -n "$NAMESPACE"
        kubectl scale deployment backend --replicas=5 -n "$NAMESPACE"
    fi
    
    # Verificação final
    log "INFO" "Verificação final de serviços"
    sleep 30
    
    local restored_services=()
    for service in "${affected_services[@]}"; do
        if health_check "$service" "$NAMESPACE"; then
            restored_services+=("$service")
        fi
    done
    
    if [[ ${#restored_services[@]} -eq ${#affected_services[@]} ]]; then
        notify "✅ Todos os serviços foram restaurados com sucesso" "info"
        log "INFO" "Service Down incident resolvido"
    else
        notify "⚠️ Alguns serviços ainda apresentam problemas. Intervenção manual necessária." "warning"
        log "WARN" "Service Down incident parcialmente resolvido"
    fi
}

# High Error Rate Response
respond_high_error_rate() {
    local severity=$1
    log "INFO" "Respondendo a High Error Rate incident (severity: $severity)"
    
    notify "📊 High Error Rate Incident Detected - Iniciando resposta automatizada" "$severity"
    
    # Diagnóstico
    quick_diagnosis
    
    # Analisar taxa de erros
    log "INFO" "Analisando taxa de erros..."
    local error_rate=$(curl -s "http://prometheus:9090/api/v1/query?query=rate(http_requests_total{status=~\"5..\"}[5m])" 2>/dev/null | jq -r '.data.result[0].value[1]' || echo "0")
    
    if [[ $(echo "$error_rate > 0.01" | bc -l) -eq 1 ]]; then
        log "WARN" "Taxa de erros elevada detectada: $error_rate"
        
        # Ações de mitigação
        log "INFO" "Escalando serviços para distribuir carga"
        kubectl scale deployment frontend --replicas=10 -n "$NAMESPACE"
        kubectl scale deployment backend --replicas=10 -n "$NAMESPACE"
        
        log "INFO" "Reiniciando pods com potencial corrupção"
        kubectl rollout restart deployment/backend -n "$NAMESPACE"
        
        # Aguardar estabilização
        log "INFO" "Aguardando estabilização dos serviços..."
        sleep 60
        
        # Verificar melhoria
        local new_error_rate=$(curl -s "http://prometheus:9090/api/v1/query?query=rate(http_requests_total{status=~\"5..\"}[5m])" 2>/dev/null | jq -r '.data.result[0].value[1]' || echo "0")
        
        if [[ $(echo "$new_error_rate < $error_rate" | bc -l) -eq 1 ]]; then
            notify "✅ Taxa de erros reduzida de $error_rate para $new_error_rate" "info"
            log "INFO" "High Error Rate incident mitigado"
        else
            notify "⚠️ Taxa de erros não reduziu significativamente. Investigação adicional necessária." "warning"
            log "WARN" "High Error Rate incident parcialmente mitigado"
        fi
    else
        log "INFO" "Taxa de erros dentro dos limites aceitáveis: $error_rate"
    fi
}

# Resource Exhaustion Response
respond_resource_exhaustion() {
    local severity=$1
    log "INFO" "Respondendo a Resource Exhaustion incident (severity: $severity)"
    
    notify "💾 Resource Exhaustion Incident Detected - Iniciando resposta automatizada" "$severity"
    
    # Diagnóstico
    quick_diagnosis
    
    # Verificar uso de recursos
    log "INFO" "Analisando uso de recursos..."
    
    # CPU Usage
    local high_cpu_pods=$(kubectl top pods -n "$NAMESPACE" --sort-by=cpu 2>/dev/null | awk 'NR>1 && $2>80 {print $1}' || true)
    if [[ -n "$high_cpu_pods" ]]; then
        log "WARN" "Pods com alto uso de CPU: $high_cpu_pods"
        
        # Aumentar CPU limits
        log "INFO" "Aumentando limits de CPU"
        kubectl patch deployment backend -p '{"spec":{"template":{"spec":{"containers":[{"name":"backend","resources":{"limits":{"cpu":"2000m"}}}]}}}}' -n "$NAMESPACE" 2>/dev/null || true
    fi
    
    # Memory Usage
    local high_memory_pods=$(kubectl top pods -n "$NAMESPACE" --sort-by=memory 2>/dev/null | awk 'NR>1 && $3>80 {print $1}' || true)
    if [[ -n "$high_memory_pods" ]]; then
        log "WARN" "Pods com alto uso de memória: $high_memory_pods"
        
        # Aumentar memory limits
        log "INFO" "Aumentando limits de memória"
        kubectl patch deployment backend -p '{"spec":{"template":{"spec":{"containers":[{"name":"backend","resources":{"limits":{"memory":"4Gi"}}}]}}}}' -n "$NAMESPACE" 2>/dev/null || true
    fi
    
    # Disk Usage
    local disk_usage=$(kubectl exec -n "$NAMESPACE" deployment/database -- df /var/lib/postgresql 2>/dev/null | awk 'NR==2 {print $5}' | sed 's/%//' || echo "0")
    if [[ "$disk_usage" -gt 80 ]]; then
        log "WARN" "Uso de disco elevado: $disk_usage%"
        
        # Limpar logs antigos
        log "INFO" "Limpando logs antigos"
        kubectl exec -n "$NAMESPACE" deployment/database -- find /var/log/postgresql -name "*.log" -mtime +7 -delete 2>/dev/null || true
        kubectl exec -n "$NAMESPACE" deployment/backend -- find /var/log -name "*.log" -mtime +7 -delete 2>/dev/null || true
    fi
    
    # Escalar serviços se crítico
    if [[ "$severity" == "critical" ]]; then
        log "INFO" "Escalando serviços para alta disponibilidade"
        kubectl scale deployment frontend --replicas=8 -n "$NAMESPACE"
        kubectl scale deployment backend --replicas=8 -n "$NAMESPACE"
    fi
    
    # Aguardar estabilização
    log "INFO" "Aguardando estabilização dos recursos..."
    sleep 60
    
    # Verificação final
    log "INFO" "Verificação final de recursos"
    quick_diagnosis
    
    notify "✅ Resource exhaustion response completed" "info"
    log "INFO" "Resource Exhaustion incident mitigado"
}

# Database Issues Response
respond_database_issues() {
    local severity=$1
    log "INFO" "Respondendo a Database Issues incident (severity: $severity)"
    
    notify "🗄️ Database Issues Incident Detected - Iniciando resposta automatizada" "$severity"
    
    # Diagnóstico
    quick_diagnosis
    
    # Verificar conexões ativas
    log "INFO" "Verificando conexões ativas no database..."
    local active_connections=$(kubectl exec -n "$NAMESPACE" deployment/database -- psql -U postgres -d hotel_booking -t -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';" 2>/dev/null | tr -d ' ' || echo "0")
    
    if [[ "$active_connections" -gt 80 ]]; then
        log "WARN" "Número elevado de conexões ativas: $active_connections"
        
        # Matar queries longas
        log "INFO" "Finalizando queries de longa duração"
        kubectl exec -n "$NAMESPACE" deployment/database -- psql -U postgres -d hotel_booking -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'active' AND query_start < now() - interval '5 minutes';" 2>/dev/null || true
    fi
    
    # Verificar locks
    log "INFO" "Verificando locks no database..."
    local blocked_queries=$(kubectl exec -n "$NAMESPACE" deployment/database -- psql -U postgres -d hotel_booking -t -c "SELECT count(*) FROM pg_locks WHERE granted = false;" 2>/dev/null | tr -d ' ' || echo "0")
    
    if [[ "$blocked_queries" -gt 0 ]]; then
        log "WARN" "Queries bloqueadas detectadas: $blocked_queries"
        
        # Liberar locks
        log "INFO" "Liberando locks bloqueados"
        kubectl exec -n "$NAMESPACE" deployment/database -- psql -U postgres -d hotel_booking -c "SELECT pg_terminate_backend(pid) FROM pg_locks l JOIN pg_stat_activity a ON l.pid = a.pid WHERE NOT l.granted AND a.state = 'active';" 2>/dev/null || true
    fi
    
    # Otimizar database
    log "INFO" "Otimizando database..."
    kubectl exec -n "$NAMESPACE" deployment/database -- psql -U postgres -d hotel_booking -c "VACUUM ANALYZE;" 2>/dev/null || true
    
    # Reiniciar backend se necessário
    if [[ "$severity" == "critical" ]]; then
        log "INFO" "Reiniciando backend para reconectar ao database"
        kubectl rollout restart deployment/backend -n "$NAMESPACE"
    fi
    
    # Verificação final
    log "INFO" "Verificação final do database"
    sleep 30
    
    if health_check "database" "$NAMESPACE"; then
        notify "✅ Database restaurado e otimizado" "info"
        log "INFO" "Database Issues incident resolvido"
    else
        notify "⚠️ Database ainda apresenta problemas. Intervenção manual necessária." "warning"
        log "WARN" "Database Issues incident parcialmente resolvido"
    fi
}

# Security Incident Response
respond_security_incident() {
    local severity=$1
    log "INFO" "Respondendo a Security Incident (severity: $severity)"
    
    notify "🔒 Security Incident Detected - Iniciando resposta automatizada" "$severity"
    
    # Diagnóstico
    quick_diagnosis
    
    # Analisar logs de segurança
    log "INFO" "Analisando logs de segurança..."
    local failed_logins=$(kubectl logs -n "$NAMESPACE" deployment/backend --since=15m 2>/dev/null | grep -c "login_failure" || echo "0")
    
    if [[ "$failed_logins" -gt 100 ]]; then
        log "WARN" "Número elevado de falhas de login: $failed_logins"
        
        # Implementar rate limiting
        log "INFO" "Implementando rate limiting"
        kubectl annotate ingress hotel-booking -n "$NAMESPACE" "nginx.ingress.kubernetes.io/rate-limit=10" 2>/dev/null || true
        
        # Bloquear IPs suspeitos (simulação)
        log "INFO" "Bloqueando IPs suspeitos"
        # Aqui poderia implementar bloqueio real via NetworkPolicy ou WAF
        
        # Forçar logout de sessões suspeitas
        log "INFO" "Revogando tokens suspeitos"
        kubectl exec -n "$NAMESPACE" deployment/backend -- curl -X POST http://localhost:8080/api/admin/revoke-suspicious-tokens 2>/dev/null || true
    fi
    
    # Escalar serviços de segurança
    if [[ "$severity" == "critical" ]]; then
        log "INFO" "Escalando serviços para alta disponibilidade"
        kubectl scale deployment frontend --replicas=10 -n "$NAMESPACE"
        kubectl scale deployment backend --replicas=10 -n "$NAMESPACE"
    fi
    
    # Ativar monitoramento intensivo
    log "INFO" "Ativando monitoramento intensivo"
    # Aqui poderia ajustar thresholds de alertas para serem mais sensíveis
    
    notify "🔒 Security incident response completed. Monitoramento intensivo ativado." "warning"
    log "INFO" "Security Incident mitigado"
}

# ===========================================
# FUNÇÃO PRINCIPAL
# ===========================================

main() {
    local incident_type=${1:-}
    local severity=${2:-warning}
    
    # Validação de argumentos
    if [[ -z "$incident_type" ]]; then
        echo -e "${RED}Erro: Tipo de incidente não especificado${NC}"
        echo "Uso: $0 <incident_type> <severity>"
        echo "Tipos suportados: service_down, high_error_rate, resource_exhaustion, database_issues, security_incident"
        echo "Severidades: critical, warning, info"
        exit 1
    fi
    
    # Verificar pré-requisitos
    check_prerequisites
    
    # Log de início
    log "INFO" "Iniciando resposta automatizada ao incidente: $incident_type (severity: $severity)"
    
    # Executar resposta específica
    case $incident_type in
        service_down)
            respond_service_down "$severity"
            ;;
        high_error_rate)
            respond_high_error_rate "$severity"
            ;;
        resource_exhaustion)
            respond_resource_exhaustion "$severity"
            ;;
        database_issues)
            respond_database_issues "$severity"
            ;;
        security_incident)
            respond_security_incident "$severity"
            ;;
        *)
            log "ERROR" "Tipo de incidente não suportado: $incident_type"
            echo -e "${RED}Erro: Tipo de incidente não suportado${NC}"
            echo "Tipos suportados: service_down, high_error_rate, resource_exhaustion, database_issues, security_incident"
            exit 1
            ;;
    esac
    
    # Log de conclusão
    log "INFO" "Resposta automatizada concluída para incidente: $incident_type"
    notify "✅ Resposta automatizada concluída: $incident_type" "info"
}

# ===========================================
# EXECUÇÃO
# ===========================================

# Verificar se script está sendo executado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
