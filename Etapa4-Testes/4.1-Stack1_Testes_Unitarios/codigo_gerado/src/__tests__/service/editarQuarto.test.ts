/**
 * =============================================================================
 * TESTES UNITÁRIOS — QuartoService.editarQuarto()
 *
 * COBERTURA PLANEJADA:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ FLUXO PRINCIPAL (FP)                                                    │
 * │   FP01 — Edição bem-sucedida altera o tipo do quarto                   │
 * │   FP02 — Edição bem-sucedida altera o preço do quarto                  │
 * │   FP03 — Edição bem-sucedida altera o número do quarto                 │
 * │   FP04 — atualizar() é chamado exatamente uma vez                      │
 * │   FP05 — ID do quarto é preservado após edição (imutabilidade)         │
 * │   FP06 — Status é preservado após edição de campos não relacionados    │
 * │   FP07 — Retorna o quarto devolvido pelo repositório                   │
 * │   FP08 — Edição parcial: campos não enviados são preservados           │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ FLUXO ALTERNATIVO — Quarto não encontrado                               │
 * │   FA01 — Falha quando ID não existe no repositório                     │
 * │   FA02 — Mensagem de erro é descritiva                                  │
 * │   FA03 — atualizar() NÃO é chamado quando quarto não existe            │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ REGRAS DE NEGÓCIO — Validações na edição                               │
 * │   RN01-E — Falha ao mudar para número já usado por outro quarto        │
 * │   RN01-F — Permite manter o mesmo número (editar outros campos)        │
 * │   RN01-G — Permite mudar para número não usado                         │
 * │   RN03-E — Falha quando novo precoDiaria é zero                        │
 * │   RN03-F — Falha quando novo precoDiaria é negativo                    │
 * │   RN04-E — Falha quando nova capacidade é zero                         │
 * │   RN04-F — Falha quando nova capacidade é negativa                     │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ IMUTABILIDADE — copiarCom() gera nova instância                        │
 * │   IM01 — Quarto original não é mutado após edição                      │
 * │   IM02 — Quarto editado é uma instância diferente do original          │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ CAMAS — Atualização da lista de camas                                  │
 * │   CB01 — Camas são substituídas quando novo tiposCama é fornecido      │
 * │   CB02 — Camas são preservadas quando tiposCama não é fornecido        │
 * │   CB03 — Camas são preservadas quando tiposCama é array vazio          │
 * │   CB04 — Múltiplos tipos de cama na edição                             │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ COMODIDADES — Atualização seletiva de booleans                         │
 * │   CD01 — Habilitar frigobar que estava desabilitado                    │
 * │   CD02 — Desabilitar TV que estava habilitada                          │
 * │   CD03 — Demais comodidades são preservadas quando não fornecidas      │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * DIFERENÇA IMPORTANTE vs cadastrarQuarto:
 * editarQuarto exige que o quarto exista (buscarPorId) E valida dados.
 * Os testes cobrem ambas as dimensões (existência + validação).
 * =============================================================================
 */

import { StatusQuarto, TipoCama, TipoQuarto } from "../../domain";
import { QuartoService } from "../../service";
import { umDtoEdicaoValido, umQuarto } from "./fixtures/quarto.fixtures";
import { MockQuartoRepository } from "./fixtures/mock.repository";

// =============================================================================
// SETUP
// =============================================================================

