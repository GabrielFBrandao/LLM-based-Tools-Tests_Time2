import { Request, Response } from 'express';
import { QuartosService } from '../services/QuartosService';
import { CriarQuartoDTO, AtualizarQuartoDTO } from '../dtos/QuartoDTO';
import { StatusQuarto } from '../entities';

export class QuartosController {
  constructor(private quartosService: QuartosService) {}

  async criar(req: Request, res: Response): Promise<Response> {
    try {
      const dto: CriarQuartoDTO = req.body;
      const quarto = await this.quartosService.criar(dto);
      return res.status(201).json(quarto);
    } catch (error) {
      return res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Erro ao criar quarto' 
      });
    }
  }

  async atualizar(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      const dto: AtualizarQuartoDTO = req.body;
      const quarto = await this.quartosService.atualizar(id, dto);
      return res.status(200).json(quarto);
    } catch (error) {
      return res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Erro ao atualizar quarto' 
      });
    }
  }

  async buscarPorId(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      const quarto = await this.quartosService.buscarPorId(id);
      return res.status(200).json(quarto);
    } catch (error) {
      return res.status(404).json({ 
        error: error instanceof Error ? error.message : 'Quarto não encontrado' 
      });
    }
  }

  async listar(req: Request, res: Response): Promise<Response> {
    try {
      const quartos = await this.quartosService.listar();
      return res.status(200).json(quartos);
    } catch (error) {
      return res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Erro ao listar quartos' 
      });
    }
  }

  async listarDisponiveis(req: Request, res: Response): Promise<Response> {
    try {
      const quartos = await this.quartosService.listarDisponiveis();
      return res.status(200).json(quartos);
    } catch (error) {
      return res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Erro ao listar quartos disponíveis' 
      });
    }
  }

  async alterarStatus(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!Object.values(StatusQuarto).includes(status)) {
        return res.status(400).json({ error: 'Status inválido' });
      }

      const quarto = await this.quartosService.alterarStatus(id, status);
      return res.status(200).json(quarto);
    } catch (error) {
      return res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Erro ao alterar status' 
      });
    }
  }

  async deletar(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      await this.quartosService.deletar(id);
      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Erro ao deletar quarto' 
      });
    }
  }
}
