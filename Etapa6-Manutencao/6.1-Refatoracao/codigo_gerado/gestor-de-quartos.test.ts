/**
 * =============================================================================
 * gestor-de-quartos.test.ts — Suite de testes para GestorDeQuartos refatorado
 *
 * ORGANIZAÇÃO:
 *   Cada bloco describe() mapeia para um dos 8 problemas corrigidos.
 *   O prefixo do nome do teste identifica o problema que cobre:
 *
 *     P1  — SQL Injection eliminado
 *     P2  — Tipagem forte (sem any)
 *     P3  — Encapsulamento (private readonly)
 *     P4  — Early return (sem pirâmide de if/else)
 *     P5  — Constante PRECO_MINIMO_DIARIA (sem magic number)
 *     P6  — Mensagens de erro descritivas
 *     P7  — Resultado<T> sem HTTP (sem status code no service)
 *     P8  — Delegação ao repositório (sem SQL raw)
 *
 * INFRAESTRUTURA:
 *   Reutiliza MockQuartoRepository e QuartoBuilder já existentes no sistema.
 *   Padrão AAA (Arrange-Act-Assert) em todos os testes.
 *   beforeEach recria mock e service — isolamento total entre testes.
 * =============================================================================
 */

import { StatusQuarto, TipoCama, TipoQuarto } from "../../domain";
import { GestorDeQuartos, PRECO_MINIMO_DIARIA } from "../../gestor-de-quartos";
import { MockQuartoRepository } from "./fixtures/mock.repository";
import { umDtoCadastroValido, umQuarto } from "./fixtures/quarto.fixtures";

// =============================================================================
// SETUP
// =============================================================================

