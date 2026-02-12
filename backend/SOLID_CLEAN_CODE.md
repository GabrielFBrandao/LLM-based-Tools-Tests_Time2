# Princípios SOLID e Clean Code Aplicados

## 📋 Visão Geral

Este documento detalha como os princípios SOLID e Clean Code foram aplicados no módulo de Gestão de Quartos.

---

## 🎯 Princípios SOLID

### 1. Single Responsibility Principle (SRP)
**"Uma classe deve ter apenas uma razão para mudar"**

#### ✅ Aplicações:

**Validators separados:**
```typescript
// Cada validator tem uma única responsabilidade
NumeroQuartoValidator    → Valida apenas número
CapacidadeValidator      → Valida apenas capacidade
PrecoValidator           → Valida apenas preço
TipoQuartoValidator      → Valida apenas tipo
```

**Mappers separados:**
```typescript
CamaMapper              → Mapeia apenas Cama
QuartoResponseMapper    → Mapeia Quarto completo
QuartoListMapper        → Mapeia Quarto para listagem
```

**Errors específicos:**
```typescript
QuartoNaoEncontradoError      → Erro de busca
QuartoJaExisteError           → Erro de duplicação
QuartoOcupadoError            → Erro de operação
TransicaoStatusInvalidaError  → Erro de transição
ValidationError               → Erro de validação
```

---

### 2. Open/Closed Principle (OCP)
**"Aberto para extensão, fechado para modificação"**

#### ✅ Aplicações:

**Interface IValidator:**
```typescript
interface IValidator<T> {
  validate(data: T): void;
}

// Novos validators podem ser adicionados sem modificar existentes
class NovoValidator implements IValidator<string> {
  validate(data: string): void {
    // Nova lógica
  }
}
```

**State Pattern na entidade Quarto:**
```typescript
// Novos estados podem ser adicionados sem modificar estados existentes
class NovoEstadoQuarto extends QuartoState {
  podeReservar(): boolean { return false; }
  proximosEstadosPermitidos(): StatusQuarto[] { return []; }
}
```

---

### 3. Liskov Substitution Principle (LSP)
**"Subtipos devem ser substituíveis por seus tipos base"**

#### ✅ Aplicações:

**Implementações de IQuartoRepository:**
```typescript
// QuartoRepositoryInMemory pode ser substituído por qualquer implementação
class QuartoRepositoryPostgres implements IQuartoRepository {
  // Mesma interface, implementação diferente
}

// Service não precisa saber qual implementação está usando
const service = new QuartosService(repository); // Funciona com qualquer implementação
```

**Validators:**
```typescript
// Qualquer validator que implemente IValidator pode ser usado
function validarDados<T>(validator: IValidator<T>, data: T) {
  validator.validate(data); // Funciona com qualquer validator
}
```

---

### 4. Interface Segregation Principle (ISP)
**"Clientes não devem depender de interfaces que não usam"**

#### ✅ Aplicações:

**Interfaces segregadas:**
```typescript
// Separação de leitura e escrita
interface IQuartoReader {
  findAll(): Promise<Quarto[]>;
  findById(id: number): Promise<Quarto | null>;
  findByNumero(numero: number): Promise<Quarto | null>;
  findByStatus(status: StatusQuarto): Promise<Quarto[]>;
}

interface IQuartoWriter {
  create(quarto: Quarto): Promise<Quarto>;
  update(id: number, quarto: Partial<Quarto>): Promise<Quarto>;
  delete(id: number): Promise<void>;
}

// Repository completo combina ambas
interface IQuartoRepository extends IQuartoReader, IQuartoWriter {}
```

**Benefício:** Um serviço que só precisa ler pode depender apenas de IQuartoReader.

---

### 5. Dependency Inversion Principle (DIP)
**"Dependa de abstrações, não de implementações concretas"**

#### ✅ Aplicações:

**Service depende de interface:**
```typescript
export class QuartosService {
  constructor(
    private readonly repository: IQuartoRepository // Interface, não implementação
  ) {}
}
```

**Controller depende de Service:**
```typescript
export class QuartosController {
  constructor(
    private readonly service: QuartosService // Abstração
  ) {}
}
```

**Factory para injeção de dependências:**
```typescript
class QuartosModuleFactory {
  static create() {
    const repository = new QuartoRepositoryInMemory(); // Pode ser trocado
    const service = new QuartosService(repository);
    const controller = new QuartosController(service);
    return { controller };
  }
}
```

---

## 🧹 Clean Code Principles

