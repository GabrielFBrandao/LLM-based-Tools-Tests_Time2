import { TipoQuarto, StatusQuarto } from '../enums';
import { Cama } from './Cama';
import { Periodo } from '../value-objects/Periodo';

// Entidade: Quarto
export class Quarto {
  constructor(
    public readonly id: string,
    public readonly numero: string,
    public readonly capacidade: number,
    public readonly tipo: TipoQuarto,
    public readonly precoPorNoite: number,
    public readonly hasMinibar: boolean = false,
    public readonly hasCafeDaManha: boolean = false,
    public readonly hasArCondicionado: boolean = false,
    public readonly hasTV: boolean = false,
    public readonly camas: Cama[] = [],
    public readonly status: StatusQuarto = StatusQuarto.DISPONIVEL
  ) {
    this.validar();
  }

  // Validações do quarto
  private validar(): void {
    if (!this.numero || this.numero.trim().length === 0) {
      throw new Error('Número do quarto é obrigatório');
    }

    if (this.capacidade <= 0) {
      throw new Error('Capacidade deve ser maior que zero');
    }

    if (this.precoPorNoite <= 0) {
      throw new Error('Preço por noite deve ser maior que zero');
    }

    if (this.camas.length === 0) {
      throw new Error('Quarto deve ter pelo menos uma cama');
    }

    // Verifica se a capacidade das camas corresponde à capacidade do quarto
    const capacidadeCamas = this.camas.reduce((total, cama) => total + cama.getCapacidade(), 0);
    if (capacidadeCamas !== this.capacidade) {
      throw new Error(`Capacidade das camas (${capacidadeCamas}) não corresponde à capacidade do quarto (${this.capacidade})`);
    }
  }

  // Adiciona uma cama ao quarto
  adicionarCama(tipo: any): Quarto {
    const novaCama = Cama.criar(tipo, this.id);
    const novasCamas = [...this.camas, novaCama];
    
    return new Quarto(
      this.id,
      this.numero,
      this.capacidade + novaCama.getCapacidade(),
      this.tipo,
      this.precoPorNoite,
      this.hasMinibar,
      this.hasCafeDaManha,
      this.hasArCondicionado,
      this.hasTV,
      novasCamas,
      this.status
    );
  }

  // Remove uma cama do quarto
  removerCama(camaId: string): Quarto {
    const camaIndex = this.camas.findIndex(c => c.id === camaId);
    if (camaIndex === -1) {
      throw new Error('Cama não encontrada');
    }

    const camaRemovida = this.camas[camaIndex];
    const novasCamas = this.camas.filter(c => c.id !== camaId);
    
    return new Quarto(
      this.id,
      this.numero,
      this.capacidade - camaRemovida.getCapacidade(),
      this.tipo,
      this.precoPorNoite,
      this.hasMinibar,
      this.hasCafeDaManha,
      this.hasArCondicionado,
      this.hasTV,
      novasCamas,
      this.status
    );
  }

  // Verifica se o quarto está disponível para um período
  estaDisponivel(periodo: Periodo): boolean {
    return this.status === StatusQuarto.DISPONIVEL;
  }

  // Atualiza o status do quarto
  atualizarStatus(novoStatus: StatusQuarto): Quarto {
    return new Quarto(
      this.id,
      this.numero,
      this.capacidade,
      this.tipo,
      this.precoPorNoite,
      this.hasMinibar,
      this.hasCafeDaManha,
      this.hasArCondicionado,
      this.hasTV,
      this.camas,
      novoStatus
    );
  }

  // Verifica se o quarto está ocupado
  estaOcupado(): boolean {
    return this.status === StatusQuarto.OCUPADO;
  }

  // Verifica se o quarto está em manutenção
  estaEmManutencao(): boolean {
    return this.status === StatusQuarto.MANUTENCAO;
  }

