# Hotel Booking System - Java + Spring Boot

Sistema de reserva de hotel implementado em Java com Spring Boot, seguindo princípios de Domain-Driven Design (DDD) e boas práticas de desenvolvimento.

## Estrutura do Projeto

```
hotel-booking-java/
├── src/main/java/com/hotel/booking/
│   ├── entities/           # Entidades de domínio
│   │   ├── Quarto.java
│   │   ├── Hospede.java
│   │   ├── Reserva.java
│   │   ├── Cama.java
│   │   └── Pagamento.java
│   ├── enums/             # Enumerações do sistema
│   │   ├── TipoQuarto.java
│   │   ├── StatusQuarto.java
│   │   ├── TipoCama.java
│   │   ├── StatusReserva.java
│   │   ├── MetodoPagamento.java
│   │   └── StatusPagamento.java
│   ├── valueobjects/      # Value Objects
│   │   ├── Endereco.java
│   │   └── Periodo.java
│   ├── exceptions/        # Exceções customizadas
│   ├── service/           # Serviços de domínio
│   ├── repository/        # Repositórios JPA
│   ├── controller/        # Controllers REST
│   └── examples/          # Exemplos de uso
├── src/test/java/         # Testes
├── src/main/resources/    # Recursos (application.properties)
└── pom.xml               # Configuração Maven
```

## Tecnologias Utilizadas

- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Data JPA**
- **PostgreSQL** (produção)
- **H2** (testes)
- **Lombok** (redução de código boilerplate)
- **JUnit 5** (testes)
- **Maven** (gerenciamento de dependências)

## Entidades Principais

### Quarto
```java
Quarto quarto = Quarto.criar(
    "101",                           // número
    2,                               // capacidade
    TipoQuarto.LUXO,                 // tipo
    new BigDecimal("350.00"),        // preço por noite
    true,                            // tem minibar
    true,                            // tem café da manhã
    true,                            // tem ar condicionado
    true                             // tem TV
);

quarto.adicionarCama(TipoCama.CASAL_KING);
```

### Hospede
```java
Endereco endereco = Endereco.builder()
    .logradouro("Rua das Flores")
    .numero("123")
    .bairro("Centro")
    .cidade("São Paulo")
    .estado("SP")
    .cep("01234-567")
    .build();

Hospede hospede = Hospede.criar(
    "João",                          // nome
    "Silva",                         // sobrenome
    "123.456.789-00",               // CPF
    "joao@email.com",               // e-mail
    "(11) 98765-4321",             // telefone
    endereco                        // endereço
);
```

### Reserva
```java
Periodo periodo = Periodo.builder()
    .checkIn(LocalDate.of(2025, 3, 10))
    .checkOut(LocalDate.of(2025, 3, 15))
    .build();

Reserva reserva = Reserva.criar(hospede, quarto, periodo);
reserva.confirmar();
reserva.realizarCheckIn();
reserva.realizarCheckOut();
```

## Funcionalidades Implementadas

### Gestão de Quartos
- ✅ Cadastro de quartos com validações
- ✅ Gerenciamento de camas
- ✅ Cálculo automático de preços
- ✅ Controle de status (disponível, ocupado, manutenção, limpeza)

### Gestão de Hóspedes
- ✅ Cadastro com validação de CPF e e-mail
- ✅ Gerenciamento de endereços
- ✅ Busca por nome, sobrenome ou CPF
- ✅ Formatação automática de dados

### Gestão de Reservas
- ✅ Ciclo completo da reserva (pendente → confirmada → check-in → check-out)
- ✅ Cálculo automático de valores
- ✅ Suporte a hóspedes adicionais
- ✅ Validação de períodos e disponibilidade

### Pagamentos
- ✅ Múltiplos métodos de pagamento
- ✅ Controle de status (pendente, aprovado, recusado, estornado)
- ✅ Cálculo de saldos

## Validações Implementadas

### Quarto
- Número único e obrigatório
- Capacidade positiva
- Preço positivo
- Pelo menos uma cama
- Capacidade das camas deve corresponder à capacidade do quarto

### Hospede
- Nome e sobrenome obrigatórios
- CPF válido (algoritmo oficial)
- E-mail válido (regex)
- Formatação automática de CPF e telefone

### Reserva
- Hóspede e quarto obrigatórios
- Período válido (check-out > check-in)
- Check-in não pode ser no passado
- Máximo de 30 noites

### Pagamento
- Valor positivo
- Método e status obrigatórios
- Fluxo de estados controlado

## Como Executar

### Pré-requisitos
- Java 17+
- Maven 3.6+
- PostgreSQL (opcional para desenvolvimento)

### Executando o Exemplo
```bash
# Compilar o projeto
mvn clean compile

# Executar o exemplo de uso
mvn exec:java -Dexec.mainClass="com.hotel.booking.examples.ExemploUso"
```

### Executando Testes
```bash
mvn test
```

### Iniciando Aplicação Spring Boot
```bash
mvn spring-boot:run
```

## Padrões de Projeto Aplicados

### Domain-Driven Design (DDD)
- **Entidades**: Quarto, Hospede, Reserva, Cama, Pagamento
- **Value Objects**: Endereco, Periodo
- **Enums**: Tipos e status do sistema

### Padrões Comportamentais
- **Builder**: Para criação de objetos complexos
- **Factory Methods**: Para criação de entidades

### Padrões Estruturais
- **Repository**: Abstração do acesso a dados
- **Embedded**: Para value objects

## Próximos Passos

1. **Controllers REST**: Expor endpoints da API
2. **Services**: Implementar regras de negócio complexas
3. **Repositories**: Integração com banco de dados
4. **Testes Unitários**: Cobertura completa das entidades
5. **Integração**: Configuração completa do Spring Boot
6. **Segurança**: Autenticação e autorização
7. **Documentação**: OpenAPI/Swagger

## Exemplo de Saída

```
=== Sistema de Reserva de Hotel - Demonstração Java ===

1. Criando hóspede...
Hóspede criado: João Silva
CPF: 123.456.789-00
E-mail: joao.silva@email.com
Telefone: (11) 98765-4321
Endereço: Rua das Flores, 123 - Apto 45, Centro, São Paulo - SP, 01234-567

2. Criando quarto...
Quarto criado: 101
Tipo: Luxo
Capacidade: 2 pessoas
Preço: R$ 350.00 por noite
Comodidades: Frigobar, Café da Manhã, Ar-Condicionado, TV
Camas: Cama de Casal King

3. Criando reserva...
Reserva criada: RES-ABC123-XYZ789
Período: 10/03/2025 a 15/03/2025
Número de noites: 5
Valor total: R$ 2000.00
Status: Pendente

...

=== Demonstração concluída com sucesso! ===
```

## Licença

MIT License
