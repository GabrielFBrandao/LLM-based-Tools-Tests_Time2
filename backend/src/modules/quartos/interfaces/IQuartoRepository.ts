import { Quarto, StatusQuarto } from '../entities';

// Interface Segregation Principle - interfaces pequenas e específicas
export interface IQuartoReader {
  findAll(): Promise<Quarto[]>;
  findById(id: number): Promise<Quarto | null>;
  findByNumero(numero: number): Promise<Quarto | null>;
  findByStatus(status: StatusQuarto): Promise<Quarto[]>;
}

export interface IQuartoWriter {
  create(quarto: Quarto): Promise<Quarto>;
  update(id: number, quarto: Partial<Quarto>): Promise<Quarto>;
  delete(id: number): Promise<void>;
}

// Repository completo combina leitura e escrita
export interface IQuartoRepository extends IQuartoReader, IQuartoWriter {}

// Interface para mapeamento de DTOs
export interface IDTOMapper<Entity, DTO> {
  toDTO(entity: Entity): DTO;
  toEntity?(dto: DTO): Entity;
}
