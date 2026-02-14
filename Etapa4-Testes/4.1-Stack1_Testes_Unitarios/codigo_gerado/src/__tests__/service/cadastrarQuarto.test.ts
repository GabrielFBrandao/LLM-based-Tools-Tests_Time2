/**
 * =============================================================================
 * TESTES UNITÁRIOS — QuartoService.cadastrarQuarto()
 *
 * COBERTURA PLANEJADA:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ FLUXO PRINCIPAL (FP)                                                    │
 * │   FP01 — Cadastro bem-sucedido com todos os campos                      │
 * │   FP02 — Status inicial é sempre LIVRE                                  │
 * │   FP03 — Número é trimado antes de persistir                            │
 * │   FP04 — Camas são criadas corretamente a partir dos tipos              │
 * │   FP05 — Múltiplos tipos de cama no mesmo quarto                        │
 * │   FP06 — Retorna o quarto salvo pelo repositório (não o criado)         │
 * │   FP07 — salvar() é chamado exatamente uma vez                          │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ REGRAS DE NEGÓCIO — Validações                                          │
 * │   RN01 — Número único: falha quando número já existe                    │
 * │   RN03 — Preço positivo: falha quando precoDiaria = 0                   │
 * │   RN03 — Preço positivo: falha quando precoDiaria < 0                   │
 * │   RN04 — Capacidade positiva: falha quando capacidade = 0               │
 * │   RN04 — Capacidade positiva: falha quando capacidade < 0               │
 * │   RN05 — Mínimo 1 cama: falha quando tiposCama é vazio                  │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ COMPORTAMENTO NEGATIVO — Não persiste em caso de erro                   │
 * │   NP01 — salvar() NÃO é chamado quando número já existe                 │
 * │   NP02 — salvar() NÃO é chamado quando preço é inválido                 │
 * │   NP03 — salvar() NÃO é chamado quando capacidade é inválida            │
 * │   NP04 — salvar() NÃO é chamado quando sem camas                        │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ COMODIDADES — Persistência correta de campos booleanos                  │
 * │   CM01 — Frigobar persiste como true/false                              │
 * │   CM02 — Café da manhã persiste como true/false                         │
 * │   CM03 — Ar-condicionado persiste como true/false                       │
 * │   CM04 — TV persiste como true/false                                    │
 * │   CM05 — Todos os campos false por padrão quando não informados         │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ TIPOS — Cadastro com cada TipoQuarto possível                           │
 * │   TP01 — Tipo BASICO                                                    │
 * │   TP02 — Tipo MODERNO                                                   │
 * │   TP03 — Tipo LUXO                                                      │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * ESTRATÉGIA DE MOCK:
 * Usamos MockQuartoRepository para isolar completamente o service.
 * O mock é configurado via métodos expressivos que documentam a intenção
 * de cada setup (ex: .numeroDiponivel(), .salvarRetornaEntrada()).
 *
 * PADRÃO AAA (Arrange-Act-Assert):
 * Cada teste segue estritamente o padrão:
 *   // ARRANGE — prepara o cenário
 *   // ACT     — executa a operação sob teste
 *   // ASSERT  — verifica o resultado
 * =============================================================================
 */

import { StatusQuarto, TipoCama, TipoQuarto } from "../../domain";
import { QuartoService } from "../../service";
import { umDtoCadastroValido, umQuarto } from "./fixtures/quarto.fixtures";
import { MockQuartoRepository } from "./fixtures/mock.repository";

// =============================================================================
// SETUP
// =============================================================================

