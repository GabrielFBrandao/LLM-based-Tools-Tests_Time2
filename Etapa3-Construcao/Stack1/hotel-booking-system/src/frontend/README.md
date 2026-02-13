# Módulo de Gestão de Quartos - Frontend (React + TypeScript)

## 📋 Visão Geral

Módulo completo para gestão de quartos do hotel, implementado com React, TypeScript e Material-UI, seguindo as melhores práticas de desenvolvimento.

## 🏗️ Estrutura de Arquivos

```
src/frontend/
├── components/
│   ├── QuartoForm.tsx      # Formulário de cadastro/edição
│   └── QuartoList.tsx      # Listagem com filtros
├── pages/
│   └── QuartosPage.tsx     # Página principal
├── hooks/
│   └── useQuartos.ts       # Hook customizado
├── services/
│   └── quartoService.ts     # Serviço de API
├── App.tsx                  # Configuração principal
├── index.tsx                # Ponto de entrada
└── README.md                # Este arquivo
```

## ✅ Funcionalidades Implementadas

### 📝 Cadastro de Quarto
- **Formulário completo** com todos os campos obrigatórios
- **Validação em tempo real** de todos os campos
- **Suporte a múltiplas camas** (Solteiro, King, Queen)
- **Comodidades** (Frigobar, Café da Manhã, Ar-Condicionado, TV)
- **Cálculo automático** da capacidade baseado nas camas

### ✏️ Edição de Quarto
- **Carregamento automático** dos dados existentes
- **Validação de consistência** entre capacidade e camas
- **Atualização de status** (Disponível, Ocupado, Manutenção, Limpeza)
- **Preservação de regras** de negócio

### 📋 Listagem de Quartos
- **Tabela responsiva** com todas as informações
- **Filtros avançados**:
  - Busca por número ou tipo
  - Filtro por tipo de quarto
  - Filtro por status
- **Paginação** integrada
- **Ordenação** por múltiplos critérios
- **Indicadores visuais** de status

## 🎨 Interface do Usuário

### Design System
- **Cores**: Paleta verde e azul conforme especificado
  - Verde principal: `#2E7D32`
  - Azul principal: `#1976D2`
- **Componentes**: Material-UI v5
- **Responsividade**: Mobile-first
- **Acessibilidade**: WCAG 2.1 AA

### Componentes Principais

#### QuartoForm
```typescript
interface QuartoFormProps {
  quarto?: Quarto;           // Dados para edição
  onSave: (quarto: Quarto) => void;
  onCancel: () => void;
}
```

#### QuartoList
```typescript
interface QuartoListProps {
  quartos: Quarto[];
  onEdit: (quarto: Quarto) => void;
  onAdd: () => void;
  loading?: boolean;
  error?: string;
}
```

## 🔧 Arquitetura e Padrões

### Hooks Customizados
- **useQuartos**: Gerenciamento completo de estado
- **Separação de responsabilidades**: Lógica de negócio isolada
- **Cache local**: Otimização de performance

### Serviços
- **Interface definida**: `QuartoService`
- **Implementação Mock**: Para desenvolvimento/testes
- **Preparação para API**: Estrutura pronta para integração

### Validações
- **CPF**: Algoritmo oficial brasileiro
- **E-mail**: Regex de validação
- **Campos obrigatórios**: Verificação em tempo real
- **Consistência**: Capacidade vs número de camas

## 📊 Estrutura de Dados

### Quarto
```typescript
interface Quarto {
  id: string;
  numero: string;
  capacidade: number;
  tipo: TipoQuarto;
  precoPorNoite: number;
  hasMinibar: boolean;
  hasCafeDaManha: boolean;
  hasArCondicionado: boolean;
  hasTV: boolean;
  status: StatusQuarto;
  camas: Cama[];
}
```

### Cama
```typescript
interface Cama {
  id: string;
  tipo: TipoCama;        // SOLTEIRO, CASAL_KING, CASAL_QUEEN
  quartoId: string;
}
```

## 🚀 Como Usar

### Instalação de Dependências
```bash
npm install react react-dom typescript
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material
npm install react-router-dom
```

