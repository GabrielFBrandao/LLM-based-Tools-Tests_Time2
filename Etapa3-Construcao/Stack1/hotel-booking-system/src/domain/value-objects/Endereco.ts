// Value Object: Endereço
export class Endereco {
  constructor(
    public readonly logradouro: string,
    public readonly numero: string,
    public readonly complemento: string = '',
    public readonly bairro: string,
    public readonly cidade: string,
    public readonly estado: string,
    public readonly cep: string,
    public readonly pais: string = 'Brasil'
  ) {}

  // Validação básica do CEP
  private validarCEP(cep: string): boolean {
    const cepRegex = /^\d{5}-\d{3}$/;
    return cepRegex.test(cep);
  }

  // Formatação do endereço completo
  get enderecoCompleto(): string {
    let endereco = `${this.logradouro}, ${this.numero}`;
    
    if (this.complemento) {
      endereco += ` - ${this.complemento}`;
    }
    
    endereco += `, ${this.bairro}`;
    endereco += `, ${this.cidade} - ${this.estado}`;
    endereco += `, ${this.cep}`;
    
    return endereco;
  }

  // Verifica se o endereço é válido
  ehValido(): boolean {
    return (
      this.logradouro.trim().length > 0 &&
      this.numero.trim().length > 0 &&
      this.bairro.trim().length > 0 &&
      this.cidade.trim().length > 0 &&
      this.estado.trim().length > 0 &&
      this.validarCEP(this.cep)
    );
  }

  // Cria uma cópia do endereço com novos valores
  atualizar(dados: Partial<Endereco>): Endereco {
    return new Endereco(
      dados.logradouro ?? this.logradouro,
      dados.numero ?? this.numero,
      dados.complemento ?? this.complemento,
      dados.bairro ?? this.bairro,
      dados.cidade ?? this.cidade,
      dados.estado ?? this.estado,
      dados.cep ?? this.cep,
      dados.pais ?? this.pais
    );
  }

  // Converte para objeto JSON
  toJSON() {
    return {
      logradouro: this.logradouro,
      numero: this.numero,
      complemento: this.complemento,
      bairro: this.bairro,
      cidade: this.cidade,
      estado: this.estado,
      cep: this.cep,
      pais: this.pais
    };
  }

  // Cria instância a partir de objeto JSON
  static fromJSON(dados: any): Endereco {
    return new Endereco(
      dados.logradouro,
      dados.numero,
      dados.complemento || '',
      dados.bairro,
      dados.cidade,
      dados.estado,
      dados.cep,
      dados.pais || 'Brasil'
    );
  }
}
