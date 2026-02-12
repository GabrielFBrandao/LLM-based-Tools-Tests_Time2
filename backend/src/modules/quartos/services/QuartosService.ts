/**
 * QuartosService - Camada de Lógica de Negócio
 * 
 * Decisões de Design:
 * - Dependency Inversion: depende de IQuartoRepository (abstração)
 * - Single Responsibility: apenas lógica de negócio de quartos
 * - Métodos privados para Clean Code (extrair complexidade)
 * - Fail-fast: lança erros imediatamente quando regra violada
 * - Mappers injetados para separação de responsabilidades
 * 
 * Responsabilidades:
 * - Orquestrar operações de negócio
 * - Validar regras de negócio
 * - Coordenar repository e mappers
 * - Lançar erros de domínio apropriados
 * 
 * NÃO faz:
 * - Acesso direto a banco de dados (usa repository)
 * - Tratamento de HTTP (responsabilidade do controller)
 * - Validações de formato (usa validators)
 */

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

export class QuartosService {
  // Mappers como propriedades readonly (imutáveis após construção)
  private readonly responseMapper: QuartoResponseMapper;
  private readonly listMapper: QuartoListMapper;
  private readonly validator: CriarQuartoValidator;

  /**
   * Construtor com Dependency Injection
   * Decisão: Injetar dependências para facilitar testes e flexibilidade
   * - repository: obrigatório (dependência crítica)
   * - validator: opcional (cria default se não fornecido)
   */
  constructor(
    private readonly repository: IQuartoRepository,
    validator?: CriarQuartoValidator
  ) {
    const camaMapper = new CamaMapper();
    this.responseMapper = new QuartoResponseMapper(camaMapper);
    this.listMapper = new QuartoListMapper();
    this.validator = validator || this.createDefaultValidator();
  }

  /**
   * Factory method para criar validator padrão
   * Decisão: Encapsular criação de dependências complexas
   * Permite injetar validator customizado em testes
   */
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

  /**
   * Cria novo quarto
   * 
   * Fluxo:
   * 1. Validar dados de entrada (formato)
   * 2. Verificar regra de negócio (número único)
   * 3. Criar entidade de domínio
   * 4. Persistir via repository
   * 5. Retornar DTO de resposta
   * 
   * Decisão: Métodos privados para cada etapa (Clean Code)
   */
  async criar(dto: CriarQuartoDTO): Promise<QuartoResponseDTO> {
    this.validator.validate(dto);

    await this.verificarNumeroUnico(dto.numero);

    const quarto = this.criarQuartoFromDTO(dto);
    const quartoCriado = await this.repository.create(quarto);
    
    return this.responseMapper.toDTO(quartoCriado);
  }

  /**
   * Atualiza quarto existente
   * 
   * Decisão: Atualização parcial (apenas campos fornecidos)
   * - Busca quarto ou falha (fail-fast)
   * - Aplica atualizações via método privado
   * - Persiste e retorna DTO
   */
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

  /**
   * Deleta quarto
   * 
   * Regra de Negócio: Não pode deletar quarto ocupado
   * Decisão: Validar regra antes de deletar (fail-fast)
   */
  async deletar(id: number): Promise<void> {
    const quarto = await this.buscarQuartoOuFalhar(id);

    if (quarto.status === StatusQuarto.OCUPADO) {
      throw new QuartoOcupadoError();
    }

    await this.repository.delete(id);
  }

  // ========== Métodos Privados - Clean Code ==========
  // Decisão: Extrair lógica complexa em métodos privados descritivos
  // Benefícios: Legibilidade, testabilidade, reutilização

  /**
   * Verifica se número do quarto já existe
   * Decisão: Método privado para encapsular regra de negócio
   * Lança erro se já existe (fail-fast)
   */
  private async verificarNumeroUnico(numero: number): Promise<void> {
    const quartoExistente = await this.repository.findByNumero(numero);
    if (quartoExistente) {
      throw new QuartoJaExisteError(numero);
    }
  }

  /**
   * Busca quarto ou lança erro
   * Decisão: Método privado reutilizável para evitar repetição (DRY)
   * Fail-fast: lança erro imediatamente se não encontrado
   */
  private async buscarQuartoOuFalhar(id: number): Promise<Quarto> {
    const quarto = await this.repository.findById(id);
    if (!quarto) {
      throw new QuartoNaoEncontradoError(id);
    }
    return quarto;
  }

  /**
   * Cria entidade Quarto a partir de DTO
   * Decisão: Encapsular lógica de criação complexa
   * Adiciona camas ao quarto durante criação
   */
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

  /**
   * Aplica atualizações parciais ao quarto
   * Decisão: Atualizar apenas campos fornecidos (undefined = não atualizar)
   * Evita sobrescrever dados não intencionalmente
   */
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
