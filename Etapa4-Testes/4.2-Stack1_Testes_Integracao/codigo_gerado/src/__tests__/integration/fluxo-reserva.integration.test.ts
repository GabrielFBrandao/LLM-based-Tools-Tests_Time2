/**
 * =============================================================================
 * TESTES DE INTEGRAÇÃO — Fluxo: Cadastro de Hóspede → Reserva → Disponibilidade
 *
 * TESTES DE INTEGRAÇÃO vs UNITÁRIOS — DIFERENÇA FUNDAMENTAL
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ Unitários          │ Integração                                         │
 * ├────────────────────┼────────────────────────────────────────────────────┤
 * │ Testam UMA classe  │ Testam a COLABORAÇÃO entre classes                 │
 * │ Usam mocks         │ Usam implementações REAIS                          │
 * │ Isolam o módulo    │ Validam que os módulos funcionam JUNTOS            │
 * │ Detectam bugs      │ Detectam problemas de INTEGRAÇÃO e contrato        │
 * │   internos         │   entre serviços                                   │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * ESCOPO DESTES TESTES:
 * Validam o fluxo completo de negócio usando serviços e repositórios REAIS
 * (sem mocks). O "banco" é a implementação em memória — suficiente para
 * testar a colaboração sem depender de infraestrutura externa.
 *
 * COBERTURA PLANEJADA:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ SUITE 1 — FLUXO PRINCIPAL COMPLETO                                      │
 * │   INT-FP01  Fluxo ponta a ponta com sucesso                             │
 * │   INT-FP02  Estado final de cada entidade após o fluxo                  │
 * │   INT-FP03  IDs referenciados na reserva correspondem às entidades reais │
 * │   INT-FP04  Quarto muda de LIVRE para OCUPADO após reserva              │
 * │   INT-FP05  Quarto volta para LIVRE após cancelamento da reserva        │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ SUITE 2 — CONSISTÊNCIA ENTRE SERVIÇOS (estado compartilhado)            │
 * │   INT-CS01  Quarto OCUPADO não aceita segunda reserva                   │
 * │   INT-CS02  Hóspede com CPF duplicado não pode ser cadastrado           │
 * │   INT-CS03  Reserva referencia quarto e hóspede corretos no repositório │
 * │   INT-CS04  Múltiplas reservas para quartos diferentes são independentes │
 * │   INT-CS05  Cancelamento afeta só a reserva cancelada, não as demais    │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ SUITE 3 — FALHAS PARCIAIS (integridade após erro)                       │
 * │   INT-FH01  Falha no cadastro do hóspede não altera estado dos quartos  │
 * │   INT-FH02  Falha na reserva (quarto indisponível) não persiste reserva │
 * │   INT-FH03  Falha na reserva (hóspede inválido) não muda status quarto  │
 * │   INT-FH04  Tentativa de cancelar reserva já cancelada é rejeitada      │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ SUITE 4 — CENÁRIOS DE NEGÓCIO AVANÇADOS                                 │
 * │   INT-CN01  Mesmo hóspede reserva quartos diferentes simultâneos        │
 * │   INT-CN02  Quarto fica disponível após cancelamento e aceita nova res. │
 * │   INT-CN03  Quarto em MANUTENÇÃO não pode ser reservado                 │
 * │   INT-CN04  Quarto em LIMPEZA não pode ser reservado                    │
 * │   INT-CN05  Histórico de reservas de um hóspede está completo           │
 * │   INT-CN06  Cancelamento com motivo preserva o motivo na reserva        │
 * │   INT-CN07  Fluxo completo com dados via DTOs (sem pré-criar entidades) │
 * └─────────────────────────────────────────────────────────────────────────┘
 * =============================================================================
 */

import { StatusQuarto } from "../../domain";
import { StatusReserva } from "../../domain.integration";
import {
  criarContexto,
  dtoCadastroHospedeValido,
  dtoCadastroQuartoValido,
  hospedeFixture,
  hospede2Fixture,
  quartoLivreFixture,
  quartoOcupadoFixture,
  quartoEmManutencaoFixture,
  reservaAtivaFixture,
} from "./fixtures.integration";

// =============================================================================
// SUITE 1 — FLUXO PRINCIPAL COMPLETO
// Valida o caminho feliz ponta a ponta.
// =============================================================================

