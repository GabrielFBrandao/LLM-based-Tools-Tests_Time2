/**
 * Interface do Repositório de Quartos
 * 
 * Princípios SOLID aplicados:
 * - Single Responsibility: Responsável apenas pela persistência de quartos
 * - Open/Closed: Aberta para extensão (novos métodos), fechada para modificação
 * - Liskov Substitution: Qualquer implementação pode substituir outra
 * - Interface Segregation: Métodos específicos para operações de quartos
 * - Dependency Inversion: Serviços dependem desta abstração, não da implementação
 * 
 * Clean Code aplicados:
 * - Nomes de métodos autoexplicativos
 * - Assinaturas claras e consistentes
 * - Documentação de intenções
 * - Separação de responsabilidades
 */

import { Quarto, IQuarto, QuartoData } from '../entities/Quarto';
import { TipoQuarto, StatusQuarto } from '../../enums';

/**
 * Interface que define o contrato do repositório de quartos
 * 
 * Decisões de design:
 * 1. Interface pura sem dependências externas
 *    - Facilita testes com mocks
 *    - Desacopla de tecnologia específica
 *    - Permite múltiplas implementações
 * 
 * 2. Métodos assíncronos
 *    - Suporte a operações I/O (database, API)
 *    - Non-blocking operations
 *    - Compatibilidade com frontend moderno
 * 
 * 3. Tipagem forte com TypeScript
 *    - Compile-time safety
 *    - Autocompletion em IDEs
 *    - Documentação via tipos
 * 
 * 4. Nomes descritivos que indicam intenção
 *    - Facilita leitura e manutenção
 *    - Reduz necessidade de documentação
 *    - Autoexplicativo
 */
export interface IQuartoRepository {
  // ========== OPERAÇÕES BÁSICAS ==========

  /**
   * Salva um novo quarto no repositório
   * 
   * @param quarto - Instância do quarto a ser salva
   * @returns Promise<Quarto> - Quarto salvo com ID gerado
   * 
   * Decisão: Método separado para criação
   * - Clareza de intenção
   * - Permite validações específicas
   * - Facilita auditoria de criação
   */
  salvar(quarto: Quarto): Promise<Quarto>;

  /**
   * Atualiza um quarto existente
   * 
   * @param id - Identificador único do quarto
   * @param quarto - Dados atualizados do quarto
   * @returns Promise<Quarto> - Quarto atualizado
   * 
   * Decisão: ID separado dos dados
   * - Prevenção de mudança acidental de ID
   * - Clareza na assinatura
   * - Segurança contra ataques
   */
  atualizar(id: string, quarto: Quarto): Promise<Quarto>;

  /**
   * Busca quarto por identificador único
   * 
   * @param id - ID do quarto a ser buscado
   * @returns Promise<Quarto | null> - Quarto encontrado ou null
   * 
   * Decisão: Retorna null se não encontrado
   * - Padrão TypeScript para opcionalidade
   * - Facilita composição de operações
   * - Evita exceções para casos esperados
   */
  buscarPorId(id: string): Promise<Quarto | null>;

  /**
   * Busca quarto pelo número único
   * 
   * @param numero - Número do quarto a ser buscado
   * @returns Promise<Quarto | null> - Quarto encontrado ou null
   * 
   * Decisão: Método específico para número
   * - Otimização para busca por campo único
   * - Facilita validação de duplicidade
   * - Suporte a lookup rápido
   */
  buscarPorNumero(numero: string): Promise<Quarto | null>;

  /**
   * Lista todos os quartos do repositório
   * 
   * @returns Promise<Quarto[]> - Lista de todos os quartos
   * 
   * Decisão: Método simples sem paginação aqui
   * - Paginação delegada para implementação
   * - Facilita testes unitários
   * - Flexibilidade para diferentes estratégias
   */
  listarTodos(): Promise<Quarto[]>;

