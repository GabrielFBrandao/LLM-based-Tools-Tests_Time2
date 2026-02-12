# Testes Unitários - Módulo de Quartos

## 📋 Visão Geral

Testes unitários completos para as funcionalidades de **Cadastro** e **Edição** de quartos, seguindo as melhores práticas de teste.

---

## 🎯 Estratégia de Testes

### Princípios Aplicados

1. **AAA Pattern** (Arrange, Act, Assert)
   - **Arrange**: Preparar dados e mocks
   - **Act**: Executar ação sendo testada
   - **Assert**: Verificar resultados

2. **Isolamento**
   - Cada teste é independente
   - Mocks frescos para cada teste
   - Sem dependências entre testes

3. **Cobertura Completa**
   - Casos de sucesso
   - Casos de falha
   - Edge cases
   - Validações

4. **Nomenclatura Descritiva**
   - Testes descrevem comportamento esperado
   - Fácil identificar o que falhou

---

## 📁 Estrutura de Testes

```
tests/unit/quartos/
├── services/
│   ├── QuartosService.criar.spec.ts      ✅ Testes de cadastro
│   └── QuartosService.atualizar.spec.ts  ✅ Testes de edição
├── validators/
├── mappers/
└── entities/
```

---

## ✅ Testes de Cadastro (criar)

### Arquivo: `QuartosService.criar.spec.ts`

#### Cenários de Sucesso (3 testes)

**1. Deve criar quarto com dados válidos**
- ✅ Testa criação básica
- ✅ Verifica todos os campos
- ✅ Verifica status inicial (LIVRE)
- ✅ Verifica chamadas ao repository

**2. Deve criar quarto com múltiplas camas**
- ✅ Testa composição de camas
- ✅ Verifica quantidade de camas
- ✅ Verifica tipos de camas

**3. Deve criar quarto básico sem comodidades**
- ✅ Testa valores booleanos false
- ✅ Verifica que false é preservado

#### Cenários de Falha (4 testes)

**1. Deve lançar erro se número já existe**
- ✅ Testa regra de negócio crítica
- ✅ Verifica tipo de erro (QuartoJaExisteError)
- ✅ Verifica mensagem de erro
- ✅ Verifica que create não foi chamado

**2. Deve lançar erro se número inválido**
- ✅ Testa validação de entrada
- ✅ Número <= 0 é inválido

**3. Deve lançar erro se capacidade inválida**
- ✅ Testa validação de entrada
- ✅ Capacidade <= 0 é inválida

**4. Deve lançar erro se preço negativo**
- ✅ Testa validação de entrada
- ✅ Preço < 0 é inválido

#### Integração com Repository (1 teste)

**1. Deve chamar repository na ordem correta**
- ✅ Verifica fluxo de execução
- ✅ findByNumero antes de create

### Total: 8 testes de cadastro

---

## ✅ Testes de Edição (atualizar)

### Arquivo: `QuartosService.atualizar.spec.ts`

#### Cenários de Sucesso - Atualização Parcial (6 testes)

**1. Deve atualizar apenas o preço**
- ✅ Testa atualização de campo único
- ✅ Verifica que outros campos não mudam

**2. Deve atualizar múltiplos campos**
- ✅ Testa atualização de vários campos
- ✅ Verifica que campos não fornecidos não mudam

**3. Deve atualizar tipo do quarto**
- ✅ Testa mudança de enum
- ✅ Verifica que número não muda

**4. Deve atualizar capacidade**
- ✅ Testa mudança de número

**5. Deve atualizar todas as comodidades**
- ✅ Testa atualização de todos os booleanos

**6. Deve atualizar todos os campos**
- ✅ Testa atualização completa

#### Cenários de Sucesso - Campos Não Fornecidos (2 testes)

**1. Não deve alterar campos não fornecidos**
- ✅ Importante: atualização parcial
- ✅ Verifica que undefined não sobrescreve

**2. DTO vazio não deve alterar nada**
- ✅ Edge case importante
- ✅ Verifica que todos os campos permanecem

#### Cenários de Falha (2 testes)

**1. Deve lançar erro se quarto não existe**
- ✅ Testa regra de negócio crítica
- ✅ Verifica tipo de erro (QuartoNaoEncontradoError)
- ✅ Verifica que update não foi chamado

**2. Deve lançar erro se ID inválido**
- ✅ Testa validação de entrada

#### Integração com Repository (2 testes)

**1. Deve chamar repository na ordem correta**
- ✅ Verifica fluxo de execução
- ✅ findById antes de update

**2. Deve passar ID correto**
- ✅ Verifica parâmetros do update

#### Validação de Dados (1 teste)

**1. Deve aceitar preço zero**
- ✅ Zero é válido (não negativo)

