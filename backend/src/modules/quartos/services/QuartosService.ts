import { Quarto, Cama, StatusQuarto } from '../entities';
import { IQuartoRepository } from '../interfaces/IQuartoRepository';
import { 
  CriarQuartoDTO, 
  AtualizarQuartoDTO, 
  QuartoResponseDTO,
  ListarQuartosResponseDTO 
} from '../dtos/QuartoDTO';
import { QuartoResponseMapper, QuartoListMapper, CamaMapper } from '../dtos/QuartoMappers';
import { 
  QuartoNaoEncontradoError, 
  QuartoJaExisteError,
  QuartoOcupadoError 
} from '../errors/QuartoErrors';
import { CriarQuartoValidator } from '../validators/QuartoValidators';

// Service seguindo Single Responsibility Principle
export class QuartosService {
  private readonly responseMapper: QuartoResponseMapper;
  private readonly listMapper: QuartoListMapper;
  private readonly validator: CriarQuartoValidator;

  constructor(
    private readonly repository: IQuartoRepository,
    validator?: CriarQuartoValidator
  ) {
    const camaMapper = new CamaMapper();
    this.responseMapper = new QuartoResponseMapper(camaMapper);
    this.listMapper = new QuartoListMapper();
    this.validator = validator || this.createDefaultValidator();
  }

  private createDefaultValidator(): CriarQuartoValidator {
    const { 
      NumeroQuartoValidator,
      CapacidadeValidator,
      PrecoValidator,
      TipoQuartoValidator 
    } = require('../validators/QuartoValidators');
    
    return new CriarQuartoValidator(
      new NumeroQuartoValidator(),
      new CapacidadeValidator(),
      new PrecoValidator(),
      new TipoQuartoValidator()
    );
  }

  async criar(dto: CriarQuartoDTO): Promise<QuartoResponseDTO> {
    this.validator.validate(dto);

    await this.verificarNumeroUnico(dto.numero);

    const quarto = this.criarQuartoFromDTO(dto);
    const quartoCriado = await this.repository.create(quarto);
    
    return this.responseMapper.toDTO(quartoCriado);
  }

  async atualizar(id: number, dto: AtualizarQuartoDTO): Promise<QuartoResponseDTO> {
    const quarto = await this.buscarQuartoOuFalhar(id);

    this.aplicarAtualizacoes(quarto, dto);

    const quartoAtualizado = await this.repository.update(id, quarto);
    return this.responseMapper.toDTO(quartoAtualizado);
  }

  async buscarPorId(id: number): Promise<QuartoResponseDTO> {
    const quarto = await this.buscarQuartoOuFalhar(id);
    return this.responseMapper.toDTO(quarto);
  }

  async listar(): Promise<ListarQuartosResponseDTO[]> {
    const quartos = await this.repository.findAll();
    return quartos.map(q => this.listMapper.toDTO(q));
  }

  async listarDisponiveis(): Promise<ListarQuartosResponseDTO[]> {
    const quartos = await this.repository.findByStatus(StatusQuarto.LIVRE);
    return quartos.map(q => this.listMapper.toDTO(q));
  }

  async alterarStatus(id: number, novoStatus: StatusQuarto): Promise<QuartoResponseDTO> {
    const quarto = await this.buscarQuartoOuFalhar(id);

    quarto.alterarStatus(novoStatus);
    
    const quartoAtualizado = await this.repository.update(id, quarto);
    return this.responseMapper.toDTO(quartoAtualizado);
  }

  async deletar(id: number): Promise<void> {
    const quarto = await this.buscarQuartoOuFalhar(id);

    if (quarto.status === StatusQuarto.OCUPADO) {
      throw new QuartoOcupadoError();
    }

    await this.repository.delete(id);
  }

  // Métodos privados para Clean Code
  private async verificarNumeroUnico(numero: number): Promise<void> {
    const quartoExistente = await this.repository.findByNumero(numero);
    if (quartoExistente) {
      throw new QuartoJaExisteError(numero);
    }
  }

  private async buscarQuartoOuFalhar(id: number): Promise<Quarto> {
    const quarto = await this.repository.findById(id);
    if (!quarto) {
      throw new QuartoNaoEncontradoError(id);
    }
    return quarto;
  }

  private criarQuartoFromDTO(dto: CriarQuartoDTO): Quarto {
    const quarto = new Quarto(
      0,
      dto.numero,
      dto.capacidade,
      dto.tipo,
      dto.precoDiaria,
      dto.temFrigobar,
      dto.temCafe,
      dto.temArCondicionado,
      dto.temTV
    );

    dto.camas.forEach((camaDTO, index) => {
      const cama = new Cama(index + 1, quarto.id, camaDTO.tipoCama);
      quarto.adicionarCama(cama);
    });

    return quarto;
  }

  private aplicarAtualizacoes(quarto: Quarto, dto: AtualizarQuartoDTO): void {
    if (dto.capacidade !== undefined) quarto.capacidade = dto.capacidade;
    if (dto.tipo !== undefined) quarto.tipo = dto.tipo;
    if (dto.precoDiaria !== undefined) quarto.precoDiaria = dto.precoDiaria;
    if (dto.temFrigobar !== undefined) quarto.temFrigobar = dto.temFrigobar;
    if (dto.temCafe !== undefined) quarto.temCafe = dto.temCafe;
    if (dto.temArCondicionado !== undefined) quarto.temArCondicionado = dto.temArCondicionado;
    if (dto.temTV !== undefined) quarto.temTV = dto.temTV;
  }
}
