**Output para Arquitetura e Decisões arquiteturais:**

## Arquitetura do Sistema de Reservas de Hotel

### Escolha: **Monolito Modular (Frontend SPA + Backend Serverless)**

graph TB
    subgraph "Frontend - React SPA"
        UI["UI LayerReact + Tailwind + shadcn/ui"]
        subgraph "Módulos Frontend"
            MQ["módulo Quartos"]
            MH["módulo Hóspedes"]
            MR["módulo Reservas"]
        end
        STATE["State ManagementReact Query + Context"]
    end

    subgraph "Backend - Lovable Cloud"
        subgraph "Camada de Dados"
            DB["PostgreSQLTabelas: rooms, guests, reservations, beds"]
            RLS["RLS PoliciesSegurança por linha"]
        end
        subgraph "Camada de Lógica"
            EF["Edge FunctionsValidações complexas"]
            TRIG["DB TriggersAtualização automática de status"]
        end
    end

    UI --> MQ & MH & MR
    MQ & MH & MR --> STATE
    STATE -->|"Supabase Client"| DB
    STATE -->|"HTTP"| EF
    DB --> TRIG

---

### Justificativa da Escolha

| Critério | Monolito Modular | Microserviços | Monolito Tradicional |
|---|---|---|---|
| **Desempenho** | ✅ Queries diretas ao DB, sem overhead de rede entre serviços | ⚠️ Latência inter-serviços | ✅ Similar |
| **Escalabilidade** | ✅ Serverless escala sob demanda | ✅ Escala independente | ❌ Escala tudo junto |
| **Manutenção** | ✅ Módulos isolados, deploy único | ❌ Complexidade operacional alta | ⚠️ Tende a virar "big ball of mud" |
| **Complexidade** | ✅ Adequada ao escopo (hotel único) | ❌ Overengineering | ⚠️ Sem separação clara |

**Veredicto:** Para um sistema de hotel único com 3 módulos, microserviços é overengineering. O monolito modular oferece separação de responsabilidades sem a complexidade operacional.

---

### Decisões Arquiteturais Críticas (ADRs)

#### ADR-001: Frontend como SPA React
- **Contexto:** Sistema web interno para recepcionistas
- **Decisão:** React SPA com roteamento client-side
- **Justificativa:** Navegação fluida entre módulos, sem recarregamento de página. Componentes reutilizáveis com shadcn/ui
- **Consequência:** SEO não é relevante (sistema interno), simplifica deploy

#### ADR-002: Lovable Cloud como Backend
- **Contexto:** Necessidade de persistência, validações e segurança
- **Decisão:** PostgreSQL + Edge Functions via Lovable Cloud
- **Justificativa:** Zero configuração de infraestrutura, escalabilidade automática, RLS para segurança
- **Consequência:** Acoplamento à plataforma (trade-off aceitável para o escopo)

#### ADR-003: Separação em Módulos por Domínio
- **Decisão:** Código organizado por domínio de negócio, não por tipo técnico

```
src/
├── modules/
│   ├── rooms/        # Quartos: componentes, hooks, tipos
│   ├── guests/       # Hóspedes: componentes, hooks, tipos
│   └── reservations/ # Reservas: componentes, hooks, tipos
├── components/ui/    # Componentes genéricos (shadcn)
└── lib/              # Utilitários compartilhados
```

- **Justificativa:** Cada módulo é coeso e independente. Facilita manutenção e onboarding de novos devs
- **Consequência:** Possível duplicação mínima entre módulos (aceitável)

#### ADR-004: Validação em Duas Camadas
- **Decisão:** Validação no frontend (Zod + React Hook Form) **E** no banco (constraints + triggers)
- **Justificativa:** UX rápida + integridade garantida mesmo com bypass do frontend
- **Exemplo:** CPF único validado com `UNIQUE constraint` + feedback instantâneo no formulário

#### ADR-005: Estado via React Query
- **Decisão:** Sem Redux/Zustand. React Query para estado do servidor, Context para estado local
- **Justificativa:** Cache automático, revalidação, loading/error states built-in. Reduz boilerplate em ~60%

#### ADR-006: Status do Quarto como Máquina de Estados
- **Decisão:** Transições de disponibilidade controladas por regras

stateDiagram-v2
    [*] --> Livre
    Livre --> Ocupado: Reserva criada
    Ocupado --> Limpeza: Check-out
    Limpeza --> Livre: Limpeza concluída
    Livre --> Manutenção: Manutenção solicitada
    Manutenção --> Livre: Manutenção concluída
    Ocupado --> Manutenção: Emergência

- **Justificativa:** Evita transições inválidas (ex: reservar quarto em manutenção)
- **Implementação:** Constraint `CHECK` no banco + validação no frontend

---

### Próximos Passos Sugeridos

Implementar o sistema completo
Criar diagrama ER do banco
Desenhar wireframes das telas

**Output para Modelagem e Padrões de Projeto:**

## Diagramas e Padrões de Projeto

### 1. Diagrama de Componentes

