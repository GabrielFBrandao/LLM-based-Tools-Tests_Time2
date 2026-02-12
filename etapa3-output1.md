Vou implementar as classes de domínio (Quarto, Hóspede e Reserva) em TypeScript com os padrões de projeto aplicados.

**Criando a classe de entidade Quarto com enums, validações e lógica de negócio**
`Quarto.ts`
Error

Criando estrutura de diretórios para as entidades do backend
`shell`
Completed
```bash
mkdir -p backend/src/modules/quartos/entities
backend/src/modules/hospedes/entities
backend/src/modules/reservas/entities
```

Criando a classe de entidade Quarto com enums, validações e lógica de negócio
`Quarto.ts`
+190-0
 Undo

Criando a classe de entidade Hospede com validações de CPF e email
`Hospede.ts`
+111-0
 Undo

Criando a classe de entidade Reserva com validações e cálculos
`Reserva.ts`
+115-0
 Undo

Criando arquivo de índice para exportar todas as entidades do módulo de quartos
`index.ts`
+1-0
 Undo

Criando arquivo de índice para exportar a entidade Hospede
`index.ts`
+1-0
 Undo

Criando arquivo de índice para exportar a entidade Reserva
`index.ts`
+1-0
 Undo

Criando arquivo README documentando as classes implementadas
`CLASSES_IMPLEMENTADAS.md`
+221-0
 Undo

🔄 Undo all changes

---

## ✅ Classes Implementadas com Sucesso!

Criei as três classes principais do sistema:

### 📁 Estrutura Criada

```
backend/src/modules/
├── quartos/entities/
│   ├── Quarto.ts (com Cama e enums)
│   └── index.ts
├── hospedes/entities/
│   ├── Hospede.ts
│   └── index.ts
└── reservas/entities/
    ├── Reserva.ts
    └── index.ts
```

### 🎯 Destaques da Implementação

**1. Classe Quarto**

* ✅ State Pattern para gerenciar status (Livre, Ocupado, Manutenção, Limpeza)
* ✅ Validação de transições de status
* ✅ Gerenciamento de camas
* ✅ Cálculo de preço por diárias
* ✅ Enums: TipoQuarto, StatusQuarto, TipoCama

**2. Classe Hospede**

* ✅ Validação completa de CPF (com dígitos verificadores)
* ✅ Validação de email (regex)
* ✅ CPF imutável após criação
* ✅ Método getNomeCompleto()

**3. Classe Reserva**

* ✅ Cálculo automático de diárias
* ✅Validação de datas (checkout > checkin)
* ✅ Métodos cancelar() e finalizar()
* ✅ Regras de negócio para alteração de status
* ✅ Enum: StatusReserva

### 🔒 Validações Implementadas

* Números positivos (preço, capacidade, IDs)
* CPF com algoritmo completo de validação
* Email com formato válido
* Datas lógicas e não no passado
* Transições de estado controladas

### 📋 Documentação

Criei o arquivo `CLASSES_IMPLEMENTADAS.md` com exemplos de uso e documentação completa.

As classes estão prontas para serem integradas com Repositories, Services e Controllers!
