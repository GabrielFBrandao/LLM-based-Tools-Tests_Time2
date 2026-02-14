/**
 * Testes Unitários para Hook useQuartos
 * 
 * Princípios de Teste aplicados:
 * - AAA: Arrange, Act, Assert
 * - Testes isolados e independentes
 * - Mocks para dependências externas
 * - Cobertura de casos de sucesso e erro
 * - Nomes descritivos que indicam intenção
 * 
 * Funcionalidades testadas:
 * - Cadastro de quarto
 * - Edição de quarto
 * - Validações
 * - Tratamento de erros
 * - Estados de loading
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useQuartos } from '../useQuartos';
import { quartoService } from '../../services/quartoService';
import { Quarto, TipoQuarto, StatusQuarto, TipoCama } from '../../domain/entities/Quarto';

// Mock do serviço de quartos
jest.mock('../../services/quartoService');
const mockedQuartoService = quartoService as jest.Mocked<typeof quartoService>;

// Mock do EventEmitter
jest.mock('../../domain/interfaces/IEventEmitter', () => ({
  EventEmitter: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    removeAllListeners: jest.fn(),
    listenerCount: jest.fn(),
    eventNames: jest.fn(),
  })),
}));

/**
 * Helper para criar wrapper com QueryClient
 * 
 * Decisão: Wrapper customizado para testes com React Query
 * - Isola testes entre si
 * - Configuração específica para testes
 * - Facilita debugging
 */
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

/**
 * Helper para criar dados de teste
 * 
 * Decisão: Factory functions para dados de teste
 * - Consistência nos dados
 * - Facilita manutenção
 * - Reutilização em múltiplos testes
 */
const criarQuartoTeste = (overrides: Partial<Quarto> = {}): Quarto => ({
  id: 'quarto-test-123',
  numero: '101',
  capacidade: 2,
  tipo: TipoQuarto.BASICO,
  precoPorNoite: 150.00,
  hasMinibar: true,
  hasCafeDaManha: false,
  hasArCondicionado: true,
  hasTV: true,
  status: StatusQuarto.DISPONIVEL,
  camas: [
    {
      id: 'cama-1',
      tipo: TipoCama.CASAL_QUEEN,
      quartoId: 'quarto-test-123',
      getCapacidade: () => 2,
      getDescricao: () => 'Cama de Casal Queen',
      toJSON: () => ({ id: 'cama-1', tipo: TipoCama.CASAL_QUEEN })
    }
  ],
  getCapacidadeTotal: () => 2,
  getComodidades: () => ['Frigobar', 'Ar-Condicionado', 'TV'],
  getDescricaoCamas: () => 'Casal Queen',
  isDisponivel: () => true,
  podeSerOcupado: () => true,
  podeSerDeletado: () => true,
  copiarCom: () => ({ ...criarQuartoTeste(), ...overrides }),
  toJSON: () => ({ ...criarQuartoTeste(), ...overrides })
});

const criarRequestDTOTeste = (overrides: any = {}) => ({
  numero: '102',
  capacidade: 2,
  tipo: TipoQuarto.MODERNO,
  precoPorNoite: 200.00,
  hasMinibar: true,
  hasCafeDaManha: true,
  hasArCondicionado: true,
  hasTV: true,
  status: StatusQuarto.DISPONIVEL,
  camas: [
    { tipo: TipoCama.SOLTEIRO },
    { tipo: TipoCama.SOLTEIRO }
  ],
  ...overrides
});

