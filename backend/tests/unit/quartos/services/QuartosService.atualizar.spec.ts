/**
 * Testes Unitários - QuartosService.atualizar()
 * 
 * Estratégia de Teste:
 * - Testar atualização parcial (apenas campos fornecidos)
 * - Verificar que campos não fornecidos não são alterados
 * - Testar casos de erro (quarto não encontrado)
 * - Seguir padrão AAA (Arrange, Act, Assert)
 */

import { QuartosService } from '../../../src/modules/quartos/services/QuartosService';
import { IQuartoRepository } from '../../../src/modules/quartos/interfaces/IQuartoRepository';
import { Quarto, TipoQuarto, StatusQuarto } from '../../../src/modules/quartos/entities';
import { QuartoNaoEncontradoError } from '../../../src/modules/quartos/errors/QuartoErrors';
import { AtualizarQuartoDTO } from '../../../src/modules/quartos/dtos/QuartoDTO';

describe('QuartosService - Edição de Quarto', () => {
  let service: QuartosService;
  let mockRepository: jest.Mocked<IQuartoRepository>;
  let quartoExistente: Quarto;

  /**
   * Setup antes de cada teste
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

    // Criar quarto existente para testes
    quartoExistente = new Quarto(
      1,
      101,
      2,
      TipoQuarto.MODERNO,
      150.00,
      true,  // frigobar
      true,  // cafe
      true,  // ar
      true   // tv
    );

    service = new QuartosService(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Cenários de Sucesso - Atualização Parcial', () => {
    /**
     * Teste: Deve atualizar apenas o preço
     * Testa atualização parcial (campo único)
     */
    it('deve atualizar apenas o preço da diária', async () => {
      // Arrange
      const dto: AtualizarQuartoDTO = {
        precoDiaria: 180.00
      };

      mockRepository.findById.mockResolvedValue(quartoExistente);
      
      const quartoAtualizado = { ...quartoExistente, precoDiaria: 180.00 };
      mockRepository.update.mockResolvedValue(quartoAtualizado as Quarto);

      // Act
      const resultado = await service.atualizar(1, dto);

      // Assert
      expect(resultado.precoDiaria).toBe(180.00);
      // Verificar que outros campos não mudaram
      expect(resultado.capacidade).toBe(2);
      expect(resultado.tipo).toBe(TipoQuarto.MODERNO);
      expect(resultado.temFrigobar).toBe(true);
      
      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRepository.update).toHaveBeenCalledTimes(1);
    });

    /**
     * Teste: Deve atualizar múltiplos campos
     * Testa atualização parcial (múltiplos campos)
     */
    it('deve atualizar múltiplos campos simultaneamente', async () => {
      // Arrange
      const dto: AtualizarQuartoDTO = {
        precoDiaria: 200.00,
        temFrigobar: false,
        temCafe: false
      };

      mockRepository.findById.mockResolvedValue(quartoExistente);
      
      const quartoAtualizado = {
        ...quartoExistente,
        precoDiaria: 200.00,
        temFrigobar: false,
        temCafe: false
      };
      mockRepository.update.mockResolvedValue(quartoAtualizado as Quarto);

      // Act
      const resultado = await service.atualizar(1, dto);

      // Assert
      expect(resultado.precoDiaria).toBe(200.00);
      expect(resultado.temFrigobar).toBe(false);
      expect(resultado.temCafe).toBe(false);
      // Campos não atualizados devem permanecer
      expect(resultado.temArCondicionado).toBe(true);
      expect(resultado.temTV).toBe(true);
    });

    /**
     * Teste: Deve atualizar tipo do quarto
     * Testa mudança de enum
     */
    it('deve atualizar tipo do quarto', async () => {
      // Arrange
      const dto: AtualizarQuartoDTO = {
        tipo: TipoQuarto.LUXO
      };

      mockRepository.findById.mockResolvedValue(quartoExistente);
      
      const quartoAtualizado = { ...quartoExistente, tipo: TipoQuarto.LUXO };
      mockRepository.update.mockResolvedValue(quartoAtualizado as Quarto);

      // Act
      const resultado = await service.atualizar(1, dto);

      // Assert
      expect(resultado.tipo).toBe(TipoQuarto.LUXO);
      expect(resultado.numero).toBe(101); // Não deve mudar
    });

    /**
     * Teste: Deve atualizar capacidade
     * Testa mudança de número
     */
    it('deve atualizar capacidade do quarto', async () => {
      // Arrange
      const dto: AtualizarQuartoDTO = {
        capacidade: 4
      };

      mockRepository.findById.mockResolvedValue(quartoExistente);
      
      const quartoAtualizado = { ...quartoExistente, capacidade: 4 };
      mockRepository.update.mockResolvedValue(quartoAtualizado as Quarto);

      // Act
      const resultado = await service.atualizar(1, dto);

      // Assert
      expect(resultado.capacidade).toBe(4);
    });

    /**
     * Teste: Deve atualizar todas as comodidades
     * Testa atualização de todos os booleanos
     */
    it('deve atualizar todas as comodidades', async () => {
      // Arrange
      const dto: AtualizarQuartoDTO = {
        temFrigobar: false,
        temCafe: false,
        temArCondicionado: false,
        temTV: false
      };

      mockRepository.findById.mockResolvedValue(quartoExistente);
      
      const quartoAtualizado = {
        ...quartoExistente,
        temFrigobar: false,
        temCafe: false,
        temArCondicionado: false,
        temTV: false
      };
      mockRepository.update.mockResolvedValue(quartoAtualizado as Quarto);

      // Act
      const resultado = await service.atualizar(1, dto);

      // Assert
      expect(resultado.temFrigobar).toBe(false);
      expect(resultado.temCafe).toBe(false);
      expect(resultado.temArCondicionado).toBe(false);
      expect(resultado.temTV).toBe(false);
    });

    /**
     * Teste: Deve atualizar todos os campos
     * Testa atualização completa
     */
    it('deve atualizar todos os campos fornecidos', async () => {
      // Arrange
      const dto: AtualizarQuartoDTO = {
        capacidade: 3,
        tipo: TipoQuarto.LUXO,
        precoDiaria: 250.00,
        temFrigobar: false,
        temCafe: true,
        temArCondicionado: true,
        temTV: false
      };

      mockRepository.findById.mockResolvedValue(quartoExistente);
      
      const quartoAtualizado = { ...quartoExistente, ...dto };
      mockRepository.update.mockResolvedValue(quartoAtualizado as Quarto);

      // Act
      const resultado = await service.atualizar(1, dto);

      // Assert
      expect(resultado.capacidade).toBe(3);
      expect(resultado.tipo).toBe(TipoQuarto.LUXO);
      expect(resultado.precoDiaria).toBe(250.00);
      expect(resultado.temFrigobar).toBe(false);
      expect(resultado.temCafe).toBe(true);
      expect(resultado.temArCondicionado).toBe(true);
      expect(resultado.temTV).toBe(false);
    });
  });

  describe('Cenários de Sucesso - Campos Não Fornecidos', () => {
    /**
     * Teste: Não deve alterar campos não fornecidos
     * Importante: atualização parcial não deve sobrescrever com undefined
     */
    it('não deve alterar campos não fornecidos no DTO', async () => {
      // Arrange
      const dto: AtualizarQuartoDTO = {
        precoDiaria: 180.00
        // Outros campos não fornecidos
      };

      mockRepository.findById.mockResolvedValue(quartoExistente);
      
      const quartoAtualizado = { ...quartoExistente, precoDiaria: 180.00 };
      mockRepository.update.mockResolvedValue(quartoAtualizado as Quarto);

      // Act
      const resultado = await service.atualizar(1, dto);

      // Assert - Campos originais devem permanecer
      expect(resultado.capacidade).toBe(2);
      expect(resultado.tipo).toBe(TipoQuarto.MODERNO);
      expect(resultado.temFrigobar).toBe(true);
      expect(resultado.temCafe).toBe(true);
      expect(resultado.temArCondicionado).toBe(true);
      expect(resultado.temTV).toBe(true);
    });

    /**
     * Teste: DTO vazio não deve alterar nada
     * Edge case importante
     */
    it('deve manter todos os campos se DTO estiver vazio', async () => {
      // Arrange
      const dto: AtualizarQuartoDTO = {};

      mockRepository.findById.mockResolvedValue(quartoExistente);
      mockRepository.update.mockResolvedValue(quartoExistente);

      // Act
      const resultado = await service.atualizar(1, dto);

      // Assert - Nada deve mudar
      expect(resultado.numero).toBe(101);
      expect(resultado.capacidade).toBe(2);
      expect(resultado.tipo).toBe(TipoQuarto.MODERNO);
      expect(resultado.precoDiaria).toBe(150.00);
      expect(resultado.temFrigobar).toBe(true);
    });
  });

  describe('Cenários de Falha', () => {
    /**
     * Teste: Deve lançar erro se quarto não existe
     * Regra de negócio crítica
     */
    it('deve lançar erro se quarto não for encontrado', async () => {
      // Arrange
      const dto: AtualizarQuartoDTO = {
        precoDiaria: 180.00
      };

      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.atualizar(999, dto)).rejects.toThrow(QuartoNaoEncontradoError);
      await expect(service.atualizar(999, dto)).rejects.toThrow('Quarto com ID 999 não encontrado');

      // Verificar que update não foi chamado
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    /**
     * Teste: Deve lançar erro se ID inválido
     * Validação de entrada
     */
    it('deve lançar erro se ID for inválido', async () => {
      // Arrange
      const dto: AtualizarQuartoDTO = {
        precoDiaria: 180.00
      };

      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.atualizar(0, dto)).rejects.toThrow();
    });
  });

  describe('Integração com Repository', () => {
    /**
     * Teste: Deve chamar repository na ordem correta
     * Verifica fluxo de execução
     */
    it('deve chamar repository na ordem correta', async () => {
      // Arrange
      const dto: AtualizarQuartoDTO = {
        precoDiaria: 180.00
      };

      mockRepository.findById.mockResolvedValue(quartoExistente);
      
      const quartoAtualizado = { ...quartoExistente, precoDiaria: 180.00 };
      mockRepository.update.mockResolvedValue(quartoAtualizado as Quarto);

      // Act
      await service.atualizar(1, dto);

      // Assert - Verificar ordem de chamadas
      const findByIdCall = mockRepository.findById.mock.invocationCallOrder[0];
      const updateCall = mockRepository.update.mock.invocationCallOrder[0];
      
      expect(findByIdCall).toBeLessThan(updateCall);
    });

    /**
     * Teste: Deve passar ID correto para repository
     */
    it('deve passar ID correto para repository.update', async () => {
      // Arrange
      const dto: AtualizarQuartoDTO = {
        precoDiaria: 180.00
      };

      mockRepository.findById.mockResolvedValue(quartoExistente);
      mockRepository.update.mockResolvedValue(quartoExistente);

      // Act
      await service.atualizar(1, dto);

      // Assert
      expect(mockRepository.update).toHaveBeenCalledWith(
        1,
        expect.any(Object)
      );
    });
  });

  describe('Validação de Dados', () => {
    /**
     * Teste: Deve aceitar valores válidos
     */
    it('deve aceitar preço zero', async () => {
      // Arrange
      const dto: AtualizarQuartoDTO = {
        precoDiaria: 0 // Zero é válido (não negativo)
      };

      mockRepository.findById.mockResolvedValue(quartoExistente);
      
      const quartoAtualizado = { ...quartoExistente, precoDiaria: 0 };
      mockRepository.update.mockResolvedValue(quartoAtualizado as Quarto);

      // Act
      const resultado = await service.atualizar(1, dto);

      // Assert
      expect(resultado.precoDiaria).toBe(0);
    });
  });
});
