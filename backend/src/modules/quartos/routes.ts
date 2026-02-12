/**
 * Rotas do Módulo de Quartos
 * 
 * Decisões de Design:
 * - Factory Pattern para criar instâncias (encapsula criação)
 * - Dependency Injection manual (pode ser substituído por container DI)
 * - Rotas RESTful seguindo convenções HTTP
 * 
 * Benefícios:
 * - Fácil trocar implementações (ex: repository in-memory -> PostgreSQL)
 * - Centraliza criação de dependências
 * - Facilita testes (pode criar factory de teste)
 */

import { Router } from 'express';
import { QuartosController } from '../controllers/QuartosController';
import { QuartosService } from '../services/QuartosService';
import { QuartoRepositoryInMemory } from '../repositories/QuartoRepository';

/**
 * Factory Pattern - Criação de instâncias do módulo
 * 
 * Decisão: Encapsular criação de dependências em factory
 * - Facilita mudança de implementações
 * - Centraliza configuração do módulo
 * - Pode ser substituído por container DI (ex: InversifyJS)
 * 
 * Para trocar para PostgreSQL:
 * const repository = new QuartoRepositoryPostgres(prisma);
 */
class QuartosModuleFactory {
  /**
   * Cria instâncias do módulo com dependências injetadas
   * 
   * Ordem de criação (Dependency Inversion):
   * 1. Repository (camada mais baixa)
   * 2. Service (depende de repository)
   * 3. Controller (depende de service)
   */
  static create() {
    const repository = new QuartoRepositoryInMemory();
    const service = new QuartosService(repository);
    const controller = new QuartosController(service);
    return { controller };
  }
}

// Cria router do Express
const router = Router();

// Cria instâncias via factory
const { controller } = QuartosModuleFactory.create();

/**
 * Rotas RESTful
 * 
 * Convenções:
 * - POST: Criar recurso
 * - GET: Buscar recurso(s)
 * - PUT: Atualizar recurso completo
 * - PATCH: Atualizar recurso parcial
 * - DELETE: Remover recurso
 * 
 * Decisão: Arrow functions do controller já têm 'this' bound
 * Não precisa de .bind() ou wrapper function
 */

// Criar novo quarto
router.post('/quartos', controller.criar);

// Listar todos os quartos
router.get('/quartos', controller.listar);

// Listar apenas quartos disponíveis
// Decisão: Rota específica antes de /:id para evitar conflito
router.get('/quartos/disponiveis', controller.listarDisponiveis);

// Buscar quarto por ID
router.get('/quartos/:id', controller.buscarPorId);

// Atualizar quarto
router.put('/quartos/:id', controller.atualizar);

// Alterar apenas status do quarto
// Decisão: PATCH para atualização parcial (apenas status)
router.patch('/quartos/:id/status', controller.alterarStatus);

// Deletar quarto
router.delete('/quartos/:id', controller.deletar);

export default router;
