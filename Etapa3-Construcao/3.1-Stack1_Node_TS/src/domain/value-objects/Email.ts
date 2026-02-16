// Value Object para Email com validação de formato.
export class Email {
  private readonly _valor: string;

  private constructor(valor: string) {
    this._valor = valor.toLowerCase();
  }

  public static criar(valor: string): Email {
    const trimmed = valor.trim();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(trimmed)) {
      throw new Error('Email inválido');
    }
    return new Email(trimmed);
  }

  get valor(): string {
    return this._valor;
  }
}
