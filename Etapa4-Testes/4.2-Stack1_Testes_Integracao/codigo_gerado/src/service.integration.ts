/**
 * =============================================================================
 * SERVIÇOS — Hóspede e Reserva
 *
 * Implementam as regras de negócio dos módulos que colaboram no fluxo:
 * Cadastro de Hóspede → Criação de Reserva → Atualização de Disponibilidade
 *
 * DECISÃO — SERVIÇOS ESPECIALIZADOS vs SERVICE ÚNICO:
 * Cada serviço tem responsabilidade sobre um único agregado (SRP).
 * A colaboração entre eles ocorre no UseCase de integração — não nos services.
 *
 * DECISÃO — RESULTADO<T> EM VEZ DE EXCEÇÕES:
 * Consistente com QuartoService. Erros de negócio são retornados como dados,
 * não como fluxo de controle (exceptions).
 * =============================================================================
 */

import {
  CancelarReservaDTO,
  CriarHospedeDTO,
  CriarReservaDTO,
  EditarHospedeDTO,
  Hospede,
  Reserva,
  Resultado,
  StatusReserva,
} from "./domain.integration";
import { IHospedeRepository, IReservaRepository } from "./repository.integration";
import { IQuartoRepository } from "./repository";
import { StatusQuarto } from "./domain";

// =============================================================================
// SERVIÇO DE HÓSPEDE
// =============================================================================

export class HospedeService {
  constructor(private readonly repository: IHospedeRepository) {}

  /**
   * Cadastra um novo hóspede (UC05 / RF07).
   *
   * Regras de negócio:
   * - RF09: CPF deve ser único no sistema
   * - RF10: CPF deve ter exatamente 11 dígitos numéricos
   * - RF11: Email deve ser válido (formato básico)
   * - Campos obrigatórios: nome, sobrenome, cpf, email
   */
  cadastrarHospede(dto: CriarHospedeDTO): Resultado<Hospede> {
    if (!dto.nome.trim()) {
      return { sucesso: false, erro: "Nome é obrigatório." };
    }

    if (!dto.sobrenome.trim()) {
      return { sucesso: false, erro: "Sobrenome é obrigatório." };
    }

    // RF10: CPF — apenas dígitos, exatamente 11
    const cpfDigitos = dto.cpf.replace(/\D/g, "");
    if (cpfDigitos.length !== 11) {
      return { sucesso: false, erro: "CPF deve ter exatamente 11 dígitos." };
    }

    // RF09: CPF único
    const hospedeExistente = this.repository.buscarPorCpf(cpfDigitos);
    if (hospedeExistente) {
      return {
        sucesso: false,
        erro: `Já existe um hóspede cadastrado com o CPF "${dto.cpf}".`,
      };
    }

    // RF11: Email — formato básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(dto.email)) {
      return { sucesso: false, erro: "Email inválido." };
    }

    const novoHospede = new Hospede({
      nome: dto.nome,
      sobrenome: dto.sobrenome,
      cpf: dto.cpf,
      email: dto.email,
    });

    const hospedeSalvo = this.repository.salvar(novoHospede);
    return { sucesso: true, dados: hospedeSalvo };
  }

  /**
   * Edita dados de um hóspede existente (UC06).
   * CPF é imutável — não pode ser alterado após cadastro.
   */
  editarHospede(id: string, dto: EditarHospedeDTO): Resultado<Hospede> {
    const hospedeAtual = this.repository.buscarPorId(id);
    if (!hospedeAtual) {
      return { sucesso: false, erro: "Hóspede não encontrado." };
    }

    if (dto.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(dto.email)) {
        return { sucesso: false, erro: "Email inválido." };
      }
    }

    const hospedeAtualizado = new Hospede({
      id: hospedeAtual.id,
      nome: dto.nome ?? hospedeAtual.nome,
      sobrenome: dto.sobrenome ?? hospedeAtual.sobrenome,
      cpf: hospedeAtual.cpf,   // CPF imutável
      email: dto.email ?? hospedeAtual.email,
    });

    const hospedeSalvo = this.repository.salvar(hospedeAtualizado);
    return { sucesso: true, dados: hospedeSalvo };
  }

  buscarPorId(id: string): Hospede | undefined {
    return this.repository.buscarPorId(id);
  }

  listarHospedes(): Hospede[] {
    return this.repository.listarTodos();
  }
}