describe("INTEGRAÇÃO — Suite 1: Fluxo Principal Completo", () => {
  /**
   * DECISÃO: beforeEach cria contexto completamente novo para cada teste.
   * Testes de integração têm mais estado que unitários, tornando o isolamento
   * ainda mais crítico — um teste não deve influenciar o próximo.
   */
  let ctx: ReturnType<typeof criarContexto>;

  beforeEach(() => {
    ctx = criarContexto({
      quartos: [quartoLivreFixture()],   // quarto "101" LIVRE pré-existente
      hospedes: [hospedeFixture()],       // hóspede "Carlos" pré-existente
    });
  });

  test("INT-FP01 — fluxo ponta a ponta: cadastra hóspede → cria reserva → quarto ocupa", () => {
    /**
     * ARRANGE: Novo contexto limpo (sem pré-dados) para testar o fluxo
     * iniciando do zero — como aconteceria em produção pela primeira vez.
     */
    const ctxZerado = criarContexto();

    // PASSO 1: Cadastra o quarto
    const resQuarto = ctxZerado.quartoService.cadastrarQuarto(dtoCadastroQuartoValido("201"));
    expect(resQuarto.sucesso).toBe(true);

    // PASSO 2: Cadastra o hóspede
    const resHospede = ctxZerado.hospedeService.cadastrarHospede(dtoCadastroHospedeValido());
    expect(resHospede.sucesso).toBe(true);

    // PASSO 3: Cria reserva vinculando quarto + hóspede
    if (!resQuarto.sucesso || !resHospede.sucesso) return;
    const resReserva = ctxZerado.reservaService.criarReserva({
      quartoId: resQuarto.dados.id,
      hospedeId: resHospede.dados.id,
    });

    // ASSERT: Todos os passos produziram sucesso
    expect(resReserva.sucesso).toBe(true);
    if (resReserva.sucesso) {
      expect(resReserva.dados.quartoId).toBe(resQuarto.dados.id);
      expect(resReserva.dados.hospedeId).toBe(resHospede.dados.id);
      expect(resReserva.dados.status).toBe(StatusReserva.ATIVA);
    }
  });

  test("INT-FP02 — estado final correto de cada entidade após o fluxo completo", () => {
    // ARRANGE: Usa contexto com dados pré-existentes (beforeEach)
    const quartoId = "qrt_int_001";
    const hospedeId = "hosp_int_001";

    // ACT: Cria a reserva
    const resReserva = ctx.reservaService.criarReserva({ quartoId, hospedeId });
    expect(resReserva.sucesso).toBe(true);

    // ASSERT — Estado do hóspede (não deve mudar com a reserva)
    const hospedeAposReserva = ctx.hospedeRepo.buscarPorId(hospedeId);
    expect(hospedeAposReserva?.nome).toBe("Carlos");
    expect(hospedeAposReserva?.sobrenome).toBe("Andrade");
    expect(hospedeAposReserva?.cpf).toBe("12345678901");

    // ASSERT — Estado da reserva (criada com status ATIVA)
    if (resReserva.sucesso) {
      const reservaNoRepo = ctx.reservaRepo.buscarPorId(resReserva.dados.id);
      expect(reservaNoRepo?.status).toBe(StatusReserva.ATIVA);
      expect(reservaNoRepo?.quartoId).toBe(quartoId);
      expect(reservaNoRepo?.hospedeId).toBe(hospedeId);
      expect(reservaNoRepo?.canceladaEm).toBeNull();
    }

    // ASSERT — Estado do quarto (deve ter mudado para OCUPADO)
    const quartoAposReserva = ctx.quartoRepo.buscarPorId(quartoId);
    expect(quartoAposReserva?.status).toBe(StatusQuarto.OCUPADO);
    expect(quartoAposReserva?.estaDisponivel).toBe(false);
  });

  test("INT-FP03 — IDs referenciados na reserva correspondem às entidades reais no repositório", () => {
    // ARRANGE
    const quartoId = "qrt_int_001";
    const hospedeId = "hosp_int_001";

    // ACT
    const resReserva = ctx.reservaService.criarReserva({ quartoId, hospedeId });
    expect(resReserva.sucesso).toBe(true);
    if (!resReserva.sucesso) return;

    // ASSERT — Os IDs na reserva apontam para entidades realmente existentes
    const quartoDaReserva = ctx.quartoRepo.buscarPorId(resReserva.dados.quartoId);
    const hospedeDaReserva = ctx.hospedeRepo.buscarPorId(resReserva.dados.hospedeId);

    expect(quartoDaReserva).toBeDefined();
    expect(hospedeDaReserva).toBeDefined();
    expect(quartoDaReserva?.numero).toBe("101");
    expect(hospedeDaReserva?.nomeCompleto).toBe("Carlos Andrade");
  });

  test("INT-FP04 — quarto muda de LIVRE para OCUPADO automaticamente ao criar reserva (RF15)", () => {
    // ARRANGE: Confirma estado inicial
    const quartoId = "qrt_int_001";
    const quartoAntes = ctx.quartoRepo.buscarPorId(quartoId);
    expect(quartoAntes?.status).toBe(StatusQuarto.LIVRE); // pré-condição

    // ACT
    ctx.reservaService.criarReserva({ quartoId, hospedeId: "hosp_int_001" });

    // ASSERT: Estado mudou no repositório compartilhado
    const quartoDepois = ctx.quartoRepo.buscarPorId(quartoId);
    expect(quartoDepois?.status).toBe(StatusQuarto.OCUPADO);
    expect(quartoDepois?.estaDisponivel).toBe(false);
  });

  test("INT-FP05 — quarto volta para LIVRE após cancelamento da reserva (RF17)", () => {
    // ARRANGE: Cria reserva para ocupar o quarto
    const quartoId = "qrt_int_001";
    const resReserva = ctx.reservaService.criarReserva({
      quartoId,
      hospedeId: "hosp_int_001",
    });
    expect(resReserva.sucesso).toBe(true);
    if (!resReserva.sucesso) return;

    // Confirma que ficou OCUPADO
    expect(ctx.quartoRepo.buscarPorId(quartoId)?.status).toBe(StatusQuarto.OCUPADO);

    // ACT: Cancela a reserva
    const resCancelamento = ctx.reservaService.cancelarReserva(resReserva.dados.id, {
      motivo: "Hóspede solicitou cancelamento",
    });

    // ASSERT: Quarto voltou para LIVRE
    expect(resCancelamento.sucesso).toBe(true);
    const quartoApos = ctx.quartoRepo.buscarPorId(quartoId);
    expect(quartoApos?.status).toBe(StatusQuarto.LIVRE);
    expect(quartoApos?.estaDisponivel).toBe(true);
  });
});