describe("QuartoService — cadastrarQuarto()", () => {
  let mockRepository: MockQuartoRepository;
  let service: QuartoService;

  beforeEach(() => {
    /**
     * DECISÃO: beforeEach recria o mock e o service antes de CADA teste.
     * Isso garante isolamento total: um teste com erro não "contamina"
     * o estado de outros testes. Padrão "fresh fixture" do xUnit.
     */
    mockRepository = new MockQuartoRepository();
    service = new QuartoService(mockRepository);
  });

  // ===========================================================================
  // BLOCO: FLUXO PRINCIPAL
  // ===========================================================================

  describe("Fluxo Principal — cadastro bem-sucedido", () => {
    /**
     * DECISÃO: Configuração compartilhada do bloco dentro de beforeEach aninhado.
     * Os testes do fluxo principal compartilham o mesmo setup feliz ("happy path"),
     * evitando repetição sem perder a expressividade de cada asserção individual.
     */
    beforeEach(() => {
      mockRepository.numeroDiponivel().salvarRetornaEntrada();
    });

    test("FP01 — retorna sucesso=true com os dados do quarto criado", () => {
      // ARRANGE
      const dto = umDtoCadastroValido();

      // ACT
      const resultado = service.cadastrarQuarto(dto);

      // ASSERT
      expect(resultado.sucesso).toBe(true);
      if (resultado.sucesso) {
        expect(resultado.dados.numero).toBe(dto.numero);
        expect(resultado.dados.tipo).toBe(dto.tipo);
        expect(resultado.dados.precoDiaria).toBe(dto.precoDiaria);
        expect(resultado.dados.capacidade).toBe(dto.capacidade);
      }
    });

    test("FP02 — status inicial é sempre LIVRE, independente do DTO", () => {
      // ARRANGE
      const dto = umDtoCadastroValido();

      // ACT
      const resultado = service.cadastrarQuarto(dto);

      // ASSERT
      expect(resultado.sucesso).toBe(true);
      if (resultado.sucesso) {
        expect(resultado.dados.status).toBe(StatusQuarto.LIVRE);
      }
    });

    test("FP03 — número com espaços é trimado antes de persistir", () => {
      // ARRANGE
      const dto = { ...umDtoCadastroValido(), numero: "  205  " };

      // ACT
      const resultado = service.cadastrarQuarto(dto);

      // ASSERT
      expect(resultado.sucesso).toBe(true);
      if (resultado.sucesso) {
        expect(resultado.dados.numero).toBe("205");
        expect(resultado.dados.numero).not.toContain(" ");
      }
    });

    test("FP04 — camas são criadas com os tipos corretos do DTO", () => {
      // ARRANGE
      const dto = {
        ...umDtoCadastroValido(),
        tiposCama: [TipoCama.CASAL_QUEEN],
      };

      // ACT
      const resultado = service.cadastrarQuarto(dto);

      // ASSERT
      expect(resultado.sucesso).toBe(true);
      if (resultado.sucesso) {
        expect(resultado.dados.camas).toHaveLength(1);
        expect(resultado.dados.camas[0].tipo).toBe(TipoCama.CASAL_QUEEN);
      }
    });

    test("FP05 — suporta múltiplos tipos de cama no mesmo quarto", () => {
      // ARRANGE — quarto com 3 camas de tipos diferentes
      const tiposCama = [TipoCama.CASAL_KING, TipoCama.SOLTEIRO, TipoCama.CASAL_QUEEN];
      const dto = { ...umDtoCadastroValido(), tiposCama };

      // ACT
      const resultado = service.cadastrarQuarto(dto);

      // ASSERT
      expect(resultado.sucesso).toBe(true);
      if (resultado.sucesso) {
        expect(resultado.dados.camas).toHaveLength(3);

        const tiposCriados = resultado.dados.camas.map((c) => c.tipo);
        expect(tiposCriados).toContain(TipoCama.CASAL_KING);
        expect(tiposCriados).toContain(TipoCama.SOLTEIRO);
        expect(tiposCriados).toContain(TipoCama.CASAL_QUEEN);
      }
    });

    test("FP06 — retorna o quarto devolvido pelo repositório (não cria outro)", () => {
      // ARRANGE — mock retorna um quarto específico e verificável
      const quartoRetornadoPeloRepo = umQuarto().comId("id_retornado_repo").build();
      mockRepository.salvarSpy.mockReturnValue(quartoRetornadoPeloRepo);

      // ACT
      const resultado = service.cadastrarQuarto(umDtoCadastroValido());

      // ASSERT — o service usa o resultado do repositório, não cria o seu próprio
      expect(resultado.sucesso).toBe(true);
      if (resultado.sucesso) {
        expect(resultado.dados.id).toBe("id_retornado_repo");
      }
    });

    test("FP07 — salvar() é chamado exatamente uma vez com a entidade correta", () => {
      // ARRANGE
      const dto = umDtoCadastroValido();

      // ACT
      service.cadastrarQuarto(dto);

      // ASSERT — verifica o comportamento do colaborador (spy)
      expect(mockRepository.salvarSpy).toHaveBeenCalledTimes(1);
      const quartoPassadoAoSalvar = mockRepository.salvarSpy.mock.calls[0][0];
      expect(quartoPassadoAoSalvar.numero).toBe(dto.numero.trim());
      expect(quartoPassadoAoSalvar.tipo).toBe(dto.tipo);
    });
  });

  // ===========================================================================
  // BLOCO: REGRAS DE NEGÓCIO — RN01 (Número Único)
  // ===========================================================================

  describe("RN01 — Número do quarto deve ser único", () => {
    test("RN01-A — falha quando já existe quarto com o mesmo número", () => {
      // ARRANGE — repositório já contém o quarto com número "201"
      const quartoExistente = umQuarto().comNumero("201").build();
      mockRepository.numeroOcupadoPor(quartoExistente);

      // ACT
      const resultado = service.cadastrarQuarto({
        ...umDtoCadastroValido(),
        numero: "201",
      });

      // ASSERT
      expect(resultado.sucesso).toBe(false);
      if (!resultado.sucesso) {
        expect(resultado.erro).toContain("201");
        expect(resultado.erro.toLowerCase()).toMatch(/já existe/);
      }
    });

    test("RN01-B — mensagem de erro identifica o número conflitante", () => {
      // ARRANGE
      const quartoExistente = umQuarto().comNumero("PH01").build();
      mockRepository.numeroOcupadoPor(quartoExistente);

      // ACT
      const resultado = service.cadastrarQuarto({
        ...umDtoCadastroValido(),
        numero: "PH01",
      });

      // ASSERT — a mensagem deve mencionar o número para o usuário saber o que corrigir
      expect(resultado.sucesso).toBe(false);
      if (!resultado.sucesso) {
        expect(resultado.erro).toContain("PH01");
      }
    });
  });

  // ===========================================================================
  // BLOCO: REGRAS DE NEGÓCIO — RN03 (Preço)
  // ===========================================================================

  describe("RN03 — Preço por diária deve ser maior que zero", () => {
    beforeEach(() => {
      // Número sempre disponível para que o preço seja o único ponto de falha
      mockRepository.numeroDiponivel();
    });

    test("RN03-A — falha quando precoDiaria é zero", () => {
      // ARRANGE
      const dto = { ...umDtoCadastroValido(), precoDiaria: 0 };

      // ACT
      const resultado = service.cadastrarQuarto(dto);

      // ASSERT
      expect(resultado.sucesso).toBe(false);
      if (!resultado.sucesso) {
        expect(resultado.erro.toLowerCase()).toMatch(/preço/);
        expect(resultado.erro.toLowerCase()).toMatch(/maior que zero/);
      }
    });

    test("RN03-B — falha quando precoDiaria é negativo", () => {
      // ARRANGE
      const dto = { ...umDtoCadastroValido(), precoDiaria: -50 };

      // ACT
      const resultado = service.cadastrarQuarto(dto);

      // ASSERT
      expect(resultado.sucesso).toBe(false);
      if (!resultado.sucesso) {
        expect(resultado.erro.toLowerCase()).toMatch(/preço/);
      }
    });

    test("RN03-C — aceita precoDiaria = 0.01 (menor valor válido)", () => {
      // ARRANGE
      const dto = { ...umDtoCadastroValido(), precoDiaria: 0.01 };
      mockRepository.salvarRetornaEntrada();

      // ACT
      const resultado = service.cadastrarQuarto(dto);

      // ASSERT — valor mínimo positivo deve ser aceito
      expect(resultado.sucesso).toBe(true);
    });
  });

  // ===========================================================================
  // BLOCO: REGRAS DE NEGÓCIO — RN04 (Capacidade)
  // ===========================================================================

  describe("RN04 — Capacidade deve ser maior que zero", () => {
    beforeEach(() => {
      mockRepository.numeroDiponivel();
    });

    test("RN04-A — falha quando capacidade é zero", () => {
      // ARRANGE
      const dto = { ...umDtoCadastroValido(), capacidade: 0 };

      // ACT
      const resultado = service.cadastrarQuarto(dto);

      // ASSERT
      expect(resultado.sucesso).toBe(false);
      if (!resultado.sucesso) {
        expect(resultado.erro.toLowerCase()).toMatch(/capacidade/);
      }
    });

    test("RN04-B — falha quando capacidade é negativa", () => {
      // ARRANGE
      const dto = { ...umDtoCadastroValido(), capacidade: -1 };

      // ACT
      const resultado = service.cadastrarQuarto(dto);

      // ASSERT
      expect(resultado.sucesso).toBe(false);
      if (!resultado.sucesso) {
        expect(resultado.erro.toLowerCase()).toMatch(/capacidade/);
      }
    });

    test("RN04-C — aceita capacidade = 1 (mínimo válido)", () => {
      // ARRANGE
      const dto = { ...umDtoCadastroValido(), capacidade: 1 };
      mockRepository.salvarRetornaEntrada();

      // ACT
      const resultado = service.cadastrarQuarto(dto);

      // ASSERT
      expect(resultado.sucesso).toBe(true);
    });
  });

  // ===========================================================================
  // BLOCO: REGRAS DE NEGÓCIO — RN05 (Camas)
  // ===========================================================================

  describe("RN05 — Todo quarto deve ter pelo menos um tipo de cama", () => {
    beforeEach(() => {
      mockRepository.numeroDiponivel();
    });

    test("RN05-A — falha quando tiposCama é array vazio", () => {
      // ARRANGE
      const dto = { ...umDtoCadastroValido(), tiposCama: [] };

      // ACT
      const resultado = service.cadastrarQuarto(dto);

      // ASSERT
      expect(resultado.sucesso).toBe(false);
      if (!resultado.sucesso) {
        expect(resultado.erro.toLowerCase()).toMatch(/cama/);
      }
    });

    test("RN05-B — aceita quarto com cama tipo Solteiro", () => {
      // ARRANGE
      const dto = { ...umDtoCadastroValido(), tiposCama: [TipoCama.SOLTEIRO] };
      mockRepository.salvarRetornaEntrada();

      // ACT
      const resultado = service.cadastrarQuarto(dto);

      // ASSERT
      expect(resultado.sucesso).toBe(true);
      if (resultado.sucesso) {
        expect(resultado.dados.camas[0].tipo).toBe(TipoCama.SOLTEIRO);
      }
    });

    test("RN05-C — aceita quarto com cama tipo Casal King", () => {
      // ARRANGE
      const dto = { ...umDtoCadastroValido(), tiposCama: [TipoCama.CASAL_KING] };
      mockRepository.salvarRetornaEntrada();

      // ACT
      const resultado = service.cadastrarQuarto(dto);

      // ASSERT
      expect(resultado.sucesso).toBe(true);
    });
  });

  // ===========================================================================
  // BLOCO: COMPORTAMENTO NEGATIVO — Não persiste em caso de erro
  // ===========================================================================

  describe("Comportamento negativo — salvar() NÃO é chamado em caso de erro", () => {
    /**
     * DECISÃO: Verificar que o repositório NÃO é chamado em casos de erro
     * é tão importante quanto verificar o caso de sucesso.
     * Isso garante ausência de efeitos colaterais indesejados.
     */

    test("NP01 — não persiste quando número já existe", () => {
      // ARRANGE
      const quartoExistente = umQuarto().comNumero("201").build();
      mockRepository.numeroOcupadoPor(quartoExistente);

      // ACT
      service.cadastrarQuarto({ ...umDtoCadastroValido(), numero: "201" });

      // ASSERT — salvar jamais deve ser chamado
      expect(mockRepository.salvarSpy).not.toHaveBeenCalled();
    });

    test("NP02 — não persiste quando preço é inválido", () => {
      // ARRANGE
      mockRepository.numeroDiponivel();

      // ACT
      service.cadastrarQuarto({ ...umDtoCadastroValido(), precoDiaria: 0 });

      // ASSERT
      expect(mockRepository.salvarSpy).not.toHaveBeenCalled();
    });

    test("NP03 — não persiste quando capacidade é inválida", () => {
      // ARRANGE
      mockRepository.numeroDiponivel();

      // ACT
      service.cadastrarQuarto({ ...umDtoCadastroValido(), capacidade: 0 });

      // ASSERT
      expect(mockRepository.salvarSpy).not.toHaveBeenCalled();
    });

    test("NP04 — não persiste quando lista de camas está vazia", () => {
      // ARRANGE
      mockRepository.numeroDiponivel();

      // ACT
      service.cadastrarQuarto({ ...umDtoCadastroValido(), tiposCama: [] });

      // ASSERT
      expect(mockRepository.salvarSpy).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // BLOCO: COMODIDADES
  // ===========================================================================

  describe("Comodidades — persistência correta dos campos booleanos", () => {
    beforeEach(() => {
      mockRepository.numeroDiponivel().salvarRetornaEntrada();
    });

    test("CM01 — frigobar=true é preservado no quarto criado", () => {
      const resultado = service.cadastrarQuarto({
        ...umDtoCadastroValido(),
        temFrigobar: true,
      });
      expect(resultado.sucesso && resultado.dados.temFrigobar).toBe(true);
    });

    test("CM02 — frigobar=false é preservado no quarto criado", () => {
      const resultado = service.cadastrarQuarto({
        ...umDtoCadastroValido(),
        temFrigobar: false,
      });
      expect(resultado.sucesso && resultado.dados.temFrigobar).toBe(false);
    });

    test("CM03 — cafeDaManha=true é preservado no quarto criado", () => {
      const resultado = service.cadastrarQuarto({
        ...umDtoCadastroValido(),
        temCafeDaManha: true,
      });
      expect(resultado.sucesso && resultado.dados.temCafeDaManha).toBe(true);
    });

    test("CM04 — arCondicionado=true é preservado no quarto criado", () => {
      const resultado = service.cadastrarQuarto({
        ...umDtoCadastroValido(),
        temArCondicionado: true,
      });
      expect(resultado.sucesso && resultado.dados.temArCondicionado).toBe(true);
    });

    test("CM05 — tv=true é preservado no quarto criado", () => {
      const resultado = service.cadastrarQuarto({
        ...umDtoCadastroValido(),
        temTV: true,
      });
      expect(resultado.sucesso && resultado.dados.temTV).toBe(true);
    });

    test("CM06 — todos false quando nenhuma comodidade é selecionada", () => {
      const resultado = service.cadastrarQuarto({
        ...umDtoCadastroValido(),
        temFrigobar: false,
        temCafeDaManha: false,
        temArCondicionado: false,
        temTV: false,
      });
      expect(resultado.sucesso).toBe(true);
      if (resultado.sucesso) {
        expect(resultado.dados.temFrigobar).toBe(false);
        expect(resultado.dados.temCafeDaManha).toBe(false);
        expect(resultado.dados.temArCondicionado).toBe(false);
        expect(resultado.dados.temTV).toBe(false);
        // Com todas comodidades false, a lista deve estar vazia
        expect(resultado.dados.comodidades).toHaveLength(0);
      }
    });
  });

  // ===========================================================================
  // BLOCO: TIPOS DE QUARTO
  // ===========================================================================

  describe("Tipos de quarto — aceita todos os TipoQuarto válidos", () => {
    beforeEach(() => {
      mockRepository.numeroDiponivel().salvarRetornaEntrada();
    });

    test.each([
      ["TP01", TipoQuarto.BASICO],
      ["TP02", TipoQuarto.MODERNO],
      ["TP03", TipoQuarto.LUXO],
    ])("%s — cadastra com sucesso tipo %s", (_id, tipo) => {
      // ARRANGE
      const dto = { ...umDtoCadastroValido(), tipo };

      // ACT
      const resultado = service.cadastrarQuarto(dto);

      // ASSERT
      expect(resultado.sucesso).toBe(true);
      if (resultado.sucesso) {
        expect(resultado.dados.tipo).toBe(tipo);
      }
    });
  });

  // ===========================================================================
  // BLOCO: IDENTIFICADORES — Quarto recebe ID único
  // ===========================================================================

  describe("Identificadores — cada quarto recebe ID único", () => {
    test("dois quartos cadastrados têm IDs distintos", () => {
      // ARRANGE — repositório real em memória para este teste de integração leve
      const { QuartoRepositoryMemoria } = require("../../repository");
      const repoReal = new QuartoRepositoryMemoria();
      const serviceComRepo = new QuartoService(repoReal);

      const dto1 = umDtoCadastroValido();
      const dto2 = { ...umDtoCadastroValido(), numero: "202" }; // número diferente

      // ACT
      const r1 = serviceComRepo.cadastrarQuarto(dto1);
      const r2 = serviceComRepo.cadastrarQuarto(dto2);

      // ASSERT
      expect(r1.sucesso).toBe(true);
      expect(r2.sucesso).toBe(true);
      if (r1.sucesso && r2.sucesso) {
        expect(r1.dados.id).not.toBe(r2.dados.id);
      }
    });
  });
});
