## Etapa 5: Operações (Infraestrutura, DevOps e SRE)

# PRIMEIRO Prompt Utilizado - Contexto Unificado (motivo: limite de tokens do Qodo):

> Agora, para a etapa 5 de operações, defina:
> 1. Plano de implantação
> * Proponha um pipeline de deploy para o sistema em questão (ex.: Docker + CI/CD).
> 2. Monitoramento
> * Defina métricas e logs a serem monitorados (disponibilidade, latência, erros).
> 3. Gestão de incidentes
> * Descreva um procedimento de resposta a falhas (runbook).

---

# PRIMEIRO Output:

# Plano de implantação (Stack 1: Node.js + TypeScript + React)

## Objetivo
- Padronizar build e execução com Docker
- Automatizar testes e deploy com CI/CD
- Segregar ambientes (dev, homolog, prod)
- Garantir versionamento e rollback simples

## Arquitetura de deploy
- Backend (API Node + TS)
  - Container Node 20 Alpine
  - Build por estágios (builder + runtime)
  - Variáveis de ambiente via secrets (CI ou gerenciador de segredos)
  - Exposição HTTP (por exemplo, porta 3000) atrás de um proxy (NGINX/Ingress)
- Frontend (React)
  - Build estático (Vite/CRA) servido via NGINX
  - Cache busting por hash de arquivos estáticos
- Banco de dados (quando adotado)
  - Serviço gerenciado (RDS/CloudSQL) ou container com volume persistente
  - Migrações via ferramenta (Prisma/TypeORM) no job de release

## Pipeline CI/CD proposto (GitHub Actions ou GitLab CI)
- Gatilhos
  - Pull Request (feature branches): lint + testes + build
  - main: build + testes + gerar imagem Docker + push em container registry + deploy staging
  - tag semântica (vX.Y.Z): promover para produção

## Etapas do pipeline
1) Checkout + Setup
  - Setup Node 20, cache de dependências
2) Lint e testes
  - Backend: npm ci && npm run build && npm test (incluindo Etapa4 de testes)
  - Frontend: npm ci && npm run build && npm test (se aplicável)
  - Cobertura mínima (falhar abaixo do threshold)
3) Build de imagens Docker
  - backend: Dockerfile multi-stage → imagem “app-backend:X.Y.Z”
  - frontend: Dockerfile multi-stage (build node → runtime nginx) → imagem “app-frontend:X.Y.Z”
4) Push para registry
  - ghcr.io, Docker Hub ou registry interno, com tags:
    - última tag (vX.Y.Z)
    - latest para o branch principal
    - sha do commit (para trazabilidade)
5) Deploy automático em Staging
  - Kubernetes (manifests/Helm/Kustomize):
    - Aplicar Deployment, Service, Ingress
    - Injetar secrets via Secret/ConfigMap
    - Estratégia RollingUpdate
  - Alternativa simples: Docker Compose em VM de staging
6) Testes pós-deploy (smoke)
  - Verificação de readiness endpoint (health)
  - Execução de uma suíte mínima de integração
7) Aprovação manual para Produção
  - Gate manual
  - Promote: atualizar imagens em Produção (mesmos manifests, tag nova)
8) Rollback
  - Se falhar health check ou aumentar erro > SLO, reverter para a tag anterior (helm rollback ou reaplicar manifest com imagem anterior)

## Detalhes técnicos de Docker (exemplos)
- Backend Dockerfile (multi-stage)
  - Stage builder: node:20-alpine → npm ci → npm run build
  - Stage runtime: node:20-alpine → copiar dist → npm ci --omit=dev → node dist/index.js
- Frontend Dockerfile (multi-stage)
  - Stage builder: node:20-alpine → npm ci → npm run build
  - Stage runtime: nginx:alpine → copiar build para /usr/share/nginx/html

## Configuração de ambiente
- Variáveis (via secrets/ConfigMap):
  - NODE_ENV, PORT
  - DATABASE_URL, JWT_SECRET, LOG_LEVEL
  - ORIGIN/ALLOWED_HOSTS
- Health/readiness endpoints na API (ex: GET /health, /ready) para probes do Kubernetes/NGINX

---

# Monitoramento

## Métricas (APM e infraestrutura)
- Disponibilidade:
  - Uptime do serviço (SLO: >= 99.9% prod)
  - Taxa de sucesso de health checks