// =============================================================================
// SUITE 2 — CONSISTÊNCIA ENTRE SERVIÇOS
// Valida que o estado compartilhado (repositórios reais) permanece consistente
// após múltiplas operações executadas por services diferentes.
// =============================================================================

describe("INTEGRAÇÃO — Suite 2: Consistência de Estado Entre Serviços", () => {
  let ctx: ReturnType<typeof criarContexto>;

  beforeEach(() => {
    ctx = criarContexto({
      quartos: [quartoLivreFixture(), quartoOcupadoFixture()],
      hospedes: [hospedeFixture(), hospede2Fixture()],
    });
  });

  test("INT-CS01 — quarto OCUPADO rejeita nova reserva (RF18) — estado real no repo", () => {
    /**
     * Este é um dos testes mais importantes da suíte:
     * valida que o QuartoService e o ReservaService leem do MESMO repositório.
     * Em testes unitários com mocks, essa colaboração não seria verificada.
     */
    // ARRANGE: quarto "102" já está OCUPADO (configurado no beforeEach)
    const quartoOcupadoId = "qrt_int_002";
    expect(ctx.quartoRepo.buscarPorId(quartoOcupadoId)?.status).toBe(StatusQuarto.OCUPADO);

    // ACT: Tenta criar reserva para quarto ocupado
    const resultado = ctx.reservaService.criarReserva({
      quartoId: quartoOcupadoId,
      hospedeId: "hosp_int_001",
    });

    // ASSERT: Reserva rejeitada com mensagem descritiva
    expect(resultado.sucesso).toBe(false);
    if (!resultado.sucesso) {
      expect(resultado.erro).toContain("102");
      expect(resultado.erro.toLowerCase()).toMatch(/não está disponível/);
    }

    // ASSERT: Nenhuma reserva foi persistida
    expect(ctx.reservaRepo.count()).toBe(0);
  });

  test("INT-CS02 — CPF duplicado rejeitado entre cadastros independentes (RF09)", () => {
    // ARRANGE: "Carlos" com CPF "12345678901" já existe (beforeEach)

    // ACT: Tenta cadastrar outro hóspede com mesmo CPF
    const resultado = ctx.hospedeService.cadastrarHospede({
      nome: "Carlos",
      sobrenome: "Outro",
      cpf: "123.456.789-01", // mesmo CPF, diferente formatação
      email: "outro.email@test.com",
    });

    // ASSERT: Cadastro rejeitado
    expect(resultado.sucesso).toBe(false);
    if (!resultado.sucesso) {
      expect(resultado.erro.toLowerCase()).toContain("cpf");
    }

    // ASSERT: Repositório ainda tem apenas 2 hóspedes (os do beforeEach)
    expect(ctx.hospedeRepo.count()).toBe(2);
  });

  test("INT-CS03 — reserva criada referencia o quarto e o hóspede corretos no repositório", () => {
    // ARRANGE
    const quartoId = "qrt_int_001";
    const hospedeId = "hosp_int_001";

    // ACT
    const resultado = ctx.reservaService.criarReserva({ quartoId, hospedeId });
    expect(resultado.sucesso).toBe(true);
    if (!resultado.sucesso) return;

    // ASSERT — Referências cruzadas consistentes
    const reservaPersistida = ctx.reservaRepo.buscarPorId(resultado.dados.id);
    expect(reservaPersistida?.quartoId).toBe(quartoId);
    expect(reservaPersistida?.hospedeId).toBe(hospedeId);

    // Navega pelas referências e verifica consistência
    const quartoViaReserva = ctx.quartoRepo.buscarPorId(reservaPersistida!.quartoId);
    const hospedeViaReserva = ctx.hospedeRepo.buscarPorId(reservaPersistida!.hospedeId);
    expect(quartoViaReserva?.numero).toBe("101");
    expect(hospedeViaReserva?.cpf).toBe("12345678901");
  });

  test("INT-CS04 — múltiplas reservas para quartos diferentes são independentes", () => {
    /**
     * Adiciona um segundo quarto livre para testar reservas paralelas.
     * Valida que a reserva do quarto A não afeta o quarto B.
     */
    // ARRANGE: Adiciona quarto "201" livre
    const r201 = ctx.quartoService.cadastrarQuarto(dtoCadastroQuartoValido("201"));
    expect(r201.sucesso).toBe(true);
    if (!r201.sucesso) return;

    // ACT: Dois hóspedes reservam quartos diferentes simultaneamente
    const resA = ctx.reservaService.criarReserva({
      quartoId: "qrt_int_001",   // quarto 101
      hospedeId: "hosp_int_001", // Carlos
    });
    const resB = ctx.reservaService.criarReserva({
      quartoId: r201.dados.id,   // quarto 201
      hospedeId: "hosp_int_002", // Maria
    });

    // ASSERT: Ambas as reservas foram criadas com sucesso
    expect(resA.sucesso).toBe(true);
    expect(resB.sucesso).toBe(true);
    expect(ctx.reservaRepo.count()).toBe(2);

    // ASSERT: Cada quarto está OCUPADO pela reserva correta
    expect(ctx.quartoRepo.buscarPorId("qrt_int_001")?.status).toBe(StatusQuarto.OCUPADO);
    expect(ctx.quartoRepo.buscarPorId(r201.dados.id)?.status).toBe(StatusQuarto.OCUPADO);

    // ASSERT: As reservas são independentes — IDs diferentes
    if (resA.sucesso && resB.sucesso) {
      expect(resA.dados.id).not.toBe(resB.dados.id);
    }
  });

  test("INT-CS05 — cancelar uma reserva não afeta outras reservas ativas", () => {
    // ARRANGE: Cria um segundo quarto e reserva ambos
    const r201 = ctx.quartoService.cadastrarQuarto(dtoCadastroQuartoValido("201"));
    expect(r201.sucesso).toBe(true);
    if (!r201.sucesso) return;

    const resA = ctx.reservaService.criarReserva({ quartoId: "qrt_int_001", hospedeId: "hosp_int_001" });
    const resB = ctx.reservaService.criarReserva({ quartoId: r201.dados.id, hospedeId: "hosp_int_002" });
    expect(resA.sucesso && resB.sucesso).toBe(true);
    if (!resA.sucesso || !resB.sucesso) return;

    // ACT: Cancela apenas a reserva A
    const cancelamento = ctx.reservaService.cancelarReserva(resA.dados.id, {
      motivo: "Cancelamento de teste",
    });
    expect(cancelamento.sucesso).toBe(true);

    // ASSERT: Reserva A cancelada, reserva B intacta
    expect(ctx.reservaRepo.buscarPorId(resA.dados.id)?.status).toBe(StatusReserva.CANCELADA);
    expect(ctx.reservaRepo.buscarPorId(resB.dados.id)?.status).toBe(StatusReserva.ATIVA);

    // ASSERT: Quarto A voltou para LIVRE, quarto B permanece OCUPADO
    expect(ctx.quartoRepo.buscarPorId("qrt_int_001")?.status).toBe(StatusQuarto.LIVRE);
    expect(ctx.quartoRepo.buscarPorId(r201.dados.id)?.status).toBe(StatusQuarto.OCUPADO);
  });
});

