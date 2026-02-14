# Estratégia de Monitoramento e Observabilidade

## 📋 Visão Geral

Estratégia completa de monitoramento baseada nos **3 Pilares da Observabilidade**:
1. **Métricas** (Prometheus)
2. **Logs** (Winston)
3. **Traces** (Planejado)

---

## 📊 Métricas (Prometheus)

### Categorias de Métricas

| Categoria | Métricas | Tipo | Propósito |
|-----------|----------|------|-----------|
| **Disponibilidade** | 3 | Gauge | Uptime e saúde |
| **Latência** | 3 | Histogram | Performance |
| **Erros** | 4 | Counter | Confiabilidade |
| **Negócio** | 4 | Gauge/Counter | KPIs |
| **Recursos** | 3 | Gauge | Capacidade |

**Total: 17 métricas**

---

## 🎯 Métricas de Disponibilidade

### 1. Uptime da Aplicação
```
app_uptime_seconds
```
- **Tipo:** Gauge
- **Descrição:** Tempo que aplicação está rodando
- **Alerta:** < 99.9% (SLA)

### 2. Status de Saúde dos Serviços
```
app_health_status{service="database|redis"}
```
- **Tipo:** Gauge (0=down, 1=up)
- **Descrição:** Saúde de dependências
- **Alerta:** == 0 por > 1min

### 3. Requisições HTTP Total
```
http_requests_total{method, route, status_code}
```
- **Tipo:** Counter
- **Descrição:** Total de requisições
- **Uso:** Calcular throughput

---

## ⚡ Métricas de Latência

### 1. Duração de Requisições HTTP
```
http_request_duration_seconds{method, route, status_code}
```
- **Tipo:** Histogram
- **Buckets:** 1ms, 5ms, 10ms, 50ms, 100ms, 500ms, 1s, 5s
- **Percentis:** P50, P95, P99
- **SLA:** P95 < 1s, P99 < 5s

**Queries úteis:**
```promql
# P95 de latência
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# P99 de latência
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))

# Latência média
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])
```

### 2. Duração de Queries ao Banco
```
db_query_duration_seconds{operation, table}
```
- **Tipo:** Histogram
- **SLA:** P95 < 100ms

### 3. Duração de Operações de Cache
```
cache_operation_duration_seconds{operation}
```
- **Tipo:** Histogram
- **SLA:** P95 < 10ms

---

## 🚨 Métricas de Erros

### 1. Total de Erros HTTP
```
http_errors_total{method, route, status_code, error_type}
```
- **Tipo:** Counter
- **Labels:** client_error (4xx), server_error (5xx)
- **SLA:** Taxa de erro < 1%

**Queries úteis:**
```promql
# Taxa de erro
sum(rate(http_errors_total[5m])) / sum(rate(http_requests_total[5m]))

# Erros 5xx por segundo
sum(rate(http_requests_total{status_code=~"5.."}[5m]))

# Top 5 endpoints com mais erros
topk(5, sum by (route) (rate(http_errors_total[5m])))
```

### 2. Erros de Banco de Dados
```
db_errors_total{operation, error_type}
```
- **Tipo:** Counter
- **Alerta:** > 1 erro/s

### 3. Erros de Validação
```
validation_errors_total{field, error_type}
```
- **Tipo:** Counter
- **Uso:** Identificar campos problemáticos

---

## 💼 Métricas de Negócio

### 1. Total de Quartos
```
quartos_total
```
- **Tipo:** Gauge
- **Descrição:** Total de quartos cadastrados

### 2. Quartos por Status
```
quartos_por_status{status="LIVRE|OCUPADO|MANUTENCAO|LIMPEZA"}
```
- **Tipo:** Gauge
- **Uso:** Monitorar disponibilidade

### 3. Total de Reservas
```
reservas_total{status="ATIVA|CANCELADA|FINALIZADA"}
```
- **Tipo:** Counter
- **Uso:** KPI de vendas

### 4. Taxa de Ocupação
```
taxa_ocupacao_percent
```
- **Tipo:** Gauge (0-100%)
- **Fórmula:** (Quartos Ocupados / Total Quartos) * 100
- **KPI:** > 70% é bom