- Latência:
  - P95/P99 do tempo de resposta por endpoint
  - Tempo médio do loop de event loop (Node) e GC pauses (se possível via APM)
- Taxa de erros:
  - HTTP 5xx por endpoint/minuto
  - Exceções não tratadas (uncaughtException/unhandledRejection)
- Throughput:
  - RPS (requests por segundo)
  - Consumo de CPU/memória por pod/container
- Banco (se aplicável):
  - Tempo médio de query
  - Conexões ativas, erros de timeout
- Logs de negócio:
  - Eventos de criação/edição de quarto, cadastro de hóspede, criação/cancelamento de reserva
  - Mudanças de disponibilidade do quarto

## Logs (padrões)
- Estruturar logs em JSON, incluindo:
  - timestamp, level, service, correlationId/traceId, endpoint, userId (quando autenticado)
  - Mensagem curta + campos adicionais (ex: quartoId, hospedeId, reservaId)
- Níveis:
  - debug: para dev/staging
  - info: operações normais (start/stop, rotas críticas, criação/edição)
  - warn: degradações/retries
  - error: exceções e falhas de rede/DB
- Coleta:
  - stdout → sidecar/daemon (Fluent Bit/Vector) → stack ELK/Opensearch ou Cloud Logging
- Tracing distribuído (opcional, recomendado):
  - OpenTelemetry SDK no Node + Collector → Jaeger/Tempo/Cloud Trace

## Alertas
- Erros 5xx acima de N/minuto (ajustar por baseline)
- Latência P95 acima de threshold por 5 minutos
- Uptime abaixo de SLO em janela de 30 minutos
- Falhas de deploy (readiness falhando por > X minutos)
- Banco com tempo de query médio acima do limiar
- Exceções não tratadas detectadas

## Dashboards
- API Endpoint Performance: RPS, P95/P99, 5xx por rota
- Infra: CPU/Memória por pod, restarts, uso de disco
- Negócio: Reservas/dia, taxa de ocupação (se disponível)

---

# Gestão de incidentes (runbook)

## Objetivo
- Reduzir MTTR, padronizar resposta e comunicação

Severidade (SLA sugerido)
- SEV1: indisponibilidade total, 5xx generalizado, dados corrompidos – resolução < 1h
- SEV2: degradação grave (latência/erros parciais) – resolução < 4h
- SEV3: impacto moderado (funcionalidades específicas) – resolução < 1 dia
- SEV4: impacto baixo/observações – resolução em sprint

## Detecção
- Alertas de monitoramento (erros, latência, uptime)
- Relato do usuário/suporte
- Falhas de pipeline (deploy)

## Ação imediata
1) Classificar severidade
2) Montar ponte de war room (chat/meet)
3) Designar Incident Commander (IC) e roles:
   - IC (coordenação)
   - Comms (comunicação stakeholders)
   - SRE/DevOnCall (diagnóstico/mitigação)
   - App Owner (contexto do domínio)

## Diagnóstico rápido
- Conferir status dos pods/containers (Kubernetes: describe/get logs)
- Verificar erros 5xx, exceptions recentes, mudanças de latência
- Checar alteração recente (último deploy/tag) e flag configs
- Confirmar estado de dependências (DB, cache, serviços externos)

## Mitigação
- Rollback para versão anterior (helm rollback ou reapply manifest com tag anterior)
- Escalar horizontalmente (réplicas) se saturação
- Ativar feature flags conservadoras
- Limitar tráfego (rate limit) se necessário
- Reconfigurar timeouts/retries para aliviar cascatas

## Análise de causa raiz (RCA)
- Coletar logs/traces relevantes (com correlationId)
- Revisar diff entre versões, mudanças infra, comportamento DB
- Reproduzir em staging se possível
- Identificar falha (ex: regressão em caso de uso, memory leak, timeouts, índice DB faltando)

## Recuperação
- Deploy de fix com canary/rolling update
- Verificar restauração de métricas (latência/erros/uptime)
- Remover mitigação temporária (rate limit, flags)

## Comunicação
- Status updates periódicos (IC/Comms): impacto, progresso, ETA
- Postmortem público-interno:
  - Timeline, impacto, causa, ações corretivas, aprendizados
  - Itens de follow-up com responsáveis e prazos

