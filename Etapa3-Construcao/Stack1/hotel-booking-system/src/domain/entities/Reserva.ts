import { StatusReserva } from '../enums';
import { Quarto } from './Quarto';
import { Hospede } from './Hospede';
import { Periodo } from '../value-objects/Periodo';
import { Pagamento } from './Pagamento';

// Entidade: Reserva
export class Reserva {
  constructor(
    public readonly id: string,
    public readonly codigoReserva: string,
    public readonly hospede: Hospede,
    public readonly quarto: Quarto,
    public readonly periodo: Periodo,
    public readonly status: StatusReserva = StatusReserva.PENDENTE,
    public readonly valorTotal: number = 0,
    public readonly hospedesAdicionais: Hospede[] = [],
    public readonly pagamentos: Pagamento[] = [],
    public readonly dataCriacao: Date = new Date(),
    public readonly dataCheckIn: Date | null = null,
    public readonly dataCheckOut: Date | null = null
  ) {
    this.validar();
  }

  // Validações da reserva
  private validar(): void {
    if (!this.hospede) {
      throw new Error('Hóspede é obrigatório');
    }

    if (!this.quarto) {
      throw new Error('Quarto é obrigatório');
    }

    if (!this.periodo) {
      throw new Error('Período é obrigatório');
    }

    if (!Object.values(StatusReserva).includes(this.status)) {
      throw new Error('Status da reserva inválido');
    }

    if (this.valorTotal < 0) {
      throw new Error('Valor total não pode ser negativo');
    }
  }

  // Calcula o valor total da reserva
  calcularValorTotal(): number {
    const valorBase = this.quarto.calcularPrecoTotal(this.periodo);
    const numeroHospedes = 1 + this.hospedesAdicionais.length;
    
    // Adiciona taxa adicional por hóspede extra
    let valorTotal = valorBase;
    if (numeroHospedes > this.quarto.capacidade) {
      const taxaExtra = 50 * (numeroHospedes - this.quarto.capacidade) * this.periodo.getNumeroNoites();
      valorTotal += taxaExtra;
    }

    return valorTotal;
  }

  // Adiciona um hóspede adicional
  adicionarHospede(hospede: Hospede): Reserva {
    if (this.status !== StatusReserva.PENDENTE) {
      throw new Error('Apenas reservas pendentes podem ser modificadas');
    }

    // Verifica se o hóspede já está na reserva
    if (this.hospede.equals(hospede) || 
        this.hospedesAdicionais.some(h => h.equals(hospede))) {
      throw new Error('Hóspede já está na reserva');
    }

    const novosHospedesAdicionais = [...this.hospedesAdicionais, hospede];
    const novoValorTotal = this.calcularValorTotal();

    return new Reserva(
      this.id,
      this.codigoReserva,
      this.hospede,
      this.quarto,
      this.periodo,
      this.status,
      novoValorTotal,
      novosHospedesAdicionais,
      this.pagamentos,
      this.dataCriacao,
      this.dataCheckIn,
      this.dataCheckOut
    );
  }

  // Remove um hóspede adicional
  removerHospede(hospedeId: string): Reserva {
    if (this.status !== StatusReserva.PENDENTE) {
      throw new Error('Apenas reservas pendentes podem ser modificadas');
    }

    const novosHospedesAdicionais = this.hospedesAdicionais.filter(h => h.id !== hospedeId);
    const novoValorTotal = this.calcularValorTotal();

    return new Reserva(
      this.id,
      this.codigoReserva,
      this.hospede,
      this.quarto,
      this.periodo,
      this.status,
      novoValorTotal,
      novosHospedesAdicionais,
      this.pagamentos,
      this.dataCriacao,
      this.dataCheckIn,
      this.dataCheckOut
    );
  }

  // Confirma a reserva
  confirmar(): Reserva {
    if (this.status !== StatusReserva.PENDENTE) {
      throw new Error('Apenas reservas pendentes podem ser confirmadas');
    }

    return new Reserva(
      this.id,
      this.codigoReserva,
      this.hospede,
      this.quarto,
      this.periodo,
      StatusReserva.CONFIRMADA,
      this.valorTotal,
      this.hospedesAdicionais,
      this.pagamentos,
      this.dataCriacao,
      this.dataCheckIn,
      this.dataCheckOut
    );
  }

