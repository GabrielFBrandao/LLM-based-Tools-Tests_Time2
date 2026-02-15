# SISTEMA DE RESERVA DE HOTEL 
**Métricas e Logs de Monitoramento **
Disponibilidade · Latência · Erros · Negócio · Alertas 

| | |
| :--- | :--- |
| **Stack** | TypeScript 5 + Node.js 22 + PostgreSQL 16 |
| **Serviços** | QuartoService, HospedeService, ReservaService |
| **Instrumentação** | prom-client (Prometheus) + logs JSON estruturados |
| **Alertas** | 16 regras em 6 grupos (disponibilidade → infra) |
| **Entregáveis** | logger.ts, metrics.ts, middleware.ts, instrumented-services.ts, alertas.yml, dashboard Grafana |

---

## 1. Estratégia de Observabilidade 
A observabilidade é organizada em três pilares complementares — cada um responde a uma pergunta diferente sobre o sistema: 

| Pilar | Ferramenta | Pergunta respondida |
| :--- | :--- | :--- |
| **Métricas** | Prometheus + Grafana | O sistema está saudável? Onde está lento? Qual a tendência? |
| **Logs** | JSON → Loki / Elasticsearch | O que exatamente aconteceu nesta requisição? Por que falhou? |
| **Alertas** | Prometheus Alertmanager | Preciso acordar alguém? O SLO foi violado? |

> **PRINCÍPIO CENTRAL:** Métricas respondem 'o quê e quando'. Logs respondem 'por quê e como'. Usados juntos via trace_id, eles formam uma cadeia de investigação completa: alerta dispara → Grafana aponta a rota afetada → Loki mostra os logs daquela requisição específica. 

---

## 2. Logs Estruturados

### 2.1 Formato e campos obrigatórios
Todos os logs são emitidos em JSON — um objeto por linha (NDJSON). Texto livre não é aceito nos services ou middlewares. O formato garante que qualquer ferramenta de agregação (Loki, Elasticsearch, CloudWatch) possa filtrar e agregar sem parsing custom.

**Campos presentes em todo log:** 
| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `timestamp` | string ISO 8601 | Quando o evento ocorreu. Parseável por qualquer ferramenta |
| `level` | string | debug \| info \| warn \| error |
| `service` | string | quarto-service \| hospede-service \| reserva-service \| http |
| `message` | string | Nome do evento (ex: reserva.criar.sucesso). Sem dados variáveis |
| `trace_id` | string | ID de correlação. Propaga do header X-Trace-Id através de toda a cadeia |
| `duration_ms` | number | Latência da operação em milissegundos (presente em ops de negócio e HTTP) |
| `error_code` | string | Código de negócio derivado do erro (ex: QUARTO_INDISPONIVEL) |

### 2.2 Níveis e quando usar cada um 
| Nível | Quando usar | Exemplos neste sistema | Em produção? |
| :--- | :--- | :--- | :--- |
| **error** | Falha inesperada que exige ação | Erro 500, banco inacessível, exceção não tratada | Sim |
| **warn** | Regra de negócio violada (esperado) | RF18: quarto indisponível, CPF duplicado | Sim |
| **info** | Evento de negócio bem-sucedido | Reserva criada, hóspede cadastrado, quarto editado | Sim |
| **debug** | Detalhe útil em desenvolvimento | Início de operação, payload de DTO recebido | Não (LOG_LEVEL=info) |

### 2.3 Exemplos de logs por evento 
**Reserva criada com sucesso (info)** 
```json
{
  "timestamp": "2025-02-15T14:32:01.456Z",
  "level": "info",
  "service": "reserva-service",
  "message": "reserva.criar.sucesso",
  "trace_id": "a1b2c3d4e5f6g7h8",
  "reservaId": "res_1739621521_abc123",
  "quartoId": "qrt_101",
  "hospedeId": "hosp_456",
  "duration_ms": 12
}
```

## 2.4 Decisões de privacidade (LGPD)

| Dado | Decisão de log |
| :--- | :--- |
| **CPF completo** | Nunca logado. Apenas os 3 últimos dígitos (`cpf_suffix`) para debugging |
| **Email** | Não logado em operações de sucesso. Apenas indicador de erro (`email_invalido: true`) |
| **Motivo de cancelamento** | Não logado — pode conter dados pessoais informados pelo hóspede |
| **IDs internos** | Logados normalmente (`quartoId`, `hospedeId`, `reservaId`) — não são PII |

---

## 3. Métricas Prometheus

### 3.1 Quatro tipos utilizados

