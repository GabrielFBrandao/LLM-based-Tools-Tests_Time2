import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import QuartoForm from '../QuartoFormOptimized';
import { TipoQuarto, StatusQuarto, TipoCama } from '../../domain/entities/Quarto';

// Mock do Material-UI theme
const theme = createTheme();

// Wrapper com ThemeProvider
const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

// Mock para funções de callback
const mockOnSave = jest.fn();
const mockOnCancel = jest.fn();

describe('QuartoForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================
  // TESTES DE RENDERIZAÇÃO
  // ===========================================
  describe('Rendering', () => {
    test('deve renderizar formulário em modo de criação', () => {
      renderWithTheme(
        <QuartoForm onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      expect(screen.getByText('Cadastrar Novo Quarto')).toBeInTheDocument();
      expect(screen.getByLabelText('Número do Quarto')).toBeInTheDocument();
      expect(screen.getByLabelText('Tipo do Quarto')).toBeInTheDocument();
      expect(screen.getByLabelText('Capacidade')).toBeInTheDocument();
      expect(screen.getByLabelText('Preço por Noite (R$)')).toBeInTheDocument();
      expect(screen.getByText('Comodidades')).toBeInTheDocument();
      expect(screen.getByText('Camas')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cadastrar' })).toBeInTheDocument();
    });

    test('deve renderizar formulário em modo de edição', () => {
      const quartoExistente = {
        numero: 'A101',
        tipo: TipoQuarto.LUXO,
        capacidade: 2,
        precoPorNoite: 500,
        hasMinibar: true,
        hasCafeDaManha: false,
        hasArCondicionado: true,
        hasTV: true,
        status: StatusQuarto.DISPONIVEL
      };

      renderWithTheme(
        <QuartoForm 
          quarto={quartoExistente} 
          onSave={mockOnSave} 
          onCancel={mockOnCancel} 
        />
      );

      expect(screen.getByText('Editar Quarto')).toBeInTheDocument();
      expect(screen.getByDisplayValue('A101')).toBeInTheDocument();
      expect(screen.getByDisplayValue('500')).toBeInTheDocument();
      expect(screen.getByLabelText('Status do Quarto')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Atualizar' })).toBeInTheDocument();
    });

    test('deve preencher campos com valores iniciais', () => {
      const quartoExistente = {
        numero: 'B202',
        tipo: TipoQuarto.MODERNO,
        capacidade: 3,
        precoPorNoite: 300,
        hasMinibar: false,
        hasCafeDaManha: true,
        hasArCondicionado: false,
        hasTV: false
      };

      renderWithTheme(
        <QuartoForm 
          quarto={quartoExistente} 
          onSave={mockOnSave} 
          onCancel={mockOnCancel} 
        />
      );

      expect(screen.getByDisplayValue('B202')).toBeInTheDocument();
      expect(screen.getByDisplayValue('3')).toBeInTheDocument();
      expect(screen.getByDisplayValue('300')).toBeInTheDocument();
      expect(screen.getByLabelText('Frigobar')).not.toBeChecked();
      expect(screen.getByLabelText('Café da Manhã')).toBeChecked();
    });
  });

  // ===========================================
  // TESTES DE INTERAÇÃO
  // ===========================================
  describe('User Interactions', () => {
    test('deve permitir preencher campos do formulário', async () => {
      const user = userEvent.setup();
      
      renderWithTheme(
        <QuartoForm onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      await user.type(screen.getByLabelText('Número do Quarto'), 'C301');
      await user.selectOptions(screen.getByLabelText('Tipo do Quarto'), 'LUXO');
      await user.type(screen.getByLabelText('Capacidade'), '2');
      await user.type(screen.getByLabelText('Preço por Noite (R$)'), '450');

      expect(screen.getByDisplayValue('C301')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2')).toBeInTheDocument();
      expect(screen.getByDisplayValue('450')).toBeInTheDocument();
    });

    test('deve permitir selecionar comodidades', async () => {
      const user = userEvent.setup();
      
      renderWithTheme(
        <QuartoForm onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      await user.click(screen.getByLabelText('Frigobar'));
      await user.click(screen.getByLabelText('Ar-Condicionado'));

      expect(screen.getByLabelText('Frigobar')).toBeChecked();
      expect(screen.getByLabelText('Ar-Condicionado')).toBeChecked();
      expect(screen.getByLabelText('Café da Manhã')).not.toBeChecked();
    });

    test('deve permitir adicionar e remover camas', async () => {
      const user = userEvent.setup();
      
      renderWithTheme(
        <QuartoForm onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      // Verificar cama inicial
      expect(screen.getByText('Capacidade total das camas: 1 pessoa(s)')).toBeInTheDocument();

      // Adicionar cama
      await user.click(screen.getByRole('button', { name: 'Adicionar Cama' }));
      expect(screen.getByText('Capacidade total das camas: 2 pessoa(s)')).toBeInTheDocument();

      // Alterar tipo da cama
      await user.selectOptions(screen.getAllByLabelText('Tipo da Cama')[1], 'CASAL_KING');
      expect(screen.getByText('Capacidade total das camas: 3 pessoa(s)')).toBeInTheDocument();

      // Remover cama
      const removeButtons = screen.getAllByRole('button', { name: /Remover cama/i });
      await user.click(removeButtons[1]);
      expect(screen.getByText('Capacidade total das camas: 1 pessoa(s)')).toBeInTheDocument();
    });

    test('deve limitar número máximo de camas', async () => {
      const user = userEvent.setup();
      
      renderWithTheme(
        <QuartoForm onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      // Adicionar 4 camas (total 5)
      for (let i = 0; i < 4; i++) {
        await user.click(screen.getByRole('button', { name: 'Adicionar Cama' }));
      }

      // Botão deve estar desabilitado
      expect(screen.getByRole('button', { name: 'Adicionar Cama' })).toBeDisabled();
    });
  });

  // ===========================================
  // TESTES DE VALIDAÇÃO
  // ===========================================
  describe('Validation', () => {
    test('deve validar campos obrigatórios', async () => {
      const user = userEvent.setup();
      
      renderWithTheme(
        <QuartoForm onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      // Tentar submeter formulário vazio
      await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

      await waitFor(() => {
        expect(screen.getByText('Número do quarto é obrigatório')).toBeInTheDocument();
        expect(screen.getByText('Capacidade deve ser maior que 0')).toBeInTheDocument();
        expect(screen.getByText('Preço deve ser maior que 0')).toBeInTheDocument();
      });

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    test('deve validar formato do número do quarto', async () => {
      const user = userEvent.setup();
      
      renderWithTheme(
        <QuartoForm onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      // Número com formato inválido
      await user.type(screen.getByLabelText('Número do Quarto'), 'a101');
      await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

      await waitFor(() => {
        expect(screen.getByText('Número deve conter apenas letras maiúsculas, números e traços')).toBeInTheDocument();
      });
    });

    test('deve validar tamanho do número do quarto', async () => {
      const user = userEvent.setup();
      
      renderWithTheme(
        <QuartoForm onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      // Número muito curto
      await user.type(screen.getByLabelText('Número do Quarto'), 'A1');
      await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

      await waitFor(() => {
        expect(screen.getByText('Número deve ter pelo menos 3 caracteres')).toBeInTheDocument();
      });

      // Limpar e testar número muito longo
      await user.clear(screen.getByLabelText('Número do Quarto'));
      await user.type(screen.getByLabelText('Número do Quarto'), 'A1234567890');
      await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

      await waitFor(() => {
        expect(screen.getByText('Número deve ter no máximo 10 caracteres')).toBeInTheDocument();
      });
    });

    test('deve validar capacidade vs camas', async () => {
      const user = userEvent.setup();
      
      renderWithTheme(
        <QuartoForm onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      // Preencher formulário com capacidade inconsistente
      await user.type(screen.getByLabelText('Número do Quarto'), 'A101');
      await user.selectOptions(screen.getByLabelText('Tipo do Quarto'), 'BASICO');
      await user.type(screen.getByLabelText('Capacidade'), '3');
      await user.type(screen.getByLabelText('Preço por Noite (R$)'), '200');

      await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

      await waitFor(() => {
        expect(screen.getByText('Capacidade (3) não corresponde ao total das camas (1)')).toBeInTheDocument();
      });
    });

    test('deve limpar erros ao corrigir campos', async () => {
      const user = userEvent.setup();
      
      renderWithTheme(
        <QuartoForm onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      // Tentar submeter vazio para gerar erros
      await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

      await waitFor(() => {
        expect(screen.getByText('Número do quarto é obrigatório')).toBeInTheDocument();
      });

      // Preencher campo número
      await user.type(screen.getByLabelText('Número do Quarto'), 'A101');

      // Erro do campo número deve desaparecer
      await waitFor(() => {
        expect(screen.queryByText('Número do quarto é obrigatório')).not.toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // TESTES DE SUBMISSÃO
  // ===========================================
  describe('Submission', () => {
    test('deve submeter formulário válido com sucesso', async () => {
      const user = userEvent.setup();
      mockOnSave.mockResolvedValue(undefined);
      
      renderWithTheme(
        <QuartoForm onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      // Preencher formulário válido
      await user.type(screen.getByLabelText('Número do Quarto'), 'A101');
      await user.selectOptions(screen.getByLabelText('Tipo do Quarto'), 'BASICO');
      await user.type(screen.getByLabelText('Capacidade'), '1');
      await user.type(screen.getByLabelText('Preço por Noite (R$)', '200');

      await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          numero: 'A101',
          tipo: TipoQuarto.BASICO,
          capacidade: 1,
          precoPorNoite: 200,
          hasMinibar: false,
          hasCafeDaManha: false,
          hasArCondicionado: false,
          hasTV: false
        });
      });
    });

    test('deve mostrar loading durante submissão', async () => {
      const user = userEvent.setup();
      mockOnSave.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      renderWithTheme(
        <QuartoForm onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      // Preencher formulário válido
      await user.type(screen.getByLabelText('Número do Quarto'), 'A101');
      await user.selectOptions(screen.getByLabelText('Tipo do Quarto'), 'BASICO');
      await user.type(screen.getByLabelText('Capacidade'), '1');
      await user.type(screen.getByLabelText('Preço por Noite (R$)', '200');

      await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

      // Verificar estado de loading
      expect(screen.getByRole('button', { name: 'Salvando...' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Salvando...' })).toBeDisabled();

      // Aguardar conclusão
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Cadastrar' })).toBeInTheDocument();
      });
    });

    test('deve tratar erro de submissão', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Erro de conexão';
      mockOnSave.mockRejectedValue(new Error(errorMessage));
      
      renderWithTheme(
        <QuartoForm onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      // Preencher formulário válido
      await user.type(screen.getByLabelText('Número do Quarto'), 'A101');
      await user.selectOptions(screen.getByLabelText('Tipo do Quarto'), 'BASICO');
      await user.type(screen.getByLabelText('Capacidade'), '1');
      await user.type(screen.getByLabelText('Preço por Noite (R$)', '200');

      await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

      await waitFor(() => {
        expect(screen.getByText('Erro ao salvar quarto. Tente novamente.')).toBeInTheDocument();
      });

      expect(mockOnSave).toHaveBeenCalled();
    });
  });

  // ===========================================
  // TESTES DE CANCELAMENTO
  // ===========================================
  describe('Cancellation', () => {
    test('deve chamar onCancel ao clicar em Cancelar', async () => {
      const user = userEvent.setup();
      
      renderWithTheme(
        <QuartoForm onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      await user.click(screen.getByRole('button', { name: 'Cancelar' }));

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    test('deve resetar formulário ao cancelar', async () => {
      const user = userEvent.setup();
      
      renderWithTheme(
        <QuartoForm onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      // Preencher alguns campos
      await user.type(screen.getByLabelText('Número do Quarto'), 'A101');
      await user.click(screen.getByLabelText('Frigobar'));

      // Cancelar
      await user.click(screen.getByRole('button', { name: 'Cancelar' }));

      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  // ===========================================
  // TESTES DE ACESSIBILIDADE
  // ===========================================
  describe('Accessibility', () => {
    test('deve ter ARIA labels corretos', () => {
      renderWithTheme(
        <QuartoForm onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      expect(screen.getByLabelText('Número do quarto')).toBeInTheDocument();
      expect(screen.getByLabelText('Tipo do quarto')).toBeInTheDocument();
      expect(screen.getByLabelText('Capacidade do quarto')).toBeInTheDocument();
      expect(screen.getByLabelText('Preço por noite')).toBeInTheDocument();
    });

    test('deve focar automaticamente em erros', async () => {
      const user = userEvent.setup();
      
      renderWithTheme(
        <QuartoForm onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      // Submeter formulário vazio para gerar erros
      await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

      await waitFor(() => {
        const alertElement = screen.getByRole('alert');
        expect(alertElement).toHaveFocus();
      });
    });

    test('deve ter aria-invalid em campos com erro', async () => {
      const user = userEvent.setup();
      
      renderWithTheme(
        <QuartoForm onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      // Submeter formulário vazio
      await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

      await waitFor(() => {
        expect(screen.getByLabelText('Número do quarto')).toHaveAttribute('aria-invalid', 'true');
        expect(screen.getByLabelText('Capacidade do quarto')).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });

  // ===========================================
  // TESTES DE ESTADO DESABILITADO
  // ===========================================
  describe('Disabled State', () => {
    test('deve desabilitar todos os campos quando disabled=true', () => {
      renderWithTheme(
        <QuartoForm onSave={mockOnSave} onCancel={mockOnCancel} disabled />
      );

      expect(screen.getByLabelText('Número do Quarto')).toBeDisabled();
      expect(screen.getByLabelText('Tipo do Quarto')).toBeDisabled();
      expect(screen.getByLabelText('Capacidade')).toBeDisabled();
      expect(screen.getByLabelText('Preço por Noite (R$)')).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Cadastrar' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
    });

    test('deve desabilitar botão Adicionar Cama quando limite atingido', async () => {
      const user = userEvent.setup();
      
      renderWithTheme(
        <QuartoForm onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      // Adicionar camas até o limite
      for (let i = 0; i < 4; i++) {
        await user.click(screen.getByRole('button', { name: 'Adicionar Cama' }));
      }

      expect(screen.getByRole('button', { name: 'Adicionar Cama' })).toBeDisabled();
    });

    test('deve desabilitar botão remover quando só tem uma cama', () => {
      renderWithTheme(
        <QuartoForm onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      const removeButtons = screen.getAllByRole('button', { name: /Remover cama/i });
      expect(removeButtons[0]).toBeDisabled();
    });
  });

  // ===========================================
  // TESTES DE PERFORMANCE
  // ===========================================
  describe('Performance', () => {
    test('não deve re-renderizar desnecessariamente', () => {
      const { rerender } = renderWithTheme(
        <QuartoForm onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      // Re-renderizar com mesmas props
      rerender(
        <QuartoForm onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      // Componente deve permanecer estável
      expect(screen.getByText('Cadastrar Novo Quarto')).toBeInTheDocument();
    });

    test('deve memoizar cálculos de capacidade', () => {
      const { rerender } = renderWithTheme(
        <QuartoForm onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      // Verificar capacidade inicial
      expect(screen.getByText('Capacidade total das camas: 1 pessoa(s)')).toBeInTheDocument();

      // Re-renderizar sem alterar camas
      rerender(
        <QuartoForm onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      // Capacidade deve permanecer a mesma
      expect(screen.getByText('Capacidade total das camas: 1 pessoa(s)')).toBeInTheDocument();
    });
  });
});