// =============================================================================
// SERVIÇO DE RESERVA
// =============================================================================

export class ReservaService {
  constructor(
    private readonly reservaRepository: IReservaRepository,
    private readonly quartoRepository: IQuartoRepository,
    private readonly hospedeRepository: IHospedeRepository
  ) {}

  /**
   * Cria uma nova reserva e marca o quarto como OCUPADO (RF12 + RF15).
   *
   * Regras de negócio:
   * - RF18: Quarto deve estar com status LIVRE para ser reservado
   * - Hóspede deve existir no sistema
   * - Quarto deve existir no sistema
   * - Pós-condição RF15: status do quarto muda para OCUPADO automaticamente
   *
   * DECISÃO — ATOMICIDADE:
   * Em produção, criar reserva + mudar status do quarto seria uma transação
   * atômica no banco (ADR-007). Aqui os dois passos estão sequenciais.
   * Se o segundo falhar, o fluxo retorna erro — em produção, rollback automático.
   */
  criarReserva(dto: CriarReservaDTO): Resultado<Reserva> {
    // Valida existência do quarto
    const quarto = this.quartoRepository.buscarPorId(dto.quartoId);
    if (!quarto) {
      return { sucesso: false, erro: "Quarto não encontrado." };
    }

    // RF18: quarto deve estar disponível (status LIVRE)
    if (!quarto.estaDisponivel) {
      return {
        sucesso: false,
        erro: `Quarto "${quarto.numero}" não está disponível. Status atual: ${quarto.status}.`,
      };
    }

    // Valida existência do hóspede
    const hospede = this.hospedeRepository.buscarPorId(dto.hospedeId);
    if (!hospede) {
      return { sucesso: false, erro: "Hóspede não encontrado." };
    }

    // Cria a reserva com status ATIVA
    const novaReserva = new Reserva({
      quartoId: dto.quartoId,
      hospedeId: dto.hospedeId,
    });
    const reservaSalva = this.reservaRepository.salvar(novaReserva);

    // RF15: atualiza status do quarto para OCUPADO automaticamente
    const quartoOcupado = quarto.copiarCom({ status: StatusQuarto.OCUPADO });
    this.quartoRepository.atualizar(quartoOcupado);

    return { sucesso: true, dados: reservaSalva };
  }

  /**
   * Cancela uma reserva e restaura o quarto para LIVRE (RF16 + RF17).
   *
   * Regras de negócio:
   * - Reserva deve existir e estar ATIVA
   * - Pós-condição RF17: status do quarto volta para LIVRE automaticamente
   * - Motivo de cancelamento é obrigatório
   */
  cancelarReserva(id: string, dto: CancelarReservaDTO): Resultado<Reserva> {
    const reserva = this.reservaRepository.buscarPorId(id);
    if (!reserva) {
      return { sucesso: false, erro: "Reserva não encontrada." };
    }

    if (!reserva.estaAtiva) {
      return { sucesso: false, erro: "Reserva já está cancelada." };
    }

    if (!dto.motivo.trim()) {
      return { sucesso: false, erro: "Motivo de cancelamento é obrigatório." };
    }

    // Cancela a reserva via método de domínio (retorna nova instância)
    const reservaCancelada = reserva.cancelar(dto.motivo);
    this.reservaRepository.atualizar(reservaCancelada);

    // RF17: restaura status do quarto para LIVRE
    const quarto = this.quartoRepository.buscarPorId(reserva.quartoId);
    if (quarto) {
      const quartoLivre = quarto.copiarCom({ status: StatusQuarto.LIVRE });
      this.quartoRepository.atualizar(quartoLivre);
    }

    return { sucesso: true, dados: reservaCancelada };
  }

  buscarPorId(id: string): Reserva | undefined {
    return this.reservaRepository.buscarPorId(id);
  }

  listarPorQuarto(quartoId: string): Reserva[] {
    return this.reservaRepository.listarPorQuarto(quartoId);
  }

  listarPorHospede(hospedeId: string): Reserva[] {
    return this.reservaRepository.listarPorHospede(hospedeId);
  }
}
