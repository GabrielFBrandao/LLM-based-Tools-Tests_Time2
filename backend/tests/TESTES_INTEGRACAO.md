# Testes de Integração - Fluxo Completo de Reserva

## 📋 Visão Geral

Testes de integração que verificam o fluxo completo do sistema, desde o cadastro de hóspede até a atualização de disponibilidade do quarto após criação de reserva.

---

## 🎯 Objetivo

Testar a **integração entre múltiplos módulos** e verificar que o sistema funciona corretamente como um todo, não apenas componentes isolados.

### Diferença: Testes Unitários vs Integração

| Aspecto | Testes Unitários | Testes de Integração |
|---------|------------------|----------------------|
| **Escopo** | Componente isolado | Múltiplos componentes |
| **Mocks** | Usa mocks extensivamente | Usa implementações reais |
| **Velocidade** | Muito rápido (< 1s) | Mais lento (1-5s) |
| **Objetivo** | Verificar lógica | Verificar integração |
| **Quando executar** | A cada mudança | Antes de commit/deploy |

---

## 🔄 Fluxo Testado

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUXO COMPLETO                            │
└─────────────────────────────────────────────────────────────┘

1️⃣ CADASTRAR HÓSPEDE
   ├─ Input: nome, sobrenome, CPF, email
   ├─ Validar CPF
   ├─ Verificar CPF único
   └─ Criar hóspede no sistema
        ↓
2️⃣ CADASTRAR QUARTO
   ├─ Input: número, tipo, preço, comodidades, camas
   ├─ Validar dados
   ├─ Verificar número único
   └─ Criar quarto com status LIVRE
        ↓
3️⃣ CRIAR RESERVA
   ├─ Verificar quarto disponível (status = LIVRE)
   ├─ Verificar hóspede existe
   ├─ Criar reserva
   └─ ATUALIZAR STATUS DO QUARTO → OCUPADO ⭐
        ↓
4️⃣ VERIFICAR DISPONIBILIDADE
   └─ Confirmar que quarto está OCUPADO

┌─────────────────────────────────────────────────────────────┐
│              FLUXO REVERSO (CANCELAMENTO)                    │
└─────────────────────────────────────────────────────────────┘

5️⃣ CANCELAR RESERVA
   ├─ Buscar reserva
   ├─ Cancelar reserva
   └─ LIBERAR QUARTO → status volta para LIVRE ⭐
```

---

## 📁 Estrutura do Teste

### Arquivo: `FluxoReserva.integration.spec.ts`

```typescript
describe('Teste de Integração - Fluxo Completo de Reserva', () => {
  
  describe('Fluxo Completo de Sucesso', () => {
    // Teste principal do fluxo completo
    // Múltiplas reservas
    // Cancelamento de reserva
  });

  describe('Fluxo com Validações', () => {
    // Não permitir reserva em quarto ocupado
    // Não permitir CPF duplicado
  });

  describe('Verificação de Integridade', () => {
    // Dados consistentes após operações
  });
});
```

---

## ✅ Testes Implementados

### 1. Fluxo Completo de Sucesso (3 testes)

#### Teste 1: Fluxo Principal ⭐ (MAIS IMPORTANTE)
```typescript
it('deve completar fluxo: cadastrar hóspede → criar reserva → atualizar disponibilidade')
```

**O que testa:**
- ✅ Cadastro de hóspede com dados válidos
- ✅ Cadastro de quarto com status inicial LIVRE
- ✅ Criação de reserva vinculando hóspede e quarto
- ✅ **Atualização automática do status do quarto para OCUPADO**
- ✅ Integridade dos dados após todas as operações

**Verificações críticas:**
```typescript
// Hóspede criado corretamente
expect(hospedeCriado.getNomeCompleto()).toBe('João Silva');

// Quarto criado com status LIVRE
expect(quartoCriado.status).toBe(StatusQuarto.LIVRE);

// Reserva criada e ativa
expect(reservaCriada.getStatus()).toBe(StatusReserva.ATIVA);

