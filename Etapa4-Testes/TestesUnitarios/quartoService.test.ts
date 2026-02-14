/**
 * Testes Unitários para QuartoService
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
 * - Validações de negócio
 * - Tratamento de erros
 * - Eventos emitidos
 */

import { QuartoService } from '../quartoService';
import { Quarto, TipoQuarto, StatusQuarto, TipoCama } from '../../domain/entities/Quarto';
import { IQuartoRepository } from '../../domain/repositories/IQuartoRepository';
import { IEventEmitter } from '../../domain/interfaces/IEventEmitter';

// Mock das dependências
const mockRepository: jest.Mocked<IQuartoRepository> = {
  salvar: jest.fn(),
  atualizar: jest.fn(),
  buscarPorId: jest.fn(),
  buscarPorNumero: jest.fn(),
  listarTodos: jest.fn(),
  deletar: jest.fn(),
  buscarPorTipo: jest.fn(),
  buscarPorStatus: jest.fn(),
  buscarPorCapacidadeMinima: jest.fn(),
  buscarPorFaixaPreco: jest.fn(),
  buscarComFiltros: jest.fn(),
  buscarPorTexto: jest.fn(),
  listarOrdenadosPorPreco: jest.fn(),
  listarOrdenadosPorCapacidade: jest.fn(),
  existePorNumero: jest.fn(),
  existePorId: jest.fn(),
  contarPorStatus: jest.fn(),
  contarPorTipo: jest.fn(),
  obterEstatisticas: jest.fn()
};

const mockEventEmitter: jest.Mocked<IEventEmitter<any>> = {
  on: jest.fn(),
  once: jest.fn(),
  emit: jest.fn(),
  removeAllListeners: jest.fn(),
  listenerCount: jest.fn(),
  eventNames: jest.fn()
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

const criarDadosCriacao = (overrides: any = {}) => ({
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
    { id: 'cama-2', tipo: TipoCama.SOLTEIRO, quartoId: '' },
    { id: 'cama-3', tipo: TipoCama.SOLTEIRO, quartoId: '' }
  ],
  ...overrides
});

