import React, { useState, useReducer, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  Paper,
  Typography,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Button,
  Box,
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
  CardActions,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Cancel as CancelIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { TipoQuarto, StatusQuarto, TipoCama } from '../domain/entities/Quarto';

// ===========================================
// CONFIGURAÇÃO CENTRALIZADA
// ===========================================
const QUARTO_CONFIG = {
  tipos: [
    { value: TipoQuarto.BASICO, label: 'Básico' },
    { value: TipoQuarto.MODERNO, label: 'Moderno' },
    { value: TipoQuarto.LUXO, label: 'Luxo' }
  ],
  status: [
    { value: StatusQuarto.DISPONIVEL, label: 'Disponível' },
    { value: StatusQuarto.OCUPADO, label: 'Ocupado' },
    { value: StatusQuarto.MANUTENCAO, label: 'Em Manutenção' },
    { value: StatusQuarto.LIMPEZA, label: 'Em Limpeza' }
  ],
  tiposCama: [
    { value: TipoCama.SOLTEIRO, label: 'Solteiro', capacidade: 1 },
    { value: TipoCama.CASAL_KING, label: 'Casal King', capacidade: 2 },
    { value: TipoCama.CASAL_QUEEN, label: 'Casal Queen', capacidade: 2 }
  ],
  comodidades: [
    { key: 'hasMinibar', label: 'Frigobar' },
    { key: 'hasCafeDaManha', label: 'Café da Manhã' },
    { key: 'hasArCondicionado', label: 'Ar-Condicionado' },
    { key: 'hasTV', label: 'TV' }
  ]
} as const;

// ===========================================
// TIPOS E INTERFACES
// ===========================================
interface QuartoFormData {
  numero: string;
  tipo: TipoQuarto;
  capacidade: number;
  precoPorNoite: number;
  hasMinibar: boolean;
  hasCafeDaManha: boolean;
  hasArCondicionado: boolean;
  hasTV: boolean;
  status?: StatusQuarto;
}

interface ValidationErrors {
  [key: string]: string;
}

interface QuartoFormState {
  formData: QuartoFormData;
  camas: TipoCama[];
  errors: ValidationErrors;
  isSubmitting: boolean;
}

// ===========================================
// REDUCER PARA GERENCIAMENTO DE ESTADO
// ===========================================
type QuartoFormAction =
  | { type: 'UPDATE_FIELD'; field: string; value: any }
  | { type: 'SET_ERRORS'; errors: ValidationErrors }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'ADD_CAMA'; tipo: TipoCama }
  | { type: 'REMOVE_CAMA'; index: number }
  | { type: 'UPDATE_CAMA'; index: number; tipo: TipoCama }
  | { type: 'SET_SUBMITTING'; isSubmitting: boolean }
  | { type: 'RESET_FORM'; initialData?: Partial<QuartoFormData> };

const quartoFormReducer = (state: QuartoFormState, action: QuartoFormAction): QuartoFormState => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return {
        ...state,
        formData: { ...state.formData, [action.field]: action.value },
        errors: { ...state.errors, [action.field]: '' }
      };
    
    case 'SET_ERRORS':
      return { ...state, errors: action.errors };
    
    case 'CLEAR_ERRORS':
      return { ...state, errors: {} };
    
    case 'ADD_CAMA':
      return { ...state, camas: [...state.camas, action.tipo] };
    
    case 'REMOVE_CAMA':
      return {
        ...state,
        camas: state.camas.filter((_, index) => index !== action.index)
      };
    
    case 'UPDATE_CAMA':
      return {
        ...state,
        camas: state.camas.map((cama, index) =>
          index === action.index ? action.tipo : cama
        )
      };
    
    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.isSubmitting };
    
    case 'RESET_FORM':
      return {
        ...state,
        formData: getInitialFormData(action.initialData),
        camas: action.initialData?.numero ? [TipoCama.SOLTEIRO] : [],
        errors: {},
        isSubmitting: false
      };
    
    default:
      return state;
  }
};

