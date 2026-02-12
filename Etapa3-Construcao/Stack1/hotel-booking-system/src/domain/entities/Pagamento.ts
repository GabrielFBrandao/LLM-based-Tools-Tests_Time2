import { MetodoPagamento, StatusPagamento } from '../enums';

// Entidade: Pagamento
export class Pagamento {
  constructor(
    public readonly id: string,
    public readonly valor: number,
    public readonly data: Date = new Date(),
    public readonly metodo: MetodoPagamento,
    public readonly status: StatusPagamento = StatusPagamento.PENDENTE,
    public readonly codigoTransacao: string = ''
  ) {
    this.validar();
  }

  // Validações do pagamento
  private validar(): void {
    if (this.valor <= 0) {
      throw new Error('Valor do pagamento deve ser maior que zero');
    }

    if (!Object.values(MetodoPagamento).includes(this.metodo)) {
      throw new Error('Método de pagamento inválido');
    }

    if (!Object.values(StatusPagamento).includes(this.status)) {
      throw new Error('Status do pagamento inválido');
    }
  }

  // Processa o pagamento
  processar(codigoTransacao: string): Pagamento {
    if (this.status !== StatusPagamento.PENDENTE) {
      throw new Error('Pagamento já foi processado');
    }

    return new Pagamento(
      this.id,
      this.valor,
      this.data,
      this.metodo,
      StatusPagamento.APROVADO,
      codigoTransacao
    );
  }

  // Recusa o pagamento
  recusar(motivo: string): Pagamento {
    if (this.status !== StatusPagamento.PENDENTE) {
      throw new Error('Pagamento já foi processado');
    }

    return new Pagamento(
      this.id,
      this.valor,
      this.data,
      this.metodo,
      StatusPagamento.RECUSADO,
      motivo
    );
  }

  // Estorna o pagamento
  estornar(): Pagamento {
    if (this.status !== StatusPagamento.APROVADO) {
      throw new Error('Apenas pagamentos aprovados podem ser estornados');
    }

    return new Pagamento(
      this.id,
      this.valor,
      new Date(),
      this.metodo,
      StatusPagamento.ESTORNADO,
      `ESTORNO_${this.codigoTransacao}`
    );
  }

  // Reembolsa o pagamento
  reembolsar(): Pagamento {
    if (this.status !== StatusPagamento.APROVADO) {
      throw new Error('Apenas pagamentos aprovados podem ser reembolsados');
    }

    return new Pagamento(
      this.id,
      this.valor,
      new Date(),
      this.metodo,
      StatusPagamento.REEMBOLSADO,
      `REEMBOLSO_${this.codigoTransacao}`
    );
  }

  // Verifica se o pagamento está pendente
  estaPendente(): boolean {
    return this.status === StatusPagamento.PENDENTE;
  }

  // Verifica se o pagamento foi aprovado
  foiAprovado(): boolean {
    return this.status === StatusPagamento.APROVADO;
  }

  // Verifica se o pagamento foi recusado
  foiRecusado(): boolean {
    return this.status === StatusPagamento.RECUSADO;
  }

  // Verifica se o pagamento foi estornado
  foiEstornado(): boolean {
    return this.status === StatusPagamento.ESTORNADO;
  }

  // Verifica se o pagamento foi reembolsado
  foiReembolsado(): boolean {
    return this.status === StatusPagamento.REEMBOLSADO;
  }

  // Retorna descrição formatada do método
  getMetodoDescricao(): string {
    const descricoes = {
      [MetodoPagamento.CARTAO_CREDITO]: 'Cartão de Crédito',
      [MetodoPagamento.CARTAO_DEBITO]: 'Cartão de Débito',
      [MetodoPagamento.DINHEIRO]: 'Dinheiro',
      [MetodoPagamento.PIX]: 'PIX',
      [MetodoPagamento.TRANSFERENCIA]: 'Transferência Bancária'
    };

    return descricoes[this.metodo];
  }

  // Retorna descrição formatada do status
  getStatusDescricao(): string {
    const descricoes = {
      [StatusPagamento.PENDENTE]: 'Pendente',
      [StatusPagamento.APROVADO]: 'Aprovado',
      [StatusPagamento.RECUSADO]: 'Recusado',
      [StatusPagamento.ESTORNADO]: 'Estornado',
      [StatusPagamento.REEMBOLSADO]: 'Reembolsado'
    };

    return descricoes[this.status];
  }

  // Formata o valor para exibição
  getValorFormatado(): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(this.valor);
  }

  // Formata a data para exibição
  getDataFormatada(): string {
    return this.data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Cria um novo pagamento
  static criar(
    valor: number,
    metodo: MetodoPagamento
  ): Pagamento {
    return new Pagamento(
      this.gerarId(),
      valor,
      new Date(),
      metodo
    );
  }

  // Gera ID único
  private static gerarId(): string {
    return `pagamento_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Converte para objeto JSON
  toJSON() {
    return {
      id: this.id,
      valor: this.valor,
      valorFormatado: this.getValorFormatado(),
      data: this.data.toISOString(),
      dataFormatada: this.getDataFormatada(),
      metodo: this.metodo,
      metodoDescricao: this.getMetodoDescricao(),
      status: this.status,
      statusDescricao: this.getStatusDescricao(),
      codigoTransacao: this.codigoTransacao
    };
  }

  // Cria instância a partir de objeto JSON
  static fromJSON(dados: any): Pagamento {
    return new Pagamento(
      dados.id,
      dados.valor,
      new Date(dados.data),
      dados.metodo,
      dados.status,
      dados.codigoTransacao || ''
    );
  }

  // Verifica se o pagamento é igual a outro
  equals(outra: Pagamento): boolean {
    return this.id === outra.id;
  }

  // Validação completa
  ehValido(): boolean {
    try {
      this.validar();
      return true;
    } catch {
      return false;
    }
  }
}
