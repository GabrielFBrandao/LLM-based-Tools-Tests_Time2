import { Endereco } from '../value-objects/Endereco';

// Entidade: Hóspede
export class Hospede {
  constructor(
    public readonly id: string,
    public readonly nome: string,
    public readonly sobrenome: string,
    public readonly cpf: string,
    public readonly email: string,
    public readonly telefone: string = '',
    public readonly endereco: Endereco | null = null,
    public readonly dataCadastro: Date = new Date()
  ) {
    this.validar();
  }

  // Validações do hóspede
  private validar(): void {
    if (!this.nome || this.nome.trim().length === 0) {
      throw new Error('Nome é obrigatório');
    }

    if (!this.sobrenome || this.sobrenome.trim().length === 0) {
      throw new Error('Sobrenome é obrigatório');
    }

    if (!this.validarCPF(this.cpf)) {
      throw new Error('CPF inválido');
    }

    if (!this.validarEmail(this.email)) {
      throw new Error('E-mail inválido');
    }
  }

  // Validação de CPF
  private validarCPF(cpf: string): boolean {
    // Remove caracteres não numéricos
    const cpfNumerico = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (cpfNumerico.length !== 11) {
      return false;
    }

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpfNumerico)) {
      return false;
    }

    // Validação do dígito verificador
    let soma = 0;
    let resto;

    // Valida primeiro dígito
    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpfNumerico.substring(i - 1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfNumerico.substring(9, 10))) {
      return false;
    }

    // Valida segundo dígito
    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpfNumerico.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfNumerico.substring(10, 11))) {
      return false;
    }

    return true;
  }

  // Validação de e-mail
  private validarEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Retorna o nome completo
  get nomeCompleto(): string {
    return `${this.nome} ${this.sobrenome}`.trim();
  }

  // Retorna o CPF formatado
  get cpfFormatado(): string {
    const cpfNumerico = this.cpf.replace(/\D/g, '');
    return cpfNumerico.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  // Retorna o telefone formatado
  get telefoneFormatado(): string {
    if (!this.telefone) return '';
    
    const telefoneNumerico = this.telefone.replace(/\D/g, '');
    
    if (telefoneNumerico.length === 11) {
      return telefoneNumerico.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (telefoneNumerico.length === 10) {
      return telefoneNumerico.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    
    return this.telefone;
  }

  // Atualiza dados do hóspede
  atualizarDados(dados: Partial<DadosHospede>): Hospede {
    return new Hospede(
      this.id,
      dados.nome ?? this.nome,
      dados.sobrenome ?? this.sobrenome,
      dados.cpf ?? this.cpf,
      dados.email ?? this.email,
      dados.telefone ?? this.telefone,
      dados.endereco ?? this.endereco,
      this.dataCadastro
    );
  }

  // Atualiza endereço
  atualizarEndereco(endereco: Endereco): Hospede {
    return new Hospede(
      this.id,
      this.nome,
      this.sobrenome,
      this.cpf,
      this.email,
      this.telefone,
      endereco,
      this.dataCadastro
    );
  }

  // Verifica se o hóspede tem endereço completo
  temEnderecoCompleto(): boolean {
    return this.endereco !== null && this.endereco.ehValido();
  }

  // Verifica se o hóspede tem telefone
  temTelefone(): boolean {
    return this.telefone.trim().length > 0;
  }

  // Verifica se é um hóspede recém-cadastrado (últimos 30 dias)
  ehRecemCadastrado(): boolean {
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
    
    return this.dataCadastro >= trintaDiasAtras;
  }

  // Cria um novo hóspede
  static criar(
    nome: string,
    sobrenome: string,
    cpf: string,
    email: string,
    telefone: string = '',
    endereco: Endereco | null = null
  ): Hospede {
    return new Hospede(
      this.gerarId(),
      nome,
      sobrenome,
      cpf,
      email,
      telefone,
      endereco
    );
  }

  // Gera ID único
  private static gerarId(): string {
    return `hospede_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Converte para objeto JSON
  toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      sobrenome: this.sobrenome,
      nomeCompleto: this.nomeCompleto,
      cpf: this.cpf,
      cpfFormatado: this.cpfFormatado,
      email: this.email,
      telefone: this.telefone,
      telefoneFormatado: this.telefoneFormatado,
      endereco: this.endereco ? this.endereco.toJSON() : null,
      dataCadastro: this.dataCadastro.toISOString(),
      temEnderecoCompleto: this.temEnderecoCompleto(),
      temTelefone: this.temTelefone(),
      ehRecemCadastrado: this.ehRecemCadastrado()
    };
  }

  // Cria instância a partir de objeto JSON
  static fromJSON(dados: any): Hospede {
    const endereco = dados.endereco ? Endereco.fromJSON(dados.endereco) : null;
    
    return new Hospede(
      dados.id,
      dados.nome,
      dados.sobrenome,
      dados.cpf,
      dados.email,
      dados.telefone || '',
      endereco,
      new Date(dados.dataCadastro)
    );
  }

  // Verifica se o hóspede é igual a outro
  equals(outra: Hospede): boolean {
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

  // Busca hóspedes por nome ou CPF
  static buscarPorTermo(termo: string, hospedes: Hospede[]): Hospede[] {
    const termoNormalizado = termo.toLowerCase().trim();
    
    return hospedes.filter(hospede => 
      hospede.nome.toLowerCase().includes(termoNormalizado) ||
      hospede.sobrenome.toLowerCase().includes(termoNormalizado) ||
      hospede.cpf.replace(/\D/g, '').includes(termo.replace(/\D/g, '')) ||
      hospede.email.toLowerCase().includes(termoNormalizado)
    );
  }
}

// Interface para atualização de dados
export interface DadosHospede {
  nome?: string;
  sobrenome?: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  endereco?: Endereco | null;
}
