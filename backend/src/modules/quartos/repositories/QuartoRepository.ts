import { Quarto, StatusQuarto } from '../entities';

export interface IQuartoRepository {
  findAll(): Promise<Quarto[]>;
  findById(id: number): Promise<Quarto | null>;
  findByNumero(numero: number): Promise<Quarto | null>;
  findByStatus(status: StatusQuarto): Promise<Quarto[]>;
  create(quarto: Quarto): Promise<Quarto>;
  update(id: number, quarto: Partial<Quarto>): Promise<Quarto>;
  delete(id: number): Promise<void>;
}

// Implementação em memória para exemplo
export class QuartoRepositoryInMemory implements IQuartoRepository {
  private quartos: Quarto[] = [];
  private currentId = 1;

  async findAll(): Promise<Quarto[]> {
    return [...this.quartos];
  }

  async findById(id: number): Promise<Quarto | null> {
    return this.quartos.find(q => q.id === id) || null;
  }

  async findByNumero(numero: number): Promise<Quarto | null> {
    return this.quartos.find(q => q.numero === numero) || null;
  }

  async findByStatus(status: StatusQuarto): Promise<Quarto[]> {
    return this.quartos.filter(q => q.status === status);
  }

  async create(quarto: Quarto): Promise<Quarto> {
    quarto.id = this.currentId++;
    this.quartos.push(quarto);
    return quarto;
  }

  async update(id: number, dados: Partial<Quarto>): Promise<Quarto> {
    const index = this.quartos.findIndex(q => q.id === id);
    if (index === -1) {
      throw new Error('Quarto não encontrado');
    }

    const quarto = this.quartos[index];
    Object.assign(quarto, dados);
    quarto.updatedAt = new Date();
    
    return quarto;
  }

  async delete(id: number): Promise<void> {
    const index = this.quartos.findIndex(q => q.id === id);
    if (index === -1) {
      throw new Error('Quarto não encontrado');
    }
    this.quartos.splice(index, 1);
  }
}
