import { QuartoRepository } from '../ports/QuartoRepository.js';
import { QuartoListaDTO } from '../dtos/QuartoListaDTO.js';

// Caso de uso de leitura (Query). Não altera estado; retorna DTO específico para a lista.
export class ListarQuartos {
  constructor(private readonly repo: QuartoRepository) {}

  async execute(): Promise<QuartoListaDTO[]> {
    const quartos = await this.repo.listar();
    return quartos.map(q => ({
      id: q.id!,
      numero: q.numero.valor,
      tipo: q.tipo,
      precoHora: q.precoHora.valor,
      disponibilidade: q.disponibilidade,
    }));
  }
}
