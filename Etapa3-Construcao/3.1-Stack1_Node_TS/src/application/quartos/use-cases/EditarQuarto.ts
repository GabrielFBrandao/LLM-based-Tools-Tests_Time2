import { QuartoRepository } from '../ports/QuartoRepository.js';
import { EditarQuartoDTO } from '../dtos/EditarQuartoDTO.js';
import { PrecoHora } from '../../../domain/value-objects/PrecoHora.js';
import { NotFoundError } from '../../common/errors/NotFoundError.js';
import { TipoCama } from '../../../domain/enums/TipoCama.js';

// Caso de uso de edição. Mantém SRP: apenas orquestra entidade + repositório.
export class EditarQuarto {
  constructor(private readonly repo: QuartoRepository) {}

  async execute(input: EditarQuartoDTO) {
    const quarto = await this.repo.obterPorId(input.id);
    if (!quarto) throw new NotFoundError('Quarto não encontrado');

    const updates: any = {};
    if (input.capacidade !== undefined) updates.capacidade = input.capacidade;
    if (input.tipo !== undefined) updates.tipo = input.tipo;
    if (input.precoHora !== undefined) updates.precoHora = PrecoHora.criar(input.precoHora);
    if (input.frigobar !== undefined) updates.frigobar = input.frigobar;
    if (input.cafeManha !== undefined) updates.cafeManha = input.cafeManha;
    if (input.arCondicionado !== undefined) updates.arCondicionado = input.arCondicionado;
    if (input.tv !== undefined) updates.tv = input.tv;

    quarto.atualizarDados(updates);

    if (input.camas) {
      // Garante domínio fechado para tipos de cama
      input.camas.forEach(c => { if (!(c in TipoCama)) throw new Error('Tipo de cama inválido'); });
      quarto.definirCamas(input.camas);
    }

    return this.repo.atualizar(quarto);
  }
}
