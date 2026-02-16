import { TipoQuarto } from '../../../domain/enums/TipoQuarto.js';
import { TipoCama } from '../../../domain/enums/TipoCama.js';

export interface EditarQuartoDTO {
  id: string;
  capacidade?: number;
  tipo?: TipoQuarto;
  precoHora?: number;
  frigobar?: boolean;
  cafeManha?: boolean;
  arCondicionado?: boolean;
  tv?: boolean;
  camas?: TipoCama[];
}
