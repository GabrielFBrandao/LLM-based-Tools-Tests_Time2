“Sugira padrões de projeto aplicáveis ao sistema e justifique.”
**-Resposta obtida via chat-**

---
# Padrões de Projeto para o Sistema de Reserva de Hotel

## 1. Padrões de Criação

### 1.1 Factory Method
**Aplicação**: Criação de diferentes tipos de notificações (e-mail, SMS, push)
```typescript
ainterface Notificacao {
  enviar(): void;
}

class EmailNotificacao implements Notificacao {
  constructor(private destinatario: string, private mensagem: string) {}
  
  enviar() {
    // Implementação do envio de e-mail
  }
}

class SMSNotificacao implements Notificacao {
  constructor(private numero: string, private mensagem: string) {}
  
  enviar() {
    // Implementação do envio de SMS
  }
}

abstract class NotificacaoFactory {
  abstract criarNotificacao(): Notificacao;
  
  enviarNotificacao() {
    const notificacao = this.criarNotificacao();
    notificacao.enviar();
  }
}
```

**Justificativa**: Facilita a criação de diferentes tipos de notificações sem acoplar o código cliente às classes concretas.








### 1.2 Builder
**Aplicação**: Construção de reservas complexas
```typescript
class ReservaBuilder {
  private reserva: Reserva;
  
  constructor() {
    this.reserva = new Reserva();
  }
  
  comHospede(hospede: Hospede): this {
    this.reserva.setHospede(hospede);
    return this;
  }
  
  paraQuarto(quarto: Quarto): this {
    this.reserva.setQuarto(quarto);
    return this;
  }
  
  noPeriodo(inicio: Date, fim: Date): this {
    this.reserva.setPeriodo(new Periodo(inicio, fim));
    return this;
  }
  
  build(): Reserva {
    this.reserva.calcularValorTotal();
    return this.reserva;
  }
}

// Uso:
const reserva = new ReservaBuilder()
  .comHospede(hospede)
  .paraQuarto(quarto)
  .noPeriodo(checkIn, checkOut)
  .build();
```

**Justificativa**: Simplifica a criação de objetos Reserva que possuem muitos parâmetros e configurações opcionais.










## 2. Padrões Estruturais
### 2.1 Repository
**Aplicação**: Abstração do acesso a dados
```typescript
interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(entity: T): Promise<T>;
  update(id: string, entity: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

class QuartoRepository implements IRepository<Quarto> {
  // Implementação concreta para Quarto
}

class ReservaRepository implements IRepository<Reserva> {
  // Implementação concreta para Reserva
}
```
**Justificativa**: Separa a lógica de acesso a dados da lógica de negócios, facilitando testes e manutenção.

### 2.2 Strategy
**Aplicação**: Cálculo de descontos
```typescript
interface DescontoStrategy {
  calcularDesconto(reserva: Reserva): number;
}

class DescontoTemporadaBaixa implements DescontoStrategy {
  calcularDesconto(reserva: Reserva): number {
    // Lógica de desconto para temporada baixa
    return reserva.getValorTotal() * 0.15; // 15% de desconto
  }
}

class DescontoFidelidade implements DescontoStrategy {
  calcularDesconto(reserva: Reserva): number {
    // Lógica de desconto para clientes fiéis
    return reserva.getValorTotal() * 0.10; // 10% de desconto
  }
}

class CalculadoraDescontos {
  constructor(private strategy: DescontoStrategy) {}
  
  calcular(reserva: Reserva): number {
    return this.strategy.calcularDesconto(reserva);
  }
}
```

**Justificativa**: Permite variar o algoritmo de cálculo de desconto em tempo de execução.

## 3. Padrões Comportamentais

### 3.1 Command
**Aplicação**: Operações de reserva e check-in/check-out
```typescript
interface Comando {
  executar(): Promise<void>;
  desfazer(): Promise<void>;
}

class ReservarQuartoCommand implements Comando {
  constructor(
    private reservaService: ReservaService,
    private dadosReserva: DadosReserva
  ) {}
  
  async executar(): Promise<void> {
    await this.reservaService.reservar(this.dadosReserva);
  }
  
  async desfazer(): Promise<void> {
    await this.reservaService.cancelarReserva(this.dadosReserva.id);
  }
}

class CheckInCommand implements Comando {
  // Implementação similar
}

class Invoker {
  private comandos: Comando[] = [];
  
  adicionarComando(comando: Comando): void {
    this.comandos.push(comando);
  }
  
  async executarComandos(): Promise<void> {
    for (const comando of this.comandos) {
      await comando.executar();
    }
  }
}
```

**Justificativa**: Permite desacoplar o objeto que invoca a operação do objeto que sabe como executá-la, além de possibilitar operações de desfazer/refazer.

