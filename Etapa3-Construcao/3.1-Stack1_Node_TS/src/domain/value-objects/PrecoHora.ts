// Value Object para Preço por Hora (ou Diária adaptável), com validações de faixa.
export class PrecoHora {
  private readonly _valor: number;

  private constructor(valor: number) {
    this._valor = valor;
  }

  public static criar(valor: number): PrecoHora {
    if (typeof valor !== 'number' || Number.isNaN(valor) || valor <= 0 || valor > 100000) {
      throw new Error('Preço por hora inválido');
    }
    return new PrecoHora(Number(valor.toFixed(2)));
  }

  get valor(): number {
    return this._valor;
  }
}
