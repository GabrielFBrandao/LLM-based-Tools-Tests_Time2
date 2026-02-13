import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  Typography,
  Grid,
  Paper,
  Chip,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { TipoQuarto, TipoCama, StatusQuarto, Quarto, Cama } from '../domain';

interface QuartoFormProps {
  quarto?: Quarto;
  onSave: (quarto: Quarto) => void;
  onCancel: () => void;
}

export const QuartoForm: React.FC<QuartoFormProps> = ({ quarto, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    numero: '',
    capacidade: 1,
    tipo: TipoQuarto.BASICO,
    precoPorNoite: 0,
    hasMinibar: false,
    hasCafeDaManha: false,
    hasArCondicionado: false,
    hasTV: false,
    status: StatusQuarto.DISPONIVEL
  });

  const [camas, setCamas] = useState<TipoCama[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (quarto) {
      setFormData({
        numero: quarto.numero,
        capacidade: quarto.capacidade,
        tipo: quarto.tipo,
        precoPorNoite: quarto.precoPorNoite,
        hasMinibar: quarto.hasMinibar,
        hasCafeDaManha: quarto.hasCafeDaManha,
        hasArCondicionado: quarto.hasArCondicionado,
        hasTV: quarto.hasTV,
        status: quarto.status
      });
      setCamas(quarto.camas.map(c => c.tipo));
    }
  }, [quarto]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const adicionarCama = () => {
    setCamas(prev => [...prev, TipoCama.SOLTEIRO]);
  };

  const removerCama = (index: number) => {
    setCamas(prev => prev.filter((_, i) => i !== index));
  };

  const alterarTipoCama = (index: number, tipo: TipoCama) => {
    setCamas(prev => prev.map((c, i) => i === index ? tipo : c));
  };

  const validarFormulario = (): boolean => {
    const novosErros: Record<string, string> = {};

    if (!formData.numero.trim()) {
      novosErros.numero = 'Número do quarto é obrigatório';
    }

    if (formData.capacidade <= 0) {
      novosErros.capacidade = 'Capacidade deve ser maior que zero';
    }

    if (formData.precoPorNoite <= 0) {
      novosErros.precoPorNoite = 'Preço por noite deve ser maior que zero';
    }

    if (camas.length === 0) {
      novosErros.camas = 'Quarto deve ter pelo menos uma cama';
    }

    const capacidadeCamas = camas.reduce((total, cama) => {
      return total + (cama === TipoCama.SOLTEIRO ? 1 : 2);
    }, 0);

    if (capacidadeCamas !== formData.capacidade) {
      novosErros.capacidade = `Capacidade das camas (${capacidadeCamas}) não corresponde à capacidade informada (${formData.capacidade})`;
    }

    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    // Criar objetos Cama
    const objetosCamas: Cama[] = camas.map((tipo, index) => ({
      id: `cama_${Date.now()}_${index}`,
      tipo,
      quartoId: quarto?.id || ''
    }));

    // Criar objeto Quarto
    const quartoSalvo: Quarto = {
      id: quarto?.id || `quarto_${Date.now()}`,
      ...formData,
      camas: objetosCamas
    };

    onSave(quartoSalvo);
  };

  const getTipoQuartoLabel = (tipo: TipoQuarto): string => {
    const labels = {
      [TipoQuarto.BASICO]: 'Básico',
      [TipoQuarto.MODERNO]: 'Moderno',
      [TipoQuarto.LUXO]: 'Luxo'
    };
    return labels[tipo];
  };

  const getTipoCamaLabel = (tipo: TipoCama): string => {
    const labels = {
      [TipoCama.SOLTEIRO]: 'Solteiro',
      [TipoCama.CASAL_KING]: 'Casal King',
      [TipoCama.CASAL_QUEEN]: 'Casal Queen'
    };
    return labels[tipo];
  };

  const getStatusQuartoLabel = (status: StatusQuarto): string => {
    const labels = {
      [StatusQuarto.DISPONIVEL]: 'Disponível',
      [StatusQuarto.OCUPADO]: 'Ocupado',
      [StatusQuarto.MANUTENCAO]: 'Em Manutenção',
      [StatusQuarto.LIMPEZA]: 'Em Limpeza'
    };
    return labels[status];
  };

  return (
    <Paper elevation={3} sx={{ p: 3, m: 2 }}>
      <Typography variant="h5" gutterBottom>
        {quarto ? 'Editar Quarto' : 'Cadastrar Novo Quarto'}
      </Typography>

      {Object.keys(errors).length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {Object.values(errors).map((error, index) => (
            <div key={index}>{error}</div>
          ))}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Número do Quarto"
              value={formData.numero}
              onChange={(e) => handleInputChange('numero', e.target.value)}
              error={!!errors.numero}
              helperText={errors.numero}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Tipo do Quarto</InputLabel>
              <Select
                value={formData.tipo}
                label="Tipo do Quarto"
                onChange={(e) => handleInputChange('tipo', e.target.value)}
              >
                <MenuItem value={TipoQuarto.BASICO}>Básico</MenuItem>
                <MenuItem value={TipoQuarto.MODERNO}>Moderno</MenuItem>
                <MenuItem value={TipoQuarto.LUXO}>Luxo</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Capacidade"
              type="number"
              value={formData.capacidade}
              onChange={(e) => handleInputChange('capacidade', parseInt(e.target.value))}
              error={!!errors.capacidade}
              helperText={errors.capacidade}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Preço por Noite (R$)"
              type="number"
              value={formData.precoPorNoite}
              onChange={(e) => handleInputChange('precoPorNoite', parseFloat(e.target.value))}
              error={!!errors.precoPorNoite}
              helperText={errors.precoPorNoite}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Comodidades
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.hasMinibar}
                      onChange={(e) => handleInputChange('hasMinibar', e.target.checked)}
                    />
                  }
                  label="Frigobar"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.hasCafeDaManha}
                      onChange={(e) => handleInputChange('hasCafeDaManha', e.target.checked)}
                    />
                  }
                  label="Café da Manhã"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.hasArCondicionado}
                      onChange={(e) => handleInputChange('hasArCondicionado', e.target.checked)}
                    />
                  }
                  label="Ar-Condicionado"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.hasTV}
                      onChange={(e) => handleInputChange('hasTV', e.target.checked)}
                    />
                  }
                  label="TV"
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Camas</Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={adicionarCama}
                variant="outlined"
                size="small"
              >
                Adicionar Cama
              </Button>
            </Box>

            {errors.camas && (
              <Typography color="error" variant="body2" gutterBottom>
                {errors.camas}
              </Typography>
            )}

            <Grid container spacing={2}>
              {camas.map((tipo, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardContent>
                      <FormControl fullWidth>
                        <InputLabel>Tipo da Cama</InputLabel>
                        <Select
                          value={tipo}
                          label="Tipo da Cama"
                          onChange={(e) => alterarTipoCama(index, e.target.value as TipoCama)}
                        >
                          <MenuItem value={TipoCama.SOLTEIRO}>Solteiro</MenuItem>
                          <MenuItem value={TipoCama.CASAL_KING}>Casal King</MenuItem>
                          <MenuItem value={TipoCama.CASAL_QUEEN}>Casal Queen</MenuItem>
                        </Select>
                      </FormControl>
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        Capacidade: {tipo === TipoCama.SOLTEIRO ? 1 : 2} pessoa(s)
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <IconButton
                        color="error"
                        onClick={() => removerCama(index)}
                        disabled={camas.length === 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box mt={2}>
              <Typography variant="body2">
                Capacidade total das camas: {camas.reduce((total, cama) => 
                  total + (cama === TipoCama.SOLTEIRO ? 1 : 2), 0)} pessoa(s)
              </Typography>
            </Box>
          </Grid>

          {quarto && (
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status do Quarto</InputLabel>
                <Select
                  value={formData.status}
                  label="Status do Quarto"
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <MenuItem value={StatusQuarto.DISPONIVEL}>Disponível</MenuItem>
                  <MenuItem value={StatusQuarto.OCUPADO}>Ocupado</MenuItem>
                  <MenuItem value={StatusQuarto.MANUTENCAO}>Em Manutenção</MenuItem>
                  <MenuItem value={StatusQuarto.LIMPEZA}>Em Limpeza</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}

          <Grid item xs={12}>
            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={onCancel}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                color="primary"
              >
                {quarto ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};
