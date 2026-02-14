/**
 * =============================================================================
 * CAMADA DE REPOSITÓRIO
 *
 * Interface + Implementação em memória.
 * A interface IQuartoRepository é o contrato que o QuartoService depende.
 * Nos testes, tanto a implementação em memória quanto mocks manuais
 * podem ser usados — ambos respeitam o contrato (LSP).
 * =============================================================================
 */

import { Quarto } from "./domain";

// -----------------------------------------------------------------------------
// INTERFACE DO REPOSITÓRIO
// DECISÃO: Interface como contrato — permite trocar a implementação
// (memória → Prisma → qualquer outro) sem alterar o QuartoService.
// -----------------------------------------------------------------------------

export interface IQuartoRepository {
  listarTodos(): Quarto[];
  buscarPorId(id: string): Quarto | undefined;
  buscarPorNumero(numero: string): Quarto | undefined;
  salvar(quarto: Quarto): Quarto;
  atualizar(quarto: Quarto): Quarto;
}

// -----------------------------------------------------------------------------
// IMPLEMENTAÇÃO EM MEMÓRIA
// DECISÃO: Map<id, Quarto> para O(1) em buscas por ID.
// Usada em desenvolvimento e testes de integração simples.
// -----------------------------------------------------------------------------

export class QuartoRepositoryMemoria implements IQuartoRepository {
  private quartos: Map<string, Quarto>;

  constructor(dadosIniciais: Quarto[] = []) {
    this.quartos = new Map(dadosIniciais.map((q) => [q.id, q]));
  }

  listarTodos(): Quarto[] {
    return Array.from(this.quartos.values()).sort((a, b) =>
      a.numero.localeCompare(b.numero, "pt-BR", { numeric: true })
    );
  }

  buscarPorId(id: string): Quarto | undefined {
    return this.quartos.get(id);
  }

  buscarPorNumero(numero: string): Quarto | undefined {
    return Array.from(this.quartos.values()).find((q) => q.numero === numero);
  }

  salvar(quarto: Quarto): Quarto {
    this.quartos.set(quarto.id, quarto);
    return quarto;
  }

  atualizar(quarto: Quarto): Quarto {
    if (!this.quartos.has(quarto.id)) {
      throw new Error(`Quarto com ID ${quarto.id} não encontrado`);
    }
    this.quartos.set(quarto.id, quarto);
    return quarto;
  }

  /** Método auxiliar de teste: retorna quantidade de quartos no repositório */
  count(): number {
    return this.quartos.size;
  }

  /** Método auxiliar de teste: verifica se um quarto existe pelo ID */
  contemId(id: string): boolean {
    return this.quartos.has(id);
  }
}
