/**
 * =============================================================================
 * instrumented-services.ts — Serviços com observabilidade embutida
 *
 * PADRÃO APLICADO: Decorator/Wrapper
 *
 * Os serviços originais (QuartoService, HospedeService, ReservaService)
 * não são modificados — essa foi uma decisão deliberada na implementação
 * original (SRP, DIP). A instrumentação é adicionada em wrappers que:
 *
 *   1. Registram o início da operação (debug log)
 *   2. Delegam para o service real
 *   3. Registram o resultado com latência, trace_id e campos de negócio
 *   4. Incrementam a métrica correspondente
 *
 * DECISÃO — POR QUE NÃO INSTRUMENTAR DIRETAMENTE NOS SERVICES?
 * Observabilidade é uma preocupação transversal (cross-cutting concern).
 * Misturá-la com regras de negócio viola SRP e dificulta os testes
 * unitários (que testam apenas a lógica, não os logs/métricas).
 *
 * DECISÃO — MAPEAMENTO DE ERROS PARA ERROR_CODE:
 * O campo error_code é derivado da mensagem de erro de negócio.
 * Isso permite filtrar no Grafana por tipo de erro específico sem
 * depender de substring matching na mensagem.
 * =============================================================================
 */

import { Resultado, StatusQuarto } from "./domain";
import { QuartoService } from "./service";
import { HospedeService, ReservaService } from "./service.integration";
import { logger, startTimer } from "./logger";
import {
  quartoCadastroTotal,
  quartoEdicaoTotal,
  quartoAlteracaoStatusTotal,
  quartoStatusAtualTotal,
  hospedeCadastroTotal,
  hospedeAtivos,
  reservaCriacaoTotal,
  reservaCancelamentoTotal,
  reservasAtivasAtual,
  reservaDuracaoAteAtendimento,
} from "./metrics";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Extrai um error_code legível de máquina a partir da mensagem de erro.
 * Mantém um mapeamento explícito: mensagem → código.
 * Não usa heurísticas — explícito é melhor que implícito para alertas.
 */
function toErrorCode(erro: string): string {
  if (erro.includes("Já existe um quarto com o número"))   return "QUARTO_NUMERO_DUPLICADO";
  if (erro.includes("Já existe outro quarto com o número")) return "QUARTO_NUMERO_DUPLICADO";
  if (erro.includes("preço por diária"))                   return "QUARTO_PRECO_INVALIDO";
  if (erro.includes("capacidade"))                         return "QUARTO_CAPACIDADE_INVALIDA";
  if (erro.includes("pelo menos um tipo de cama"))         return "QUARTO_SEM_CAMA";
  if (erro.includes("Quarto não encontrado"))              return "QUARTO_NAO_ENCONTRADO";
  if (erro.includes("não está disponível"))                return "QUARTO_INDISPONIVEL";
  if (erro.includes("CPF deve ter"))                       return "HOSPEDE_CPF_INVALIDO";
  if (erro.includes("CPF"))                                return "HOSPEDE_CPF_DUPLICADO";
  if (erro.includes("Email inválido"))                     return "HOSPEDE_EMAIL_INVALIDO";
  if (erro.includes("Nome é obrigatório"))                 return "HOSPEDE_NOME_OBRIGATORIO";
  if (erro.includes("Sobrenome é obrigatório"))            return "HOSPEDE_SOBRENOME_OBRIGATORIO";
  if (erro.includes("Hóspede não encontrado"))             return "HOSPEDE_NAO_ENCONTRADO";
  if (erro.includes("Reserva não encontrada"))             return "RESERVA_NAO_ENCONTRADA";
  if (erro.includes("já está cancelada"))                  return "RESERVA_JA_CANCELADA";
  if (erro.includes("Motivo de cancelamento"))             return "RESERVA_MOTIVO_OBRIGATORIO";
  return "ERRO_DESCONHECIDO";
}

// =============================================================================
// WRAPPER — QuartoService
// =============================================================================

export class InstrumentedQuartoService {
  constructor(
    private readonly service: QuartoService,
    private readonly traceId?: string,
  ) {}

