# Decisões de Implementação - Módulo de Quartos

## 📋 Visão Geral

Este documento explica as principais decisões de implementação tomadas no desenvolvimento do módulo de Gestão de Quartos, com justificativas técnicas e trade-offs considerados.

---

## 🏗️ Arquitetura em Camadas

### Decisão: Arquitetura em 4 Camadas

```
Controller → Service → Repository → Database
```

**Justificativa:**
- ✅ Separação clara de responsabilidades
- ✅ Facilita testes (cada camada testável isoladamente)
- ✅ Permite trocar implementações sem afetar outras camadas
- ✅ Padrão amplamente conhecido (fácil onboarding)

**Trade-offs:**
- ❌ Overhead de camadas para operações simples
- ✅ Mitigado: Benefício de manutenibilidade supera overhead

---

## 🎯 State Pattern para Status de Quarto

### Decisão: Usar State Pattern ao invés de if/else

**Antes (sem pattern):**
```typescript
alterarStatus(novoStatus: StatusQuarto) {
  if (this.status === 'LIVRE') {
    if (novoStatus === 'OCUPADO' || novoStatus === 'MANUTENCAO') {
      this.status = novoStatus;
    } else {
      throw new Error('Transição inválida');
    }
  } else if (this.status === 'OCUPADO') {
    // ... mais condicionais
  }
  // ... código complexo e difícil de manter
}
```

**Depois (com State Pattern):**
```typescript
class QuartoLivreState extends QuartoState {
  proximosEstadosPermitidos(): StatusQuarto[] {
    return [StatusQuarto.OCUPADO, StatusQuarto.MANUTENCAO, StatusQuarto.LIMPEZA];
  }
}
```

**Justificativa:**
- ✅ Encapsula comportamento de cada estado
- ✅ Fácil adicionar novos estados (Open/Closed Principle)
- ✅ Elimina condicionais complexos
- ✅ Validação de transições centralizada

**Trade-offs:**
- ❌ Mais classes (uma por estado)
- ✅ Mitigado: Clareza e manutenibilidade compensam

---

## 🔍 Validators Separados

### Decisão: Um validator por responsabilidade

**Justificativa:**
- ✅ Single Responsibility Principle
- ✅ Reutilizáveis em diferentes contextos
- ✅ Fácil testar isoladamente
- ✅ Fácil adicionar novos validators

**Exemplo:**
```typescript
// Cada validator valida apenas um aspecto
new NumeroQuartoValidator()
new CapacidadeValidator()
new PrecoValidator()

// Compostos quando necessário
new CriarQuartoValidator(
  numeroValidator,
  capacidadeValidator,
  precoValidator,
  tipoValidator
)
```

**Alternativa Rejeitada:** Validator monolítico
- ❌ Difícil testar
- ❌ Difícil reutilizar
- ❌ Viola SRP

---

## 🗺️ Mappers Separados

### Decisão: Mappers específicos para cada contexto

**Justificativa:**
- ✅ Diferentes representações para diferentes necessidades
- ✅ Otimização de transferência de dados
- ✅ Segurança (não expõe entidade diretamente)

**Exemplo:**
```typescript
// Listagem: apenas dados essenciais
QuartoListMapper → { id, numero, tipo, preco, status }

// Detalhes: todos os dados
QuartoResponseMapper → { ...todos os campos, camas[] }
```

**Benefício:** Lista de 100 quartos transfere ~70% menos dados

---

## 🚨 Erros Customizados

### Decisão: Hierarquia de erros de domínio

**Justificativa:**
- ✅ Type safety (instanceof para identificar)
- ✅ Mensagens consistentes
- ✅ Facilita mapeamento para HTTP status
- ✅ Melhor debugging (stack trace específico)

**Exemplo:**
```typescript
try {
  await service.buscarPorId(999);
} catch (error) {
  if (error instanceof QuartoNaoEncontradoError) {
    return res.status(404).json({ error: error.message });
  }
}
```

**Alternativa Rejeitada:** Strings de erro
- ❌ Sem type safety
- ❌ Difícil identificar tipo de erro
- ❌ Mensagens inconsistentes

---

## 🔌 Dependency Injection

### Decisão: Injetar dependências via construtor

**Justificativa:**
- ✅ Facilita testes (pode injetar mocks)
- ✅ Flexibilidade (trocar implementações)
- ✅ Explicita dependências
- ✅ Dependency Inversion Principle

**Exemplo:**
```typescript
// Service não conhece implementação concreta
constructor(private repository: IQuartoRepository) {}

// Pode injetar qualquer implementação
new QuartosService(new QuartoRepositoryInMemory())
new QuartosService(new QuartoRepositoryPostgres(prisma))
```

**Alternativa Rejeitada:** new dentro da classe
- ❌ Acoplamento forte
- ❌ Difícil testar
- ❌ Difícil trocar implementação

---

## 📦 Interface Segregation

### Decisão: Separar IQuartoReader e IQuartoWriter

**Justificativa:**
- ✅ Clientes dependem apenas do que usam
- ✅ Permite implementações read-only ou write-only
- ✅ Facilita testes (mock apenas o necessário)

**Exemplo:**
```typescript
// Service que só lê pode depender apenas de IQuartoReader
class RelatorioService {
  constructor(private reader: IQuartoReader) {}
}

// Service completo usa ambas
class QuartosService {
  constructor(private repository: IQuartoRepository) {}
}
```

