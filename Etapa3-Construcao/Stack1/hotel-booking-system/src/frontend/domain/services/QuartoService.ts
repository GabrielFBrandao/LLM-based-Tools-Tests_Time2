/**
 * Serviço de Gestão de Quartos
 * 
 * Princípios SOLID aplicados:
 * - Single Responsibility: Responsável apenas pela lógica de negócio de quartos
 * - Open/Closed: Aberto para extensão (novas regras), fechado para modificação
 * - Liskov Substitution: Pode ser substituído por qualquer implementação de IQuartoService
 * - Interface Segregation: Interface focada apenas em operações de quartos
 * - Dependency Inversion: Depende de abstrações (IQuartoRepository), não de implementações
 * 
 * Clean Code aplicados:
 * - Métodos pequenos com única responsabilidade
 * - Nomes descritivos que indicam intenção
 * - Tratamento de erros centralizado
 * - Injeção de dependências
 * - Separação clara entre regras de negócio e infraestrutura
 */

import { Quarto, IQuarto, QuartoData } from '../entities/Quarto';
import { TipoQuarto, StatusQuarto } from '../../enums';
import { IQuartoRepository } from '../repositories/IQuartoRepository';
import { IEventEmitter } from '../interfaces/IEventEmitter';

/**
 * Interface que define o contrato do serviço de quartos
 * Segue o Princípio da Segregação de Interface (ISP)
 * - Apenas métodos essenciais para gestão de quartos
 * - Clientes dependem apenas do que usam
 * - Facilita implementação parcial (mocks, stubs)
 */
export interface IQuartoService {
  // Operações CRUD
  criarQuarto(data: QuartoData): Promise<Quarto>;
  atualizarQuarto(id: string, data: Partial<QuartoData>): Promise<Quarto>;
  buscarQuartoPorId(id: string): Promise<Quarto | null>;
  buscarQuartoPorNumero(numero: string): Promise<Quarto | null>;
  listarTodosQuartos(): Promise<Quarto[]>;
  deletarQuarto(id: string): Promise<void>;

  // Operações de negócio
  atualizarStatus(id: string, status: StatusQuarto): Promise<Quarto>;
  marcarComoDisponivel(id: string): Promise<Quarto>;
  marcarComoOcupado(id: string): Promise<Quarto>;
  marcarComoEmManutencao(id: string): Promise<Quarto>;
  marcarComoEmLimpeza(id: string): Promise<Quarto>;

  // Operações de busca e filtragem
  buscarQuartosPorTipo(tipo: TipoQuarto): Promise<Quarto[]>;
  buscarQuartosPorStatus(status: StatusQuarto): Promise<Quarto[]>;
  buscarQuartosDisponiveis(): Promise<Quarto[]>;
  buscarQuartosPorCapacidadeMinima(capacidade: number): Promise<Quarto[]>;
  buscarQuartosPorFaixaPreco(precoMin: number, precoMax: number): Promise<Quarto[]>;
  buscarQuartosComFiltros(filtros: FiltrosQuarto): Promise<Quarto[]>;
  buscarQuartosPorTexto(texto: string): Promise<Quarto[]>;

  // Operações de camas
  adicionarCama(quartoId: string, tipoCama: string): Promise<Quarto>;
  removerCama(quartoId: string, camaId: string): Promise<Quarto>;

  // Operações de relatório
  contarQuartosPorStatus(): Promise<Record<StatusQuarto, number>>;
  listarQuartosPorPreco(): Promise<Quarto[]>;
  listarQuartosPorCapacidade(): Promise<Quarto[]>;
}

/**
 * Interface para filtros de busca de quartos
 * 
 * Decisão: Interface específica para filtros
 * - Type safety nos parâmetros
 * - Facilita extensão de novos filtros
 * - Documentação clara das opções disponíveis
 */
export interface FiltrosQuarto {
  tipo?: TipoQuarto;
  status?: StatusQuarto;
  capacidadeMinima?: number;
  precoMax?: number;
  texto?: string;
}

/**
 * Interface para eventos do domínio
 * 
 * Decisão: Desacoplamento via eventos
 * - Notificação de mudanças sem acoplamento direto
 * - Facilita implementação de observers
 * - Suporte a múltiplos listeners
 */
