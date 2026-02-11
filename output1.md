## Requisitos Funcionais (RF) e Não Funcionais (RNF)

## Requisitos Funcionais (RF)

## RF01 - Gestão de Quartos
* RF01.1: O sistema deve permitir cadastrar quartos com número, capacidade, tipo, preço por diária e comodidades
* RF01.2: O sistema deve permitir editar informações de quartos cadastrados
* RF01.3: O sistema deve listar todos os quartos com suas informações básicas e disponibilidade
* RF01.4: O sistema deve permitir cadastrar múltiplas camas por quarto com seus respectivos tipos
* RF01.5: O sistema deve gerenciar o status de disponibilidade (Ocupado, Livre, Manutenção, Limpeza)

## RF02 - Gestão de Hóspedes
* RF02.1: O sistema deve permitir cadastrar hóspedes com nome, sobrenome, CPF e email
* RF02.2: O sistema deve listar todos os hóspedes cadastrados
* RF02.3: O sistema deve validar CPF no formato correto
* RF02.4: O sistema deve validar email no formato correto

## RF03 - Gestão de Reservas
* RF03.1: O sistema deve permitir criar reservas vinculando hóspede a quarto
* RF03.2: O sistema deve permitir editar reservas existentes
* RF03.3: O sistema deve listar todas as reservas com informações do quarto e hóspede
* RF03.4: O sistema deve atualizar automaticamente o status de disponibilidade do quarto ao criar/cancelar reserva
* RF03.5: O sistema deve impedir reserva de quartos com status diferente de "Livre"

## Requisitos Não Funcionais (RNF)

## RNF01 - Usabilidade
* RNF01.1: A interface deve utilizar paleta de cores verde e azul
* RNF01.2: A interface deve utilizar componentes modernos e responsivos
* RNF01.3: O sistema deve ser intuitivo e de fácil navegação
* RNF01.4: O sistema deve fornecer feedback visual para ações do usuário

## RNF02 - Performance
* RNF02.1: O sistema deve carregar listas em menos de 2 segundos
* RNF02.2: O sistema deve responder a ações do usuário em menos de 1 segundo

## RNF03 - Compatibilidade
* RNF03.1: O sistema deve funcionar nos principais navegadores (Chrome, Firefox, Safari, Edge)
* RNF03.2: O sistema deve ser responsivo para diferentes tamanhos de tela

## RNF04 - Segurança
* RNF04.1: O sistema deve validar todos os dados de entrada no frontend e backend
* RNF04.2: O sistema deve proteger dados sensíveis dos hóspedes (CPF, email)

## RNF05 - Manutenibilidade
* RNF05.1: O código deve seguir padrões de desenvolvimento e boas práticas
* RNF05.2: O sistema deve ter arquitetura modular e escalável