describe('QuartoService - Cadastro de Quarto', () => {
  let service: QuartoService;

  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();
    
    // Cria nova instância do serviço com mocks
    service = new QuartoService(mockRepository, mockEventEmitter);
  });

  /**
   * Teste: Cadastro de quarto com sucesso
   * 
   * Cenário: Dados válidos, sem conflitos
   * Resultado esperado: Quarto criado, evento emitido, repositório chamado
   */
  it('deve criar quarto com sucesso quando dados são válidos', async () => {
    // Arrange
    const dadosCriacao = criarDadosCriacao({ numero: '201' });
    const quartoEsperado = criarQuartoTeste({
      numero: '201',
      tipo: TipoQuarto.MODERNO,
      precoPorNoite: 200.00
    });

    mockRepository.existePorNumero.mockResolvedValue(false);
    mockRepository.salvar.mockResolvedValue(quartoEsperado);

    // Act
    const resultado = await service.criarQuarto(dadosCriacao);

    // Assert
    expect(mockRepository.existePorNumero).toHaveBeenCalledWith('201');
    expect(mockRepository.salvar).toHaveBeenCalledWith(expect.any(Quarto));
    expect(mockEventEmitter.emit).toHaveBeenCalledWith('quartoCriado', expect.any(Function));
    expect(resultado).toEqual(quartoEsperado);
  });

  /**
   * Teste: Cadastro com número duplicado
   * 
   * Cenário: Número já existe no sistema
   * Resultado esperado: Erro específico, sem chamada ao repositório
   */
  it('deve lançar erro ao tentar cadastrar quarto com número duplicado', async () => {
    // Arrange
    const dadosCriacao = criarDadosCriacao({ numero: '101' });
    
    mockRepository.existePorNumero.mockResolvedValue(true);

    // Act & Assert
    await expect(service.criarQuarto(dadosCriacao)).rejects.toThrow(
      'Já existe um quarto com o número: 101'
    );

    expect(mockRepository.existePorNumero).toHaveBeenCalledWith('101');
    expect(mockRepository.salvar).not.toHaveBeenCalled();
    expect(mockEventEmitter.emit).not.toHaveBeenCalled();
  });

  /**
   * Teste: Cadastro com capacidade inválida
   * 
   * Cenário: Capacidade maior que o permitido
   * Resultado esperado: Erro de validação, sem persistência
   */
  it('deve lançar erro ao tentar cadastrar quarto com capacidade inválida', async () => {
    // Arrange
    const dadosCriacao = criarDadosCriacao({ capacidade: 15 });
    
    mockRepository.existePorNumero.mockResolvedValue(false);

    // Act & Assert
    await expect(service.criarQuarto(dadosCriacao)).rejects.toThrow(
      'Capacidade máxima permitida é de 10 pessoas'
    );

    expect(mockRepository.salvar).not.toHaveBeenCalled();
    expect(mockEventEmitter.emit).not.toHaveBeenCalled();
  });

  /**
   * Teste: Cadastro com preço inválido
   * 
   * Cenário: Preço negativo ou acima do limite
   * Resultado esperado: Erro de validação
   */
  it('deve lançar erro ao tentar cadastrar quarto com preço acima do limite', async () => {
    // Arrange
    const dadosCriacao = criarDadosCriacao({ precoPorNoite: 15000 });
    
    mockRepository.existePorNumero.mockResolvedValue(false);

    // Act & Assert
    await expect(service.criarQuarto(dadosCriacao)).rejects.toThrow(
      'Preço máximo permitido é R$ 10.000,00'
    );

    expect(mockRepository.salvar).not.toHaveBeenCalled();
  });

  /**
   * Teste: Cadastro sem camas
   * 
   * Cenário: Lista de camas vazia
   * Resultado esperado: Erro de validação
   */
  it('deve lançar erro ao tentar cadastrar quarto sem camas', async () => {
    // Arrange
    const dadosCriacao = criarDadosCriacao({ camas: [] });
    
    mockRepository.existePorNumero.mockResolvedValue(false);

    // Act & Assert
    await expect(service.criarQuarto(dadosCriacao)).rejects.toThrow(
      'Quarto deve ter pelo menos uma cama'
    );

    expect(mockRepository.salvar).not.toHaveBeenCalled();
  });

  /**
   * Teste: Cadastro com inconsistência de capacidade
   * 
   * Cenário: Capacidade informada não corresponde às camas
   * Resultado esperado: Erro de validação
   */
  it('deve lançar erro ao tentar cadastrar quarto com capacidade inconsistente', async () => {
    // Arrange
    const dadosCriacao = criarDadosCriacao({
      capacidade: 4, // 4 pessoas
      camas: [
        { id: 'cama-1', tipo: TipoCama.SOLTEIRO, quartoId: '' }, // 1 pessoa
        { id: 'cama-2', tipo: TipoCama.SOLTEIRO, quartoId: '' }  // 1 pessoa = total 2
      ]
    });
    
    mockRepository.existePorNumero.mockResolvedValue(false);

    // Act & Assert
    await expect(service.criarQuarto(dadosCriacao)).rejects.toThrow(
      'Capacidade das camas (2) não corresponde à capacidade informada (4)'
    );

    expect(mockRepository.salvar).not.toHaveBeenCalled();
  });

  /**
   * Teste: Erro no repositório durante cadastro
   * 
   * Cenário: Falha na persistência
   * Resultado esperado: Erro propagado, tratamento de logging
   */
  it('deve propagar erro do repositório durante cadastro', async () => {
    // Arrange
    const dadosCriacao = criarDadosCriacao();
    const erroRepositorio = new Error('Erro de conexão com banco');
    
    mockRepository.existePorNumero.mockResolvedValue(false);
    mockRepository.salvar.mockRejectedValue(erroRepositorio);

    // Act & Assert
    await expect(service.criarQuarto(dadosCriacao)).rejects.toThrow('Erro de conexão com banco');

    expect(mockRepository.salvar).toHaveBeenCalled();
    expect(mockEventEmitter.emit).not.toHaveBeenCalled();
  });

  /**
   * Teste: Emissão de evento após cadastro bem-sucedido
   * 
   * Cenário: Cadastro realizado com sucesso
   * Resultado esperado: Evento 'quartoCriado' emitido com quarto criado
   */
  it('deve emitir evento quartoCriado após cadastro bem-sucedido', async () => {
    // Arrange
    const dadosCriacao = criarDadosCriacao({ numero: '301' });
    const quartoCriado = criarQuartoTeste({ numero: '301' });
    
    mockRepository.existePorNumero.mockResolvedValue(false);
    mockRepository.salvar.mockResolvedValue(quartoCriado);

    // Act
    await service.criarQuarto(dadosCriacao);

    // Assert
    expect(mockEventEmitter.emit).toHaveBeenCalledWith(
      'quartoCriado',
      expect.any(Function)
    );

    // Verifica se o callback do evento retorna o quarto criado
    const eventCallback = mockEventEmitter.emit.mock.calls[0][1];
    expect(eventCallback()).toEqual(quartoCriado);
  });
});

