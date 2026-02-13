/**
 * Interface Genérica de Emissor de Eventos
 * 
 * Princípios SOLID aplicados:
 * - Single Responsibility: Responsável apenas pela emissão de eventos
 * - Open/Closed: Aberta para novos tipos de eventos, fechada para modificação
 * - Liskov Substitution: Qualquer implementação pode substituir outra
 * - Interface Segregation: Métodos essenciais apenas para eventos
 * - Dependency Inversion: Serviços dependem desta abstração
 * 
 * Clean Code aplicados:
 * - Generics para type safety
 * - Nomes descritivos e curtos
 * - Métodos simples e focados
 * - Documentação clara de intenções
 */

/**
 * Interface genérica para emissão de eventos
 * 
 * Decisões de design:
 * 1. Uso de generics para type safety
 *    - Compile-time checking dos tipos de eventos
 *    - Autocompletion em IDEs
 *    - Prevenção de erros de runtime
 * 
 * 2. Interface simples e focada
 *    - Apenas métodos essenciais para eventos
 *    - Facilita implementação
 *    - Segue o princípio KISS (Keep It Simple, Stupid)
 * 
 * 3. Flexibilidade para diferentes tipos de eventos
 *    - Suporte a qualquer estrutura de evento
 *    - Extensível para novos domínios
 *    - Desacoplamento entre emitter e listeners
 * 
 * 4. Métodos assíncronos
 *    - Suporte a operações não bloqueantes
 *    - Compatibilidade com frontend moderno
 *    - Performance otimizada
 */
export interface IEventEmitter<T extends Record<string, any>> {
  /**
   * Registra um listener para um evento específico
   * 
   * @param evento - Nome do evento a ser escutado
   * @param listener - Função callback para o evento
   * @returns Function - Função para remover o listener
   * 
   * Decisão: Retorna função de unsubscribe
   * - Facilita cleanup de listeners
   * - Prevenção de memory leaks
   * - Padrão de cancelamento padrão
   * 
   * Exemplo:
   * ```typescript
   * const unsubscribe = emitter.on('quartoCriado', (quarto) => {
   *   console.log('Quarto criado:', quarto);
   * });
   * 
   * // Quando não precisar mais escutar
   * unsubscribe();
   * ```
   */
  on<K extends keyof T>(
    evento: K,
    listener: (...args: T[K]) => void
  ): () => void;

  /**
   * Registra um listener que será executado apenas uma vez
   * 
   * @param evento - Nome do evento a ser escutado
   * @param listener - Função callback para o evento
   * @returns Function - Função para remover o listener (se ainda não executado)
   * 
   * Decisão: Listener único para eventos pontuais
   * - Facilita operações one-time
   * - Auto-cleanup após execução
   * - Prevenção de múltiplas execuções
   * 
   * Exemplo:
   * ```typescript
   * emitter.once('sistemaInicializado', () => {
   *   console.log('Sistema pronto para uso');
   * });
   * ```
   */
  once<K extends keyof T>(
    evento: K,
    listener: (...args: T[K]) => void
   ): () => void;

  /**
   * Emite um evento para todos os listeners registrados
   * 
   * @param evento - Nome do evento a ser emitido
   * @param args - Argumentos do evento
   * @returns Promise<void> - Promise que resolve quando todos listeners executarem
   * 
   * Decisão: Método assíncrono com Promise
   * - Suporte a listeners assíncronos
   * - Controle de conclusão de todos os handlers
   * - Facilita testes com async/await
   * 
   * Exemplo:
   * ```typescript
   * await emitter.emit('quartoAtualizado', quarto, dadosAnteriores);
   * console.log('Todos os listeners executaram');
   * ```
   */
  emit<K extends keyof T>(evento: K, ...args: T[K]): Promise<void>;

  /**
   * Remove todos os listeners de um evento específico
   * 
   * @param evento - Nome do evento para limpar listeners
   * 
   * Decisão: Limpeza em lote
   * - Facilita cleanup de múltiplos listeners
   * - Prevenção de memory leaks
   * - Reset de estado do emitter
   * 
   * Exemplo:
   * ```typescript
   * emitter.removeAllListeners('quartoAtualizado');
   * // Todos os listeners de 'quartoAtualizado' foram removidos
   * ```
   */
  removeAllListeners<K extends keyof T>(evento?: K): void;