  /**
   * Remove um quarto do repositório
   * 
   * @param id - ID do quarto a ser removido
   * @returns Promise<void> - Operação sem retorno
   * 
   * Decisão: Soft delete recomendado na implementação
   * - Preservação de dados históricos
   * - Possibilidade de recuperação
   * - Auditoria de deleções
   */
  deletar(id: string): Promise<void>;

  // ========== OPERAÇÕES DE BUSCA ESPECÍFICA ==========

  /**
   * Busca quartos por tipo específico
   * 
   * @param tipo - Tipo do quarto para filtragem
   * @returns Promise<Quarto[]> - Quartos do tipo especificado
   * 
   * Decisão: Método otimizado para tipo
   * - Facilita filtragem no frontend
   * - Otimização de query (índice)
   * - Cache recomendado
   */
  buscarPorTipo(tipo: TipoQuarto): Promise<Quarto[]>;

  /**
   * Busca quartos por status específico
   * 
   * @param status - Status do quarto para filtragem
   * @returns Promise<Quarto[]> - Quartos com o status especificado
   * 
   * Decisão: Método essencial para gestão
   * - Operação mais comum no sistema
   * - Otimização de query
   * - Suporte a real-time updates
   */
  buscarPorStatus(status: StatusQuarto): Promise<Quarto[]>;

  /**
   * Busca quartos com capacidade mínima
   * 
   * @param capacidade - Capacidade mínima desejada
   * @returns Promise<Quarto[]> - Quartos com capacidade >= informada
   * 
   * Decisão: Busca por capacidade numérica
   * - Facilita reservas para grupos
   * - Suporte a diferentes tamanhos
   * - Otimização range query
   */
  buscarPorCapacidadeMinima(capacidade: number): Promise<Quarto[]>;

  /**
   * Busca quartos dentro de uma faixa de preço
   * 
   * @param precoMin - Preço mínimo da faixa
   * @param precoMax - Preço máximo da faixa
   * @returns Promise<Quarto[]> - Quartos na faixa de preço
   * 
   * Decisão: Busca por range de preço
   * - Facilita filtragem por orçamento
   * - Validação de range (min <= max)
   * - Otimização para queries de preço
   */
  buscarPorFaixaPreco(precoMin: number, precoMax: number): Promise<Quarto[]>;

  /**
   * Busca quartos com múltiplos filtros
   * 
   * @param filtros - Objeto com filtros opcionais
   * @returns Promise<Quarto[]> - Quartos que correspondem aos filtros
   * 
   * Decisão: Interface flexível para filtros
   * - Suporte a combinações complexas
   * - Extensível para novos filtros
   * - Otimização dinâmica de queries
   */
  buscarComFiltros(filtros: {
    tipo?: TipoQuarto;
    status?: StatusQuarto;
    capacidadeMinima?: number;
    precoMax?: number;
    texto?: string;
  }): Promise<Quarto[]>;

  /**
   * Busca quartos por texto (número ou tipo)
   * 
   * @param texto - Texto para busca
   * @returns Promise<Quarto[]> - Quartos que correspondem ao texto
   * 
   * Decisão: Busca textual flexível
   * - Suporte a autocomplete
   * - Busca case-insensitive
   * - Sanitização contra injection
   */
  buscarPorTexto(texto: string): Promise<Quarto[]>;

  // ========== OPERAÇÕES DE ORDENAÇÃO ==========

  /**
   * Lista quartos ordenados por preço
   * 
   * @param ordem - 'asc' para ascendente, 'desc' para descendente
   * @returns Promise<Quarto[]> - Quartos ordenados por preço
   * 
   * Decisão: Ordenação específica para UI
   * - Facilita comparação de preços
   * - Suporte a ambas as direções
   * - Otimização de query com ORDER BY
   */
  listarOrdenadosPorPreco(ordem?: 'asc' | 'desc'): Promise<Quarto[]>;

