/**
 * =============================================================================
 * TESTES DE INTEGRAÇÃO — QuartoRepositoryMemoria
 *
 * DECISÃO — POR QUE TESTAR O REPOSITÓRIO SEPARADAMENTE?
 * O repositório em memória tem lógica própria (ordenação, busca, unicidade)
 * que merece validação independente do service.
 *
 * Esses testes garantem que o contrato IQuartoRepository é respeitado
 * pela implementação em memória — essencial para o Princípio de Liskov.
 *
 * Em um projeto real com Prisma, haveria testes de integração
 * equivalentes para o PrismaQuartoRepository contra um banco real.
 * =============================================================================
 */

import { QuartoRepositoryMemoria } from "../../repository";
import { umQuarto, quartosDeTeste } from "./fixtures/quarto.fixtures";
import { StatusQuarto } from "../../domain";

describe("QuartoRepositoryMemoria", () => {
  let repository: QuartoRepositoryMemoria;

  beforeEach(() => {
    repository = new QuartoRepositoryMemoria();
  });

  // ===========================================================================
  // salvar() e buscarPorId()
  // ===========================================================================

  describe("salvar() + buscarPorId()", () => {
    test("quarto salvo pode ser recuperado pelo ID", () => {
      // ARRANGE
      const quarto = umQuarto().comId("id_123").build();

      // ACT
      repository.salvar(quarto);
      const encontrado = repository.buscarPorId("id_123");

      // ASSERT
      expect(encontrado).toBeDefined();
      expect(encontrado?.id).toBe("id_123");
    });

    test("buscarPorId retorna undefined para ID inexistente", () => {
      const resultado = repository.buscarPorId("id_fantasma");
      expect(resultado).toBeUndefined();
    });
  });

  // ===========================================================================
  // buscarPorNumero()
  // ===========================================================================

  describe("buscarPorNumero()", () => {
    test("encontra quarto pelo número exato", () => {
      // ARRANGE
      repository.salvar(umQuarto().comNumero("201").build());

      // ACT
      const encontrado = repository.buscarPorNumero("201");

      // ASSERT
      expect(encontrado).toBeDefined();
      expect(encontrado?.numero).toBe("201");
    });

    test("retorna undefined para número inexistente", () => {
      const resultado = repository.buscarPorNumero("999");
      expect(resultado).toBeUndefined();
    });

    test("busca é case-sensitive (número '101' ≠ '101a')", () => {
      repository.salvar(umQuarto().comNumero("101").build());

      expect(repository.buscarPorNumero("101a")).toBeUndefined();
    });
  });

  // ===========================================================================
  // listarTodos() — ordenação
  // ===========================================================================

  describe("listarTodos() — ordenação numérica", () => {
    test("quartos são ordenados numericamente pelo número", () => {
      // ARRANGE — inserção em ordem embaralhada
      repository.salvar(umQuarto().comId("q3").comNumero("301").build());
      repository.salvar(umQuarto().comId("q1").comNumero("101").build());
      repository.salvar(umQuarto().comId("q2").comNumero("201").build());

      // ACT
      const lista = repository.listarTodos();

      // ASSERT — ordem crescente
      expect(lista[0].numero).toBe("101");
      expect(lista[1].numero).toBe("201");
      expect(lista[2].numero).toBe("301");
    });

    test("retorna lista vazia quando repositório está vazio", () => {
      expect(repository.listarTodos()).toEqual([]);
    });
  });

  // ===========================================================================
  // atualizar()
  // ===========================================================================

  describe("atualizar()", () => {
    test("quarto atualizado reflete o novo estado", () => {
      // ARRANGE
      const original = umQuarto().comId("id_upd").comStatus(StatusQuarto.LIVRE).build();
      repository.salvar(original);
      const atualizado = original.copiarCom({ status: StatusQuarto.OCUPADO });

      // ACT
      repository.atualizar(atualizado);

      // ASSERT
      const recuperado = repository.buscarPorId("id_upd");
      expect(recuperado?.status).toBe(StatusQuarto.OCUPADO);
    });

    test("lança erro ao tentar atualizar quarto inexistente", () => {
      // ARRANGE
      const quartoFantasma = umQuarto().comId("id_nao_existe").build();

      // ASSERT
      expect(() => repository.atualizar(quartoFantasma)).toThrow();
    });
  });

  // ===========================================================================
  // Inicialização com dados
  // ===========================================================================

  describe("Inicialização com dados pré-existentes", () => {
    test("repositório inicializado com quartos os contém desde o início", () => {
      // ARRANGE
      const q1 = quartosDeTeste.livre();
      const q2 = quartosDeTeste.ocupado();
      const repo = new QuartoRepositoryMemoria([q1, q2]);

      // ASSERT
      expect(repo.listarTodos()).toHaveLength(2);
      expect(repo.buscarPorId(q1.id)).toBeDefined();
      expect(repo.buscarPorId(q2.id)).toBeDefined();
    });
  });
});
