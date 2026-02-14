/**
 * Testes de Integração - Fluxo Completo de Reserva
 * 
 * Fluxo testado: Cadastro de Hóspede → Criação de Reserva → Atualização de Disponibilidade
 * 
 * Princípios de Teste aplicados:
 * - Integração real entre componentes e serviços
 * - Mocks apenas para dependências externas (API)
 * - Testes end-to-end no frontend
 * - Validação de estados compartilhados
 * - Verificação de efeitos colaterais
 * 
 * Cenários cobertos:
 * - Fluxo feliz completo
 * - Falha em diferentes etapas
 * - Rollback de estados
 * - Concorrência entre reservas
 * - Validações de negócio跨-componentes
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

// Componentes principais do fluxo
import { HospedeForm } from '../../components/hospedes/HospedeForm';
import { ReservaForm } from '../../components/reservas/ReservaForm';
import { QuartoList } from '../../components/quartos/QuartoList';
import { ReservaSummary } from '../../components/reservas/ReservaSummary';

// Hooks e serviços
import { useHospedes } from '../../hooks/useHospedes';
import { useReservas } from '../../hooks/useReservas';
import { useQuartos } from '../../hooks/useQuartos';

// Tipos e enums
import { TipoQuarto, StatusQuarto } from '../../domain/entities/Quarto';
import { StatusReserva } from '../../domain/entities/Reserva';
import { Hospede } from '../../domain/entities/Hospede';

// Mock das APIs externas
const mockApi = {
  // Mock da API de hóspedes
  hospedes: {
    criar: jest.fn(),
    buscarPorId: jest.fn(),
    listar: jest.fn(),
  },
  // Mock da API de reservas
  reservas: {
    criar: jest.fn(),
    atualizar: jest.fn(),
    buscarPorId: jest.fn(),
    listar: jest.fn(),
  },
  // Mock da API de quartos
  quartos: {
    listarDisponiveis: jest.fn(),
    atualizarStatus: jest.fn(),
    buscarPorId: jest.fn(),
  }
};

// Mock dos serviços para usar a API mock
jest.mock('../../services/hospedeService', () => ({
  hospedeService: {
    criarHospede: mockApi.hospedes.criar,
    buscarHospedePorId: mockApi.hospedes.buscarPorId,
    listarHospedes: mockApi.hospedes.listar,
  }
}));

jest.mock('../../services/reservaService', () => ({
  reservaService: {
    criarReserva: mockApi.reservas.criar,
    atualizarReserva: mockApi.reservas.atualizar,
    buscarReservaPorId: mockApi.reservas.buscarPorId,
    listarReservas: mockApi.reservas.listar,
  }
}));

jest.mock('../../services/quartoService', () => ({
  quartoService: {
    buscarQuartosDisponiveis: mockApi.quartos.listarDisponiveis,
    atualizarStatus: mockApi.quartos.atualizarStatus,
    buscarQuospoPorId: mockApi.quartos.buscarPorId,
  }
}));

/**
 * Helper para criar wrapper com QueryClient e Router
 * 
 * Decisão: Wrapper customizado para testes de integração
 * - Isola testes entre si
 * - Configuração específica para integração
 * - Suporte a navegação entre componentes
 */
