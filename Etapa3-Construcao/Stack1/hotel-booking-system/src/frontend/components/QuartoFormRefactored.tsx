/**
 * Componente de Formulário de Quarto - Refatorado com SOLID e Clean Code
 * 
 * Princípios SOLID aplicados:
 * - Single Responsibility: Responsável apenas pelo formulário de quarto
 * - Open/Closed: Aberto para extensão (novos campos), fechado para modificação
 * - Liskov Substitution: Pode ser substituído por qualquer componente de formulário
 * - Interface Segregation: Props específicas para formulário
 * - Dependency Inversion: Depende de abstrações (interfaces), não de implementações
 * 
 * Clean Code aplicados:
 * - Componente funcional com hooks do React
 * - Nomes descritivos e autoexplicativos
 * - Separação clara entre estado e UI
 * - Validações centralizadas
 * - Responsividade com Material-UI
 */

import React, { useState, useEffect, useCallback } from 'react';
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
  Alert,
  Collapse,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

// Importações do domínio - dependência de abstrações
import { Quarto, IQuarto } from '../domain/entities/Quarto';
import { TipoQuarto, StatusQuarto, TipoCama } from '../domain/enums';

/**
 * Interface para as propriedades do componente
 * 
 * Decisão: Interface explícita para type safety
 * - Documentação via tipo
 * - Autocompletion em IDEs
 * - Validação em tempo de compilação
 */
interface IQuartoFormProps {
  /** Quarto para edição (opcional) */
  quarto?: IQuarto;
  /** Callback chamado ao salvar o formulário */
  onSave: (quarto: IQuarto) => void;
  /** Callback chamado ao cancelar o formulário */
  onCancel: () => void;
  /** Modo somente leitura */
  readonly?: boolean;
  /** Modo de carregamento */
  loading?: boolean;
}

/**
 * Interface para o estado interno do formulário
 * 
 * Decisão: Tipo específico para estado do componente
 * - Type safety para estado interno
 * - Facilita debugging
 * - Documentação da estrutura de dados
 */
interface IFormState {
  numero: string;
  capacidade: number;
  tipo: TipoQuarto;
  precoPorNoite: number;
  hasMinibar: boolean;
  hasCafeDaManha: boolean;
  hasArCondicionado: boolean;
  hasTV: boolean;
  status: StatusQuarto;
  camas: TipoCama[];
}

/**
 * Interface para erros de validação
 * 
 * Decisão: Estrutura tipada para erros
 * - Type safety para validações
 * - Facilita exibição de erros
 * - Extensível para novos campos
 */
interface IFormErrors {
  [key: string]: string | undefined;
}

/**
 * Componente de formulário para cadastro/edição de quartos
 * 
 * Decisões de implementação:
 * 1. Componente funcional com hooks
 *    - Modern React patterns
 *    - Performance otimizada
 *    - Facilita testes
 * 
 * 2. Estado local controlado
 *    - Independência de estado externo
 *    - Validação em tempo real
 *    - Facilita cancelamento
 * 
 * 3. Validações centralizadas
 *    - Lógica reutilizável
 *    - Consistência de validações
 *    - Facilita manutenção
 * 
 * 4. Material-UI para consistência visual
 *    - Design system padronizado
 *    - Responsividade built-in
 *    - Acessibilidade nativa
 */
