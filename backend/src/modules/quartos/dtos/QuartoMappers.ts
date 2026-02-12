/**
 * Mappers - Conversão entre Entidades e DTOs
 * 
 * Decisões de Design:
 * - Cada mapper tem uma única responsabilidade (SRP)
 * - Mappers são reutilizáveis e componíveis
 * - Separação entre entidade de domínio e representação externa
 * 
 * Benefícios:
 * - Entidades não são expostas diretamente (segurança)
 * - Controle sobre o que é serializado
 * - Diferentes representações para diferentes contextos
 * - Fácil testar isoladamente
 */

import { Quarto, Cama } from '../entities';
import { 
  QuartoResponseDTO, 
  ListarQuartosResponseDTO,
  CamaResponseDTO 
} from '../dtos/QuartoDTO';
import { IDTOMapper } from '../interfaces/IQuartoRepository';

/**
 * Mapper para Cama
 * Decisão: Mapper separado para permitir reutilização
 * Usado por QuartoResponseMapper
 */
export class CamaMapper implements IDTOMapper<Cama, CamaResponseDTO> {
  toDTO(cama: Cama): CamaResponseDTO {
    return {
      id: cama.id,
      tipoCama: cama.tipoCama
    };
  }
}

/**
 * Mapper para resposta completa de Quarto
 * Decisão: Composition - usa CamaMapper para mapear camas
 * Retorna todos os dados do quarto (usado em GET /quartos/:id)
 */
export class QuartoResponseMapper implements IDTOMapper<Quarto, QuartoResponseDTO> {
  // Dependency Injection do CamaMapper
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

/**
 * Mapper para listagem simplificada
 * Decisão: Mapper separado para listagem (menos dados)
 * Otimiza transferência de dados em listas grandes
 * Usado em GET /quartos
 */
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