describe("GestorDeQuartos — cadastrarQuarto() [versão refatorada]", () => {
  let mockRepository: MockQuartoRepository;
  let gestor: GestorDeQuartos;

  beforeEach(() => {
    mockRepository = new MockQuartoRepository();
    gestor = new GestorDeQuartos(mockRepository);
  });

  // ===========================================================================
  // BLOCO: FLUXO PRINCIPAL
  // Testa o caminho feliz — todas as validações passam, quarto é salvo.
  // ===========================================================================

  describe("Fluxo Principal", () => {
    beforeEach(() => {
      // Cenário feliz: número disponível, salvar() retorna o que recebe
      mockRepository.numeroDiponivel().salvarRetornaEntrada();
    });

    test("FP01 — retorna sucesso=true com os dados do quarto persistido", () => {
      // ARRANGE
      const dto = umDtoCadastroValido();

      // ACT
      const resultado = gestor.cadastrarQuarto(dto);

      // ASSERT
      expect(resultado.sucesso).toBe(true);
      if (resultado.sucesso) {
        expect(resultado.dados.numero).toBe(dto.numero);
        expect(resultado.dados.tipo).toBe(dto.tipo);
        expect(resultado.dados.precoDiaria).toBe(dto.precoDiaria);
        expect(resultado.dados.capacidade).toBe(dto.capacidade);
      }
    });

    test("FP02 — [P7] retorna Resultado<Quarto>, sem status HTTP no retorno", () => {
      // ARRANGE + ACT
      const resultado = gestor.cadastrarQuarto(umDtoCadastroValido());

      // ASSERT — o retorno tem 'sucesso' e 'dados', nunca 'status' ou 'msg'
      expect(resultado).toHaveProperty("sucesso");
      expect(resultado).not.toHaveProperty("status");  // HTTP fora do service
      expect(resultado).not.toHaveProperty("msg");
      if (resultado.sucesso) {
        expect(resultado.dados).toBeInstanceOf(Object);
      }
    });

    test("FP03 — status inicial do quarto é sempre LIVRE (pós-condição UC01)", () => {
      // ARRANGE + ACT
      const resultado = gestor.cadastrarQuarto(umDtoCadastroValido());

      // ASSERT — '0' (inteiro mágico do INSERT original) substituído por StatusQuarto.LIVRE
      expect(resultado.sucesso).toBe(true);
      if (resultado.sucesso) {
        expect(resultado.dados.status).toBe(StatusQuarto.LIVRE);
      }
    });

    test("FP04 — número com espaços é trimado antes de persistir", () => {
      // ARRANGE
      const dto = { ...umDtoCadastroValido(), numero: "  205  " };

      // ACT
      const resultado = gestor.cadastrarQuarto(dto);

      // ASSERT
      expect(resultado.sucesso).toBe(true);
      if (resultado.sucesso) {
        expect(resultado.dados.numero).toBe("205");
        expect(resultado.dados.numero).not.toContain(" ");
      }
    });

    test("FP05 — todos os campos do DTO são persistidos (não apenas 4 colunas)", () => {
      // ARRANGE — DTO com comodidades diversas
      const dto = {
        ...umDtoCadastroValido(),
        tipo: TipoQuarto.LUXO,
        temFrigobar: true,
        temCafeDaManha: true,
        temArCondicionado: false,
        temTV: true,
        tiposCama: [TipoCama.CASAL_KING, TipoCama.SOLTEIRO],
      };

      // ACT
      const resultado = gestor.cadastrarQuarto(dto);

      // ASSERT — o INSERT original perdia tipo, comodidades e camas silenciosamente
      expect(resultado.sucesso).toBe(true);
      if (resultado.sucesso) {
        expect(resultado.dados.tipo).toBe(TipoQuarto.LUXO);
        expect(resultado.dados.temFrigobar).toBe(true);
        expect(resultado.dados.temCafeDaManha).toBe(true);
        expect(resultado.dados.temArCondicionado).toBe(false);
        expect(resultado.dados.camas).toHaveLength(2);
      }
    });

    test("FP06 — [P8] salvar() do repositório é chamado exatamente uma vez", () => {
      // ACT
      gestor.cadastrarQuarto(umDtoCadastroValido());

      // ASSERT — o gestor delega ao repositório, não executa SQL diretamente
      expect(mockRepository.vezesSalvo).toBe(1);
    });

    test("FP07 — [P8] retorna o quarto devolvido pelo repositório (não cria outro)", () => {
      // ARRANGE — repositório retorna um quarto com ID específico
      const quartoDoRepo = umQuarto().comId("id_vindo_do_repo").build();
      mockRepository.salvarSpy.mockReturnValue(quartoDoRepo);

      // ACT
      const resultado = gestor.cadastrarQuarto(umDtoCadastroValido());

      // ASSERT — service usa o resultado do repositório, não constrói o seu próprio
      expect(resultado.sucesso).toBe(true);
      if (resultado.sucesso) {
        expect(resultado.dados.id).toBe("id_vindo_do_repo");
      }
    });
  });

  // ===========================================================================
  // BLOCO P4 + P6 — Validações com early return e mensagens descritivas
  // Testa que cada guarda retorna imediatamente com mensagem clara.
  // ===========================================================================

  describe("P4+P6 — Validações (early return + mensagens descritivas)", () => {

    test("VAL01 — número ausente retorna erro descritivo sem chamar repositório", () => {
      // ARRANGE
      const dto = { ...umDtoCadastroValido(), numero: "" };

      // ACT
      const resultado = gestor.cadastrarQuarto(dto);

      // ASSERT — mensagem útil, não "Sem número" ou "Vazio"
      expect(resultado.sucesso).toBe(false);
      if (!resultado.sucesso) {
        expect(resultado.erro).toMatch(/número do quarto é obrigatório/i);
      }
      // P4: retornou antes de consultar o repositório
      expect(mockRepository.buscarPorNumeroSpy).not.toHaveBeenCalled();
      expect(mockRepository.vezesSalvo).toBe(0);
    });

    test("VAL02 — número só com espaços é tratado como ausente", () => {
      // ARRANGE
      const dto = { ...umDtoCadastroValido(), numero: "   " };

      // ACT
      const resultado = gestor.cadastrarQuarto(dto);

      // ASSERT — trim() antes de validar captura este caso
      expect(resultado.sucesso).toBe(false);
      if (!resultado.sucesso) {
        expect(resultado.erro).toMatch(/número do quarto é obrigatório/i);
      }
    });

    test("VAL03 — capacidade zero retorna erro descritivo", () => {
      // ARRANGE
      const dto = { ...umDtoCadastroValido(), capacidade: 0 };

      // ACT
      const resultado = gestor.cadastrarQuarto(dto);

      // ASSERT — "Capacidade ruim" substituído por mensagem funcional
      expect(resultado.sucesso).toBe(false);
      if (!resultado.sucesso) {
        expect(resultado.erro).toMatch(/capacidade deve ser maior que zero/i);
      }
      expect(mockRepository.vezesSalvo).toBe(0);
    });

    test("VAL04 — capacidade negativa retorna erro descritivo", () => {
      // ARRANGE
      const dto = { ...umDtoCadastroValido(), capacidade: -1 };

      // ACT + ASSERT
      const resultado = gestor.cadastrarQuarto(dto);
      expect(resultado.sucesso).toBe(false);
      if (!resultado.sucesso) {
        expect(resultado.erro).toMatch(/capacidade deve ser maior que zero/i);
      }
    });

    test("VAL05 — [P5] preço abaixo do mínimo retorna erro com o valor mínimo na mensagem", () => {
      // ARRANGE — valor abaixo de PRECO_MINIMO_DIARIA (50)
      const dto = { ...umDtoCadastroValido(), precoDiaria: 49 };

      // ACT
      const resultado = gestor.cadastrarQuarto(dto);

      // ASSERT — mensagem referencia o valor mínimo (vem da constante, não hardcoded)
      expect(resultado.sucesso).toBe(false);
      if (!resultado.sucesso) {
        expect(resultado.erro).toContain(String(PRECO_MINIMO_DIARIA));
      }
      expect(mockRepository.vezesSalvo).toBe(0);
    });

    test("VAL06 — [P5] preço igual ao mínimo é aceito (limite inclusivo)", () => {
      // ARRANGE
      mockRepository.numeroDiponivel().salvarRetornaEntrada();
      const dto = { ...umDtoCadastroValido(), precoDiaria: PRECO_MINIMO_DIARIA };

      // ACT + ASSERT — o piso é >= 50, não > 50
      const resultado = gestor.cadastrarQuarto(dto);
      expect(resultado.sucesso).toBe(true);
    });

    test("VAL07 — sem tipos de cama retorna erro descritivo", () => {
      // ARRANGE
      const dto = { ...umDtoCadastroValido(), tiposCama: [] };

      // ACT
      const resultado = gestor.cadastrarQuarto(dto);

      // ASSERT
      expect(resultado.sucesso).toBe(false);
      if (!resultado.sucesso) {
        expect(resultado.erro).toMatch(/pelo menos um tipo de cama/i);
      }
      expect(mockRepository.vezesSalvo).toBe(0);
    });

    test("VAL08 — número duplicado retorna erro descritivo com o número na mensagem", () => {
      // ARRANGE — repositório já tem quarto com número "201"
      const quartoExistente = umQuarto().comNumero("201").build();
      mockRepository.numeroOcupadoPor(quartoExistente);
      const dto = { ...umDtoCadastroValido(), numero: "201" };

      // ACT
      const resultado = gestor.cadastrarQuarto(dto);

      // ASSERT — "Já existe" substituído por mensagem com contexto
      expect(resultado.sucesso).toBe(false);
      if (!resultado.sucesso) {
        expect(resultado.erro).toMatch(/já existe um quarto com o número/i);
        expect(resultado.erro).toContain("201");
      }
      // P4: retornou antes de tentar salvar
      expect(mockRepository.vezesSalvo).toBe(0);
    });
  });

  // ===========================================================================
  // BLOCO P4 — Verificação de NÃO execução de side effects em falha
  // Testa que nenhuma validação falha silenciosamente e persiste mesmo assim.
  // ===========================================================================

  describe("P4 — Nenhum side effect em falha de validação", () => {

    test("NP01 — falha de número não chama salvar()", () => {
      gestor.cadastrarQuarto({ ...umDtoCadastroValido(), numero: "" });
      expect(mockRepository.vezesSalvo).toBe(0);
    });

    test("NP02 — falha de capacidade não chama salvar()", () => {
      gestor.cadastrarQuarto({ ...umDtoCadastroValido(), capacidade: 0 });
      expect(mockRepository.vezesSalvo).toBe(0);
    });

    test("NP03 — falha de preço não chama salvar()", () => {
      gestor.cadastrarQuarto({ ...umDtoCadastroValido(), precoDiaria: 1 });
      expect(mockRepository.vezesSalvo).toBe(0);
    });

    test("NP04 — falha de duplicidade não chama salvar()", () => {
      mockRepository.numeroOcupadoPor(umQuarto().build());
      gestor.cadastrarQuarto(umDtoCadastroValido());
      expect(mockRepository.vezesSalvo).toBe(0);
    });
  });

  // ===========================================================================
  // BLOCO P5 — Constante PRECO_MINIMO_DIARIA
  // Testa o comportamento de limite nos dois lados.
  // ===========================================================================

  describe("P5 — Constante PRECO_MINIMO_DIARIA", () => {

    test("MIN01 — preço acima do mínimo é aceito", () => {
      mockRepository.numeroDiponivel().salvarRetornaEntrada();
      const dto = { ...umDtoCadastroValido(), precoDiaria: PRECO_MINIMO_DIARIA + 1 };
      expect(gestor.cadastrarQuarto(dto).sucesso).toBe(true);
    });

    test("MIN02 — preço abaixo do mínimo é rejeitado", () => {
      const dto = { ...umDtoCadastroValido(), precoDiaria: PRECO_MINIMO_DIARIA - 1 };
      expect(gestor.cadastrarQuarto(dto).sucesso).toBe(false);
    });

    test("MIN03 — PRECO_MINIMO_DIARIA é exportado — testável e documentado", () => {
      // A constante ser exportável permite que testes e clientes referenciem
      // o mesmo valor em vez de repetir '50' em múltiplos lugares.
      expect(typeof PRECO_MINIMO_DIARIA).toBe("number");
      expect(PRECO_MINIMO_DIARIA).toBeGreaterThan(0);
    });
  });

  // ===========================================================================
  // BLOCO P7 — Resultado<T> sem HTTP
  // Testa que nenhum retorno contém propriedades de HTTP.
  // ===========================================================================

  describe("P7 — Resultado<T> sem status HTTP", () => {

    test("HTTP01 — retorno de sucesso não contém 'status' nem 'msg'", () => {
      mockRepository.numeroDiponivel().salvarRetornaEntrada();
      const resultado = gestor.cadastrarQuarto(umDtoCadastroValido());

      expect(resultado).not.toHaveProperty("status");
      expect(resultado).not.toHaveProperty("msg");
      expect(resultado).toHaveProperty("sucesso", true);
      expect(resultado).toHaveProperty("dados");
    });

    test("HTTP02 — retorno de falha não contém 'status' nem 'msg'", () => {
      const resultado = gestor.cadastrarQuarto({ ...umDtoCadastroValido(), numero: "" });

      expect(resultado).not.toHaveProperty("status");
      expect(resultado).not.toHaveProperty("msg");
      expect(resultado).toHaveProperty("sucesso", false);
      expect(resultado).toHaveProperty("erro");
    });

    test("HTTP03 — 'erro' é string descritiva, não código HTTP", () => {
      const resultado = gestor.cadastrarQuarto({ ...umDtoCadastroValido(), capacidade: -5 });

      expect(resultado.sucesso).toBe(false);
      if (!resultado.sucesso) {
        // Mensagem de negócio, não "400" ou "Bad Request"
        expect(typeof resultado.erro).toBe("string");
        expect(resultado.erro).not.toMatch(/^\d{3}$/);
        expect(resultado.erro.length).toBeGreaterThan(10);
      }
    });
  });

  // ===========================================================================
  // BLOCO P8 — Delegação ao repositório
  // Testa que o gestor não executa lógica de persistência diretamente.
  // ===========================================================================

  describe("P8 — Delegação ao repositório (sem SQL raw)", () => {

    test("REP01 — buscarPorNumero() é chamado com o número trimado", () => {
      mockRepository.numeroDiponivel().salvarRetornaEntrada();
      const dto = { ...umDtoCadastroValido(), numero: "  301  " };

      gestor.cadastrarQuarto(dto);

      // O número passado ao repositório deve ser "301", não "  301  "
      expect(mockRepository.buscarPorNumeroSpy).toHaveBeenCalledWith("301");
    });

    test("REP02 — salvar() recebe entidade Quarto com status LIVRE", () => {
      mockRepository.numeroDiponivel().salvarRetornaEntrada();

      gestor.cadastrarQuarto(umDtoCadastroValido());

      const quartoRecebido = mockRepository.quartoSalvo;
      expect(quartoRecebido).toBeDefined();
      expect(quartoRecebido!.status).toBe(StatusQuarto.LIVRE);
    });

    test("REP03 — salvar() recebe entidade Quarto com camas corretas", () => {
      mockRepository.numeroDiponivel().salvarRetornaEntrada();
      const dto = {
        ...umDtoCadastroValido(),
        tiposCama: [TipoCama.CASAL_KING, TipoCama.SOLTEIRO],
      };

      gestor.cadastrarQuarto(dto);

      const quartoRecebido = mockRepository.quartoSalvo;
      expect(quartoRecebido!.camas).toHaveLength(2);
      const tipos = quartoRecebido!.camas.map((c) => c.tipo);
      expect(tipos).toContain(TipoCama.CASAL_KING);
      expect(tipos).toContain(TipoCama.SOLTEIRO);
    });

    test("REP04 — quando número duplicado, repositório NÃO chama salvar()", () => {
      mockRepository.numeroOcupadoPor(umQuarto().comNumero("201").build());
      const dto = { ...umDtoCadastroValido(), numero: "201" };

      gestor.cadastrarQuarto(dto);

      // Verificação crítica: o gestor retornou antes de tentar persistir
      expect(mockRepository.vezesSalvo).toBe(0);
    });
  });
});
