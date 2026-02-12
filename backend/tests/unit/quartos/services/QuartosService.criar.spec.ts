/**
 * Testes Unitários - QuartosService.criar()
 * 
 * Estratégia de Teste:
 * - Usar mocks para isolar o service
 * - Testar comportamento, não implementação
 * - Cobrir casos de sucesso e falha
 * - Seguir padrão AAA (Arrange, Act, Assert)
 */

import { QuartosService } from '../../../src/modules/quartos/services/QuartosService';
import { IQuartoRepository } from '../../../src/modules/quartos/interfaces/IQuartoRepository';
import { Quarto, TipoQuarto, StatusQuarto, TipoCama } from '../../../src/modules/quartos/entities';
import { QuartoJaExisteError } from '../../../src/modules/quartos/errors/QuartoErrors';
import { CriarQuartoDTO } from '../../../src/modules/quartos/dtos/QuartoDTO';

describe('QuartosService - Cadastro de Quarto', () => {
  let service: QuartosService;
  let mockRepository: jest.Mocked<IQuartoRepository>;

  /**
   * Setup antes de cada teste
   * Decisão: Criar mocks frescos para cada teste (isolamento)
   */
  beforeEach(() => {
    // Criar mock do repository
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByNumero: jest.fn(),
      findByStatus: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    // Criar service com repository mockado
    service = new QuartosService(mockRepository);
  });

  /**
   * Limpar mocks após cada teste
   * Decisão: Garantir que testes não interferem entre si
   */
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Cenários de Sucesso', () => {
    /**
     * Teste: Deve criar quarto com dados válidos
     * Cenário mais comum e importante
     */
    it('deve criar quarto com dados válidos', async () => {
      // Arrange - Preparar dados de teste
      const dto: CriarQuartoDTO = {
        numero: 101,
        capacidade: 2,
        tipo: TipoQuarto.MODERNO,
        precoDiaria: 150.00,
        temFrigobar: true,
        temCafe: true,
        temArCondicionado: true,
        temTV: true,
        camas: [
          { tipoCama: TipoCama.CASAL_QUEEN }
        ]
      };

      // Mock: número não existe (pode criar)
      mockRepository.findByNumero.mockResolvedValue(null);

      // Mock: repository retorna quarto criado
      const quartoEsperado = new Quarto(
        1,
        dto.numero,
        dto.capacidade,
        dto.tipo,
        dto.precoDiaria,
        dto.temFrigobar,
        dto.temCafe,
        dto.temArCondicionado,
        dto.temTV
      );
      mockRepository.create.mockResolvedValue(quartoEsperado);

      // Act - Executar ação
      const resultado = await service.criar(dto);

      // Assert - Verificar resultados
      expect(resultado).toBeDefined();
      expect(resultado.numero).toBe(101);
      expect(resultado.tipo).toBe(TipoQuarto.MODERNO);
      expect(resultado.precoDiaria).toBe(150.00);
      expect(resultado.status).toBe(StatusQuarto.LIVRE);
      expect(resultado.camas).toHaveLength(1);
      expect(resultado.camas[0].tipoCama).toBe(TipoCama.CASAL_QUEEN);

      // Verificar que repository foi chamado corretamente
      expect(mockRepository.findByNumero).toHaveBeenCalledWith(101);
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
    });

    /**
     * Teste: Deve criar quarto com múltiplas camas
     * Testa composição de camas
     */
    it('deve criar quarto com múltiplas camas', async () => {
      // Arrange
      const dto: CriarQuartoDTO = {
        numero: 201,
        capacidade: 4,
        tipo: TipoQuarto.LUXO,
        precoDiaria: 300.00,
        temFrigobar: true,
        temCafe: true,
        temArCondicionado: true,
        temTV: true,
        camas: [
          { tipoCama: TipoCama.CASAL_KING },
          { tipoCama: TipoCama.SOLTEIRO },
          { tipoCama: TipoCama.SOLTEIRO }
        ]
      };

      mockRepository.findByNumero.mockResolvedValue(null);
      
      const quartoEsperado = new Quarto(
        1,
        dto.numero,
        dto.capacidade,
        dto.tipo,
        dto.precoDiaria,
        dto.temFrigobar,
        dto.temCafe,
        dto.temArCondicionado,
        dto.temTV
      );
      mockRepository.create.mockResolvedValue(quartoEsperado);

      // Act
      const resultado = await service.criar(dto);

      // Assert
      expect(resultado.camas).toHaveLength(3);
      expect(resultado.camas[0].tipoCama).toBe(TipoCama.CASAL_KING);
      expect(resultado.camas[1].tipoCama).toBe(TipoCama.SOLTEIRO);
      expect(resultado.camas[2].tipoCama).toBe(TipoCama.SOLTEIRO);
    });

    /**
     * Teste: Deve criar quarto básico sem comodidades
     * Testa valores booleanos false
     */
    it('deve criar quarto básico sem comodidades', async () => {
      // Arrange
      const dto: CriarQuartoDTO = {
        numero: 102,
        capacidade: 1,
        tipo: TipoQuarto.BASICO,
        precoDiaria: 80.00,
        temFrigobar: false,
        temCafe: false,
        temArCondicionado: false,
        temTV: false,
        camas: [
          { tipoCama: TipoCama.SOLTEIRO }
        ]
      };

      mockRepository.findByNumero.mockResolvedValue(null);
      
      const quartoEsperado = new Quarto(
        1,
        dto.numero,
        dto.capacidade,
        dto.tipo,
        dto.precoDiaria,
        dto.temFrigobar,
        dto.temCafe,
        dto.temArCondicionado,
        dto.temTV
      );
      mockRepository.create.mockResolvedValue(quartoEsperado);

      // Act
      const resultado = await service.criar(dto);

      // Assert
      expect(resultado.temFrigobar).toBe(false);
      expect(resultado.temCafe).toBe(false);
      expect(resultado.temArCondicionado).toBe(false);
      expect(resultado.temTV).toBe(false);
    });
  });

  describe('Cenários de Falha', () => {
    /**
     * Teste: Deve lançar erro se número já existe
     * Regra de negócio crítica
     */
    it('deve lançar erro se número do quarto já existe', async () => {
      // Arrange
      const dto: CriarQuartoDTO = {
        numero: 101,
        capacidade: 2,
        tipo: TipoQuarto.MODERNO,
        precoDiaria: 150.00,
        temFrigobar: true,
        temCafe: true,
        temArCondicionado: true,
        temTV: true,
        camas: [{ tipoCama: TipoCama.CASAL_QUEEN }]
      };

      // Mock: número já existe
      const quartoExistente = new Quarto(
        1,
        101,
        2,
        TipoQuarto.MODERNO,
        150.00
      );
      mockRepository.findByNumero.mockResolvedValue(quartoExistente);

      // Act & Assert
      await expect(service.criar(dto)).rejects.toThrow(QuartoJaExisteError);
      await expect(service.criar(dto)).rejects.toThrow('Quarto com número 101 já existe');

      // Verificar que create não foi chamado
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    /**
     * Teste: Deve lançar erro se número inválido
     * Validação de entrada
     */
    it('deve lançar erro se número do quarto for inválido', async () => {
      // Arrange
      const dto: CriarQuartoDTO = {
        numero: 0, // Inválido
        capacidade: 2,
        tipo: TipoQuarto.MODERNO,
        precoDiaria: 150.00,
        temFrigobar: true,
        temCafe: true,
        temArCondicionado: true,
        temTV: true,
        camas: [{ tipoCama: TipoCama.CASAL_QUEEN }]
      };

      // Act & Assert
      await expect(service.criar(dto)).rejects.toThrow('Número do quarto deve ser maior que zero');
    });

    /**
     * Teste: Deve lançar erro se capacidade inválida
     * Validação de entrada
     */
    it('deve lançar erro se capacidade for inválida', async () => {
      // Arrange
      const dto: CriarQuartoDTO = {
        numero: 101,
        capacidade: 0, // Inválido
        tipo: TipoQuarto.MODERNO,
        precoDiaria: 150.00,
        temFrigobar: true,
        temCafe: true,
        temArCondicionado: true,
        temTV: true,
        camas: [{ tipoCama: TipoCama.CASAL_QUEEN }]
      };

      // Act & Assert
      await expect(service.criar(dto)).rejects.toThrow('Capacidade deve ser maior que zero');
    });

    /**
     * Teste: Deve lançar erro se preço negativo
     * Validação de entrada
     */
    it('deve lançar erro se preço for negativo', async () => {
      // Arrange
      const dto: CriarQuartoDTO = {
        numero: 101,
        capacidade: 2,
        tipo: TipoQuarto.MODERNO,
        precoDiaria: -50.00, // Inválido
        temFrigobar: true,
        temCafe: true,
        temArCondicionado: true,
        temTV: true,
        camas: [{ tipoCama: TipoCama.CASAL_QUEEN }]
      };

      // Act & Assert
      await expect(service.criar(dto)).rejects.toThrow('Preço não pode ser negativo');
    });
  });

  describe('Integração com Repository', () => {
    /**
     * Teste: Deve chamar repository na ordem correta
     * Verifica fluxo de execução
     */
    it('deve chamar repository na ordem correta', async () => {
      // Arrange
      const dto: CriarQuartoDTO = {
        numero: 101,
        capacidade: 2,
        tipo: TipoQuarto.MODERNO,
        precoDiaria: 150.00,
        temFrigobar: true,
        temCafe: true,
        temArCondicionado: true,
        temTV: true,
        camas: [{ tipoCama: TipoCama.CASAL_QUEEN }]
      };

      mockRepository.findByNumero.mockResolvedValue(null);
      
      const quartoEsperado = new Quarto(
        1,
        dto.numero,
        dto.capacidade,
        dto.tipo,
        dto.precoDiaria
      );
      mockRepository.create.mockResolvedValue(quartoEsperado);

      // Act
      await service.criar(dto);

      // Assert - Verificar ordem de chamadas
      const findByNumeroCall = mockRepository.findByNumero.mock.invocationCallOrder[0];
      const createCall = mockRepository.create.mock.invocationCallOrder[0];
      
      expect(findByNumeroCall).toBeLessThan(createCall);
    });
  });
});
