/**
 * =============================================================================
 * middleware.ts — Middleware Express para observabilidade HTTP
 *
 * DOIS MIDDLEWARES INDEPENDENTES:
 *
 * 1. requestLogger    — Gera um log estruturado por requisição HTTP.
 *                       Inclui: method, route, status, duration_ms, trace_id.
 *
 * 2. metricsMiddleware — Incrementa contadores e histogramas Prometheus
 *                        para cada requisição concluída.
 *
 * DECISÃO — SEPARAÇÃO DE RESPONSABILIDADES:
 * Logs e métricas têm destinos e consumidores diferentes.
 * Logs → Loki/Elasticsearch (consultas ad-hoc, debugging).
 * Métricas → Prometheus/Grafana (dashboards, alertas contínuos).
 * Misturar os dois no mesmo middleware criaria acoplamento desnecessário.
 *
 * DECISÃO — NORMALIZAÇÃO DA ROTA:
 * A URL real "/reservas/res_abc123_xyz" vira "/reservas/:id" antes de
 * ser usada como label de métrica. Sem normalização, cada ID único geraria
 * uma série de métrica separada — cardinality explosion no Prometheus.
 * =============================================================================
 */

import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import {
  httpRequestsTotal,
  httpRequestDurationSeconds,
} from "./metrics";
import { logger, startTimer } from "./logger";

// ── Normalização de rota ──────────────────────────────────────────────────────

/**
 * Converte URLs reais em padrões de rota normalizados.
 * Exemplos:
 *   /quartos/qrt_123_abc          → /quartos/:id
 *   /reservas/res_456/cancelar    → /reservas/:id/cancelar
 *   /hospedes/hosp_789            → /hospedes/:id
 *   /quartos                      → /quartos (inalterada)
 *   /health                       → /health (inalterada)
 *
 * DECISÃO: Regex conservadora — substitui apenas segmentos que parecem IDs
 * (contêm _ ou são longos) para não colapsar rotas legítimas como /quartos/101.
 */
function normalizarRota(url: string): string {
  // Remove query string
  const path = url.split("?")[0];
  // Substitui segmentos que parecem IDs gerados (contêm _ ou têm >8 chars alfanuméricos)
  return path.replace(/\/[a-z]+_[a-zA-Z0-9_]+/g, "/:id")
             .replace(/\/[a-f0-9]{8,}/g, "/:id");
}

// ── Middleware 1: Log por requisição ─────────────────────────────────────────

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Propaga ou gera o trace_id.
  // DECISÃO: Reutiliza o header X-Trace-Id se o API Gateway já injetou um.
  // Se não existir, gera um UUID para rastrear toda a cadeia desta requisição.
  const traceId =
    (req.headers["x-trace-id"] as string) ?? randomUUID().replace(/-/g, "").slice(0, 16);

  // Injeta no objeto req para que services downstream possam incluir nos logs
  (req as Request & { traceId: string }).traceId = traceId;
  // Devolve no response header para facilitar debugging de ponta a ponta
  res.setHeader("X-Trace-Id", traceId);

  const tick = startTimer();
  const route = normalizarRota(req.originalUrl);

  // Log da entrada da requisição (útil para ver requests que nunca chegaram a responder)
  logger.debug("request.received", {
    service: "http",
    trace_id: traceId,
    method: req.method,
    route,
    user_agent: req.headers["user-agent"],
  });

  // Hook no evento "finish" do response — só loga quando a resposta foi enviada
  res.on("finish", () => {
    const duration = tick();
    const statusCode = res.statusCode;
    const level =
      statusCode >= 500 ? "error" :
      statusCode >= 400 ? "warn"  : "info";

    logger[level]("request.completed", {
      service: "http",
      trace_id: traceId,
      method: req.method,
      route,
      status_code: statusCode,
      duration_ms: Math.round(duration),
      // Inclui content_length apenas quando presente (respostas com body)
      ...(res.getHeader("content-length") && {
        response_bytes: Number(res.getHeader("content-length")),
      }),
    });
  });

  next();
}

// ── Middleware 2: Métricas Prometheus ─────────────────────────────────────────

export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const tick = startTimer();
  const route = normalizarRota(req.originalUrl);

  res.on("finish", () => {
    const duration = tick() / 1000; // Prometheus usa segundos
    const labels = {
      method:      req.method,
      route,
      status_code: String(res.statusCode),
    };

    httpRequestsTotal.inc(labels);
    httpRequestDurationSeconds.observe(labels, duration);
  });

  next();
}

// ── Middleware 3: Endpoint /metrics ───────────────────────────────────────────

import { registry } from "./metrics";

/**
 * Handler Express para GET /metrics.
 *
 * DECISÃO — ACESSO RESTRITO:
 * Em produção, /metrics NÃO deve ser exposto publicamente.
 * Opções:
 *   a) Porta separada (ex: :9090) — Prometheus acessa internamente
 *   b) Header de autenticação (Bearer token)
 *   c) IP allowlist no Nginx
 *
 * Para simplicidade, este exemplo apenas expõe o endpoint.
 * A restrição deve ser implementada na camada de infraestrutura (Nginx/firewall).
 */
export async function metricsHandler(
  _req: Request,
  res: Response
): Promise<void> {
  res.set("Content-Type", registry.contentType);
  res.end(await registry.metrics());
}