export const QuartoFormRefactored: React.FC<IQuartoFormProps> = React.memo(({
  quarto,
  onSave,
  onCancel,
  readonly = false,
  loading = false
}) => {
  const theme = useTheme();
  
  // Estado do formulário com valores iniciais
  const [formData, setFormData] = useState<IFormState>({
    numero: '',
    capacidade: 1,
    tipo: TipoQuarto.BASICO,
    precoPorNoite: 0,
    hasMinibar: false,
    hasCafeDaManha: false,
    hasArCondicionado: false,
    hasTV: false,
    status: StatusQuarto.DISPONIVEL,
    camas: []
  });

  // Estado para erros de validação
  const [errors, setErrors] = useState<IFormErrors>({});
  
  // Estado para controle de UI
  const [showAdvanced, setShowAdvanced] = useState(false);

  /**
   * Inicializa o formulário com dados do quarto (modo edição)
   * 
   * Decisão: useEffect para sincronização com props externas
   * - Atualização automática quando quarto muda
   * - Evita estado desincronizado
   * - Performance otimizada com dependências
   */
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
        status: quarto.status,
        camas: quarto.camas.map(c => c.tipo)
      });
    }
  }, [quarto]);

  /**
   * Manipula mudança em um campo do formulário
   * 
   * Decisão: Handler genérico para todos os campos
   * - Redução de código duplicado
   * - Type safety com generics
   * - Limpeza automática de erros
   */
  const handleInputChange = useCallback((
    field: keyof IFormState,
    value: any
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpa erro do campo quando usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  /**
   * Adiciona uma nova cama ao formulário
   * 
   * Decisão: Método específico para gestão de camas
   * - Lógica encapsulada
   * - Validação de capacidade
   * - Facilita testes
   */
  const adicionarCama = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      camas: [...prev.camas, TipoCama.SOLTEIRO]
    }));
  }, []);

  /**
   * Remove uma cama do formulário
   * 
   * Decisão: Validação para manter pelo menos uma cama
   * - Prevenção de estado inválido
   * - Feedback claro ao usuário
   * - Consistência de dados
   */
  const removerCama = useCallback((index: number) => {
    setFormData(prev => {
      if (prev.camas.length <= 1) {
        return prev; // Não permite remover todas as camas
      }
      return {
        ...prev,
        camas: prev.camas.filter((_, i) => i !== index)
      };
    });
  }, []);

  /**
   * Altera o tipo de uma cama específica
   * 
   * Decisão: Imutabilidade na atualização
   * - Prevenção de mutações acidentais
   * - Performance otimizada
   * - Facilita debugging
   */
  const alterarTipoCama = useCallback((index: number, tipo: TipoCama) => {
    setFormData(prev => ({
      ...prev,
      camas: prev.camas.map((c, i) => i === index ? tipo : c)
    }));
  }, []);

  /**
   * Valida todos os campos do formulário
   * 
   * Decisão: Validação centralizada e abrangente
   * - Todas as regras em um lugar
   * - Performance otimizada
   * - Facilita manutenção
   * 
   * @returns boolean - True se formulário é válido
   */
  const validarFormulario = useCallback((): boolean => {
    const novosErros: IFormErrors = {};

    // Validação do número
    if (!formData.numero.trim()) {
      novosErros.numero = 'Número do quarto é obrigatório';
    } else if (!/^[A-Z0-9]{1,10}$/i.test(formData.numero)) {
      novosErros.numero = 'Número deve conter apenas letras e números (máx. 10)';
    }

    // Validação da capacidade
    if (formData.capacidade <= 0) {
      novosErros.capacidade = 'Capacidade deve ser maior que zero';
    } else if (formData.capacidade > 10) {
      novosErros.capacidade = 'Capacidade máxima é 10 pessoas';
    }

    // Validação do preço
    if (formData.precoPorNoite <= 0) {
      novosErros.precoPorNoite = 'Preço por noite deve ser maior que zero';
    } else if (formData.precoPorNoite > 10000) {
      novosErros.precoPorNoite = 'Preço máximo é R$ 10.000,00';
    }

    // Validação das camas
    if (formData.camas.length === 0) {
      novosErros.camas = 'Quarto deve ter pelo menos uma cama';
    } else {
      // Valida consistência entre capacidade e camas
      const capacidadeCamas = formData.camas.reduce((total, cama) => {
        return total + (cama === TipoCama.SOLTEIRO ? 1 : 2);
      }, 0);

      if (capacidadeCamas !== formData.capacidade) {
        novosErros.capacidade = 
          `Capacidade das camas (${capacidadeCamas}) não corresponde à capacidade informada (${formData.capacidade})`;
      }
    }

    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  }, [formData]);

  /**
   * Manipula o envio do formulário
   * 
   * Decisão: Fluxo completo com validação e criação
   * - Validação prévia
   - Criação do objeto Quarto
   * - Callback para componente pai
   * - Tratamento de erros
   */
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    try {
      // Criação do objeto Quarto usando factory method
      const quartoSalvo = Quarto.criar({
        numero: formData.numero,
        capacidade: formData.capacidade,
        tipo: formData.tipo,
        precoPorNoite: formData.precoPorNoite,
        hasMinibar: formData.hasMinibar,
        hasCafeDaManha: formData.hasCafeDaManha,
        hasArCondicionado: formData.hasArCondicionado,
        hasTV: formData.hasTV,
        status: quarto?.status || formData.status,
        camas: formData.camas.map((tipo, index) => ({
          id: `cama_${Date.now()}_${index}`,
          tipo,
          quartoId: quarto?.id || ''
        }))
      });

      // Se está editando, mantém o ID original
      if (quarto) {
        quartoSalvo.id = quarto.id;
      }

      onSave(quartoSalvo);
    } catch (error) {
      console.error('Erro ao salvar quarto:', error);
      setErrors({ geral: 'Erro ao salvar quarto. Tente novamente.' });
    }
  }, [formData, quarto, validarFormulario, onSave]);

  return (
    <Paper elevation={3} sx={{ p: 3, m: 2 }}>
      <Typography variant="h5" gutterBottom>
        {quarto ? 'Editar Quarto' : 'Cadastrar Novo Quarto'}
      </Typography>

      {/* Alerta de erros gerais */}
      {errors.geral && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.geral}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Campos básicos */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Número do Quarto"
              value={formData.numero}
              onChange={(e) => handleInputChange('numero', e.target.value)}
              error={!!errors.numero}
              helperText={errors.numero}
              required
              disabled={readonly}
              inputProps={{ maxLength: 10, style: { textTransform: 'uppercase' } }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required disabled={readonly}>
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
              onChange={(e) => handleInputChange('capacidade', parseInt(e.target.value) || 0)}
              error={!!errors.capacidade}
              helperText={errors.capacidade}
              required
              disabled={readonly}
              inputProps={{ min: 1, max: 10 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Preço por Noite (R$)"
              type="number"
              value={formData.precoPorNoite}
              onChange={(e) => handleInputChange('precoPorNoite', parseFloat(e.target.value) || 0)}
              error={!!errors.precoPorNoite}
              helperText={errors.precoPorNoite}
              required
              disabled={readonly}
              inputProps={{ min: 0.01, max: 10000, step: 0.01 }}
            />
          </Grid>

          {/* Seção de comodidades */}
          <Grid item xs={12}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Comodidades
                <IconButton
                  size="small"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  sx={{ ml: 1 }}
                >
                  {showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Typography>
              
              <Collapse in={showAdvanced}>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.hasMinibar}
                          onChange={(e) => handleInputChange('hasMinibar', e.target.checked)}
                          disabled={readonly}
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
                          disabled={readonly}
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
                          disabled={readonly}
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
                          disabled={readonly}
                        />
                      }
                      label="TV"
                    />
                  </Grid>
                </Grid>
              </Collapse>
            </Box>
          </Grid>

          {/* Seção de camas */}
          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Camas</Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={adicionarCama}
                variant="outlined"
                size="small"
                disabled={readonly}
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
              {formData.camas.map((tipo, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardContent>
                      <FormControl fullWidth disabled={readonly}>
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
                        disabled={readonly || formData.camas.length <= 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                ))}
            </Grid>

            <Box mt={2}>
              <Typography variant="body2">
                Capacidade total das camas: {formData.camas.reduce((total, cama) => 
                  total + (cama === TipoCama.SOLTEIRO ? 1 : 2), 0)} pessoa(s)
              </Typography>
            </Box>
          </Grid>

          {/* Status (apenas em edição) */}
          {quarto && (
            <Grid item xs={12}>
              <FormControl fullWidth disabled={readonly}>
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

          {/* Botões de ação */}
          <Grid item xs={12}>
            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={onCancel}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={readonly || loading}
                sx={{ minWidth: 120 }}
              >
                {loading ? 'Salvando...' : (quarto ? 'Atualizar' : 'Cadastrar')}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
});

// Display name para debugging
QuartoFormRefactored.displayName = 'QuartoFormRefactored';