| Tipo | Comportamento | Quando usar |
| :--- | :--- | :--- |
| **Counter** | Só cresce | Totais acumulados: reservas criadas, erros, cadastros |
| **Histogram** | Distribui em buckets | Latência: permite calcular p50, p95, p99 no Grafana |
| **Gauge** | Sobe e desce | Estado atual: reservas ativas, quartos por status |
| **Summary** | [NÃO USADO] | Evitado: percentis no cliente impossibilitam agregação multi-instância |

### 3.2 Catálogo de métricas por camada

**Camada HTTP — Infraestrutura**

| Métrica | Tipo | Labels |
| :--- | :--- | :--- |
| `http_requests_total` | Counter | method, route, status_code |
| `http_request_duration_seconds` | Histogram | method, route, status_code |

> **DECISÃO — Labels de rota normalizados:** a URL real `/reservas/res_abc123_xyz` vira `/reservas/:id` antes de ser usada como label. Sem normalização, cada ID único geraria uma série de métrica separada — *cardinality explosion* que esgota a memória do Prometheus.

**Negócio — Quarto, Hóspede e Reserva**
(As métricas monitoram totais de cadastros com labels de sucesso/falha detalhada, além de gauges para quartos por status e reservas ativas).

---

## 4. SLOs e Limiares de Alerta
Os SLOs (Service Level Objectives) definem quantitativamente o que 'saudável' significa. Os alertas do Prometheus são derivados diretamente deles — não são valores arbitrários.

| SLO | Meta | Alerta warning | Alerta critical |
| :--- | :--- | :--- | :--- |
| **Disponibilidade (uptime)** | ≥ 99.5% | — | Taxa de requisições = 0 por 3min |
| **Latência p95** | < 500ms | p95 > 500ms por 5min | p99 > 1s por 5min |
| **Taxa de erros 5xx** | < 0.1% | — | > 0.1% por 5min |

---

## 5. Regras de Alerta — 16 alertas em 6 grupos

| # | Alerta | Condição (PromQL resumida) | Severity | For |
| :--- | :--- | :--- | :--- | :--- |
| 1 | APIForaDoAr | `rate(http_requests_total)[5m] == 0` | critical | 3m |
| 3 | LatenciaElevadaP95 | `quantile(0.95) > 500ms` | warning | 5m |
| 8 | AltaTaxaQuartoIndisponivel | falha RF18 > 50% das tentativas | warning | 10m |

> **DECISÃO — Parâmetro 'for':** todo alerta tem um 'for' que ignora spikes passageiros. Um pico de latência de 10 segundos não acorda ninguém. Um pico de 5 minutos acorda. Isso reduz drasticamente falsos positivos — o principal inimigo da confiança em sistemas de alerta.

---

## 6. Padrão de Instrumentação

### 6.1 Wrapper (Decorator) nos Services
Os services originais (`QuartoService`, `HospedeService`, `ReservaService`) não foram modificados. A observabilidade é adicionada em wrappers que delegam para o service real e acrescentam a instrumentação ao redor.

> **DECISÃO — POR QUE WRAPPERS E NÃO MODIFICAR OS SERVICES DIRETAMENTE?** Observabilidade é uma preocupação transversal (cross-cutting concern). Misturá-la com regras de negócio viola o SRP e dificulta os testes unitários, que testam apenas lógica de negócio, sem dependências de logging.

### 6.2 Middleware HTTP
* O middleware Express é dividido em dois independentes: `requestLogger` (gera logs) e `metricsMiddleware` (incrementa Prometheus).
* O `trace_id` é injetado em `req.traceId` — os `InstrumentedServices` o repassam em todos os logs.
* HTTP 4xx → `logger.warn`. HTTP 5xx → `logger.error`. 2xx/3xx → `logger.info`.

---

## 7. Cadeia de Investigação
Este é o fluxo que um engenheiro segue quando um alerta dispara — do Grafana até o log específico que causou o problema:

| Passo | Ação | O que procurar |
| :--- | :--- | :--- |
| **1** | Alerta dispara (PagerDuty/Slack) | Nome do alerta, severity, descrição do runbook |
| **2** | Grafana → painel de latência | Qual rota está lenta? Quando começou? Coincide com deploy? |
| **3** | Grafana → métricas de negócio | Alta taxa de QUARTO_INDISPONIVEL? Bug ou hotel lotado? |
| **4** | Filtrar logs por trace_id | Loki: `{service='reserva-service'} \| json \| error_code = 'QUARTO_INDISPONIVEL'` |