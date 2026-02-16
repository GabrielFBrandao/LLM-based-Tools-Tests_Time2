import { useReducer, useCallback, useMemo } from 'react';
import { TipoQuarto, StatusQuarto, TipoCama } from '../domain/entities/Quarto';
import { QuartoFormData } from '../components/QuartoFormOptimized';

// ===========================================
// CONFIGURAÇÃO CENTRALIZADA
// ===========================================
const QUARTO_CONFIG = {
  tiposCama: [
    { value: TipoCama.SOLTEIRO, label: 'Solteiro', capacidade: 1 },
    { value: TipoCama.CASAL_KING, label: 'Casal King', capacidade: 2 },
    { value: TipoCama.CASAL_QUEEN, label: 'Casal Queen', capacidade: 2 }
  ]
} as const;

// ===========================================
// TIPOS E INTERFACES
// ===========================================
interface QuartoFormState {
  formData: QuartoFormData;
  camas: TipoCama[];
  errors: Record<string, string>;
  isSubmitting: boolean;
}

type QuartoFormAction =
  | { type: 'UPDATE_FIELD'; field: string; value: any }
  | { type: 'SET_ERRORS'; errors: Record<string, string> }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'ADD_CAMA'; tipo: TipoCama }
  | { type: 'REMOVE_CAMA'; index: number }
  | { type: 'UPDATE_CAMA'; index: number; tipo: TipoCama }
  | { type: 'SET_SUBMITTING'; isSubmitting: boolean }
  | { type: 'RESET_FORM'; initialData?: Partial<QuartoFormData> };

// ===========================================
// REDUCER
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
// HOOK PRINCIPAL
// ===========================================
export const useQuartoFormState = (initialQuarto?: Partial<QuartoFormData>) => {
  const [state, dispatch] = useReducer(quartoFormReducer, initialQuarto, getInitialState);
  
  // Handlers memoizados
  const updateField = useCallback((field: string, value: any) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
  }, []);
  
  const setErrors = useCallback((errors: Record<string, string>) => {
    dispatch({ type: 'SET_ERRORS', errors });
  }, []);
  
  const clearErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ERRORS' });
  }, []);
  
  const addCama = useCallback((tipo: TipoCama = TipoCama.SOLTEIRO) => {
    dispatch({ type: 'ADD_CAMA', tipo });
  }, []);
  
  const removeCama = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_CAMA', index });
  }, []);
  
  const updateCama = useCallback((index: number, tipo: TipoCama) => {
    dispatch({ type: 'UPDATE_CAMA', index, tipo });
  }, []);
  
  const setSubmitting = useCallback((isSubmitting: boolean) => {
    dispatch({ type: 'SET_SUBMITTING', isSubmitting });
  }, []);
  
  const resetForm = useCallback((initialData?: Partial<QuartoFormData>) => {
    dispatch({ type: 'RESET_FORM', initialData });
  }, []);
  
  // Cálculos memoizados
  const hasErrors = useMemo(() => Object.keys(state.errors).length > 0, [state.errors]);
  
  const capacidadeTotal = useMemo(() => 
    state.camas.reduce((total, cama) => {
      const configCama = QUARTO_CONFIG.tiposCama.find(tc => tc.value === cama);
      return total + (configCama?.capacidade || 0);
    }, 0),
    [state.camas]
  );
  
  const canAddCama = useMemo(() => state.camas.length < 5, [state.camas.length]);
  
  const isValid = useMemo(() => {
    const requiredFields = ['numero', 'tipo', 'capacidade', 'precoPorNoite'];
    const hasAllRequiredFields = requiredFields.every(field => 
      state.formData[field as keyof QuartoFormData] !== ''
    );
    
    const hasValidCapacity = state.formData.capacidade === capacidadeTotal;
    const hasAtLeastOneBed = state.camas.length > 0;
    
    return hasAllRequiredFields && hasValidCapacity && hasAtLeastOneBed && !hasErrors;
  }, [state.formData, capacidadeTotal, state.camas.length, hasErrors]);
  
  return {
    // Estado
    formData: state.formData,
    camas: state.camas,
    errors: state.errors,
    isSubmitting: state.isSubmitting,
    
    // Cálculos
    hasErrors,
    capacidadeTotal,
    canAddCama,
    isValid,
    
    // Actions
    updateField,
    setErrors,
    clearErrors,
    addCama,
    removeCama,
    updateCama,
    setSubmitting,
    resetForm
  };
};

// ===========================================
// HOOK DE VALIDAÇÃO
// ===========================================
export const useQuartoValidation = () => {
  const validateQuarto = useCallback((formData: QuartoFormData, camas: TipoCama[]): Record<string, string> => {
    const errors: Record<string, string> = {};
    
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
// HOOK DE SUBMISSÃO
// ===========================================
export const useQuartoSubmission = (onSave: (quarto: QuartoFormData) => Promise<void>) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const submit = useCallback(async (formData: QuartoFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      await onSave(formData);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar quarto';
      setSubmitError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  }, [onSave]);
  
  const reset = useCallback(() => {
    setIsSubmitting(false);
    setSubmitError(null);
  }, []);
  
  return {
    isSubmitting,
    submitError,
    submit,
    reset
  };
};