describe('useQuartos - Cadastro de Quarto', () => {
  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();
  });

  /**
   * Teste: Cadastro de quarto com sucesso
   * 
   * Cenário: Dados válidos, serviço retorna sucesso
   * Resultado esperado: Quarto criado, cache atualizado, sem erros
   */
  it('deve cadastrar quarto com sucesso quando dados são válidos', async () => {
    // Arrange
    const dadosQuarto = criarRequestDTOTeste();
    const quartoEsperado = criarQuartoTeste({
      numero: dadosQuarto.numero,
      tipo: dadosQuarto.tipo,
      precoPorNoite: dadosQuarto.precoPorNoite
    });

    mockedQuartoService.criarQuarto.mockResolvedValue(quartoEsperado);

    // Act
    const { result } = renderHook(() => useQuartos(), {
      wrapper: createWrapper()
    });

    let resultado;
    await act(async () => {
      resultado = await result.current.criarQuarto(dadosQuarto);
    });

    // Assert
    expect(mockedQuartoService.criarQuarto).toHaveBeenCalledWith(dadosQuarto);
    expect(mockedQuartoService.criarQuarto).toHaveBeenCalledTimes(1);
    expect(resultado).toEqual(quartoEsperado);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  /**
   * Teste: Cadastro com número duplicado
   * 
   * Cenário: Número de quarto já existe
   * Resultado esperado: Erro específico, mensagem clara
   */
  it('deve lançar erro ao tentar cadastrar quarto com número duplicado', async () => {
    // Arrange
    const dadosQuarto = criarRequestDTOTeste({ numero: '101' });
    const erroEsperado = new Error('Já existe um quarto com o número: 101');
    
    mockedQuartoService.criarQuarto.mockRejectedValue(erroEsperado);

    // Act
    const { result } = renderHook(() => useQuartos(), {
      wrapper: createWrapper()
    });

    // Assert
    await expect(
      act(() => result.current.criarQuarto(dadosQuarto))
    ).rejects.toThrow('Já existe um quarto com o número: 101');

    expect(mockedQuartoService.criarQuarto).toHaveBeenCalledWith(dadosQuarto);
    expect(result.current.error).toBeTruthy();
  });

  /**
   * Teste: Cadastro com capacidade inválida
   * 
   * Cenário: Capacidade maior que o permitido
   * Resultado esperado: Erro de validação, mensagem específica
   */
  it('deve lançar erro ao tentar cadastrar quarto com capacidade inválida', async () => {
    // Arrange
    const dadosQuarto = criarRequestDTOTeste({ capacidade: 15 });
    const erroEsperado = new Error('Capacidade máxima permitida é de 10 pessoas');
    
    mockedQuartoService.criarQuarto.mockRejectedValue(erroEsperado);

    // Act
    const { result } = renderHook(() => useQuartos(), {
      wrapper: createWrapper()
    });

    // Assert
    await expect(
      act(() => result.current.criarQuarto(dadosQuarto))
    ).rejects.toThrow('Capacidade máxima permitida é de 10 pessoas');

    expect(mockedQuartoService.criarQuarto).toHaveBeenCalledWith(dadosQuarto);
  });

  /**
   * Teste: Cadastro com preço inválido
   * 
   * Cenário: Preço negativo ou zero
   * Resultado esperado: Erro de validação
   */
  it('deve lançar erro ao tentar cadastrar quarto com preço inválido', async () => {
    // Arrange
    const dadosQuarto = criarRequestDTOTeste({ precoPorNoite: -50 });
    const erroEsperado = new Error('Preço por noite deve ser maior que zero');
    
    mockedQuartoService.criarQuarto.mockRejectedValue(erroEsperado);

    // Act
    const { result } = renderHook(() => useQuartos(), {
      wrapper: createWrapper()
    });

    // Assert
    await expect(
      act(() => result.current.criarQuarto(dadosQuarto))
    ).rejects.toThrow('Preço por noite deve ser maior que zero');
  });

  /**
   * Teste: Estado de loading durante cadastro
   * 
   * Cenário: Operação assíncrona em andamento
   * Resultado esperado: Loading true durante, false após
   */
  it('deve atualizar estado de loading durante cadastro', async () => {
    // Arrange
    const dadosQuarto = criarRequestDTOTeste();
    const quartoEsperado = criarQuartoTeste();
    
    // Simula operação demorada
    mockedQuartoService.criarQuarto.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(quartoEsperado), 100))
    );

    // Act
    const { result } = renderHook(() => useQuartos(), {
      wrapper: createWrapper()
    });

    // Assert - Loading inicial
    expect(result.current.isLoading).toBe(false);

    // Inicia operação
    const promise = act(() => result.current.criarQuarto(dadosQuarto));
    
    // Loading durante operação
    expect(result.current.isLoading).toBe(true);

    // Aguarda conclusão
    await promise;
    
    // Loading final
    expect(result.current.isLoading).toBe(false);
  });

  /**
   * Teste: Cadastro sem camas
   * 
   * Cenário: Quarto sem nenhuma cama
   * Resultado esperado: Erro de validação
   */
  it('deve lançar erro ao tentar cadastrar quarto sem camas', async () => {
    // Arrange
    const dadosQuarto = criarRequestDTOTeste({ camas: [] });
    const erroEsperado = new Error('Quarto deve ter pelo menos uma cama');
    
    mockedQuartoService.criarQuarto.mockRejectedValue(erroEsperado);

    // Act
    const { result } = renderHook(() => useQuartos(), {
      wrapper: createWrapper()
    });

    // Assert
    await expect(
      act(() => result.current.criarQuarto(dadosQuarto))
    ).rejects.toThrow('Quarto deve ter pelo menos uma cama');
  });
});