// =============================================================================
// SUITE 3 — FALHAS PARCIAIS (INTEGRIDADE DO ESTADO)
// Valida que falhas em qualquer etapa do fluxo não deixam o sistema
// em estado inconsistente. Cada falha deve ser atômica — nada persiste.
// =============================================================================

describe("INTEGRAÇÃO — Suite 3: Integridade do Estado em Falhas Parciais", () => {
  let ctx: ReturnType<typeof criarContexto>;

  beforeEach(() => {
    ctx = criarContexto({
      quartos: [quartoLivreFixture()],
      hospedes: [hospedeFixture()],
    });
  });

  test("INT-FH01 — falha no cadastro de hóspede não altera estado dos quartos", () => {
    // ARRANGE: Estado inicial
    const qtdQuartosAntes = ctx.quartoRepo.listarTodos().length;
    const statusQuartoAntes = ctx.quartoRepo.buscarPorId("qrt_int_001")?.status;

    // ACT: Tenta cadastrar hóspede inválido (CPF duplicado)
    const resultadoHospede = ctx.hospedeService.cadastrarHospede({
      nome: "Outro",
      sobrenome: "Hóspede",
      cpf: "12345678901", // duplicado
      email: "outro@email.com",
    });

    // ASSERT: Hóspede não cadastrado
    expect(resultadoHospede.sucesso).toBe(false);

    // ASSERT: Estado dos quartos completamente inalterado
    expect(ctx.quartoRepo.listarTodos().length).toBe(qtdQuartosAntes);
    expect(ctx.quartoRepo.buscarPorId("qrt_int_001")?.status).toBe(statusQuartoAntes);
    expect(ctx.quartoRepo.buscarPorId("qrt_int_001")?.status).toBe(StatusQuarto.LIVRE);
  });

  test("INT-FH02 — falha na reserva (quarto indisponível) não cria registro de reserva", () => {
    /**
     * Simula o cenário de race condition básico:
     * dois usuários tentam reservar o mesmo quarto quase simultaneamente.
     * O primeiro sucede; o segundo deve falhar sem criar reserva.
     */
    // ARRANGE: Primeira reserva ocupa o quarto
    const primeiraReserva = ctx.reservaService.criarReserva({
      quartoId: "qrt_int_001",
      hospedeId: "hosp_int_001",
    });
    expect(primeiraReserva.sucesso).toBe(true);
    expect(ctx.reservaRepo.count()).toBe(1);

    // Cadastra segundo hóspede para a tentativa concorrente
    const resHospede2 = ctx.hospedeService.cadastrarHospede({
      nome: "Segundo",
      sobrenome: "Hóspede",
      cpf: "55566677788",
      email: "segundo@email.com",
    });
    expect(resHospede2.sucesso).toBe(true);
    if (!resHospede2.sucesso) return;

    // ACT: Segundo hóspede tenta reservar o mesmo quarto (agora OCUPADO)
    const segundaReserva = ctx.reservaService.criarReserva({
      quartoId: "qrt_int_001",
      hospedeId: resHospede2.dados.id,
    });

    // ASSERT: Segunda reserva rejeitada
    expect(segundaReserva.sucesso).toBe(false);

    // ASSERT: Ainda existe apenas 1 reserva no repositório (a primeira)
    expect(ctx.reservaRepo.count()).toBe(1);

    // ASSERT: Quarto permanece OCUPADO pela primeira reserva
    expect(ctx.quartoRepo.buscarPorId("qrt_int_001")?.status).toBe(StatusQuarto.OCUPADO);
  });

  test("INT-FH03 — falha na reserva (hóspede inexistente) não altera status do quarto", () => {
    // ARRANGE: Estado inicial do quarto
    expect(ctx.quartoRepo.buscarPorId("qrt_int_001")?.status).toBe(StatusQuarto.LIVRE);

    // ACT: Tenta criar reserva com ID de hóspede inexistente
    const resultado = ctx.reservaService.criarReserva({
      quartoId: "qrt_int_001",
      hospedeId: "hosp_fantasma_999",
    });

    // ASSERT: Reserva rejeitada
    expect(resultado.sucesso).toBe(false);
    if (!resultado.sucesso) {
      expect(resultado.erro.toLowerCase()).toContain("hóspede");
    }

    // ASSERT CRÍTICO: Quarto NÃO mudou de status (permanece LIVRE)
    // Este teste detectaria um bug onde o status muda antes de validar o hóspede
    expect(ctx.quartoRepo.buscarPorId("qrt_int_001")?.status).toBe(StatusQuarto.LIVRE);

    // ASSERT: Nenhuma reserva foi persistida
    expect(ctx.reservaRepo.count()).toBe(0);
  });

  test("INT-FH04 — tentativa de cancelar reserva já cancelada é rejeitada sem efeitos colaterais", () => {
    // ARRANGE: Cria e cancela uma reserva
    const resReserva = ctx.reservaService.criarReserva({
      quartoId: "qrt_int_001",
      hospedeId: "hosp_int_001",
    });
    expect(resReserva.sucesso).toBe(true);
    if (!resReserva.sucesso) return;

    ctx.reservaService.cancelarReserva(resReserva.dados.id, { motivo: "Primeiro cancelamento" });

    // Confirma estado pós-cancelamento
    expect(ctx.quartoRepo.buscarPorId("qrt_int_001")?.status).toBe(StatusQuarto.LIVRE);
    expect(ctx.reservaRepo.buscarPorId(resReserva.dados.id)?.status).toBe(StatusReserva.CANCELADA);

    // ACT: Tenta cancelar a mesma reserva novamente
    const segundoCancelamento = ctx.reservaService.cancelarReserva(resReserva.dados.id, {
      motivo: "Segundo cancelamento",
    });

    // ASSERT: Segundo cancelamento rejeitado
    expect(segundoCancelamento.sucesso).toBe(false);
    if (!segundoCancelamento.sucesso) {
      expect(segundoCancelamento.erro.toLowerCase()).toContain("já está cancelada");
    }

    // ASSERT: Estado do quarto não foi alterado novamente (continua LIVRE)
    expect(ctx.quartoRepo.buscarPorId("qrt_int_001")?.status).toBe(StatusQuarto.LIVRE);
  });
});

