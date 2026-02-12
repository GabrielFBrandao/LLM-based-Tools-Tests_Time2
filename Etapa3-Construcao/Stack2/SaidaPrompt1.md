Resultado do prompt: "Utilizando Java + Spring, implemente as classes para: Quarto, Hóspede e Reserva."

---


Vou criar um repositório separado para a implementação em Java + Spring. Primeiro, vou criar a estrutura do projeto.





































Criei um repositório Java + Spring Boot completo com as classes principais do sistema de reserva de hotel. Aqui está o resumo do que foi implementado:

## Estrutura Criada

### 📁 **Enums** (`/src/main/java/com/hotel/booking/enums/`)
- `TipoQuarto` (Básico, Moderno, Luxo)
- `StatusQuarto` (Disponível, Ocupado, Manutenção, Limpeza)
- `TipoCama` (Solteiro, Casal King, Casal Queen)
- `StatusReserva` (Pendente, Confirmada, Check-in, Check-out, Cancelada, No-show)
- `MetodoPagamento` (Cartão, Dinheiro, PIX, etc.)
- `StatusPagamento` (Pendente, Aprovado, Recusado, etc.)

### 📁 **Value Objects** (`/src/main/java/com/hotel/booking/valueobjects/`)
- [Endereco](cci:2://file:///home/walisson/CascadeProjects/hotel-booking-system/src/domain/value-objects/Endereco.ts:1:0-87:1) - Com validação de CEP e formatação
- [Periodo](cci:2://file:///home/walisson/CascadeProjects/hotel-booking-system/src/domain/value-objects/Periodo.ts:1:0-111:1) - Com validação de datas e cálculo de noites

### 📁 **Entidades** (`/src/main/java/com/hotel/booking/entities/`)
- **[Quarto](cci:2://file:///home/walisson/CascadeProjects/hotel-booking-system/src/domain/entities/Quarto.ts:5:0-269:1)** - Gestão completa com camas, comodidades e preços
- **[Hospede](cci:2://file:///home/walisson/CascadeProjects/hotel-booking-system/src/domain/entities/Hospede.ts:3:0-244:1)** - Com validação de CPF/e-mail e busca
- **[Reserva](cci:2://file:///home/walisson/CascadeProjects/hotel-booking-system/src/domain/entities/Reserva.ts:7:0-461:1)** - Ciclo completo com check-in/check-out
- **[Cama](cci:2://file:///home/walisson/CascadeProjects/hotel-booking-system/src/domain/entities/Cama.ts:3:0-93:1)** - Tipos e capacidades
- **[Pagamento](cci:2://file:///home/walisson/CascadeProjects/hotel-booking-system/src/domain/entities/Pagamento.ts:3:0-224:1)** - Múltiplos métodos e status

## 🚀 **Principais Funcionalidades**

### ✅ **Quarto**
```java
Quarto quarto = Quarto.criar("101", 2, TipoQuarto.LUXO, new BigDecimal("350.00"));
quarto.adicionarCama(TipoCama.CASAL_KING);
quarto.atualizarStatus(StatusQuarto.OCUPADO);
```

### ✅ **Hospede**
```java
Hospede hospede = Hospede.criar("João", "Silva", "123.456.789-00", "joao@email.com");
// Validação automática de CPF e e-mail
```

### ✅ **Reserva**
```java
Reserva reserva = Reserva.criar(hospede, quarto, periodo);
reserva.confirmar();
reserva.realizarCheckIn();
reserva.realizarCheckOut();
```

## 🔧 **Tecnologias e Padrões**

- **Java 17** + **Spring Boot 3.2.0**
- **JPA/Hibernate** para persistência
- **Lombok** para redução de boilerplate
- **Domain-Driven Design** (DDD)
- **Builder Pattern** para criação de objetos
- **Validações robustas** em todas as entidades
- **Imutabilidade** onde aplicável

## 📋 **Validações Implementadas**

- **CPF**: Algoritmo oficial de validação
- **E-mail**: Regex de validação
- **Períodos**: Check-out > Check-in, máximo 30 dias
- **Capacidade**: Consistência entre quartos e camas
- **Valores**: Positivos e não nulos

## 🎯 **Como Executar**

```bash
cd /home/walisson/CascadeProjects/hotel-booking-java
mvn clean compile
mvn exec:java -Dexec.mainClass="com.hotel.booking.examples.ExemploUso"
```

O projeto está pronto para ser expandido com controllers REST, services e repositories. A estrutura segue as melhores práticas de arquitetura limpa e está preparada para integração com banco de dados PostgreSQL.