/**
 * Entidade Quarto - Representa um quarto do hotel
 * 
 * Princípios SOLID aplicados:
 * - Single Responsibility: Esta classe é responsável apenas por representar um quarto
 * - Open/Closed: Aberta para extensão (novas propriedades), fechada para modificação
 * - Liskov Substitution: Pode ser substituída por qualquer subclasse de Quarto
 * - Interface Segregation: Interface focada apenas em comportamentos de quarto
 * - Dependency Inversion: Depende de abstrações (interfaces), não de implementações
 * 
 * Clean Code aplicados:
 * - Nomes descritivos e autoexplicativos
 * - Métodos pequenos com única responsabilidade
 * - Comentários explicando o "porquê", não o "o quê"
 * - Validações centralizadas
 * - Imutabilidade onde aplicável
 */

import { TipoQuarto, StatusQuarto } from '../enums';
import { Cama } from './Cama';

/**
 * Interface que define o contrato de um quarto
 * Segue o Princípio da Segregação de Interface (ISP)
 * - Apenas métodos essenciais para um quarto
 * - Clientes dependem apenas do que usam
 */
export interface IQuarto {
  readonly id: string;
  readonly numero: string;
  readonly capacidade: number;
  readonly tipo: TipoQuarto;
  readonly precoPorNoite: number;
  readonly hasMinibar: boolean;
  readonly hasCafeDaManha: boolean;
  readonly hasArCondicionado: boolean;
  readonly hasTV: boolean;
  readonly status: StatusQuarto;
  readonly camas: readonly Cama[];
  
  // Métodos de negócio - Princípio da Responsabilidade Única (SRP)
  getCapacidadeTotal(): number;
  getComodidades(): string[];
  getDescricaoCamas(): string;
  isDisponivel(): boolean;
  podeSerOcupado(): boolean;
  podeSerDeletado(): boolean;
}

/**
 * Classe concreta que implementa a interface IQuarto
 * 
 * Decisões de implementação:
 * 1. Propriedades readonly para garantir imutabilidade
 *    - Previne mutações acidentais
 *    - Facilita debugging e testes
 *    - Melhora performance em React (evita re-renders desnecessários)
 * 
 * 2. Validação no construtor
 *    - Garante consistência desde a criação
 *    - Evita objetos em estado inválido
 *    - Centraliza regras de negócio
 * 
 * 3. Métodos de negócio na entidade
 *    - Lógica próxima dos dados que manipula
 *    - Facilita reutilização e testes
 *    - Segue o padrão Domain-Driven Design
 */
export class Quarto implements IQuarto {
  // Propriedades readonly para imutabilidade
  // Segue o princípio de "tell, don't ask"
  public readonly id: string;
  public readonly numero: string;
  public readonly capacidade: number;
  public readonly tipo: TipoQuarto;
  public readonly precoPorNoite: number;
  public readonly hasMinibar: boolean;
  public readonly hasCafeDaManha: boolean;
  public readonly hasArCondicionado: boolean;
  public readonly hasTV: boolean;
  public readonly status: StatusQuarto;
  public readonly camas: readonly Cama[];

  constructor(data: IQuarto) {
    // Validações centralizadas no construtor
    // Garante que o objeto nunca esteja em estado inválido
    this.validarDadosObrigatorios(data);
    this.validarConsistenciaDados(data);

    // Atribuição após validação
    this.id = data.id;
    this.numero = data.numero;
    this.capacidade = data.capacidade;
    this.tipo = data.tipo;
    this.precoPorNoite = data.precoPorNoite;
    this.hasMinibar = data.hasMinibar;
    this.hasCafeDaManha = data.hasCafeDaManha;
    this.hasArCondicionado = data.hasArCondicionado;
    this.hasTV = data.hasTV;
    this.status = data.status;
    this.camas = data.camas;
  }

  /**
   * Factory method para criação de quartos
   * 
   * Decisão: Factory method em vez de construtor direto
   * - Encapsula lógica de criação complexa
   * - Facilita testes (mock do factory)
   * - Permite validações pré-criação
   * - Retorna objeto sempre válido
   */
  static criar(data: Omit<IQuarto, 'id'>): Quarto {
    // Gera ID único se não fornecido
    const id = data.id || this.gerarId();
    
    return new Quarto({
      ...data,
      id,
      status: data.status || StatusQuarto.DISPONIVEL
    });
  }

