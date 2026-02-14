/**
 * =============================================================================
 * FIXTURES DE INTEGRAÇÃO
 *
 * DECISÃO — FIXTURES SEPARADOS DOS UNITÁRIOS:
 * Os testes de integração têm um contexto maior (múltiplos serviços, estado
 * compartilhado) e precisam de fixtures que expressem cenários de negócio
 * completos — não apenas entidades isoladas.
 *
 * DECISÃO — FACTORY FUNCTION vs CLASSE:
 * Para integração, usamos a função criarContexto() que retorna todos os
 * repositórios e serviços já conectados. Cada teste começa com um contexto
 * limpo e independente (fresh fixture), sem estado compartilhado entre testes.
 * =============================================================================
 */

import { Cama, Quarto, TipoCama, TipoQuarto, StatusQuarto } from "../../domain";
import { Hospede, Reserva, StatusReserva } from "../../domain.integration";
import { QuartoRepositoryMemoria } from "../../repository";
import { HospedeRepositoryMemoria, ReservaRepositoryMemoria } from "../../repository.integration";
import { QuartoService } from "../../service";
import { HospedeService, ReservaService } from "../../service.integration";

// =============================================================================
// CONTEXTO DE INTEGRAÇÃO
// Agrupa repositórios e serviços reais (não mocks) conectados entre si.
// =============================================================================

export interface ContextoIntegracao {
  // Repositórios — acesso direto para asserções de estado
  quartoRepo: QuartoRepositoryMemoria;
  hospedeRepo: HospedeRepositoryMemoria;
  reservaRepo: ReservaRepositoryMemoria;
  // Serviços — ponto de entrada das operações
  quartoService: QuartoService;
  hospedeService: HospedeService;
  reservaService: ReservaService;
}

/**
 * Cria um contexto limpo de integração com todos os colaboradores conectados.
 * DECISÃO: Função pura — cada chamada retorna instâncias novas e independentes.
 * Nenhum estado é compartilhado entre testes que chamam criarContexto().
 */
export function criarContexto(dadosIniciais?: {
  quartos?: Quarto[];
  hospedes?: Hospede[];
  reservas?: Reserva[];
}): ContextoIntegracao {
  const quartoRepo = new QuartoRepositoryMemoria(dadosIniciais?.quartos ?? []);
  const hospedeRepo = new HospedeRepositoryMemoria(dadosIniciais?.hospedes ?? []);
  const reservaRepo = new ReservaRepositoryMemoria(dadosIniciais?.reservas ?? []);

  // DECISÃO: Os repositórios reais são injetados nos serviços reais.
  // Testes de integração NÃO usam mocks — validam a colaboração real.
  const quartoService = new QuartoService(quartoRepo);
  const hospedeService = new HospedeService(hospedeRepo);
  const reservaService = new ReservaService(reservaRepo, quartoRepo, hospedeRepo);

  return { quartoRepo, hospedeRepo, reservaRepo, quartoService, hospedeService, reservaService };
}

// =============================================================================
// ENTIDADES PRÉ-CONSTRUÍDAS — estado de domínio consistente e nomeado
// =============================================================================

/** Quarto livre, pronto para receber reservas */
export const quartoLivreFixture = (): Quarto =>
  new Quarto({
    id: "qrt_int_001",
    numero: "101",
    capacidade: 2,
    tipo: TipoQuarto.MODERNO,
    precoDiaria: 280,
    temFrigobar: true,
    temTV: true,
    temArCondicionado: true,
    status: StatusQuarto.LIVRE,
    camas: [new Cama(TipoCama.CASAL_QUEEN, "c_int_001")],
  });

/** Quarto já ocupado — não pode ser reservado */
export const quartoOcupadoFixture = (): Quarto =>
  new Quarto({
    id: "qrt_int_002",
    numero: "102",
    capacidade: 1,
    tipo: TipoQuarto.BASICO,
    precoDiaria: 150,
    status: StatusQuarto.OCUPADO,
    camas: [new Cama(TipoCama.SOLTEIRO, "c_int_002")],
  });

/** Quarto em manutenção — não pode ser reservado */
export const quartoEmManutencaoFixture = (): Quarto =>
  new Quarto({
    id: "qrt_int_003",
    numero: "103",
    capacidade: 3,
    tipo: TipoQuarto.LUXO,
    precoDiaria: 580,
    status: StatusQuarto.MANUTENCAO,
    camas: [new Cama(TipoCama.CASAL_KING, "c_int_003")],
  });

/** Hóspede válido e já cadastrado */
export const hospedeFixture = (): Hospede =>
  new Hospede({
    id: "hosp_int_001",
    nome: "Carlos",
    sobrenome: "Andrade",
    cpf: "12345678901",
    email: "carlos.andrade@email.com",
  });

/** Segundo hóspede para cenários multi-hóspede */
export const hospede2Fixture = (): Hospede =>
  new Hospede({
    id: "hosp_int_002",
    nome: "Maria",
    sobrenome: "Silva",
    cpf: "98765432100",
    email: "maria.silva@email.com",
  });

/** Reserva ativa pré-existente para testes de cancelamento */
export const reservaAtivaFixture = (quartoId: string, hospedeId: string): Reserva =>
  new Reserva({
    id: "res_int_001",
    quartoId,
    hospedeId,
    status: StatusReserva.ATIVA,
  });

// =============================================================================
// DTOs PADRÃO — evita repetição nos testes
// =============================================================================

export const dtoCadastroHospedeValido = () => ({
  nome: "João",
  sobrenome: "Pereira",
  cpf: "11122233344",
  email: "joao.pereira@hotel.com",
});

export const dtoCadastroQuartoValido = (numero = "201") => ({
  numero,
  capacidade: 2,
  tipo: TipoQuarto.MODERNO,
  precoDiaria: 250,
  temFrigobar: true,
  temCafeDaManha: false,
  temArCondicionado: true,
  temTV: true,
  tiposCama: [TipoCama.CASAL_QUEEN] as TipoCama[],
});
