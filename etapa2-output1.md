# Proposta de Arquitetura do Sistema

## Arquitetura Escolhida: Monolito Modular em Camadas

### Justificativa da Escolha
Para este sistema de reserva hoteleira, recomendo uma arquitetura monolitica modular em camadas pelos seguintes motivos:
* **Escopo limitado**: Sistema para um único hotel com 3 módulos bem definidos
* **Baixa complexidade**: Operações CRUD sem necessidade de alta escalabilidade independente
* **Facilidade de desenvolvimento**: Equipe pequena, deploy simplificado
* **Manutenibilidade**: Módulos isolados permitem evolução futura para microserviços se necessário
* **Performance**: Comunicação interna sem overhead de rede
* **Custo**: Infraestrutura mais simples e econômica

---

## Estrutura da Arquitetura

### Camadas Principais
```
┌─────────────────────────────────────────────────────────┐
│                   CAMADA DE APRESENTAÇÃO                 │
│              (Frontend - Interface Web)                  │
│         React/Vue + Components UI + State Management     │
└─────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST
┌─────────────────────────────────────────────────────────┐
│                   CAMADA DE API/CONTROLLER               │
│              (Endpoints REST + Validações)               │
│         QuartosController | HospedesController |         │
│                    ReservasController                    │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│                   CAMADA DE SERVIÇO/NEGÓCIO              │
│              (Regras de Negócio + Orquestração)          │
│         QuartosService | HospedesService |               │
│                    ReservasService                       │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│                   CAMADA DE REPOSITÓRIO/DADOS            │
│              (Acesso a Dados + Persistência)             │
│         QuartosRepository | HospedesRepository |         │
│                    ReservasRepository                    │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│                   CAMADA DE PERSISTÊNCIA                 │
│              (Banco de Dados Relacional)                 │
│                    PostgreSQL/MySQL                      │
└─────────────────────────────────────────────────────────┘

```

---

## Módulos do Sistema

### 1. Módulo de Quartos
* **Responsabilidades**:
    * Gerenciar CRUD de quartos
    * Controlar status de disponibilidade
    * Gerenciar camas vinculadas
* **Componentes**:
    * Quartos Controller: Endpoints REST
    * QuartosService: Validações e regras de negócio
    * Quartos Repository: Acesso ao banco de dados
    * Camas Repository: Gerenciamento de camas

### 2. Módulo de Hóspedes
* **Responsabilidades**:
    * Gerenciar CRUD de hóspedes
    * Validar CPF e email
    * Garantir unicidade de CPF
* **Componentes**:
    * Hospedes Controller: Endpoints REST
    * Hospedes Service: Validações (CPF, email)
    * Hospedes Repository: Acesso ao banco de dados

### 3. Módulo de Reservas
* **Responsabilidades**:
    * Gerenciar CRUD de reservas
    * Vincular hóspedes a quartos
    * Atualizar status de quartos automaticamente
    * Validar disponibilidade
* **Componentes**:
    * ReservasController: Endpoints REST
    * Reservas Service: Orquestração entre quartos e hóspedes
    * Reservas Repository: Acesso ao banco de dados

---

## Stack Tecnológica Recomendada

**Frontend**
* Framework: React ou Vue.js
* UI Library: Material-Ul ou Vuetify (componentes modernos)
* State Management: Redux/Zustand ou Pinia
* HTTP Client: Axios
* Estilização: Styled Components ou Tailwind CSS (paleta verde/azul)

**Backend**
* Linguagem: Node.js (TypeScript) ou Java (Spring Boot) ou Python (FastAPI)
* Framework Web: Express.js / Spring Boot/FastAPI
* ORM: Prisma / Hibernate / SQLAlchemy
* Validação: Joi / Bean Validation / Pydantic

**Banco de Dados**
* SGBD: PostgreSQL (recomendado) ou MySQL
* Migrations: Flyway ou Prisma Migrate

**Infraestrutura**
* Containerização: Docker
* Servidor Web: Nginx (proxy reverso)
* Deploy: Docker Compose (desenvolvimento) / Cloud (produção)

---

## Modelo de Dados Simplificado

```
┌─────────────────┐         ┌─────────────────┐
│     Quartos     │         │    Hóspedes     │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │         │ id (PK)         │
│ numero (UNIQUE) │         │ nome            │
│ capacidade      │         │ sobrenome       │
│ tipo            │         │ cpf (UNIQUE)    │
│ preco_diaria    │         │ email           │
│ tem_frigobar    │         └─────────────────┘
│ tem_cafe        │                 │
│ tem_ar          │                 │
│ tem_tv          │                 │
│ status          │                 │
└────────┬────────┘                 │
         │                          │
         │ 1:N                      │
         │                          │
┌────────▼────────┐         ┌───────▼─────────┐
│      Camas      │         │    Reservas     │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │         │ id (PK)         │
│ quarto_id (FK)  │         │ quarto_id (FK)  │
│ tipo_cama       │         │ hospede_id (FK) │
└─────────────────┘         │ data_checkin    │
                            │ data_checkout   │
                            │ status          │
                            └─────────────────┘

```

---

## Padrões de Projeto Aplicados
1. **Repository Pattern**: Abstração do acesso a dados | Facilita testes e manutenção
2. **Service Layer Pattern**: Centraliza regras de negócio | Reutilização de lógica
3. **DTO (Data Transfer Objects)**: Transferência de dados entre camadas | Validação de entrada
4. **Dependency Injection**: Baixo acoplamento | Facilita testes unitários

---

## Fluxo de Comunicação (Exemplo: Criar Reserva)

```
1. Frontend → POST /api/reservas
              { quarto_id: 101, hospede_id: 5 }
              
2. ReservasController → Valida entrada (DTO)
              ↓
3. ReservasService → Verifica disponibilidade do quarto
              ↓
4. QuartosService → Consulta status do quarto
              ↓
5. ReservasService → Cria reserva
              ↓
6. QuartosService → Atualiza status para "Ocupado"
              ↓
7. ReservasController → Retorna 201 Created
              ↓
8. Frontend → Atualiza interface
```
---

## Vantagens da Arquitetura Proposta
* Simplicidade: Fácil de desenvolver e manter
* Modularidade: Módulos independentes e coesos
* Testabilidade: Camadas isoladas facilitam testes
* Escalabilidade vertical: Pode crescer com o negócio
* Evolução: Pode migrar para microserviços no futuro
* Performance: Sem overhead de comunicação entre serviços
* Deploy simplificado: Um único artefato

---

## Considerações Futuras
Se o sistema crescer e precisar de: 
* Múltiplos hotéis
* Alta disponibilidade
* Escalabilidade horizontal
* Equipes independentes

**Então considerar migração para**:
* Microserviços (Quartos Service, Hóspedes Service, Reservas Service)
* Event-driven architecture
* API Gateway
* Service mesh