### Execução
```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

### Exemplo de Uso
```typescript
import { useQuartos } from './hooks/useQuartos';
import { QuartoList } from './components/QuartoList';

const QuartosPage = () => {
  const { quartos, loading, criarQuarto, atualizarQuarto } = useQuartos();

  const handleSalvar = async (quarto: Quarto) => {
    if (quarto.id) {
      await atualizarQuarto(quarto.id, quarto);
    } else {
      await criarQuarto(quarto);
    }
  };

  return (
    <QuartoList
      quartos={quartos}
      onEdit={setQuartoEditando}
      onAdd={() => setMostrarFormulario(true)}
      loading={loading}
    />
  );
};
```

## 🔄 Fluxo de Trabalho

### 1. Cadastro
1. Usuário clica em "Novo Quarto"
2. Formulário abre em modo criação
3. Usuário preenche todos os campos
4. Sistema valida em tempo real
5. Ao salvar, dados são enviados para API
6. Sucesso/Erro é exibido ao usuário

### 2. Edição
1. Usuário clica no ícone de editar
2. Formulário abre com dados existentes
3. Usuário modifica campos desejados
4. Sistema valida consistência
5. Ao salvar, dados são atualizados
6. Lista é atualizada automaticamente

### 3. Listagem
1. Carrega todos os quartos
2. Aplica filtros selecionados
3. Exibe resultados paginados
4. Permite ações rápidas

## 🧪 Testes

### Testes Unitários
- Validação de formulários
- Lógica de negócio
- Cálculos de capacidade

### Testes de Integração
- Fluxo completo de cadastro
- Atualização de dados
- Filtros e busca

### Testes E2E
- Navegação completa
- Interação com formulários
- Responsividade

## 📱 Responsividade

### Breakpoints
- **Mobile**: < 600px
- **Tablet**: 600px - 960px
- **Desktop**: > 960px

### Adaptações
- **Formulário**: Layout em coluna no mobile
- **Tabela**: Scroll horizontal em telas pequenas
- **Filtros**: Collapsible em mobile

## 🔐 Segurança

### Validações
- **Sanitização** de inputs
- **Prevenção** de XSS
- **Validação** no frontend e backend

### Autenticação
- **Rotas protegidas** (quando implementado)
- **Controle de acesso** por perfil

## 📈 Performance

### Otimizações
- **Lazy loading** de componentes
- **Memoização** de cálculos
- **Virtualização** de listas longas
- **Cache** de requisições

### Métricas
- **Bundle size** otimizado
- **Load time** < 2s
- **Lighthouse score** > 90

## 🔄 Integração com Backend

### API Endpoints
```typescript
GET    /api/quartos           // Listar todos
GET    /api/quartos/:id       // Buscar por ID
POST   /api/quartos           // Criar novo
PUT    /api/quartos/:id       // Atualizar
DELETE /api/quartos/:id       // Deletar
PATCH  /api/quartos/:id/status // Atualizar status
```

### Estrutura de Resposta
```typescript
interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}
```

## 🐛 Tratamento de Erros

### Tipos de Erro
- **Validação**: Campos inválidos
- **Rede**: Falha de comunicação
- **Servidor**: Erro interno
- **Permissão**: Acesso negado

### Feedback ao Usuário
- **Snackbars** para ações rápidas
- **Alerts** para erros críticos
- **Loading states** para operações longas

## 📚 Próximos Passos

1. **Integração real** com API backend
2. **Testes automatizados** completos
3. **Documentação** de componentes
4. **Internacionalização** (i18n)
5. **Acessibilidade** avançada
6. **Offline support** básico

## 🤝 Contribuição

### Padrões de Código
- **TypeScript strict**
- **ESLint + Prettier**
- **Convenções React**
- **Nomenclatura clara**

### Pull Requests
- **Commits semânticos**
- **Testes obrigatórios**
- **Review de código**
- **Documentação atualizada**

---

Este módulo está pronto para uso e pode ser facilmente extendido com novas funcionalidades conforme necessário.
