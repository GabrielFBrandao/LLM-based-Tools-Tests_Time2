# Padrões de Projeto Aplicáveis ao Sistema

## 1. Repository Pattern ⭐⭐⭐ (CRÍTICO)

### Descrição
Abstrai o acesso a dados, isolando a lógica de persistência da lógica de negócio.

### Justificativa
* ✅ Separa responsabilidades (acesso a dados vs. lógica de negócio)
* ✅ Facilita troca de ORM ou banco de dados
* ✅ Simplifica testes (mock de repositories)
* ✅ Centraliza queries complexas

### Implementação

```typescript
// Interface do Repository
interface IQuartoRepository {
  findAll(): Promise<Quarto[]>;
  findById(id: number): Promise<Quarto | null>;
  findByNumero(numero: number): Promise<Quarto | null>;
  findDisponiveis(): Promise<Quarto[]>;
  create(quarto: Quarto): Promise<Quarto>;
  update(id: number, quarto: Partial<Quarto>): Promise<Quarto>;
  delete(id: number): Promise<void>;
}

// Implementação concreta
class QuartoRepository implements IQuartoRepository {
  constructor(private db: Database) {}

  async findDisponiveis(): Promise<Quarto[]> {
    return this.db.query(
      'SELECT * FROM quartos WHERE status = ?',
      [StatusQuarto.LIVRE]
    );
  }

  async create(quarto: Quarto): Promise<Quarto> {
    return this.db.insert('quartos', quarto);
  }
}
```

### Aplicação no Sistema:
* QuartoRepository
* HospedeRepository
* ReservaRepository
* CamaRepository

---

## 2. Service Layer Pattern ⭐⭐⭐ (CRÍTICO)

### Descrição
Centraliza a lógica de negócio em classes de serviço, separando-a dos controllers.

### Justificativa
* ✅ Reutilização de lógica entre diferentes controllers
* ✅ Orquestração de múltiplos repositories
* ✅ Transações complexas (criar reserva + atualizar quarto)
* ✅ Testabilidade isolada

### Implementação

```typescript
class ReservasService {
  constructor(
    private reservaRepo: IReservaRepository,
    private quartoService: QuartosService,
    private hospedeService: HospedesService
  ) {}

  async criarReserva(dados: CriarReservaDTO): Promise<Reserva> {
    // Validação de negócio
    const quarto = await this.quartoService.buscarPorId(dados.quartoId);
    if (!quarto.isDisponivel()) {
      throw new Error('Quarto não disponível');
    }

    // Transação
    const reserva = await this.reservaRepo.create(dados);
    await this.quartoService.alterarStatus(dados.quartoId, StatusQuarto.OCUPADO);

    return reserva;
  }
}
```

### Aplicação no Sistema:
* QuartosService
* HospedesService
* ReservasService

---

## 3. Dependency Injection (DI) ⭐⭐⭐ (CRÍTICO)

### Descrição
Injeta dependências via construtor, invertendo o controle de criação de objetos.

### Justificativa
* ✅ Baixo acoplamento entre classes
* ✅ Facilita testes (injeção de mocks)
* ✅ Flexibilidade para trocar implementações
* ✅ Código mais limpo e manutenível

### Implementação

```typescript
// Container de DI (usando InversifyJS ou TSyringe)
@injectable()
class ReservasController {
  constructor(
    @inject('ReservasService') private reservasService: ReservasService,
    @inject('Logger') private logger: ILogger
  ) {}

  async criar(req: Request, res: Response) {
    const reserva = await this.reservasService.criarReserva(req.body);
    this.logger.info('Reserva criada', { id: reserva.id });
    res.status(201).json(reserva);
  }
}
```

### Aplicação no Sistema:
* Todos os Controllers, Services e Repositories

---

## 4. Data Transfer Object (DTO) ⭐⭐⭐ (CRÍTICO)

### Descrição
Objetos simples para transferir dados entre camadas, com validação.

### Justificativa
* ✅ Validação de entrada centralizada
* ✅ Documentação clara de contratos
* ✅ Segurança (não expõe entidades diretamente)
* ✅ Transformação de dados

### Implementação

