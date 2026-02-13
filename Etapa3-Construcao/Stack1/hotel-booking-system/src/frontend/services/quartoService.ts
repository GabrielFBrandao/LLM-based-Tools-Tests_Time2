import { Quarto, TipoQuarto, StatusQuarto, TipoCama } from '../domain';

// Interface para a API de quartos
export interface QuartoService {
  listar(): Promise<Quarto[]>;
  buscarPorId(id: string): Promise<Quarto | null>;
  criar(quarto: Omit<Quarto, 'id'>): Promise<Quarto>;
  atualizar(id: string, quarto: Partial<Quarto>): Promise<Quarto>;
  deletar(id: string): Promise<void>;
  atualizarStatus(id: string, status: StatusQuarto): Promise<Quarto>;
}

// Implementação mock do serviço
export class MockQuartoService implements QuartoService {
  private quartos: Quarto[] = [
    {
      id: 'quarto_1',
      numero: '101',
      capacidade: 2,
      tipo: TipoQuarto.LUXO,
      precoPorNoite: 350,
      hasMinibar: true,
      hasCafeDaManha: true,
      hasArCondicionado: true,
      hasTV: true,
      status: StatusQuarto.DISPONIVEL,
      camas: [
        { id: 'cama_1', tipo: TipoCama.CASAL_KING, quartoId: 'quarto_1' }
      ]
    },
    {
      id: 'quarto_2',
      numero: '102',
      capacidade: 1,
      tipo: TipoQuarto.BASICO,
      precoPorNoite: 150,
      hasMinibar: false,
      hasCafeDaManha: false,
      hasArCondicionado: true,
      hasTV: true,
      status: StatusQuarto.OCUPADO,
      camas: [
        { id: 'cama_2', tipo: TipoCama.SOLTEIRO, quartoId: 'quarto_2' }
      ]
    },
    {
      id: 'quarto_3',
      numero: '103',
      capacidade: 4,
      tipo: TipoQuarto.MODERNO,
      precoPorNoite: 280,
      hasMinibar: true,
      hasCafeDaManha: false,
      hasArCondicionado: true,
      hasTV: true,
      status: StatusQuarto.MANUTENCAO,
      camas: [
        { id: 'cama_3', tipo: TipoCama.CASAL_QUEEN, quartoId: 'quarto_3' },
        { id: 'cama_4', tipo: TipoCama.CASAL_QUEEN, quartoId: 'quarto_3' }
      ]
    },
    {
      id: 'quarto_4',
      numero: '104',
      capacidade: 3,
      tipo: TipoQuarto.LUXO,
      precoPorNoite: 420,
      hasMinibar: true,
      hasCafeDaManha: true,
      hasArCondicionado: true,
      hasTV: true,
      status: StatusQuarto.LIMPEZA,
      camas: [
        { id: 'cama_5', tipo: TipoCama.CASAL_KING, quartoId: 'quarto_4' },
        { id: 'cama_6', tipo: TipoCama.SOLTEIRO, quartoId: 'quarto_4' }
      ]
    }
  ];

  async listar(): Promise<Quarto[]> {
    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...this.quartos];
  }

  async buscarPorId(id: string): Promise<Quarto | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.quartos.find(q => q.id === id) || null;
  }

  async criar(quartoData: Omit<Quarto, 'id'>): Promise<Quarto> {
    await new Promise(resolve => setTimeout(resolve, 800));

    // Verificar se número já existe
    if (this.quartos.some(q => q.numero === quartoData.numero)) {
      throw new Error('Número do quarto já existe');
    }

    const novoQuarto: Quarto = {
      ...quartoData,
      id: `quarto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    this.quartos.push(novoQuarto);
    return novoQuarto;
  }

  async atualizar(id: string, quartoData: Partial<Quarto>): Promise<Quarto> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const index = this.quartos.findIndex(q => q.id === id);
    if (index === -1) {
      throw new Error('Quarto não encontrado');
    }

    // Verificar se número já existe (se estiver sendo alterado)
    if (quartoData.numero) {
      const quartoExistente = this.quartos.find(q => 
        q.numero === quartoData.numero && q.id !== id
      );
      if (quartoExistente) {
        throw new Error('Número do quarto já existe');
      }
    }

    this.quartos[index] = { ...this.quartos[index], ...quartoData };
    return this.quartos[index];
  }

  async deletar(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const index = this.quartos.findIndex(q => q.id === id);
    if (index === -1) {
      throw new Error('Quarto não encontrado');
    }

    this.quartos.splice(index, 1);
  }

  async atualizarStatus(id: string, status: StatusQuarto): Promise<Quarto> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const index = this.quartos.findIndex(q => q.id === id);
    if (index === -1) {
      throw new Error('Quarto não encontrado');
    }

    this.quartos[index] = { ...this.quartos[index], status };
    return this.quartos[index];
  }

  // Métodos utilitários
  async buscarPorNumero(numero: string): Promise<Quarto | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.quartos.find(q => q.numero === numero) || null;
  }

  async buscarPorTipo(tipo: TipoQuarto): Promise<Quarto[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.quartos.filter(q => q.tipo === tipo);
  }

  async buscarPorStatus(status: StatusQuarto): Promise<Quarto[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.quartos.filter(q => q.status === status);
  }

  async buscarDisponiveis(): Promise<Quarto[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.quartos.filter(q => q.status === StatusQuarto.DISPONIVEL);
  }
}

// Instância do serviço para uso na aplicação
export const quartoService = new MockQuartoService();

// Implementação para API real (quando estiver disponível)
export class ApiQuartoService implements QuartoService {
  private baseUrl = '/api/quartos';

  async listar(): Promise<Quarto[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) {
      throw new Error('Erro ao listar quartos');
    }
    return response.json();
  }

  async buscarPorId(id: string): Promise<Quarto | null> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error('Erro ao buscar quarto');
    }
    return response.json();
  }

  async criar(quartoData: Omit<Quarto, 'id'>): Promise<Quarto> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quartoData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Erro ao criar quarto');
    }

    return response.json();
  }

  async atualizar(id: string, quartoData: Partial<Quarto>): Promise<Quarto> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quartoData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Erro ao atualizar quarto');
    }

    return response.json();
  }

  async deletar(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Erro ao deletar quarto');
    }
  }

  async atualizarStatus(id: string, status: StatusQuarto): Promise<Quarto> {
    const response = await fetch(`${this.baseUrl}/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error('Erro ao atualizar status do quarto');
    }

    return response.json();
  }
}
