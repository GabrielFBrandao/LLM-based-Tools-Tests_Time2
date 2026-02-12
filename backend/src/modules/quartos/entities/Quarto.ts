// Enums
export enum TipoQuarto {
  BASICO = 'BASICO',
  MODERNO = 'MODERNO',
  LUXO = 'LUXO'
}

export enum StatusQuarto {
  LIVRE = 'LIVRE',
  OCUPADO = 'OCUPADO',
  MANUTENCAO = 'MANUTENCAO',
  LIMPEZA = 'LIMPEZA'
}

export enum TipoCama {
  SOLTEIRO = 'SOLTEIRO',
  CASAL_KING = 'CASAL_KING',
  CASAL_QUEEN = 'CASAL_QUEEN'
}

// Classe Cama
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

// State Pattern para gerenciar status do quarto
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

// Classe Quarto
export class Quarto {
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

  adicionarCama(cama: Cama): void {
    this.camas.push(cama);
    this.updatedAt = new Date();
  }

  removerCama(camaId: number): void {
    this.camas = this.camas.filter(cama => cama.id !== camaId);
    this.updatedAt = new Date();
  }

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
