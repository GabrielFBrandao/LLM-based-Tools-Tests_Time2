import { Quarto } from '../../../domain/entities/Quarto.js';
import { NumeroQuarto } from '../../../domain/value-objects/NumeroQuarto.js';

// Porta (interface) do repositório de Quarto, para isolar persistência.
export interface QuartoRepository {
  salvar(quarto: Quarto): Promise<Quarto>;
  atualizar(quarto: Quarto): Promise<Quarto>;
  obterPorId(id: string): Promise<Quarto | null>;
  obterPorNumero(numero: NumeroQuarto): Promise<Quarto | null>;
  listar(): Promise<Quarto[]>;
}
