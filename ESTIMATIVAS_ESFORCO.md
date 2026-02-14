# 📊 Estimativas de Esforço - Sistema de Reserva Hoteleira

## 🎯 Metodologia de Estimativa

### Story Points (Fibonacci)
- **1 SP**: Trivial (< 2h)
- **2 SP**: Simples (2-4h)
- **3 SP**: Pequeno (4-6h)
- **5 SP**: Médio (6-10h)
- **8 SP**: Grande (10-16h)
- **13 SP**: Muito Grande (16-24h) - Quebrar em menores

### Conversão: 1 SP ≈ 2 horas (média)

---

## 📋 Sprint 1: Backend - Módulo Quartos (Semana 1-2)

### S1.1: Setup Projeto Node + TypeScript
**Estimativa**: 2 SP | 4h

**Breakdown**:
- Inicializar projeto npm (30min)
- Configurar TypeScript (tsconfig.json) (1h)
- Configurar ESLint + Prettier (1h)
- Setup estrutura de pastas (30min)
- Configurar scripts package.json (30min)
- Git ignore e configurações (30min)

**Complexidade**: Baixa (tarefa conhecida)  
**Risco**: Baixo (setup padrão)

---

### S1.2: Configurar PostgreSQL + Prisma
**Estimativa**: 3 SP | 6h

**Breakdown**:
- Instalar Prisma (30min)
- Criar schema.prisma (1h)
- Definir models (Quarto, Cama, Hospede, Reserva) (2h)
- Configurar conexão (30min)
- Criar migrations (1h)
- Seed inicial (1h)

**Complexidade**: Média (requer conhecimento Prisma)  
**Risco**: Médio (migrations podem ter issues)

---

### S1.3: Implementar Módulo Quartos
**Estimativa**: 8 SP | 16h

**Breakdown**:
- Entidade Quarto (2h)
- State Pattern (4 estados) (3h)
- Repository (CRUD) (3h)
- Service (lógica de negócio) (4h)
- Controller (endpoints REST) (2h)
- Validators (2h)

**Complexidade**: Alta (State Pattern + lógica complexa)  
**Risco**: Médio (State Pattern pode ter bugs)

**Justificativa 8 SP**:
- State Pattern adiciona complexidade
- 4 estados com transições validadas
- Múltiplas validações de negócio
- CRUD completo com filtros

---

### S1.4: Implementar Módulo Hóspedes
**Estimativa**: 6 SP | 12h

**Breakdown**:
- Entidade Hospede (1h)
- Repository (CRUD) (2h)
- Service (lógica de negócio) (3h)
- Controller (endpoints REST) (2h)
- Validators (CPF, email) (2h)
- Formatters (CPF, telefone) (2h)

**Complexidade**: Média (mais simples que Quartos)  
**Risco**: Baixo (CRUD padrão)

**Justificativa 6 SP**:
- Sem State Pattern
- Validações específicas (CPF)
- CRUD padrão

---

### S1.5: Implementar State Pattern
**Estimativa**: 5 SP | 8h

**Breakdown**:
- Classe abstrata QuartoState (1h)
- QuartoLivreState (1.5h)
- QuartoOcupadoState (1.5h)
- QuartoManutencaoState (1.5h)
- QuartoLimpezaState (1.5h)
- Testes de transições (1h)

**Complexidade**: Alta (design pattern)  
**Risco**: Médio (lógica de transições)

**Justificativa 5 SP**:
- 4 classes de estado
- Validações de transição
- Testes complexos

---

### S1.6: Testes Unitários Quartos
**Estimativa**: 5 SP | 10h

**Breakdown**:
- Setup Jest (1h)
- Testes de entidade (2h)
- Testes de repository (2h)
- Testes de service (3h)
- Testes de validators (2h)

**Complexidade**: Média (muitos cenários)  
**Risco**: Baixo (testes são previsíveis)

**Justificativa 5 SP**:
- 21 testes unitários
- Mocks de repository
- Cenários edge case

---

### S1.7: Testes Unitários Hóspedes
**Estimativa**: 4 SP | 8h