  // Realiza o check-in
  realizarCheckIn(): Reserva {
    if (this.status !== StatusReserva.CONFIRMADA) {
      throw new Error('Apenas reservas confirmadas podem fazer check-in');
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const checkIn = new Date(this.periodo.checkIn);
    checkIn.setHours(0, 0, 0, 0);

    if (hoje < checkIn) {
      throw new Error('Check-in só pode ser realizado a partir da data de check-in');
    }

    return new Reserva(
      this.id,
      this.codigoReserva,
      this.hospede,
      this.quarto,
      this.periodo,
      StatusReserva.CHECK_IN,
      this.valorTotal,
      this.hospedesAdicionais,
      this.pagamentos,
      this.dataCriacao,
      new Date(),
      this.dataCheckOut
    );
  }

  // Realiza o check-out
  realizarCheckOut(): Reserva {
    if (this.status !== StatusReserva.CHECK_IN) {
      throw new Error('Apenas reservas em check-in podem fazer check-out');
    }

    return new Reserva(
      this.id,
      this.codigoReserva,
      this.hospede,
      this.quarto,
      this.periodo,
      StatusReserva.CHECK_OUT,
      this.valorTotal,
      this.hospedesAdicionais,
      this.pagamentos,
      this.dataCriacao,
      this.dataCheckIn,
      new Date()
    );
  }

  // Cancela a reserva
  cancelar(motivo: string = ''): Reserva {
    if (this.status === StatusReserva.CHECK_OUT || this.status === StatusReserva.CANCELADA) {
      throw new Error('Reserva já finalizada ou cancelada');
    }

    return new Reserva(
      this.id,
      this.codigoReserva,
      this.hospede,
      this.quarto,
      this.periodo,
      StatusReserva.CANCELADA,
      this.valorTotal,
      this.hospedesAdicionais,
      this.pagamentos,
      this.dataCriacao,
      this.dataCheckIn,
      this.dataCheckOut
    );
  }

  // Registra no-show (hóspede não compareceu)
  registrarNoShow(): Reserva {
    if (this.status !== StatusReserva.CONFIRMADA) {
      throw new Error('Apenas reservas confirmadas podem ser marcadas como no-show');
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const checkIn = new Date(this.periodo.checkIn);
    checkIn.setHours(0, 0, 0, 0);

    if (hoje <= checkIn) {
      throw new Error('No-show só pode ser registrado após a data de check-in');
    }

    return new Reserva(
      this.id,
      this.codigoReserva,
      this.hospede,
      this.quarto,
      this.periodo,
      StatusReserva.NO_SHOW,
      this.valorTotal,
      this.hospedesAdicionais,
      this.pagamentos,
      this.dataCriacao,
      this.dataCheckIn,
      this.dataCheckOut
    );
  }

  // Adiciona um pagamento
  adicionarPagamento(pagamento: Pagamento): Reserva {
    const novosPagamentos = [...this.pagamentos, pagamento];
    
    return new Reserva(
      this.id,
      this.codigoReserva,
      this.hospede,
      this.quarto,
      this.periodo,
      this.status,
      this.valorTotal,
      this.hospedesAdicionais,
      novosPagamentos,
      this.dataCriacao,
      this.dataCheckIn,
      this.dataCheckOut
    );
  }

  // Calcula o valor total pago
  getValorPago(): number {
    return this.pagamentos
      .filter(p => p.foiAprovado())
      .reduce((total, pagamento) => total + pagamento.valor, 0);
  }

  // Calcula o valor restante a pagar
  getValorRestante(): number {
    return this.valorTotal - this.getValorPago();
  }

  // Verifica se a reserva está totalmente paga
  estaTotalmentePaga(): boolean {
    return this.getValorRestante() <= 0;
  }

  // Retorna todos os hóspedes da reserva
  getTodosHospedes(): Hospede[] {
    return [this.hospede, ...this.hospedesAdicionais];
  }

  // Retorna o número total de hóspedes
  getNumeroTotalHospedes(): number {
    return 1 + this.hospedesAdicionais.length;
  }

  // Verifica se a reserva está ativa
  estaAtiva(): boolean {
    return this.status === StatusReserva.CONFIRMADA || 
           this.status === StatusReserva.CHECK_IN;
  }

  // Verifica se a reserva está finalizada
  estaFinalizada(): boolean {
    return this.status === StatusReserva.CHECK_OUT || 
           this.status === StatusReserva.CANCELADA || 
           this.status === StatusReserva.NO_SHOW;
  }

  // Retorna descrição formatada do status
  getStatusDescricao(): string {
    const descricoes = {
      [StatusReserva.PENDENTE]: 'Pendente',
      [StatusReserva.CONFIRMADA]: 'Confirmada',
      [StatusReserva.CHECK_IN]: 'Check-in Realizado',
      [StatusReserva.CHECK_OUT]: 'Check-out Realizado',
      [StatusReserva.CANCELADA]: 'Cancelada',
      [StatusReserva.NO_SHOW]: 'Não Compareceu'
    };

    return descricoes[this.status];
  }

  // Formata o valor total para exibição
  getValorTotalFormatado(): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(this.valorTotal);
  }

  // Formata o valor pago para exibição
  getValorPagoFormatado(): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(this.getValorPago());
  }

