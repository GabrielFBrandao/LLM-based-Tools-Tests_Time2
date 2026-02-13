import React, { useState, useEffect } from 'react';
import { Box, Typography, Snackbar, Alert } from '@mui/material';
import { Quarto, TipoQuarto, StatusQuarto, TipoCama } from '../domain';
import { QuartoForm } from '../components/QuartoForm';
import { QuartoList } from '../components/QuartoList';

// Mock de dados - em um projeto real, viria de uma API
const mockQuartos: Quarto[] = [
  {
    id: 'quarto_1',
    numero: '101',
    capacidade: 2,
    tipo: TipoQuarto.LUXO,
    precoPorNoite: 350,
    hasMinibar: true,
    hasCafeDaManha: true,
    hasArCondicionado: true,
    hasTV: true,
    status: StatusQuarto.DISPONIVEL,
    camas: [
      { id: 'cama_1', tipo: TipoCama.CASAL_KING, quartoId: 'quarto_1' }
    ]
  },
  {
    id: 'quarto_2',
    numero: '102',
    capacidade: 1,
    tipo: TipoQuarto.BASICO,
    precoPorNoite: 150,
    hasMinibar: false,
    hasCafeDaManha: false,
    hasArCondicionado: true,
    hasTV: true,
    status: StatusQuarto.OCUPADO,
    camas: [
      { id: 'cama_2', tipo: TipoCama.SOLTEIRO, quartoId: 'quarto_2' }
    ]
  },
  {
    id: 'quarto_3',
    numero: '103',
    capacidade: 4,
    tipo: TipoQuarto.MODERNO,
    precoPorNoite: 280,
    hasMinibar: true,
    hasCafeDaManha: false,
    hasArCondicionado: true,
    hasTV: true,
    status: StatusQuarto.MANUTENCAO,
    camas: [
      { id: 'cama_3', tipo: TipoCama.CASAL_QUEEN, quartoId: 'quarto_3' },
      { id: 'cama_4', tipo: TipoCama.CASAL_QUEEN, quartoId: 'quarto_3' }
    ]
  }
];

export const QuartosPage: React.FC = () => {
  const [quartos, setQuartos] = useState<Quarto[]>([]);
  const [quartoEditando, setQuartoEditando] = useState<Quarto | undefined>();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    carregarQuartos();
  }, []);

  const carregarQuartos = async () => {
    setLoading(true);
    setError(undefined);
    
    try {
      // Simulação de chamada à API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setQuartos(mockQuartos);
    } catch (err) {
      setError('Erro ao carregar quartos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarQuarto = async (quarto: Quarto) => {
    setLoading(true);
    
    try {
      // Simulação de chamada à API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (quartoEditando) {
        // Atualizar quarto existente
        setQuartos(prev => prev.map(q => 
          q.id === quarto.id ? quarto : q
        ));
        mostrarMensagem('Quarto atualizado com sucesso!', 'success');
      } else {
        // Adicionar novo quarto
        const novoQuarto = {
          ...quarto,
          id: `quarto_${Date.now()}`
        };
        setQuartos(prev => [...prev, novoQuarto]);
        mostrarMensagem('Quarto cadastrado com sucesso!', 'success');
      }
      
      setMostrarFormulario(false);
      setQuartoEditando(undefined);
    } catch (err) {
      mostrarMensagem('Erro ao salvar quarto. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditarQuarto = (quarto: Quarto) => {
    setQuartoEditando(quarto);
    setMostrarFormulario(true);
  };

  const handleAdicionarQuarto = () => {
    setQuartoEditando(undefined);
    setMostrarFormulario(true);
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setQuartoEditando(undefined);
  };

  const mostrarMensagem = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const fecharSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (mostrarFormulario) {
    return (
      <Box>
        <QuartoForm
          quarto={quartoEditando}
          onSave={handleSalvarQuarto}
          onCancel={handleCancelar}
        />
      </Box>
    );
  }

  return (
    <Box>
      <QuartoList
        quartos={quartos}
        onEdit={handleEditarQuarto}
        onAdd={handleAdicionarQuarto}
        loading={loading}
        error={error}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={fecharSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={fecharSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