**Queries úteis:**
```promql
# Taxa de ocupação
(quartos_por_status{status="OCUPADO"} / quartos_total) * 100

# Taxa de cancelamento
rate(reservas_total{status="CANCELADA"}[1h]) / rate(reservas_total[1h])

# Reservas por hora
rate(reservas_total[1h]) * 3600
```

---

## 🖥️ Métricas de Recursos

### 1. Uso de Memória
```
process_memory_usage_bytes{type="heapUsed|heapTotal|rss"}
```
- **Tipo:** Gauge
- **Alerta:** heapUsed/heapTotal > 80%

### 2. Conexões Ativas ao Banco
```
db_connections_active
```
- **Tipo:** Gauge
- **Alerta:** > 50 conexões

### 3. Conexões Ativas ao Redis
```
redis_connections_active
```
- **Tipo:** Gauge

---

## 📝 Logs Estruturados (Winston)

### Níveis de Log

| Nível | Severidade | Uso | Produção |
|-------|------------|-----|----------|
| **error** | 0 | Erros críticos | ✅ Sim |
| **warn** | 1 | Avisos | ✅ Sim |
| **info** | 2 | Operações importantes | ✅ Sim |
| **http** | 3 | Requisições HTTP | ✅ Sim |
| **debug** | 4 | Debugging | ❌ Não |

### Tipos de Log

#### 1. HTTP Request
```json
{
  "timestamp": "2024-01-01 10:00:00",
  "level": "http",
  "message": "HTTP Request",
  "type": "http_request",
  "method": "POST",
  "url": "/api/v1/quartos",
  "statusCode": 201,
  "duration": 45,
  "userId": 1,
  "ip": "192.168.1.1"
}
```

#### 2. HTTP Error
```json
{
  "timestamp": "2024-01-01 10:00:00",
  "level": "error",
  "message": "HTTP Error",
  "type": "http_error",
  "method": "POST",
  "url": "/api/v1/reservas",
  "statusCode": 400,
  "error": "Quarto não disponível",
  "stack": "Error: ...",
  "userId": 1
}
```

#### 3. Database Operation
```json
{
  "timestamp": "2024-01-01 10:00:00",
  "level": "debug",
  "message": "Database Operation",
  "type": "db_operation",
  "operation": "insert",
  "table": "quartos",
  "duration": 12,
  "success": true
}
```

#### 4. Business Operation
```json
{
  "timestamp": "2024-01-01 10:00:00",
  "level": "info",
  "message": "Business Operation",
  "type": "business_operation",
  "operation": "create",
  "entity": "reserva",
  "entityId": 123,
  "userId": 1,
  "success": true,
  "details": {
    "quartoId": 101,
    "hospedeId": 5
  }
}
```

#### 5. State Change
```json
{
  "timestamp": "2024-01-01 10:00:00",
  "level": "info",
  "message": "State Change",
  "type": "state_change",
  "entity": "quarto",
  "entityId": 101,
  "field": "status",
  "oldValue": "LIVRE",
  "newValue": "OCUPADO",
  "userId": 1
}
```

#### 6. Authentication
```json
{
  "timestamp": "2024-01-01 10:00:00",
  "level": "info",
  "message": "Authentication",
  "type": "authentication",
  "action": "login",
  "userId": 1,
  "email": "user@hotel.com",
  "ip": "192.168.1.1",
  "success": true
}
```

---

## 🚨 Alertas

### Níveis de Severidade

| Nível | Descrição | Ação | Tempo Resposta |
|-------|-----------|------|----------------|
| **critical** | Sistema down ou erro grave | Acordar on-call | Imediato |
| **warning** | Problema que pode escalar | Investigar | < 1 hora |
| **info** | Informação relevante | Monitorar | Próximo dia |

### Alertas Implementados

#### Disponibilidade

**1. ApplicationDown**
- **Condição:** `up{job="backend"} == 0`
- **Duração:** 1 minuto
- **Severidade:** Critical
- **Ação:** Verificar logs, reiniciar aplicação

**2. DatabaseDown**
- **Condição:** `app_health_status{service="database"} == 0`
- **Duração:** 1 minuto
- **Severidade:** Critical
- **Ação:** Verificar conexão com PostgreSQL

#### Latência

**3. HighLatency**
- **Condição:** P95 > 1 segundo
- **Duração:** 5 minutos
- **Severidade:** Warning
- **Ação:** Investigar queries lentas

