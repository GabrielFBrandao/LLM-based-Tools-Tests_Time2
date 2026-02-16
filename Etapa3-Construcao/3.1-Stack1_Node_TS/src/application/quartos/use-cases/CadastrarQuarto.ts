import { QuartoRepository } from '../ports/QuartoRepository.js';
import { CadastrarQuartoDTO } from '../dtos/CadastrarQuartoDTO.js';
import { NumeroQuarto } from '../../../domain/value-objects/NumeroQuarto.js';
import { PrecoHora } from '../../../domain/value-objects/PrecoHora.js';
import { Quarto } from '../../../domain/entities/Quarto.js';
import { CamaQuarto } from '../../../domain/entities/CamaQuarto.js';
import { ConflictError } from '../../common/errors/ConflictError.js';

// Caso de uso para cadastro de quarto. Aplica validações de borda e evita duplicidade.
export class CadastrarQuarto {
  constructor(private readonly repo: QuartoRepository) {}

  async execute(input: CadastrarQuartoDTO): Promise<Quarto> {
    const numero = NumeroQuarto.criar(input.numero);
    const existente = await this.repo.obterPorNumero(numero);
    if (existente) throw new ConflictError('Número de quarto já existe');

    const preco = PrecoHora.criar(input.precoHora);

    const quarto = Quarto.criar({
      numero,
      capacidade: input.capacidade,
      tipo: input.tipo,
      precoHora: preco,
      frigobar: input.frigobar,
      cafeManha: input.cafeManha,
      arCondicionado: input.arCondicionado,
      tv: input.tv,
      camas: input.camas.map(c => new CamaQuarto(c)),
    });

    return this.repo.salvar(quarto);
  }
}