### 3.2 Observer
**Aplicação**: Notificações e eventos do sistema
```typescript
interface Observador {
  atualizar(evento: string, dados: any): void;
}

class SistemaNotificacoes {
  private observadores: Observador[] = [];
  
  adicionarObservador(observador: Observador): void {
    this.observadores.push(observador);
  }
  
  notificar(evento: string, dados: any): void {
    for (const observador of this.observadores) {
      observador.atualizar(evento, dados);
    }
  }
}

class EmailService implements Observador {
  atualizar(evento: string, dados: any): void {
    if (evento === 'RESERVA_CONFIRMADA') {
      this.enviarEmailConfirmacao(dados.reserva);
    } else if (evento === 'CHECKIN_REALIZADO') {
      this.enviarEmailBoasVindas(dados.hospede);
    }
  }
  
  // Implementações dos métodos de envio de e-mail
}
```

**Justificativa**: Permite que objetos se inscrevam para serem notificados sobre mudanças em outros objetos, mantendo um baixo acoplamento.















## 4. Padrões Arquiteturais

### 4.1 Unit of Work
**Aplicação**: Gerenciamento de transações
```typescript
class UnitOfWork {
  private context: DbContext;
  private repositories: Map<string, any> = new Map();
  
  getRepository<T>(entity: { new(): T }): IRepository<T> {
    const key = entity.name;
    if (!this.repositories.has(key)) {
      this.repositories.set(key, new (this.getRepositoryType(entity))(this.context));
    }
    return this.repositories.get(key);
  }
  
  async commit(): Promise<void> {
    await this.context.saveChanges();
  }
  
  async rollback(): Promise<void> {
    // Implementação do rollback
  }
}
```

**Justificativa**: Mantém um registro de objetos afetados por uma transação de negócio e coordena a persistência dessas alterações.






















### 4.2 CQRS (Command Query Responsibility Segregation)
**Aplicação**: Separação de leituras e escritas
```typescript
// Commands (Escrita)
interface ICommandHandler<TCommand, TResult> {
  handle(command: TCommand): Promise<TResult>;
}

class ReservarQuartoHandler implements ICommandHandler<ReservarQuartoCommand, ResultadoReserva> {
  async handle(command: ReservarQuartoCommand): Promise<ResultadoReserva> {
    // Lógica de negócio para reservar um quarto
  }
}

// Queries (Leitura)
interface IQueryHandler<TQuery, TResult> {
  handle(query: TQuery): Promise<TResult>;
}

class ObterQuartosDisponiveisHandler implements IQueryHandler<ObterQuartosDisponiveis, Quarto[]> {
  async handle(query: ObterQuartosDisponiveis): Promise<Quarto[]> {
    // Lógica para obter quartos disponíveis
  }
}
```

**Justificativa**: Melhora o desempenho, a escalabilidade e a segurança, separando as operações de leitura e escrita.






















## 5. Padrões de Integração

### 5.1 Circuit Breaker
**Aplicação**: Integração com serviços externos (gateways de pagamento)
```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailure: Date | null = null;
  private readonly threshold = 3;
  private readonly resetTimeout = 60000; // 1 minuto
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.isOpen()) {
      throw new Error('Circuit breaker está aberto');
    }
    
    try {
      const result = await fn();
      this.reset();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }
  
  private isOpen(): boolean {
    if (this.failures >= this.threshold) {
      const now = new Date();
      if (this.lastFailure && 
          (now.getTime() - this.lastFailure.getTime()) > this.resetTimeout) {
        this.reset();
        return false;
      }
      return true;
    }
    return false;
  }
  
  private recordFailure(): void {
    this.failures++;
    this.lastFailure = new Date();
  }
  
  private reset(): void {
    this.failures = 0;
    this.lastFailure = null;
  }
}
```

**Justificativa**: Previne falhas em cascata quando serviços externos estão com problemas.

## 6. Padrões de Domínio

### 6.1 Domain Events
**Aplicação**: Eventos de domínio
```typescript
interface DomainEvent {
  ocorreuEm: Date;
}

class ReservaConfirmadaEvent implements DomainEvent {
  constructor(
    public readonly reservaId: string,
    public readonly hospedeId: string,
    public readonly valor: number,
    public readonly ocorreuEm: Date = new Date()
  ) {}
}

class Reserva {
  private eventos: DomainEvent[] = [];
  
  confirmar(): void {
    // Lógica de confirmação
    
    this.eventos.push(
      new ReservaConfirmadaEvent(
        this.id,
        this.hospedeId,
        this.valorTotal
      )
    );
  }
  
  getEventosNaoPublicados(): DomainEvent[] {
    return [...this.eventos];
  }
  
  limparEventos(): void {
    this.eventos = [];
  }
}
```

**Justificativa**: Permite que diferentes partes do sistema reajam a mudanças no domínio sem criar acoplamento direto.



## Conclusão

Estes padrões foram selecionados com base nas seguintes necessidades do sistema de reserva de hotel:

1. **Manutenibilidade**: Padrões como Repository e Command ajudam a organizar o código de forma clara e coesa.
2. **Escalabilidade**: CQRS e Circuit Breaker permitem que o sistema lide com cargas variáveis e falhas de forma elegante.
3. **Flexibilidade**: Strategy e Observer permitem que o sistema evolua com novos requisitos sem grandes refatorações.
4. **Robustez**: Domain Events e Unit of Work garantem a consistência dos dados mesmo em cenários complexos.

A aplicação desses padrões resultará em um sistema mais robusto, flexívle e fácil de manter, capaz de crescer conforme as necessidades do negócio.

