# Modelo de Dados

## Documentação Técnica da Implementação - Stack 1
    Esta documentação foi feita com o auxilio do Gemini PROx     
**Prompt de Origem:** "Utilizando Typescript + Node.js + React, implemente as classes para: Quarto, Hóspede e Reserva."

### 1. Escopo e Conformidade com o Prompt
A resposta gerada focou-se exclusivamente na camada de domínio da aplicação, implementando a lógica de negócios em **TypeScript**. Embora o prompt solicitasse explicitamente a inclusão de **Node.js** (ambiente de servidor/API) e **React** (interface do utilizador), os artefatos produzidos restringem-se às definições de classes, entidades e objetos de valor, sem a apresentação de componentes visuais ou *endpoints* de API nesta iteração.

### 2. Análise Técnica das Entidades
Foram geradas as três classes principais solicitadas, juntamente com estruturas auxiliares para garantir a integridade dos dados:

* **Quarto:** A classe implementa propriedades para identificação, capacidade e precificação. Inclui métodos para cálculo de preços baseados em períodos e gestão de camas, alinhando-se funcionalmente ao requisito de gestão de inventário.
* **Hóspede:** A implementação contempla a validação de dados cadastrais. Observa-se a inclusão de lógica para validação de CPF e formato de e-mail diretamente na entidade, atendendo aos requisitos de integridade de dados.
* **Reserva:** Atua como a entidade agregadora. A lógica implementada cobre o ciclo de vida da reserva (pendente, confirmada, *check-in*, *check-out*) e o cálculo financeiro, incluindo taxas para hóspedes adicionais.

### 3. Objetos de Valor e Estruturas Auxiliares
Para suportar as entidades principais, foram criados componentes adicionais não solicitados explicitamente, mas necessários para a coesão do código:

* **Periodo:** Encapsula a lógica de datas de entrada e saída, incluindo validações de intervalo.
* **Endereco:** Segrega os dados de localização do hóspede.
* **Pagamento:** Estrutura básica para processamento financeiro.

### 4. Avaliação Arquitetural
O código adota uma abordagem orientada ao domínio (DDD), isolando as regras de negócio de dependências externas. A utilização de *Enums* para tipificar estados (`StatusReserva`, `TipoQuarto`) e a segregação de responsabilidades através de *Value Objects* demonstram conformidade com padrões de projeto que visam a manutenibilidade e a consistência do sistema, independentemente da ausência inicial das camadas de apresentação e infraestrutura solicitadas no prompt.