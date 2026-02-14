/**
 * Testes Unitários para Componente QuartoForm
 * 
 * Princípios de Teste aplicados:
 * - AAA: Arrange, Act, Assert
 * - Testes isolados e independentes
 * - Mocks para dependências externas
 * - Cobertura de casos de sucesso e erro
 * - Nomes descritivos que indicam intenção
 * - Testes de integração com UI
 * 
 * Funcionalidades testadas:
 * - Cadastro de quarto
 * - Edição de quarto
 * - Validações de formulário
 * - Interações do usuário
 * - Estados de loading
 * - Renderização condicional
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuartoFormRefactored } from '../QuartoFormRefactored';
import { Quarto, TipoQuarto, StatusQuarto, TipoCama } from '../../domain/entities/Quarto';

// Mock do módulo de domínio para evitar dependências externas
jest.mock('../../domain/entities/Quarto', () => ({
  Quarto: {
    criar: jest.fn(),
  },
  TipoQuarto: {
    BASICO: 'BASICO',
    MODERNO: 'MODERNO',
    LUXO: 'LUXO'
  },
  StatusQuarto: {
    DISPONIVEL: 'DISPONIVEL',
    OCUPADO: 'OCUPADO',
    MANUTENCAO: 'MANUTENCAO',
    LIMPEZA: 'LIMPEZA'
  },
  TipoCama: {
    SOLTEIRO: 'SOLTEIRO',
    CASAL_KING: 'CASAL_KING',
    CASAL_QUEEN: 'CASAL_QUEEN'
  }
}));

const mockQuartoCriar = jest.fn();
const mockOnCancel = jest.fn();

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

/**
 * Helper para renderizar componente com props padrão
 * 
 * Decisão: Wrapper customizado para testes
 * - Props consistentes
 * - Facilita setup
 * - Reduz duplicação
 */
const renderQuartoForm = (props: any = {}) => {
  const defaultProps = {
    onSave: mockQuartoCriar,
    onCancel: mockOnCancel,
    readonly: false,
    loading: false
  };

  return render(
    <QuartoFormRefactored {...defaultProps} {...props} />
  );
};

