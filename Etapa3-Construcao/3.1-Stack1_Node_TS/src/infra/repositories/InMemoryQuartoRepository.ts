import { Quarto } from '../../domain/entities/Quarto.js';
import { NumeroQuarto } from '../../domain/value-objects/NumeroQuarto.js';
import { QuartoRepository } from '../../application/quartos/ports/QuartoRepository.js';
import { randomUUID } from 'node:crypto';

// Implementação em memória para desenvolvimento/testes.
// Em produção, substitua por ORM (TypeORM/Prisma) mantendo a mesma interface.
export class InMemoryQuartoRepository implements QuartoRepository {
  private store = new Map<string, Quarto>();

  async salvar(quarto: Quarto): Promise<Quarto> {
    const id = quarto.id ?? randomUUID();
    // @ts-ignore — acesso controlado, em produção prefira método de setId
    quarto._id = id; // Comentário: simples para demo; evitar em código real.
    this.store.set(id, quarto);
    return quarto;
  }

  async atualizar(quarto: Quarto): Promise<Quarto> {
    if (!quarto.id || !this.store.has(quarto.id)) throw new Error('Quarto inexistente');
    this.store.set(quarto.id, quarto);
    return quarto;
  }

  async obterPorId(id: string): Promise<Quarto | null> {
    return this.store.get(id) ?? null;
  }

  async obterPorNumero(numero: NumeroQuarto): Promise<Quarto | null> {
    for (const q of this.store.values()) {
      if (q.numero.valor === numero.valor) return q;
    }
    return null;
  }

  async listar(): Promise<Quarto[]> {
    return Array.from(this.store.values()).filter(q => q.ativo);
  }
}
