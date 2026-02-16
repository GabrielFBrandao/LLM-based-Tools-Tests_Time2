import { TipoCama } from '../enums/TipoCama.js';

// Entidade de associação para suportar N camas por quarto.
export class CamaQuarto {
  // Em produção poderia ser um UUID; aqui mantemos simples.
  constructor(public readonly tipoCama: TipoCama) {}
}
