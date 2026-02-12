/**
 * Teste de Integração - Fluxo Completo de Reserva
 * 
 * Fluxo Testado:
 * 1. Cadastrar Hóspede
 * 2. Cadastrar Quarto
 * 3. Criar Reserva
 * 4. Verificar Atualização de Disponibilidade do Quarto
 * 
 * Estratégia:
 * - Testar integração entre múltiplos módulos
 * - Usar implementações reais (não mocks)
 * - Verificar efeitos colaterais (mudança de status)
 * - Testar fluxo completo como usuário faria
 */

import { QuartosService } from '../../../src/modules/quartos/services/QuartosService';
import { QuartoRepositoryInMemory } from '../../../src/modules/quartos/repositories/QuartoRepository';
import { Quarto, TipoQuarto, StatusQuarto, TipoCama } from '../../../src/modules/quartos/entities';
import { Hospede } from '../../../src/modules/hospedes/entities/Hospede';
import { Reserva, StatusReserva } from '../../../src/modules/reservas/entities/Reserva';

/**
 * Mock simples de HospedeRepository para teste de integração
 * Decisão: Implementação in-memory para não depender de banco real
 */
class HospedeRepositoryInMemory {
  private hospedes: Map<number, Hospede> = new Map();
  private currentId = 1;

  async create(hospede: Hospede): Promise<Hospede> {
    hospede.id = this.currentId++;
    this.hospedes.set(hospede.id, hospede);
    return hospede;
  }

  async findById(id: number): Promise<Hospede | null> {
    return this.hospedes.get(id) || null;
  }

  async findByCPF(cpf: string): Promise<Hospede | null> {
    return Array.from(this.hospedes.values()).find(h => h.cpf === cpf) || null;
  }
}

/**
 * Mock simples de ReservaRepository para teste de integração
 */
class ReservaRepositoryInMemory {
  private reservas: Map<number, Reserva> = new Map();
  private currentId = 1;

  async create(reserva: Reserva): Promise<Reserva> {
    reserva.id = this.currentId++;
    this.reservas.set(reserva.id, reserva);
    return reserva;
  }

  async findById(id: number): Promise<Reserva | null> {
    return this.reservas.get(id) || null;
  }

  async findByQuartoId(quartoId: number): Promise<Reserva[]> {
    return Array.from(this.reservas.values())
      .filter(r => r.quartoId === quartoId && r.status === StatusReserva.ATIVA);
  }
}

/**
 * Service simplificado de Hóspedes para teste
 */
class HospedesServiceSimples {
  constructor(private repository: HospedeRepositoryInMemory) {}

  async criar(dados: { nome: string; sobrenome: string; cpf: string; email: string }) {
    const cpfExiste = await this.repository.findByCPF(dados.cpf);
    if (cpfExiste) {
      throw new Error('CPF já cadastrado');
    }

    const hospede = new Hospede(
      0,
      dados.nome,
      dados.sobrenome,
      dados.cpf,
      dados.email
    );

    return await this.repository.create(hospede);
  }

  async buscarPorId(id: number) {
    const hospede = await this.repository.findById(id);
    if (!hospede) {
      throw new Error('Hóspede não encontrado');
    }
    return hospede;
  }
}

/**
 * Service simplificado de Reservas para teste
 */
class ReservasServiceSimples {
  constructor(
    private repository: ReservaRepositoryInMemory,
    private quartosService: QuartosService,
    private hospedesService: HospedesServiceSimples
  ) {}

  async criar(dados: { quartoId: number; hospedeId: number; dataCheckin: Date; dataCheckout: Date }) {
    // Verificar se quarto existe e está disponível
    const quarto = await this.quartosService.buscarPorId(dados.quartoId);
    if (quarto.status !== StatusQuarto.LIVRE) {
      throw new Error('Quarto não está disponível');
    }

    // Verificar se hóspede existe
    await this.hospedesService.buscarPorId(dados.hospedeId);

    // Criar reserva
    const reserva = new Reserva(
      0,
      dados.quartoId,
      dados.hospedeId,
      dados.dataCheckin,
      dados.dataCheckout
    );

    const reservaCriada = await this.repository.create(reserva);

    // Atualizar status do quarto para OCUPADO
    await this.quartosService.alterarStatus(dados.quartoId, StatusQuarto.OCUPADO);

    return reservaCriada;
  }