describe("QuartoService — editarQuarto()", () => {
  let mockRepository: MockQuartoRepository;
  let service: QuartoService;

  /** Quarto pré-existente padrão para os cenários de edição */
  const QUARTO_ORIGINAL = umQuarto()
    .comId("qrt_para_editar")
    .comNumero("101")
    .comTipo(TipoQuarto.BASICO)
    .comPreco(180)
    .comCapacidade(2)
    .comCamas([TipoCama.CASAL_QUEEN])
    .comTV(true)
    .comArCondicionado(true)
    .build();

  beforeEach(() => {
    mockRepository = new MockQuartoRepository();
    service = new QuartoService(mockRepository);
  });

  // ===========================================================================
  // BLOCO: FLUXO PRINCIPAL
  // ===========================================================================

  describe("Fluxo Principal — edição bem-sucedida", () => {
    beforeEach(() => {
      /**
       * Setup padrão para o fluxo principal:
       * - buscarPorId retorna o quarto existente
       * - buscarPorNumero retorna undefined (número disponível para mudança)
       * - atualizar retorna o quarto passado
       */
      mockRepository
        .buscarPorIdRetorna(QUARTO_ORIGINAL)
        .numeroDiponivel()
        .atualizarRetornaEntrada();
    });

    test("FP01 — tipo é alterado com sucesso", () => {
      // ARRANGE
      const dto = { tipo: TipoQuarto.LUXO };

      // ACT
      const resultado = service.editarQuarto("qrt_para_editar", dto);

      // ASSERT
      expect(resultado.sucesso).toBe(true);
      if (resultado.sucesso) {
        expect(resultado.dados.tipo).toBe(TipoQuarto.LUXO);
      }
    });

    test("FP02 — preço é alterado com sucesso", () => {
      // ARRANGE
      const dto = { precoDiaria: 350 };

      // ACT
      const resultado = service.editarQuarto("qrt_para_editar", dto);

      // ASSERT
      expect(resultado.sucesso).toBe(true);
      if (resultado.sucesso) {
        expect(resultado.dados.precoDiaria).toBe(350);
      }
    });

    test("FP03 — número é alterado com sucesso quando disponível", () => {
      // ARRANGE
      const dto = { numero: "205" };

      // ACT
      const resultado = service.editarQuarto("qrt_para_editar", dto);

      // ASSERT
      expect(resultado.sucesso).toBe(true);
      if (resultado.sucesso) {
        expect(resultado.dados.numero).toBe("205");
      }
    });

    test("FP04 — atualizar() é chamado exatamente uma vez", () => {
      // ACT
      service.editarQuarto("qrt_para_editar", umDtoEdicaoValido());

      // ASSERT — verifica comportamento do colaborador
      expect(mockRepository.atualizarSpy).toHaveBeenCalledTimes(1);
    });

    test("FP05 — ID do quarto é preservado após edição (imutabilidade)", () => {
      // ARRANGE
      const dto = { tipo: TipoQuarto.MODERNO, precoDiaria: 250 };

      // ACT
      const resultado = service.editarQuarto("qrt_para_editar", dto);

      // ASSERT — o ID nunca muda, mesmo após múltiplas edições
      expect(resultado.sucesso).toBe(true);
      if (resultado.sucesso) {
        expect(resultado.dados.id).toBe("qrt_para_editar");
      }
    });

    test("FP06 — status é preservado quando não é campo da edição", () => {
      // ARRANGE — quarto com status OCUPADO; edição não menciona status
      const quartoOcupado = umQuarto()
        .comId("qrt_ocupado")
        .comStatus(StatusQuarto.OCUPADO)
        .build();
      mockRepository.buscarPorIdRetorna(quartoOcupado);

      // ACT — edita apenas o preço
      const resultado = service.editarQuarto("qrt_ocupado", { precoDiaria: 200 });

      // ASSERT — status OCUPADO é mantido
      expect(resultado.sucesso).toBe(true);
      if (resultado.sucesso) {
        expect(resultado.dados.status).toBe(StatusQuarto.OCUPADO);
      }
    });

    test("FP07 — retorna o quarto devolvido pelo repositório", () => {
      // ARRANGE — atualizar retorna um quarto específico e verificável
      const quartoRetornadoPeloRepo = umQuarto().comId("qrt_para_editar").comPreco(999).build();
      mockRepository.atualizarSpy.mockReturnValue(quartoRetornadoPeloRepo);

      // ACT
      const resultado = service.editarQuarto("qrt_para_editar", { precoDiaria: 999 });

      // ASSERT — service usa o resultado do repositório (não cria o seu próprio)
      expect(resultado.sucesso).toBe(true);
      if (resultado.sucesso) {
        expect(resultado.dados.precoDiaria).toBe(999);
      }
    });

    test("FP08 — edição parcial preserva todos os campos não fornecidos", () => {
      // ARRANGE — DTO com apenas um campo
      const dto = { tipo: TipoQuarto.MODERNO };

      // ACT
      const resultado = service.editarQuarto("qrt_para_editar", dto);

      // ASSERT — todos os outros campos do QUARTO_ORIGINAL são preservados
      expect(resultado.sucesso).toBe(true);
      if (resultado.sucesso) {
        expect(resultado.dados.numero).toBe(QUARTO_ORIGINAL.numero);    // preservado
        expect(resultado.dados.precoDiaria).toBe(QUARTO_ORIGINAL.precoDiaria); // preservado
        expect(resultado.dados.capacidade).toBe(QUARTO_ORIGINAL.capacidade);   // preservado
        expect(resultado.dados.tipo).toBe(TipoQuarto.MODERNO);                 // alterado
      }
    });
  });

  // ===========================================================================
  // BLOCO: FLUXO ALTERNATIVO — Quarto não encontrado
  // ===========================================================================

  describe("Fluxo Alternativo — quarto não existe no repositório", () => {
    beforeEach(() => {
      // buscarPorId retorna undefined — quarto não existe
      mockRepository.buscarPorIdRetorna(undefined);
    });

    test("FA01 — retorna sucesso=false quando ID não existe", () => {
      // ACT
      const resultado = service.editarQuarto("id_inexistente", { tipo: TipoQuarto.LUXO });

      // ASSERT
      expect(resultado.sucesso).toBe(false);
    });

    test("FA02 — mensagem de erro é descritiva sobre o problema", () => {
      // ACT
      const resultado = service.editarQuarto("id_fantasma", { precoDiaria: 100 });

      // ASSERT
      expect(resultado.sucesso).toBe(false);
      if (!resultado.sucesso) {
        expect(resultado.erro.toLowerCase()).toMatch(/não encontrado/);
      }
    });

    test("FA03 — atualizar() NÃO é chamado quando quarto não existe", () => {
      // ACT
      service.editarQuarto("id_inexistente", { tipo: TipoQuarto.MODERNO });

      // ASSERT — ausência de efeito colateral
      expect(mockRepository.atualizarSpy).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // BLOCO: RN01 — Unicidade de número na edição
  // ===========================================================================

  describe("RN01 — Unicidade do número na edição", () => {
    test("RN01-E — falha ao tentar mudar para número já usado por outro quarto", () => {
      // ARRANGE
      const outroQuarto = umQuarto().comId("outro_id").comNumero("102").build();
      mockRepository
        .buscarPorIdRetorna(QUARTO_ORIGINAL)
        .numeroOcupadoPor(outroQuarto); // "102" já existe

      // ACT — tenta mudar "101" → "102"
      const resultado = service.editarQuarto("qrt_para_editar", { numero: "102" });

      // ASSERT
      expect(resultado.sucesso).toBe(false);
      if (!resultado.sucesso) {
        expect(resultado.erro).toContain("102");
        expect(resultado.erro.toLowerCase()).toMatch(/já existe/);
      }
    });

    test("RN01-F — permite manter o mesmo número ao editar outros campos", () => {
      // ARRANGE — edição com o MESMO número já cadastrado (sem mudança de número)
      mockRepository
        .buscarPorIdRetorna(QUARTO_ORIGINAL)
        .atualizarRetornaEntrada();
      // buscarPorNumero NÃO é configurado — deve verificar que a regra
      // de unicidade não é acionada quando o número não mudou

      // ACT — edita apenas o preço, mantendo número "101"
      const resultado = service.editarQuarto("qrt_para_editar", {
        numero: "101", // mesmo número
        precoDiaria: 200,
      });

      // ASSERT — deve passar sem verificar duplicidade do número
      expect(resultado.sucesso).toBe(true);
      // buscarPorNumero não deve ser chamado quando o número não muda
      expect(mockRepository.buscarPorNumeroSpy).not.toHaveBeenCalled();
    });

    test("RN01-G — permite mudar para número livre", () => {
      // ARRANGE
      mockRepository
        .buscarPorIdRetorna(QUARTO_ORIGINAL)
        .numeroDiponivel()            // "105" está disponível
        .atualizarRetornaEntrada();

      // ACT
      const resultado = service.editarQuarto("qrt_para_editar", { numero: "105" });

      // ASSERT
      expect(resultado.sucesso).toBe(true);
      if (resultado.sucesso) {
        expect(resultado.dados.numero).toBe("105");
      }
    });

    test("RN01-H — número é trimado ao editar, assim como no cadastro", () => {
      // ARRANGE
      mockRepository
        .buscarPorIdRetorna(QUARTO_ORIGINAL)
        .numeroDiponivel()
        .atualizarRetornaEntrada();

      // ACT — número com espaços
      const resultado = service.editarQuarto("qrt_para_editar", { numero: "  109  " });

      // ASSERT
      expect(resultado.sucesso).toBe(true);
      if (resultado.sucesso) {
        expect(resultado.dados.numero).toBe("109");
        expect(resultado.dados.numero).not.toContain(" ");
      }
    });
  });

  // ===========================================================================
  // BLOCO: RN03 — Preço na edição
  // ===========================================================================

  describe("RN03 — Preço deve ser maior que zero na edição", () => {
    beforeEach(() => {
      mockRepository.buscarPorIdRetorna(QUARTO_ORIGINAL);
    });

    test("RN03-E — falha quando novo precoDiaria é zero", () => {
      // ACT
      const resultado = service.editarQuarto("qrt_para_editar", { precoDiaria: 0 });

      // ASSERT
      expect(resultado.sucesso).toBe(false);
      if (!resultado.sucesso) {
        expect(resultado.erro.toLowerCase()).toMatch(/preço/);
      }
    });

    test("RN03-F — falha quando novo precoDiaria é negativo", () => {
      // ACT
      const resultado = service.editarQuarto("qrt_para_editar", { precoDiaria: -100 });

      // ASSERT
      expect(resultado.sucesso).toBe(false);
    });

    test("RN03-G — preço undefined não dispara validação (campo não editado)", () => {
      // ARRANGE — edita apenas o tipo, não o preço
      mockRepository.atualizarRetornaEntrada();

      // ACT — precoDiaria não fornecido no DTO parcial
      const resultado = service.editarQuarto("qrt_para_editar", {
        tipo: TipoQuarto.MODERNO,
      });

      // ASSERT — deve passar (preço original é mantido)
      expect(resultado.sucesso).toBe(true);
    });
  });

  // ===========================================================================
  // BLOCO: RN04 — Capacidade na edição
  // ===========================================================================

  describe("RN04 — Capacidade deve ser maior que zero na edição", () => {
    beforeEach(() => {
      mockRepository.buscarPorIdRetorna(QUARTO_ORIGINAL);
    });

    test("RN04-E — falha quando nova capacidade é zero", () => {
      // ACT
      const resultado = service.editarQuarto("qrt_para_editar", { capacidade: 0 });

      // ASSERT
      expect(resultado.sucesso).toBe(false);
      if (!resultado.sucesso) {
        expect(resultado.erro.toLowerCase()).toMatch(/capacidade/);
      }
    });

    test("RN04-F — falha quando nova capacidade é negativa", () => {
      // ACT
      const resultado = service.editarQuarto("qrt_para_editar", { capacidade: -3 });

      // ASSERT
      expect(resultado.sucesso).toBe(false);
    });

    test("RN04-G — capacidade undefined não dispara validação (campo não editado)", () => {
      // ARRANGE
      mockRepository.atualizarRetornaEntrada();

      // ACT — capacidade não fornecida no DTO parcial
      const resultado = service.editarQuarto("qrt_para_editar", {
        precoDiaria: 300,
      });

      // ASSERT — deve passar (capacidade original é mantida)
      expect(resultado.sucesso).toBe(true);
    });
  });

  // ===========================================================================
  // BLOCO: IMUTABILIDADE
  // ===========================================================================

  describe("Imutabilidade — copiarCom() gera nova instância, nunca muta o original", () => {
    /**
     * DECISÃO: Testar imutabilidade é crítico para a arquitetura do sistema.
     * Se a entidade Quarto for mutada silenciosamente, o estado do React
     * não irá re-renderizar (pois a referência não mudou).
     *
     * Este teste usa o repositório real em memória para validar o fluxo completo.
     */

    test("IM01 — objeto original não é mutado após edição", () => {
      // ARRANGE — repositório real (não mock) para este teste de fluxo completo
      const { QuartoRepositoryMemoria } = require("../../repository");
      const repoReal = new QuartoRepositoryMemoria([QUARTO_ORIGINAL]);
      const serviceComRepo = new QuartoService(repoReal);

      const precoOriginal = QUARTO_ORIGINAL.precoDiaria;
      const tipoOriginal = QUARTO_ORIGINAL.tipo;

      // ACT — edita o quarto
      serviceComRepo.editarQuarto("qrt_para_editar", {
        precoDiaria: 999,
        tipo: TipoQuarto.LUXO,
      });

      // ASSERT — o objeto QUARTO_ORIGINAL não foi tocado
      expect(QUARTO_ORIGINAL.precoDiaria).toBe(precoOriginal);
      expect(QUARTO_ORIGINAL.tipo).toBe(tipoOriginal);
    });

    test("IM02 — quarto editado é referência diferente do original", () => {
      // ARRANGE
      const { QuartoRepositoryMemoria } = require("../../repository");
      const repoReal = new QuartoRepositoryMemoria([QUARTO_ORIGINAL]);
      const serviceComRepo = new QuartoService(repoReal);

      // ACT
      const resultado = serviceComRepo.editarQuarto("qrt_para_editar", {
        precoDiaria: 500,
      });

      // ASSERT
      expect(resultado.sucesso).toBe(true);
      if (resultado.sucesso) {
        // Instâncias diferentes (copiarCom criou um novo objeto)
        expect(resultado.dados).not.toBe(QUARTO_ORIGINAL);
        // Mas têm o mesmo ID (mesma identidade de negócio)
        expect(resultado.dados.id).toBe(QUARTO_ORIGINAL.id);
      }
    });
  });

  // ===========================================================================
  // BLOCO: CAMAS
  // ===========================================================================

  describe("Camas — atualização da lista na edição", () => {
    beforeEach(() => {
      mockRepository
        .buscarPorIdRetorna(QUARTO_ORIGINAL)
        .numeroDiponivel()
        .atualizarRetornaEntrada();
    });

    test("CB01 — camas são substituídas quando novo tiposCama é fornecido", () => {
      // ARRANGE — original tem CASAL_QUEEN; edição para CASAL_KING + SOLTEIRO
      const dto = { tiposCama: [TipoCama.CASAL_KING, TipoCama.SOLTEIRO] };

      // ACT
      const resultado = service.editarQuarto("qrt_para_editar", dto);

      // ASSERT
      expect(resultado.sucesso).toBe(true);
      if (resultado.sucesso) {
        expect(resultado.dados.camas).toHaveLength(2);
        const tipos = resultado.dados.camas.map((c) => c.tipo);
        expect(tipos).toContain(TipoCama.CASAL_KING);
        expect(tipos).toContain(TipoCama.SOLTEIRO);
        expect(tipos).not.toContain(TipoCama.CASAL_QUEEN); // substituída
      }
    });

    test("CB02 — camas são preservadas quando tiposCama não é fornecido", () => {
      // ARRANGE — DTO sem campo tiposCama
      const dto = { precoDiaria: 200 };

      // ACT
      const resultado = service.editarQuarto("qrt_para_editar", dto);

      // ASSERT — camas do original são mantidas
      expect(resultado.sucesso).toBe(true);
      if (resultado.sucesso) {
        expect(resultado.dados.camas).toHaveLength(QUARTO_ORIGINAL.camas.length);
        expect(resultado.dados.camas[0].tipo).toBe(TipoCama.CASAL_QUEEN);
      }
    });

    test("CB03 — camas são preservadas quando tiposCama é array vazio", () => {
      /**
       * DECISÃO DE DESIGN: Lista vazia significa "não alterar as camas",
       * NÃO "remover todas as camas" (o que violaria RN05).
       * Isso é documentado no service e verificado aqui.
       */
      const dto = { tiposCama: [] };

      // ACT
      const resultado = service.editarQuarto("qrt_para_editar", dto);

      // ASSERT — comportamento intencional: vazio não remove camas
      expect(resultado.sucesso).toBe(true);
      if (resultado.sucesso) {
        // Camas originais são preservadas (tiposCama vazio = não alterar)
        expect(resultado.dados.camas.length).toBeGreaterThan(0);
      }
    });

    test("CB04 — suporta três tipos de cama diferentes na edição", () => {
      // ARRANGE
      const dto = {
        tiposCama: [TipoCama.SOLTEIRO, TipoCama.CASAL_QUEEN, TipoCama.CASAL_KING],
      };

      // ACT
      const resultado = service.editarQuarto("qrt_para_editar", dto);

      // ASSERT
      expect(resultado.sucesso).toBe(true);
      if (resultado.sucesso) {
        expect(resultado.dados.camas).toHaveLength(3);
      }
    });
  });

  // ===========================================================================
  // BLOCO: COMODIDADES NA EDIÇÃO
  // ===========================================================================

  describe("Comodidades — atualização seletiva de booleans na edição", () => {
    beforeEach(() => {
      mockRepository
        .buscarPorIdRetorna(QUARTO_ORIGINAL)
        .numeroDiponivel()
        .atualizarRetornaEntrada();
    });

    test("CD01 — frigobar é habilitado na edição", () => {
      // ARRANGE — original tem frigobar=false
      const quartoSemFrigobar = umQuarto()
        .comId("qrt_sem_frigobar")
        .comNumero("301")
        .comFrigobar(false)
        .build();
      mockRepository.buscarPorIdRetorna(quartoSemFrigobar);

      // ACT
      const resultado = service.editarQuarto("qrt_sem_frigobar", { temFrigobar: true });

      // ASSERT
      expect(resultado.sucesso).toBe(true);
      if (resultado.sucesso) {
        expect(resultado.dados.temFrigobar).toBe(true);
      }
    });

    test("CD02 — TV é desabilitada na edição", () => {
      // ARRANGE — original tem TV=true (default no builder)
      const quartoComTV = umQuarto().comId("qrt_com_tv").comTV(true).build();
      mockRepository.buscarPorIdRetorna(quartoComTV);

      // ACT
      const resultado = service.editarQuarto("qrt_com_tv", { temTV: false });

      // ASSERT
      expect(resultado.sucesso).toBe(true);
      if (resultado.sucesso) {
        expect(resultado.dados.temTV).toBe(false);
      }
    });

    test("CD03 — comodidades não fornecidas no DTO são preservadas", () => {
      // ARRANGE — quarto com todas comodidades ativas
      const quartoComTudo = umQuarto()
        .comId("qrt_completo")
        .comFrigobar(true)
        .comCafeDaManha(true)
        .comArCondicionado(true)
        .comTV(true)
        .build();
      mockRepository.buscarPorIdRetorna(quartoComTudo);

      // ACT — edita apenas o tipo, comodidades não são mencionadas
      const resultado = service.editarQuarto("qrt_completo", { tipo: TipoQuarto.LUXO });

      // ASSERT — todas as comodidades preservadas
      expect(resultado.sucesso).toBe(true);
      if (resultado.sucesso) {
        expect(resultado.dados.temFrigobar).toBe(true);
        expect(resultado.dados.temCafeDaManha).toBe(true);
        expect(resultado.dados.temArCondicionado).toBe(true);
        expect(resultado.dados.temTV).toBe(true);
      }
    });
  });

  // ===========================================================================
  // BLOCO: COMPORTAMENTO NEGATIVO — Não persiste em caso de erro
  // ===========================================================================

  describe("Comportamento negativo — atualizar() NÃO é chamado em caso de erro", () => {
    test("NP05 — não persiste quando número já está em uso por outro quarto", () => {
      // ARRANGE
      const outroQuarto = umQuarto().comId("outro").comNumero("202").build();
      mockRepository
        .buscarPorIdRetorna(QUARTO_ORIGINAL)
        .numeroOcupadoPor(outroQuarto);

      // ACT
      service.editarQuarto("qrt_para_editar", { numero: "202" });

      // ASSERT
      expect(mockRepository.atualizarSpy).not.toHaveBeenCalled();
    });

    test("NP06 — não persiste quando preço é inválido", () => {
      // ARRANGE
      mockRepository.buscarPorIdRetorna(QUARTO_ORIGINAL);

      // ACT
      service.editarQuarto("qrt_para_editar", { precoDiaria: -50 });

      // ASSERT
      expect(mockRepository.atualizarSpy).not.toHaveBeenCalled();
    });

    test("NP07 — não persiste quando capacidade é inválida", () => {
      // ARRANGE
      mockRepository.buscarPorIdRetorna(QUARTO_ORIGINAL);

      // ACT
      service.editarQuarto("qrt_para_editar", { capacidade: 0 });

      // ASSERT
      expect(mockRepository.atualizarSpy).not.toHaveBeenCalled();
    });
  });
});
