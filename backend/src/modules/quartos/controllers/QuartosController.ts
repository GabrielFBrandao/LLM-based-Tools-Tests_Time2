import { Request, Response, NextFunction } from 'express';
import { QuartosService } from '../services/QuartosService';
import { CriarQuartoDTO, AtualizarQuartoDTO } from '../dtos/QuartoDTO';
import { StatusQuarto } from '../entities';
import { DomainError } from '../errors/QuartoErrors';

// Controller seguindo Single Responsibility Principle
export class QuartosController {
  constructor(private readonly service: QuartosService) {}

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

  // Métodos privados para Clean Code
  private parseId(id: string): number {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new Error('ID inválido');
    }
    return parsedId;
  }

  private validateStatus(status: string): void {
    if (!Object.values(StatusQuarto).includes(status as StatusQuarto)) {
      throw new Error('Status inválido');
    }
  }

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
