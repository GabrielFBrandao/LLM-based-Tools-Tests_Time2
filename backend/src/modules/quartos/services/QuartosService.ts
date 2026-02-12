import { Quarto, Cama, TipoQuarto, StatusQuarto, TipoCama } from '../entities';
import { IQuartoRepository } from '../repositories/QuartoRepository';
import { 
  CriarQuartoDTO, 
  AtualizarQuartoDTO, 
  QuartoResponseDTO,
  CamaResponseDTO,
  ListarQuartosResponseDTO 
} from '../dtos/QuartoDTO';

export class QuartosService {
  constructor(private quartoRepository: IQuartoRepository) {}

  async criar(dto: CriarQuartoDTO): Promise<QuartoResponseDTO> {
    // Validar se número já existe
    const quartoExistente = await this.quartoRepository.findByNumero(dto.numero);
    if (quartoExistente) {
      throw new Error(`Quarto com número ${dto.numero} já existe`);
    }

    // Criar quarto
    const quarto = new Quarto(
      0, // ID será gerado pelo repository
      dto.numero,
      dto.capacidade,
      dto.tipo,
      dto.precoDiaria,
      dto.temFrigobar,
      dto.temCafe,
      dto.temArCondicionado,
      dto.temTV
    );

    // Adicionar camas
    dto.camas.forEach((camaDTO, index) => {
      const cama = new Cama(index + 1, quarto.id, camaDTO.tipoCama);
      quarto.adicionarCama(cama);
    });

    const quartoCriado = await this.quartoRepository.create(quarto);
    return this.toResponseDTO(quartoCriado);
  }

  async atualizar(id: number, dto: AtualizarQuartoDTO): Promise<QuartoResponseDTO> {
    const quarto = await this.quartoRepository.findById(id);
    if (!quarto) {
      throw new Error('Quarto não encontrado');
    }

    // Atualizar apenas campos fornecidos
    if (dto.capacidade !== undefined) quarto.capacidade = dto.capacidade;
    if (dto.tipo !== undefined) quarto.tipo = dto.tipo;
    if (dto.precoDiaria !== undefined) quarto.precoDiaria = dto.precoDiaria;
    if (dto.temFrigobar !== undefined) quarto.temFrigobar = dto.temFrigobar;
    if (dto.temCafe !== undefined) quarto.temCafe = dto.temCafe;
    if (dto.temArCondicionado !== undefined) quarto.temArCondicionado = dto.temArCondicionado;
    if (dto.temTV !== undefined) quarto.temTV = dto.temTV;

    const quartoAtualizado = await this.quartoRepository.update(id, quarto);
    return this.toResponseDTO(quartoAtualizado);
  }

  async buscarPorId(id: number): Promise<QuartoResponseDTO> {
    const quarto = await this.quartoRepository.findById(id);
    if (!quarto) {
      throw new Error('Quarto não encontrado');
    }
    return this.toResponseDTO(quarto);
  }

  async listar(): Promise<ListarQuartosResponseDTO[]> {
    const quartos = await this.quartoRepository.findAll();
    return quartos.map(q => this.toListResponseDTO(q));
  }

  async listarDisponiveis(): Promise<ListarQuartosResponseDTO[]> {
    const quartos = await this.quartoRepository.findByStatus(StatusQuarto.LIVRE);
    return quartos.map(q => this.toListResponseDTO(q));
  }

  async alterarStatus(id: number, novoStatus: StatusQuarto): Promise<QuartoResponseDTO> {
    const quarto = await this.quartoRepository.findById(id);
    if (!quarto) {
      throw new Error('Quarto não encontrado');
    }

    quarto.alterarStatus(novoStatus);
    const quartoAtualizado = await this.quartoRepository.update(id, quarto);
    return this.toResponseDTO(quartoAtualizado);
  }

  async deletar(id: number): Promise<void> {
    const quarto = await this.quartoRepository.findById(id);
    if (!quarto) {
      throw new Error('Quarto não encontrado');
    }

    if (quarto.status === StatusQuarto.OCUPADO) {
      throw new Error('Não é possível deletar quarto ocupado');
    }

    await this.quartoRepository.delete(id);
  }

  private toResponseDTO(quarto: Quarto): QuartoResponseDTO {
    return {
      id: quarto.id,
      numero: quarto.numero,
      capacidade: quarto.capacidade,
      tipo: quarto.tipo,
      precoDiaria: quarto.precoDiaria,
      temFrigobar: quarto.temFrigobar,
      temCafe: quarto.temCafe,
      temArCondicionado: quarto.temArCondicionado,
      temTV: quarto.temTV,
      status: quarto.status,
      camas: quarto.getCamas().map(c => ({
        id: c.id,
        tipoCama: c.tipoCama
      })),
      createdAt: quarto.createdAt,
      updatedAt: quarto.updatedAt
    };
  }

  private toListResponseDTO(quarto: Quarto): ListarQuartosResponseDTO {
    return {
      id: quarto.id,
      numero: quarto.numero,
      tipo: quarto.tipo,
      precoDiaria: quarto.precoDiaria,
      status: quarto.status
    };
  }
}
