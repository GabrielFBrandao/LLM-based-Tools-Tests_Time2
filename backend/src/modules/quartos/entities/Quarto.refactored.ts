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

export enum Amenidade {
  FRIGOBAR = 'FRIGOBAR',
  CAFE = 'CAFE',
  AR_CONDICIONADO = 'AR_CONDICIONADO',
  TV = 'TV'
}

export class Cama {
  constructor(
    private readonly _id: number,
    private readonly _quartoId: number,
    private readonly _tipoCama: TipoCama,
    private readonly _createdAt: Date = new Date()
  ) {}

  get id(): number { return this._id; }
  get quartoId(): number { return this._quartoId; }
  get tipoCama(): TipoCama { return this._tipoCama; }
  get createdAt(): Date { return this._createdAt; }
}

abstract class QuartoState {
  abstract podeReservar(): boolean;
  abstract proximosEstadosPermitidos(): StatusQuarto[];
}

class QuartoLivreState extends QuartoState {
  podeReservar(): boolean { return true; }
  proximosEstadosPermitidos(): StatusQuarto[] {
    return [StatusQuarto.OCUPADO, StatusQuarto.MANUTENCAO, StatusQuarto.LIMPEZA];
  }
}

class QuartoOcupadoState extends QuartoState {
  podeReservar(): boolean { return false; }
  proximosEstadosPermitidos(): StatusQuarto[] {
    return [StatusQuarto.LIVRE, StatusQuarto.LIMPEZA];
  }
}

class QuartoManutencaoState extends QuartoState {
  podeReservar(): boolean { return false; }
  proximosEstadosPermitidos(): StatusQuarto[] {
    return [StatusQuarto.LIVRE];
  }
}

class QuartoLimpezaState extends QuartoState {
  podeReservar(): boolean { return false; }
  proximosEstadosPermitidos(): StatusQuarto[] {
    return [StatusQuarto.LIVRE, StatusQuarto.OCUPADO];
  }
}

interface QuartoConfig {
  id: number;
  numero: number;
  capacidade: number;
  tipo: TipoQuarto;
  precoDiaria: number;
  amenidades?: Set<Amenidade>;
  status?: StatusQuarto;
  camas?: Cama[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Quarto {
  private readonly _id: number;
  private readonly _numero: number;
  private _capacidade: number;
  private _tipo: TipoQuarto;
  private _precoDiaria: number;
  private _amenidades: Set<Amenidade>;
  private _status: StatusQuarto;
  private _state: QuartoState;
  private _camas: Cama[];
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(config: QuartoConfig) {
    this.validarConfig(config);
    
    this._id = config.id;
    this._numero = config.numero;
    this._capacidade = config.capacidade;
    this._tipo = config.tipo;
    this._precoDiaria = config.precoDiaria;
    this._amenidades = config.amenidades || new Set();
    this._status = config.status || StatusQuarto.LIVRE;
    this._camas = config.camas || [];
    this._createdAt = config.createdAt || new Date();
    this._updatedAt = config.updatedAt || new Date();
    this._state = this.criarState(this._status);
  }

  private validarConfig(config: QuartoConfig): void {
    if (config.numero <= 0) throw new Error('Número do quarto deve ser maior que zero');
    if (config.capacidade <= 0) throw new Error('Capacidade deve ser maior que zero');
    if (config.precoDiaria < 0) throw new Error('Preço da diária não pode ser negativo');
  }

  private criarState(status: StatusQuarto): QuartoState {
    switch (status) {
      case StatusQuarto.LIVRE: return new QuartoLivreState();
      case StatusQuarto.OCUPADO: return new QuartoOcupadoState();
      case StatusQuarto.MANUTENCAO: return new QuartoManutencaoState();
      case StatusQuarto.LIMPEZA: return new QuartoLimpezaState();
      default: throw new Error('Status inválido');
    }
  }

  adicionarCama(cama: Cama): void {
    this._camas.push(cama);
    this._updatedAt = new Date();
  }

  removerCama(camaId: number): void {
    this._camas = this._camas.filter(c => c.id !== camaId);
    this._updatedAt = new Date();
  }

  alterarStatus(novoStatus: StatusQuarto): void {
    if (!this._state.proximosEstadosPermitidos().includes(novoStatus)) {
      throw new Error(`Transição de status inválida: ${this._status} -> ${novoStatus}`);
    }
    this._status = novoStatus;
    this._state = this.criarState(novoStatus);
    this._updatedAt = new Date();
  }

  adicionarAmenidade(amenidade: Amenidade): void {
    this._amenidades.add(amenidade);
    this._updatedAt = new Date();
  }

  removerAmenidade(amenidade: Amenidade): void {
    this._amenidades.delete(amenidade);
    this._updatedAt = new Date();
  }

  temAmenidade(amenidade: Amenidade): boolean {
    return this._amenidades.has(amenidade);
  }

  atualizarPrecoDiaria(novoPreco: number): void {
    if (novoPreco < 0) throw new Error('Preço da diária não pode ser negativo');
    this._precoDiaria = novoPreco;
    this._updatedAt = new Date();
  }

  calcularPrecoTotal(dias: number): number {
    if (dias <= 0) throw new Error('Número de dias deve ser maior que zero');
    return this._precoDiaria * dias;
  }

  isDisponivel(): boolean {
    return this._state.podeReservar();
  }

  get id(): number { return this._id; }
  get numero(): number { return this._numero; }
  get capacidade(): number { return this._capacidade; }
  get tipo(): TipoQuarto { return this._tipo; }
  get precoDiaria(): number { return this._precoDiaria; }
  get status(): StatusQuarto { return this._status; }
  get amenidades(): Set<Amenidade> { return new Set(this._amenidades); }
  get camas(): Cama[] { return [...this._camas]; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }
}