// =============================================================================
// SUITE 4 — CENÁRIOS DE NEGÓCIO AVANÇADOS
// Fluxos mais complexos que combinam múltiplas operações em sequência.
// =============================================================================

describe("INTEGRAÇÃO — Suite 4: Cenários de Negócio Avançados", () => {
  let ctx: ReturnType<typeof criarContexto>;

  beforeEach(() => {
    ctx = criarContexto({
      quartos: [quartoLivreFixture(), quartoOcupadoFixture(), quartoEmManutencaoFixture()],
      hospedes: [hospedeFixture(), hospede2Fixture()],
    });
  });

  test("INT-CN01 — mesmo hóspede pode reservar quartos diferentes simultaneamente", () => {
    // ARRANGE: Adiciona um segundo quarto livre
    const r301 = ctx.quartoService.cadastrarQuarto(dtoCadastroQuartoValido("301"));
    expect(r301.sucesso).toBe(true);
    if (!r301.sucesso) return;

    // ACT: Carlos reserva ambos os quartos livres
    const res1 = ctx.reservaService.criarReserva({
      quartoId: "qrt_int_001",     // quarto 101
      hospedeId: "hosp_int_001",   // Carlos
    });
    const res2 = ctx.reservaService.criarReserva({
      quartoId: r301.dados.id,      // quarto 301
      hospedeId: "hosp_int_001",   // Carlos (mesmo hóspede)
    });

    // ASSERT: Ambas as reservas aceitas
    expect(res1.sucesso).toBe(true);
    expect(res2.sucesso).toBe(true);

    // ASSERT: Histórico do hóspede tem ambas as reservas
    const reservasCarlos = ctx.reservaService.listarPorHospede("hosp_int_001");
    expect(reservasCarlos).toHaveLength(2);
    expect(reservasCarlos.every((r) => r.hospedeId === "hosp_int_001")).toBe(true);
  });

  test("INT-CN02 — quarto fica disponível após cancelamento e aceita nova reserva", () => {
    /**
     * Valida o ciclo completo de vida de um quarto:
     * LIVRE → OCUPADO (reserva) → LIVRE (cancelamento) → OCUPADO (nova reserva)
     */
    const quartoId = "qrt_int_001";

    // Ciclo 1: Reserva e cancela
    const res1 = ctx.reservaService.criarReserva({ quartoId, hospedeId: "hosp_int_001" });
    expect(res1.sucesso).toBe(true);
    expect(ctx.quartoRepo.buscarPorId(quartoId)?.status).toBe(StatusQuarto.OCUPADO);
    if (!res1.sucesso) return;

    ctx.reservaService.cancelarReserva(res1.dados.id, { motivo: "Viagem cancelada" });
    expect(ctx.quartoRepo.buscarPorId(quartoId)?.status).toBe(StatusQuarto.LIVRE);

    // Ciclo 2: Nova reserva para o mesmo quarto (por outro hóspede)
    const res2 = ctx.reservaService.criarReserva({ quartoId, hospedeId: "hosp_int_002" });

    // ASSERT: Nova reserva aceita
    expect(res2.sucesso).toBe(true);
    expect(ctx.quartoRepo.buscarPorId(quartoId)?.status).toBe(StatusQuarto.OCUPADO);

    // ASSERT: Histórico contém ambas as reservas (ativa e cancelada)
    const historico = ctx.reservaService.listarPorQuarto(quartoId);
    expect(historico).toHaveLength(2);
    const ativas = historico.filter((r) => r.status === StatusReserva.ATIVA);
    const canceladas = historico.filter((r) => r.status === StatusReserva.CANCELADA);
    expect(ativas).toHaveLength(1);
    expect(canceladas).toHaveLength(1);
  });

  test("INT-CN03 — quarto em MANUTENÇÃO não pode ser reservado (RF18)", () => {
    // ARRANGE: Quarto "103" em MANUTENÇÃO está no contexto (beforeEach)
    const quartoManutId = "qrt_int_003";
    expect(ctx.quartoRepo.buscarPorId(quartoManutId)?.status).toBe(StatusQuarto.MANUTENCAO);

    // ACT
    const resultado = ctx.reservaService.criarReserva({
      quartoId: quartoManutId,
      hospedeId: "hosp_int_001",
    });

    // ASSERT
    expect(resultado.sucesso).toBe(false);
    if (!resultado.sucesso) {
      expect(resultado.erro).toContain("103");
      expect(resultado.erro.toLowerCase()).toMatch(/não está disponível/);
      expect(resultado.erro).toContain(StatusQuarto.MANUTENCAO);
    }
    expect(ctx.reservaRepo.count()).toBe(0);
  });

  test("INT-CN04 — quarto em LIMPEZA não pode ser reservado (RF18)", () => {
    // ARRANGE: Altera status do quarto 101 para LIMPEZA
    const quartoId = "qrt_int_001";
    ctx.quartoService.alterarStatus(quartoId, StatusQuarto.LIMPEZA);
    expect(ctx.quartoRepo.buscarPorId(quartoId)?.status).toBe(StatusQuarto.LIMPEZA);

    // ACT
    const resultado = ctx.reservaService.criarReserva({
      quartoId,
      hospedeId: "hosp_int_001",
    });

    // ASSERT
    expect(resultado.sucesso).toBe(false);
    if (!resultado.sucesso) {
      expect(resultado.erro.toLowerCase()).toMatch(/não está disponível/);
    }
    expect(ctx.reservaRepo.count()).toBe(0);
  });

  test("INT-CN05 — histórico de reservas de um hóspede está completo e correto", () => {
    // ARRANGE: Adiciona dois quartos livres adicionais
    const r201 = ctx.quartoService.cadastrarQuarto(dtoCadastroQuartoValido("201"));
    const r301 = ctx.quartoService.cadastrarQuarto(dtoCadastroQuartoValido("301"));
    expect(r201.sucesso && r301.sucesso).toBe(true);
    if (!r201.sucesso || !r301.sucesso) return;

    const hospedeId = "hosp_int_001";

    // ACT: Carlos faz 3 reservas
    const resA = ctx.reservaService.criarReserva({ quartoId: "qrt_int_001", hospedeId });
    const resB = ctx.reservaService.criarReserva({ quartoId: r201.dados.id, hospedeId });

    // Cancela a primeira e faz uma terceira
    if (!resA.sucesso) return;
    ctx.reservaService.cancelarReserva(resA.dados.id, { motivo: "Mudança de planos" });
    const resC = ctx.reservaService.criarReserva({ quartoId: r301.dados.id, hospedeId });

    // ASSERT: Histórico completo com todas as 3 reservas
    const historico = ctx.reservaService.listarPorHospede(hospedeId);
    expect(historico).toHaveLength(3);

    // ASSERT: Status correto de cada reserva
    const ativas = historico.filter((r) => r.status === StatusReserva.ATIVA);
    const canceladas = historico.filter((r) => r.status === StatusReserva.CANCELADA);
    expect(ativas).toHaveLength(2);  // resB e resC
    expect(canceladas).toHaveLength(1); // resA
  });

  test("INT-CN06 — cancelamento preserva motivo, timestamp e dados da reserva original", () => {
    // ARRANGE
    const quartoId = "qrt_int_001";
    const hospedeId = "hosp_int_001";
    const resReserva = ctx.reservaService.criarReserva({ quartoId, hospedeId });
    expect(resReserva.sucesso).toBe(true);
    if (!resReserva.sucesso) return;

    const idOriginal = resReserva.dados.id;
    const hospedeIdOriginal = resReserva.dados.hospedeId;
    const quartoIdOriginal = resReserva.dados.quartoId;
    const criadaEmOriginal = resReserva.dados.criadaEm;
    const motivoCancelamento = "Hóspede desistiu da viagem devido a imprevisto";

    // ACT
    const cancelamento = ctx.reservaService.cancelarReserva(idOriginal, {
      motivo: motivoCancelamento,
    });

    // ASSERT: Reserva cancelada preserva todos os dados originais
    expect(cancelamento.sucesso).toBe(true);
    if (cancelamento.sucesso) {
      expect(cancelamento.dados.id).toBe(idOriginal);            // ID preservado
      expect(cancelamento.dados.quartoId).toBe(quartoIdOriginal); // vínculo preservado
      expect(cancelamento.dados.hospedeId).toBe(hospedeIdOriginal); // vínculo preservado
      expect(cancelamento.dados.criadaEm).toEqual(criadaEmOriginal); // data criação preservada
      expect(cancelamento.dados.status).toBe(StatusReserva.CANCELADA);
      expect(cancelamento.dados.canceladaEm).not.toBeNull(); // data cancelamento registrada
      expect(cancelamento.dados.motivoCancelamento).toBe(motivoCancelamento); // motivo preservado
    }

    // ASSERT: Estado persistido no repositório é consistente
    const reservaNoRepo = ctx.reservaRepo.buscarPorId(idOriginal);
    expect(reservaNoRepo?.status).toBe(StatusReserva.CANCELADA);
    expect(reservaNoRepo?.motivoCancelamento).toBe(motivoCancelamento);
  });

  test("INT-CN07 — fluxo completo usando apenas DTOs (sem entidades pré-construídas)", () => {
    /**
     * Simula o fluxo exato como ocorreria via API REST:
     * todos os dados chegam como DTOs, nenhuma entidade é pré-criada.
     *
     * DECISÃO: Este teste é o mais próximo de um teste E2E (end-to-end)
     * dentro dos limites dos testes de integração em memória.
     * Se este teste passa, o fluxo de negócio funciona corretamente
     * independente de qualquer fixture ou estado pré-configurado.
     */
    const ctxLimpo = criarContexto(); // zero dados iniciais

    // Passo 1: Cria o quarto via DTO
    const dtoQuarto = dtoCadastroQuartoValido("501");
    const resQuarto = ctxLimpo.quartoService.cadastrarQuarto(dtoQuarto);
    expect(resQuarto.sucesso).toBe(true);
    expect(resQuarto.sucesso && resQuarto.dados.status).toBe(StatusQuarto.LIVRE);

    // Passo 2: Cadastra o hóspede via DTO
    const dtoHospede = dtoCadastroHospedeValido();
    const resHospede = ctxLimpo.hospedeService.cadastrarHospede(dtoHospede);
    expect(resHospede.sucesso).toBe(true);
    if (!resQuarto.sucesso || !resHospede.sucesso) return;

    // Passo 3: Cria a reserva via DTO
    const resReserva = ctxLimpo.reservaService.criarReserva({
      quartoId: resQuarto.dados.id,
      hospedeId: resHospede.dados.id,
    });
    expect(resReserva.sucesso).toBe(true);
    if (!resReserva.sucesso) return;

    // Passo 4: Confirma que o quarto está OCUPADO
    const quartoOcupado = ctxLimpo.quartoRepo.buscarPorId(resQuarto.dados.id);
    expect(quartoOcupado?.status).toBe(StatusQuarto.OCUPADO);
    expect(quartoOcupado?.estaDisponivel).toBe(false);

    // Passo 5: Cancela a reserva
    const resCancelamento = ctxLimpo.reservaService.cancelarReserva(resReserva.dados.id, {
      motivo: "Fim do fluxo de teste",
    });
    expect(resCancelamento.sucesso).toBe(true);

    // Passo 6: Confirma que o quarto voltou para LIVRE
    const quartoFinal = ctxLimpo.quartoRepo.buscarPorId(resQuarto.dados.id);
    expect(quartoFinal?.status).toBe(StatusQuarto.LIVRE);
    expect(quartoFinal?.estaDisponivel).toBe(true);

    // Passo 7: Confirma o histórico completo
    const historico = ctxLimpo.reservaService.listarPorQuarto(resQuarto.dados.id);
    expect(historico).toHaveLength(1);
    expect(historico[0].status).toBe(StatusReserva.CANCELADA);
  });
});
