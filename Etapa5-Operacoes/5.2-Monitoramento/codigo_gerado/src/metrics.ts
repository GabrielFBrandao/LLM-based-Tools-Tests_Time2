/**
 * =============================================================================
 * metrics.ts — Métricas de negócio e infraestrutura (Prometheus)
 *
 * DECISÃO — PROMETHEUS (prom-client) COMO BASE:
 * Prometheus é o padrão de fato para métricas em sistemas containerizados.
 * O endpoint GET /metrics expõe todas as métricas no formato que o
 * Prometheus (e o Grafana) entendem nativamente.
 *
 * DECISÃO — QUATRO TIPOS DE MÉTRICAS USADOS:
 *
 * Counter   — sempre cresce, nunca decresce.
 *             Ex: total de reservas criadas, total de erros.
 *             Útil para taxas (rate) e acumulados.
 *
 * Histogram — distribui observações em buckets de tamanho.
 *             Ex: latência de operações. Responde "quantas requisições
 *             levaram < 100ms? < 500ms? > 1s?"
 *             Permite calcular p50, p95, p99 no Prometheus/Grafana.
 *
 * Gauge     — pode subir e descer.
 *             Ex: quartos disponíveis agora, reservas ativas agora.
 *             Snapshot do estado atual.
 *
 * Summary   — NÃO usado aqui. Summary calcula percentis no cliente, o que
 *             impossibilita agregação entre múltiplas instâncias. Usar
 *             Histogram para percentis.
 *
 * DECISÃO — LABELS:
 * Labels tornam uma métrica multidimensional. Ex: http_requests_total
 * com labels method, route, status_code permite filtrar no Grafana por
 * qualquer combinação. CUIDADO: cardinalidade alta (ex: hospedeId como
 * label) explode o uso de memória do Prometheus.
 * =============================================================================
 */

import { Counter, Histogram, Gauge, Registry } from "prom-client";

// ── Registry isolado ─────────────────────────────────────────────────────────
// DECISÃO: Registry próprio em vez do defaultRegistry global.
// Facilita testes (cada teste tem seu registry limpo) e evita conflitos
// se a aplicação for embarcada como módulo em outro sistema.
export const registry = new Registry();
registry.setDefaultLabels({ app: "hotel-reservas" });

// =============================================================================
// MÉTRICAS HTTP (infraestrutura)
// =============================================================================

/**
 * Total de requisições HTTP recebidas.
 * Labels: method (GET/POST/PATCH/DELETE), route (/quartos, /reservas/:id),
 *         status_code (200, 400, 404, 500).
 *
 * ATENÇÃO: Usar `route` normalizada, não a URL real.
 * "GET /reservas/res_123" deve virar "GET /reservas/:id"
 * para não explodir a cardinalidade com IDs únicos.
 */
export const httpRequestsTotal = new Counter({
  name: "http_requests_total",
  help: "Total de requisições HTTP recebidas por método, rota e status",
  labelNames: ["method", "route", "status_code"],
  registers: [registry],
});

/**
 * Latência das requisições HTTP em segundos (histograma).
 * Buckets escolhidos para capturar SLOs comuns:
 *   < 50ms  → operações muito rápidas (leituras em memória)
 *   < 200ms → SLO esperado para APIs REST simples
 *   < 500ms → aceitável com banco de dados
 *   < 1s    → lento mas tolerável
 *   > 2s    → inaceitável, deve disparar alerta
 */
export const httpRequestDurationSeconds = new Histogram({
  name: "http_request_duration_seconds",
  help: "Latência das requisições HTTP em segundos",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.05, 0.1, 0.2, 0.5, 1, 2, 5],
  registers: [registry],
});

// =============================================================================
// MÉTRICAS DE NEGÓCIO — Quarto
// =============================================================================

export const quartoCadastroTotal = new Counter({
  name: "hotel_quarto_cadastro_total",
  help: "Total de tentativas de cadastro de quarto",
  labelNames: ["resultado"],  // "sucesso" | "falha_numero_duplicado" | "falha_validacao"
  registers: [registry],
});