```typescript
// DTO de entrada
class CriarQuartoDTO {
  @IsNumber()
  @Min(1)
  numero: number;

  @IsEnum(TipoQuarto)
  tipo: TipoQuarto;

  @IsNumber()
  @Min(0)
  precoDiaria: number;

  @IsBoolean()
  temFrigobar: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  camas: CriarCamaDTO[];
}

// DTO de saída
class QuartoResponseDTO {
  id: number;
  numero: number;
  tipo: string;
  precoDiaria: number;
  status: string;

  static fromEntity(quarto: Quarto): QuartoResponseDTO {
    return {
      id: quarto.id,
      numero: quarto.numero,
      tipo: quarto.tipo,
      precoDiaria: quarto.precoDiaria,
      status: quarto.status
    };
  }
}
```

### Aplicação no Sistema:
* CriarQuartoDTO, AtualizarQuartoDTO
* CriarHospedeDTO
* CriarReservaDTO

---

## 5. State Pattern ⭐⭐ (IMPORTANTE)

### Descrição
Gerencia transições de estado de forma controlada e validada.

### Justificativa
* ✅ Regra crítica: controle de status de quartos
* ✅ Transições válidas bem definidas
* ✅ Comportamento diferente por estado
* ✅ Facilita adição de novos estados

### Implementação

```typescript
// Estado abstrato
abstract class QuartoState {
  abstract podeReservar(): boolean;
  abstract proximosEstadosPermitidos(): StatusQuarto[];
}

// Estados concretos
class QuartoLivreState extends QuartoState {
  podeReservar(): boolean {
    return true;
  }

  proximosEstadosPermitidos(): StatusQuarto[] {
    return [StatusQuarto.OCUPADO, StatusQuarto.MANUTENCAO, StatusQuarto.LIMPEZA];
  }
}

class QuartoOcupadoState extends QuartoState {
  podeReservar(): boolean {
    return false;
  }

  proximosEstadosPermitidos(): StatusQuarto[] {
    return [StatusQuarto.LIVRE, StatusQuarto.LIMPEZA];
  }
}

// Uso na classe Quarto
class Quarto {
  private state: QuartoState;

  alterarStatus(novoStatus: StatusQuarto): void {
    if (!this.state.proximosEstadosPermitidos().includes(novoStatus)) {
      throw new Error('Transição de estado inválida');
    }
    this.status = novoStatus;
    this.state = this.criarState(novoStatus);
  }
}
```

### Aplicação no Sistema:
* Gerenciamento de StatusQuarto
* Gerenciamento de StatusReserva

---

## 6. Strategy Pattern ⭐⭐ (IMPORTANTE)

### Descrição
Define família de algoritmos intercambiáveis.

### Justificativa
* ✅ Diferentes estratégias de cálculo de preço por tipo de quarto
* ✅ Diferentes validadores (CPF, Email)
* ✅ Flexibilidade para adicionar novas estratégias

### Implementação

```typescript
// Interface da estratégia
interface IPrecoStrategy {
  calcularPreco(precoDiaria: number, dias: number): number;
}

// Estratégias concretas
class PrecoBasicoStrategy implements IPrecoStrategy {
  calcularPreco(precoDiaria: number, dias: number): number {
    return precoDiaria * dias;
  }
}

class PrecoLuxoStrategy implements IPrecoStrategy {
  calcularPreco(precoDiaria: number, dias: number): number {
    // Desconto para estadias longas
    const desconto = dias > 7 ? 0.1 : 0;
    return precoDiaria * dias * (1 - desconto);
  }
}

// Uso
class Quarto {
  private precoStrategy: IPrecoStrategy;

  calcularPrecoTotal(dias: number): number {
    return this.precoStrategy.calcularPreco(this.precoDiaria, dias);
  }
}
```

### Aplicação no Sistema:
* Cálculo de preço por tipo de quarto
* Validadores (CPFValidator, EmailValidator)

---

## 7. Factory Pattern ⭐⭐ (IMPORTANTE)

### Descrição
Centraliza criação de objetos complexos.

### Justificativa
* ✅ Criação de entidades com validações
* ✅ Inicialização complexa (Quarto com camas)
* ✅ Encapsula lógica de criação

### Implementação

```typescript
class QuartoFactory {
  static criar(dados: CriarQuartoDTO): Quarto {
    const quarto = new Quarto(
      dados.numero,
      dados.capacidade,
      dados.tipo,
      dados.precoDiaria
    );

    // Adiciona comodidades
    quarto.temFrigobar = dados.temFrigobar;
    quarto.temCafe = dados.temCafe;

    // Adiciona camas
    dados.camas.forEach(camaDTO => {
      const cama = new Cama(quarto.id, camaDTO.tipo);
      quarto.adicionarCama(cama);
    });

    return quarto;
  }
}
```