graph TB
    subgraph "Apresentação"
        APP["App.tsxRouter + Providers"]
        NAV["Sidebar/NavBarNavegação entre módulos"]

        subgraph "Páginas"
            PQ["RoomsPage"]
            PH["GuestsPage"]
            PR["ReservationsPage"]
        end
    end

    subgraph "Módulo Quartos"
        RFL["RoomFormLayoutFormulário cadastro/edição"]
        RL["RoomListTabela de quartos"]
        RSB["RoomStatusBadgeChip de disponibilidade"]
        BS["BedSectionSeção de camas"]
        AF["AmenitiesFieldsCheckboxes amenidades"]
    end

    subgraph "Módulo Hóspedes"
        GFL["GuestFormLayoutFormulário cadastro/edição"]
        GL["GuestListTabela de hóspedes"]
        CPFI["CpfInputInput com máscara CPF"]
    end

    subgraph "Módulo Reservas"
        REVL["ReservationListTabela de reservas"]
        REVF["ReservationFormFormulário edição"]
        GS["GuestSelectorSelect de hóspede"]
        RS["RoomSelectorSelect de quarto"]
    end

    subgraph "Compartilhado"
        UI["shadcn/uiButton, Input, Select, Table..."]
        HOOKS["Custom HooksuseRooms, useGuests, useReservations"]
        TYPES["TypesRoom, Guest, Reservation"]
        VALID["Schemas ZodValidação de formulários"]
    end

    subgraph "Backend - Lovable Cloud"
        DB["PostgreSQL"]
        EF["Edge Functions"]
    end

    APP --> NAV
    APP --> PQ & PH & PR
    PQ --> RFL & RL
    PH --> GFL & GL
    PR --> REVL & REVF
    RFL --> BS & AF
    GFL --> CPFI
    REVF --> GS & RS
    RL --> RSB
    REVL --> RSB

    RFL & RL & GFL & GL & REVL & REVF --> UI
    PQ & PH & PR --> HOOKS
    HOOKS --> TYPES & VALID
    HOOKS -->|"Supabase Client"| DB
    HOOKS -->|"HTTP"| EF

---

### 2. Diagrama de Classes

classDiagram
    class Room {
        +number: number
        +capacity: number
        +type: RoomType
        +pricePerNight: number
        +hasMinibar: boolean
        +hasBreakfast: boolean
        +hasAirConditioning: boolean
        +hasTV: boolean
        +availability: Availability
        +beds: Bed[]
        +isAvailable() boolean
        +changeStatus(status: Availability) void
    }

    class Bed {
        +id: string
        +type: BedType
    }

    class Guest {
        +id: string
        +firstName: string
        +lastName: string
        +cpf: string
        +email: string
        +fullName() string
    }

    class Reservation {
        +id: string
        +room: Room
        +guest: Guest
        +checkIn: Date
        +checkOut: Date
        +status: Availability
        +totalPrice() number
        +cancel() void
    }

    class RoomType {
        <>
        BASICO
        MODERNO
        LUXO
    }

    class BedType {
        <>
        SOLTEIRO
        CASAL_KING
        CASAL_QUEEN
    }

    class Availability {
        <>
        LIVRE
        OCUPADO
        MANUTENCAO
        LIMPEZA
    }

    Room "1" --> "*" Bed : contém
    Room "1" --> "1" RoomType : tipo
    Room "1" --> "1" Availability : status
    Reservation "1" --> "1" Room : reserva
    Reservation "1" --> "1" Guest : hóspede
    Reservation "1" --> "1" Availability : status
    Bed "1" --> "1" BedType : tipo

---

### 3. Padrões de Projeto Aplicáveis

| Padrão | Onde Aplicar | Justificativa |
|---|---|---|
| **Repository** | `useRooms`, `useGuests`, `useReservations` | Abstrai o acesso ao banco. Hooks encapsulam queries/mutations, permitindo trocar o backend sem alterar componentes |
| **State Machine** | `Availability` do quarto | Transições controladas (Livre→Ocupado→Limpeza→Livre) evitam estados inválidos. Implementado via constraints no DB |
| **Strategy** | Cálculo de preço por tipo de quarto | Permite variar regras de precificação (Básico, Moderno, Luxo) sem `if/else` encadeados. Ex: desconto por tipo |
| **Observer** | React Query `invalidateQueries` | Ao criar reserva, invalida cache de quartos automaticamente. O módulo de quartos "observa" mudanças sem acoplamento direto |
| **Composite** | Seção de camas no formulário | Lista dinâmica de camas tratada como coleção dentro do quarto. Adicionar/remover camas sem alterar o formulário pai |
| **Facade** | Hooks customizados (`useRooms`) | Expõem interface simples (`rooms`, `createRoom`, `isLoading`) ocultando complexidade de cache, validação e chamadas API |

#### Exemplo: Repository + Facade no Hook

```typescript
// useRooms.ts — Facade + Repository
export function useRooms() {
  const rooms = useQuery({ queryKey: ['rooms'], queryFn: fetchRooms });
  const create = useMutation({ mutationFn: createRoom, onSuccess: invalidate });
  const update = useMutation({ mutationFn: updateRoom, onSuccess: invalidate });

  return {
    rooms: rooms.data ?? [],
    isLoading: rooms.isLoading,
    createRoom: create.mutate,   // Interface simples
    updateRoom: update.mutate,   // Detalhes escondidos
  };
}
```

#### Exemplo: State Machine para Disponibilidade

```typescript
// Transições válidas definidas declarativamente
const validTransitions: Record = {
  LIVRE:      ['OCUPADO', 'MANUTENCAO'],
  OCUPADO:    ['LIMPEZA', 'MANUTENCAO'],
  LIMPEZA:    ['LIVRE'],
  MANUTENCAO: ['LIVRE'],
};

function canTransition(from: Availability, to: Availability): boolean {
  return validTransitions[from].includes(to);
}
```

---

### Próximos Passos

Implementar o sistema completo
Criar diagrama ER do banco
Desenhar wireframes das telas