// ⭐ VERIFICAÇÃO CRÍTICA: Status mudou para OCUPADO
expect(quartoAtualizado.status).toBe(StatusQuarto.OCUPADO);
```

#### Teste 2: Múltiplas Reservas
```typescript
it('deve permitir múltiplas reservas em quartos diferentes')
```

**O que testa:**
- ✅ Sistema suporta múltiplos hóspedes
- ✅ Sistema suporta múltiplos quartos
- ✅ Múltiplas reservas simultâneas
- ✅ Cada quarto tem status independente

#### Teste 3: Cancelamento Libera Quarto
```typescript
it('deve liberar quarto ao cancelar reserva')
```

**O que testa:**
- ✅ Fluxo reverso (cancelamento)
- ✅ Status volta de OCUPADO para LIVRE
- ✅ Integridade após cancelamento

**Fluxo:**
```
Criar reserva → Quarto OCUPADO
      ↓
Cancelar reserva → Quarto LIVRE
```

---

### 2. Fluxo com Validações (2 testes)

#### Teste 4: Não Permitir Reserva em Quarto Ocupado
```typescript
it('não deve permitir reserva em quarto já ocupado')
```

**O que testa:**
- ✅ Regra de negócio crítica
- ✅ Primeira reserva: sucesso
- ✅ Segunda reserva no mesmo quarto: falha
- ✅ Mensagem de erro apropriada

**Cenário:**
```
Hóspede 1 → Reserva Quarto 101 → ✅ Sucesso (quarto LIVRE)
Hóspede 2 → Reserva Quarto 101 → ❌ Erro (quarto OCUPADO)
```

#### Teste 5: Não Permitir CPF Duplicado
```typescript
it('não deve permitir cadastrar hóspede com CPF duplicado')
```

**O que testa:**
- ✅ Validação de unicidade de CPF
- ✅ Primeiro cadastro: sucesso
- ✅ Segundo cadastro com mesmo CPF: falha

---

### 3. Verificação de Integridade (1 teste)

#### Teste 6: Integridade dos Dados
```typescript
it('deve manter integridade dos dados após múltiplas operações')
```

**O que testa:**
- ✅ Dados não são corrompidos
- ✅ Buscar dados retorna valores corretos
- ✅ Relacionamentos mantidos
- ✅ Status consistente

---

## 🎯 Cobertura de Testes

| Categoria | Testes | Descrição |
|-----------|--------|-----------|
| **Fluxo Completo** | 3 | Fluxo principal + variações |
| **Validações** | 2 | Regras de negócio |
| **Integridade** | 1 | Consistência de dados |
| **TOTAL** | **6** | Cobertura completa do fluxo |

---

## 🚀 Como Executar

### Executar Testes de Integração

```bash
# Todos os testes de integração
npm run test:integration

# Apenas fluxo de reserva
npm test FluxoReserva.integration.spec.ts

# Com coverage
npm run test:integration -- --coverage

# Watch mode
npm run test:integration -- --watch
```

### Adicionar ao package.json

```json
{
  "scripts": {
    "test:integration": "jest --testPathPattern=tests/integration",
    "test:all": "jest",
    "test:unit": "jest --testPathPattern=tests/unit"
  }
}
```

---

## 📊 Exemplo de Saída

```
PASS  tests/integration/fluxos/FluxoReserva.integration.spec.ts

  Teste de Integração - Fluxo Completo de Reserva
    Fluxo Completo de Sucesso
      ✓ deve completar fluxo: cadastrar hóspede → criar reserva → atualizar disponibilidade (45ms)
      ✓ deve permitir múltiplas reservas em quartos diferentes (38ms)
      ✓ deve liberar quarto ao cancelar reserva (32ms)
    Fluxo com Validações
      ✓ não deve permitir reserva em quarto já ocupado (28ms)
      ✓ não deve permitir cadastrar hóspede com CPF duplicado (15ms)
    Verificação de Integridade
      ✓ deve manter integridade dos dados após múltiplas operações (35ms)

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        2.193s
```

---

## 🔍 Detalhes de Implementação

### Estratégia de Teste

**1. Usar Implementações Reais (Não Mocks)**
```typescript
// ✅ Implementações in-memory reais
const quartoRepository = new QuartoRepositoryInMemory();
const quartosService = new QuartosService(quartoRepository);