  // Formata o valor restante para exibição
  getValorRestanteFormatado(): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(this.getValorRestante());
  }

  // Cria uma nova reserva
  static criar(
    hospede: Hospede,
    quarto: Quarto,
    periodo: Periodo
  ): Reserva {
    const reserva = new Reserva(
      Reserva.gerarId(),
      Reserva.gerarCodigoReserva(),
      hospede,
      quarto,
      periodo,
      StatusReserva.PENDENTE,
      0,
      [],
      [],
      new Date()
    );

    // Calcula o valor total
    const valorTotal = reserva.calcularValorTotal();
    
    return new Reserva(
      reserva.id,
      reserva.codigoReserva,
      hospede,
      quarto,
      periodo,
      StatusReserva.PENDENTE,
      valorTotal,
      [],
      [],
      new Date()
    );
  }

  // Gera ID único
  private static gerarId(): string {
    return `reserva_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Gera código de reserva único
  private static gerarCodigoReserva(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `RES-${timestamp}-${random}`;
  }

  // Converte para objeto JSON
  toJSON() {
    return {
      id: this.id,
      codigoReserva: this.codigoReserva,
      hospede: this.hospede.toJSON(),
      quarto: this.quarto.toJSON(),
      periodo: this.periodo.toJSON(),
      status: this.status,
      statusDescricao: this.getStatusDescricao(),
      valorTotal: this.valorTotal,
      valorTotalFormatado: this.getValorTotalFormatado(),
      valorPago: this.getValorPago(),
      valorPagoFormatado: this.getValorPagoFormatado(),
      valorRestante: this.getValorRestante(),
      valorRestanteFormatado: this.getValorRestanteFormatado(),
      estaTotalmentePaga: this.estaTotalmentePaga(),
      hospedesAdicionais: this.hospedesAdicionais.map(h => h.toJSON()),
      pagamentos: this.pagamentos.map(p => p.toJSON()),
      dataCriacao: this.dataCriacao.toISOString(),
      dataCheckIn: this.dataCheckIn?.toISOString() || null,
      dataCheckOut: this.dataCheckOut?.toISOString() || null,
      numeroTotalHospedes: this.getNumeroTotalHospedes(),
      estaAtiva: this.estaAtiva(),
      estaFinalizada: this.estaFinalizada()
    };
  }

  // Cria instância a partir de objeto JSON
  static fromJSON(dados: any): Reserva {
    const hospede = Hospede.fromJSON(dados.hospede);
    const quarto = Quarto.fromJSON(dados.quarto);
    const periodo = Periodo.fromJSON(dados.periodo);
    const hospedesAdicionais = dados.hospedesAdicionais ? 
      dados.hospedesAdicionais.map((h: any) => Hospede.fromJSON(h)) : [];
    const pagamentos = dados.pagamentos ? 
      dados.pagamentos.map((p: any) => Pagamento.fromJSON(p)) : [];

    return new Reserva(
      dados.id,
      dados.codigoReserva,
      hospede,
      quarto,
      periodo,
      dados.status,
      dados.valorTotal,
      hospedesAdicionais,
      pagamentos,
      new Date(dados.dataCriacao),
      dados.dataCheckIn ? new Date(dados.dataCheckIn) : null,
      dados.dataCheckOut ? new Date(dados.dataCheckOut) : null
    );
  }

  // Verifica se a reserva é igual a outra
  equals(outra: Reserva): boolean {
    return this.id === outra.id;
  }

  // Validação completa
  ehValida(): boolean {
    try {
      this.validar();
      return true;
    } catch {
      return false;
    }
  }
}
