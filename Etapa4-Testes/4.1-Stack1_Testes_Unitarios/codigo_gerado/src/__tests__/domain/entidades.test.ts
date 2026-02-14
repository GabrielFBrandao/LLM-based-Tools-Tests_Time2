/**
 * =============================================================================
 * TESTES UNITÁRIOS — Entidades de Domínio (Quarto e Cama)
 *
 * DECISÃO — POR QUE TESTAR AS ENTIDADES?
 * As entidades contêm lógica de negócio embutida (getters computados,
 * copiarCom, estaDisponivel). Essa lógica deve ser testada independentemente
 * do service para garantir que os invariantes do domínio são respeitados.
 *
 * Testes de entidade são os mais rápidos e estáveis de toda a suíte —
 * não dependem de mocks, repositórios ou frameworks.
 *
 * COBERTURA:
 * - Quarto.copiarCom() — preservação de campos e imutabilidade
 * - Quarto.estaDisponivel — getter computado com base no status
 * - Quarto.comodidades — getter que filtra campos booleanos
 * - Quarto.precoFormatado — formatação monetária pt-BR
 * - Cama — construção e factory method
 * =============================================================================
 */

import { Cama, Quarto, StatusQuarto, TipoCama, TipoQuarto } from "../../domain";
import { umQuarto } from "./fixtures/quarto.fixtures";

// =============================================================================
// TESTES — Entidade Quarto
// =============================================================================

describe("Entidade Quarto", () => {
  // ===========================================================================
  // copiarCom()
  // ===========================================================================

  describe("copiarCom() — imutabilidade e preservação de campos", () => {
    test("retorna nova instância com o campo alterado", () => {
      // ARRANGE
      const original = umQuarto().comPreco(200).build();

      // ACT
      const copia = original.copiarCom({ precoDiaria: 350 });

      // ASSERT — novo objeto com o campo alterado
      expect(copia.precoDiaria).toBe(350);
    });

    test("preserva o ID ao copiar — identidade de negócio mantida", () => {
      // ARRANGE
      const original = umQuarto().comId("id_fixo").build();

      // ACT
      const copia = original.copiarCom({ precoDiaria: 400 });

      // ASSERT
      expect(copia.id).toBe("id_fixo");
    });

    test("não muta o objeto original", () => {
      // ARRANGE
      const original = umQuarto().comPreco(200).comTipo(TipoQuarto.BASICO).build();

      // ACT
      original.copiarCom({ precoDiaria: 999, tipo: TipoQuarto.LUXO });

      // ASSERT — original inalterado
      expect(original.precoDiaria).toBe(200);
      expect(original.tipo).toBe(TipoQuarto.BASICO);
    });

    test("retorna instância diferente do original (referência nova)", () => {
      // ARRANGE
      const original = umQuarto().build();

      // ACT
      const copia = original.copiarCom({ precoDiaria: 300 });

      // ASSERT — não é o mesmo objeto em memória
      expect(copia).not.toBe(original);
    });

    test("preserva todos os campos não mencionados na cópia", () => {
      // ARRANGE
      const original = umQuarto()
        .comNumero("101")
        .comCapacidade(3)
        .comTipo(TipoQuarto.MODERNO)
        .comPreco(280)
        .comFrigobar(true)
        .comTV(true)
        .comStatus(StatusQuarto.LIMPEZA)
        .build();

      // ACT — altera apenas o preço
      const copia = original.copiarCom({ precoDiaria: 300 });

      // ASSERT — tudo mais preservado
      expect(copia.numero).toBe("101");
      expect(copia.capacidade).toBe(3);
      expect(copia.tipo).toBe(TipoQuarto.MODERNO);
      expect(copia.temFrigobar).toBe(true);
      expect(copia.temTV).toBe(true);
      expect(copia.status).toBe(StatusQuarto.LIMPEZA);
    });

    test("permite alterar status via copiarCom", () => {
      // ARRANGE
      const original = umQuarto().comStatus(StatusQuarto.LIVRE).build();

      // ACT
      const quartoOcupado = original.copiarCom({ status: StatusQuarto.OCUPADO });

      // ASSERT
      expect(quartoOcupado.status).toBe(StatusQuarto.OCUPADO);
      expect(original.status).toBe(StatusQuarto.LIVRE); // original intacto
    });

    test("permite alterar camas via copiarCom", () => {
      // ARRANGE
      const original = umQuarto()
        .comCamas([TipoCama.SOLTEIRO])
        .build();
      const novasCamas = [new Cama(TipoCama.CASAL_KING, "ck1"), new Cama(TipoCama.CASAL_QUEEN, "cq1")];

      // ACT
      const copia = original.copiarCom({ camas: novasCamas });

      // ASSERT
      expect(copia.camas).toHaveLength(2);
      expect(original.camas).toHaveLength(1); // original intacto
    });
  });

  // ===========================================================================
  // estaDisponivel
  // ===========================================================================

  describe("estaDisponivel — regra RF18", () => {
    test.each([
      [StatusQuarto.LIVRE, true],
      [StatusQuarto.OCUPADO, false],
      [StatusQuarto.MANUTENCAO, false],
      [StatusQuarto.LIMPEZA, false],
    ])(
      "status %s → estaDisponivel = %s",
      (status, esperado) => {
        // ARRANGE
        const quarto = umQuarto().comStatus(status).build();

        // ASSERT
        expect(quarto.estaDisponivel).toBe(esperado);
      }
    );
  });

  // ===========================================================================
  // comodidades
  // ===========================================================================

  describe("comodidades — getter que lista comodidades ativas", () => {
    test("retorna lista vazia quando nenhuma comodidade está ativa", () => {
      // ARRANGE
      const quarto = new Quarto({
        numero: "100",
        capacidade: 1,
        tipo: TipoQuarto.BASICO,
        precoDiaria: 100,
        temFrigobar: false,
        temCafeDaManha: false,
        temArCondicionado: false,
        temTV: false,
        camas: [new Cama(TipoCama.SOLTEIRO)],
      });

      // ASSERT
      expect(quarto.comodidades).toEqual([]);
    });

    test("retorna todas as comodidades quando todas estão ativas", () => {
      // ARRANGE
      const quarto = new Quarto({
        numero: "999",
        capacidade: 4,
        tipo: TipoQuarto.LUXO,
        precoDiaria: 800,
        temFrigobar: true,
        temCafeDaManha: true,
        temArCondicionado: true,
        temTV: true,
        camas: [new Cama(TipoCama.CASAL_KING)],
      });

      // ASSERT
      expect(quarto.comodidades).toHaveLength(4);
      expect(quarto.comodidades).toContain("Frigobar");
      expect(quarto.comodidades).toContain("Café da manhã");
      expect(quarto.comodidades).toContain("Ar-condicionado");
      expect(quarto.comodidades).toContain("TV");
    });

    test("retorna apenas as comodidades ativas", () => {
      // ARRANGE — apenas TV e Ar-condicionado ativos
      const quarto = umQuarto()
        .comFrigobar(false)
        .comCafeDaManha(false)
        .comArCondicionado(true)
        .comTV(true)
        .build();

      // ASSERT
      expect(quarto.comodidades).toHaveLength(2);
      expect(quarto.comodidades).toContain("Ar-condicionado");
      expect(quarto.comodidades).toContain("TV");
      expect(quarto.comodidades).not.toContain("Frigobar");
      expect(quarto.comodidades).not.toContain("Café da manhã");
    });
  });

  // ===========================================================================
  // precoFormatado
  // ===========================================================================

  describe("precoFormatado — formatação monetária pt-BR", () => {
    test("formata como moeda brasileira com símbolo R$", () => {
      // ARRANGE
      const quarto = umQuarto().comPreco(250).build();

      // ASSERT — deve conter R$ e o valor formatado
      expect(quarto.precoFormatado).toContain("R$");
      expect(quarto.precoFormatado).toContain("250");
    });

    test("formata valores com casas decimais", () => {
      // ARRANGE
      const quarto = umQuarto().comPreco(99.90).build();

      // ASSERT
      expect(quarto.precoFormatado).toContain("99");
    });
  });

  // ===========================================================================
  // Status padrão
  // ===========================================================================

  describe("Status padrão ao criar sem status explícito", () => {
    test("status inicial é LIVRE quando não informado", () => {
      // ARRANGE — construtor sem status
      const quarto = new Quarto({
        numero: "500",
        capacidade: 2,
        tipo: TipoQuarto.MODERNO,
        precoDiaria: 200,
        camas: [new Cama(TipoCama.CASAL_QUEEN)],
      });

      // ASSERT
      expect(quarto.status).toBe(StatusQuarto.LIVRE);
    });
  });
});

