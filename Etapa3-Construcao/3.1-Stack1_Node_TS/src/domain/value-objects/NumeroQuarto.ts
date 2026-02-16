// Value Object para Número de Quarto, garantindo faixa válida e imutabilidade.
export class NumeroQuarto {
  private readonly _valor: number;

  private constructor(valor: number) {
    this._valor = valor;
  }

  public static criar(valor: number): NumeroQuarto {
    if (!Number.isInteger(valor) || valor <= 0 || valor > 9999) {
      throw new Error('Número de quarto inválido');
    }
    return new NumeroQuarto(valor);
  }

  get valor(): number {
    return this._valor;
  }
}