**Breakdown**:
- Testes de entidade (1h)
- Testes de repository (2h)
- Testes de service (2h)
- Testes de validators (2h)
- Testes de formatters (1h)

**Complexidade**: Média  
**Risco**: Baixo

**Justificativa 4 SP**:
- Menos complexo que Quartos
- Sem State Pattern

---

### S1.8: Code Review e Ajustes
**Estimativa**: 3 SP | 6h

**Breakdown**:
- Code review (2h)
- Ajustes de feedback (2h)
- Refatoração (1h)
- Documentação (1h)

**Complexidade**: Baixa  
**Risco**: Baixo

---

## 📋 Sprint 2: Backend - Módulo Reservas (Semana 3-4)

### S2.1: Implementar Módulo Reservas
**Estimativa**: 8 SP | 16h

**Breakdown**:
- Entidade Reserva (2h)
- Validações de datas (2h)
- Validações de disponibilidade (3h)
- Repository (CRUD) (3h)
- Service (lógica complexa) (4h)
- Controller (endpoints REST) (2h)

**Complexidade**: Alta (lógica de disponibilidade)  
**Risco**: Alto (conflitos de reserva)

**Justificativa 8 SP**:
- Lógica de disponibilidade complexa
- Validações de conflito de datas
- Integração com Quartos e Hóspedes
- Cálculo de preço total

---

### S2.2: Validações de Negócio
**Estimativa**: 5 SP | 10h

**Breakdown**:
- Validação de datas (2h)
- Validação de disponibilidade (3h)
- Validação de status (2h)
- Validação de preços (1h)
- Testes de validações (2h)

**Complexidade**: Alta (regras complexas)  
**Risco**: Médio (edge cases)

**Justificativa 5 SP**:
- Múltiplas regras de negócio
- Validações interdependentes
- Cenários complexos

---

### S2.3: Controllers REST API
**Estimativa**: 6 SP | 12h

**Breakdown**:
- QuartosController (3h)
- HospedesController (2h)
- ReservasController (4h)
- Error handling (2h)
- Middleware (1h)

**Complexidade**: Média  
**Risco**: Baixo

**Justificativa 6 SP**:
- 3 controllers completos
- 15+ endpoints
- Error handling global

---

### S2.4: DTOs e Mappers
**Estimativa**: 4 SP | 8h

**Breakdown**:
- DTOs de request (2h)
- DTOs de response (2h)
- Mappers (2h)
- Validações de DTO (2h)

**Complexidade**: Média  
**Risco**: Baixo

**Justificativa 4 SP**:
- 10+ DTOs
- Mappers bidirecionais
- Validações com class-validator

---

### S2.5: Testes Unitários Reservas
**Estimativa**: 5 SP | 10h

**Breakdown**:
- Testes de entidade (2h)
- Testes de repository (2h)
- Testes de service (4h)
- Testes de validators (2h)

**Complexidade**: Alta (lógica complexa)  
**Risco**: Médio

**Justificativa 5 SP**:
- Lógica de disponibilidade
- Múltiplos cenários
- Mocks complexos

---

### S2.6: Testes de Integração
**Estimativa**: 6 SP | 12h

**Breakdown**:
- Setup de testes E2E (2h)
- Fluxo de criação de reserva (3h)
- Fluxo de cancelamento (2h)
- Fluxo de check-in/out (3h)
- Testes de conflito (2h)

**Complexidade**: Alta (fluxos completos)  
**Risco**: Médio

**Justificativa 6 SP**:
- 6 testes de integração
- Fluxos completos
- Setup de banco de teste

---

### S2.7: Documentação Swagger
**Estimativa**: 3 SP | 6h

**Breakdown**:
- Setup Swagger (1h)
- Documentar endpoints Quartos (2h)
- Documentar endpoints Hóspedes (1h)
- Documentar endpoints Reservas (2h)

**Complexidade**: Baixa  
**Risco**: Baixo

**Justificativa 3 SP**:
- 15+ endpoints
- Schemas completos
- Exemplos de request/response

---

## 📋 Sprint 3-4: Frontend (Semana 5-8)

### S3.1: Setup React + TypeScript
**Estimativa**: 2 SP | 4h