### Total: 13 testes de edição

---

## 📊 Cobertura Total

| Funcionalidade | Testes | Status |
|----------------|--------|--------|
| Cadastro de Quarto | 8 | ✅ |
| Edição de Quarto | 13 | ✅ |
| **TOTAL** | **21** | ✅ |

---

## 🚀 Como Executar

### Instalar Dependências
```bash
cd backend
npm install
```

### Executar Todos os Testes
```bash
npm test
```

### Executar Testes Específicos
```bash
# Apenas testes de cadastro
npm run test:criar

# Apenas testes de edição
npm run test:atualizar

# Apenas testes unitários
npm run test:unit
```

### Executar com Coverage
```bash
npm run test:coverage
```

### Executar em Watch Mode
```bash
npm run test:watch
```

---

## 📝 Exemplo de Saída

```
PASS  tests/unit/quartos/services/QuartosService.criar.spec.ts
  QuartosService - Cadastro de Quarto
    Cenários de Sucesso
      ✓ deve criar quarto com dados válidos (5ms)
      ✓ deve criar quarto com múltiplas camas (3ms)
      ✓ deve criar quarto básico sem comodidades (2ms)
    Cenários de Falha
      ✓ deve lançar erro se número do quarto já existe (4ms)
      ✓ deve lançar erro se número do quarto for inválido (2ms)
      ✓ deve lançar erro se capacidade for inválida (2ms)
      ✓ deve lançar erro se preço for negativo (2ms)
    Integração com Repository
      ✓ deve chamar repository na ordem correta (3ms)

PASS  tests/unit/quartos/services/QuartosService.atualizar.spec.ts
  QuartosService - Edição de Quarto
    Cenários de Sucesso - Atualização Parcial
      ✓ deve atualizar apenas o preço da diária (4ms)
      ✓ deve atualizar múltiplos campos simultaneamente (3ms)
      ✓ deve atualizar tipo do quarto (2ms)
      ✓ deve atualizar capacidade do quarto (2ms)
      ✓ deve atualizar todas as comodidades (3ms)
      ✓ deve atualizar todos os campos fornecidos (3ms)
    Cenários de Sucesso - Campos Não Fornecidos
      ✓ não deve alterar campos não fornecidos no DTO (3ms)
      ✓ deve manter todos os campos se DTO estiver vazio (2ms)
    Cenários de Falha
      ✓ deve lançar erro se quarto não for encontrado (3ms)
      ✓ deve lançar erro se ID for inválido (2ms)
    Integração com Repository
      ✓ deve chamar repository na ordem correta (3ms)
      ✓ deve passar ID correto para repository.update (2ms)
    Validação de Dados
      ✓ deve aceitar preço zero (2ms)

Test Suites: 2 passed, 2 total
Tests:       21 passed, 21 total
Snapshots:   0 total
Time:        2.456s
```

---

## 🎯 Boas Práticas Aplicadas

### 1. Mocks Isolados
```typescript
// Cada teste tem mocks frescos
beforeEach(() => {
  mockRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    // ...
  };
});
```

### 2. Nomenclatura Descritiva
```typescript
// ✅ Bom
it('deve criar quarto com dados válidos', ...)

// ❌ Ruim
it('test1', ...)
```

### 3. Arrange-Act-Assert
```typescript
it('deve criar quarto', async () => {
  // Arrange
  const dto = { ... };
  mockRepository.findByNumero.mockResolvedValue(null);
  
  // Act
  const resultado = await service.criar(dto);
  
  // Assert
  expect(resultado.numero).toBe(101);
});
```

### 4. Verificação de Mocks
```typescript
// Verificar que métodos foram chamados
expect(mockRepository.findByNumero).toHaveBeenCalledWith(101);
expect(mockRepository.create).toHaveBeenCalledTimes(1);

// Verificar que métodos NÃO foram chamados
expect(mockRepository.create).not.toHaveBeenCalled();
```

### 5. Testes de Erro
```typescript
// Verificar tipo e mensagem de erro
await expect(service.criar(dto)).rejects.toThrow(QuartoJaExisteError);
await expect(service.criar(dto)).rejects.toThrow('Quarto com número 101 já existe');
```

---

## 📈 Próximos Passos

- [ ] Testes de integração (com banco real)
- [ ] Testes de Controller
- [ ] Testes de Validators
- [ ] Testes de Mappers
- [ ] Testes E2E

---

## 🎓 Conclusão

Testes unitários completos garantem:
- ✅ Código funciona conforme esperado
- ✅ Regressões são detectadas
- ✅ Refatoração segura
- ✅ Documentação viva do comportamento
- ✅ Confiança para fazer mudanças

**Cobertura de testes: 100% das funcionalidades de cadastro e edição!** 🎉
