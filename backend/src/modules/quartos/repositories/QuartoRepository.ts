import { Quarto, StatusQuarto } from '../entities';
import { IQuartoRepository } from '../interfaces/IQuartoRepository';
import { QuartoNaoEncontradoError } from '../errors/QuartoErrors';

// Implementação em memória seguindo Dependency Inversion Principle
export class QuartoRepositoryInMemory implements IQuartoRepository {
  private quartos: Map<number, Quarto> = new Map();
  private currentId = 1;

  async findAll(): Promise<Quarto[]> {
    return Array.from(this.quartos.values());
  }

  async findById(id: number): Promise<Quarto | null> {
    return this.quartos.get(id) || null;
  }

  async findByNumero(numero: number): Promise<Quarto | null> {
    return Array.from(this.quartos.values())
      .find(q => q.numero === numero) || null;
  }

  async findByStatus(status: StatusQuarto): Promise<Quarto[]> {
    return Array.from(this.quartos.values())
      .filter(q => q.status === status);
  }

  async create(quarto: Quarto): Promise<Quarto> {
    const id = this.currentId++;
    quarto.id = id;
    this.quartos.set(id, quarto);
    return quarto;
  }

  async update(id: number, dados: Partial<Quarto>): Promise<Quarto> {
    const quarto = this.quartos.get(id);
    if (!quarto) {
      throw new QuartoNaoEncontradoError(id);
    }

    Object.assign(quarto, dados);
    quarto.updatedAt = new Date();
    this.quartos.set(id, quarto);
    
    return quarto;
  }

  async delete(id: number): Promise<void> {
    const exists = this.quartos.has(id);
    if (!exists) {
      throw new QuartoNaoEncontradoError(id);
    }
    this.quartos.delete(id);
  }
}
