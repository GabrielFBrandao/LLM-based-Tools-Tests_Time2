/**
 * =============================================================================
 * EXTENSÃO DO DOMÍNIO — Hóspede e Reserva
 *
 * Adicionado para suportar os testes de integração do fluxo:
 * Cadastro de Hóspede → Criação de Reserva → Atualização de Disponibilidade
 *
 * DECISÃO — POR QUE ESTENDER O DOMÍNIO AQUI E NÃO IMPORTAR DO REACT?
 * Os testes de integração testam a COLABORAÇÃO entre serviços.
 * Para isso, precisamos das entidades completas (Hospede, Reserva) com
 * o mesmo nível de rigor já aplicado a Quarto:
 * - Imutabilidade via readonly
 * - Resultado<T> para erros de negócio
 * - Injeção de dependência via repositórios
 * =============================================================================
 */

// ── Reexporta tudo do domain original para não quebrar imports existentes ──

export {
  TipoQuarto, StatusQuarto, TipoCama,
  Cama, Quarto,
  CriarQuartoDTO, EditarQuartoDTO,
  Resultado,
} from "./domain";

import { Resultado } from "./domain";

// =============================================================================
// ENTIDADE HÓSPEDE
// =============================================================================

/**
 * Regras de negócio encapsuladas:
 * - CPF armazenado sem máscara (apenas dígitos) — normalização no domínio
 * - Email normalizado para lowercase — evita duplicatas por casing
 * - Validações no Service (não na entidade) — entidade é estado já válido
 */
export class Hospede {
  readonly id: string;
  readonly nome: string;
  readonly sobrenome: string;
  readonly cpf: string;   // sempre 11 dígitos, sem máscara
  readonly email: string; // sempre lowercase

  constructor(params: {
    nome: string;
    sobrenome: string;
    cpf: string;
    email: string;
    id?: string;
  }) {
    this.nome = params.nome.trim();
    this.sobrenome = params.sobrenome.trim();
    this.cpf = params.cpf.replace(/\D/g, ""); // normaliza: remove não-dígitos
    this.email = params.email.toLowerCase().trim();
    this.id = params.id ?? `hosp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }

  get nomeCompleto(): string {
    return `${this.nome} ${this.sobrenome}`;
  }

  /** CPF formatado para exibição: 000.000.000-00 */
  get cpfFormatado(): string {
    return this.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
}

// DTOs de Hóspede
export interface CriarHospedeDTO {
  nome: string;
  sobrenome: string;
  cpf: string;
  email: string;
}

export type EditarHospedeDTO = Partial<Omit<CriarHospedeDTO, "cpf">>;

// =============================================================================
// ENTIDADE RESERVA
// =============================================================================

/**
 * Status de uma reserva ao longo do seu ciclo de vida.
 * DECISÃO: Enum separado de StatusQuarto — são conceitos ortogonais.
 * Uma reserva ATIVA corresponde ao quarto OCUPADO, mas são layers diferentes.
 */
export const StatusReserva = {
  ATIVA: "Ativa",
  CANCELADA: "Cancelada",
} as const;
export type StatusReserva = (typeof StatusReserva)[keyof typeof StatusReserva];

/**
 * Imutável — `cancelar()` retorna nova instância (mesma filosofia de Quarto).
 *
 * DECISÃO — SOFT DELETE:
 * Reservas canceladas são mantidas com status CANCELADA, nunca deletadas.
 * Preserva histórico de auditoria e rastreabilidade (RN27).
 *
 * DECISÃO — RELACIONAMENTO POR ID:
 * Reserva guarda quartoId e hospedeId (não referências diretas às entidades).
 * Isso respeita a separação entre agregados no DDD: cada agregado tem sua
 * própria fronteira de consistência e não navega diretamente pelo outro.
 */
export class Reserva {
  readonly id: string;
  readonly quartoId: string;
  readonly hospedeId: string;
  readonly status: StatusReserva;
  readonly criadaEm: Date;
  readonly canceladaEm: Date | null;
  readonly motivoCancelamento: string | null;

  constructor(params: {
    quartoId: string;
    hospedeId: string;
    id?: string;
    status?: StatusReserva;
    criadaEm?: Date;
    canceladaEm?: Date | null;
    motivoCancelamento?: string | null;
  }) {
    this.quartoId = params.quartoId;
    this.hospedeId = params.hospedeId;
    this.id = params.id ?? `res_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    this.status = params.status ?? StatusReserva.ATIVA;
    this.criadaEm = params.criadaEm ?? new Date();
    this.canceladaEm = params.canceladaEm ?? null;
    this.motivoCancelamento = params.motivoCancelamento ?? null;
  }

  get estaAtiva(): boolean {
    return this.status === StatusReserva.ATIVA;
  }

  /**
   * Cancela a reserva retornando nova instância imutável.
   * DECISÃO: Método de negócio explícito em vez de setter genérico —
   * garante que cancelamento sempre registra timestamp e motivo juntos.
   * Proteção contra duplo cancelamento embutida no domínio.
   */
  cancelar(motivo: string): Reserva {
    if (!this.estaAtiva) {
      throw new Error("Reserva já está cancelada — não é possível cancelar novamente.");
    }
    return new Reserva({
      id: this.id,
      quartoId: this.quartoId,
      hospedeId: this.hospedeId,
      status: StatusReserva.CANCELADA,
      criadaEm: this.criadaEm,
      canceladaEm: new Date(),
      motivoCancelamento: motivo,
    });
  }
}

// DTOs de Reserva
export interface CriarReservaDTO {
  quartoId: string;
  hospedeId: string;
}

export interface CancelarReservaDTO {
  motivo: string;
}