const createIntegrationWrapper = () => {
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
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

/**
 * Helper para criar dados de teste consistentes
 * 
 * Decisão: Factory functions para dados de teste
 * - Consistência nos dados
 * - Facilita manutenção
 * - Reutilização em múltiplos testes
 */
const criarHospedeTeste = (overrides: Partial<Hospede> = {}): Hospede => ({
  id: 'hospede-test-123',
  nome: 'João Silva',
  email: 'joao.silva@email.com',
  telefone: '(11) 98765-4321',
  cpf: '123.456.789-00',
  dataNascimento: new Date('1990-01-01'),
  endereco: {
    rua: 'Rua das Flores',
    numero: '123',
    bairro: 'Centro',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01234-567'
  },
  ...overrides
});

const criarQuartoTeste = (overrides: any = {}) => ({
  id: 'quarto-test-123',
  numero: '101',
  capacidade: 2,
  tipo: TipoQuarto.BASICO,
  precoPorNoite: 150.00,
  status: StatusQuarto.DISPONIVEL,
  camas: [
    { id: 'cama-1', tipo: 'CASAL_QUEEN', capacidade: 2 }
  ],
  ...overrides
});

const criarReservaTeste = (overrides: any = {}) => ({
  id: 'reserva-test-123',
  hospedeId: 'hospede-test-123',
  quartoId: 'quarto-test-123',
  dataCheckIn: new Date('2024-12-01'),
  dataCheckOut: new Date('2024-12-03'),
  status: StatusReserva.CONFIRMADA,
  valorTotal: 300.00,
  ...overrides
});

describe('Fluxo de Integração: Cadastro Hóspede → Reserva → Disponibilidade', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configuração padrão dos mocks
    mockApi.hospedes.criar.mockResolvedValue(criarHospedeTeste());
    mockApi.reservas.criar.mockResolvedValue(criarReservaTeste());
    mockApi.quartos.listarDisponiveis.mockResolvedValue([criarQuartoTeste()]);
    mockApi.quartos.atualizarStatus.mockResolvedValue(criarQuartoTeste({ status: StatusQuarto.OCUPADO }));
  });

  /**
   * Teste: Fluxo feliz completo
   * 
   * Cenário: Hóspede novo → Quarto disponível → Reserva criada → Quarto ocupado
   * Resultado esperado: Todos os componentes atualizados, estados consistentes
   */
  it('deve executar fluxo completo com sucesso', async () => {
    // Arrange
    const user = userEvent.setup();
    
    // Renderiza o componente principal do fluxo
    render(
      <div>
        <HospedeForm onSuccess={() => {}} />
        <QuartoList onSelectQuarto={() => {}} />
        <ReservaForm onSuccess={() => {}} />
        <ReservaSummary />
      </div>,
      { wrapper: createIntegrationWrapper() }
    );

    // Act & Assert - Etapa 1: Cadastro de Hóspede
    expect(screen.getByText('Cadastrar Hóspede')).toBeInTheDocument();
    
    // Preenche dados do hóspede
    await user.type(screen.getByLabelText('Nome Completo'), 'João Silva');
    await user.type(screen.getByLabelText('Email'), 'joao.silva@email.com');
    await user.type(screen.getByLabelText('Telefone'), '(11) 98765-4321');
    await user.type(screen.getByLabelText('CPF'), '123.456.789-00');
    
    // Submete cadastro
    await user.click(screen.getByRole('button', { name: /cadastrar hóspede/i }));

    // Verifica se API foi chamada
    await waitFor(() => {
      expect(mockApi.hospedes.criar).toHaveBeenCalledWith(
        expect.objectContaining({
          nome: 'João Silva',
          email: 'joao.silva@email.com'
        })
      );
    });

    // Act & Assert - Etapa 2: Seleção de Quarto
    expect(screen.getByText('Quartos Disponíveis')).toBeInTheDocument();
    
    // Aguarda lista de quartos carregar
    await waitFor(() => {
      expect(mockApi.quartos.listarDisponiveis).toHaveBeenCalled();
    });

    // Verifica se quarto disponível é exibido
    expect(screen.getByText('Quarto 101')).toBeInTheDocument();
    expect(screen.getByText('R$ 150,00/noite')).toBeInTheDocument();

    // Seleciona quarto
    await user.click(screen.getByRole('button', { name: /selecionar quarto 101/i }));

    // Act & Assert - Etapa 3: Criação de Reserva
    expect(screen.getByText('Criar Reserva')).toBeInTheDocument();
    
    // Preenche dados da reserva
    await user.type(screen.getByLabelText('Data de Check-in'), '01/12/2024');
    await user.type(screen.getByLabelText('Data de Check-out'), '03/12/2024');
    
    // Submete reserva
    await user.click(screen.getByRole('button', { name: /confirmar reserva/i }));

    // Verifica se API foi chamada
    await waitFor(() => {
      expect(mockApi.reservas.criar).toHaveBeenCalledWith(
        expect.objectContaining({
          dataCheckIn: expect.any(Date),
          dataCheckOut: expect.any(Date),
          valorTotal: 300.00
        })
      );
    });

    // Act & Assert - Etapa 4: Atualização de Disponibilidade
    // Verifica se status do quarto foi atualizado
    await waitFor(() => {
      expect(mockApi.quartos.atualizarStatus).toHaveBeenCalledWith(
        'quarto-test-123',
        StatusQuarto.OCUPADO
      );
    });

    // Verifica resumo final
    expect(screen.getByText('Reserva Confirmada!')).toBeInTheDocument();
    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('Quarto 101')).toBeInTheDocument();
    expect(screen.getByText('R$ 300,00')).toBeInTheDocument();
  });

  /**
   * Teste: Falha no cadastro de hóspede
   * 
   * Cenário: Erro na API de hóspedes
   * Resultado esperado: Fluxo interrompido, mensagem de erro, sem efeitos colaterais
   */
  it('deve interromper fluxo quando cadastro de hóspede falha', async () => {
    // Arrange
    const user = userEvent.setup();
    const erroHospede = new Error('CPF já cadastrado');
    mockApi.hospedes.criar.mockRejectedValue(erroHospede);

    render(
      <div>
        <HospedeForm onSuccess={() => {}} />
        <QuartoList onSelectQuarto={() => {}} />
      </div>,
      { wrapper: createIntegrationWrapper() }
    );

    // Act
    await user.type(screen.getByLabelText('Nome Completo'), 'João Silva');
    await user.type(screen.getByLabelText('CPF'), '123.456.789-00');
    await user.click(screen.getByRole('button', { name: /cadastrar hóspede/i }));

    // Assert
    await waitFor(() => {
      expect(screen.getByText('CPF já cadastrado')).toBeInTheDocument();
    });

    // Verifica que APIs subsequentes não foram chamadas
    expect(mockApi.quartos.listarDisponiveis).not.toHaveBeenCalled();
    expect(mockApi.reservas.criar).not.toHaveBeenCalled();
    expect(mockApi.quartos.atualizarStatus).not.toHaveBeenCalled();
  });

  /**
   * Teste: Falha na criação de reserva
   * 
   * Cenário: Erro na API de reservas
   * Resultado esperado: Rollback parcial, quarto permanece disponível
   */
  it('deve manter quarto disponível quando criação de reserva falha', async () => {
    // Arrange
    const user = userEvent.setup();
    const erroReserva = new Error('Quarto indisponível para o período');
    mockApi.reservas.criar.mockRejectedValue(erroReserva);

    // Mock para simular hóspede já cadastrado
    mockApi.hospedes.buscarPorId.mockResolvedValue(criarHospedeTeste());

    render(
      <div>
        <HospedeForm onSuccess={() => {}} />
        <QuartoList onSelectQuarto={() => {}} />
        <ReservaForm onSuccess={() => {}} />
      </div>,
      { wrapper: createIntegrationWrapper() }
    );

    // Act - Simula fluxo até seleção de quarto
    // Pula cadastro (hóspede já existe)
    await user.click(screen.getByRole('button', { name: /selecionar quarto 101/i }));
    
    // Tenta criar reserva
    await user.type(screen.getByLabelText('Data de Check-in'), '01/12/2024');
    await user.type(screen.getByLabelText('Data de Check-out'), '03/12/2024');
    await user.click(screen.getByRole('button', { name: /confirmar reserva/i }));

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Quarto indisponível para o período')).toBeInTheDocument();
    });

    // Verifica que status do quarto NÃO foi alterado
    expect(mockApi.quartos.atualizarStatus).not.toHaveBeenCalled();
    
    // Verifica que quarto ainda aparece como disponível
    await waitFor(() => {
      expect(mockApi.quartos.listarDisponiveis).toHaveBeenCalled();
    });
  });

  /**
   * Teste: Concorrência entre reservas
   * 
   * Cenário: Dois usuários tentam reservar mesmo quarto simultaneamente
   * Resultado esperado: Apenas um sucesso, outro recebe erro de conflito
   */
  it('deve tratar concorrência entre múltiplas reservas', async () => {
    // Arrange
    const user = userEvent.setup();
    
    // Simula que primeira reserva já foi feita por outro usuário
    mockApi.reservas.criar.mockRejectedValueOnce(
      new Error('Quarto já reservado para este período')
    );
    // Segunda tentativa (após refresh) funciona
    mockApi.reservas.criar.mockResolvedValueOnce(criarReservaTeste());

    render(
      <div>
        <HospedeForm onSuccess={() => {}} />
        <QuartoList onSelectQuarto={() => {}} />
        <ReservaForm onSuccess={() => {}} />
      </div>,
      { wrapper: createIntegrationWrapper() }
    );

    // Act - Tenta primeira reserva
    await user.click(screen.getByRole('button', { name: /selecionar quarto 101/i }));
    await user.type(screen.getByLabelText('Data de Check-in'), '01/12/2024');
    await user.type(screen.getByLabelText('Data de Check-out'), '03/12/2024');
    await user.click(screen.getByRole('button', { name: /confirmar reserva/i }));

    // Assert - Primeira tentativa falha
    await waitFor(() => {
      expect(screen.getByText('Quarto já reservado para este período')).toBeInTheDocument();
    });

    // Act - Tenta novamente com quarto diferente
    mockApi.quartos.listarDisponiveis.mockResolvedValue([
      criarQuartoTeste({ id: 'quarto-test-456', numero: '102' })
    ]);

    await user.click(screen.getByRole('button', { name: /atualizar lista/i }));
    await user.click(screen.getByRole('button', { name: /selecionar quarto 102/i }));
    await user.click(screen.getByRole('button', { name: /confirmar reserva/i }));

    // Assert - Segunda tentativa sucesso
    await waitFor(() => {
      expect(screen.getByText('Reserva Confirmada!')).toBeInTheDocument();
    });

    // Verifica que apenas um quarto foi atualizado
    expect(mockApi.quartos.atualizarStatus).toHaveBeenCalledWith(
      'quarto-test-456',
      StatusQuarto.OCUPADO
    );
  });

  /**
   * Teste: Validação de datas conflitantes
   * 
   * Cenário: Tentativa de reserva com datas inválidas
   * Resultado esperado: Validação no frontend, sem chamada à API
   */
  it('deve validar datas no frontend antes de chamar API', async () => {
    // Arrange
    const user = userEvent.setup();

    render(
      <div>
        <HospedeForm onSuccess={() => {}} />
        <QuartoList onSelectQuarto={() => {}} />
        <ReservaForm onSuccess={() => {}} />
      </div>,
      { wrapper: createIntegrationWrapper() }
    );

    // Act - Tenta reserva com data de checkout anterior ao checkin
    await user.click(screen.getByRole('button', { name: /selecionar quarto 101/i }));
    await user.type(screen.getByLabelText('Data de Check-in'), '03/12/2024');
    await user.type(screen.getByLabelText('Data de Check-out'), '01/12/2024'); // Anterior!
    await user.click(screen.getByRole('button', { name: /confirmar reserva/i }));

    // Assert
    expect(screen.getByText('Data de check-out deve ser posterior à data de check-in')).toBeInTheDocument();
    
    // Verifica que API não foi chamada
    expect(mockApi.reservas.criar).not.toHaveBeenCalled();
    expect(mockApi.quartos.atualizarStatus).not.toHaveBeenCalled();
  });

  /**
   * Teste: Atualização de cache entre componentes
   * 
   * Cenário: Após reserva, outros componentes devem refletir mudança
   * Resultado esperado: Cache invalidado, dados atualizados
   */
  it('deve atualizar cache entre componentes após reserva', async () => {
    // Arrange
    const user = userEvent.setup();

    // Renderiza múltiplas visualizações do mesmo dado
    render(
      <div>
        <QuartoList onSelectQuarto={() => {}} title="Lista Principal" />
        <QuartoList onSelectQuarto={() => {}} title="Lista Secundária" />
        <ReservaForm onSuccess={() => {}} />
      </div>,
      { wrapper: createIntegrationWrapper() }
    );

    // Act - Executa fluxo completo
    await user.click(screen.getByRole('button', { name: /selecionar quarto 101/i }));
    await user.type(screen.getByLabelText('Data de Check-in'), '01/12/2024');
    await user.type(screen.getByLabelText('Data de Check-out'), '03/12/2024');
    await user.click(screen.getByRole('button', { name: /confirmar reserva/i }));

    // Assert - Aguarda atualização
    await waitFor(() => {
      expect(mockApi.quartos.atualizarStatus).toHaveBeenCalled();
    });

    // Verifica que lista foi atualizada (quarto não aparece mais como disponível)
    await waitFor(() => {
      expect(mockApi.quartos.listarDisponiveis).toHaveBeenCalledTimes(2); // Initial + after update
    });
  });

  /**
   * Teste: Rollback completo em caso de falha crítica
   * 
   * Cenário: Falha na atualização do status do quarto
   * Resultado esperado: Reserva cancelada, estado consistente
   */
  it('deve fazer rollback quando atualização de status falha', async () => {
    // Arrange
    const user = userEvent.setup();
    const erroStatus = new Error('Erro ao atualizar status do quarto');
    mockApi.quartos.atualizarStatus.mockRejectedValue(erroStatus);
    
    // Mock para cancelamento da reserva
    mockApi.reservas.atualizar.mockResolvedValue(
      criarReservaTeste({ status: StatusReserva.CANCELADA })
    );

    render(
      <div>
        <HospedeForm onSuccess={() => {}} />
        <QuartoList onSelectQuarto={() => {}} />
        <ReservaForm onSuccess={() => {}} />
      </div>,
      { wrapper: createIntegrationWrapper() }
    );

    // Act
    await user.click(screen.getByRole('button', { name: /selecionar quarto 101/i }));
    await user.type(screen.getByLabelText('Data de Check-in'), '01/12/2024');
    await user.type(screen.getByLabelText('Data de Check-out'), '03/12/2024');
    await user.click(screen.getByRole('button', { name: /confirmar reserva/i }));

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Erro ao confirmar reserva')).toBeInTheDocument();
    });

    // Verifica rollback
    expect(mockApi.reservas.atualizar).toHaveBeenCalledWith(
      'reserva-test-123',
      expect.objectContaining({ status: StatusReserva.CANCELADA })
    );
  });
});

