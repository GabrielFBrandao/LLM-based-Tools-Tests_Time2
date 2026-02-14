# Testes Unitários - Stack 1 (TypeScript/React)

## 📋 Visão Geral

Testes unitários completos para as funcionalidades de cadastro e edição de quartos, seguindo as melhores práticas de testes em React e TypeScript.

## 🧪 Estrutura de Testes

### 📁 **Arquivos de Teste Criados**

```
src/frontend/
├── hooks/
│   └── __tests__/
│       └── useQuartos.test.ts          # Testes do hook customizado
├── services/
│   └── __tests__/
│       └── quartoService.test.ts        # Testes do serviço de domínio
└── components/
    └── __tests__/
        └── QuartoForm.test.tsx          # Testes do componente React
```

## ✅ Princípios de Teste Aplicados

### 🔹 **AAA Pattern (Arrange, Act, Assert)**
```typescript
// Arrange
const dadosQuarto = criarRequestDTOTeste();
mockedQuartoService.criarQuarto.mockResolvedValue(quartoEsperado);

// Act
const resultado = await result.current.criarQuarto(dadosQuarto);

// Assert
expect(mockedQuartoService.criarQuarto).toHaveBeenCalledWith(dadosQuarto);
expect(resultado).toEqual(quartoEsperado);
```

### 🔹 **Testes Isolados e Independentes**
- `beforeEach()` para limpeza de mocks
- Dados de teste consistentes com factory functions
- Sem dependência entre testes

### 🔹 **Mocks para Dependências Externas**
- Serviços mockados com `jest.fn()`
- EventEmitter mockado
- Repository mockado

### 🔹 **Cobertura Completa**
- Casos de sucesso
- Casos de erro
- Validações
- Estados de loading
- Interações do usuário

## 🎯 Funcionalidades Testadas

### **1. Cadastro de Quarto**

#### ✅ **Casos de Sucesso**
- Dados válidos → Quarto criado com sucesso
- Eventos emitidos corretamente
- Cache atualizado
- Loading states funcionais

#### ✅ **Casos de Erro**
- Número duplicado → Erro específico
- Capacidade inválida (>10) → Erro de validação
- Preço inválido (≤0) → Erro de validação
- Sem camas → Erro de obrigatório
- Inconsistência capacidade vs camas → Erro de negócio
- Erro no repositório → Propagação do erro

#### ✅ **Validações Específicas**
- Formato do número (apenas letras e números)
- Comprimento máximo (10 caracteres)
- Preço mínimo positivo
- Capacidade mínima positiva
- Tipo obrigatório

### **2. Edição de Quarto**

#### ✅ **Casos de Sucesso**
- Quarto existe → Atualizado com sucesso
- Edição parcial → Apenas campos informados alterados
- ID mantido → Sem alteração de identificador
- Eventos emitidos → 'quartoAtualizado'

#### ✅ **Casos de Erro**
- Quarto inexistente → Erro 404
- Número duplicado → Erro de conflito
- Transição de status inválida → Erro de negócio
- Quarto ocupado → Erro de permissão
- Erro no repositório → Propagação

#### ✅ **Validações de Negócio**
- Consistência capacidade vs camas
- Transições de status permitidas
- Permissões baseadas em estado

### **3. Componente React (QuartoForm)**

#### ✅ **Renderização e UI**
- Modo criação vs modo edição
- Campos obrigatórios visíveis
- Estados de loading
- Modo readonly
- Expansão/colapso de comodidades

#### ✅ **Interações do Usuário**
- Preenchimento de campos
- Adição/remoção de camas
- Submissão de formulário
- Cancelamento
- Validações em tempo real

#### ✅ **Validações de Formulário**
- Campos obrigatórios
- Formatos válidos
- Limites de caracteres
- Consistência de dados

## 📊 Exemplos de Testes

### **Teste de Cadastro com Sucesso**
```typescript
it('deve cadastrar quarto com sucesso quando dados são válidos', async () => {
  // Arrange
  const dadosQuarto = criarRequestDTOTeste({ numero: '201' });
  const quartoEsperado = criarQuartoTeste({ numero: '201' });
  mockedQuartoService.criarQuarto.mockResolvedValue(quartoEsperado);

  // Act
  const { result } = renderHook(() => useQuartos(), { wrapper: createWrapper() });
  let resultado;
  await act(async () => {
    resultado = await result.current.criarQuarto(dadosQuarto);
  });

  // Assert
  expect(mockedQuartoService.criarQuarto).toHaveBeenCalledWith(dadosQuarto);
  expect(resultado).toEqual(quartoEsperado);
  expect(result.current.error).toBeNull();
});
```

### **Teste de Validação de Erro**
```typescript
it('deve lançar erro ao tentar cadastrar quarto com número duplicado', async () => {
  // Arrange
  const dadosQuarto = criarRequestDTOTeste({ numero: '101' });
  const erroEsperado = new Error('Já existe um quarto com o número: 101');
  mockedQuartoService.criarQuarto.mockRejectedValue(erroEsperado);

  // Act & Assert
  await expect(
    act(() => result.current.criarQuarto(dadosQuarto))
  ).rejects.toThrow('Já existe um quarto com o número: 101');

  expect(mockedQuartoService.criarQuarto).toHaveBeenCalledWith(dadosQuarto);
  expect(result.current.error).toBeTruthy();
});
```

