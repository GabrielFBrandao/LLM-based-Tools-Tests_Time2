import { ValidationError } from '../errors/QuartoErrors';
import { TipoQuarto, StatusQuarto, TipoCama } from '../entities';

// Interface Segregation Principle
export interface IValidator<T> {
  validate(data: T): void;
}

// Validator para número do quarto
export class NumeroQuartoValidator implements IValidator<number> {
  validate(numero: number): void {
    if (!numero || numero <= 0) {
      throw new ValidationError('Número do quarto deve ser maior que zero');
    }
  }
}

// Validator para capacidade
export class CapacidadeValidator implements IValidator<number> {
  validate(capacidade: number): void {
    if (!capacidade || capacidade <= 0) {
      throw new ValidationError('Capacidade deve ser maior que zero');
    }
  }
}

// Validator para preço
export class PrecoValidator implements IValidator<number> {
  validate(preco: number): void {
    if (preco < 0) {
      throw new ValidationError('Preço não pode ser negativo');
    }
  }
}

// Validator para tipo de quarto
export class TipoQuartoValidator implements IValidator<string> {
  validate(tipo: string): void {
    if (!Object.values(TipoQuarto).includes(tipo as TipoQuarto)) {
      throw new ValidationError(`Tipo de quarto inválido: ${tipo}`);
    }
  }
}

// Validator para status
export class StatusQuartoValidator implements IValidator<string> {
  validate(status: string): void {
    if (!Object.values(StatusQuarto).includes(status as StatusQuarto)) {
      throw new ValidationError(`Status inválido: ${status}`);
    }
  }
}

// Validator para tipo de cama
export class TipoCamaValidator implements IValidator<string> {
  validate(tipoCama: string): void {
    if (!Object.values(TipoCama).includes(tipoCama as TipoCama)) {
      throw new ValidationError(`Tipo de cama inválido: ${tipoCama}`);
    }
  }
}

// Validator composto para criar quarto
export class CriarQuartoValidator {
  constructor(
    private numeroValidator: NumeroQuartoValidator,
    private capacidadeValidator: CapacidadeValidator,
    private precoValidator: PrecoValidator,
    private tipoValidator: TipoQuartoValidator
  ) {}

  validate(data: {
    numero: number;
    capacidade: number;
    precoDiaria: number;
    tipo: string;
  }): void {
    this.numeroValidator.validate(data.numero);
    this.capacidadeValidator.validate(data.capacidade);
    this.precoValidator.validate(data.precoDiaria);
    this.tipoValidator.validate(data.tipo);
  }
}