### 1. Nomes Significativos

#### ✅ Antes vs Depois:

```typescript
// ❌ Antes
async get(id: number) { ... }
private map(q: Quarto) { ... }

// ✅ Depois
async buscarPorId(id: number) { ... }
private toResponseDTO(quarto: Quarto) { ... }
```

### 2. Funções Pequenas e Focadas

#### ✅ Métodos privados descritivos:

```typescript
// Service com métodos privados claros
private async verificarNumeroUnico(numero: number): Promise<void>
private async buscarQuartoOuFalhar(id: number): Promise<Quarto>
private criarQuartoFromDTO(dto: CriarQuartoDTO): Quarto
private aplicarAtualizacoes(quarto: Quarto, dto: AtualizarQuartoDTO): void
```

### 3. Tratamento de Erros Centralizado

#### ✅ Controller com handleError:

```typescript
private handleError(error: unknown, res: Response, next: NextFunction): void {
  if (error instanceof DomainError) {
    res.status(this.getStatusCode(error)).json({ 
      error: error.message,
      type: error.name
    });
  } else if (error instanceof Error) {
    res.status(400).json({ error: error.message });
  } else {
    next(error);
  }
}
```

### 4. DRY (Don't Repeat Yourself)

#### ✅ Mappers reutilizáveis:

```typescript
// Mapper de Cama usado em múltiplos lugares
const camaMapper = new CamaMapper();
this.responseMapper = new QuartoResponseMapper(camaMapper);
```

### 5. Comentários Desnecessários Removidos

#### ✅ Código auto-explicativo:

```typescript
// ❌ Antes
// Busca quarto por ID
const quarto = await this.repository.findById(id);

// ✅ Depois (nome do método já explica)
const quarto = await this.buscarQuartoOuFalhar(id);
```

---

## 📊 Estrutura Final

```
quartos/
├── entities/           # Entidades de domínio
├── dtos/              # DTOs e Mappers
├── interfaces/        # Contratos (ISP)
├── repositories/      # Implementações de persistência (DIP)
├── services/          # Lógica de negócio (SRP)
├── controllers/       # Endpoints REST (SRP)
├── validators/        # Validações (SRP, OCP)
├── errors/            # Erros customizados (SRP)
└── routes.ts          # Configuração de rotas
```

---

## ✅ Benefícios Alcançados

### Testabilidade
- ✅ Cada classe pode ser testada isoladamente
- ✅ Mocks fáceis com interfaces
- ✅ Validators independentes

### Manutenibilidade
- ✅ Mudanças localizadas (SRP)
- ✅ Fácil adicionar novos validators
- ✅ Fácil trocar implementação de repository

### Extensibilidade
- ✅ Novos estados de quarto sem modificar existentes
- ✅ Novos tipos de erro sem modificar tratamento
- ✅ Novos mappers sem afetar existentes

### Legibilidade
- ✅ Nomes descritivos
- ✅ Métodos pequenos e focados
- ✅ Responsabilidades claras

---

## 🎓 Exemplos de Uso

### Adicionar novo validator:
```typescript
export class DescricaoValidator implements IValidator<string> {
  validate(descricao: string): void {
    if (descricao.length > 500) {
      throw new ValidationError('Descrição muito longa');
    }
  }
}
```

### Trocar implementação de repository:
```typescript
// De in-memory para PostgreSQL
const repository = new QuartoRepositoryPostgres(prisma);
const service = new QuartosService(repository); // Sem mudanças no service!
```

### Adicionar novo mapper:
```typescript
export class QuartoCSVMapper implements IDTOMapper<Quarto, string> {
  toDTO(quarto: Quarto): string {
    return `${quarto.numero},${quarto.tipo},${quarto.precoDiaria}`;
  }
}
```

---

## 📝 Checklist SOLID

- ✅ **SRP**: Cada classe tem uma única responsabilidade
- ✅ **OCP**: Extensível sem modificação (validators, states)
- ✅ **LSP**: Implementações substituíveis (repositories)
- ✅ **ISP**: Interfaces segregadas (Reader/Writer)
- ✅ **DIP**: Dependências de abstrações (interfaces)

## 📝 Checklist Clean Code

- ✅ Nomes significativos e descritivos
- ✅ Funções pequenas e focadas
- ✅ Tratamento de erros centralizado
- ✅ DRY aplicado
- ✅ Código auto-explicativo
- ✅ Constantes e enums ao invés de magic numbers/strings
- ✅ Imutabilidade onde possível (readonly)