describe('QuartoService - Edição de Quarto', () => {
  let service: QuartoService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new QuartoService(mockRepository, mockEventEmitter);
  });

  /**
   * Teste: Edição de quarto com sucesso
   * 
   * Cenário: Quarto existe, dados válidos
   * Resultado esperado: Quarto atualizado, eventos emitidos
   */
  it('deve editar quarto com sucesso quando dados são válidos', async () => {
    // Arrange
    const quartoExistente = criarQuartoTeste({ 
      id: 'quarto-123', 
      numero: '101',
      status: StatusQuarto.DISPONIVEL
    });
    const dadosAtualizacao = criarDadosCriacao({
      numero: '101-A',
      precoPorNoite: 180.00
    });
    const quartoAtualizado = criarQuartoTeste({
      ...quartoExistente,
      numero: '101-A',
      precoPorNoite: 180.00
    });

    mockRepository.buscarPorId.mockResolvedValue(quartoExistente);
    mockRepository.existePorNumero.mockResolvedValue(false);
    mockRepository.atualizar.mockResolvedValue(quartoAtualizado);

    // Act
    const resultado = await service.atualizarQuarto('quarto-123', dadosAtualizacao);

    // Assert
    expect(mockRepository.buscarPorId).toHaveBeenCalledWith('quarto-123');
    expect(mockRepository.existePorNumero).toHaveBeenCalledWith('101-A');
    expect(mockRepository.atualizar).toHaveBeenCalledWith('quarto-123', expect.any(Quarto));
    expect(mockEventEmitter.emit).toHaveBeenCalledWith('quartoAtualizado', expect.any(Function));
    expect(resultado).toEqual(quartoAtualizado);
  });

  /**
   * Teste: Edição de quarto inexistente
   * 
   * Cenário: ID não encontrado
   * Resultado esperado: Erro específico, sem atualização
   */
  it('deve lançar erro ao tentar editar quarto inexistente', async () => {
    // Arrange
    const dadosAtualizacao = criarDadosCriacao();
    
    mockRepository.buscarPorId.mockResolvedValue(null);

    // Act & Assert
    await expect(service.atualizarQuarto('quarto-inexistente', dadosAtualizacao))
      .rejects.toThrow('Quarto não encontrado: quarto-inexistente');

    expect(mockRepository.buscarPorId).toHaveBeenCalledWith('quarto-inexistente');
    expect(mockRepository.atualizar).not.toHaveBeenCalled();
    expect(mockEventEmitter.emit).not.toHaveBeenCalled();
  });

  /**
   * Teste: Edição com número duplicado
   * 
   * Cenário: Novo número já existe em outro quarto
   * Resultado esperado: Erro de duplicidade
   */
  it('deve lançar erro ao tentar editar quarto com número duplicado', async () => {
    // Arrange
    const quartoExistente = criarQuartoTeste({ id: 'quarto-123', numero: '101' });
    const dadosAtualizacao = criarDadosCriacao({ numero: '102' });
    
    mockRepository.buscarPorId.mockResolvedValue(quartoExistente);
    mockRepository.existePorNumero.mockResolvedValue(true);

    // Act & Assert
    await expect(service.atualizarQuarto('quarto-123', dadosAtualizacao))
      .rejects.toThrow('Já existe um quarto com o número: 102');

    expect(mockRepository.atualizar).not.toHaveBeenCalled();
  });

  /**
   * Teste: Edição de status inválido
   * 
   * Cenário: Transição de status não permitida
   * Resultado esperado: Erro de transição
   */
  it('deve lançar erro ao tentar editar quarto com transição de status inválida', async () => {
    // Arrange
    const quartoExistente = criarQuartoTeste({ 
      id: 'quarto-123', 
      status: StatusQuarto.DISPONIVEL 
    });
    const dadosAtualizacao = criarDadosCriacao({ status: StatusQuarto.OCUPADO });
    
    mockRepository.buscarPorId.mockResolvedValue(quartoExistente);

    // Act & Assert
    await expect(service.atualizarQuarto('quarto-123', dadosAtualizacao))
      .rejects.toThrow('Transição de status inválida: DISPONIVEL -> OCUPADO');

    expect(mockRepository.atualizar).not.toHaveBeenCalled();
  });

  /**
   * Teste: Edição parcial
   * 
   * Cenário: Apenas alguns campos informados
   * Resultado esperado: Apenas campos informados alterados
   */
  it('deve permitir edição parcial de quarto', async () => {
    // Arrange
    const quartoOriginal = criarQuartoTeste({ 
      id: 'quarto-123',
      numero: '101',
      precoPorNoite: 150.00,
      hasMinibar: true
    });
    const dadosParciais = {
      precoPorNoite: 250.00,
      hasMinibar: false
    };
    const quartoAtualizado = criarQuartoTeste({
      ...quartoOriginal,
      precoPorNoite: 250.00,
      hasMinibar: false
    });

    mockRepository.buscarPorId.mockResolvedValue(quartoOriginal);
    mockRepository.atualizar.mockResolvedValue(quartoAtualizado);

    // Act
    const resultado = await service.atualizarQuarto('quarto-123', dadosParciais);

    // Assert
    expect(resultado.precoPorNoite).toBe(250.00);
    expect(resultado.hasMinibar).toBe(false);
    // Campos não informados devem permanecer inalterados
    expect(resultado.numero).toBe('101');
    expect(resultado.tipo).toBe(TipoQuarto.BASICO);
  });

  /**
   * Teste: Edição de quarto ocupado
   * 
   * Cenário: Tentativa de editar quarto ocupado
   * Resultado esperado: Erro de negócio
   */
  it('deve lançar erro ao tentar editar quarto ocupado', async () => {
    // Arrange
    const quartoOcupado = criarQuartoTeste({ 
      id: 'quarto-ocupado',
      status: StatusQuarto.OCUPADO 
    });
    const dadosAtualizacao = criarDadosCriacao();
    
    mockRepository.buscarPorId.mockResolvedValue(quartoOcupado);

    // Act & Assert
    await expect(service.atualizarQuarto('quarto-ocupado', dadosAtualizacao))
      .rejects.toThrow('Não é possível editar um quarto ocupado');

    expect(mockRepository.atualizar).not.toHaveBeenCalled();
  });

  /**
   * Teste: Erro no repositório durante edição
   * 
   * Cenário: Falha na atualização
   * Resultado esperado: Erro propagado
   */
  it('deve propagar erro do repositório durante edição', async () => {
    // Arrange
    const quartoExistente = criarQuartoTeste({ id: 'quarto-123' });
    const dadosAtualizacao = criarDadosCriacao();
    const erroRepositorio = new Error('Erro de atualização');
    
    mockRepository.buscarPorId.mockResolvedValue(quartoExistente);
    mockRepository.atualizar.mockRejectedValue(erroRepositorio);

    // Act & Assert
    await expect(service.atualizarQuarto('quarto-123', dadosAtualizacao))
      .rejects.toThrow('Erro de atualização');

    expect(mockRepository.atualizar).toHaveBeenCalled();
    expect(mockEventEmitter.emit).not.toHaveBeenCalled();
  });

  /**
   * Teste: Emissão de eventos após edição bem-sucedida
   * 
   * Cenário: Edição realizada com sucesso
   * Resultado esperado: Eventos 'quartoAtualizado' emitidos
   */
  it('deve emitir eventos quartoAtualizado após edição bem-sucedida', async () => {
    // Arrange
    const quartoExistente = criarQuartoTeste({ 
      id: 'quarto-123',
      status: StatusQuarto.DISPONIVEL
    });
    const dadosAtualizacao = criarDadosCriacao({ status: StatusQuarto.LIMPEZA });
    const quartoAtualizado = criarQuartoTeste({
      ...quartoExistente,
      status: StatusQuarto.LIMPEZA
    });
    
    mockRepository.buscarPorId.mockResolvedValue(quartoExistente);
    mockRepository.atualizar.mockResolvedValue(quartoAtualizado);

    // Act
    await service.atualizarQuarto('quarto-123', dadosAtualizacao);

    // Assert
    expect(mockEventEmitter.emit).toHaveBeenCalledWith(
      'quartoAtualizado',
      expect.any(Function)
    );

    // Verifica callback do evento
    const eventCallback = mockEventEmitter.emit.mock.calls[0][1];
    expect(eventCallback()).toEqual(quartoAtualizado);
  });

  /**
   * Teste: Edição mantém ID original
   * 
   * Cenário: Atualização de quarto existente
   * Resultado esperado: ID mantido, apenas campos alterados
   */
  it('deve manter ID original durante edição', async () => {
    // Arrange
    const quartoOriginal = criarQuartoTeste({ 
      id: 'quarto-123',
      numero: '101'
    });
    const dadosAtualizacao = criarDadosCriacao({ numero: '101-A' });
    
    mockRepository.buscarPorId.mockResolvedValue(quartoOriginal);
    mockRepository.atualizar.mockImplementation((id, quarto) => {
      expect(id).toBe('quarto-123');
      expect(quarto.id).toBe('quarto-123'); // ID deve ser mantido
      return Promise.resolve(quarto);
    });

    // Act
    await service.atualizarQuarto('quarto-123', dadosAtualizacao);

    // Assert
    expect(mockRepository.atualizar).toHaveBeenCalledWith(
      'quarto-123',
      expect.objectContaining({ id: 'quarto-123' })
    );
  });
});

