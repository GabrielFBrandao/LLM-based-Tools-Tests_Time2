/**
 * =============================================================================
 * REPOSITÓRIOS — Hóspede e Reserva
 *
 * Mesma filosofia do QuartoRepository:
 * - Interface define o contrato (DIP)
 * - Implementação em memória usada nos testes (sem banco real)
 * - Implementação Prisma seria usada em produção sem alterar os serviços
 *
 * DECISÃO — REPOSITÓRIO POR AGREGADO:
 * Cada entidade raiz tem seu próprio repositório (ISP).
 * HospedeRepository não conhece Reserva; ReservaRepository não conhece Quarto.
 * A orquestração entre eles é responsabilidade dos Services e do UseCase.
 * =============================================================================
 */

import { Hospede, Reserva, StatusReserva } from "./domain.integration";

// =============================================================================
// REPOSITÓRIO DE HÓSPEDE
// =============================================================================

export interface IHospedeRepository {
  salvar(hospede: Hospede): Hospede;
  buscarPorId(id: string): Hospede | undefined;
  buscarPorCpf(cpf: string): Hospede | undefined;
  buscarPorEmail(email: string): Hospede | undefined;
  listarTodos(): Hospede[];
}

export class HospedeRepositoryMemoria implements IHospedeRepository {
  private hospedes: Map<string, Hospede>;

  constructor(dadosIniciais: Hospede[] = []) {
    this.hospedes = new Map(dadosIniciais.map((h) => [h.id, h]));
  }

  salvar(hospede: Hospede): Hospede {
    this.hospedes.set(hospede.id, hospede);
    return hospede;
  }

  buscarPorId(id: string): Hospede | undefined {
    return this.hospedes.get(id);
  }

  buscarPorCpf(cpf: string): Hospede | undefined {
    // Normaliza antes de comparar — garante busca por "123.456.789-00" ou "12345678900"
    const cpfNormalizado = cpf.replace(/\D/g, "");
    return Array.from(this.hospedes.values()).find((h) => h.cpf === cpfNormalizado);
  }

  buscarPorEmail(email: string): Hospede | undefined {
    return Array.from(this.hospedes.values()).find(
      (h) => h.email === email.toLowerCase().trim()
    );
  }

  listarTodos(): Hospede[] {
    return Array.from(this.hospedes.values()).sort((a, b) =>
      a.nomeCompleto.localeCompare(b.nomeCompleto, "pt-BR")
    );
  }

  count(): number { return this.hospedes.size; }
}

// =============================================================================
// REPOSITÓRIO DE RESERVA
// =============================================================================

export interface IReservaRepository {
  salvar(reserva: Reserva): Reserva;
  atualizar(reserva: Reserva): Reserva;
  buscarPorId(id: string): Reserva | undefined;
  listarPorQuarto(quartoId: string): Reserva[];
  listarPorHospede(hospedeId: string): Reserva[];
  temReservaAtivaPorQuarto(quartoId: string): boolean;
}

export class ReservaRepositoryMemoria implements IReservaRepository {
  private reservas: Map<string, Reserva>;

  constructor(dadosIniciais: Reserva[] = []) {
    this.reservas = new Map(dadosIniciais.map((r) => [r.id, r]));
  }

  salvar(reserva: Reserva): Reserva {
    this.reservas.set(reserva.id, reserva);
    return reserva;
  }

  atualizar(reserva: Reserva): Reserva {
    if (!this.reservas.has(reserva.id)) {
      throw new Error(`Reserva com ID ${reserva.id} não encontrada`);
    }
    this.reservas.set(reserva.id, reserva);
    return reserva;
  }

  buscarPorId(id: string): Reserva | undefined {
    return this.reservas.get(id);
  }

  listarPorQuarto(quartoId: string): Reserva[] {
    return Array.from(this.reservas.values()).filter(
      (r) => r.quartoId === quartoId
    );
  }

  listarPorHospede(hospedeId: string): Reserva[] {
    return Array.from(this.reservas.values()).filter(
      (r) => r.hospedeId === hospedeId
    );
  }

  /**
   * Verifica se existe reserva ativa para um quarto específico.
   * DECISÃO: Método de query especializado evita vazar lógica de negócio
   * ("tem reserva ativa?") para a camada de serviço.
   */
  temReservaAtivaPorQuarto(quartoId: string): boolean {
    return Array.from(this.reservas.values()).some(
      (r) => r.quartoId === quartoId && r.status === StatusReserva.ATIVA
    );
  }

  count(): number { return this.reservas.size; }
}
