# Módulo de Gestão de Quartos - API REST

## Endpoints Implementados

### 1. Criar Quarto
**POST** `/api/v1/quartos`

```json
{
  "numero": 101,
  "capacidade": 2,
  "tipo": "MODERNO",
  "precoDiaria": 150.00,
  "temFrigobar": true,
  "temCafe": true,
  "temArCondicionado": true,
  "temTV": true,
  "camas": [
    { "tipoCama": "CASAL_QUEEN" }
  ]
}
```

**Resposta (201):**
```json
{
  "id": 1,
  "numero": 101,
  "capacidade": 2,
  "tipo": "MODERNO",
  "precoDiaria": 150.00,
  "temFrigobar": true,
  "temCafe": true,
  "temArCondicionado": true,
  "temTV": true,
  "status": "LIVRE",
  "camas": [
    {
      "id": 1,
      "tipoCama": "CASAL_QUEEN"
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 2. Listar Todos os Quartos
**GET** `/api/v1/quartos`

**Resposta (200):**
```json
[
  {
    "id": 1,
    "numero": 101,
    "tipo": "MODERNO",
    "precoDiaria": 150.00,
    "status": "LIVRE"
  },
  {
    "id": 2,
    "numero": 102,
    "tipo": "LUXO",
    "precoDiaria": 250.00,
    "status": "OCUPADO"
  }
]
```

---

### 3. Listar Quartos Disponíveis
**GET** `/api/v1/quartos/disponiveis`

**Resposta (200):**
```json
[
  {
    "id": 1,
    "numero": 101,
    "tipo": "MODERNO",
    "precoDiaria": 150.00,
    "status": "LIVRE"
  }
]
```

---

### 4. Buscar Quarto por ID
**GET** `/api/v1/quartos/:id`

**Resposta (200):**
```json
{
  "id": 1,
  "numero": 101,
  "capacidade": 2,
  "tipo": "MODERNO",
  "precoDiaria": 150.00,
  "temFrigobar": true,
  "temCafe": true,
  "temArCondicionado": true,
  "temTV": true,
  "status": "LIVRE",
  "camas": [
    {
      "id": 1,
      "tipoCama": "CASAL_QUEEN"
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 5. Atualizar Quarto
**PUT** `/api/v1/quartos/:id`

```json
{
  "precoDiaria": 180.00,
  "temFrigobar": false
}
```

**Resposta (200):**
```json
{
  "id": 1,
  "numero": 101,
  "capacidade": 2,
  "tipo": "MODERNO",
  "precoDiaria": 180.00,
  "temFrigobar": false,
  "temCafe": true,
  "temArCondicionado": true,
  "temTV": true,
  "status": "LIVRE",
  "camas": [...],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:10:00.000Z"
}
```

---

### 6. Alterar Status do Quarto
**PATCH** `/api/v1/quartos/:id/status`

```json
{
  "status": "OCUPADO"
}
```

**Resposta (200):**
```json
{
  "id": 1,
  "numero": 101,
  "status": "OCUPADO",
  ...
}
```

**Status válidos:**
- `LIVRE`
- `OCUPADO`
- `MANUTENCAO`
- `LIMPEZA`

---

### 7. Deletar Quarto
**DELETE** `/api/v1/quartos/:id`

**Resposta (204):** Sem conteúdo

---

## Tipos de Quarto
- `BASICO`
- `MODERNO`
- `LUXO`

## Tipos de Cama
- `SOLTEIRO`
- `CASAL_KING`
- `CASAL_QUEEN`

## Status de Quarto
- `LIVRE` - Disponível para reserva
- `OCUPADO` - Reservado/Ocupado
- `MANUTENCAO` - Em manutenção
- `LIMPEZA` - Em limpeza

---

## Validações Implementadas

### Criar Quarto
- ✅ Número do quarto deve ser único
- ✅ Número deve ser maior que zero
- ✅ Capacidade deve ser maior que zero
- ✅ Preço não pode ser negativo
- ✅ Tipo deve ser válido (BASICO, MODERNO, LUXO)
- ✅ Deve ter pelo menos uma cama

### Atualizar Quarto
- ✅ Quarto deve existir
- ✅ Validações de valores (capacidade, preço)

### Alterar Status
- ✅ Transições de status são validadas
- ✅ Apenas transições permitidas:
  - LIVRE → OCUPADO, MANUTENCAO, LIMPEZA
  - OCUPADO → LIVRE, LIMPEZA
  - MANUTENCAO → LIVRE
  - LIMPEZA → LIVRE, OCUPADO

### Deletar Quarto
- ✅ Não permite deletar quarto ocupado

---

## Exemplos de Uso com cURL

### Criar quarto com múltiplas camas
```bash
curl -X POST http://localhost:3000/api/v1/quartos \
  -H "Content-Type: application/json" \
  -d '{
    "numero": 201,
    "capacidade": 4,
    "tipo": "LUXO",
    "precoDiaria": 300.00,
    "temFrigobar": true,
    "temCafe": true,
    "temArCondicionado": true,
    "temTV": true,
    "camas": [
      { "tipoCama": "CASAL_KING" },
      { "tipoCama": "SOLTEIRO" },
      { "tipoCama": "SOLTEIRO" }
    ]
  }'
```

### Listar todos os quartos
```bash
curl http://localhost:3000/api/v1/quartos
```

### Atualizar preço
```bash
curl -X PUT http://localhost:3000/api/v1/quartos/1 \
  -H "Content-Type: application/json" \
  -d '{ "precoDiaria": 200.00 }'
```

### Alterar status para manutenção
```bash
curl -X PATCH http://localhost:3000/api/v1/quartos/1/status \
  -H "Content-Type: application/json" \
  -d '{ "status": "MANUTENCAO" }'
```

---

## Estrutura de Arquivos

```
backend/src/modules/quartos/
├── entities/
│   ├── Quarto.ts          # Entidade de domínio
│   └── index.ts
├── dtos/
│   └── QuartoDTO.ts       # DTOs de entrada/saída
├── repositories/
│   └── QuartoRepository.ts # Interface e implementação
├── services/
│   └── QuartosService.ts  # Lógica de negócio
├── controllers/
│   └── QuartosController.ts # Endpoints REST
└── routes.ts              # Configuração de rotas
```

---

## Padrões Aplicados

✅ **Repository Pattern** - Abstração de persistência  
✅ **Service Layer** - Lógica de negócio centralizada  
✅ **DTO Pattern** - Transferência de dados validada  
✅ **Dependency Injection** - Baixo acoplamento  
✅ **State Pattern** - Gerenciamento de status (na entidade)

---

## Próximos Passos

1. ✅ Implementar validação com class-validator
2. ✅ Adicionar middleware de autenticação
3. ✅ Implementar paginação na listagem
4. ✅ Adicionar filtros (por tipo, status, preço)
5. ✅ Implementar testes unitários
6. ✅ Conectar com banco de dados real (Prisma/TypeORM)
