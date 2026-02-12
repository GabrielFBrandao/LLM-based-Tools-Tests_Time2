/**
 * Enums para tipagem forte e evitar magic strings
 * Decisão: Usar enums ao invés de strings literais para:
 * - Type safety em tempo de compilação
 * - Autocomplete no IDE
 * - Refatoração segura
 */

// Tipos de quarto disponíveis no hotel
export enum TipoQuarto {
  BASICO = 'BASICO',
  MODERNO = 'MODERNO',
  LUXO = 'LUXO'
}

// Status possíveis de um quarto
// Decisão: Usar enum para controlar estados válidos e facilitar validações
export enum StatusQuarto {
  LIVRE = 'LIVRE',           // Disponível para reserva
  OCUPADO = 'OCUPADO',       // Reservado/Ocupado
  MANUTENCAO = 'MANUTENCAO', // Em manutenção (não disponível)
  LIMPEZA = 'LIMPEZA'        // Em limpeza (temporariamente indisponível)
}

// Tipos de cama suportados
export enum TipoCama {
  SOLTEIRO = 'SOLTEIRO',
  CASAL_KING = 'CASAL_KING',
  CASAL_QUEEN = 'CASAL_QUEEN'
}

/**
 * Classe Cama - Representa uma cama dentro de um quarto
 * Decisão de Design:
 * - Classe separada para permitir múltiplas camas por quarto
 * - Imutável após criação (apenas getters públicos)
 * - Relacionamento 1:N com Quarto
 */
export class Cama {
  constructor(
    public id: number,
    public quartoId: number,
    public tipoCama: TipoCama,
    public createdAt: Date = new Date()
  ) {}

  getTipo(): TipoCama {
    return this.tipoCama;
  }

  getQuartoId(): number {
    return this.quartoId;
  }
}

/**
 * State Pattern - Gerencia transições de status do quarto
 * Decisão: Usar State Pattern porque:
 * - Encapsula comportamento específico de cada estado
 * - Facilita adição de novos estados sem modificar código existente (OCP)
 * - Valida transições de estado de forma centralizada
 * - Evita condicionais complexos espalhados pelo código
 */
abstract class QuartoState {
  abstract podeReservar(): boolean;
  abstract proximosEstadosPermitidos(): StatusQuarto[];
}

class QuartoLivreState extends QuartoState {
  podeReservar(): boolean {
    return true;
  }

  proximosEstadosPermitidos(): StatusQuarto[] {
    return [StatusQuarto.OCUPADO, StatusQuarto.MANUTENCAO, StatusQuarto.LIMPEZA];
  }
}

class QuartoOcupadoState extends QuartoState {
  podeReservar(): boolean {
    return false;
  }

  proximosEstadosPermitidos(): StatusQuarto[] {
    return [StatusQuarto.LIVRE, StatusQuarto.LIMPEZA];
  }
}

class QuartoManutencaoState extends QuartoState {
  podeReservar(): boolean {
    return false;
  }

  proximosEstadosPermitidos(): StatusQuarto[] {
    return [StatusQuarto.LIVRE];
  }
}

class QuartoLimpezaState extends QuartoState {
  podeReservar(): boolean {
    return false;
  }

  proximosEstadosPermitidos(): StatusQuarto[] {
    return [StatusQuarto.LIVRE, StatusQuarto.OCUPADO];
  }
}

/**
 * Classe Quarto - Entidade principal do domínio
 * Decisões de Design:
 * - Encapsulamento: state é privado, acesso via métodos públicos
 * - Validações no construtor garantem objeto sempre válido
 * - State Pattern para gerenciar status
 * - Composição com Cama (1:N)
 * - Imutabilidade de dados críticos (id, numero após criação)
 */
export class Quarto {
  // State privado - implementa State Pattern
  private state: QuartoState;

  constructor(
    public id: number,
    public numero: number,
    public capacidade: number,
    public tipo: TipoQuarto,
    public precoDiaria: number,
    public temFrigobar: boolean = false,
    public temCafe: boolean = false,
    public temArCondicionado: boolean = false,
    public temTV: boolean = false,
    public status: StatusQuarto = StatusQuarto.LIVRE,
    public camas: Cama[] = [],
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    this.state = this.criarState(status);
    this.validarDados();
  }

  /**
   * Valida dados no construtor
   * Decisão: Fail-fast - lançar erro imediatamente se dados inválidos
   * Garante que objeto Quarto nunca existe em estado inválido
   */
  private validarDados(): void {
    if (this.numero <= 0) {
      throw new Error('Número do quarto deve ser maior que zero');
    }
    if (this.capacidade <= 0) {
      throw new Error('Capacidade deve ser maior que zero');
    }
    if (this.precoDiaria < 0) {
      throw new Error('Preço da diária não pode ser negativo');
    }
  }

  /**
   * Factory Method para criar instância correta de State
   * Decisão: Centralizar criação de states para facilitar manutenção
   */
  private criarState(status: StatusQuarto): QuartoState {
    switch (status) {
      case StatusQuarto.LIVRE:
        return new QuartoLivreState();
      case StatusQuarto.OCUPADO:
        return new QuartoOcupadoState();
      case StatusQuarto.MANUTENCAO:
        return new QuartoManutencaoState();
      case StatusQuarto.LIMPEZA:
        return new QuartoLimpezaState();
      default:
        throw new Error('Status inválido');
    }
  }

  /**
   * Adiciona cama ao quarto
   * Decisão: Método público para permitir composição dinâmica
   * Atualiza updatedAt automaticamente
   */
  adicionarCama(cama: Cama): void {
    this.camas.push(cama);
    this.updatedAt = new Date();
  }

  removerCama(camaId: number): void {
    this.camas = this.camas.filter(cama => cama.id !== camaId);
    this.updatedAt = new Date();
  }

  /**
   * Altera status do quarto com validação
   * Decisão: Validar transição antes de alterar (State Pattern)
   * Lança erro se transição inválida (fail-fast)
   */
  alterarStatus(novoStatus: StatusQuarto): void {
    if (!this.validarTransicaoStatus(novoStatus)) {
      throw new Error(
        `Transição de status inválida: ${this.status} -> ${novoStatus}`
      );
    }
    this.status = novoStatus;
    this.state = this.criarState(novoStatus);
    this.updatedAt = new Date();
  }

  validarTransicaoStatus(novoStatus: StatusQuarto): boolean {
    return this.state.proximosEstadosPermitidos().includes(novoStatus);
  }

  isDisponivel(): boolean {
    return this.state.podeReservar();
  }

  calcularPrecoTotal(dias: number): number {
    if (dias <= 0) {
      throw new Error('Número de dias deve ser maior que zero');
    }
    return this.precoDiaria * dias;
  }

  /**
   * Retorna cópia das camas
   * Decisão: Retornar cópia para evitar modificação externa (encapsulamento)
   * Protege invariantes do objeto
   */
  getCamas(): Cama[] {
    return [...this.camas];
  }

  getNumero(): number {
    return this.numero;
  }

  getTipo(): TipoQuarto {
    return this.tipo;
  }

  getStatus(): StatusQuarto {
    return this.status;
  }

  getPrecoDiaria(): number {
    return this.precoDiaria;
  }
}