// ===========================================
// FUNÇÕES UTILITÁRIAS
// ===========================================
const getInitialFormData = (quarto?: Partial<QuartoFormData>): QuartoFormData => ({
  numero: quarto?.numero || '',
  tipo: quarto?.tipo || TipoQuarto.BASICO,
  capacidade: quarto?.capacidade || 1,
  precoPorNoite: quarto?.precoPorNoite || 0,
  hasMinibar: quarto?.hasMinibar || false,
  hasCafeDaManha: quarto?.hasCafeDaManha || false,
  hasArCondicionado: quarto?.hasArCondicionado || false,
  hasTV: quarto?.hasTV || false,
  status: quarto?.status
});

const getInitialState = (quarto?: Partial<QuartoFormData>): QuartoFormState => ({
  formData: getInitialFormData(quarto),
  camas: quarto?.numero ? [TipoCama.SOLTEIRO] : [],
  errors: {},
  isSubmitting: false
});

// ===========================================
// HOOK DE VALIDAÇÃO
// ===========================================
const useQuartoValidation = () => {
  const validateQuarto = useCallback((formData: QuartoFormData, camas: TipoCama[]): ValidationErrors => {
    const errors: ValidationErrors = {};
    
    // Validação do número
    if (!formData.numero.trim()) {
      errors.numero = 'Número do quarto é obrigatório';
    } else if (!/^[A-Z0-9-]+$/.test(formData.numero)) {
      errors.numero = 'Número deve conter apenas letras maiúsculas, números e traços';
    } else if (formData.numero.length < 3) {
      errors.numero = 'Número deve ter pelo menos 3 caracteres';
    } else if (formData.numero.length > 10) {
      errors.numero = 'Número deve ter no máximo 10 caracteres';
    }
    
    // Validação do tipo
    if (!formData.tipo) {
      errors.tipo = 'Tipo do quarto é obrigatório';
    }
    
    // Validação da capacidade
    if (!formData.capacidade || formData.capacidade <= 0) {
      errors.capacidade = 'Capacidade deve ser maior que 0';
    } else if (formData.capacidade > 10) {
      errors.capacidade = 'Capacidade não pode ser maior que 10';
    }
    
    // Validação do preço
    if (!formData.precoPorNoite || formData.precoPorNoite <= 0) {
      errors.precoPorNoite = 'Preço deve ser maior que 0';
    } else if (formData.precoPorNoite > 10000) {
      errors.precoPorNoite = 'Preço não pode ser maior que R$ 10.000,00';
    }
    
    // Validação das camas
    if (!camas || camas.length === 0) {
      errors.camas = 'Pelo menos uma cama é obrigatória';
    } else if (camas.length > 5) {
      errors.camas = 'Máximo de 5 camas permitidas';
    }
    
    // Validar capacidade vs camas
    if (camas.length > 0) {
      const capacidadeCamas = camas.reduce((total, cama) => {
        const configCama = QUARTO_CONFIG.tiposCama.find(tc => tc.value === cama);
        return total + (configCama?.capacidade || 0);
      }, 0);
      
      if (formData.capacidade !== capacidadeCamas) {
        errors.capacidade = `Capacidade (${formData.capacidade}) não corresponde ao total das camas (${capacidadeCamas})`;
      }
    }
    
    return errors;
  }, []);
  
  return { validateQuarto };
};

// ===========================================
// HOOK DE FOCUS MANAGEMENT
// ===========================================
const useFocusManagement = (errors: ValidationErrors) => {
  const errorRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (Object.keys(errors).length > 0 && errorRef.current) {
      errorRef.current.focus();
    }
  }, [errors]);
  
  return errorRef;
};

// ===========================================
// COMPONENTES MENORES
// ===========================================
interface ComodidadeCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const ComodidadeCheckbox = React.memo<ComodidadeCheckboxProps>(({ label, checked, onChange }) => (
  <Grid item xs={6} sm={3}>
    <FormControlLabel
      control={
        <Checkbox
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          inputProps={{ 'aria-label': label }}
        />
      }
      label={label}
    />
  </Grid>
));