### **Teste de Componente React**
```typescript
it('deve renderizar formulário corretamente em modo criação', () => {
  // Arrange & Act
  renderQuartoForm();

  // Assert
  expect(screen.getByText('Cadastrar Novo Quarto')).toBeInTheDocument();
  expect(screen.getByLabelText('Número do Quarto')).toBeInTheDocument();
  expect(screen.getByLabelText('Tipo do Quarto')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /cadastrar/i })).toBeInTheDocument();
});
```

### **Teste de Interação do Usuário**
```typescript
it('deve cadastrar quarto com sucesso quando dados são válidos', async () => {
  // Arrange
  const quartoCriado = criarQuartoTeste({ numero: '201' });
  const { Quarto } = require('../../domain/entities/Quarto');
  Quarto.criar.mockReturnValue(quartoCriado);

  const user = userEvent.setup();
  renderQuartoForm();

  // Act
  await user.type(screen.getByLabelText('Número do Quarto'), '201');
  await user.selectOptions(screen.getByLabelText('Tipo do Quarto'), 'MODERNO');
  await user.type(screen.getByLabelText('Capacidade'), '2');
  await user.type(screen.getByLabelText('Preço por Noite (R$)', '200');
  await user.click(screen.getByRole('button', { name: /cadastrar/i }));

  // Assert
  await waitFor(() => {
    expect(mockQuartoCriar).toHaveBeenCalledWith(
      expect.objectContaining({
        numero: '201',
        tipo: TipoQuarto.MODERNO,
        capacidade: 2,
        precoPorNoite: 200
      })
    );
  });
});
```

## 🔧 Configuração de Testes

### **Dependências Necessárias**
```json
{
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/user-event": "^14.4.3",
    "@tanstack/react-query": "^4.0.0",
    "jest": "^29.5.0",
    "@types/jest": "^29.5.0",
    "ts-jest": "^29.1.0"
  }
}
```

### **Configuração Jest (jest.config.js)**
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|tsx)',
    '<rootDir>/src/**/*.(test|spec).(ts|tsx)',
  ],
};
```

### **Setup de Testes (setupTests.ts)**
```typescript
import '@testing-library/jest-dom';

// Mocks globais
jest.mock('../../domain/interfaces/IEventEmitter', () => ({
  EventEmitter: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    removeAllListeners: jest.fn(),
    listenerCount: jest.fn(),
    eventNames: jest.fn(),
  })),
}));
```

## 📈 Métricas de Cobertura

### **Cobertura Esperada**
- **Lines**: >90%
- **Functions**: >90%
- **Branches**: >85%
- **Statements**: >90%

### **Cenários Cobertos**
- ✅ Todos os casos de sucesso
- ✅ Todos os casos de erro conhecidos
- ✅ Validações de entrada
- ✅ Estados de loading
- ✅ Interações de UI
- ✅ Renderização condicional
- ✅ Eventos e callbacks

## 🚀 Como Executar os Testes

### **Executar Todos os Testes**
```bash
npm test
```

### **Executar com Cobertura**
```bash
npm test -- --coverage
```

### **Executar Testes Específicos**
```bash
# Testes do hook
npm test -- src/frontend/hooks/__tests__/useQuartos.test.ts

# Testes do serviço
npm test -- src/frontend/services/__tests__/quartoService.test.ts

# Testes do componente
npm test -- src/frontend/components/__tests__/QuartoForm.test.tsx
```

### **Executar em Modo Watch**
```bash
npm test -- --watch
```

## 🎯 Benefícios Alcançados

### 🔧 **Qualidade do Código**
- **Confiança nas refatorações** com testes automatizados
- **Prevenção de regressões** com cobertura completa
- **Documentação viva** através dos testes

### 🧪 **Manutenibilidade**
- **Testes isolados** fáceis de manter
- **Factory functions** para dados de teste consistentes
- **Mocks controlados** para dependências externas

### 🔄 **Desenvolvimento Rápido**
- **Feedback imediato** com testes automatizados
- **Debugging facilitado** com testes específicos
- **Integração contínua** com testes confiáveis

### 🛡️ **Robustez**
- **Validações completas** testadas
- **Casos de erro** cobertos
- **Estados extremos** validados

## 📝 Práticas Recomendadas

### **✅ Boas Práticas**
- Nomes descritivos que indicam intenção
- Testes pequenos e focados
- AAA Pattern claro
- Factory functions para dados
- Mocks específicos e controlados
- Asserts específicos e relevantes

### **❌ Evitar**
- Testes muito longos
- Múltiplos asserts por teste
- Dependência entre testes
- Mocks excessivos
- Testes de implementação
- Testes frágeis

## 🔄 Integração Contínua

### **GitHub Actions**
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3
```

Os testes garantem qualidade e confiança no código, cobrindo todos os cenários importantes para as funcionalidades de cadastro e edição de quartos.
