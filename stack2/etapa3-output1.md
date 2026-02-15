Vou implementar as classes de modelo (entidades JPA) para Quarto, Hóspede e Reserva de forma mínima e direta.

Creating the Quarto entity with JPA annotations, Lombok for boilerplate reduction, and all required fields from requirements

`Quarto.java`

Error

Creating the directory structure for the model classes

`shell`

Completed

```bash
mkdir -p src/main/java/com/hotel/reservas/modules/quartos/model
src/main/java/com/hotel/reservas/modules/hospedes/model
src/main/java/com/hotel/reservas/modules/reservas/model
```

Creating the Quarto entity with JPA annotations and required fields

Creating the Hospede entity with JPA annotations and validation fields

Creating the Reserva entity with JPA annotations and relationships to Quarto and Hospede

`Quarto.java`

+52-0

 Undo

`Hospede.java`

+30-0

 Undo

`Reserva.java`

+44-0

 Undo

🔄 Undo all changes

---

Implementei as três classes de modelo:

**1. Quarto** (`/modules/quartos/model/Quarto.java`)

* Campos: id, numero (único), capacidade, tipo, precoDiaria, comodidades (frigobar, café, ar, tv)
* Enum StatusQuarto: LIVRE, OCUPADO, MANUTENCAO, LIMPEZA

**2. Hospede** (`/modules/hospedes/model/Hospede.java`)

* Campos: id, nome, sobrenome, cpf (único), email
* CPF com constraint de unicidade

**3. Reserva** (`/modules/reservas/model/Reserva.java`)

* Relacionamentos: ManyToOne com Quarto e Hospede
* Campos: id, dataCheckin, dataCheckout
* Enum StatusReserva: ATIVA, CANCELADA, FINALIZADA

**Todas as classes usam:**

* JPA/Hibernate para persistência
* Lombok (@Data, @NoArgsConstructor, @AllArgsConstructor) para reduzir boilerplate
* Jakarta Persistence API (Jakarta EE 9+)
