/**
 * Erros de Domínio - Hierarquia de erros customizados
 * 
 * Decisões de Design:
 * - Herança de Error nativo para compatibilidade com stack traces
 * - Erros específicos para cada situação (SRP)
 * - Facilita tratamento diferenciado no Controller
 * - Mensagens descritivas e contextualizadas
 * 
 * Benefícios:
 * - Type safety: instanceof para identificar tipo de erro
 * - Mensagens consistentes
 * - Fácil adicionar novos erros sem modificar existentes (OCP)
 */

// Classe base para todos os erros de domínio
export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Erro quando quarto não é encontrado
 * Decisão: Erro específico para facilitar tratamento HTTP 404
 */
export class QuartoNaoEncontradoError extends DomainError {
  constructor(id?: number) {
    super(id ? `Quarto com ID ${id} não encontrado` : 'Quarto não encontrado');
  }
}

/**
 * Erro quando tentativa de criar quarto com número duplicado
 * Decisão: Erro específico para facilitar tratamento HTTP 409 (Conflict)
 */
export class QuartoJaExisteError extends DomainError {
  constructor(numero: number) {
    super(`Quarto com número ${numero} já existe`);
  }
}

/**
 * Erro quando operação não permitida em quarto ocupado
 * Decisão: Erro específico para regra de negócio importante
 */
export class QuartoOcupadoError extends DomainError {
  constructor() {
    super('Não é possível realizar esta operação em quarto ocupado');
  }
}

/**
 * Erro quando transição de status inválida
 * Decisão: Incluir estados atual e desejado na mensagem para debugging
 */
export class TransicaoStatusInvalidaError extends DomainError {
  constructor(statusAtual: string, novoStatus: string) {
    super(`Transição de status inválida: ${statusAtual} -> ${novoStatus}`);
  }
}

/**
 * Erro genérico de validação
 * Decisão: Usado por validators para erros de formato/valor
 */
export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}