**Breakdown**:
- Create React App (30min)
- Configurar TypeScript (1h)
- Setup routing (React Router) (1h)
- Setup state (Context/Redux) (1h)
- Configurar Axios (30min)

**Complexidade**: Baixa  
**Risco**: Baixo

---

### S3.2: Configurar Routing e State
**Estimativa**: 3 SP | 6h

**Breakdown**:
- Configurar rotas (2h)
- Setup Context API (2h)
- Setup hooks customizados (1h)
- Configurar interceptors (1h)

**Complexidade**: Média  
**Risco**: Baixo

---

### S3.3: Tela de Listagem de Quartos
**Estimativa**: 6 SP | 12h

**Breakdown**:
- Componente de lista (3h)
- Integração com API (2h)
- Filtros (2h)
- Paginação (2h)
- Loading states (1h)
- Error handling (2h)

**Complexidade**: Média  
**Risco**: Baixo

**Justificativa 6 SP**:
- Componente complexo
- Múltiplos filtros
- Paginação
- Estados de loading/error

---

### S3.4: Tela de Cadastro de Quartos
**Estimativa**: 5 SP | 10h

**Breakdown**:
- Formulário (3h)
- Validações (2h)
- Integração com API (2h)
- Feedback visual (1h)
- Testes (2h)

**Complexidade**: Média  
**Risco**: Baixo

**Justificativa 5 SP**:
- Formulário com 10+ campos
- Validações complexas
- Upload de imagens (futuro)

---

### S3.5: Tela de Listagem de Hóspedes
**Estimativa**: 5 SP | 10h

**Breakdown**:
- Componente de lista (3h)
- Integração com API (2h)
- Busca (2h)
- Paginação (2h)
- Estados (1h)

**Complexidade**: Média  
**Risco**: Baixo

---

### S3.6: Tela de Cadastro de Hóspedes
**Estimativa**: 5 SP | 10h

**Breakdown**:
- Formulário (3h)
- Validações (CPF, email) (2h)
- Máscaras (CPF, telefone) (2h)
- Integração com API (2h)
- Testes (1h)

**Complexidade**: Média  
**Risco**: Baixo

---

### S3.7: Componentes Reutilizáveis
**Estimativa**: 6 SP | 12h

**Breakdown**:
- Button (1h)
- Input (2h)
- Select (2h)
- Modal (2h)
- Card (1h)
- Table (2h)
- Loading (1h)
- Toast (1h)

**Complexidade**: Média  
**Risco**: Baixo

**Justificativa 6 SP**:
- 8+ componentes
- Props tipadas
- Variantes múltiplas

---

### S3.8: Integração com API
**Estimativa**: 4 SP | 8h

**Breakdown**:
- Setup Axios (1h)
- Interceptors (2h)
- Error handling (2h)
- Loading states (1h)
- Retry logic (2h)

**Complexidade**: Média  
**Risco**: Médio

---

### S4.1: Tela de Reservas
**Estimativa**: 7 SP | 14h

**Breakdown**:
- Componente de lista (3h)
- Formulário de reserva (4h)
- Validações de datas (2h)
- Cálculo de preço (2h)
- Integração com API (2h)
- Testes (1h)

**Complexidade**: Alta (lógica complexa)  
**Risco**: Médio

**Justificativa 7 SP**:
- Componente mais complexo
- Validações de disponibilidade
- Cálculo dinâmico de preço
- Múltiplas integrações

---

## 📊 Resumo de Estimativas por Sprint

### Sprint 1 (Backend - Quartos)
| Task | SP | Horas | Justificativa |
|------|----|----|---------------|
| S1.1 Setup | 2 | 4h | Setup padrão |
| S1.2 Prisma | 3 | 6h | Configuração DB |
| S1.3 Quartos | 8 | 16h | State Pattern complexo |
| S1.4 Hóspedes | 6 | 12h | CRUD + validações |
| S1.5 State Pattern | 5 | 8h | Design pattern |
| S1.6 Testes Quartos | 5 | 10h | 21 testes |
| S1.7 Testes Hóspedes | 4 | 8h | Testes padrão |
| S1.8 Review | 3 | 6h | Review + ajustes |
| **Total** | **36 SP** | **70h** | |

