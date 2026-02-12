“Gere o diagrama de componentes (texto ou UML).”
**-Resposta obtida via chat-**

---

Aqui está o diagrama de componentes em formato PlantUML, que você pode renderizar usando qualquer ferramenta compatível:

```
@startuml Hotel Booking System - Diagrama de Componentes

skinparam componentStyle uml2
skinparam monochrome true
skinparam shadowing false

' --- Frontend ---
package "Frontend" {
  [Páginas Web\n(Next.js)] as frontend
  [Admin Dashboard\n(Next.js)] as admin
  [Mobile App\n(React Native)] as mobile
}

' --- API Gateway ---
node "API Gateway" {
  [BFF Web] as bff_web
  [BFF Mobile] as bff_mobile
  [GraphQL API] as graphql
}

' --- Serviços Principais ---
node "Serviços de Domínio" {
  [Serviço de Quartos] as room_service
  [Serviço de Hóspedes] as guest_service
  [Serviço de Reservas] as booking_service
  [Serviço de Pagamentos] as payment_service
  [Serviço de Notificações] as notification_service
}

' --- Armazenamento ---
database "PostgreSQL" as postgres {
  [Dados Transacionais] as pg_data
}

database "Redis" as redis {
  [Cache] as cache
  [Sessões] as sessions
}

database "MongoDB" as mongo {
  [Logs] as logs
  [Métricas] as metrics
}

' --- Serviços Externos ---
[Gateway de Pagamento\nex: Stripe] as stripe
[Serviço de Email\nex: SendGrid] as email_service
[Serviço de SMS] as sms_service

' --- Conexões Frontend ---
frontend --> bff_web : HTTPS/2
admin --> bff_web : HTTPS/2
mobile --> bff_mobile : HTTPS/2

' --- Conexões API Gateway ---
bff_web --> room_service : gRPC
bff_web --> guest_service : gRPC
bff_web --> booking_service : gRPC
bff_web --> graphql : GraphQL

bff_mobile --> booking_service : gRPC
bff_mobile --> graphql : GraphQL

graphql --> room_service : gRPC
graphql --> guest_service : gRPC
graphql --> booking_service : gRPC

' --- Conexões Serviços ---
room_service --> postgres : JDBC
guest_service --> postgres : JDBC
booking_service --> postgres : JDBC

room_service --> redis : Cache
guest_service --> redis : Cache
booking_service --> redis : Cache

payment_service --> stripe : HTTPS
notification_service --> email_service : SMTP/API
notification_service --> sms_service : API

' --- Mensageria ---
queue "RabbitMQ" as rabbitmq {
  [fila.reservas] as queue_bookings
  [fila.notificacoes] as queue_notifications
  [fila.pagamentos] as queue_payments
}

booking_service --> queue_bookings : Publica eventos
payment_service --> queue_payments : Consome eventos
notification_service --> queue_notifications : Consome eventos

' --- Monitoramento ---
[Prometheus] as prometheus
[Grafana] as grafana
[ELK Stack] as elk

room_service --> prometheus : Métricas
guest_service --> prometheus : Métricas
booking_service --> prometheus : Métricas

prometheus --> grafana : Fonte de Dados
postgres --> elk : Logs
redis --> elk : Logs

' --- Legenda ---
legend right
  **Legenda:**
  ---
  <b>Linhas Sólidas</b>: Comunicação síncrona
  <b>Linhas Tracejadas</b>: Comunicação assíncrona
  <b>Setas</b>: Direção da comunicação
endlegend

@enduml
```

## Descrição dos Componentes:

### Frontend
- **Páginas Web**: Interface para hóspedes (Next.js)
- **Admin Dashboard**: Painel administrativo para funcionários
- **Mobile App**: Aplicativo móvel (React Native)

### API Gateway
- **BFF Web**: Backend for Frontend para aplicações web
- **BFF Mobile**: Backend for Frontend para aplicativo móvel
- **GraphQL API**: API flexível para consultas complexas

### Serviços de Domínio
- **Serviço de Quartos**: Gerencia quartos e disponibilidade
- **Serviço de Hóspedes**: Gerencia cadastro de hóspedes
- **Serviço de Reservas**: Gerencia o ciclo de vida das reservas
- **Serviço de Pagamentos**: Processa pagamentos
- **Serviço de Notificações**: Envio de e-mails e notificações

### Armazenamento
- **PostgreSQL**: Dados transacionais
- **Redis**: Cache e sessões
- **MongoDB**: Logs e métricas



### Serviços Externos
- **Gateway de Pagamento**: Integração com Stripe
- **Serviço de Email**: Integração com SendGrid
- **Serviço de SMS**: Para notificações SMS

### Mensageria
- **RabbitMQ**: Filas para comunicação assíncrona

### Monitoramento
- **Prometheus**: Coleta de métricas
- **Grafana**: Visualização de métricas
- **ELK Stack**: Análise de logs

Este diagrama mostra a arquitetura em camadas, com comunicação síncrona (linhas sólidas) e assíncrona (linhas tracejadas), além das dependências entre os componentes.