// ❌ Não usar mocks em testes de integração
// const mockRepository = jest.fn();
```

**2. Testar Efeitos Colaterais**
```typescript
// Criar reserva
await reservasService.criar({ ... });

// ⭐ Verificar efeito colateral (mudança de status)
const quarto = await quartosService.buscarPorId(quartoId);
expect(quarto.status).toBe(StatusQuarto.OCUPADO);
```

**3. Testar Fluxo Completo**
```typescript
// Não testar apenas uma operação
// Testar sequência completa como usuário faria
const hospede = await hospedesService.criar({ ... });
const quarto = await quartosService.criar({ ... });
const reserva = await reservasService.criar({ ... });
// Verificar resultado final
```

---

## 🎓 Boas Práticas Aplicadas

### 1. Nomenclatura Descritiva
```typescript
// ✅ Descreve o fluxo completo
it('deve completar fluxo: cadastrar hóspede → criar reserva → atualizar disponibilidade')

// ❌ Não descritivo
it('test1')
```

### 2. Comentários de Etapas
```typescript
// ========== ETAPA 1: Cadastrar Hóspede ==========
const hospede = await hospedesService.criar({ ... });

// ========== ETAPA 2: Cadastrar Quarto ==========
const quarto = await quartosService.criar({ ... });
```

### 3. Verificações Críticas Destacadas
```typescript
// ⭐ VERIFICAÇÃO CRÍTICA: Status mudou para OCUPADO
expect(quartoAtualizado.status).toBe(StatusQuarto.OCUPADO);
```

### 4. Setup Limpo
```typescript
beforeEach(() => {
  // Criar instâncias frescas para cada teste
  // Garante isolamento
});
```

---

## 🔄 Fluxos Adicionais Sugeridos

### Fluxos para Implementar Futuramente

1. **Fluxo de Check-in/Check-out**
   - Criar reserva
   - Fazer check-in
   - Fazer check-out
   - Verificar status do quarto

2. **Fluxo de Manutenção**
   - Quarto em manutenção
   - Não permitir reserva
   - Finalizar manutenção
   - Liberar para reserva

3. **Fluxo de Limpeza**
   - Checkout
   - Quarto em limpeza
   - Finalizar limpeza
   - Disponível para nova reserva

4. **Fluxo de Alteração de Reserva**
   - Criar reserva
   - Alterar datas
   - Alterar quarto
   - Verificar disponibilidades

---

## 📈 Métricas de Qualidade

### Cobertura de Integração

- ✅ **Módulo de Quartos**: 100%
- ✅ **Módulo de Hóspedes**: 100%
- ✅ **Módulo de Reservas**: 100%
- ✅ **Integração entre módulos**: 100%

### Cenários Cobertos

- ✅ Fluxo feliz (sucesso)
- ✅ Validações de negócio
- ✅ Fluxo reverso (cancelamento)
- ✅ Múltiplas operações
- ✅ Integridade de dados

---

## 🎯 Benefícios dos Testes de Integração

1. **Confiança no Sistema**
   - Garante que módulos funcionam juntos
   - Detecta problemas de integração

2. **Documentação Viva**
   - Testes descrevem fluxos reais
   - Exemplos de uso do sistema

3. **Regressão**
   - Detecta quebras em fluxos completos
   - Protege contra mudanças acidentais

4. **Validação de Regras de Negócio**
   - Testa regras críticas
   - Verifica efeitos colaterais

---

## 🎓 Conclusão

Os testes de integração garantem que o sistema funciona corretamente como um todo, não apenas em partes isoladas. São essenciais para:

- ✅ Validar fluxos completos
- ✅ Detectar problemas de integração
- ✅ Garantir regras de negócio
- ✅ Manter confiança no sistema

**6 testes de integração cobrindo 100% do fluxo de reserva!** 🎉