### Sprint 2 (Backend - Reservas)
| Task | SP | Horas | Justificativa |
|------|----|----|---------------|
| S2.1 Reservas | 8 | 16h | Lógica complexa |
| S2.2 Validações | 5 | 10h | Regras de negócio |
| S2.3 Controllers | 6 | 12h | 3 controllers |
| S2.4 DTOs | 4 | 8h | 10+ DTOs |
| S2.5 Testes Reservas | 5 | 10h | Cenários complexos |
| S2.6 Testes Integração | 6 | 12h | Fluxos E2E |
| S2.7 Swagger | 3 | 6h | Documentação |
| S2.8 Review | 3 | 6h | Review + ajustes |
| **Total** | **40 SP** | **80h** | |

### Sprint 3 (Frontend - Base)
| Task | SP | Horas | Justificativa |
|------|----|----|---------------|
| S3.1 Setup React | 2 | 4h | Setup padrão |
| S3.2 Routing | 3 | 6h | Rotas + state |
| S3.3 Lista Quartos | 6 | 12h | Filtros + paginação |
| S3.4 Cadastro Quartos | 5 | 10h | Formulário complexo |
| S3.5 Lista Hóspedes | 5 | 10h | Lista + busca |
| S3.6 Cadastro Hóspedes | 5 | 10h | Validações CPF |
| S3.7 Componentes | 6 | 12h | 8+ componentes |
| S3.8 Integração API | 4 | 8h | Axios + interceptors |
| **Total** | **36 SP** | **72h** | |

---

## 🎯 Fatores de Complexidade

### Multiplicadores de Esforço

| Fator | Impacto | Exemplo |
|-------|---------|---------|
| Design Pattern | +50% | State Pattern |
| Lógica de Negócio | +30% | Disponibilidade |
| Integrações | +20% | API externa |
| Testes Complexos | +40% | E2E com mocks |
| UI Complexa | +30% | Formulários dinâmicos |

### Exemplo de Cálculo

**Task**: Implementar módulo Quartos

**Base**: CRUD simples = 3 SP (6h)

**Multiplicadores**:
- State Pattern: +50% = +1.5 SP
- Validações complexas: +30% = +0.9 SP
- Testes: +40% = +1.2 SP
- Documentação: +20% = +0.6 SP

**Total**: 3 + 1.5 + 0.9 + 1.2 + 0.6 = **7.2 SP ≈ 8 SP**

---

## 📈 Velocity Esperada

### Por Desenvolvedor

| Experiência | SP/Sprint | Horas/Sprint |
|-------------|-----------|--------------|
| Júnior | 8-10 SP | 16-20h |
| Pleno | 10-13 SP | 20-26h |
| Sênior | 13-16 SP | 26-32h |

### Time de 4 Devs (2 Plenos + 2 Sêniores)

**Velocity esperada**: 35-40 SP/sprint  
**Horas esperadas**: 70-80h/sprint

---

## ✅ Validação das Estimativas

### Técnicas Utilizadas

1. **Planning Poker**: Time estima em conjunto
2. **Histórico**: Baseado em projetos similares
3. **Breakdown**: Dividir em subtasks
4. **Buffer**: +20% para imprevistos

### Confiança das Estimativas

| Sprint | Confiança | Motivo |
|--------|-----------|--------|
| Sprint 1-2 | 90% | Backend conhecido |
| Sprint 3-4 | 85% | Frontend padrão |
| Sprint 5-6 | 75% | Integrações complexas |
| Sprint 7 | 70% | Testes podem revelar bugs |
| Sprint 8-10 | 80% | DevOps conhecido |

---

## 🎓 Conclusão

**Total do Projeto**:
- **364 Story Points**
- **726 Horas**
- **Conversão**: 1 SP = 2h (média)

**Distribuição**:
- Backend: 40% (150h)
- Frontend: 40% (148h)
- Testes/QA: 10% (70h)
- DevOps: 10% (74h)

**Precisão esperada**: ±15% (normal em estimativas ágeis)

---

**Versão**: 1.0  
**Método**: Planning Poker + Breakdown  
**Confiança**: 80%  
**Buffer**: 20% incluído