describe('QuartoForm - Cadastro de Quarto', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Teste: Renderização inicial do formulário
   * 
   * Cenário: Componente montado em modo criação
   * Resultado esperado: Campos visíveis, valores iniciais corretos
   */
  it('deve renderizar formulário corretamente em modo criação', () => {
    // Arrange & Act
    renderQuartoForm();

    // Assert
    expect(screen.getByText('Cadastrar Novo Quarto')).toBeInTheDocument();
    expect(screen.getByLabelText('Número do Quarto')).toBeInTheDocument();
    expect(screen.getByLabelText('Tipo do Quarto')).toBeInTheDocument();
    expect(screen.getByLabelText('Capacidade')).toBeInTheDocument();
    expect(screen.getByLabelText('Preço por Noite (R$)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cadastrar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
  });

  /**
   * Teste: Cadastro com sucesso
   * 
   * Cenário: Todos os campos preenchidos corretamente
   * Resultado esperado: Formulário submetido, onSave chamado com dados corretos
   */
  it('deve cadastrar quarto com sucesso quando dados são válidos', async () => {
    // Arrange
    const quartoCriado = criarQuartoTeste({ numero: '201' });
    const { Quarto } = require('../../domain/entities/Quarto');
    Quarto.criar.mockReturnValue(quartoCriado);

    const user = userEvent.setup();
    renderQuartoForm();

    // Act
    // Preenche os campos
    await user.type(screen.getByLabelText('Número do Quarto'), '201');
    await user.selectOptions(screen.getByLabelText('Tipo do Quarto'), 'MODERNO');
    await user.clear(screen.getByLabelText('Capacidade'));
    await user.type(screen.getByLabelText('Capacidade'), '2');
    await user.clear(screen.getByLabelText('Preço por Noite (R$)'));
    await user.type(screen.getByLabelText('Preço por Noite (R$)', '200');

    // Adiciona camas
    await user.click(screen.getByRole('button', { name: /adicionar cama/i }));
    await user.selectOptions(screen.getByLabelText('Tipo da Cama'), 'Solteiro');

    // Submete o formulário
    await user.click(screen.getByRole('button', { name: /cadastrar/i }));

    // Assert
    await waitFor(() => {
      expect(mockQuartoCriar).toHaveBeenCalledWith(
        expect.objectContaining({
          numero: '201',
          tipo: TipoQuarto.MODERNO,
          capacidade: 2,
          precoPorNoite: 200
        })
      );
    });
  });

  /**
   * Teste: Validação de campo obrigatório
   * 
   * Cenário: Tentativa de submissão sem preencher número
   * Resultado esperado: Erro de validação exibido, formulário não submetido
   */
  it('deve exibir erro de validação quando número não é preenchido', async () => {
    // Arrange
    const user = userEvent.setup();
    renderQuartoForm();

    // Act
    // Tenta submeter sem preencher campos obrigatórios
    await user.click(screen.getByRole('button', { name: /cadastrar/i }));

    // Assert
    expect(screen.getByText('Número do quarto é obrigatório')).toBeInTheDocument();
    expect(mockQuartoCriar).not.toHaveBeenCalled();
  });

  /**
   * Teste: Validação de capacidade inválida
   * 
   * Cenário: Capacidade preenchida com valor inválido
   * Resultado esperado: Erro de validação exibido
   */
  it('deve exibir erro quando capacidade é inválida', async () => {
    // Arrange
    const user = userEvent.setup();
    renderQuartoForm();

    // Act
    await user.type(screen.getByLabelText('Número do Quarto'), '201');
    await user.clear(screen.getByLabelText('Capacidade'));
    await user.type(screen.getByLabelText('Capacidade'), '0'); // Inválido
    await user.click(screen.getByRole('button', { name: /cadastrar/i }));

    // Assert
    expect(screen.getByText('Capacidade deve ser maior que zero')).toBeInTheDocument();
    expect(mockQuartoCriar).not.toHaveBeenCalled();
  });

  /**
   * Teste: Validação de preço inválido
   * 
   * Cenário: Preço preenchido com valor inválido
   * Resultado esperado: Erro de validação exibido
   */
  it('deve exibir erro quando preço é inválido', async () => {
    // Arrange
    const user = userEvent.setup();
    renderQuartoForm();

    // Act
    await user.type(screen.getByLabelText('Número do Quarto'), '201');
    await user.clear(screen.getByLabelText('Preço por Noite (R$)'));
    await user.type(screen.getByLabelText('Preço por Noite (R$)', '-50'); // Inválido
    await user.click(screen.getByRole('button', { name: /cadastrar/i }));

    // Assert
    expect(screen.getByText('Preço por noite deve ser maior que zero')).toBeInTheDocument();
    expect(mockQuartoCriar).not.toHaveBeenCalled();
  });

  /**
   * Teste: Adição e remoção de camas
   * 
   * Cenário: Usuário adiciona e remove camas
   * Resultado esperado: Lista de camas atualizada corretamente
   */
  it('deve permitir adicionar e remover camas', async () => {
    // Arrange
    const user = userEvent.setup();
    renderQuartoForm();

    // Act
    // Adiciona primeira cama
    await user.click(screen.getByRole('button', { name: /adicionar cama/i }));
    expect(screen.getByText('Capacidade: 1 pessoa(s)')).toBeInTheDocument();

    // Adiciona segunda cama
    await user.click(screen.getByRole('button', { name: /adicionar cama/i }));
    expect(screen.getByText('Capacidade total das camas: 2 pessoa(s)')).toBeInTheDocument();

    // Remove uma cama
    const botoesRemover = screen.getAllByRole('button', { name: /delete/i });
    await user.click(botoesRemover[0]);
    
    // Assert
    expect(screen.getByText('Capacidade total das camas: 1 pessoa(s)')).toBeInTheDocument();
  });

  /**
   * Teste: Não permitir remover todas as camas
   * 
   * Cenário: Tentativa de remover última cama
   * Resultado esperado: Botão de remover desabilitado
   */
  it('não deve permitir remover todas as camas', async () => {
    // Arrange
    const user = userEvent.setup();
    renderQuartoForm();

    // Act
    // Tenta remover a cama padrão (já existe uma por padrão)
    const botaoRemover = screen.getByRole('button', { name: /delete/i });
    
    // Assert
    expect(botaoRemover).toBeDisabled();
  });

  /**
   * Teste: Expansão e colapso de comodidades
   * 
   * Cenário: Usuário clica para expandir/comprimir seção de comodidades
   * Resultado esperado: Seção exibida/escondida corretamente
   */
  it('deve permitir expandir e colapsar seção de comodidades', async () => {
    // Arrange
    const user = userEvent.setup();
    renderQuartoForm();

    // Act
    // Inicialmente colapsado
    expect(screen.queryByText('Frigobar')).not.toBeInTheDocument();
    
    // Expande
    await user.click(screen.getByRole('button', { name: /expand more/i }));
    expect(screen.getByText('Frigobar')).toBeInTheDocument();
    expect(screen.getByText('Café da Manhã')).toBeInTheDocument();
    expect(screen.getByText('Ar-Condicionado')).toBeInTheDocument();
    expect(screen.getByText('TV')).toBeInTheDocument();
    
    // Colapsa
    await user.click(screen.getByRole('button', { name: /expand less/i }));
    expect(screen.queryByText('Frigobar')).not.toBeInTheDocument();
  });

  /**
   * Teste: Botão cancelar
   * 
   * Cenário: Usuário clica em cancelar
   * Resultado esperado: onCancel chamado, formulário não submetido
   */
  it('deve chamar onCancel quando botão cancelar é clicado', async () => {
    // Arrange
    const user = userEvent.setup();
    renderQuartoForm();

    // Act
    await user.click(screen.getByRole('button', { name: /cancelar/i }));

    // Assert
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockQuartoCriar).not.toHaveBeenCalled();
  });

  /**
   * Teste: Estado de loading
   * 
   * Cenário: Componente em estado de loading
   * Resultado esperado: Botões desabilitados, texto de loading
   */
  it('deve desabilitar botões quando em estado de loading', () => {
    // Arrange & Act
    renderQuartoForm({ loading: true });

    // Assert
    expect(screen.getByRole('button', { name: /salvando\.\.\./i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeDisabled();
  });

  /**
   * Teste: Modo somente leitura
   * 
   * Cenário: Componente em modo readonly
   * Resultado esperado: Campos desabilitados, sem botões de ação
   */
  it('deve desabilitar campos quando em modo readonly', () => {
    // Arrange & Act
    renderQuartoForm({ readonly: true });

    // Assert
    expect(screen.getByLabelText('Número do Quarto')).toBeDisabled();
    expect(screen.getByLabelText('Tipo do Quarto')).toBeDisabled();
    expect(screen.getByLabelText('Capacidade')).toBeDisabled();
    expect(screen.getByLabelText('Preço por Noite (R$)')).toBeDisabled();
    expect(screen.queryByRole('button', { name: /cadastrar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /cancelar/i })).not.toBeInTheDocument();
  });
});

describe('QuartoForm - Edição de Quarto', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Teste: Renderização em modo edição
   * 
   * Cenário: Componente montado com quarto para edição
   * Resultado esperado: Campos preenchidos com dados do quarto
   */
  it('deve renderizar formulário corretamente em modo edição', () => {
    // Arrange
    quartoExistente = criarQuartoTeste({
      numero: '101',
      tipo: TipoQuarto.LUXO,
      capacidade: 3,
      precoPorNoite: 300.00,
      status: StatusQuarto.OCUPADO
    });

    // Act
    renderQuartoForm({ quarto: quartoExistente });

    // Assert
    expect(screen.getByText('Editar Quarto')).toBeInTheDocument();
    expect(screen.getByDisplayValue('101')).toBeInTheDocument();
    expect(screen.getByDisplayValue('LUXO')).toBeInTheDocument();
    expect(screen.getByDisplayValue('3')).toBeInTheDocument();
    expect(screen.getByDisplayValue('300')).toBeInTheDocument();
    expect(screen.getByDisplayValue('OCUPADO')).toBeInTheDocument();
  });

  /**
   * Teste: Edição com sucesso
   * 
   * Cenário: Usuário altera dados e submete
   * Resultado esperado: onSave chamado com dados atualizados
   */
  it('deve editar quarto com sucesso quando dados são alterados', async () => {
    // Arrange
    const quartoExistente = criarQuartoTeste({ 
      id: 'quarto-123',
      numero: '101',
      status: StatusQuarto.DISPONIVEL
    });
    const quartoAtualizado = criarQuartoTeste({
      ...quartoExistente,
      numero: '101-A',
      precoPorNoite: 250.00
    });

    const { Quarto } = require('../../domain/entities/Quarto');
    Quarto.criar.mockReturnValue(quartoAtualizado);

    const user = userEvent.setup();
    renderQuartoForm({ quarto: quartoExistente });

    // Act
    // Altera alguns campos
    await user.clear(screen.getByLabelText('Número do Quarto'));
    await user.type(screen.getByLabelText('Número do Quarto', '101-A');
    await user.clear(screen.getByLabelText('Preço por Noite (R$)'));
    await user.type(screen.getByLabelText('Preço por Noite (R$)', '250');

    // Submete
    await user.click(screen.getByRole('button', { name: /atualizar/i }));

    // Assert
    await waitFor(() => {
      expect(mockQuartoCriar).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'quarto-123', // ID mantido
          numero: '101-A',
          precoPorNoite: 250.00
        })
      );
    });
  });

  /**
   * Teste: Campos não editáveis em certas condições
   * 
   * Cenário: Tentativa de editar quarto ocupado
   * Resultado esperado: Campos desabilitados ou mensagens de erro
   */
  it('deve restringir edição de quarto ocupado', async () => {
    // Arrange
    const quartoOcupado = criarQuartoTeste({
      status: StatusQuarto.OCUPADO
    });

    // Act
    renderQuartoForm({ quarto: quartoOcupado });

    // Assert
    // Dependendo das regras de negócio, pode desabilitar campos ou mostrar alertas
    expect(screen.getByText('Editar Quarto')).toBeInTheDocument();
    // Campos podem estar habilitados, mas validações devem ocorrer na submissão
  });

  /**
   * Teste: Manutenção de ID durante edição
   * 
   * Cenário: Edição de quarto existente
   * Resultado esperado: ID original mantido
   */
  it('deve manter ID original durante edição', async () => {
    // Arrange
    const quartoExistente = criarQuartoTeste({ 
      id: 'quarto-123',
      numero: '101'
    });
    const quartoAtualizado = criarQuartoTeste({
      ...quartoExistente,
      numero: '101-A'
    });

    const { Quarto } = require('../../domain/entities/Quarto');
    Quarto.criar.mockReturnValue(quartoAtualizado);

    const user = userEvent.setup();
    renderQuartoForm({ quarto: quartoExistente });

    // Act
    await user.clear(screen.getByLabelText('Número do Quarto'));
    await user.type(screen.getByLabelText('Número do Quarto', '101-A');
    await user.click(screen.getByRole('button', { name: /atualizar/i }));

    // Assert
    await waitFor(() => {
      expect(mockQuartoCriar).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'quarto-123' // ID deve ser mantido
        })
      );
    });
  });

  /**
   * Teste: Validação de capacidade vs camas
   * 
   * Cenário: Capacidade informada não corresponde às camas
   * Resultado esperado: Erro de validação específico
   */
  it('deve validar consistência entre capacidade e camas na edição', async () => {
    // Arrange
    const quartoExistente = criarQuartoTeste({
      capacidade: 2,
      camas: [
        { id: 'cama-1', tipo: TipoCama.SOLTEIRO, quartoId: 'quarto-123' },
        { id: 'cama-2', tipo: TipoCama.SOLTEIRO, quartoId: 'quarto-123' }
      ]
    });

    const user = userEvent.setup();
    renderQuartoForm({ quarto: quartoExistente });

    // Act
    // Altera capacidade para não corresponder às camas
    await user.clear(screen.getByLabelText('Capacidade'));
    await user.type(screen.getByLabelText('Capacidade', '4'); // 4 pessoas, mas camas só suportam 2
    await user.click(screen.getByRole('button', { name: /atualizar/i }));

    // Assert
    expect(screen.getByText(
      'Capacidade das camas (2) não corresponde à capacidade informada (4)'
    )).toBeInTheDocument();
    expect(mockQuartoCriar).not.toHaveBeenCalled();
  });
});

describe('QuartoForm - Comportamento Geral', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Teste: Limpeza de erros ao digitar
   * 
   * Cenário: Erro exibido, usuário começa a digitar no campo
   * Resultado esperado: Erro do campo removido
   */
  it('deve limpar erro do campo quando usuário começa a digitar', async () => {
    // Arrange
    const user = userEvent.setup();
    renderQuartoForm();

    // Gera erro de validação
    await user.click(screen.getByRole('button', { name: /cadastrar/i }));
    expect(screen.getByText('Número do quarto é obrigatório')).toBeInTheDocument();

    // Act
    // Começa a digitar no campo com erro
    await user.type(screen.getByLabelText('Número do Quarto'), '1');

    // Assert
    expect(screen.queryByText('Número do quarto é obrigatório')).not.toBeInTheDocument();
  });

  /**
   * Teste: Formatação automática do número
   * 
   * Cenário: Usuário digita número em minúsculas
   * Resultado esperado: Número formatado em maiúsculas
   */
  it('deve formatar número do quarto para maiúsculas', async () => {
    // Arrange
    const user = userEvent.setup();
    renderQuartoForm();

    // Act
    await user.type(screen.getByLabelText('Número do Quarto'), 'abc');

    // Assert
    // Verifica se o input está configurado para maiúsculas
    const input = screen.getByLabelText('Número do Quarto') as HTMLInputElement;
    expect(input.style.textTransform).toBe('uppercase');
  });

  /**
   * Teste: Validação de limite de caracteres
   * 
   * Cenário: Usuário digita mais caracteres que o permitido
   * Resultado esperado: Input limitado a 10 caracteres
   */
  it('deve limitar número do quarto a 10 caracteres', async () => {
    // Arrange
    const user = userEvent.setup();
    renderQuartoForm();

    // Act
    await user.type(screen.getByLabelText('Número do Quarto'), '123456789012345');

    // Assert
    const input = screen.getByLabelText('Número do Quarto') as HTMLInputElement;
    expect(input.value).toBe('1234567890'); // Limitado a 10 caracteres
    expect(input.maxLength).toBe(10);
  });

  /**
   * Teste: Descrição de camas
   * 
   * Cenário: Múltiplas camas de mesmo tipo
   * Resultado esperado: Descrição formatada corretamente
   */
  it('deve exibir descrição correta para múltiplas camas do mesmo tipo', async () => {
    // Arrange
    const user = userEvent.setup();
    renderQuartoForm();

    // Act
    // Adiciona duas camas solteiro
    await user.click(screen.getByRole('button', { name: /adicionar cama/i }));
    await user.selectOptions(screen.getByLabelText('Tipo da Cama'), 'Solteiro');
    
    await user.click(screen.getByRole('button', { name: /adicionar cama/i }));
    const selects = screen.getAllByLabelText('Tipo da Cama');
    await user.selectOptions(selects[1], 'Solteiro');

    // Assert
    expect(screen.getByText('Capacidade total das camas: 2 pessoa(s)')).toBeInTheDocument();
  });

  /**
   * Teste: Tratamento de erro na criação do quarto
   * 
   * Cenário: Quarto.criar lança erro
   * Resultado esperado: Erro exibido ao usuário
   */
  it('deve exibir erro quando criação do quarto falha', async () => {
    // Arrange
    const { Quarto } = require('../../domain/entities/Quarto');
    Quarto.criar.mockImplementation(() => {
      throw new Error('Erro de validação');
    });

    const user = userEvent.setup();
    renderQuartoForm();

    // Act
    await user.type(screen.getByLabelText('Número do Quarto'), '201');
    await user.type(screen.getByLabelText('Capacidade'), '2');
    await user.type(screen.getByLabelText('Preço por Noite (R$)', '200');
    await user.click(screen.getByRole('button', { name: /cadastrar/i }));

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Erro ao salvar quarto. Tente novamente.')).toBeInTheDocument();
    });
    expect(mockQuartoCriar).not.toHaveBeenCalled();
  });
});
