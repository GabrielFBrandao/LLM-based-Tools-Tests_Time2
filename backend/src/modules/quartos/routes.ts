import { Router } from 'express';
import { QuartosController } from '../controllers/QuartosController';
import { QuartosService } from '../services/QuartosService';
import { QuartoRepositoryInMemory } from '../repositories/QuartoRepository';

const router = Router();

// Dependency Injection
const quartoRepository = new QuartoRepositoryInMemory();
const quartosService = new QuartosService(quartoRepository);
const quartosController = new QuartosController(quartosService);

// Rotas
router.post('/quartos', (req, res) => quartosController.criar(req, res));
router.get('/quartos', (req, res) => quartosController.listar(req, res));
router.get('/quartos/disponiveis', (req, res) => quartosController.listarDisponiveis(req, res));
router.get('/quartos/:id', (req, res) => quartosController.buscarPorId(req, res));
router.put('/quartos/:id', (req, res) => quartosController.atualizar(req, res));
router.patch('/quartos/:id/status', (req, res) => quartosController.alterarStatus(req, res));
router.delete('/quartos/:id', (req, res) => quartosController.deletar(req, res));

export default router;
