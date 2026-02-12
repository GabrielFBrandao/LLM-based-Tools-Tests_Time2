# Classes de Domínio - Sistema de Reserva Hoteleira

## Estrutura Implementada

```
backend/src/modules/
├── quartos/entities/
│   ├── Quarto.ts
│   └── index.ts
├── hospedes/entities/
│   ├── Hospede.ts
│   └── index.ts
└── reservas/entities/
    ├── Reserva.ts
    └── index.ts
```

## 1. Classe Quarto

### Enums
- **TipoQuarto**: BASICO, MODERNO, LUXO
- **StatusQuarto**: LIVRE, OCUPADO, MANUTENCAO, LIMPEZA
- **TipoCama**: SOLTEIRO, CASAL_KING, CASAL_QUEEN

### Atributos
- `id`: number
- `numero`: number (único)
- `capacidade`: number
- `tipo`: TipoQuarto
- `precoDiaria`: number
- `temFrigobar`: boolean
- `temCafe`: boolean
- `temArCondicionado`: boolean
- `temTV`: boolean
- `status`: StatusQuarto
- `camas`: Cama[]
- `createdAt`: Date
- `updatedAt`: Date

### Métodos Principais
- `adicionarCama(cama: Cama): void` - Adiciona cama ao quarto
- `removerCama(camaId: number): void` - Remove cama do quarto
- `alterarStatus(novoStatus: StatusQuarto): void` - Altera status com validação
- `validarTransicaoStatus(novoStatus: StatusQuarto): boolean` - Valida transição
- `isDisponivel(): boolean` - Verifica se está disponível para reserva
- `calcularPrecoTotal(dias: number): number` - Calcula preço total

### Padrões Aplicados
✅ **State Pattern**: Gerencia transições de status
- QuartoLivreState
- QuartoOcupadoState
- QuartoManutencaoState
- QuartoLimpezaState

### Regras de Negócio
- Apenas quartos LIVRE podem ser reservados
- Transições de status são validadas
- Número do quarto deve ser único
- Preço não pode ser negativo

---

## 2. Classe Hospede

### Atributos
- `id`: number
- `nome`: string (obrigatório)
- `sobrenome`: string (obrigatório)
- `cpf`: string (único, validado)
- `email`: string (validado)
- `createdAt`: Date
- `updatedAt`: Date

### Métodos Principais
- `getNomeCompleto(): string` - Retorna nome completo
- `validarCPF(): boolean` - Valida CPF com dígitos verificadores
- `validarEmail(): boolean` - Valida formato de email
- `atualizarDados(dados): void` - Atualiza dados com validação

### Validações Implementadas
✅ **CPF**: 
- 11 dígitos
- Dígitos verificadores corretos
- Não aceita sequências repetidas (111.111.111-11)

✅ **Email**: 
- Formato válido (regex)
- Domínio obrigatório

### Regras de Negócio
- CPF é imutável após criação
- Nome e sobrenome são obrigatórios
- Email deve ter formato válido

---

## 3. Classe Reserva

### Enum
- **StatusReserva**: ATIVA, CANCELADA, FINALIZADA

### Atributos
- `id`: number
- `quartoId`: number (FK)
- `hospedeId`: number (FK)
- `dataCheckin`: Date
- `dataCheckout`: Date
- `status`: StatusReserva
- `valorTotal`: number
- `createdAt`: Date
- `updatedAt`: Date

### Métodos Principais
- `calcularDiarias(): number` - Calcula número de diárias
- `calcularValorTotal(precoDiaria: number): number` - Calcula valor total
- `cancelar(): void` - Cancela reserva
- `finalizar(): void` - Finaliza reserva
- `isAtiva(): boolean` - Verifica se está ativa
- `validarDatas(): boolean` - Valida datas
- `alterarDatas(checkin, checkout): void` - Altera datas com validação

### Regras de Negócio
- Data checkout deve ser posterior ao checkin
- Data checkin não pode ser no passado
- Apenas reservas ativas podem ser alteradas
- Reservas canceladas não podem ser finalizadas
- Reservas finalizadas não podem ser canceladas

---

## Exemplo de Uso

```typescript
import { Quarto, TipoQuarto, StatusQuarto, Cama, TipoCama } from './modules/quartos/entities';
import { Hospede } from './modules/hospedes/entities';
import { Reserva, StatusReserva } from './modules/reservas/entities';

// Criar quarto
const quarto = new Quarto(
  1,
  101,
  2,
  TipoQuarto.MODERNO,
  150.00,
  true,  // frigobar
  true,  // café
  true,  // ar-condicionado
  true   // TV
);

// Adicionar camas
const cama1 = new Cama(1, quarto.id, TipoCama.CASAL_QUEEN);
quarto.adicionarCama(cama1);

// Criar hóspede
const hospede = new Hospede(
  1,
  'João',
  'Silva',
  '123.456.789-10',
  'joao@email.com'
);

// Criar reserva
const checkin = new Date('2024-12-20');
const checkout = new Date('2024-12-25');
const reserva = new Reserva(
  1,
  quarto.id,
  hospede.id,
  checkin,
  checkout
);

// Calcular valor
const diarias = reserva.calcularDiarias(); // 5
const valor = reserva.calcularValorTotal(quarto.getPrecoDiaria()); // 750.00

// Alterar status do quarto
quarto.alterarStatus(StatusQuarto.OCUPADO);

console.log(`Reserva criada: ${hospede.getNomeCompleto()}`);
console.log(`Quarto ${quarto.getNumero()} - ${diarias} diárias`);
console.log(`Valor total: R$ ${valor.toFixed(2)}`);
```

---

## Características Implementadas

### ✅ Encapsulamento
- Atributos privados quando necessário
- Getters para acesso controlado
- Validações no construtor

### ✅ Validações
- CPF com dígitos verificadores
- Email com regex
- Datas lógicas
- Valores positivos

### ✅ Padrões de Projeto
- State Pattern (Quarto)
- Encapsulamento de lógica de negócio
- Imutabilidade de dados críticos (CPF)

### ✅ Regras de Negócio
- Transições de status controladas
- Validações de datas
- Cálculos automáticos
- Estados consistentes

---

## Próximos Passos

1. Implementar DTOs (Data Transfer Objects)
2. Criar Repositories
3. Implementar Services
4. Criar Controllers
5. Adicionar testes unitários