describe('useQuartos - Edição de Quarto', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Teste: Edição de quarto com sucesso
   * 
   * Cenário: Dados válidos, quarto existe
   * Resultado esperado: Quarto atualizado, cache invalidado
   */
  it('deve editar quarto com sucesso quando dados são válidos', async () => {
    // Arrange
    const quartoExistente = criarQuartoTeste({ id: 'quarto-123', numero: '101' });
    const dadosAtualizacao = criarRequestDTOTeste({
      numero: '101-A',
      precoPorNoite: 180.00
    });
    const quartoAtualizado = criarQuartoTeste({
      ...quartoExistente,
      numero: '101-A',
      precoPorNoite: 180.00
    });

    mockedQuartoService.atualizarQuarto.mockResolvedValue(quartoAtualizado);

    // Act
    const { result } = renderHook(() => useQuartos(), {
      wrapper: createWrapper()
    });

    let resultado;
    await act(async () => {
      resultado = await result.current.atualizarQuarto('quarto-123', dadosAtualizacao);
    });

    // Assert
    expect(mockedQuartoService.atualizarQuarto).toHaveBeenCalledWith('quarto-123', dadosAtualizacao);
    expect(resultado).toEqual(quartoAtualizado);
    expect(result.current.error).toBeNull();
  });

  /**
   * Teste: Edição de quarto inexistente
   * 
   * Cenário: ID não encontrado no sistema
   * Resultado esperado: Erro específico, mensagem clara
   */
  it('deve lançar erro ao tentar editar quarto inexistente', async () => {
    // Arrange
    const dadosAtualizacao = criarRequestDTOTeste();
    const erroEsperado = new Error('Quarto não encontrado: quarto-inexistente');
    
    mockedQuartoService.atualizarQuarto.mockRejectedValue(erroEsperado);

    // Act
    const { result } = renderHook(() => useQuartos(), {
      wrapper: createWrapper()
    });

    // Assert
    await expect(
      act(() => result.current.atualizarQuarto('quarto-inexistente', dadosAtualizacao))
    ).rejects.toThrow('Quarto não encontrado: quarto-inexistente');

    expect(mockedQuartoService.atualizarQuarto).toHaveBeenCalledWith('quarto-inexistente', dadosAtualizacao);
  });

  /**
   * Teste: Edição com número duplicado
   * 
   * Cenário: Novo número já existe em outro quarto
   * Resultado esperado: Erro de duplicidade
   */
  it('deve lançar erro ao tentar editar quarto com número duplicado', async () => {
    // Arrange
    const dadosAtualizacao = criarRequestDTOTeste({ numero: '102' });
    const erroEsperado = new Error('Já existe um quarto com o número: 102');
    
    mockedQuartoService.atualizarQuarto.mockRejectedValue(erroEsperado);

    // Act
    const { result } = renderHook(() => useQuartos(), {
      wrapper: createWrapper()
    });

    // Assert
    await expect(
      act(() => result.current.atualizarQuarto('quarto-123', dadosAtualizacao))
    ).rejects.toThrow('Já existe um quarto com o número: 102');
  });

  /**
   * Teste: Edição de status inválido
   * 
   * Cenário: Tentativa de mudança para status não permitido
   * Resultado esperado: Erro de transição de status
   */
  it('deve lançar erro ao tentar editar quarto com status inválido', async () => {
    // Arrange
    const dadosAtualizacao = criarRequestDTOTeste({ status: StatusQuarto.OCUPADO });
    const erroEsperado = new Error('Transição de status inválida: DISPONIVEL -> OCUPADO');
    
    mockedQuartoService.atualizarQuarto.mockRejectedValue(erroEsperado);

    // Act
    const { result } = renderHook(() => useQuartos(), {
      wrapper: createWrapper()
    });

    // Assert
    await expect(
      act(() => result.current.atualizarQuarto('quarto-123', dadosAtualizacao))
    ).rejects.toThrow('Transição de status inválida');
  });

  /**
   * Teste: Edição parcial (apenas alguns campos)
   * 
   * Cenário: Atualização apenas de preço e comodidades
   * Resultado esperado: Apenas campos informados são alterados
   */
  it('deve permitir edição parcial de quarto', async () => {
    // Arrange
    const quartoOriginal = criarQuartoTeste();
    const dadosParciais = {
      precoPorNoite: 250.00,
      hasMinibar: false
    };
    const quartoAtualizado = criarQuartoTeste({
      ...quartoOriginal,
      precoPorNoite: 250.00,
      hasMinibar: false
    });

    mockedQuartoService.atualizarQuarto.mockResolvedValue(quartoAtualizado);

    // Act
    const { result } = renderHook(() => useQuartos(), {
      wrapper: createWrapper()
    });

    let resultado;
    await act(async () => {
      resultado = await result.current.atualizarQuarto('quarto-123', dadosParciais);
    });

    // Assert
    expect(mockedQuartoService.atualizarQuarto).toHaveBeenCalledWith('quarto-123', dadosParciais);
    expect(resultado.precoPorNoite).toBe(250.00);
    expect(resultado.hasMinibar).toBe(false);
    // Outros campos devem permanecer inalterados
    expect(resultado.numero).toBe(quartoOriginal.numero);
    expect(resultado.tipo).toBe(quartoOriginal.tipo);
  });

  /**
   * Teste: Edição de quarto ocupado
   * 
   * Cenário: Tentativa de editar quarto ocupado
   * Resultado esperado: Erro de negócio ou permissão negada
   */
  it('deve lançar erro ao tentar editar quarto ocupado', async () => {
    // Arrange
    const dadosAtualizacao = criarRequestDTOTeste();
    const erroEsperado = new Error('Não é possível editar um quarto ocupado');
    
    mockedQuartoService.atualizarQuarto.mockRejectedValue(erroEsperado);

    // Act
    const { result } = renderHook(() => useQuartos(), {
      wrapper: createWrapper()
    });

    // Assert
    await expect(
      act(() => result.current.atualizarQuarto('quarto-ocupado', dadosAtualizacao))
    ).rejects.toThrow('Não é possível editar um quarto ocupado');
  });

  /**
   * Teste: Estado de loading durante edição
   * 
   * Cenário: Operação assíncrona em andamento
   * Resultado esperado: Loading true durante, false após
   */
  it('deve atualizar estado de loading durante edição', async () => {
    // Arrange
    const dadosAtualizacao = criarRequestDTOTeste();
    const quartoAtualizado = criarQuartoTeste();
    
    // Simula operação demorada
    mockedQuartoService.atualizarQuarto.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(quartoAtualizado), 100))
    );

    // Act
    const { result } = renderHook(() => useQuartos(), {
      wrapper: createWrapper()
    });

    // Assert
    expect(result.current.isLoading).toBe(false);

    const promise = act(() => result.current.atualizarQuarto('quarto-123', dadosAtualizacao));
    expect(result.current.isLoading).toBe(true);

    await promise;
    expect(result.current.isLoading).toBe(false);
  });

  /**
   * Teste: Edição com dados inválidos
   * 
   * Cenário: Dados que violam regras de negócio
   * Resultado esperado: Erro de validação específico
   */
  it('deve lançar erro ao tentar editar quarto com dados inválidos', async () => {
    // Arrange
    const dadosInvalidos = criarRequestDTOTeste({
      capacidade: 0, // Inválido
      precoPorNoite: -100 // Inválido
    });
    const erroEsperado = new Error('Dados inválidos para atualização do quarto');
    
    mockedQuartoService.atualizarQuarto.mockRejectedValue(erroEsperado);

    // Act
    const { result } = renderHook(() => useQuartos(), {
      wrapper: createWrapper()
    });

    // Assert
    await expect(
      act(() => result.current.atualizarQuarto('quarto-123', dadosInvalidos))
    ).rejects.toThrow('Dados inválidos para atualização do quarto');
  });
});

