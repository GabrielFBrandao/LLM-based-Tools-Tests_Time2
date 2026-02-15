# Métricas e Logs de Monitoramento
**Disponibilidade · Latência · Erros · Negócio · Alertas**

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

> **PRINCÍPIO CENTRAL:** Métricas respondem 'o quê e quando'. Logs respondem 'por quê e como'. Usados juntos via `trace_id`, eles formam uma cadeia de investigação completa: alerta dispara → Grafana aponta a rota afetada → Loki mostra os logs daquela requisição específica.

---

## 2. Logs Estruturados

### 2.1 Formato e campos obrigatórios
Todos os logs são emitidos em JSON — um objeto por linha (NDJSON). Texto livre não é aceito nos services ou middlewares.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `timestamp` | string ISO 8601 | Quando o evento ocorreu. Parseável por qualquer ferramenta. |
| `level` | string | debug \| info \| warn \| error |
| `service` | string | quarto-service \| hospede-service \| reserva-service \| http |
| `message` | string | Nome do evento (ex: reserva.criar.sucesso). Sem dados variáveis. |
| `trace_id` | string | ID de correlação. Propaga do header X-Trace-Id. |
| `duration_ms` | number | Latência da operação em milissegundos. |
| `error_code` | string | Código de negócio derivado do erro (ex: QUARTO_INDISPONIVEL). |

### 2.2 Níveis e quando usar
* **error:** Falha inesperada que exige ação (Erro 500, banco inacessível).
* **warn:** Regra de negócio violada de forma esperada (RF18: quarto indisponível).
* **info:** Evento de negócio bem-sucedido.
* **debug:** Detalhe útil apenas em desenvolvimento.

### 2.3 Decisões de privacidade (LGPD)
* **CPF completo:** Nunca logado (apenas os 3 últimos dígitos para debug).
* **Email:** Não logado em operações de sucesso.
* **Motivo de cancelamento:** Não logado (pode conter dados sensíveis de texto livre).

---

## 3. Métricas Prometheus

### 3.1 Tipos utilizados
* **Counter:** Só cresce (Totais acumulados: reservas criadas, erros).
* **Histogram:** Distribui em buckets (Latência para calcular p50, p95, p99).
* **Gauge:** Sobe e desce (Estado atual: reservas ativas, quartos ocupados).

> **DECISÃO:** Labels de rota são normalizados (ex: `/reservas/:id`) para evitar *cardinality explosion* na memória do Prometheus.

---

## 4. SLOs e Limiares de Alerta
Os alertas do Prometheus são derivados diretamente de Service Level Objectives (SLOs) quantitativos:

| SLO | Meta | Alerta warning | Alerta critical |
| :--- | :--- | :--- | :--- |
| **Disponibilidade** | ≥ 99.5% | — | Taxa de requisições = 0 por 3min |
| **Latência p95** | < 500ms | p95 > 500ms por 5min | p99 > 1s por 5min |
| **Taxa de erros 5xx** | < 0.1% | — | > 0.1% por 5min |
| **Quartos livres** | ≥ 5% do total | < 5% por 30min | — |

---

## 5. Regras de Alerta (16 regras)
> **DECISÃO:** Todo alerta tem um parâmetro `for` que ignora spikes passageiros. Um pico de latência de 10 segundos não acorda ninguém; um de 5 minutos, sim. Isso reduz falsos positivos drasticamente.

---

## 6. Padrão de Instrumentação (Wrappers)
Os services originais (`QuartoService`, etc.) não foram modificados. A observabilidade é adicionada via *wrappers* (Decorator pattern) que delegam para o service real.

> **POR QUE WRAPPERS?** Observabilidade é um *cross-cutting concern*. Misturá-la com regras de negócio viola o SRP (Single Responsibility Principle) e dificulta testes unitários.

---

## 7. Cadeia de Investigação
Fluxo do engenheiro quando um alerta dispara:
1. Alerta dispara (PagerDuty/Slack).
2. Grafana → Analisa painel de latência ou métricas de negócio.
3. Loki → Filtra logs extraindo o `trace_id` do erro.
4. Rastreia toda a requisição usando o `X-Trace-Id`.