ComodidadeCheckbox.displayName = 'ComodidadeCheckbox';

interface CamaCardProps {
  tipo: TipoCama;
  index: number;
  onRemove: (index: number) => void;
  onChange: (index: number, tipo: TipoCama) => void;
  disabled?: boolean;
}

const CamaCard = React.memo<CamaCardProps>(({ tipo, index, onRemove, onChange, disabled }) => {
  const configCama = useMemo(() => 
    QUARTO_CONFIG.tiposCama.find(tc => tc.value === tipo),
    [tipo]
  );
  
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card>
        <CardContent>
          <FormControl fullWidth>
            <InputLabel>Tipo da Cama</InputLabel>
            <Select
              value={tipo}
              label="Tipo da Cama"
              onChange={(e) => onChange(index, e.target.value as TipoCama)}
              inputProps={{ 'aria-label': `Tipo da cama ${index + 1}` }}
            >
              {QUARTO_CONFIG.tiposCama.map(tipoCama => (
                <MenuItem key={tipoCama.value} value={tipoCama.value}>
                  {tipoCama.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Capacidade: {configCama?.capacidade || 0} pessoa(s)
          </Typography>
        </CardContent>
        <CardActions>
          <IconButton
            color="error"
            onClick={() => onRemove(index)}
            disabled={disabled}
            aria-label={`Remover cama ${index + 1}`}
          >
            <DeleteIcon />
          </IconButton>
        </CardActions>
      </Card>
    </Grid>
  );
});

CamaCard.displayName = 'CamaCard';

interface QuartoBasicInfoProps {
  formData: QuartoFormData;
  errors: ValidationErrors;
  onChange: (field: string, value: any) => void;
  disabled?: boolean;
}

const QuartoBasicInfo = React.memo<QuartoBasicInfoProps>(({ 
  formData, 
  errors, 
  onChange, 
  disabled 
}) => (
  <Grid container spacing={3}>
    <Grid item xs={12} md={6}>
      <TextField
        fullWidth
        label="Número do Quarto"
        value={formData.numero}
        onChange={(e) => onChange('numero', e.target.value)}
        error={!!errors.numero}
        helperText={errors.numero}
        required
        disabled={disabled}
        inputProps={{ 
          'aria-label': 'Número do quarto',
          'aria-describedby': errors.numero ? 'numero-error' : undefined,
          'aria-invalid': !!errors.numero,
          maxLength: 10
        }}
        FormHelperTextProps={{ id: 'numero-error' }}
      />
    </Grid>
    
    <Grid item xs={12} md={6}>
      <FormControl fullWidth required disabled={disabled}>
        <InputLabel>Tipo do Quarto</InputLabel>
        <Select
          value={formData.tipo}
          label="Tipo do Quarto"
          onChange={(e) => onChange('tipo', e.target.value)}
          inputProps={{ 'aria-label': 'Tipo do quarto' }}
        >
          {QUARTO_CONFIG.tipos.map(tipo => (
            <MenuItem key={tipo.value} value={tipo.value}>
              {tipo.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Grid>
    
    <Grid item xs={12} md={6}>
      <TextField
        fullWidth
        label="Capacidade"
        type="number"
        value={formData.capacidade}
        onChange={(e) => onChange('capacidade', parseInt(e.target.value) || 0)}
        error={!!errors.capacidade}
        helperText={errors.capacidade}
        required
        disabled={disabled}
        inputProps={{ 
          'aria-label': 'Capacidade do quarto',
          'aria-describedby': errors.capacidade ? 'capacidade-error' : undefined,
          'aria-invalid': !!errors.capacidade,
          min: 1,
          max: 10
        }}
        FormHelperTextProps={{ id: 'capacidade-error' }}
      />
    </Grid>
    
    <Grid item xs={12} md={6}>
      <TextField
        fullWidth
        label="Preço por Noite (R$)"
        type="number"
        value={formData.precoPorNoite}
        onChange={(e) => onChange('precoPorNoite', parseFloat(e.target.value) || 0)}
        error={!!errors.precoPorNoite}
        helperText={errors.precoPorNoite}
        required
        disabled={disabled}
        inputProps={{ 
          'aria-label': 'Preço por noite',
          'aria-describedby': errors.precoPorNoite ? 'preco-error' : undefined,
          'aria-invalid': !!errors.precoPorNoite,
          min: 0.01,
          max: 10000,
          step: 0.01
        }}
        FormHelperTextProps={{ id: 'preco-error' }}
      />
    </Grid>
  </Grid>
));

QuartoBasicInfo.displayName = 'QuartoBasicInfo';

interface QuartoComodidadesProps {
  formData: QuartoFormData;
  onChange: (field: string, value: boolean) => void;
  disabled?: boolean;
}

const QuartoComodidades = React.memo<QuartoComodidadesProps>(({ formData, onChange, disabled }) => (
  <Grid item xs={12}>
    <Typography variant="h6" gutterBottom>
      Comodidades
    </Typography>
    <Grid container spacing={2}>
      {QUARTO_CONFIG.comodidades.map(comodidade => (
        <ComodidadeCheckbox
          key={comodidade.key}
          label={comodidade.label}
          checked={formData[comodidade.key as keyof QuartoFormData] as boolean}
          onChange={(checked) => onChange(comodidade.key, checked)}
        />
      ))}
    </Grid>
  </Grid>
));

QuartoComodidades.displayName = 'QuartoComodidades';

interface QuartoCamasProps {
  camas: TipoCama[];
  errors: ValidationErrors;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, tipo: TipoCama) => void;
  disabled?: boolean;
}

const QuartoCamas = React.memo<QuartoCamasProps>(({ 
  camas, 
  errors, 
  onAdd, 
  onRemove, 
  onChange,
  disabled 
}) => {
  const capacidadeTotal = useMemo(() => 
    camas.reduce((total, cama) => {
      const configCama = QUARTO_CONFIG.tiposCama.find(tc => tc.value === cama);
      return total + (configCama?.capacidade || 0);
    }, 0),
    [camas]
  );
  
  return (
    <Grid item xs={12}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Camas</Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={onAdd}
          variant="outlined"
          size="small"
          disabled={disabled || camas.length >= 5}
          aria-label="Adicionar nova cama"
        >
          Adicionar Cama
        </Button>
      </Box>

      {errors.camas && (
        <Typography 
          color="error" 
          variant="body2" 
          gutterBottom
          role="alert"
          aria-live="polite"
        >
          {errors.camas}
        </Typography>
      )}

      <Grid container spacing={2}>
        {camas.map((tipo, index) => (
          <CamaCard
            key={`${tipo}-${index}`}
            tipo={tipo}
            index={index}
            onRemove={onRemove}
            onChange={onChange}
            disabled={disabled}
          />
        ))}
      </Grid>

      <Box mt={2}>
        <Typography variant="body2">
          Capacidade total das camas: {capacidadeTotal} pessoa(s)
        </Typography>
      </Box>
    </Grid>
  );
});

QuartoCamas.displayName = 'QuartoCamas';

// ===========================================
// COMPONENTE PRINCIPAL
// ===========================================
interface QuartoFormProps {
  quarto?: Partial<QuartoFormData>;
  onSave: (quarto: QuartoFormData) => void;
  onCancel: () => void;
  disabled?: boolean;
}

const QuartoForm: React.FC<QuartoFormProps> = ({ 
  quarto, 
  onSave, 
  onCancel, 
  disabled = false 
}) => {
  const [state, dispatch] = useReducer(quartoFormReducer, quarto, getInitialState);
  const { validateQuarto } = useQuartoValidation();
  const errorRef = useFocusManagement(state.errors);
  
  const formId = 'quarto-form';
  const errorId = 'quarto-form-errors';
  
  // Memoizar handlers para evitar re-renders desnecessários
  const handleInputChange = useCallback((field: string, value: any) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
  }, []);
  
  const handleComodidadeChange = useCallback((field: string, value: boolean) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
  }, []);
  
  const adicionarCama = useCallback(() => {
    dispatch({ type: 'ADD_CAMA', tipo: TipoCama.SOLTEIRO });
  }, []);
  
  const removerCama = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_CAMA', index });
  }, []);
  
  const alterarTipoCama = useCallback((index: number, tipo: TipoCama) => {
    dispatch({ type: 'UPDATE_CAMA', index, tipo });
  }, []);
  
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulário
    const errors = validateQuarto(state.formData, state.camas);
    dispatch({ type: 'SET_ERRORS', errors });
    
    if (Object.keys(errors).length > 0) {
      return;
    }
    
    // Submeter formulário
    dispatch({ type: 'SET_SUBMITTING', isSubmitting: true });
    
    try {
      await onSave(state.formData);
      dispatch({ type: 'CLEAR_ERRORS' });
    } catch (error) {
      console.error('Erro ao salvar quarto:', error);
      dispatch({ 
        type: 'SET_ERRORS', 
        errors: { submit: 'Erro ao salvar quarto. Tente novamente.' } 
      });
    } finally {
      dispatch({ type: 'SET_SUBMITTING', isSubmitting: false });
    }
  }, [state.formData, state.camas, validateQuarto, onSave]);
  
  const handleCancel = useCallback(() => {
    dispatch({ type: 'RESET_FORM', initialData: quarto });
    onCancel();
  }, [quarto, onCancel]);
  
  // Memoizar cálculos para evitar re-renders
  const hasErrors = useMemo(() => Object.keys(state.errors).length > 0, [state.errors]);
  const canAddCama = useMemo(() => state.camas.length < 5, [state.camas.length]);
  
  return (
    <Paper elevation={3} sx={{ p: 3, m: 2 }}>
      <Typography variant="h5" gutterBottom id={`${formId}-title`}>
        {quarto?.numero ? 'Editar Quarto' : 'Cadastrar Novo Quarto'}
      </Typography>

      {hasErrors && (
        <Alert 
          ref={errorRef}
          severity="error" 
          sx={{ mb: 2 }}
          id={errorId}
          role="alert"
          aria-live="polite"
          tabIndex={-1}
        >
          {Object.values(state.errors).map((error, index) => (
            <div key={index}>{error}</div>
          ))}
        </Alert>
      )}

      <form 
        id={formId}
        onSubmit={handleSubmit}
        aria-labelledby={`${formId}-title`}
        aria-describedby={hasErrors ? errorId : undefined}
        noValidate
      >
        <Grid container spacing={3}>
          <QuartoBasicInfo
            formData={state.formData}
            errors={state.errors}
            onChange={handleInputChange}
            disabled={disabled || state.isSubmitting}
          />
          
          <QuartoComodidades
            formData={state.formData}
            onChange={handleComodidadeChange}
            disabled={disabled || state.isSubmitting}
          />
          
          <QuartoCamas
            camas={state.camas}
            errors={state.errors}
            onAdd={adicionarCama}
            onRemove={removerCama}
            onChange={alterarTipoCama}
            disabled={disabled || state.isSubmitting}
          />
          
          {quarto?.numero && (
            <Grid item xs={12}>
              <FormControl fullWidth disabled={disabled || state.isSubmitting}>
                <InputLabel>Status do Quarto</InputLabel>
                <Select
                  value={state.formData.status || StatusQuarto.DISPONIVEL}
                  label="Status do Quarto"
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  inputProps={{ 'aria-label': 'Status do quarto' }}
                >
                  {QUARTO_CONFIG.status.map(status => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          <Grid item xs={12}>
            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                disabled={disabled || state.isSubmitting}
                aria-label="Cancelar formulário"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                color="primary"
                disabled={disabled || state.isSubmitting}
                aria-label={quarto?.numero ? 'Atualizar quarto' : 'Cadastrar quarto'}
              >
                {state.isSubmitting ? 'Salvando...' : (quarto?.numero ? 'Atualizar' : 'Cadastrar')}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

QuartoForm.displayName = 'QuartoForm';

export default QuartoForm;
