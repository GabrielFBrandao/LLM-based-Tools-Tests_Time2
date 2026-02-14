Vou criar uma estratégia completa de monitoramento com métricas e logs.

Criando diretórios para monitoramento e logging

`shell`

Completed

```bash
mkdir -p backend/src/shared/{monitoring,logging}
```

Criando sistema de métricas com Prometheus

`metrics.ts`

+268-0

 Undo

Criando sistema de logging estruturado

`logger.ts`

+352-0

 Undo

Criando configuração do Prometheus e Grafana

`prometheus.yml`

+51-0

 Undo

Criando regras de alertas do Prometheus

🔄 Undo all changes

`rules.yml`

Error

Criando diretório de alertas

`shell`

Completed

```bash
mkdir -p docker/alerts
```

Criando regras de alertas do Prometheus

`rules.yml`

+55-0

 Undo

Criando documentação completa de monitoramento e observabilidade

`MONITORAMENTO_OBSERVABILIDADE.md`

+535-0

 Undo

🔄 Undo all changes

---

## ✅ Estratégia de Monitoramento e Observabilidade Completa!

### 📊 3 Pilares da Observabilidade Implementados

```
┌───────────────┐        ┌───────────────┐        ┌───────────────┐
│    MÉTRICAS   │        │     LOGS      │        │    TRACES     │
│ (Prometheus)  │        │   (Winston)   │        │  (Planejado)  │
└───────────────┘        └───────────────┘        └───────────────┘
```

### 📈 Métricas Implementadas (17 métricas)

**🟢 Disponibilidade (3 métricas)**

* app_uptime_seconds - Tempo de execução
* app_health_status{service} - Saúde de dependências
* http_requests_total - Total de requisições

**⚡ Latência (3 métricas)**

* http_request_duration_seconds - Latência HTTP (P50, P95, P99)
* db_query_duration_seconds - Latência de queries
* cache_operation_duration_seconds - Latência de cache

**🚨 Erros (4 métricas)**

* http_errors_total - Erros HTTP (4xx, 5xx)
* db_errors_total - Erros de banco
* validation_errors_total - Erros de validação
* Taxa de erro calculada

**💼 Negócio (4 métricas)**

* quartos_total - Total de quartos
* quartos_por_status{status} - Quartos por status
* reservas_total{status} - Total de reservas
* taxa_ocupacao_percent - Taxa de ocupação (KPI)

**🖥️ Recursos (3 métricas)**

* process_memory_usage_bytes - Uso de memória
* db_connections_active - Conexões ao banco
* redis_connections_active - Conexões ao Redis

### 📝 Logs Estruturados (6 tipos)

1. HTTP Request - Todas as requisições
2. HTTP Error - Erros 4xx e 5xx
3. Database Operation - Queries ao banco
4. Business Operation - Operações de negócio
5. State Change - Mudanças de estado (auditoria)
6. Authentication - Login/logout

Formato: JSON estruturado para fácil parsing

### 🚨 Alertas Configurados (8 alertas)

| Alerta | Condição | Severidade | Tempo |
|--------|----------|------------|-------|
| ApplicationDown | Backend down | 🔴 Critical | 1min |
| DatabaseDown | PostgreSQL down | 🔴 Critical | 1min |
| HighLatency | P95 > 1s | 🟡 Warning | 5min |
| CriticalLatency | P95 > 5s | 🔴 Critical | 2min |
| HighErrorRate | Erros > 5% | 🟡 Warning | 5min |
| CriticalErrorRate | Erros > 10% | 🔴 Critical | 2min |
| HighServerErrors | 5xx > 10/s | 🔴 Critical | 2min |
| HighMemoryUsage | Memória > 80% | 🟡 Warning | 5min |

### 🎯 SLAs Definidos

| Métrica | SLO | Medição |
|---------|-----|---------|
| Disponibilidade | 99.9% | Uptime mensal |
| Latência P95 | < 1s | HTTP requests |
| Latência P99 | < 5s | HTTP requests |
| Taxa de Erro | < 1% | Erros/Total |
| Queries P95 | < 100ms | Database |

**Error Budget: 43 minutos/mês de downtime**

### 📁 Arquivos Criados

```
backend/src/shared/
├── monitoring/
│   └── metrics.ts                         ✅ 17 métricas Prometheus
└── logging/
    └── logger.ts                          ✅ Sistema de logs Winston
docker/
├── prometheus.yml                         ✅ Configuração Prometheus
└── alerts/
    └── rules.yml                          ✅ 8 regras de alerta
MONITORAMENTO_OBSERVABILIDADE.md           ✅ Documentação completa
```

### 🔍 Queries Prometheus Úteis

```promql
# Taxa de requisições/segundo
rate(http_requests_total[5m])

# Latência P95
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Taxa de erro
sum(rate(http_errors_total[5m])) / sum(rate(http_requests_total[5m]))

# Taxa de ocupação
(quartos_por_status{status="OCUPADO"} / quartos_total) * 100

# Top 5 endpoints mais lentos
topk(5, histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])))
```

### 📊 Dashboards Sugeridos

1. Overview - Visão geral do sistema
2. Performance - Latência e throughput
3. Errors - Análise de erros
4. Business - KPIs de negócio
5. Resources - Uso de recursos

### 🎓 Benefícios

* ✅ Visibilidade completa do sistema
* ✅ Detecção proativa de problemas
* ✅ Debugging facilitado com logs estruturados
* ✅ KPIs de negócio monitorados
* ✅ SLAs garantidos com alertas

### 🚀 Como Usar

```typescript
// Exemplo: Logar operação de negócio
logBusinessOperation({
  operation: 'create',
  entity: 'reserva',
  entityId: 123,
  userId: 1,
  success: true
});

// Exemplo: Logar mudança de estado
logStateChange({
  entity: 'quarto',
  entityId: 101,
  field: 'status',
  oldValue: 'LIVRE',
  newValue: 'OCUPADO',
  userId: 1
});
```

Sistema completo de monitoramento e observabilidade pronto! 📊📈🚨

---

### ⚠️ Compact chat history?

**Allow**

The context window is almost full (79%) and exceeding it will clear your history. Amazon Q can compact your history instead.