// =============================================================================
// TESTES — Value Object Cama
// =============================================================================

describe("Value Object Cama", () => {
  test("construtor cria cama com tipo correto", () => {
    const cama = new Cama(TipoCama.CASAL_KING);
    expect(cama.tipo).toBe(TipoCama.CASAL_KING);
  });

  test("construtor gera ID único quando não fornecido", () => {
    const cama1 = new Cama(TipoCama.SOLTEIRO);
    const cama2 = new Cama(TipoCama.SOLTEIRO);

    // IDs devem ser distintos mesmo com mesmo tipo
    expect(cama1.id).not.toBe(cama2.id);
  });

  test("construtor usa ID fornecido quando passado explicitamente", () => {
    const cama = new Cama(TipoCama.CASAL_QUEEN, "id_fixo_123");
    expect(cama.id).toBe("id_fixo_123");
  });

  test("fromData reconstrói cama a partir de dados brutos", () => {
    // ARRANGE
    const dados = { id: "cama_stored_001", tipo: TipoCama.CASAL_KING };

    // ACT
    const cama = Cama.fromData(dados);

    // ASSERT
    expect(cama.id).toBe("cama_stored_001");
    expect(cama.tipo).toBe(TipoCama.CASAL_KING);
  });

  test("cama é imutável — tipo e id são readonly", () => {
    const cama = new Cama(TipoCama.SOLTEIRO, "cama_001");

    // TypeScript previne mutação em compile-time.
    // Verificamos que os valores existem e são os esperados.
    expect(cama.tipo).toBe(TipoCama.SOLTEIRO);
    expect(cama.id).toBe("cama_001");
  });

  test.each([
    [TipoCama.SOLTEIRO],
    [TipoCama.CASAL_QUEEN],
    [TipoCama.CASAL_KING],
  ])("cria cama com tipo %s", (tipo) => {
    const cama = new Cama(tipo);
    expect(cama.tipo).toBe(tipo);
  });
});