export const quartoEdicaoTotal = new Counter({
  name: "hotel_quarto_edicao_total",
  help: "Total de edições de quarto",
  labelNames: ["resultado"],
  registers: [registry],
});

export const quartoStatusAtualTotal = new Gauge({
  name: "hotel_quartos_por_status",
  help: "Número atual de quartos por status (snapshot)",
  labelNames: ["status"],  // "Livre" | "Ocupado" | "Manutenção" | "Limpeza"
  registers: [registry],
});

export const quartoAlteracaoStatusTotal = new Counter({
  name: "hotel_quarto_alteracao_status_total",
  help: "Total de mudanças de status de quarto",
  labelNames: ["de", "para"],  // de: "Livre", para: "Ocupado"
  registers: [registry],
});

// =============================================================================
// MÉTRICAS DE NEGÓCIO — Hóspede
// =============================================================================

export const hospedeCadastroTotal = new Counter({
  name: "hotel_hospede_cadastro_total",
  help: "Total de tentativas de cadastro de hóspede",
  labelNames: ["resultado"],  // "sucesso" | "falha_cpf_duplicado" | "falha_validacao"
  registers: [registry],
});

export const hospedeAtivos = new Gauge({
  name: "hotel_hospedes_ativos_total",
  help: "Total atual de hóspedes cadastrados no sistema",
  registers: [registry],
});

// =============================================================================
// MÉTRICAS DE NEGÓCIO — Reserva
// =============================================================================

export const reservaCriacaoTotal = new Counter({
  name: "hotel_reserva_criacao_total",
  help: "Total de tentativas de criação de reserva",
  labelNames: ["resultado"],  // "sucesso" | "falha_quarto_indisponivel" | "falha_hospede_inexistente" | "falha_quarto_inexistente"
  registers: [registry],
});

export const reservaCancelamentoTotal = new Counter({
  name: "hotel_reserva_cancelamento_total",
  help: "Total de cancelamentos de reserva",
  labelNames: ["resultado"],  // "sucesso" | "falha_reserva_inexistente" | "falha_ja_cancelada"
  registers: [registry],
});

export const reservasAtivasAtual = new Gauge({
  name: "hotel_reservas_ativas_atual",
  help: "Número atual de reservas com status ATIVA",
  registers: [registry],
});

export const reservaDuracaoAteAtendimento = new Histogram({
  name: "hotel_reserva_duracao_criacao_seconds",
  help: "Tempo de processamento da criação de reserva (inclui 2 operações de repositório)",
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5],
  registers: [registry],
});

// =============================================================================
// MÉTRICAS DE BANCO DE DADOS
// =============================================================================

export const dbOperacaoTotal = new Counter({
  name: "hotel_db_operacao_total",
  help: "Total de operações no repositório por tipo",
  labelNames: ["repositorio", "operacao", "resultado"],
  // repositorio: "quarto" | "hospede" | "reserva"
  // operacao: "salvar" | "buscarPorId" | "atualizar" | "listarTodos"
  // resultado: "sucesso" | "erro"
  registers: [registry],
});

export const dbOperacaoDurationSeconds = new Histogram({
  name: "hotel_db_operacao_duration_seconds",
  help: "Latência das operações de repositório em segundos",
  labelNames: ["repositorio", "operacao"],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
  registers: [registry],
});

// =============================================================================
// MÉTRICAS DE PROCESSO (Node.js)
// =============================================================================

import { collectDefaultMetrics } from "prom-client";

// DECISÃO — collectDefaultMetrics:
// Coleta automaticamente ~20 métricas do processo Node.js:
// - nodejs_heap_size_used_bytes (uso de memória)
// - nodejs_active_handles_total (conexões abertas)
// - process_cpu_seconds_total (uso de CPU)
// - nodejs_gc_duration_seconds (tempo gasto em garbage collection)
// Intervalo de 10s é padrão — não sobrecarrega o processo.
collectDefaultMetrics({ register: registry, prefix: "hotel_node_" });
