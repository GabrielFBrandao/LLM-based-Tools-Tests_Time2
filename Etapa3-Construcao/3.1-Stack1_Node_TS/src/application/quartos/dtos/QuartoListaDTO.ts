import { Disponibilidade } from '../../../domain/enums/Disponibilidade.js';
import { TipoQuarto } from '../../../domain/enums/TipoQuarto.js';

export interface QuartoListaDTO {
  id: string;
  numero: number;
  tipo: TipoQuarto;
  precoHora: number;
  disponibilidade: Disponibilidade;
}
