import { Quarto, Cama } from '../entities';
import { 
  QuartoResponseDTO, 
  ListarQuartosResponseDTO,
  CamaResponseDTO 
} from '../dtos/QuartoDTO';
import { IDTOMapper } from '../interfaces/IQuartoRepository';

// Mapper para Cama
export class CamaMapper implements IDTOMapper<Cama, CamaResponseDTO> {
  toDTO(cama: Cama): CamaResponseDTO {
    return {
      id: cama.id,
      tipoCama: cama.tipoCama
    };
  }
}

// Mapper para resposta completa de Quarto
export class QuartoResponseMapper implements IDTOMapper<Quarto, QuartoResponseDTO> {
  constructor(private camaMapper: CamaMapper) {}

  toDTO(quarto: Quarto): QuartoResponseDTO {
    return {
      id: quarto.id,
      numero: quarto.numero,
      capacidade: quarto.capacidade,
      tipo: quarto.tipo,
      precoDiaria: quarto.precoDiaria,
      temFrigobar: quarto.temFrigobar,
      temCafe: quarto.temCafe,
      temArCondicionado: quarto.temArCondicionado,
      temTV: quarto.temTV,
      status: quarto.status,
      camas: quarto.getCamas().map(c => this.camaMapper.toDTO(c)),
      createdAt: quarto.createdAt,
      updatedAt: quarto.updatedAt
    };
  }
}

// Mapper para listagem simplificada
export class QuartoListMapper implements IDTOMapper<Quarto, ListarQuartosResponseDTO> {
  toDTO(quarto: Quarto): ListarQuartosResponseDTO {
    return {
      id: quarto.id,
      numero: quarto.numero,
      tipo: quarto.tipo,
      precoDiaria: quarto.precoDiaria,
      status: quarto.status
    };
  }
}
