# 🚨 RUNBOOK - Procedimentos de Resposta a Falhas

## 📋 Índice Rápido
- [1. ApplicationDown](#1-applicationdown)
- [2. DatabaseDown](#2-databasedown)
- [3. HighLatency / CriticalLatency](#3-highlatency--criticallatency)
- [4. HighErrorRate / CriticalErrorRate](#4-higherrorrate--criticalerrorrate)
- [5. HighServerErrors](#5-highservererrors)
- [6. HighMemoryUsage](#6-highmemoryusage)
- [7. Rollback de Deploy](#7-rollback-de-deploy)
- [8. Contatos de Emergência](#8-contatos-de-emergência)

---

## 1. ApplicationDown

**🔴 Severidade: CRITICAL**  
**⏱️ Tempo de Resposta: Imediato**

### Sintomas
- Backend não responde em `/health`
- Alerta: `ApplicationDown` disparado após 1min

### Diagnóstico

```bash
# 1. Verificar status do container
docker ps | grep hotel-backend

# 2. Verificar logs recentes
docker logs hotel-backend --tail 100

# 3. Verificar saúde das dependências
curl http://localhost:3000/health
```

### Resolução

**Opção A: Restart Rápido**
```bash
docker restart hotel-backend
# Aguardar 30s e verificar
curl http://localhost:3000/health
```

**Opção B: Rebuild (se restart falhar)**
```bash
docker-compose down backend
docker-compose up -d backend
```

**Opção C: Rollback (se problema persistir)**
```bash
# Ver seção 7 - Rollback de Deploy
git checkout <commit-anterior>
docker-compose up -d --build backend
```

### Verificação
```bash
# Confirmar que voltou
curl http://localhost:3000/health
# Verificar métricas
curl http://localhost:3000/metrics | grep app_uptime
```

### Escalação
- Se não resolver em 5min → Chamar Tech Lead
- Se não resolver em 15min → Chamar CTO

---

## 2. DatabaseDown

**🔴 Severidade: CRITICAL**  
**⏱️ Tempo de Resposta: Imediato**

### Sintomas
- Erros de conexão ao PostgreSQL
- Alerta: `DatabaseDown` disparado após 1min

### Diagnóstico

```bash
# 1. Verificar container PostgreSQL
docker ps | grep hotel-postgres

# 2. Verificar logs
docker logs hotel-postgres --tail 50

# 3. Testar conexão
docker exec hotel-postgres pg_isready -U hotel_user
```

### Resolução

**Opção A: Restart PostgreSQL**
```bash
docker restart hotel-postgres
# Aguardar 10s
docker exec hotel-postgres pg_isready -U hotel_user
```

**Opção B: Verificar Espaço em Disco**
```bash
df -h
# Se disco cheio (>90%), limpar logs antigos
docker system prune -a
```

**Opção C: Restaurar de Backup**
```bash
# Parar aplicação
docker-compose down backend

# Restaurar backup
docker exec -i hotel-postgres psql -U hotel_user hotel_reservation < backup.sql

# Reiniciar
docker-compose up -d
```

### Verificação
```bash
# Testar query simples
docker exec hotel-postgres psql -U hotel_user -d hotel_reservation -c "SELECT 1;"

# Verificar conexões ativas
docker exec hotel-postgres psql -U hotel_user -d hotel_reservation -c "SELECT count(*) FROM pg_stat_activity;"
```

### Prevenção
- Backup automático diário às 3h
- Monitorar espaço em disco
- Limite de conexões: 100

---

## 3. HighLatency / CriticalLatency

**🟡 Severidade: WARNING → 🔴 CRITICAL**  
**⏱️ Tempo de Resposta: 5-10min**

### Sintomas
- P95 > 1s (Warning) ou > 5s (Critical)
- Usuários reportam lentidão

### Diagnóstico

```bash
# 1. Identificar endpoints lentos
curl http://localhost:3000/metrics | grep http_request_duration_seconds

# 2. Verificar queries lentas no PostgreSQL
docker exec hotel-postgres psql -U hotel_user -d hotel_reservation -c "
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;"

# 3. Verificar cache Redis
docker exec hotel-redis redis-cli INFO stats
```

### Resolução

**Opção A: Limpar Cache (se cache corrompido)**
```bash
docker exec hotel-redis redis-cli FLUSHDB
```

**Opção B: Otimizar Queries**
```sql
-- Adicionar índices faltantes
CREATE INDEX idx_reservas_data ON reservas(data_checkin, data_checkout);
CREATE INDEX idx_quartos_status ON quartos(status);
```

**Opção C: Escalar Recursos**
```bash
# Aumentar memória do container
docker-compose down backend
# Editar docker-compose.yml: adicionar memory: 2g
docker-compose up -d backend
```

### Verificação
```promql
# Prometheus: Verificar P95 voltou ao normal
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) < 1
```

---

## 4. HighErrorRate / CriticalErrorRate

**🟡 Severidade: WARNING → 🔴 CRITICAL**  
**⏱️ Tempo de Resposta: 5-10min**

### Sintomas
- Taxa de erro > 5% (Warning) ou > 10% (Critical)
- Múltiplos erros 4xx ou 5xx

### Diagnóstico

```bash
# 1. Identificar tipos de erro
docker logs hotel-backend --tail 200 | grep ERROR

# 2. Verificar distribuição de status codes
curl http://localhost:3000/metrics | grep http_errors_total

# 3. Analisar logs estruturados
docker logs hotel-backend | jq 'select(.level=="error")'
```

### Resolução

**Se erros 4xx (Cliente):**
```bash
# Verificar validações
# Analisar padrão de requisições inválidas
docker logs hotel-backend | jq 'select(.statusCode>=400 and .statusCode<500)' | head -20

# Possível ataque → Ativar rate limiting
```

**Se erros 5xx (Servidor):**
```bash
# 1. Verificar stack traces
docker logs hotel-backend | grep -A 10 "Error:"

# 2. Restart se necessário
docker restart hotel-backend

# 3. Rollback se bug recente
# Ver seção 7
```

### Verificação
```promql
# Taxa de erro deve voltar < 1%
sum(rate(http_errors_total[5m])) / sum(rate(http_requests_total[5m])) < 0.01
```

---

## 5. HighServerErrors

**🔴 Severidade: CRITICAL**  
**⏱️ Tempo de Resposta: Imediato**

### Sintomas
- Erros 5xx > 10/segundo
- Possível bug crítico ou falha em cascata

### Diagnóstico

```bash
# 1. Identificar endpoint problemático
docker logs hotel-backend --tail 500 | grep "500\|502\|503" | cut -d' ' -f5 | sort | uniq -c

# 2. Verificar último deploy
git log -1 --oneline

# 3. Verificar dependências
curl http://localhost:3000/health
```

### Resolução

**Ação Imediata: Rollback**
```bash
# 1. Identificar versão estável anterior
git log --oneline -10

# 2. Fazer rollback
git checkout <commit-estavel>
docker-compose up -d --build backend

# 3. Verificar
curl http://localhost:3000/health
```

**Investigação Pós-Incidente**
```bash
# Analisar logs do período
docker logs hotel-backend --since "2024-01-01T10:00:00" > incident.log

# Criar post-mortem
# Ver seção de template abaixo
```

---

## 6. HighMemoryUsage

**🟡 Severidade: WARNING**  
**⏱️ Tempo de Resposta: 15min**

### Sintomas
- Uso de memória > 80%
- Possível memory leak

### Diagnóstico

```bash
# 1. Verificar uso de memória
docker stats hotel-backend --no-stream

# 2. Verificar heap do Node.js
docker exec hotel-backend node -e "console.log(process.memoryUsage())"

# 3. Verificar conexões abertas
docker exec hotel-postgres psql -U hotel_user -d hotel_reservation -c "SELECT count(*) FROM pg_stat_activity;"
```

### Resolução

**Opção A: Restart Preventivo**
```bash
docker restart hotel-backend
```

**Opção B: Investigar Memory Leak**
```bash
# Habilitar heap snapshot
docker exec hotel-backend kill -USR2 $(docker exec hotel-backend pidof node)

# Analisar com Chrome DevTools
```

**Opção C: Aumentar Limite**
```bash
# Editar docker-compose.yml
# backend:
#   environment:
#     NODE_OPTIONS: "--max-old-space-size=2048"
docker-compose up -d backend
```

### Prevenção
- Restart automático semanal (domingos 4h)
- Monitorar tendência de crescimento
- Revisar código para leaks

---

## 7. Rollback de Deploy

### Rollback Rápido (< 5min)

```bash
# 1. Identificar commit anterior estável
git log --oneline -10

# 2. Fazer checkout
git checkout <commit-hash>

# 3. Rebuild e restart
docker-compose down backend
docker-compose up -d --build backend

# 4. Verificar
curl http://localhost:3000/health
docker logs hotel-backend --tail 50
```

### Rollback com Banco de Dados

```bash
# 1. Parar aplicação
docker-compose down backend

# 2. Restaurar backup do banco
docker exec -i hotel-postgres psql -U hotel_user hotel_reservation < backup_pre_deploy.sql

# 3. Rollback código
git checkout <commit-anterior>
docker-compose up -d --build backend

# 4. Verificar integridade
docker exec hotel-postgres psql -U hotel_user -d hotel_reservation -c "SELECT COUNT(*) FROM reservas;"
```

---

## 8. Contatos de Emergência

### Equipe On-Call

| Papel | Nome | Telefone | Horário |
|-------|------|----------|---------|
| On-Call Primário | Dev 1 | +55 11 9xxxx-xxxx | 24/7 |
| On-Call Secundário | Dev 2 | +55 11 9xxxx-xxxx | 24/7 |
| Tech Lead | Lead | +55 11 9xxxx-xxxx | 8h-20h |
| DBA | DBA | +55 11 9xxxx-xxxx | 8h-18h |
| CTO | CTO | +55 11 9xxxx-xxxx | Emergências |

### Canais de Comunicação

- **Slack**: #incidents (alertas automáticos)
- **PagerDuty**: Escalação automática
- **Status Page**: status.hotel.com

---

## 📊 Template de Post-Mortem

```markdown
# Post-Mortem: [Título do Incidente]

**Data**: YYYY-MM-DD
**Duração**: Xh Ymin
**Severidade**: Critical/High/Medium
**Impacto**: X usuários afetados

## Linha do Tempo
- HH:MM - Alerta disparado
- HH:MM - Equipe notificada
- HH:MM - Diagnóstico iniciado
- HH:MM - Resolução aplicada
- HH:MM - Serviço restaurado

## Causa Raiz
[Descrição detalhada]

## Resolução
[O que foi feito]

## Ações Preventivas
1. [ ] Ação 1
2. [ ] Ação 2
3. [ ] Ação 3

## Lições Aprendidas
- Lição 1
- Lição 2
```

---

## 🔧 Comandos Úteis

```bash
# Verificar saúde geral
docker-compose ps
curl http://localhost:3000/health

# Logs em tempo real
docker logs -f hotel-backend

# Métricas Prometheus
curl http://localhost:3000/metrics

# Backup rápido do banco
docker exec hotel-postgres pg_dump -U hotel_user hotel_reservation > backup_$(date +%Y%m%d_%H%M%S).sql

# Verificar versão em produção
curl http://localhost:3000/version

# Limpar recursos Docker
docker system prune -a --volumes
```

---

## 📈 SLAs e Error Budget

| Métrica | SLO | Error Budget Mensal |
|---------|-----|---------------------|
| Disponibilidade | 99.9% | 43 minutos |
| Latência P95 | < 1s | - |
| Taxa de Erro | < 1% | - |

**Consumo do Error Budget**: Monitorar em Grafana dashboard "SLO Overview"

---

**Última Atualização**: 2024-01-01  
**Versão**: 1.0  
**Responsável**: Equipe DevOps
