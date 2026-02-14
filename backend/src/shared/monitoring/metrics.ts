/**
 * Sistema de Métricas - Prometheus
 * 
 * Decisão: Usar Prometheus para métricas por ser:
 * - Padrão da indústria
 * - Integração fácil com Grafana
 * - Pull-based (não sobrecarrega aplicação)
 * - Time-series database otimizado
 */

import { Counter, Histogram, Gauge, Registry } from 'prom-client';

// Registry para todas as métricas
export const register = new Registry();

// ============================================
// MÉTRICAS DE DISPONIBILIDADE
// ============================================

/**
 * Uptime da aplicação
 * Tipo: Gauge (valor que pode subir e descer)
 */
export const uptimeMetric = new Gauge({
  name: 'app_uptime_seconds',
  help: 'Tempo que a aplicação está rodando (segundos)',
  registers: [register]
});

/**
 * Status de saúde dos serviços
 * Tipo: Gauge (0 = down, 1 = up)
 */
export const healthMetric = new Gauge({
  name: 'app_health_status',
  help: 'Status de saúde (0=down, 1=up)',
  labelNames: ['service'], // database, redis, etc
  registers: [register]
});

// ============================================
// MÉTRICAS DE LATÊNCIA
// ============================================

/**
 * Latência de requisições HTTP
 * Tipo: Histogram (distribuição de valores)
 * Decisão: Histogram para calcular percentis (p50, p95, p99)
 */
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duração das requisições HTTP em segundos',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5], // 1ms, 5ms, 10ms, 50ms, 100ms, 500ms, 1s, 5s
  registers: [register]
});

/**
 * Latência de queries ao banco de dados
 * Tipo: Histogram
 */
export const dbQueryDuration = new Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duração das queries ao banco de dados',
  labelNames: ['operation', 'table'], // operation: select, insert, update, delete
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
  registers: [register]
});

/**
 * Latência de operações de cache
 * Tipo: Histogram
 */
export const cacheOperationDuration = new Histogram({
  name: 'cache_operation_duration_seconds',
  help: 'Duração das operações de cache',
  labelNames: ['operation'], // get, set, delete
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1],
  registers: [register]
});

// ============================================
// MÉTRICAS DE ERROS
// ============================================

/**
 * Total de requisições HTTP
 * Tipo: Counter (sempre incrementa)
 */
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total de requisições HTTP',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

/**
 * Total de erros HTTP (4xx e 5xx)
 * Tipo: Counter
 */
export const httpErrorsTotal = new Counter({
  name: 'http_errors_total',
  help: 'Total de erros HTTP',
  labelNames: ['method', 'route', 'status_code', 'error_type'],
  registers: [register]
});

/**
 * Total de erros de banco de dados
 * Tipo: Counter
 */
export const dbErrorsTotal = new Counter({
  name: 'db_errors_total',
  help: 'Total de erros de banco de dados',
  labelNames: ['operation', 'error_type'],
  registers: [register]
});

/**
 * Total de erros de validação
 * Tipo: Counter
 */
export const validationErrorsTotal = new Counter({
  name: 'validation_errors_total',
  help: 'Total de erros de validação',
  labelNames: ['field', 'error_type'],
  registers: [register]
});

// ============================================
// MÉTRICAS DE NEGÓCIO
// ============================================

/**
 * Total de quartos cadastrados
 * Tipo: Gauge
 */
export const totalQuartos = new Gauge({
  name: 'quartos_total',
  help: 'Total de quartos cadastrados',
  registers: [register]
});

/**
 * Quartos por status
 * Tipo: Gauge
 */
export const quartosPorStatus = new Gauge({
  name: 'quartos_por_status',
  help: 'Quantidade de quartos por status',
  labelNames: ['status'], // LIVRE, OCUPADO, MANUTENCAO, LIMPEZA
  registers: [register]
});

/**
 * Total de reservas
 * Tipo: Counter
 */
export const reservasTotal = new Counter({
  name: 'reservas_total',
  help: 'Total de reservas criadas',
  labelNames: ['status'], // ATIVA, CANCELADA, FINALIZADA
  registers: [register]
});

/**
 * Taxa de ocupação
 * Tipo: Gauge (0-100%)
 */
export const taxaOcupacao = new Gauge({
  name: 'taxa_ocupacao_percent',
  help: 'Taxa de ocupação do hotel (%)',
  registers: [register]
});

// ============================================
// MÉTRICAS DE RECURSOS
// ============================================

/**
 * Uso de memória
 * Tipo: Gauge
 */
export const memoryUsage = new Gauge({
  name: 'process_memory_usage_bytes',
  help: 'Uso de memória do processo',
  labelNames: ['type'], // heapUsed, heapTotal, external, rss
  registers: [register]
});

/**
 * Conexões ativas ao banco
 * Tipo: Gauge
 */
export const dbConnectionsActive = new Gauge({
  name: 'db_connections_active',
  help: 'Número de conexões ativas ao banco de dados',
  registers: [register]
});

/**
 * Conexões ativas ao Redis
 * Tipo: Gauge
 */
export const redisConnectionsActive = new Gauge({
  name: 'redis_connections_active',
  help: 'Número de conexões ativas ao Redis',
  registers: [register]
});

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Atualizar métricas de recursos periodicamente
 * Decisão: Coletar a cada 10 segundos
 */
export function startResourceMetricsCollection() {
  setInterval(() => {
    const mem = process.memoryUsage();
    memoryUsage.set({ type: 'heapUsed' }, mem.heapUsed);
    memoryUsage.set({ type: 'heapTotal' }, mem.heapTotal);
    memoryUsage.set({ type: 'external' }, mem.external);
    memoryUsage.set({ type: 'rss' }, mem.rss);

    uptimeMetric.set(process.uptime());
  }, 10000); // 10 segundos
}

/**
 * Middleware para coletar métricas HTTP
 */
export function metricsMiddleware(req: any, res: any, next: any) {
  const start = Date.now();

  // Quando resposta terminar
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000; // segundos
    const route = req.route?.path || req.path || 'unknown';
    const method = req.method;
    const statusCode = res.statusCode.toString();

    // Registrar duração
    httpRequestDuration.observe(
      { method, route, status_code: statusCode },
      duration
    );

    // Contar requisição
    httpRequestsTotal.inc({ method, route, status_code: statusCode });

    // Contar erro se 4xx ou 5xx
    if (statusCode.startsWith('4') || statusCode.startsWith('5')) {
      const errorType = statusCode.startsWith('4') ? 'client_error' : 'server_error';
      httpErrorsTotal.inc({ method, route, status_code: statusCode, error_type: errorType });
    }
  });

  next();
}

/**
 * Endpoint para expor métricas
 */
export async function getMetrics() {
  return register.metrics();
}