**Benefício:** Princípio do menor privilégio

---

## 🎭 Arrow Functions no Controller

### Decisão: Usar arrow functions para métodos do controller

**Justificativa:**
- ✅ Bind automático de 'this'
- ✅ Pode usar diretamente em rotas
- ✅ Menos código boilerplate

**Exemplo:**
```typescript
// Com arrow function
criar = async (req, res, next) => { ... }
router.post('/quartos', controller.criar); // ✅ Funciona

// Sem arrow function (método normal)
async criar(req, res, next) { ... }
router.post('/quartos', controller.criar.bind(controller)); // ❌ Precisa bind
```

**Trade-off:**
- ❌ Arrow functions não podem ser sobrescritas
- ✅ Mitigado: Não há necessidade de sobrescrever

---

## 🏭 Factory Pattern

### Decisão: Factory para criar instâncias do módulo

**Justificativa:**
- ✅ Encapsula criação de dependências
- ✅ Centraliza configuração
- ✅ Facilita testes (pode criar factory de teste)
- ✅ Fácil trocar implementações

**Exemplo:**
```typescript
class QuartosModuleFactory {
  static create() {
    const repository = new QuartoRepositoryInMemory();
    const service = new QuartosService(repository);
    const controller = new QuartosController(service);
    return { controller };
  }
}
```

**Benefício:** Trocar de in-memory para PostgreSQL requer mudança em 1 linha

---

## 🧪 Testabilidade

### Decisão: Priorizar testabilidade em todas as decisões

**Estratégias:**
1. **Dependency Injection**: Permite mockar dependências
2. **Interfaces**: Permite criar implementações fake
3. **Métodos privados**: Testáveis via métodos públicos
4. **Validators separados**: Testáveis isoladamente
5. **Mappers separados**: Testáveis isoladamente

**Exemplo de teste:**
```typescript
// Mock de repository
const mockRepository: IQuartoRepository = {
  findById: jest.fn().mockResolvedValue(quartoMock),
  // ... outros métodos
};

// Injetar mock
const service = new QuartosService(mockRepository);

// Testar
await service.buscarPorId(1);
expect(mockRepository.findById).toHaveBeenCalledWith(1);
```

---

## 📊 DTOs vs Entidades

### Decisão: Separar DTOs de Entidades

**Justificativa:**
- ✅ Entidades não são expostas diretamente (segurança)
- ✅ Controle sobre serialização
- ✅ Diferentes representações para diferentes contextos
- ✅ Validações de entrada separadas de lógica de domínio

**Fluxo:**
```
Request → DTO → Validator → Entity → Repository
Repository → Entity → Mapper → DTO → Response
```

**Alternativa Rejeitada:** Usar entidades diretamente
- ❌ Expõe estrutura interna
- ❌ Dificulta mudanças
- ❌ Mistura validação com domínio

---

## 🔄 Fail-Fast

### Decisão: Validar e falhar imediatamente

**Justificativa:**
- ✅ Detecta erros cedo
- ✅ Evita processamento desnecessário
- ✅ Mensagens de erro mais claras
- ✅ Facilita debugging

**Exemplo:**
```typescript
// Valida no construtor
constructor(numero: number) {
  if (numero <= 0) {
    throw new Error('Número inválido'); // Fail-fast
  }
  this.numero = numero;
}
```

**Alternativa Rejeitada:** Validação lazy
- ❌ Erros descobertos tarde
- ❌ Estado inconsistente possível

---

## 🎯 Métodos Privados Descritivos

### Decisão: Extrair lógica em métodos privados com nomes descritivos

**Justificativa:**
- ✅ Legibilidade (código auto-documentado)
- ✅ Reutilização
- ✅ Facilita testes (via métodos públicos)
- ✅ Single Responsibility

**Exemplo:**
```typescript
// Antes
async criar(dto: CriarQuartoDTO) {
  const existe = await this.repository.findByNumero(dto.numero);
  if (existe) throw new Error('Já existe');
  // ... mais lógica
}

// Depois
async criar(dto: CriarQuartoDTO) {
  await this.verificarNumeroUnico(dto.numero);
  const quarto = this.criarQuartoFromDTO(dto);
  return await this.repository.create(quarto);
}

private async verificarNumeroUnico(numero: number) { ... }
private criarQuartoFromDTO(dto: CriarQuartoDTO) { ... }
```

---

## 📝 Comentários Explicativos

### Decisão: Comentar decisões, não código óbvio

**Diretrizes:**
- ✅ Explicar **por que**, não **o que**
- ✅ Documentar decisões de design
- ✅ Explicar trade-offs
- ✅ Avisar sobre gotchas

**Exemplo:**
```typescript
// ❌ Ruim (óbvio)
// Incrementa contador
contador++;

// ✅ Bom (explica decisão)
// Usar Map ao invés de Array para O(1) lookup
private quartos: Map<number, Quarto> = new Map();
```

---

## 🎓 Conclusão

Todas as decisões foram tomadas considerando:
1. **Manutenibilidade**: Código fácil de entender e modificar
2. **Testabilidade**: Fácil escrever testes
3. **Extensibilidade**: Fácil adicionar funcionalidades
4. **Performance**: Adequada para o contexto
5. **Princípios SOLID**: Aplicados consistentemente

O resultado é um código limpo, testável e fácil de manter! 🚀
