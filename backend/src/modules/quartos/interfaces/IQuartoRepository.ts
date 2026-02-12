/**
 * Interfaces do Repository - Interface Segregation Principle
 * 
 * Decisões de Design:
 * - Segregar operações de leitura e escrita (ISP)
 * - Permite implementações que só leem ou só escrevem
 * - Facilita testes (pode mockar apenas o que precisa)
 * - Repository completo combina ambas as interfaces
 * 
 * Benefícios:
 * - Clientes dependem apenas do que usam (ISP)
 * - Fácil criar implementações read-only ou write-only
 * - Melhor testabilidade
 */

import { Quarto, StatusQuarto } from '../entities';

/**
 * Interface para operações de leitura
 * Decisão: Separar leitura para permitir implementações read-only
 * Ex: Cache read-only, replicação de leitura
 */
export interface IQuartoReader {
  findAll(): Promise<Quarto[]>;
  findById(id: number): Promise<Quarto | null>;
  findByNumero(numero: number): Promise<Quarto | null>;
  findByStatus(status: StatusQuarto): Promise<Quarto[]>;
}

/**
 * Interface para operações de escrita
 * Decisão: Separar escrita para permitir implementações write-only
 * Ex: Event sourcing, audit log
 */
export interface IQuartoWriter {
  create(quarto: Quarto): Promise<Quarto>;
  update(id: number, quarto: Partial<Quarto>): Promise<Quarto>;
  delete(id: number): Promise<void>;
}

/**
 * Repository completo - combina leitura e escrita
 * Decisão: Usar composição de interfaces ao invés de herança múltipla
 * Implementações concretas devem implementar ambas as interfaces
 */
export interface IQuartoRepository extends IQuartoReader, IQuartoWriter {}

/**
 * Interface genérica para mapeamento de DTOs
 * Decisão: Interface genérica para reutilização
 * - toDTO obrigatório (Entity -> DTO)
 * - toEntity opcional (nem sempre necessário)
 */
export interface IDTOMapper<Entity, DTO> {
  toDTO(entity: Entity): DTO;
  toEntity?(dto: DTO): Entity;
}