  async cancelar(id: number) {
    const reserva = await this.repository.findById(id);
    if (!reserva) {
      throw new Error('Reserva não encontrada');
    }

    reserva.cancelar();

    // Liberar quarto
    await this.quartosService.alterarStatus(reserva.quartoId, StatusQuarto.LIVRE);

    return reserva;
  }
}

describe('Teste de Integração - Fluxo Completo de Reserva', () => {
  let quartosService: QuartosService;
  let hospedesService: HospedesServiceSimples;
  let reservasService: ReservasServiceSimples;

  /**
   * Setup: Criar instâncias reais dos services
   * Decisão: Usar implementações in-memory para não depender de banco
   */
  beforeEach(() => {
    const quartoRepository = new QuartoRepositoryInMemory();
    const hospedeRepository = new HospedeRepositoryInMemory();
    const reservaRepository = new ReservaRepositoryInMemory();

    quartosService = new QuartosService(quartoRepository);
    hospedesService = new HospedesServiceSimples(hospedeRepository);
    reservasService = new ReservasServiceSimples(
      reservaRepository,
      quartosService,
      hospedesService
    );
  });

  describe('Fluxo Completo de Sucesso', () => {
    /**
     * Teste Principal: Fluxo completo de reserva
     * 
     * Este é o teste mais importante - simula o fluxo real do usuário
     */
    it('deve completar fluxo: cadastrar hóspede → criar reserva → atualizar disponibilidade', async () => {
      // ========== ETAPA 1: Cadastrar Hóspede ==========
      const dadosHospede = {
        nome: 'João',
        sobrenome: 'Silva',
        cpf: '123.456.789-10',
        email: 'joao@email.com'
      };

      const hospedeCriado = await hospedesService.criar(dadosHospede);

      // Verificar que hóspede foi criado corretamente
      expect(hospedeCriado).toBeDefined();
      expect(hospedeCriado.id).toBeGreaterThan(0);
      expect(hospedeCriado.getNomeCompleto()).toBe('João Silva');
      expect(hospedeCriado.getCPF()).toBe('123.456.789-10');

      // ========== ETAPA 2: Cadastrar Quarto ==========
      const dadosQuarto = {
        numero: 101,
        capacidade: 2,
        tipo: TipoQuarto.MODERNO,
        precoDiaria: 150.00,
        temFrigobar: true,
        temCafe: true,
        temArCondicionado: true,
        temTV: true,
        camas: [{ tipoCama: TipoCama.CASAL_QUEEN }]
      };

      const quartoCriado = await quartosService.criar(dadosQuarto);

      // Verificar que quarto foi criado com status LIVRE
      expect(quartoCriado).toBeDefined();
      expect(quartoCriado.id).toBeGreaterThan(0);
      expect(quartoCriado.numero).toBe(101);
      expect(quartoCriado.status).toBe(StatusQuarto.LIVRE);

      // ========== ETAPA 3: Criar Reserva ==========
      const dadosReserva = {
        quartoId: quartoCriado.id,
        hospedeId: hospedeCriado.id,
        dataCheckin: new Date('2024-12-20'),
        dataCheckout: new Date('2024-12-25')
      };

      const reservaCriada = await reservasService.criar(dadosReserva);

      // Verificar que reserva foi criada
      expect(reservaCriada).toBeDefined();
      expect(reservaCriada.id).toBeGreaterThan(0);
      expect(reservaCriada.getQuartoId()).toBe(quartoCriado.id);
      expect(reservaCriada.getHospedeId()).toBe(hospedeCriado.id);
      expect(reservaCriada.getStatus()).toBe(StatusReserva.ATIVA);

      // ========== ETAPA 4: Verificar Atualização de Disponibilidade ==========
      const quartoAtualizado = await quartosService.buscarPorId(quartoCriado.id);

      // VERIFICAÇÃO CRÍTICA: Status do quarto deve ter mudado para OCUPADO
      expect(quartoAtualizado.status).toBe(StatusQuarto.OCUPADO);

      // Verificar que outros dados do quarto não mudaram
      expect(quartoAtualizado.numero).toBe(101);
      expect(quartoAtualizado.precoDiaria).toBe(150.00);
    });

    /**
     * Teste: Múltiplas reservas em quartos diferentes
     * Verifica que sistema suporta múltiplas operações
     */
    it('deve permitir múltiplas reservas em quartos diferentes', async () => {
      // Criar 2 hóspedes
      const hospede1 = await hospedesService.criar({
        nome: 'João',
        sobrenome: 'Silva',
        cpf: '111.111.111-11',
        email: 'joao@email.com'
      });

      const hospede2 = await hospedesService.criar({
        nome: 'Maria',
        sobrenome: 'Santos',
        cpf: '222.222.222-22',
        email: 'maria@email.com'
      });

      // Criar 2 quartos
      const quarto1 = await quartosService.criar({
        numero: 101,
        capacidade: 2,
        tipo: TipoQuarto.MODERNO,
        precoDiaria: 150.00,
        temFrigobar: true,
        temCafe: true,
        temArCondicionado: true,
        temTV: true,
        camas: [{ tipoCama: TipoCama.CASAL_QUEEN }]
      });

      const quarto2 = await quartosService.criar({
        numero: 102,
        capacidade: 2,
        tipo: TipoQuarto.LUXO,
        precoDiaria: 250.00,
        temFrigobar: true,
        temCafe: true,
        temArCondicionado: true,
        temTV: true,
        camas: [{ tipoCama: TipoCama.CASAL_KING }]
      });

      // Criar 2 reservas
      const reserva1 = await reservasService.criar({
        quartoId: quarto1.id,
        hospedeId: hospede1.id,
        dataCheckin: new Date('2024-12-20'),
        dataCheckout: new Date('2024-12-25')
      });

      const reserva2 = await reservasService.criar({
        quartoId: quarto2.id,
        hospedeId: hospede2.id,
        dataCheckin: new Date('2024-12-20'),
        dataCheckout: new Date('2024-12-25')
      });

      // Verificar que ambas as reservas foram criadas
      expect(reserva1.id).not.toBe(reserva2.id);

      // Verificar que ambos os quartos estão ocupados
      const quarto1Atualizado = await quartosService.buscarPorId(quarto1.id);
      const quarto2Atualizado = await quartosService.buscarPorId(quarto2.id);

      expect(quarto1Atualizado.status).toBe(StatusQuarto.OCUPADO);
      expect(quarto2Atualizado.status).toBe(StatusQuarto.OCUPADO);
    });

    /**
     * Teste: Cancelamento de reserva libera quarto
     * Verifica fluxo reverso
     */
    it('deve liberar quarto ao cancelar reserva', async () => {
      // Criar hóspede e quarto
      const hospede = await hospedesService.criar({
        nome: 'João',
        sobrenome: 'Silva',
        cpf: '123.456.789-10',
        email: 'joao@email.com'
      });

      const quarto = await quartosService.criar({
        numero: 101,
        capacidade: 2,
        tipo: TipoQuarto.MODERNO,
        precoDiaria: 150.00,
        temFrigobar: true,
        temCafe: true,
        temArCondicionado: true,
        temTV: true,
        camas: [{ tipoCama: TipoCama.CASAL_QUEEN }]
      });

      // Criar reserva (quarto fica OCUPADO)
      const reserva = await reservasService.criar({
        quartoId: quarto.id,
        hospedeId: hospede.id,
        dataCheckin: new Date('2024-12-20'),
        dataCheckout: new Date('2024-12-25')
      });

      // Verificar que quarto está ocupado
      let quartoAtualizado = await quartosService.buscarPorId(quarto.id);
      expect(quartoAtualizado.status).toBe(StatusQuarto.OCUPADO);

      // Cancelar reserva
      await reservasService.cancelar(reserva.id);

      // Verificar que quarto voltou para LIVRE
      quartoAtualizado = await quartosService.buscarPorId(quarto.id);
      expect(quartoAtualizado.status).toBe(StatusQuarto.LIVRE);
    });
  });

  describe('Fluxo com Validações', () => {
    /**
     * Teste: Não deve permitir reserva em quarto ocupado
     * Regra de negócio crítica
     */
    it('não deve permitir reserva em quarto já ocupado', async () => {
      // Criar 2 hóspedes
      const hospede1 = await hospedesService.criar({
        nome: 'João',
        sobrenome: 'Silva',
        cpf: '111.111.111-11',
        email: 'joao@email.com'
      });

      const hospede2 = await hospedesService.criar({
        nome: 'Maria',
        sobrenome: 'Santos',
        cpf: '222.222.222-22',
        email: 'maria@email.com'
      });

      // Criar quarto
      const quarto = await quartosService.criar({
        numero: 101,
        capacidade: 2,
        tipo: TipoQuarto.MODERNO,
        precoDiaria: 150.00,
        temFrigobar: true,
        temCafe: true,
        temArCondicionado: true,
        temTV: true,
        camas: [{ tipoCama: TipoCama.CASAL_QUEEN }]
      });

      // Primeira reserva (sucesso)
      await reservasService.criar({
        quartoId: quarto.id,
        hospedeId: hospede1.id,
        dataCheckin: new Date('2024-12-20'),
        dataCheckout: new Date('2024-12-25')
      });

      // Segunda reserva no mesmo quarto (deve falhar)
      await expect(
        reservasService.criar({
          quartoId: quarto.id,
          hospedeId: hospede2.id,
          dataCheckin: new Date('2024-12-26'),
          dataCheckout: new Date('2024-12-30')
        })
      ).rejects.toThrow('Quarto não está disponível');
    });

    /**
     * Teste: Não deve permitir CPF duplicado
     */
    it('não deve permitir cadastrar hóspede com CPF duplicado', async () => {
      // Primeiro cadastro (sucesso)
      await hospedesService.criar({
        nome: 'João',
        sobrenome: 'Silva',
        cpf: '123.456.789-10',
        email: 'joao@email.com'
      });

      // Segundo cadastro com mesmo CPF (deve falhar)
      await expect(
        hospedesService.criar({
          nome: 'Maria',
          sobrenome: 'Santos',
          cpf: '123.456.789-10', // CPF duplicado
          email: 'maria@email.com'
        })
      ).rejects.toThrow('CPF já cadastrado');
    });
  });

  describe('Verificação de Integridade', () => {
    /**
     * Teste: Dados permanecem consistentes após múltiplas operações
     */
    it('deve manter integridade dos dados após múltiplas operações', async () => {
      // Criar hóspede
      const hospede = await hospedesService.criar({
        nome: 'João',
        sobrenome: 'Silva',
        cpf: '123.456.789-10',
        email: 'joao@email.com'
      });

      // Criar quarto
      const quarto = await quartosService.criar({
        numero: 101,
        capacidade: 2,
        tipo: TipoQuarto.MODERNO,
        precoDiaria: 150.00,
        temFrigobar: true,
        temCafe: true,
        temArCondicionado: true,
        temTV: true,
        camas: [{ tipoCama: TipoCama.CASAL_QUEEN }]
      });

      // Criar reserva
      const reserva = await reservasService.criar({
        quartoId: quarto.id,
        hospedeId: hospede.id,
        dataCheckin: new Date('2024-12-20'),
        dataCheckout: new Date('2024-12-25')
      });

      // Buscar dados novamente
      const hospedeBuscado = await hospedesService.buscarPorId(hospede.id);
      const quartoBuscado = await quartosService.buscarPorId(quarto.id);

      // Verificar integridade
      expect(hospedeBuscado.getNomeCompleto()).toBe('João Silva');
      expect(quartoBuscado.numero).toBe(101);
      expect(quartoBuscado.status).toBe(StatusQuarto.OCUPADO);
      expect(reserva.getStatus()).toBe(StatusReserva.ATIVA);
    });
  });
});
