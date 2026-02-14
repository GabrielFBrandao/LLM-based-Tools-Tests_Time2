/**
 * =============================================================================
 * MOCK DO REPOSITÓRIO — para testes unitários do QuartoService
 *
 * DECISÃO — MOCK MANUAL vs jest.fn() INLINE:
 *
 * Poderíamos usar jest.fn() diretamente em cada teste:
 *   const repository = { buscarPorNumero: jest.fn().mockReturnValue(undefined), ... }
 *
 * Optamos por um mock centralizado por:
 * 1. Reutilização: todos os testes de service usam a mesma estrutura
 * 2. Legibilidade: os testes leem métodos expressivos em vez de .mockReturnValue()
 * 3. Verificação explícita: métodos como foidChamadoComNumero() tornam
 *    as asserções de comportamento mais claras
 * 4. Reset automático: beforeEach chama reset() sem precisar reconfiguramos
 *    cada mock individualmente
 *
 * DECISÃO — DOIS TIPOS DE MOCK:
 * - MockRepositorioVazio: simula repositório sem nenhum quarto
 *   → Usado nos testes de CADASTRO (sem colisões de número)
 * - MockRepositorioComDados: recebe quartos pré-configurados
 *   → Usado nos testes de EDIÇÃO e casos de número duplicado
 *
 * Ambos implementam IQuartoRepository — garantia do Liskov Substitution Principle.
 * =============================================================================
 */

import { Quarto } from "../../domain";
import { IQuartoRepository } from "../../repository";

// =============================================================================
// MOCK CONFIGURÁVEL — controla o comportamento de cada método
// =============================================================================

export class MockQuartoRepository implements IQuartoRepository {
  // Espias para verificar chamadas nos testes
  readonly salvarSpy = jest.fn<Quarto, [Quarto]>();
  readonly atualizarSpy = jest.fn<Quarto, [Quarto]>();
  readonly buscarPorIdSpy = jest.fn<Quarto | undefined, [string]>();
  readonly buscarPorNumeroSpy = jest.fn<Quarto | undefined, [string]>();
  readonly listarTodosSpy = jest.fn<Quarto[], []>();

  // Estado interno — permite que testes configurem o "banco" de forma declarativa
  private quartosNoRepositorio: Map<string, Quarto> = new Map();

  /** Pré-popula o mock com quartos conhecidos */
  configurarQuartos(quartos: Quarto[]): this {
    this.quartosNoRepositorio = new Map(quartos.map((q) => [q.id, q]));
    return this;
  }

  /** Faz buscarPorNumero retornar undefined (número disponível) */
  numeroDiponivel(): this {
    this.buscarPorNumeroSpy.mockReturnValue(undefined);
    return this;
  }

  /** Faz buscarPorNumero retornar um quarto existente (número ocupado) */
  numeroOcupadoPor(quarto: Quarto): this {
    this.buscarPorNumeroSpy.mockReturnValue(quarto);
    return this;
  }

  /** Faz salvar() retornar o mesmo quarto recebido (persistência trivial) */
  salvarRetornaEntrada(): this {
    this.salvarSpy.mockImplementation((q) => q);
    return this;
  }

  /** Faz atualizar() retornar o mesmo quarto recebido */
  atualizarRetornaEntrada(): this {
    this.atualizarSpy.mockImplementation((q) => q);
    return this;
  }

  /** Faz buscarPorId() retornar o quarto configurado */
  buscarPorIdRetorna(quarto: Quarto | undefined): this {
    this.buscarPorIdSpy.mockReturnValue(quarto);
    return this;
  }

  /** Reseta todos os spies entre testes */
  reset(): void {
    this.salvarSpy.mockReset();
    this.atualizarSpy.mockReset();
    this.buscarPorIdSpy.mockReset();
    this.buscarPorNumeroSpy.mockReset();
    this.listarTodosSpy.mockReset();
  }

  // ── Implementação da interface ──────────────────────────────────────────────

  listarTodos(): Quarto[] {
    if (this.listarTodosSpy.mock.calls.length > 0) {
      return this.listarTodosSpy() ?? [];
    }
    return Array.from(this.quartosNoRepositorio.values());
  }

  buscarPorId(id: string): Quarto | undefined {
    if (this.buscarPorIdSpy.getMockImplementation()) {
      return this.buscarPorIdSpy(id);
    }
    return this.quartosNoRepositorio.get(id);
  }

  buscarPorNumero(numero: string): Quarto | undefined {
    if (this.buscarPorNumeroSpy.getMockImplementation()) {
      return this.buscarPorNumeroSpy(numero);
    }
    return Array.from(this.quartosNoRepositorio.values()).find(
      (q) => q.numero === numero
    );
  }

  salvar(quarto: Quarto): Quarto {
    if (this.salvarSpy.getMockImplementation()) {
      return this.salvarSpy(quarto);
    }
    this.quartosNoRepositorio.set(quarto.id, quarto);
    return quarto;
  }

  atualizar(quarto: Quarto): Quarto {
    if (this.atualizarSpy.getMockImplementation()) {
      return this.atualizarSpy(quarto);
    }
    if (!this.quartosNoRepositorio.has(quarto.id)) {
      throw new Error(`Quarto com ID ${quarto.id} não encontrado`);
    }
    this.quartosNoRepositorio.set(quarto.id, quarto);
    return quarto;
  }

  // ── Helpers de asserção ────────────────────────────────────────────────────

  /** Verifica quantas vezes salvar() foi chamado */
  get vezesSalvo(): number {
    return this.salvarSpy.mock.calls.length;
  }

  /** Verifica quantas vezes atualizar() foi chamado */
  get vezesAtualizado(): number {
    return this.atualizarSpy.mock.calls.length;
  }

  /** Retorna o quarto passado para salvar() na última chamada */
  get quartoSalvo(): Quarto | undefined {
    const calls = this.salvarSpy.mock.calls;
    return calls.length > 0 ? calls[calls.length - 1][0] : undefined;
  }

  /** Retorna o quarto passado para atualizar() na última chamada */
  get quartoAtualizado(): Quarto | undefined {
    const calls = this.atualizarSpy.mock.calls;
    return calls.length > 0 ? calls[calls.length - 1][0] : undefined;
  }
}
