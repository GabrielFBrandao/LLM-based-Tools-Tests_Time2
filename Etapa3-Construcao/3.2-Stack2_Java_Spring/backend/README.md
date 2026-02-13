# Sistema de Reserva de Hotel — Backend Spring Boot

## Estrutura do Projeto

```
hotel/
├── pom.xml
└── src/
    ├── main/
    │   ├── java/com/hotel/
    │   │   ├── domain/
    │   │   │   ├── entity/
    │   │   │   │   ├── Quarto.java          ← Entidade principal (JPA)
    │   │   │   │   ├── Hospede.java         ← Entidade hóspede (JPA)
    │   │   │   │   └── Reserva.java         ← Entidade reserva (JPA)
    │   │   │   ├── enums/
    │   │   │   │   ├── TipoQuarto.java      ← BASICO | MODERNO | LUXO
    │   │   │   │   ├── StatusQuarto.java    ← LIVRE | OCUPADO | MANUTENCAO | LIMPEZA
    │   │   │   │   └── TipoCama.java        ← SOLTEIRO | CASAL_QUEEN | CASAL_KING
    │   │   │   └── valueobject/
    │   │   │       └── Cama.java            ← Value Object @Embeddable
    │   │   ├── repository/
    │   │   │   └── QuartoRepository.java    ← Spring Data JPA + JPQL custom
    │   │   ├── service/
    │   │   │   └── QuartoService.java       ← Regras de negócio + @Transactional
    │   │   ├── controller/
    │   │   │   └── QuartoController.java    ← REST endpoints
    │   │   ├── dto/
    │   │   │   ├── request/
    │   │   │   │   └── QuartoRequest.java   ← DTOs de entrada (Records)
    │   │   │   └── response/
    │   │   │       └── QuartoResponse.java  ← DTOs de saída (Records)
    │   │   ├── mapper/
    │   │   │   └── QuartoMapper.java        ← Entidade → DTO
    │   │   └── exception/
    │   │       ├── HotelExceptions.java     ← Hierarquia de exceções
    │   │       └── GlobalExceptionHandler.java ← @RestControllerAdvice
    │   └── resources/
    │       └── application.properties
    └── test/
        └── java/com/hotel/service/
            └── QuartoServiceTest.java       ← Testes unitários com Mockito
```

---

## Princípios SOLID — Onde Estão Aplicados

### S — Single Responsibility Principle
| Classe | Única responsabilidade |
|--------|----------------------|
| `Quarto` | Representar e proteger invariantes da entidade quarto |
| `QuartoService` | Orquestrar regras de negócio de quartos |
| `QuartoRepository` | Abstração de acesso a dados de quartos |
| `QuartoMapper` | Converter entre entidades e DTOs |
| `QuartoController` | Receber requisições HTTP e delegar ao service |
| `GlobalExceptionHandler` | Tratar erros e formatar respostas de erro |

### O — Open/Closed Principle
- Novos tipos de quarto: adicionar ao `enum TipoQuarto` sem mudar código existente
- Novos filtros na listagem: adicionar `@RequestParam` no controller + parâmetro na query JPQL
- Novas exceções: adicionar ao `HotelExceptions` + novo `@ExceptionHandler`

### L — Liskov Substitution Principle
- `QuartoRepository` (interface Spring Data) pode ser substituída por qualquer implementação sem impacto no `QuartoService`
- Em testes: `@Mock QuartoRepository` substitui a implementação JPA transparentemente

### I — Interface Segregation Principle
- `QuartoRepository` contém apenas métodos de Quarto (não de Hóspede ou Reserva)
- DTOs separados por operação: `Criar`, `Editar`, `AlterarStatus` — cada um com apenas os campos necessários

### D — Dependency Inversion Principle
- `QuartoService` depende de `QuartoRepository` (interface) e `QuartoMapper` (@Component)
- Nenhuma dependência de implementações concretas
- Spring injeta tudo via construtor em runtime

---

## Endpoints da API

```
POST   /api/quartos             → Cadastrar quarto (UC01)
GET    /api/quartos             → Listar quartos com filtros opcionais (UC02)
GET    /api/quartos/{id}        → Buscar quarto por ID
PUT    /api/quartos/{id}        → Editar quarto (UC03)
PATCH  /api/quartos/{id}/status → Alterar status (UC04)
```

### Exemplos de Request

**POST /api/quartos**
```json
{
  "numero": "101",
  "capacidade": 2,
  "tipo": "MODERNO",
  "precoDiaria": 280.00,
  "temFrigobar": true,
  "temCafeDaManha": false,
  "temArCondicionado": true,
  "temTV": true,
  "tiposCama": ["CASAL_QUEEN"]
}
```

**PATCH /api/quartos/1/status**
```json
{ "status": "LIMPEZA" }
```

### Exemplos de Response

**GET /api/quartos** (lista)
```json
[
  {
    "id": 1,
    "numero": "101",
    "tipo": "MODERNO",
    "tipoDescricao": "Moderno",
    "precoDiaria": 280.00,
    "status": "LIVRE",
    "statusDescricao": "Livre",
    "camas": [
      { "tipo": "CASAL_QUEEN", "tipoDescricao": "Casal Queen", "capacidadePadrao": 2 }
    ]
  }
]
```

**Erro 422 (violação de regra de negócio)**
```json
{
  "type": "/erros/regra-de-negocio",
  "title": "Violação de regra de negócio",
  "status": 422,
  "detail": "Já existe um quarto com o número '101'. Escolha outro número (RN01).",
  "timestamp": "2026-02-13T14:30:00Z"
}
```

**Erro 400 (validação de campos)**
```json
{
  "type": "/erros/validacao",
  "title": "Dados inválidos",
  "status": 400,
  "detail": "Um ou mais campos contêm valores inválidos.",
  "erros": {
    "numero": "Número do quarto é obrigatório",
    "precoDiaria": "Preço da diária deve ser maior que zero (RN03)",
    "tiposCama": "O quarto deve ter pelo menos um tipo de cama (RN05)"
  },
  "timestamp": "2026-02-13T14:30:00Z"
}
```

---

## Decisões de Implementação — Resumo

| Decisão | Escolha | Motivação |
|---------|---------|-----------|
| Enum com comportamento | `StatusQuarto.aceitaReservas()` | Encapsula RF18 no domínio (Tell, Don't Ask) |
| Value Object para Cama | `@Embeddable` (não `@Entity`) | Cama não tem identidade fora do quarto |
| BigDecimal para preço | `BigDecimal` (não `double`) | Precisão monetária — evita arredondamento |
| Records para DTOs | `record Criar(...)` | Imutabilidade, compacidade, equals/hashCode automáticos |
| Exceções customizadas | `HotelExceptions.*` | HTTP status específico por tipo de erro |
| Injeção por construtor | `final + construtor` | Imutabilidade, testabilidade, fail-fast |
| `@Transactional(readOnly=true)` | Leituras | Desativa dirty checking — melhor performance |
| JOIN FETCH nas camas | Query JPQL customizada | Evita problema N+1 queries |
| Soft delete nas reservas | Campo `ativa` | Preserva histórico de reservas para auditoria |
| `unmodifiableList` para camas | `Collections.unmodifiableList` | Protege invariante RN05 (mín. 1 cama) |
| `ProblemDetail` (RFC 9457) | Spring 6 nativo | Padrão de resposta de erro da indústria |

---

## Como Executar

```bash
# Pré-requisito: Java 21 e Maven instalados
cd hotel
mvn spring-boot:run

# A API estará disponível em: http://localhost:8080/api/quartos
# Console H2: http://localhost:8080/h2-console

# Executar testes
mvn test
```