### Aplicação no Sistema:
* QuartoFactory
* ReservaFactory

---

## 8. Decorator Pattern ⭐ (ÚTIL)

### Descrição
Adiciona comportamentos a objetos dinamicamente.

### Justificativa
* ✅ Logging de operações
* ✅ Cache de métodos
* ✅ Validação de permissões

### Implementação

```typescript
// Decorator de cache
function Cacheable(ttl: number) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const cache = new Map();

    descriptor.value = async function (...args: any[]) {
      const key = JSON.stringify(args);

      if (cache.has(key)) {
        return cache.get(key);
      }

      const result = await originalMethod.apply(this, args);
      cache.set(key, result);

      setTimeout(() => cache.delete(key), ttl);
      return result;
    };
  };
}

// Uso
class QuartosService {
  @Cacheable(30000) // 30 segundos
  async listarDisponiveis(): Promise<Quarto[]> {
    return this.quartoRepo.findDisponiveis();
  }
}
```

### Aplicação no Sistema:
* Cache de métodos
* Logging automático
* Validação de autenticação

---

## 9. Observer Pattern ⭐ (ÚTIL)

### Descrição
Notifica múltiplos objetos sobre mudanças de estado.

### Justificativa
* ✅ Invalidação de cache quando dados mudam
* ✅ Notificações de eventos (reserva criada)
* ✅ Auditoria de mudanças

### Implementação

```typescript
interface IObserver {
  update(event: string, data: any): void;
}

class CacheInvalidator implements IObserver {
  update(event: string, data: any): void {
    if (event === 'QUARTO_ATUALIZADO') {
      cache.invalidate(`quarto:${data.id}`);
    }
  }
}

class QuartosService {
  private observers: IObserver[] = [];

  addObserver(observer: IObserver): void {
    this.observers.push(observer);
  }

  async atualizar(id: number, dados: any): Promise<Quarto> {
    const quarto = await this.quartoRepo.update(id, dados);
    this.notifyObservers('QUARTO_ATUALIZADO', quarto);
    return quarto;
  }

  private notifyObservers(event: string, data: any): void {
    this.observers.forEach(obs => obs.update(event, data));
  }
}
```

### Aplicação no Sistema:
* Invalidação de cache
* Logging de eventos
* Auditoria

---

## 10. Unit of Work ⭐ (ÚTIL)

### Descrição
Gerencia transações e mantém lista de objetos afetados.

### Justificativa
* ✅ Transações complexas (criar reserva + atualizar quarto)
* ✅ Rollback automático em caso de erro
* ✅ Consistência de dados

### Implementação

```typescript
class UnitOfWork {
  private operations: Array<() => Promise<void>> = [];

  registerNew(entity: any): void {
    this.operations.push(() => this.repository.insert(entity));
  }

  registerDirty(entity: any): void {
    this.operations.push(() => this.repository.update(entity));
  }

  async commit(): Promise<void> {
    const transaction = await this.db.beginTransaction();
    try {
      for (const operation of this.operations) {
        await operation();
      }
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
```

### Aplicação no Sistema:
* Criação de reserva (múltiplas operações)
* Cancelamento de reserva

---

## Resumo de Aplicação

| Padrão | Prioridade | Onde Aplicar | Benefício Principal |
|--------|------------|--------------|---------------------|
| Repository | 🔴 Crítico | Camada de Dados | Abstração de persistência |
| Service Layer | 🔴 Crítico | Camada de Negócio | Centralização de lógica |
| Dependency Injection | 🔴 Crítico | Todas as camadas | Baixo acoplamento |
| DTO | 🔴 Crítico | Controllers | Validação e segurança |
| State | 🟡 Importante | Quarto, Reserva | Controle de estados |
| Strategy | 🟡 Importante | Cálculos, Validações | Flexibilidade |
| Factory | 🟡 Importante | Criação de entidades | Encapsulamento |
| Decorator | 🟢 Útil | Services | Cache, Logging |
| Observer | 🟢 Útil | Eventos | Desacoplamento |
| Unit of Work | 🟢 Útil | Transações | Consistência |

**Recomendação:** Implementar os 4 padrões críticos primeiro (Repository, Service Layer, DI, DTO), depois adicionar State e Strategy conforme necessidade.
