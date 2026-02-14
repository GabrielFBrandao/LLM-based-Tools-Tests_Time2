/**
 * =============================================================================
 * CAMADA DE SERVIÇO — QuartoService
 *
 * Regras de negócio do módulo Gestão de Quartos.
 * Extraído do hotel-management.tsx para ser testável de forma independente.
 *
 * PRINCÍPIOS APLICADOS:
 * - SRP: apenas regras de negócio de quartos
 * - DIP: depende de IQuartoRepository (interface), não da implementação
 * - Resultado<T>: sem exceções para erros de negócio previsíveis
 * =============================================================================
 */

import { Cama, CriarQuartoDTO, EditarQuartoDTO, Quarto, Resultado, StatusQuarto } from "./domain";
import { IQuartoRepository } from "./repository";

export class QuartoService {
  // Injeção de dependência pelo construtor (DIP)
  constructor(private readonly repository: IQuartoRepository) {}

  /**
   * Cadastra um novo quarto (UC01 / RF01).
   *
   * Regras de negócio validadas:
   * - RN01: Número do quarto deve ser único
   * - RN03: Preço por diária deve ser maior que zero
   * - RN04: Capacidade deve ser maior que zero
   * - RN05: Todo quarto deve ter pelo menos um tipo de cama
   * - Pós-condição UC01: status inicial sempre LIVRE
   */
  cadastrarQuarto(dto: CriarQuartoDTO): Resultado<Quarto> {
    // RN01: unicidade do número
    const quartoExistente = this.repository.buscarPorNumero(dto.numero);
    if (quartoExistente) {
      return {
        sucesso: false,
        erro: `Já existe um quarto com o número "${dto.numero}".`,
      };
    }

    // RN03: preço positivo
    if (dto.precoDiaria <= 0) {
      return { sucesso: false, erro: "O preço por diária deve ser maior que zero." };
    }

    // RN04: capacidade positiva
    if (dto.capacidade <= 0) {
      return { sucesso: false, erro: "A capacidade deve ser maior que zero." };
    }

    // RN05: pelo menos uma cama
    if (!dto.tiposCama || dto.tiposCama.length === 0) {
      return { sucesso: false, erro: "O quarto deve ter pelo menos um tipo de cama." };
    }

    const camas = dto.tiposCama.map((tipo) => new Cama(tipo));
    const novoQuarto = new Quarto({
      numero: dto.numero.trim(),
      capacidade: dto.capacidade,
      tipo: dto.tipo,
      precoDiaria: dto.precoDiaria,
      temFrigobar: dto.temFrigobar,
      temCafeDaManha: dto.temCafeDaManha,
      temArCondicionado: dto.temArCondicionado,
      temTV: dto.temTV,
      camas,
      status: StatusQuarto.LIVRE, // pós-condição UC01
    });

    const quartoSalvo = this.repository.salvar(novoQuarto);
    return { sucesso: true, dados: quartoSalvo };
  }

  /**
   * Edita um quarto existente (UC03 / RF03).
   *
   * Regras de negócio validadas:
   * - Quarto deve existir pelo ID
   * - RN01: novo número deve ser único (exceto o próprio quarto)
   * - RN03: preço, se fornecido, deve ser maior que zero
   * - RN04: capacidade, se fornecida, deve ser maior que zero
   * - Camas só são atualizadas se a lista for não-vazia
   */
  editarQuarto(id: string, dto: EditarQuartoDTO): Resultado<Quarto> {
    const quartoAtual = this.repository.buscarPorId(id);
    if (!quartoAtual) {
      return { sucesso: false, erro: "Quarto não encontrado." };
    }

    // RN01: verifica unicidade apenas se o número foi alterado
    if (dto.numero && dto.numero !== quartoAtual.numero) {
      const duplicado = this.repository.buscarPorNumero(dto.numero);
      if (duplicado) {
        return {
          sucesso: false,
          erro: `Já existe outro quarto com o número "${dto.numero}".`,
        };
      }
    }

    if (dto.precoDiaria !== undefined && dto.precoDiaria <= 0) {
      return { sucesso: false, erro: "O preço por diária deve ser maior que zero." };
    }

    if (dto.capacidade !== undefined && dto.capacidade <= 0) {
      return { sucesso: false, erro: "A capacidade deve ser maior que zero." };
    }

    // Camas só são reconstruídas se a lista foi fornecida e não-vazia
    const novasCamas =
      dto.tiposCama && dto.tiposCama.length > 0
        ? dto.tiposCama.map((tipo) => new Cama(tipo))
        : undefined;

    const quartoAtualizado = quartoAtual.copiarCom({
      ...(dto.numero && { numero: dto.numero.trim() }),
      ...(dto.capacidade && { capacidade: dto.capacidade }),
      ...(dto.tipo && { tipo: dto.tipo }),
      ...(dto.precoDiaria && { precoDiaria: dto.precoDiaria }),
      ...(dto.temFrigobar !== undefined && { temFrigobar: dto.temFrigobar }),
      ...(dto.temCafeDaManha !== undefined && { temCafeDaManha: dto.temCafeDaManha }),
      ...(dto.temArCondicionado !== undefined && { temArCondicionado: dto.temArCondicionado }),
      ...(dto.temTV !== undefined && { temTV: dto.temTV }),
      ...(novasCamas && { camas: novasCamas }),
    });

    const quartoSalvo = this.repository.atualizar(quartoAtualizado);
    return { sucesso: true, dados: quartoSalvo };
  }

  alterarStatus(id: string, novoStatus: StatusQuarto): Resultado<Quarto> {
    const quarto = this.repository.buscarPorId(id);
    if (!quarto) {
      return { sucesso: false, erro: "Quarto não encontrado." };
    }
    const quartoAtualizado = quarto.copiarCom({ status: novoStatus });
    const quartoSalvo = this.repository.atualizar(quartoAtualizado);
    return { sucesso: true, dados: quartoSalvo };
  }

  listarQuartos(): Quarto[] {
    return this.repository.listarTodos();
  }

  buscarPorId(id: string): Quarto | undefined {
    return this.repository.buscarPorId(id);
  }
}
