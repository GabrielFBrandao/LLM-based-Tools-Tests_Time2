“Gere o diagrama de classes principal (Quarto, Hóspede, Reserva.).”
**-Resposta obtida via chat-**

---
Aqui está o diagrama de classes principal focado nas entidades de domínio essenciais do sistema de reserva de hotel:

```
@startuml Diagrama de Classes - Sistema de Reserva de Hotel

' --- Estilos ---
skinparam class {
    BackgroundColor White
    ArrowColor #2E7D32
    BorderColor #1976D2
    FontSize 13
    AttributeFontSize 12
    AttributeFontStyle plain
    MethodFontSize 12
    MethodFontStyle plain
    HeaderBackgroundColor #E3F2FD
    HeaderFontStyle bold
    FooterBackgroundColor #E3F2FD
}

' --- Classes Principais ---
class Quarto {
  -id: UUID
  -numero: String
  -capacidade: Integer
  -tipo: TipoQuarto
  -precoPorNoite: BigDecimal
  -status: StatusQuarto
  -hasMinibar: Boolean
  -hasCafeDaManha: Boolean
  -hasArCondicionado: Boolean
  -hasTV: Boolean
  -camas: List<Cama>
  +adicionarCama(tipo: TipoCama): void
  +estaDisponivel(periodo: Periodo): Boolean
  +atualizarStatus(novoStatus: StatusQuarto): void
}

class Cama {
  -id: UUID
  -tipo: TipoCama
  -quartoId: UUID
}




class Hospede {
  -id: UUID
  -nome: String
  -sobrenome: String
  -cpf: String
  -email: String
  -telefone: String
  -endereco: Endereco
  -dataCadastro: LocalDateTime
  +atualizarDados(dados: DadosHospede): void
  +validarCPF(): Boolean
}

class Reserva {
  -id: UUID
  -codigoReserva: String
  -hospede: Hospede
  -quarto: Quarto
  -periodo: Periodo
  -status: StatusReserva
  -valorTotal: BigDecimal
  -hospedesAdicionais: List<Hospede>
  -pagamentos: List<Pagamento>
  +calcularValorTotal(): BigDecimal
  +adicionarHospede(hospede: Hospede): void
  +realizarCheckIn(): void
  +realizarCheckOut(): void
  +cancelar(motivo: String): void
}

class Periodo {
  -checkIn: LocalDateTime
  -checkOut: LocalDateTime
  +getNumeroNoites(): Integer
  +contem(data: LocalDate): Boolean
  +sobrepoe(outro: Periodo): Boolean
}

class Pagamento {
  -id: UUID
  -valor: BigDecimal
  -data: LocalDateTime
  -metodo: MetodoPagamento
  -status: StatusPagamento
  -codigoTransacao: String
  +processar(): Boolean
  +estornar(): Boolean
}



class Endereco {
  -logradouro: String
  -numero: String
  -complemento: String
  -bairro: String
  -cidade: String
  -estado: String
  -cep: String
  -pais: String
}

' --- Enums ---
enum TipoQuarto {
  BASICO
  MODERNO
  LUXO
}

enum StatusQuarto {
  DISPONIVEL
  OCUPADO
  MANUTENCAO
  LIMPEZA
}

enum TipoCama {
  SOLTEIRO
  CASAL_KING
  CASAL_QUEEN
}

enum StatusReserva {
  PENDENTE
  CONFIRMADA
  CHECK_IN
  CHECK_OUT
  CANCELADA
  NO_SHOW
}

enum MetodoPagamento {
  CARTAO_CREDITO
  CARTAO_DEBITO
  DINHEIRO
  PIX
  TRANSFERENCIA
}




enum StatusPagamento {
  PENDENTE
  APROVADO
  RECUSADO
  ESTORNADO
  REEMBOLSADO
}

' --- Relacionamentos ---
Quarto "1" *-- "1..*" Cama
Reserva "1" *-- "1" Quarto
Reserva "1" *-- "1" Hospede
Reserva "1" *-- "1" Periodo
Reserva "1" *-- "0..*" Pagamento
Reserva "0..*" -- "0..*" Hospede : hospedesAdicionais
Hospede "1" *-- "1" Endereco

' --- Observações ---
note top of Quarto
  Gerencia o estado e disponibilidade
  dos quartos do hotel
end note

note top of Reserva
  Controla todo o ciclo de vida
  de uma reserva, do pedido ao check-out
end note

@enduml
```

## Explicação das Classes Principais:

### Quarto
- **Atributos**: Gerencia as características físicas do quarto (número, tipo, comodidades)
- **Comportamentos**: Controle de disponibilidade e status

### Cama
- **Atributos**: Tipo e associação com o quarto
- **Comportamentos**: Simples modelo de dados

### Hospede
- **Atributos**: Dados pessoais e de contato
- **Comportamentos**: Validação de dados e atualização de informações

### Reserva
- **Atributos**: Associa hóspede, quarto e período
- **Comportamentos**: Gerenciamento do ciclo de vida da reserva



### Periodo
- **Atributos**: Datas de check-in e check-out
- **Comportamentos**: Cálculos de datas e verificação de sobreposição

### Pagamento
- **Atributos**: Dados da transação
- **Comportamentos**: Processamento e estorno

### Enums
- **TipoQuarto**: Classificação dos quartos
- **StatusQuarto**: Estados de disponibilidade
- **TipoCama**: Tipos de camas disponíveis
- **StatusReserva**: Estados do ciclo de vida da reserva
- **MetodoPagamento**: Formas de pagamento aceitas
- **StatusPagamento**: Estados do processo de pagamento

Este diagrama representa o modelo de domínio principal do sistema, mostrando os relacionamentos entre as entidades e seus principais atributos e comportamentos.