**4. CriticalLatency**
- **Condição:** P95 > 5 segundos
- **Duração:** 2 minutos
- **Severidade:** Critical
- **Ação:** Escalar recursos ou otimizar código

#### Erros

**5. HighErrorRate**
- **Condição:** Taxa de erro > 5%
- **Duração:** 5 minutos
- **Severidade:** Warning
- **Ação:** Investigar logs de erro

**6. CriticalErrorRate**
- **Condição:** Taxa de erro > 10%
- **Duração:** 2 minutos
- **Severidade:** Critical
- **Ação:** Rollback ou hotfix

**7. HighServerErrors**
- **Condição:** > 10 erros 5xx/segundo
- **Duração:** 2 minutos
- **Severidade:** Critical
- **Ação:** Investigar causa raiz

#### Recursos

**8. HighMemoryUsage**
- **Condição:** Uso de memória > 80%
- **Duração:** 5 minutos
- **Severidade:** Warning
- **Ação:** Investigar memory leaks

---

## 📊 Dashboards Grafana

### Dashboard 1: Overview
- Uptime
- Taxa de requisições (req/s)
- Latência (P50, P95, P99)
- Taxa de erro
- Taxa de ocupação

### Dashboard 2: Performance
- Latência por endpoint
- Queries mais lentas
- Cache hit rate
- Throughput

### Dashboard 3: Errors
- Erros por tipo
- Erros por endpoint
- Top 10 erros
- Timeline de erros

### Dashboard 4: Business
- Reservas por hora
- Taxa de ocupação
- Quartos por status
- Taxa de cancelamento

### Dashboard 5: Resources
- Uso de CPU
- Uso de memória
- Conexões ao banco
- Disco I/O

---

## 🎯 SLAs e SLOs

### Service Level Objectives

| Métrica | SLO | Medição |
|---------|-----|---------|
| **Disponibilidade** | 99.9% | Uptime mensal |
| **Latência P95** | < 1s | Requisições HTTP |
| **Latência P99** | < 5s | Requisições HTTP |
| **Taxa de Erro** | < 1% | Erros / Total |
| **Queries P95** | < 100ms | Queries ao banco |

### Error Budget

**Cálculo:**
- SLO: 99.9% disponibilidade
- Error Budget: 0.1% = 43 minutos/mês
- Se exceder: Congelar features, focar em estabilidade

---

## 🔧 Implementação

### 1. Adicionar ao Backend

```typescript
import { metricsMiddleware, startResourceMetricsCollection } from './monitoring/metrics';
import { loggingMiddleware } from './logging/logger';

// Middlewares
app.use(loggingMiddleware);
app.use(metricsMiddleware);

// Endpoint de métricas
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Iniciar coleta de recursos
startResourceMetricsCollection();
```

### 2. Docker Compose

```yaml
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./docker/prometheus.yml:/etc/prometheus/prometheus.yml
      - ./docker/alerts:/etc/prometheus/alerts
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

---

## 📈 Queries Úteis

```promql
# Taxa de requisições por segundo
rate(http_requests_total[5m])

# Latência P95
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Taxa de erro
sum(rate(http_errors_total[5m])) / sum(rate(http_requests_total[5m]))

# Top 5 endpoints mais lentos
topk(5, histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])))

# Memória usada em MB
process_memory_usage_bytes{type="heapUsed"} / 1024 / 1024
```

---

## 🎯 Checklist de Monitoramento

### Implementado ✅
- [x] Métricas de disponibilidade
- [x] Métricas de latência
- [x] Métricas de erros
- [x] Métricas de negócio
- [x] Logs estruturados
- [x] Alertas críticos
- [x] Configuração Prometheus

### Próximos Passos 📋
- [ ] Dashboards Grafana
- [ ] Distributed tracing (Jaeger)
- [ ] APM (New Relic/DataDog)
- [ ] Log aggregation (ELK Stack)
- [ ] Alertmanager configurado
- [ ] Integração com Slack/PagerDuty

---

## 🎉 Conclusão

Estratégia completa de observabilidade com:
- ✅ 17 métricas cobrindo todos os aspectos
- ✅ Logs estruturados em JSON
- ✅ 8 alertas para situações críticas
- ✅ SLOs definidos (99.9% disponibilidade)
- ✅ Queries prontas para Grafana

**Visibilidade completa do sistema! 📊🔍**