  cadastrarQuarto(dto: Parameters<QuartoService["cadastrarQuarto"]>[0]) {
    const tick = startTimer();

    logger.debug("quarto.cadastrar.inicio", {
      service: "quarto-service",
      trace_id: this.traceId,
      numero: dto.numero,
      tipo: dto.tipo,
    });

    const resultado = this.service.cadastrarQuarto(dto);
    const duration = tick();

    if (resultado.sucesso) {
      logger.info("quarto.cadastrar.sucesso", {
        service: "quarto-service",
        trace_id: this.traceId,
        quartoId: resultado.dados.id,
        numero: resultado.dados.numero,
        tipo: resultado.dados.tipo,
        duration_ms: Math.round(duration),
      });
      quartoCadastroTotal.inc({ resultado: "sucesso" });
      quartoStatusAtualTotal.inc({ status: StatusQuarto.LIVRE });
    } else {
      const code = toErrorCode(resultado.erro);
      logger.warn("quarto.cadastrar.falha", {
        service: "quarto-service",
        trace_id: this.traceId,
        error_code: code,
        error_message: resultado.erro,
        numero: dto.numero,
        duration_ms: Math.round(duration),
      });

      // Label granular para diferenciar tipos de falha no Grafana
      const labelResultado =
        code === "QUARTO_NUMERO_DUPLICADO" ? "falha_numero_duplicado" :
        code === "QUARTO_PRECO_INVALIDO"   ? "falha_preco_invalido"   :
        "falha_validacao";
      quartoCadastroTotal.inc({ resultado: labelResultado });
    }

    return resultado;
  }

  editarQuarto(id: string, dto: Parameters<QuartoService["editarQuarto"]>[1]) {
    const tick = startTimer();

    const resultado = this.service.editarQuarto(id, dto);
    const duration = tick();

    if (resultado.sucesso) {
      logger.info("quarto.editar.sucesso", {
        service: "quarto-service",
        trace_id: this.traceId,
        quartoId: id,
        duration_ms: Math.round(duration),
      });
      quartoEdicaoTotal.inc({ resultado: "sucesso" });
    } else {
      const code = toErrorCode(resultado.erro);
      logger.warn("quarto.editar.falha", {
        service: "quarto-service",
        trace_id: this.traceId,
        quartoId: id,
        error_code: code,
        error_message: resultado.erro,
        duration_ms: Math.round(duration),
      });
      quartoEdicaoTotal.inc({ resultado: "falha_" + code.toLowerCase() });
    }

    return resultado;
  }

  alterarStatus(id: string, novoStatus: StatusQuarto) {
    const quartoAntes = this.service.buscarPorId(id);
    const statusAnterior = quartoAntes?.status ?? "desconhecido";

    const resultado = this.service.alterarStatus(id, novoStatus);

    if (resultado.sucesso) {
      logger.info("quarto.status.alterado", {
        service: "quarto-service",
        trace_id: this.traceId,
        quartoId: id,
        de: statusAnterior,
        para: novoStatus,
      });
      // Transição explícita: de → para (útil para rastrear ciclos de uso)
      quartoAlteracaoStatusTotal.inc({ de: statusAnterior, para: novoStatus });
      quartoStatusAtualTotal.dec({ status: statusAnterior as StatusQuarto });
      quartoStatusAtualTotal.inc({ status: novoStatus });
    }

    return resultado;
  }

  listarQuartos() { return this.service.listarQuartos(); }
  buscarPorId(id: string) { return this.service.buscarPorId(id); }
}

// =============================================================================
// WRAPPER — HospedeService
// =============================================================================

export class InstrumentedHospedeService {
  constructor(
    private readonly service: HospedeService,
    private readonly traceId?: string,
  ) {}

  cadastrarHospede(dto: Parameters<HospedeService["cadastrarHospede"]>[0]) {
    const tick = startTimer();
    const resultado = this.service.cadastrarHospede(dto);
    const duration = tick();

    if (resultado.sucesso) {
      logger.info("hospede.cadastrar.sucesso", {
        service: "hospede-service",
        trace_id: this.traceId,
        hospedeId: resultado.dados.id,
        // DECISÃO: Não loga CPF completo — dado sensível (LGPD).
        // Loga apenas os 3 últimos dígitos para facilitar debugging sem expor PII.
        cpf_suffix: resultado.dados.cpf.slice(-3),
        duration_ms: Math.round(duration),
      });
      hospedeCadastroTotal.inc({ resultado: "sucesso" });
      hospedeAtivos.inc();
    } else {
      const code = toErrorCode(resultado.erro);
      logger.warn("hospede.cadastrar.falha", {
        service: "hospede-service",
        trace_id: this.traceId,
        error_code: code,
        // DECISÃO: Não loga o CPF tentado — evitar que CPFs apareçam em logs
        duration_ms: Math.round(duration),
      });
      const label =
        code === "HOSPEDE_CPF_DUPLICADO" ? "falha_cpf_duplicado" :
        code === "HOSPEDE_CPF_INVALIDO"  ? "falha_cpf_invalido"  :
        "falha_validacao";
      hospedeCadastroTotal.inc({ resultado: label });
    }

    return resultado;
  }