  /**
   * Lista quartos ordenados por capacidade
   * 
   * @param ordem - 'asc' para ascendente, 'desc' para descendente
   * @returns Promise<Quarto[]> - Quartos ordenados por capacidade
   * 
   * Decisão: Ordenação para seleção de grupos
   * - Facilita escolha para grupos grandes
   * - Suporte a ambas as direções
   * - Otimização de query
   */
  listarOrdenadosPorCapacidade(ordem?: 'asc' | 'desc'): Promise<Quarto[]>;

  // ========== OPERAÇÕES DE VERIFICAÇÃO ==========

  /**
   * Verifica se existe quarto com o número informado
   * 
   * @param numero - Número do quarto a verificar
   * @returns Promise<boolean> - True se existe, false caso contrário
   * 
   * Decisão: Método de verificação otimizado
   * - Evita busca completa se só precisa de existência
   * - Otimização com EXISTS query
   * - Facilita validações
   */
  existePorNumero(numero: string): Promise<boolean>;

  /**
   * Verifica se existe quarto com o ID informado
   * 
   * @param id - ID do quarto a verificar
   * @returns Promise<boolean> - True se existe, false caso contrário
   * 
   * Decisão: Verificação por ID
   * - Validação rápida de existência
   * - Otimização de performance
   * - Suporte a validações em lote
   */
  existePorId(id: string): Promise<boolean>;

  // ========== OPERAÇÕES DE AGREGAÇÃO ==========

  /**
   * Conta quartos por status
   * 
   * @returns Promise<Record<StatusQuarto, number>> - Contagem por status
   * 
   * Decisão: Agregação para dashboard
   * - Otimização com GROUP BY query
   * - Cache recomendado
   * - Facilita visualizações
   */
  contarPorStatus(): Promise<Record<StatusQuarto, number>>;

  /**
   * Conta quartos por tipo
   * 
   * @returns Promise<Record<TipoQuarto, number>> - Contagem por tipo
   * 
   * Decisão: Agregação por tipo
   * - Análise de composição do hotel
   * - Suporte a relatórios
   * - Otimização de query
   */
  contarPorTipo(): Promise<Record<TipoQuarto, number>>;

  /**
   * Obtém estatísticas gerais dos quartos
   * 
   * @returns Promise<Object> - Objeto com estatísticas diversas
   * 
   * Decisão: Método agregado para dashboard
   * - Reduz número de chamadas à API
   * - Dados consolidados para UI
   * - Performance otimizada
   */
  obterEstatisticas(): Promise<{
    total: number;
    disponiveis: number;
    ocupados: number;
    manutencao: number;
    limpeza: number;
    precoMedio: number;
    capacidadeTotal: number;
  }>;
}

/**
 * Tipo para filtros de busca de quartos
 * 
 * Decisão: Tipo específico para filtros
 * - Type safety nos parâmetros
 * - Autocompletion em IDEs
 * - Documentação via tipo
 * - Extensibilidade para novos filtros
 */
export type FiltrosQuarto = {
  tipo?: TipoQuarto;
  status?: StatusQuarto;
  capacidadeMinima?: number;
  precoMax?: number;
  texto?: string;
};

/**
 * Tipo para opções de ordenação
 * 
 * Decisão: Tipo para padronizar ordenação
 * - Consistência entre métodos
 * - Type safety
 * - Facilita extensão
 */
export type OpcoesOrdenacao = {
  campo: 'preco' | 'capacidade' | 'numero' | 'tipo';
  direcao: 'asc' | 'desc';
};

/**
 * Tipo para paginação de resultados
 * 
 * Decisão: Tipo para paginação padronizada
 * - Controle de transferência de dados grandes
 * - Performance otimizada
 * - Experiência do usuário melhorada
 */
export type PaginacaoQuarto = {
  pagina: number;
  tamanho: number;
  total: number;
  dados: Quarto[];
};