describe('useQuartos - Comportamento Geral', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Teste: Limpeza de erros após operação bem-sucedida
   * 
   * Cenário: Erro anterior, operação subsequente com sucesso
   * Resultado esperado: Erro limpo, estado consistente
   */
  it('deve limpar erros após operação bem-sucedida', async () => {
    // Arrange
    const dadosQuarto = criarRequestDTOTeste();
    const quartoCriado = criarQuartoTeste();
    
    // Primeira operação falha
    mockedQuartoService.criarQuarto
      .mockRejectedValueOnce(new Error('Erro de rede'))
      .mockResolvedValueOnce(quartoCriado);

    // Act
    const { result } = renderHook(() => useQuartos(), {
      wrapper: createWrapper()
    });

    // Primeira tentativa - deve falhar
    await expect(
      act(() => result.current.criarQuarto(dadosQuarto))
    ).rejects.toThrow('Erro de rede');

    expect(result.current.error).toBeTruthy();

    // Segunda tentativa - deve succeed
    await act(() => result.current.criarQuarto(dadosQuarto));

    // Assert
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  /**
   * Teste: Múltiplas operações simultâneas
   * 
   * Cenário: Várias operações ao mesmo tempo
   * Resultado esperado: Estados gerenciados corretamente
   */
  it('deve gerenciar múltiplas operações simultâneas', async () => {
    // Arrange
    const dadosQuarto1 = criarRequestDTOTeste({ numero: '201' });
    const dadosQuarto2 = criarRequestDTOTeste({ numero: '202' });
    const quarto1 = criarQuartoTeste({ numero: '201' });
    const quarto2 = criarQuartoTeste({ numero: '202' });
    
    mockedQuartoService.criarQuarto
      .mockResolvedValueOnce(quarto1)
      .mockResolvedValueOnce(quarto2);

    // Act
    const { result } = renderHook(() => useQuartos(), {
      wrapper: createWrapper()
    });

    // Executa operações simultâneas
    const [resultado1, resultado2] = await Promise.all([
      act(() => result.current.criarQuarto(dadosQuarto1)),
      act(() => result.current.criarQuarto(dadosQuarto2))
    ]);

    // Assert
    expect(resultado1.numero).toBe('201');
    expect(resultado2.numero).toBe('202');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