  editarHospede(id: string, dto: Parameters<HospedeService["editarHospede"]>[1]) {
    const resultado = this.service.editarHospede(id, dto);

    if (resultado.sucesso) {
      logger.info("hospede.editar.sucesso", {
        service: "hospede-service",
        trace_id: this.traceId,
        hospedeId: id,
      });
    } else {
      logger.warn("hospede.editar.falha", {
        service: "hospede-service",
        trace_id: this.traceId,
        hospedeId: id,
        error_code: toErrorCode(resultado.erro),
      });
    }

    return resultado;
  }

  buscarPorId(id: string) { return this.service.buscarPorId(id); }
  listarHospedes() { return this.service.listarHospedes(); }
}

// =============================================================================
// WRAPPER — ReservaService
// =============================================================================

export class InstrumentedReservaService {
  constructor(
    private readonly service: ReservaService,
    private readonly traceId?: string,
  ) {}

  criarReserva(dto: Parameters<ReservaService["criarReserva"]>[0]) {
    const tick = startTimer();

    logger.debug("reserva.criar.inicio", {
      service: "reserva-service",
      trace_id: this.traceId,
      quartoId: dto.quartoId,
      hospedeId: dto.hospedeId,
    });

    const resultado = this.service.criarReserva(dto);
    const duration = tick();

    if (resultado.sucesso) {
      logger.info("reserva.criar.sucesso", {
        service: "reserva-service",
        trace_id: this.traceId,
        reservaId: resultado.dados.id,
        quartoId: dto.quartoId,
        hospedeId: dto.hospedeId,
        duration_ms: Math.round(duration),
      });
      // NOTA: Esta operação faz 2 writes (reserva + status do quarto).
      // A latência aqui representa o custo real do fluxo crítico.
      reservaCriacaoTotal.inc({ resultado: "sucesso" });
      reservasAtivasAtual.inc();
      reservaDuracaoAteAtendimento.observe(duration / 1000);
    } else {
      const code = toErrorCode(resultado.erro);
      logger.warn("reserva.criar.falha", {
        service: "reserva-service",
        trace_id: this.traceId,
        quartoId: dto.quartoId,
        hospedeId: dto.hospedeId,
        error_code: code,
        error_message: resultado.erro,
        duration_ms: Math.round(duration),
      });

      const label =
        code === "QUARTO_INDISPONIVEL"      ? "falha_quarto_indisponivel"    :
        code === "QUARTO_NAO_ENCONTRADO"    ? "falha_quarto_inexistente"     :
        code === "HOSPEDE_NAO_ENCONTRADO"   ? "falha_hospede_inexistente"    :
        "falha_validacao";
      reservaCriacaoTotal.inc({ resultado: label });
    }

    return resultado;
  }

  cancelarReserva(
    id: string,
    dto: Parameters<ReservaService["cancelarReserva"]>[1]
  ) {
    const tick = startTimer();
    const resultado = this.service.cancelarReserva(id, dto);
    const duration = tick();

    if (resultado.sucesso) {
      logger.info("reserva.cancelar.sucesso", {
        service: "reserva-service",
        trace_id: this.traceId,
        reservaId: id,
        quartoId: resultado.dados.quartoId,
        duration_ms: Math.round(duration),
        // Não loga o motivo de cancelamento — pode conter dados do hóspede (LGPD)
      });
      reservaCancelamentoTotal.inc({ resultado: "sucesso" });
      reservasAtivasAtual.dec();
    } else {
      const code = toErrorCode(resultado.erro);
      logger.warn("reserva.cancelar.falha", {
        service: "reserva-service",
        trace_id: this.traceId,
        reservaId: id,
        error_code: code,
        duration_ms: Math.round(duration),
      });
      reservaCancelamentoTotal.inc({ resultado: "falha_" + code.toLowerCase() });
    }

    return resultado;
  }

  buscarPorId(id: string) { return this.service.buscarPorId(id); }
  listarPorQuarto(quartoId: string) { return this.service.listarPorQuarto(quartoId); }
  listarPorHospede(hospedeId: string) { return this.service.listarPorHospede(hospedeId); }
}
