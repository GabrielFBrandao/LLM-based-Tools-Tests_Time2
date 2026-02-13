import { useState, useEffect, useCallback } from 'react';
import { Quarto, TipoQuarto, StatusQuarto } from '../domain';
import { quartoService } from '../services/quartoService';

export interface UseQuartosReturn {
  quartos: Quarto[];
  loading: boolean;
  error: string | null;
  carregarQuartos: () => Promise<void>;
  criarQuarto: (quarto: Omit<Quarto, 'id'>) => Promise<Quarto>;
  atualizarQuarto: (id: string, quarto: Partial<Quarto>) => Promise<Quarto>;
  deletarQuarto: (id: string) => Promise<void>;
  atualizarStatusQuarto: (id: string, status: StatusQuarto) => Promise<Quarto>;
  buscarPorTipo: (tipo: TipoQuarto) => Promise<Quarto[]>;
  buscarPorStatus: (status: StatusQuarto) => Promise<Quarto[]>;
  buscarDisponiveis: () => Promise<Quarto[]>;
}

export const useQuartos = (): UseQuartosReturn => {
  const [quartos, setQuartos] = useState<Quarto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregarQuartos = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const dados = await quartoService.listar();
      setQuartos(dados);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar quartos');
    } finally {
      setLoading(false);
    }
  }, []);

  const criarQuarto = useCallback(async (quartoData: Omit<Quarto, 'id'>): Promise<Quarto> => {
    setLoading(true);
    setError(null);
    
    try {
      const novoQuarto = await quartoService.criar(quartoData);
      setQuartos(prev => [...prev, novoQuarto]);
      return novoQuarto;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar quarto';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const atualizarQuarto = useCallback(async (id: string, quartoData: Partial<Quarto>): Promise<Quarto> => {
    setLoading(true);
    setError(null);
    
    try {
      const quartoAtualizado = await quartoService.atualizar(id, quartoData);
      setQuartos(prev => prev.map(q => q.id === id ? quartoAtualizado : q));
      return quartoAtualizado;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar quarto';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const deletarQuarto = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await quartoService.deletar(id);
      setQuartos(prev => prev.filter(q => q.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar quarto';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const atualizarStatusQuarto = useCallback(async (id: string, status: StatusQuarto): Promise<Quarto> => {
    setLoading(true);
    setError(null);
    
    try {
      const quartoAtualizado = await quartoService.atualizarStatus(id, status);
      setQuartos(prev => prev.map(q => q.id === id ? quartoAtualizado : q));
      return quartoAtualizado;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar status';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const buscarPorTipo = useCallback(async (tipo: TipoQuarto): Promise<Quarto[]> => {
    setLoading(true);
    setError(null);
    
    try {
      return await quartoService.buscarPorTipo(tipo);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar quartos por tipo';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const buscarPorStatus = useCallback(async (status: StatusQuarto): Promise<Quarto[]> => {
    setLoading(true);
    setError(null);
    
    try {
      return await quartoService.buscarPorStatus(status);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar quartos por status';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const buscarDisponiveis = useCallback(async (): Promise<Quarto[]> => {
    setLoading(true);
    setError(null);
    
    try {
      return await quartoService.buscarDisponiveis();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar quartos disponíveis';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar quartos na montagem do componente
  useEffect(() => {
    carregarQuartos();
  }, [carregarQuartos]);

  return {
    quartos,
    loading,
    error,
    carregarQuartos,
    criarQuarto,
    atualizarQuarto,
    deletarQuarto,
    atualizarStatusQuarto,
    buscarPorTipo,
    buscarPorStatus,
    buscarDisponiveis
  };
};
