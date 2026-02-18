# Runbook - Gestão de Incidentes

Objetivo: reduzir MTTR, padronizar resposta e comunicação.

Severidades
- SEV1: indisponibilidade total/5xx generalizado, dados corrompidos (resolução < 1h)
- SEV2: degradação grave (latência/erros parciais) (resolução < 4h)
- SEV3: impacto moderado (funcionalidade específica) (resolução < 1 dia)
- SEV4: impacto baixo/observações (resolução em sprint)

Detecção
- Alertas de monitoramento (erros, latência, uptime)
- Relatos de suporte/usuários
- Falhas de pipeline (deploy)

Ação imediata
1) Classificar severidade
2) Abrir war room (chat/meet)
3) Designar papéis
   - Incident Commander (IC)
   - Comms (comunicação stakeholders)
   - SRE/DevOnCall (diagnóstico/mitigação)
   - App Owner (contexto do domínio)

Diagnóstico
- Verificar pods/containers (kubectl get/describe), logs recentes
- Checar 5xx, latência, alterações recentes (deploy/tag/config)
- Dependências (DB/cache/external) status

Mitigação
- Rollback (helm rollback ou reaplicar manifest com imagem anterior)
- Escalonar réplicas se saturação
- Ativar feature flags conservadoras
- Rate limit/circuit breaker se necessário
- Ajustar timeouts/retries

RCA (Root Cause Analysis)
- Coletar logs/traces com correlationId
- Revisar diffs entre versões e mudanças infra
- Reproduzir em staging se possível
- Identificar causa: regressão, leak, timeout, índice DB ausente, etc.

Recuperação
- Deploy de fix com canary/rolling update
- Validar restauração das métricas (latência/erros/uptime)
- Remover mitigação temporária

Comunicação
- Atualizações periódicas: impacto, progresso, ETA
- Postmortem: timeline, impacto, causa, ações corretivas, aprendizados; responsáveis e prazos

Prevenção
- Adicionar testes (unit/integration/e2e) referentes à falha
- Melhorar observabilidade (métricas/filtros/trace)
- Hardening de timeouts/retries/circuit breakers
- Otimizações de queries/índices (quando aplicável)
- Gates de qualidade no pipeline (coverage/linters/scan)

Playbooks rápidos
- API retornando 5xx:
  - Checar logs do backend e readiness; rollback imediato se regressão nova
- Latência elevada:
  - Verificar saturação (CPU/Mem), aumento de tráfego, endpoints específicos; escalar réplicas
- DB com erro de conexão:
  - Conferir alocação/limites, timeouts e saúde do provedor; ativar degradação controlada