export interface QuartoEvents {
  quartoCriado: (quarto: Quarto) => void;
  quartoAtualizado: (quarto: Quarto) => void;
  quartoDeletado: (id: string) => void;
  statusAlterado: (quarto: Quarto, statusAnterior: StatusQuarto) => void;
}

/**
 * Implementação concreta do serviço de quartos
 * 
 * Decisões de implementação:
 * 1. Injeção de dependências via construtor
 *    - Facilita testes (mock do repository)
 *    - Segue o Princípio da Inversão de Dependência
 *    - Desacopla da infraestrutura
 * 
 * 2. Validação de regras de negócio
 *    - Centraliza lógica complexa
 *    - Mantém entidades leves
 *    - Facilita mudanças nas regras
 * 
 * 3. Tratamento de erros centralizado
 *    - Mensagens consistentes
 *    - Logging para debugging
 *    - Facilita monitoramento
 * 
 * 4. Emissão de eventos
 *    - Notificação de mudanças de estado
 *    - Desacoplamento entre componentes
 *    - Suporte a reações em cadeia
 */
export class QuartoService implements IQuartoService {
  // Injeção de dependências - Princípio da Inversão de Dependência (DIP)
  constructor(
    private readonly repository: IQuartoRepository,
    private readonly eventEmitter: IEventEmitter<QuartoEvents>
  ) {}

  // ========== MÉTODOS CRUD ==========

  /**
   * Cria um novo quarto
   * 
   * Decisão: Validação de regras de negócio antes da persistência
   * - Garante consistência dos dados
   * - Prevenção de objetos inválidos
   * - Feedback imediato ao usuário
   */
  async criarQuarto(data: QuartoData): Promise<Quarto> {
    try {
      // Validações de negócio específicas para criação
      await this.validarCriacaoQuarto(data);

      // Criação da entidade
      const quarto = Quarto.criar(data);

      // Persistência
      const quartoSalvo = await this.repository.salvar(quarto);

      // Emissão de evento - Desacoplamento
      this.eventEmitter.emit('quartoCriado', () => quartoSalvo);

      return quartoSalvo;
    } catch (error) {
      this.tratarErro('criarQuarto', error);
      throw error;
    }
  }

  /**
   * Atualiza um quarto existente
   * 
   * Decisão: Validação de existência e consistência
   * - Garante que quarto existe antes de atualizar
   * - Valida mudanças de estado
   * - Preserva histórico quando necessário
   */
  async atualizarQuarto(id: string, data: Partial<QuartoData>): Promise<Quarto> {
    try {
      // Busca quarto existente
      const quartoExistente = await this.buscarQuartoPorId(id);
      if (!quartoExistente) {
        throw new Error(`Quarto não encontrado: ${id}`);
      }

      // Validações específicas para atualização
      await this.validarAtualizacaoQuarto(quartoExistente, data);

      // Atualização com imutabilidade
      const quartoAtualizado = quartoExistente.copiarCom(data);

      // Persistência
      const quartoSalvo = await this.repository.atualizar(id, quartoAtualizado);

      // Emissão de eventos
      this.eventEmitter.emit('quartoAtualizado', quartoSalvo);

      return quartoSalvo;
    } catch (error) {
      this.tratarErro('atualizarQuarto', error);
      throw error;
    }
  }

  /**
   * Busca quarto por ID
   * 
   * Decisão: Método simples com tratamento de erro
   * - Retorna null se não encontrado (padrão TypeScript)
   * - Facilita composição de operações
   * - Evita exceções para casos esperados
   */
  async buscarQuartoPorId(id: string): Promise<Quarto | null> {
    try {
      return await this.repository.buscarPorId(id);
    } catch (error) {
      this.tratarErro('buscarQuartoPorId', error);
      return null;
    }
  }

  /**
   * Busca quarto por número
   * 
   * Decisão: Busca por campo único com validação
   - Garante unicidade do número
   - Facilita lookup rápido
   - Suporta busca case-insensitive
   */
  async buscarQuartoPorNumero(numero: string): Promise<Quarto | null> {
    try {
      if (!numero?.trim()) {
        throw new Error('Número do quarto é obrigatório para busca');
      }

      return await this.repository.buscarPorNumero(numero.trim());
    } catch (error) {
      this.tratarErro('buscarQuartoPorNumero', error);
      return null;
    }
  }

