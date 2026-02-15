/**
 * =============================================================================
 * logger.ts — Log estruturado em JSON
 *
 * DECISÃO — POR QUE JSON E NÃO TEXTO LIVRE?
 * Logs em texto livre (ex: "[INFO] Reserva criada para quarto 101") são úteis
 * para leitura humana mas impossíveis de agregar. Um sistema de log moderno
 * (Loki, Elasticsearch, CloudWatch) consome JSON e permite:
 *   - Filtrar: WHERE service="reserva" AND level="error"
 *   - Agrupar: COUNT(*) GROUP BY error_code
 *   - Correlacionar: WHERE trace_id="abc123" (todos os logs de uma requisição)
 *
 * DECISÃO — NÍVEIS ADEQUADOS AO CONTEXTO:
 * - error:  Falhas inesperadas que precisam de ação imediata
 * - warn:   Situações degradadas mas recuperáveis (RF18: quarto indisponível)
 * - info:   Eventos de negócio bem-sucedidos (reserva criada, hóspede cadastrado)
 * - debug:  Detalhes úteis em desenvolvimento (payloads, IDs intermediários)
 *
 * Em produção: LOG_LEVEL=info (sem debug)
 * Em desenvolvimento: LOG_LEVEL=debug
 * =============================================================================
 */

// ── Tipos ─────────────────────────────────────────────────────────────────────

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;      // ISO 8601 — parseável por qualquer ferramenta
  level: LogLevel;
  service: string;        // "quarto-service" | "hospede-service" | "reserva-service" | "http"
  message: string;        // Mensagem legível, sem dados variáveis (use fields para isso)
  trace_id?: string;      // Propaga pelo header X-Trace-Id da requisição HTTP
  duration_ms?: number;   // Latência da operação (presente em ops de negócio e HTTP)
  error_code?: string;    // Código de erro de negócio (ex: "QUARTO_INDISPONIVEL")
  [key: string]: unknown; // Campos extras tipados livremente (quartoId, hospedeId, etc.)
}

// ── Ordem dos níveis ──────────────────────────────────────────────────────────
const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0, info: 1, warn: 2, error: 3,
};

const CONFIGURED_LEVEL: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) ?? "info";

// ── Implementação ─────────────────────────────────────────────────────────────

function emit(level: LogLevel, entry: Omit<LogEntry, "timestamp" | "level">): void {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[CONFIGURED_LEVEL]) return;

  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    ...entry,
  };

  // DECISÃO — stdout vs stderr:
  // error → stderr (ferramentas de monitoramento capturam stderr separadamente)
  // demais → stdout
  const output = JSON.stringify(logEntry);
  if (level === "error") {
    process.stderr.write(output + "\n");
  } else {
    process.stdout.write(output + "\n");
  }
}

// ── Interface pública ─────────────────────────────────────────────────────────

export const logger = {
  debug: (msg: string, fields: Omit<LogEntry, "timestamp"|"level"|"message"> = {}) =>
    emit("debug", { message: msg, ...fields }),

  info: (msg: string, fields: Omit<LogEntry, "timestamp"|"level"|"message"> = {}) =>
    emit("info", { message: msg, ...fields }),

  warn: (msg: string, fields: Omit<LogEntry, "timestamp"|"level"|"message"> = {}) =>
    emit("warn", { message: msg, ...fields }),

  error: (msg: string, fields: Omit<LogEntry, "timestamp"|"level"|"message"> = {}) =>
    emit("error", { message: msg, ...fields }),
};

// ── Helper: cronômetro de latência ────────────────────────────────────────────

/**
 * Retorna uma função que, quando chamada, retorna os ms desde a criação.
 * Uso:
 *   const tick = startTimer()
 *   await doWork()
 *   logger.info("op concluída", { duration_ms: tick() })
 */
export function startTimer(): () => number {
  const start = process.hrtime.bigint();
  return () => Number(process.hrtime.bigint() - start) / 1_000_000;
}