  /**
   * Retorna a quantidade de listeners registrados para um evento
   * 
   * @param evento - Nome do evento (opcional)
   * @returns number - Quantidade de listeners
   * 
   * Decisão: Método para debugging e monitoramento
   * - Facilita identificação de memory leaks
   * - Suporte a monitoramento de performance
   * - Ajuda em debugging de eventos
   * 
   * Exemplo:
   * ```typescript
   * const totalListeners = emitter.listenerCount();
   * const quartoListeners = emitter.listenerCount('quartoCriado');
   * console.log(`Total: ${totalListeners}, Quarto: ${quartoListeners}`);
   * ```
   */
  listenerCount<K extends keyof T>(evento?: K): number;

  /**
   * Retorna nomes de todos os eventos com listeners registrados
   * 
   * @returns string[] - Array com nomes dos eventos
   * 
   * Decisão: Método para inspeção do estado
   * - Facilita debugging
   * - Suporte a monitoramento
   * - Ajuda na identificação de eventos ativos
   */
  eventNames(): (keyof T)[];
}

/**
 * Tipo para representar um listener de evento
 * 
 * Decisão: Tipo auxiliar para melhor legibilidade
 * - Facilita tipagem de variáveis
 * - Reutilização em diferentes contextos
 * - Documentação via tipo
 */
export type EventListener<T> = (...args: any[]) => void;

/**
 * Tipo para representar opções de configuração do emitter
 * 
 * Decisão: Configuração flexível do emitter
 * - Suporte a diferentes comportamentos
 * - Configuração centralizada
 * - Facilita extensão
 */
export interface EventEmitterConfig {
  /**
   * Número máximo de listeners por evento
   * Default: 10
   * 
   * Decisão: Limite para prevenir memory leaks
   * - Prevenção de acúmulo excessivo
   * - Alerta para problemas de design
   * - Configurável por necessidade
   */
  maxListeners?: number;

  /**
   * Captura de erros em listeners
   * Default: false
   * 
   * Decisão: Tratamento de erros isolado
   * - Prevenção de quebra de cadeia de eventos
   * - Facilita debugging
   * - Opção para modo de desenvolvimento
   */
  captureErrors?: boolean;

  /**
   * Modo de debug para logging
   * Default: false
   * 
   * Decisão: Logging para desenvolvimento
   * - Facilita debugging de eventos
   * - Registro de emissões e execuções
   * - Desabilitável em produção
   */
  debug?: boolean;
}

/**
 * Interface para implementações de EventEmitter
 * 
 * Decisão: Interface extendida para implementações específicas
 * - Adição de métodos de configuração
 * - Suporte a diferentes estratégias
   * - Facilita testes com mocks
 */
export interface IEventEmitterImplementation<T extends Record<string, any>> 
  extends IEventEmitter<T> {
  
  /**
   * Configura o emitter com opções específicas
   * 
   * @param config - Opções de configuração
   * 
   * Decisão: Método de configuração pós-criação
   * - Facilita ajustes dinâmicos
   * - Suporte a diferentes ambientes
   * - Configuração centralizada
   */
  configure(config: EventEmitterConfig): void;

  /**
   * Retorna configuração atual do emitter
   * 
   * @returns EventEmitterConfig - Configuração atual
   * 
   * Decisão: Método para inspeção de configuração
   * - Facilita debugging
   * - Suporte a testes
   * - Verificação de estado
   */
  getConfig(): EventEmitterConfig;

  /**
   * Reseta o emitter para estado inicial
   * 
   * Decisão: Método para reset completo
   * - Facilita testes isolados
   * - Cleanup de estado
   * - Prevenção de contaminação entre testes
   */
  reset(): void;
}

/**
 * Tipo para eventos de domínio genéricos
 * 
 * Decisão: Eventos comuns para diferentes domínios
 * - Padronização de eventos básicos
 * - Facilita implementação de handlers genéricos
 * - Consistência entre diferentes módulos
 */
export interface DominioEvents {
  criado: (entidade: any) => void;
  atualizado: (entidade: any, dadosAnteriores?: any) => void;
  deletado: (id: string) => void;
  erro: (erro: Error, contexto?: string) => void;
}

/**
 * Utilitário para criação de typed event emitters
 * 
 * Decisão: Factory function para facilitar criação
 * - Type safety garantida
 * - Facilita instanciação
 * - Padronização de criação
 */
export function createEventEmitter<T extends Record<string, any>>(
  config?: EventEmitterConfig
): IEventEmitter<T> {
  // Implementação seria fornecida por uma classe concreta
  // Esta é apenas a definição da factory function
  throw new Error('Implementação não fornecida - use uma implementação concreta');
}
