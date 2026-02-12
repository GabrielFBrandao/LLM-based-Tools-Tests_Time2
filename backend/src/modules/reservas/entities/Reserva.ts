// Enum
export enum StatusReserva {
  ATIVA = 'ATIVA',
  CANCELADA = 'CANCELADA',
  FINALIZADA = 'FINALIZADA'
}

// Classe Reserva
export class Reserva {
  constructor(
    public id: number,
    public quartoId: number,
    public hospedeId: number,
    public dataCheckin: Date,
    public dataCheckout: Date,
    public status: StatusReserva = StatusReserva.ATIVA,
    public valorTotal: number = 0,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    this.validarDados();
  }

  private validarDados(): void {
    if (!this.quartoId || this.quartoId <= 0) {
      throw new Error('ID do quarto inválido');
    }
    if (!this.hospedeId || this.hospedeId <= 0) {
      throw new Error('ID do hóspede inválido');
    }
    if (!this.validarDatas()) {
      throw new Error('Data de checkout deve ser posterior à data de checkin');
    }
    if (this.dataCheckin < new Date(new Date().setHours(0, 0, 0, 0))) {
      throw new Error('Data de checkin não pode ser no passado');
    }
  }

  calcularDiarias(): number {
    const diffTime = this.dataCheckout.getTime() - this.dataCheckin.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  calcularValorTotal(precoDiaria: number): number {
    const diarias = this.calcularDiarias();
    this.valorTotal = precoDiaria * diarias;
    return this.valorTotal;
  }

  cancelar(): void {
    if (this.status === StatusReserva.CANCELADA) {
      throw new Error('Reserva já está cancelada');
    }
    if (this.status === StatusReserva.FINALIZADA) {
      throw new Error('Não é possível cancelar uma reserva finalizada');
    }
    this.status = StatusReserva.CANCELADA;
    this.updatedAt = new Date();
  }

  finalizar(): void {
    if (this.status === StatusReserva.CANCELADA) {
      throw new Error('Não é possível finalizar uma reserva cancelada');
    }
    if (this.status === StatusReserva.FINALIZADA) {
      throw new Error('Reserva já está finalizada');
    }
    this.status = StatusReserva.FINALIZADA;
    this.updatedAt = new Date();
  }

  isAtiva(): boolean {
    return this.status === StatusReserva.ATIVA;
  }

  validarDatas(): boolean {
    return this.dataCheckout > this.dataCheckin;
  }

  alterarDatas(novoCheckin: Date, novoCheckout: Date): void {
    if (!this.isAtiva()) {
      throw new Error('Apenas reservas ativas podem ter datas alteradas');
    }
    if (novoCheckout <= novoCheckin) {
      throw new Error('Data de checkout deve ser posterior à data de checkin');
    }
    if (novoCheckin < new Date(new Date().setHours(0, 0, 0, 0))) {
      throw new Error('Data de checkin não pode ser no passado');
    }
    this.dataCheckin = novoCheckin;
    this.dataCheckout = novoCheckout;
    this.updatedAt = new Date();
  }

  getQuartoId(): number {
    return this.quartoId;
  }

  getHospedeId(): number {
    return this.hospedeId;
  }

  getStatus(): StatusReserva {
    return this.status;
  }

  getValorTotal(): number {
    return this.valorTotal;
  }

  getId(): number {
    return this.id;
  }
}
