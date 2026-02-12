import { TipoCama } from '../enums';

// Entidade: Cama
export class Cama {
  constructor(
    public readonly id: string,
    public readonly tipo: TipoCama,
    public readonly quartoId: string
  ) {}

  // Verifica se é cama de solteiro
  ehSolteiro(): boolean {
    return this.tipo === TipoCama.SOLTEIRO;
  }

  // Verifica se é cama de casal
  ehCasal(): boolean {
    return this.tipo === TipoCama.CASAL_KING || this.tipo === TipoCama.CASAL_QUEEN;
  }

  // Verifica se é cama King
  ehKing(): boolean {
    return this.tipo === TipoCama.CASAL_KING;
  }

  // Verifica se é cama Queen
  ehQueen(): boolean {
    return this.tipo === TipoCama.CASAL_QUEEN;
  }

  // Retorna a capacidade da cama (número de pessoas)
  getCapacidade(): number {
    return this.ehSolteiro() ? 1 : 2;
  }

  // Retorna descrição formatada
  getDescricao(): string {
    const descricoes = {
      [TipoCama.SOLTEIRO]: 'Cama de Solteiro',
      [TipoCama.CASAL_KING]: 'Cama de Casal King',
      [TipoCama.CASAL_QUEEN]: 'Cama de Casal Queen'
    };

    return descricoes[this.tipo];
  }

  // Cria uma nova cama
  static criar(tipo: TipoCama, quartoId: string): Cama {
    return new Cama(
      this.gerarId(),
      tipo,
      quartoId
    );
  }

  // Gera ID único
  private static gerarId(): string {
    return `cama_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Converte para objeto JSON
  toJSON() {
    return {
      id: this.id,
      tipo: this.tipo,
      quartoId: this.quartoId,
      capacidade: this.getCapacidade(),
      descricao: this.getDescricao()
    };
  }

  // Cria instância a partir de objeto JSON
  static fromJSON(dados: any): Cama {
    return new Cama(
      dados.id,
      dados.tipo,
      dados.quartoId
    );
  }

  // Verifica se a cama é igual a outra
  equals(outra: Cama): boolean {
    return this.id === outra.id;
  }

  // Validação básica
  ehValida(): boolean {
    return (
      this.id.length > 0 &&
      Object.values(TipoCama).includes(this.tipo) &&
      this.quartoId.length > 0
    );
  }
}
