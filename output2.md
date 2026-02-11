## Requisitos Classificados por Prioridade (MOSCOW)

## MUST HAVE (Deve ter - Essencial)

## Requisitos Funcionais
* RF01.1: Cadastrar quartos com número, capacidade, tipo, preço por diária e comodidades
* RF01.3: Listar todos os quartos com informações básicas e disponibilidade
* RF01.5: Gerenciar status de disponibilidade (Ocupado, Livre, Manutenção, Limpeza)
* RF02.1: Cadastrar hóspedes com nome, sobrenome, CPF e email
* RF02.2: Listar todos os hóspedes cadastrados
* RF02.3: Validar CPF no formato correto
* RF03.1: Criar reservas vinculando hóspede a quarto
* RF03.3: Listar todas as reservas com informações do quarto e hóspede
* RF03.4: Atualizar automaticamente status de disponibilidade ao criar/cancelar reserva

## Requisitos Não Funcionais
* RNF01.1: Interface com paleta de cores verde e azul
* RNF01.2: Componentes modernos e responsivos
* RNF04.1: Validar todos os dados de entrada no frontend e backend

---

## SHOULD HAVE (Deveria ter - Importante)

## Requisitos Funcionais
* RF01.2: Editar informações de quartos cadastrados
* RF01.4: Cadastrar múltiplas camas por quarto com seus respectivos tipos
* RF02.3: Validar CPF no formato correto
* RF02.4: Validar email no formato correto
* RF03.2: Editar reservas existentes
* RF03.5: Impedir reserva de quartos com status diferente de "Livre"

## Requisitos Não Funcionais
* RNF01.3: Sistema intuitivo e de fácil navegação
* RNF01.4: Feedback visual para ações do usuário
* RNF03.1: Funcionar nos principais navegadores
* RNF05.1: Código seguindo padrões e boas práticas

---

## COULD HAVE (Poderia ter - Desejável)

## Requisitos Não Funcionais
* RNF02.1: Carregar listas em menos de 2 segundos
* RNF02.2: Responder a ações em menos de 1 segundo
* RNF03.2: Responsivo para diferentes tamanhos de tela
* RNF04.2: Proteger dados sensíveis dos hóspedes
* RNF05.2: Arquitetura modular e escalável

---

## WON'T HAVE (Não terá - Futuro)
* Nenhum requisito classificado nesta categoria para a versão inicial do sistema

---

## Justificativa da Priorização:
* Must Have: Funcionalidades core que permitem o sistema operar (CRUD básico dos 3 módulos)
* Should Have: Funcionalidades que melhoram significativamente a experiência e integridade dos dados
* Could Have: Melhorias de qualidade, performance e experiência do usuário que agregam valor mas não impedem o funcionamento