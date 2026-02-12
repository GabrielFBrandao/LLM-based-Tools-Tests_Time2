// Classe Hospede
export class Hospede {
  constructor(
    public id: number,
    public nome: string,
    public sobrenome: string,
    public cpf: string,
    public email: string,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    this.validarDados();
  }

  private validarDados(): void {
    if (!this.nome || this.nome.trim().length === 0) {
      throw new Error('Nome é obrigatório');
    }
    if (!this.sobrenome || this.sobrenome.trim().length === 0) {
      throw new Error('Sobrenome é obrigatório');
    }
    if (!this.validarCPF()) {
      throw new Error('CPF inválido');
    }
    if (!this.validarEmail()) {
      throw new Error('Email inválido');
    }
  }

  getNomeCompleto(): string {
    return `${this.nome} ${this.sobrenome}`;
  }

  validarCPF(): boolean {
    const cpfLimpo = this.cpf.replace(/[^\d]/g, '');

    if (cpfLimpo.length !== 11) {
      return false;
    }

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpfLimpo)) {
      return false;
    }

    // Validação dos dígitos verificadores
    let soma = 0;
    let resto;

    // Primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.substring(9, 10))) return false;

    // Segundo dígito verificador
    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.substring(10, 11))) return false;

    return true;
  }

  validarEmail(): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(this.email);
  }

  atualizarDados(dados: Partial<Omit<Hospede, 'id' | 'cpf' | 'createdAt'>>): void {
    if (dados.nome !== undefined) {
      if (!dados.nome || dados.nome.trim().length === 0) {
        throw new Error('Nome é obrigatório');
      }
      this.nome = dados.nome;
    }

    if (dados.sobrenome !== undefined) {
      if (!dados.sobrenome || dados.sobrenome.trim().length === 0) {
        throw new Error('Sobrenome é obrigatório');
      }
      this.sobrenome = dados.sobrenome;
    }

    if (dados.email !== undefined) {
      this.email = dados.email;
      if (!this.validarEmail()) {
        throw new Error('Email inválido');
      }
    }

    this.updatedAt = new Date();
  }

  getCPF(): string {
    return this.cpf;
  }

  getEmail(): string {
    return this.email;
  }

  getId(): number {
    return this.id;
  }
}