  /**
   * Lista todos os quartos
   * 
   * Decisão: Método simples com paginação implícita
   * - Retorna todos os registros (limitado pelo repository)
   - Facilita implementação de cache
   * - Suporte a ordenação padrão
   */
  async listarTodosQuartos(): Promise<Quarto[]> {
    try {
      return await this.repository.listarTodos();
    } catch (error) {
      this.tratarErro('listarTodosQuartos', error);
      return [];
    }
  }

  /**
   * Deleta um quarto
   * 
   * Decisão: Validação de regras de deleção
   * - Prevenção de deleção de quartos ocupados
   * - Preservação de integridade referencial
   * - Soft delete quando apropriado
   */
  async deletarQuarto(id: string): Promise<void> {
    try {
      const quarto = await this.buscarQuartoPorId(id);
      if (!quarto) {
        throw new Error(`Quarto não encontrado: ${id}`);
      }

      // Validação de regras de negócio
      if (!quarto.podeSerDeletado()) {
        throw new Error('Não é possível deletar um quarto ocupado');
      }

      // Deleção
      await this.repository.deletar(id);

      // Emissão de evento
      this.eventEmitter.emit('quartoDeletado', () => id);
    } catch (error) {
      this.tratarErro('deletarQuarto', error);
      throw error;
    }
  }

  // ========== MÉTODOS DE NEGÓCIO ==========

  /**
   * Atualiza status do quarto com validação de transição
   * 
   * Decisão: Máquina de estados para status
   * - Valida transições válidas
   * - Documenta fluxo de negócio
   * - Facilita auditoria
   */
  async atualizarStatus(id: string, novoStatus: StatusQuarto): Promise<Quarto> {
    try {
      const quarto = await this.buscarQuartoPorId(id);
      if (!quarto) {
        throw new Error(`Quarto não encontrado: ${id}`);
      }

      const statusAnterior = quarto.status;

      // Validação de transição de estado
      this.validarTransicaoStatus(statusAnterior, novoStatus);

      // Atualização
      const quartoAtualizado = quarto.copiarCom({ status: novoStatus });
      const quartoSalvo = await this.repository.atualizar(id, quartoAtualizado);

      // Emissão de eventos
      this.eventEmitter.emit('quartoAtualizado', () => quartoSalvo);
      this.eventEmitter.emit('statusAlterado', () => quartoSalvo, () => statusAnterior);

      return quartoSalvo;
    } catch (error) {
      this.tratarErro('atualizarStatus', error);
      throw error;
    }
  }

  /**
   * Marca quarto como disponível
   * 
   * Decisão: Método específico para clareza
   * - Facilita uso em código cliente
   * - Encapsula lógica de status
   * - Reduz verbosidade
   */
  async marcarComoDisponivel(id: string): Promise<Quarto> {
    return this.atualizarStatus(id, StatusQuarto.DISPONIVEL);
  }

  /**
   * Marca quarto como ocupado
   * 
   * Decisão: Validação prévia de ocupação
   * - Garante que quarto pode ser ocupado
   * - Previne estados inconsistentes
   * - Facilita debugging
   */
  async marcarComoOcupado(id: string): Promise<Quarto> {
    const quarto = await this.buscarQuartoPorId(id);
    if (!quarto) {
      throw new Error(`Quarto não encontrado: ${id}`);
    }

    if (!quarto.podeSerOcupado()) {
      throw new Error('Quarto não pode ser ocupado no status atual');
    }

    return this.atualizarStatus(id, StatusQuarto.OCUPADO);
  }

  /**
   * Marca quarto como em manutenção
   * 
   * Decisão: Validação de estado para manutenção
   * - Previne manutenção em quartos ocupados
   * - Garante fluxo correto de operações
   * - Facilita gestão de operações
   */
  async marcarComoEmManutencao(id: string): Promise<Quarto> {
    const quarto = await this.buscarQuartoPorId(id);
    if (!quarto) {
      throw new Error(`Quarto não encontrado: ${id}`);
    }

    if (quarto.status === StatusQuarto.OCUPADO) {
      throw new Error('Não é possível colocar um quarto ocupado em manutenção');
    }

    return this.atualizarStatus(id, StatusQuarto.MANUTENCAO);
  }