  /**
   * Factory method para criação a partir de dados brutos (API, formulário)
   * 
   * Decisão: Método específico para conversão de dados externos
   * - Isola lógica de transformação
   * - Facilita manutenção quando API muda
   * - Centraliza validações de entrada
   */
  static fromRawData(data: any): Quarto {
    // Validação e sanitização dos dados brutos
    const dadosSanitizados = this.sanitizarDadosBrutos(data);
    
    return this.criar(dadosSanitizados);
  }

  // ========== MÉTODOS DE NEGÓCIO ==========

  /**
   * Calcula capacidade total baseada nas camas
   * 
   * Decisão: Método na entidade em vez de serviço externo
   * - Lógica próxima dos dados que manipula
   * - Facilita testes unitários
   * - Reutilização em diferentes contextos
   */
  getCapacidadeTotal(): number {
    return this.camas.reduce((total, cama) => total + cama.getCapacidade(), 0);
  }

  /**
   * Retorna lista de comodidades do quarto
   * 
   * Decisão: Método que deriva informação das propriedades
   * - Evita armazenamento redundante
   * - Garante consistência dos dados
   * - Facilita adição de novas comodidades
   */
  getComodidades(): string[] {
    const comodidades: string[] = [];
    
    if (this.hasMinibar) comodidades.push('Frigobar');
    if (this.hasCafeDaManha) comodidades.push('Café da Manhã');
    if (this.hasArCondicionado) comodidades.push('Ar-Condicionado');
    if (this.hasTV) comodidades.push('TV');
    
    return comodidades;
  }

