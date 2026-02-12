import { TipoQuarto, TipoCama } from '../entities';

export class CriarCamaDTO {
  tipoCama: TipoCama;
}

export class CriarQuartoDTO {
  numero: number;
  capacidade: number;
  tipo: TipoQuarto;
  precoDiaria: number;
  temFrigobar: boolean;
  temCafe: boolean;
  temArCondicionado: boolean;
  temTV: boolean;
  camas: CriarCamaDTO[];
}

export class AtualizarQuartoDTO {
  capacidade?: number;
  tipo?: TipoQuarto;
  precoDiaria?: number;
  temFrigobar?: boolean;
  temCafe?: boolean;
  temArCondicionado?: boolean;
  temTV?: boolean;
}

export class QuartoResponseDTO {
  id: number;
  numero: number;
  capacidade: number;
  tipo: string;
  precoDiaria: number;
  temFrigobar: boolean;
  temCafe: boolean;
  temArCondicionado: boolean;
  temTV: boolean;
  status: string;
  camas: CamaResponseDTO[];
  createdAt: Date;
  updatedAt: Date;
}

export class CamaResponseDTO {
  id: number;
  tipoCama: string;
}

export class ListarQuartosResponseDTO {
  id: number;
  numero: number;
  tipo: string;
  precoDiaria: number;
  status: string;
}
