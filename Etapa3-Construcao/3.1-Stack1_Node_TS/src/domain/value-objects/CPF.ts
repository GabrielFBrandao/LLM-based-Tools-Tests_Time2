// Value Object para CPF com validação básica de formato e dígitos verificadores.
// Mantém a regra encapsulada e reutilizável no domínio.
export class CPF {
  private readonly _valor: string;

  private constructor(valor: string) {
    this._valor = valor;
  }

  public static criar(valor: string): CPF {
    const apenasDigitos = valor.replace(/\D/g, '');
    if (apenasDigitos.length !== 11) {
      throw new Error('CPF inválido: tamanho incorreto');
    }
    if (/^(\d)\1{10}$/.test(apenasDigitos)) {
      throw new Error('CPF inválido: repetição');
    }
    if (!CPF.validarDigitos(apenasDigitos)) {
      throw new Error('CPF inválido: dígitos verificadores');
    }
    return new CPF(apenasDigitos);
  }

  get valor(): string {
    return this._valor;
  }

  private static validarDigitos(cpf: string): boolean {
    const calcDV = (base: string, fatorInicial: number) => {
      let total = 0;
      for (let i = 0; i < base.length; i++) total += parseInt(base[i], 10) * (fatorInicial - i);
      const resto = total % 11;
      const dv = resto < 2 ? 0 : 11 - resto;
      return dv;
    };
    const dv1 = calcDV(cpf.slice(0, 9), 10);
    const dv2 = calcDV(cpf.slice(0, 10), 11);
    return dv1 === parseInt(cpf[9], 10) && dv2 === parseInt(cpf[10], 10);
  }
}
