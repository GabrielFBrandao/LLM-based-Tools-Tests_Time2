// Base Error
export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific Errors
export class QuartoNaoEncontradoError extends DomainError {
  constructor(id?: number) {
    super(id ? `Quarto com ID ${id} não encontrado` : 'Quarto não encontrado');
  }
}

export class QuartoJaExisteError extends DomainError {
  constructor(numero: number) {
    super(`Quarto com número ${numero} já existe`);
  }
}

export class QuartoOcupadoError extends DomainError {
  constructor() {
    super('Não é possível realizar esta operação em quarto ocupado');
  }
}

export class TransicaoStatusInvalidaError extends DomainError {
  constructor(statusAtual: string, novoStatus: string) {
    super(`Transição de status inválida: ${statusAtual} -> ${novoStatus}`);
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}