## Prevenção
- Adicionar testes (unit/integration/e2e) conforme falha detectada
- Aumentar observabilidade (métricas/filtros de log/trace)
- Hardening de timeouts/retries/circuit breakers
- Índices e otimizações de query (quando aplicável)
- Reforçar gates de qualidade no pipeline (coverage/linters/scan)

## Procedimentos operacionais úteis
- Health checks:
  - GET /health: dependências básicas (ex: disponibilidade de processo)
  - GET /ready: dependências críticas (DB/connectividade) para readiness probe
- Backups (DB):
  - Rotina diária + testes de restauração mensais
- Gestão de segredos:
  - Nunca em repositório; usar Secret Manager/Vault/K8s Secret
- Segurança pipeline:
  - Assinatura de imagens (cosign), varredura SCA (Dependabot/Snyk), varredura de imagens

## Resumo prático
- Use CI/CD com build multi-stage e images imutáveis por versão.
- Implante em staging automaticamente para validar e promova para produção com aprovação manual.
- Monitore disponibilidade, latência e erros com thresholds e alertas bem definidos.
- Tenha um runbook com papéis claros, rollback imediato e RCA documentado.

---

# SEGUNDO Prompt Utilizado:
> Agora, você pode criar esses arquivos, definidos no seus planos para essa etapa 5?
> *(Nota: O prompt exigia a criação do Plano de Implantação, Monitoramento e Gestão de Incidentes de forma isolada na pasta Etapa5-Operacoes).*

# Resultados Gerados:

## Análise de Comportamento e Execução da Ferramenta:
A ferramenta apresentou um comportamento de **sobre-entrega (over-delivery) proativa**. Em vez de limitar-se a redigir documentos descritivos em Markdown conforme induzido pelas etapas anteriores, o Agente atuou diretamente na camada de *Infrastructure as Code* (IaC). 
Ele não apenas descreveu o que deveria ser feito, mas gerou os scripts reais de automação e orquestração de contêineres, mantendo o respeito absoluto à regra de isolamento de diretórios (todos os artefatos foram contidos na nova pasta `Etapa5-Operacoes`).

## Artefatos Gerados na Etapa 5:

### 1. Plano de Implantação (Deploy & CI/CD)
O Qodo substituiu um simples documento de texto por uma estrutura completa de automação:
* **Conteinerização:** Criação de `backend.Dockerfile` e `frontend.Dockerfile` utilizando *multi-stage builds* (Node 20 Alpine) otimizados para produção.
* **Orquestração Local:** Geração de um `docker-compose.yml` para simulação do ambiente de *staging*.
* **Orquestração em Nuvem:** Manifestos do Kubernetes (`backend-deployment.yaml` e `frontend-deployment.yaml`) incluindo configuração de *Services*, *Ingress* e sondas de saúde (*Liveness/Readiness probes*).
* **Pipeline CI/CD:** Arquivo `github-actions-backend.yml` contendo os *jobs* de execução dos testes unitários da Etapa 4, build da imagem Docker e push para o GitHub Container Registry (GHCR).

### 2. Monitoramento e Observabilidade (`metrics-logs-alerts.md`)
O agente documentou as diretrizes essenciais de telemetria, definindo a adoção de logs estruturados (JSON) e sugerindo métricas-chave para *dashboards* e *tracing* distribuído, abrangendo disponibilidade, latência e taxa de erros.

### 3. Gestão de Incidentes (`runbook.md`)
Foi gerado um *Runbook* estruturado contendo o ciclo de vida completo de resposta a falhas. O documento detalha matriz de severidades, passos para detecção, diagnóstico, ações de mitigação rápida, procedimentos de RCA (Root Cause Analysis) e políticas de comunicação em momentos de crise.

### Conclusão da Avaliação (Etapa 5)
O Qodo provou ser excepcionalmente útil para a etapa de Operações. A capacidade de gerar a infraestrutura base como código a partir de diretrizes gerais de projeto acelera massivamente a configuração de *pipelines* e a padronização de ambientes de *deploy*, reduzindo o esforço manual do desenvolvedor nessa transição de Dev para Ops.
Ele precisou de dois prompts para gerar os arquivos necessários. De início, gerou apenas o contexto e planejamento dos arquivos, o que pode ser considerado uma alucinação/falta de intepretação diante do input. Depois, reforcei, com um segundo prompt, a necessidade da criação dos arquivos de acordo com o planejamento que ele fez inicialmente.