  // Verifica se o quarto está em limpeza
  estaEmLimpeza(): boolean {
    return this.status === StatusQuarto.LIMPEZA;
  }

  // Retorna descrição formatada do tipo
  getTipoDescricao(): string {
    const descricoes = {
      [TipoQuarto.BASICO]: 'Básico',
      [TipoQuarto.MODERNO]: 'Moderno',
      [TipoQuarto.LUXO]: 'Luxo'
    };

    return descricoes[this.tipo];
  }

  // Retorna descrição formatada do status
  getStatusDescricao(): string {
    const descricoes = {
      [StatusQuarto.DISPONIVEL]: 'Disponível',
      [StatusQuarto.OCUPADO]: 'Ocupado',
      [StatusQuarto.MANUTENCAO]: 'Em Manutenção',
      [StatusQuarto.LIMPEZA]: 'Em Limpeza'
    };

    return descricoes[this.status];
  }

  // Calcula o preço total para um período
  calcularPrecoTotal(periodo: Periodo): number {
    const numeroNoites = periodo.getNumeroNoites();
    let total = this.precoPorNoite * numeroNoites;

    // Adiciona custo do café da manhã se aplicável
    if (this.hasCafeDaManha) {
      total += 50 * numeroNoites; // R$ 50 por noite de café da manhã
    }

    return total;
  }

  // Lista todas as comodidades
  getComodidades(): string[] {
    const comodidades = [];
    
    if (this.hasMinibar) comodidades.push('Frigobar');
    if (this.hasCafeDaManha) comodidades.push('Café da Manhã');
    if (this.hasArCondicionado) comodidades.push('Ar-Condicionado');
    if (this.hasTV) comodidades.push('TV');

    return comodidades;
  }

  // Formata o preço para exibição
  getPrecoFormatado(): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(this.precoPorNoite);
  }

  // Cria um novo quarto
  static criar(
    numero: string,
    capacidade: number,
    tipo: TipoQuarto,
    precoPorNoite: number,
    hasMinibar: boolean = false,
    hasCafeDaManha: boolean = false,
    hasArCondicionado: boolean = false,
    hasTV: boolean = false
  ): Quarto {
    return new Quarto(
      this.gerarId(),
      numero,
      capacidade,
      tipo,
      precoPorNoite,
      hasMinibar,
      hasCafeDaManha,
      hasArCondicionado,
      hasTV,
      []
    );
  }

  // Gera ID único
  private static gerarId(): string {
    return `quarto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Converte para objeto JSON
  toJSON() {
    return {
      id: this.id,
      numero: this.numero,
      capacidade: this.capacidade,
      tipo: this.tipo,
      tipoDescricao: this.getTipoDescricao(),
      precoPorNoite: this.precoPorNoite,
      precoFormatado: this.getPrecoFormatado(),
      hasMinibar: this.hasMinibar,
      hasCafeDaManha: this.hasCafeDaManha,
      hasArCondicionado: this.hasArCondicionado,
      hasTV: this.hasTV,
      camas: this.camas.map(c => c.toJSON()),
      status: this.status,
      statusDescricao: this.getStatusDescricao(),
      comodidades: this.getComodidades()
    };
  }

  // Cria instância a partir de objeto JSON
  static fromJSON(dados: any): Quarto {
    const camas = dados.camas ? dados.camas.map((c: any) => Cama.fromJSON(c)) : [];
    
    return new Quarto(
      dados.id,
      dados.numero,
      dados.capacidade,
      dados.tipo,
      dados.precoPorNoite,
      dados.hasMinibar,
      dados.hasCafeDaManha,
      dados.hasArCondicionado,
      dados.hasTV,
      camas,
      dados.status
    );
  }

  // Verifica se o quarto é igual a outro
  equals(outra: Quarto): boolean {
    return this.id === outra.id;
  }

  // Validação completa
  ehValido(): boolean {
    try {
      this.validar();
      return true;
    } catch {
      return false;
    }
  }
}
