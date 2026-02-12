import { Router } from 'express';
import { QuartosController } from '../controllers/QuartosController';
import { QuartosService } from '../services/QuartosService';
import { QuartoRepositoryInMemory } from '../repositories/QuartoRepository';

// Factory Pattern para criar instâncias
class QuartosModuleFactory {
  static create() {
    const repository = new QuartoRepositoryInMemory();
    const service = new QuartosService(repository);
    const controller = new QuartosController(service);
    return { controller };
  }
}

const router = Router();
const { controller } = QuartosModuleFactory.create();

// Rotas RESTful
router.post('/quartos', controller.criar);
router.get('/quartos', controller.listar);
router.get('/quartos/disponiveis', controller.listarDisponiveis);
router.get('/quartos/:id', controller.buscarPorId);
router.put('/quartos/:id', controller.atualizar);
router.patch('/quartos/:id/status', controller.alterarStatus);
router.delete('/quartos/:id', controller.deletar);

export default router;
