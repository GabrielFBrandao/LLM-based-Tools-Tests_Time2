/**
 * QuartosController - Camada de Apresentação (HTTP)
 * 
 * Decisões de Design:
 * - Single Responsibility: apenas lidar com HTTP (request/response)
 * - Dependency Inversion: depende de QuartosService (abstração)
 * - Arrow functions para bind automático de 'this'
 * - Tratamento de erros centralizado
 * - Mapeamento de erros de domínio para status HTTP
 * 
 * Responsabilidades:
 * - Receber requisições HTTP
 * - Validar parâmetros de rota
 * - Chamar service apropriado
 * - Mapear erros para status HTTP
 * - Retornar respostas HTTP
 * 
 * NÃO faz:
 * - Lógica de negócio (delega ao service)
 * - Acesso a banco de dados (delega ao service)
 * - Validações complexas (delega ao service/validators)
 */

import { Request, Response, NextFunction } from 'express';
import { QuartosService } from '../services/QuartosService';
import { CriarQuartoDTO, AtualizarQuartoDTO } from '../dtos/QuartoDTO';
import { StatusQuarto } from '../entities';
import { DomainError } from '../errors/QuartoErrors';

export class QuartosController {
  /**
   * Construtor com Dependency Injection
   * Decisão: Injetar service para facilitar testes (pode mockar service)
   * readonly: service não deve ser modificado após construção
   */
  constructor(private readonly service: QuartosService) {}

  /**
   * POST /quartos - Cria novo quarto
   * Decisão: Arrow function para bind automático de 'this'
   * Permite usar diretamente em rotas sem .bind()
   */
  criar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: CriarQuartoDTO = req.body;
      const quarto = await this.service.criar(dto);
      res.status(201).json(quarto);
    } catch (error) {
      this.handleError(error, res, next);
    }
  };

  atualizar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = this.parseId(req.params.id);
      const dto: AtualizarQuartoDTO = req.body;
      const quarto = await this.service.atualizar(id, dto);
      res.status(200).json(quarto);
    } catch (error) {
      this.handleError(error, res, next);
    }
  };

  buscarPorId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = this.parseId(req.params.id);
      const quarto = await this.service.buscarPorId(id);
      res.status(200).json(quarto);
    } catch (error) {
      this.handleError(error, res, next);
    }
  };

  listar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const quartos = await this.service.listar();
      res.status(200).json(quartos);
    } catch (error) {
      this.handleError(error, res, next);
    }
  };

  listarDisponiveis = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const quartos = await this.service.listarDisponiveis();
      res.status(200).json(quartos);
    } catch (error) {
      this.handleError(error, res, next);
    }
  };

  /**
   * PATCH /quartos/:id/status - Altera status do quarto
   * Decisão: Endpoint separado para alteração de status
   * - Valida status antes de chamar service
   * - Facilita auditoria de mudanças de status
   */
  alterarStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = this.parseId(req.params.id);
      const { status } = req.body;
      
      this.validateStatus(status);

      const quarto = await this.service.alterarStatus(id, status);
      res.status(200).json(quarto);
    } catch (error) {
      this.handleError(error, res, next);
    }
  };

  deletar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = this.parseId(req.params.id);
      await this.service.deletar(id);
      res.status(204).send();
    } catch (error) {
      this.handleError(error, res, next);
    }
  };

  // ========== Métodos Privados - Clean Code ==========

  /**
   * Parse e valida ID da rota
   * Decisão: Método privado reutilizável (DRY)
   * Lança erro se ID inválido (fail-fast)
   */
  private parseId(id: string): number {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new Error('ID inválido');
    }
    return parsedId;
  }

  /**
   * Valida se status é válido
   * Decisão: Validação no controller para retornar erro HTTP apropriado
   * Evita chamar service com dados inválidos
   */
  private validateStatus(status: string): void {
    if (!Object.values(StatusQuarto).includes(status as StatusQuarto)) {
      throw new Error('Status inválido');
    }
  }

  /**
   * Tratamento centralizado de erros
   * 
   * Decisão: Centralizar tratamento para consistência
   * - Erros de domínio: mapeados para status HTTP específicos
   * - Erros genéricos: 400 Bad Request
   * - Erros desconhecidos: delegados ao middleware de erro do Express
   * 
   * Benefícios:
   * - Consistência nas respostas de erro
   * - Fácil adicionar novos tipos de erro
   * - Separação de responsabilidades
   */
  private handleError(error: unknown, res: Response, next: NextFunction): void {
    if (error instanceof DomainError) {
      res.status(this.getStatusCode(error)).json({ 
        error: error.message,
        type: error.name
      });
    } else if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      next(error);
    }
  }

  /**
   * Mapeia erros de domínio para status HTTP
   * 
   * Decisão: Mapeamento explícito para clareza
   * - 404: Recurso não encontrado
   * - 409: Conflito (recurso já existe)
   * - 400: Requisição inválida
   * - 500: Erro desconhecido (fallback)
   * 
   * Benefício: Fácil adicionar novos mapeamentos
   */
  private getStatusCode(error: DomainError): number {
    const errorName = error.constructor.name;
    
    const statusMap: Record<string, number> = {
      'QuartoNaoEncontradoError': 404,
      'QuartoJaExisteError': 409,
      'QuartoOcupadoError': 400,
      'TransicaoStatusInvalidaError': 400,
      'ValidationError': 400
    };

    return statusMap[errorName] || 500;
  }
}