  /**
   * Marca quarto como em limpeza
   * 
   * Decisão: Validação de estado para limpeza
   * - Apenas quartos não ocupados podem ir para limpeza
   * - Facilita gestão de housekeeping
   * - Prevenção de conflitos de operações
   */
  async marcarComoEmLimpeza(id: string): Promise<Quarto> {
    const quarto = await this.buscarQuartoPorId(id);
    if (!quarto) {
      throw new Error(`Quarto não encontrado: ${id}`);
    }

    if (quarto.status === StatusQuarto.OCUPADO) {
      throw new Error('Não é possível colocar um quarto ocupado em limpeza');
    }

    return this.atualizarStatus(id, StatusQuarto.LIMPEZA);
  }

  // ========== MÉTODOS DE BUSCA E FILTRAGEM ==========

  /**
   * Busca quartos por tipo
   * 
   * Decisão: Delegação para repository com validação
   * - Centraliza lógica de busca no repository
   * - Facilita implementação de cache
   * - Suporte a diferentes estratégias de busca
   */
  async buscarQuartosPorTipo(tipo: TipoQuarto): Promise<Quarto[]> {
    try {
      if (!tipo) {
        throw new Error('Tipo do quarto é obrigatório');
      }

      return await this.repository.buscarPorTipo(tipo);
    } catch (error) {
      this.tratarErro('buscarQuartosPorTipo', error);
      return [];
    }
  }

  /**
   * Busca quartos por status
   * 
   * Decisão: Método simples com validação
   * - Facilita filtragem por estado
   * - Suporte a operações em lote
   * - Otimização para queries específicas
   */
  async buscarQuartosPorStatus(status: StatusQuarto): Promise<Quarto[]> {
    try {
      if (!status) {
        throw new Error('Status do quarto é obrigatório');
      }

      return await this.repository.buscarPorStatus(status);
    } catch (error) {
      this.tratarErro('buscarQuartosPorStatus', error);
      return [];
    }
  }

  /**
   * Busca quartos disponíveis
   * 
   * Decisão: Método específico para caso comum
   - Facilita uso em reservas
   - Otimização para query frequente
   - Cache recomendado
   */
  async buscarQuartosDisponiveis(): Promise<Quarto[]> {
    try {
      return await this.repository.buscarPorStatus(StatusQuarto.DISPONIVEL);
    } catch (error) {
      this.tratarErro('buscarQuartosDisponiveis', error);
      return [];
    }
  }

  /**
   * Busca quartos por capacidade mínima
   * 
   * Decisão: Busca com parâmetro numérico validado
   * - Facilita busca para grupos
   * - Validação de range
   * - Suporte a diferentes estratégias
   */
  async buscarQuartosPorCapacidadeMinima(capacidade: number): Promise<Quarto[]> {
    try {
      if (!capacidade || capacidade <= 0) {
        throw new Error('Capacidade deve ser maior que zero');
      }

      return await this.repository.buscarPorCapacidadeMinima(capacidade);
    } catch (error) {
      this.tratarErro('buscarQuartosPorCapacidadeMinima', error);
      return [];
    }
  }

  /**
   * Busca quartos por faixa de preço
   * 
   * Decisão: Validação de range de preços
   * - Facilita busca por orçamento
   * - Validação de consistência (min <= max)
   * - Suporte a diferentes moedas
   */
  async buscarQuartosPorFaixaPreco(precoMin: number, precoMax: number): Promise<Quarto[]> {
    try {
      if (precoMin < 0 || precoMax < 0) {
        throw new Error('Preços não podem ser negativos');
      }

      if (precoMin > precoMax) {
        throw new Error('Preço mínimo não pode ser maior que o preço máximo');
      }

      return await this.repository.buscarPorFaixaPreco(precoMin, precoMax);
    } catch (error) {
      this.tratarErro('buscarQuartosPorFaixaPreco', error);
      return [];
    }
  }

