// Value Object: Período de Estadia
export class Periodo {
  constructor(
    public readonly checkIn: Date,
    public readonly checkOut: Date
  ) {
    this.validarPeriodo();
  }

  // Validação do período
  private validarPeriodo(): void {
    if (this.checkOut <= this.checkIn) {
      throw new Error('Check-out deve ser posterior ao check-in');
    }

    if (this.checkIn < new Date()) {
      throw new Error('Check-in não pode ser no passado');
    }

    // Verifica se o período é muito longo (ex: mais de 30 dias)
    const dias = this.getNumeroNoites();
    if (dias > 30) {
      throw new Error('Período de estadia não pode exceder 30 dias');
    }
  }

  // Calcula o número de noites
  getNumeroNoites(): number {
    const msPorDia = 24 * 60 * 60 * 1000;
    return Math.ceil((this.checkOut.getTime() - this.checkIn.getTime()) / msPorDia);
  }

  // Verifica se uma data está dentro do período
  contem(data: Date): boolean {
    return data >= this.checkIn && data < this.checkOut;
  }

  // Verifica se há sobreposição com outro período
  sobrepoe(outro: Periodo): boolean {
    return this.checkIn < outro.checkOut && this.checkOut > outro.checkIn;
  }

  // Verifica se o período é válido para reserva
  ehValidoParaReserva(): boolean {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    return this.checkIn >= hoje && this.getNumeroNoites() > 0;
  }

  // Formata o período para exibição
  getPeriodoFormatado(): string {
    const formatarData = (data: Date): string => {
      return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };

    return `${formatarData(this.checkIn)} a ${formatarData(this.checkOut)}`;
  }

  // Cria uma cópia com novas datas
  atualizar(checkIn?: Date, checkOut?: Date): Periodo {
    return new Periodo(
      checkIn ?? this.checkIn,
      checkOut ?? this.checkOut
    );
  }

  // Converte para objeto JSON
  toJSON() {
    return {
      checkIn: this.checkIn.toISOString(),
      checkOut: this.checkOut.toISOString(),
      numeroNoites: this.getNumeroNoites()
    };
  }

  // Cria instância a partir de objeto JSON
  static fromJSON(dados: any): Periodo {
    return new Periodo(
      new Date(dados.checkIn),
      new Date(dados.checkOut)
    );
  }

  // Cria período a partir de strings de data
  static fromStrings(checkInStr: string, checkOutStr: string): Periodo {
    const checkIn = new Date(checkInStr);
    const checkOut = new Date(checkOutStr);
    
    return new Periodo(checkIn, checkOut);
  }

  // Verifica se o período é futuro
  ehFuturo(): boolean {
    return this.checkIn > new Date();
  }

  // Calcula dias até o check-in
  diasAteCheckIn(): number {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const checkIn = new Date(this.checkIn);
    checkIn.setHours(0, 0, 0, 0);
    
    const msPorDia = 24 * 60 * 60 * 1000;
    return Math.ceil((checkIn.getTime() - hoje.getTime()) / msPorDia);
  }
}