describe('QuartoService - Validações de Negócio', () => {
  let service: QuartoService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new QuartoService(mockRepository, mockEventEmitter);
  });

  /**
   * Teste: Validação de formato do número
   * 
   * Cenário: Número com caracteres inválidos
   * Resultado esperado: Erro de formatação
   */
  it('deve validar formato do número do quarto', async () => {
    // Arrange
    const dadosCriacao = criarDadosCriacao({ numero: '101@#' }); // Caracteres inválidos
    
    mockRepository.existePorNumero.mockResolvedValue(false);

    // Act & Assert
    await expect(service.criarQuarto(dadosCriacao)).rejects.toThrow(
      'Número deve conter apenas letras e números (máx. 10)'
    );
  });

  /**
   * Teste: Validação de comprimento do número
   * 
   * Cenário: Número muito longo
   * Resultado esperado: Erro de comprimento
   */
  it('deve validar comprimento máximo do número', async () => {
    // Arrange
    const dadosCriacao = criarDadosCriacao({ numero: '12345678901' }); // 11 caracteres
    
    mockRepository.existePorNumero.mockResolvedValue(false);

    // Act & Assert
    await expect(service.criarQuarto(dadosCriacao)).rejects.toThrow(
      'Número deve conter apenas letras e números (máx. 10)'
    );
  });

  /**
   * Teste: Validação de preço mínimo
   * 
   * Cenário: Preço zero ou negativo
   * Resultado esperado: Erro de valor
   */
  it('deve validar preço mínimo positivo', async () => {
    // Arrange
    const dadosCriacao = criarDadosCriacao({ precoPorNoite: 0 });
    
    mockRepository.existePorNumero.mockResolvedValue(false);

    // Act & Assert
    await expect(service.criarQuarto(dadosCriacao)).rejects.toThrow(
      'Preço por noite deve ser maior que zero'
    );
  });

  /**
   * Teste: Validação de capacidade mínima
   * 
   * Cenário: Capacidade zero ou negativa
   * Resultado esperado: Erro de valor
   */
  it('deve validar capacidade mínima positiva', async () => {
    // Arrange
    const dadosCriacao = criarDadosCriacao({ capacidade: 0 });
    
    mockRepository.existePorNumero.mockResolvedValue(false);

    // Act & Assert
    await expect(service.criarQuarto(dadosCriacao)).rejects.toThrow(
      'Capacidade deve ser maior que zero'
    );
  });

  /**
   * Teste: Validação de tipo de quarto
   * 
   * Cenário: Tipo não informado
   * Resultado esperado: Erro de campo obrigatório
   */
  it('deve validar tipo do quarto obrigatório', async () => {
    // Arrange
    const dadosCriacao = criarDadosCriacao();
    delete (dadosCriacao as any).tipo;
    
    mockRepository.existePorNumero.mockResolvedValue(false);

    // Act & Assert
    await expect(service.criarQuarto(dadosCriacao)).rejects.toThrow(
      'Tipo do quarto é obrigatório'
    );
  });
});