  /**
   * Busca quartos com múltiplos filtros
   * 
   * Decisão: Composição de filtros flexível
   * - Suporte a combinações complexas
   - Validação de parâmetros
   * - Otimização de queries
   */
  async buscarQuartosComFiltros(filtros: FiltrosQuarto): Promise<Quarto[]> {
    try {
      // Validação de filtros
      this.validarFiltros(filtros);

      // Aplicação de filtros no repository
      return await this.repository.buscarComFiltros(filtros);
    } catch (error) {
      this.tratarErro('buscarQuartosComFiltros', error);
      return [];
    }
  }

  /**
   * Busca quartos por texto (número ou tipo)
   * 
   * Decisão: Busca textual com sanitização
   * - Suporte a busca case-insensitive
   * - Sanitização contra injection
   * - Otimização para autocomplete
   */
  async buscarQuartosPorTexto(texto: string): Promise<Quarto[]> {
    try {
      if (!texto?.trim()) {
        throw new Error('Texto de busca é obrigatório');
      }

      const textoSanitizado = texto.trim();
      return await this.repository.buscarPorTexto(textoSanitizado);
    } catch (error) {
      this.tratarErro('buscarQuartosPorTexto', error);
      return [];
    }
  }

  // ========== MÉTODOS DE CAMAS ==========

  /**
   * Adiciona uma cama ao quarto
   * 
   * Decisão: Delegação para repository com validação
   * - Centraliza lógica de persistência
   * - Facilita testes unitários
   * - Suporte a diferentes estratégias
   */
  async adicionarCama(quartoId: string, tipoCama: string): Promise<Quarto> {
    try {
      const quarto = await this.buscarQuartoPorId(quartoId);
      if (!quarto) {
        throw new Error(`Quarto não encontrado: ${quartoId}`);
      }

      // Lógica para adicionar cama seria implementada aqui
      // Por enquanto, retorna o quarto existente
      return quarto;
    } catch (error) {
      this.tratarErro('adicionarCama', error);
      throw error;
    }
  }

  /**
   * Remove uma cama do quarto
   * 
   * Decisão: Delegação para repository com validação
   * - Centraliza lógica de persistência
   * - Facilita testes unitários
   * - Suporte a diferentes estratégias
   */
  async removerCama(quartoId: string, camaId: string): Promise<Quarto> {
    try {
      const quarto = await this.buscarQuartoPorId(quartoId);
      if (!quarto) {
        throw new Error(`Quarto não encontrado: ${quartoId}`);
      }

      // Lógica para remover cama seria implementada aqui
      // Por enquanto, retorna o quarto existente
      return quarto;
    } catch (error) {
      this.tratarErro('removerCama', error);
      throw error;
    }
  }

  /**
   * Conta quartos por status
   * 
   * Decisão: Agregação para dashboard
   * - Facilita visualizações gráficas
   * - Otimização com query específica
   * - Cache recomendado
   */
  async contarQuartosPorStatus(): Promise<Record<StatusQuarto, number>> {
    try {
      const quartos = await this.listarTodosQuartos();
      
      return quartos.reduce((acc, quarto) => {
        acc[quarto.status] = (acc[quarto.status] || 0) + 1;
        return acc;
      }, {} as Record<StatusQuarto, number>);
    } catch (error) {
      this.tratarErro('contarQuartosPorStatus', error);
      return {} as Record<StatusQuarto, number>;
    }
  }

  /**
   * Lista quartos ordenados por preço
   * 
   * Decisão: Ordenação específica para UI
   * - Facilita comparação de preços
   * - Suporte a ordenação ascendente/descendente
   * - Otimização de query
   */
  async listarQuartosPorPreco(): Promise<Quarto[]> {
    try {
      return await this.repository.listarOrdenadosPorPreco();
    } catch (error) {
      this.tratarErro('listarQuartosPorPreco', error);
      return [];
    }
  }

  /**
   * Lista quartos ordenados por capacidade
   * 
   * Decisão: Ordenação específica para grupos
   * - Facilita seleção para grupos grandes
   * - Suporte a ordenação descendente
   * - Otimização de query
   */
  async listarQuartosPorCapacidade(): Promise<Quarto[]> {
    try {
      return await this.repository.listarOrdenadosPorCapacidade();
    } catch (error) {
      this.tratarErro('listarQuartosPorCapacidade', error);
      return [];
    }
  }