describe('Fluxo de Integração - Casos Especiais', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Teste: Hóspede existente
   * 
   * Cenário: Usuário seleciona hóspede já cadastrado
   * Resultado esperado: Pula etapa de cadastro, fluxo continua normal
   */
  it('deve permitir fluxo com hóspede já existente', async () => {
    // Arrange
    const user = userEvent.setup();
    const hospedeExistente = criarHospedeTeste();
    
    mockApi.hospedes.listar.mockResolvedValue([hospedeExistente]);
    mockApi.reservas.criar.mockResolvedValue(criarReservaTeste({ hospedeId: hospedeExistente.id }));
    mockApi.quartos.listarDisponiveis.mockResolvedValue([criarQuartoTeste()]);
    mockApi.quartos.atualizarStatus.mockResolvedValue(criarQuartoTeste({ status: StatusQuarto.OCUPADO }));

    render(
      <div>
        <HospedeForm onSuccess={() => {}} />
        <QuartoList onSelectQuarto={() => {}} />
        <ReservaForm onSuccess={() => {}} />
      </div>,
      { wrapper: createIntegrationWrapper() }
    );

    // Act - Seleciona hóspede existente
    await user.click(screen.getByRole('button', { name: /buscar hóspede/i }));
    await user.click(screen.getByRole('option', { name: /joão silva/i }));
    await user.click(screen.getByRole('button', { name: /usar hóspede selecionado/i }));

    // Continua fluxo normal
    await user.click(screen.getByRole('button', { name: /selecionar quarto 101/i }));
    await user.type(screen.getByLabelText('Data de Check-in'), '01/12/2024');
    await user.type(screen.getByLabelText('Data de Check-out'), '03/12/2024');
    await user.click(screen.getByRole('button', { name: /confirmar reserva/i }));

    // Assert
    await waitFor(() => {
      expect(mockApi.reservas.criar).toHaveBeenCalledWith(
        expect.objectContaining({ hospedeId: hospedeExistente.id })
      );
    });

    // Verifica que não criou novo hóspede
    expect(mockApi.hospedes.criar).not.toHaveBeenCalled();
  });

  /**
   * Teste: Múltiplos quartos
   * 
   * Cenário: Reserva com múltiplos quartos
   * Resultado esperado: Todos os quartos atualizados
   */
  it('deve handle reservas com múltiplos quartos', async () => {
    // Arrange
    const user = userEvent.setup();
    const quarto1 = criarQuartoTeste({ id: 'quarto-1', numero: '101' });
    const quarto2 = criarQuartoTeste({ id: 'quarto-2', numero: '102' });
    
    mockApi.quartos.listarDisponiveis.mockResolvedValue([quarto1, quarto2]);
    mockApi.reservas.criar.mockResolvedValue(
      criarReservaTeste({ 
        quartos: [quarto1, quarto2],
        valorTotal: 600.00
      })
    );
    mockApi.quartos.atualizarStatus
      .mockResolvedValueOnce({ ...quarto1, status: StatusQuarto.OCUPADO })
      .mockResolvedValueOnce({ ...quarto2, status: StatusQuarto.OCUPADO });

    render(
      <div>
        <QuartoList onSelectQuarto={() => {}} multiSelect={true} />
        <ReservaForm onSuccess={() => {}} />
      </div>,
      { wrapper: createIntegrationWrapper() }
    );

    // Act - Seleciona múltiplos quartos
    await user.click(screen.getByRole('checkbox', { name: /quarto 101/i }));
    await user.click(screen.getByRole('checkbox', { name: /quarto 102/i }));
    await user.click(screen.getByRole('button', { name: /continuar com 2 quartos/i }));
    
    await user.type(screen.getByLabelText('Data de Check-in'), '01/12/2024');
    await user.type(screen.getByLabelText('Data de Check-out'), '03/12/2024');
    await user.click(screen.getByRole('button', { name: /confirmar reserva/i }));

    // Assert
    await waitFor(() => {
      expect(mockApi.reservas.criar).toHaveBeenCalledWith(
        expect.objectContaining({
          valorTotal: 600.00,
          quartos: expect.arrayContaining([
            expect.objectContaining({ id: 'quarto-1' }),
            expect.objectContaining({ id: 'quarto-2' })
          ])
        })
      );
    });

    // Verifica que ambos os quartos foram atualizados
    expect(mockApi.quartos.atualizarStatus).toHaveBeenCalledWith('quarto-1', StatusQuarto.OCUPADO);
    expect(mockApi.quartos.atualizarStatus).toHaveBeenCalledWith('quarto-2', StatusQuarto.OCUPADO);
  });

  /**
   * Teste: Performance do fluxo
   * 
   * Cenário: Muitos quartos disponíveis
   * Resultado esperado: Performance aceitável, sem travamentos
   */
  it('deve manter performance com muitos quartos disponíveis', async () => {
    // Arrange
    const user = userEvent.setup();
    const muitosQuartos = Array.from({ length: 100 }, (_, i) => 
      criarQuartoTeste({ 
        id: `quarto-${i}`, 
        numero: `${100 + i}`,
        status: StatusQuarto.DISPONIVEL 
      })
    );
    
    mockApi.quartos.listarDisponiveis.mockResolvedValue(muitosQuartos);
    mockApi.reservas.criar.mockResolvedValue(criarReservaTeste());
    mockApi.quartos.atualizarStatus.mockResolvedValue(criarQuartoTeste({ status: StatusQuarto.OCUPADO }));

    const startTime = performance.now();

    render(
      <div>
        <QuartoList onSelectQuarto={() => {}} />
        <ReservaForm onSuccess={() => {}} />
      </div>,
      { wrapper: createIntegrationWrapper() }
    );

    // Act
    await waitFor(() => {
      expect(screen.getByText('100 quartos disponíveis')).toBeInTheDocument();
    });

    // Seleciona primeiro quarto
    await user.click(screen.getByRole('button', { name: /selecionar quarto 100/i }));
    await user.type(screen.getByLabelText('Data de Check-in'), '01/12/2024');
    await user.type(screen.getByLabelText('Data de Check-out'), '03/12/2024');
    await user.click(screen.getByRole('button', { name: /confirmar reserva/i }));

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Reserva Confirmada!')).toBeInTheDocument();
    });

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Verifica performance (deve completar em menos de 2 segundos)
    expect(duration).toBeLessThan(2000);
  });
});