  /**
   * Retorna descrição formatada das camas
   * 
   * Decisão: Método de formatação na entidade
   * - Centraliza lógica de exibição
   * - Facilita internacionalização futura
   * - Evita lógica de apresentação no frontend
   */
  getDescricaoCamas(): string {
    if (this.camas.length === 0) return 'Nenhuma cama';
    
    // Agrupa camas por tipo para exibição compacta
    const agrupado = this.camas.reduce((acc, cama) => {
      acc[cama.tipo] = (acc[cama.tipo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(agrupado)
      .map(([tipo, quantidade]) => 
        quantidade > 1 ? `${quantidade}x ${tipo}` : tipo
      )
      .join(', ');
  }

  /**
   * Verifica se quarto está disponível
   * 
   * Decisão: Método de verificação de estado
   * - Encapsula lógica de negócio
   * - Facilita mudanças nas regras de disponibilidade
   * - Reutilizável em diferentes partes do sistema
   */
  isDisponivel(): boolean {
    return this.status === StatusQuarto.DISPONIVEL;
  }

  /**
   * Verifica se quarto pode ser ocupado
   * 
   * Decisão: Método com regras de negócio específicas
   * - Centraliza validações complexas
   * - Facilita manutenção das regras
   * - Documenta implicitamente o fluxo de negócio
   */
  podeSerOcupado(): boolean {
    return this.isDisponivel() && 
           this.getCapacidadeTotal() > 0 && 
           this.camas.length > 0;
  }

  /**
   * Verifica se quarto pode ser deletado
   * 
   * Decisão: Método com regras de deleção
   * - Prevenção de deleção indevida
   * - Preservação de integridade de dados
   - Facilita auditoria
   */
  podeSerDeletado(): boolean {
    return this.status !== StatusQuarto.OCUPADO;
  }

  // ========== MÉTODOS DE TRANSFORMAÇÃO ==========

  /**
   * Converte para formato JSON (serialização)
   * 
   * Decisão: Método de serialização customizado
   * - Controle sobre o que é serializado
   * - Formatação específica para API
   * - Evita exposição de dados sensíveis
   */
  toJSON(): any {
    return {
      id: this.id,
      numero: this.numero,
      capacidade: this.capacidade,
      tipo: this.tipo,
      precoPorNoite: this.precoPorNoite,
      hasMinibar: this.hasMinibar,
      hasCafeDaManha: this.hasCafeDaManha,
      hasArCondicionado: this.hasArCondicionado,
      hasTV: this.hasTV,
      status: this.status,
      camas: this.camas.map(cama => cama.toJSON()),
      // Campos derivados para facilitar consumo no frontend
      capacidadeTotal: this.getCapacidadeTotal(),
      comodidades: this.getComodidades(),
      descricaoCamas: this.getDescricaoCamas(),
      disponivel: this.isDisponivel()
    };
  }

  /**
   * Cria uma cópia do quarto com novas propriedades
   * 
   * Decisão: Imutabilidade com cópia estrutural
   * - Evita mutação do objeto original
   * - Facilita uso em React (estado imutável)
   * - Permite "undo" de operações
   */
  copiarCom(modificacoes: Partial<IQuarto>): Quarto {
    return new Quarto({
      ...this.toJSON(),
      ...modificacoes
    });
  }

  // ========== MÉTODOS PRIVADOS ==========

  /**
   * Valida dados obrigatórios do quarto
   * 
   * Decisão: Validações centralizadas e específicas
   * - Mensagens de erro claras
   * - Validação precoce (fail fast)
   * - Facilita debugging
   */
  private validarDadosObrigatorios(data: IQuarto): void {
    const erros: string[] = [];

    if (!data.numero?.trim()) {
      erros.push('Número do quarto é obrigatório');
    }

    if (!data.capacidade || data.capacidade <= 0) {
      erros.push('Capacidade deve ser maior que zero');
    }

    if (!data.tipo) {
      erros.push('Tipo do quarto é obrigatório');
    }

    if (!data.precoPorNoite || data.precoPorNoite <= 0) {
      erros.push('Preço por noite deve ser maior que zero');
    }

    if (!data.status) {
      erros.push('Status do quarto é obrigatório');
    }

    if (!data.camas || data.camas.length === 0) {
      erros.push('Quarto deve ter pelo menos uma cama');
    }

    if (erros.length > 0) {
      throw new Error(`Erros de validação: ${erros.join(', ')}`);
    }
  }

  /**
   * Valida consistência entre os dados
   * 
   * Decisão: Validações de regras de negócio
   * - Garante integridade dos dados
   * - Prevenção de estados inconsistentes
   * - Documentação implícita das regras
   */
  private validarConsistenciaDados(data: IQuarto): void {
    // Valida consistência entre capacidade informada e camas
    const capacidadeCalculada = data.camas.reduce((total, cama) => 
      total + cama.getCapacidade(), 0);

    if (capacidadeCalculada !== data.capacidade) {
      throw new Error(
        `Capacidade informada (${data.capacidade}) não corresponde à capacidade das camas (${capacidadeCalculada})`
      );
    }

    // Valida formato do número do quarto
    if (!/^[A-Z0-9]{1,10}$/i.test(data.numero)) {
      throw new Error('Número do quarto deve conter apenas letras e números, máximo 10 caracteres');
    }
  }

  /**
   * Gera ID único para o quarto
   * 
   * Decisão: Método estático para geração de ID
   - Centraliza lógica de geração
   - Facilita mudança de estratégia (UUID, timestamp, etc.)
   - Isola dependência de bibliotecas externas
   */
  private static gerarId(): string {
    return `quarto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sanitiza dados brutos de fontes externas
   * 
   * Decisão: Método de sanitização centralizado
   - Prevenção de injection attacks
   - Normalização de dados
   - Validação de tipos
   */
  private static sanitizarDadosBrutos(data: any): Omit<IQuarto, 'id'> {
    return {
      numero: String(data.numero || '').trim(),
      capacidade: parseInt(data.capacidade) || 1,
      tipo: data.tipo || TipoQuarto.BASICO,
      precoPorNoite: parseFloat(data.precoPorNoite) || 0,
      hasMinibar: Boolean(data.hasMinibar),
      hasCafeDaManha: Boolean(data.hasCafeDaManha),
      hasArCondicionado: Boolean(data.hasArCondicionado),
      hasTV: Boolean(data.hasTV),
      status: data.status || StatusQuarto.DISPONIVEL,
      camas: Array.isArray(data.camas) ? data.camas.map(Cama.fromRawData) : []
    };
  }
}

// Exporta tipo para uso em outros componentes
export type QuartoData = Omit<IQuarto, 'id'>;