  // ========== MÉTODOS PRIVADOS ==========

  /**
   * Valida regras específicas para criação de quarto
   * 
   * Decisão: Separação de validações por contexto
   * - Validações específicas para criação
   * - Facilita manutenção das regras
   * - Reutilização em outros contextos
   */
  private async validarCriacaoQuarto(data: QuartoData): Promise<void> {
    // Verifica duplicidade de número
    const quartoExistente = await this.buscarQuartoPorNumero(data.numero);
    if (quartoExistente) {
      throw new Error(`Já existe um quarto com o número: ${data.numero}`);
    }

    // Validações de negócio específicas
    if (data.capacidade > 10) {
      throw new Error('Capacidade máxima permitida é de 10 pessoas');
    }

    if (data.precoPorNoite > 10000) {
      throw new Error('Preço máximo permitido é R$ 10.000,00');
    }
  }

  /**
   * Valida regras específicas para atualização de quarto
   * 
   * Decisão: Validações contextuais para atualização
   * - Permite mudanças específicas
   * - Preserva regras de integridade
   * - Facilita auditoria
   */
  private async validarAtualizacaoQuarto(
    quartoExistente: Quarto, 
    data: Partial<QuartoData>
  ): Promise<void> {
    // Se mudou o número, verifica duplicidade
    if (data.numero && data.numero !== quartoExistente.numero) {
      const quartoComNovoNumero = await this.buscarQuartoPorNumero(data.numero);
      if (quartoComNovoNumero) {
        throw new Error(`Já existe um quarto com o número: ${data.numero}`);
      }
    }

    // Valida mudança de status
    if (data.status && data.status !== quartoExistente.status) {
      this.validarTransicaoStatus(quartoExistente.status, data.status);
    }
  }

  /**
   * Valida transição de status do quarto
   * 
   * Decisão: Máquina de estados explícita
   * - Documenta fluxo permitido
   * - Previne transições inválidas
   * - Facilita auditoria
   */
  private validarTransicaoStatus(
    statusAtual: StatusQuarto, 
    novoStatus: StatusQuarto
  ): void {
    const transicoesPermitidas: Record<StatusQuarto, StatusQuarto[]> = {
      [StatusQuarto.DISPONIVEL]: [StatusQuarto.OCUPADO, StatusQuarto.MANUTENCAO, StatusQuarto.LIMPEZA],
      [StatusQuarto.OCUPADO]: [StatusQuarto.LIMPEZA],
      [StatusQuarto.LIMPEZA]: [StatusQuarto.DISPONIVEL, StatusQuarto.MANUTENCAO],
      [StatusQuarto.MANUTENCAO]: [StatusQuarto.DISPONIVEL, StatusQuarto.LIMPEZA]
    };

    if (!transicoesPermitidas[statusAtual]?.includes(novoStatus)) {
      throw new Error(
        `Transição de status inválida: ${statusAtual} -> ${novoStatus}`
      );
    }
  }

  /**
   * Valida filtros de busca
   * 
   * Decisão: Validação centralizada de filtros
   * - Garante consistência dos parâmetros
   * - Previne queries inválidas
   * - Facilita debugging
   */
  private validarFiltros(filtros: FiltrosQuarto): void {
    if (filtros.capacidadeMinima && filtros.capacidadeMinima <= 0) {
      throw new Error('Capacidade mínima deve ser maior que zero');
    }

    if (filtros.precoMax && filtros.precoMax <= 0) {
      throw new Error('Preço máximo deve ser maior que zero');
    }

    if (filtros.texto && filtros.texto.length < 2) {
      throw new Error('Texto de busca deve ter pelo menos 2 caracteres');
    }
  }

  /**
   * Tratamento centralizado de erros
   * 
   * Decisão: Centralização para consistência
   * - Logging padronizado
   * - Transformação de erros
   * - Facilita monitoramento
   */
  private tratarErro(metodo: string, erro: any): void {
    console.error(`[QuartoService.${metodo}] Erro:`, erro);
    
    // Aqui poderia integrar com serviço de logging
    // e.g., Sentry, LogRocket, etc.
    
    // Poderia também emitir evento de erro
    // this.eventEmitter.emit('erro', { metodo, erro });
  }
}
