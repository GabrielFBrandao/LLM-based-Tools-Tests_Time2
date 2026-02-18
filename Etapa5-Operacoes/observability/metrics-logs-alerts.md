# Observabilidade - Métricas, Logs e Alertas

Métricas
- Disponibilidade: uptime, healthcheck success rate, restarts por pod
- Latência: P50/P95/P99 por endpoint, tempo de loop do event loop (Node), GC pauses (APM)
- Erros: taxa de 5xx por endpoint/minuto, exceptions (uncaughtException/unhandledRejection)
- Throughput: RPS, fila (se existir), CPU/memória por pod
- Banco (se aplicável): tempo médio de query, conexões ativas, timeouts
- Negócio: cadastros de quartos, reservas criadas/canceladas, ocupação

Logs
- JSON estruturado: timestamp, level, service, correlationId/traceId, endpoint, userId, mensagem, campos (quartoId, hospedeId, reservaId)
- Níveis: debug, info, warn, error (padrões de produção: info/warn/error)
- Coleta: stdout → Fluent Bit/Vector → ELK/Opensearch/Cloud Logging
- Padrões
  - Logar início/fim de requisições com correlationId
  - Logar eventos de negócio críticos (criação/edição de quarto, reservas)
  - Jamais logar segredos (mascarar dados sensíveis)

Alertas (exemplos)
- 5xx > 2% em 5 min (por endpoint) → alerta
- P95 > 500ms por 5 min → alerta
- Uptime < 99.9% na janela de 30 dias → alerta
- Restarts de pod > 3 em 10 min → alerta
- Exceptions não tratadas detectadas → alerta

Dashboards (sugestões)
- API Performance: RPS, P95/P99, 5xx por rota
- Infra: CPU/Mem, restarts, uso de disco
- Negócio: volume/dia de reservas, taxa de ocupação

Tracing
- OpenTelemetry SDK → Otel Collector → Jaeger/Tempo/Cloud Trace
- Instrumentar inbound HTTP, chamadas a DB e external services, propagação de trace context
