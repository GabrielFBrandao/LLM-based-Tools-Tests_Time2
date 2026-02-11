## Histórias de Usuário

## Módulo: Gestão de Quartos

## US01 Cadastrar Quarto
* Como recepcionista do hotel,
* Eu quero cadastrar novos quartos com suas informações (número, capacidade, tipo, preço, comodidades e camas),
* Para que eu possa disponibilizá-los para reserva no sistema.
* **Critérios de Aceitação:**
* Todos os campos obrigatórios devem ser preenchidos
* O número do quarto deve ser único
* Deve ser possível adicionar múltiplas camas ao quarto
* Comodidades devem ser selecionáveis via checkbox

## US02 - Listar Quartos
* Como recepcionista do hotel,
* Eu quero visualizar uma lista de todos os quartos cadastrados com suas informações principais,
* Para que eu possa consultar rapidamente a disponibilidade e características dos quartos.
* **Critérios de Aceitação:**
* Lista deve exibir: número, tipo, preço e disponibilidade
* Deve haver botão de edição em cada linha
* Status de disponibilidade deve ser visível

## US03-Editar Quarto
* Como recepcionista do hotel,
* Eu quero editar as informações de um quarto cadastrado,
* Para que eu possa atualizar preços, comodidades ou corrigir dados incorretos.
* **Critérios de Aceitação:**
* Deve carregar os dados atuais do quarto
* Deve permitir alterar todos os campos
* Alterações devem ser salvas e refletidas na lista

## US04 - Gerenciar Status de Disponibilidade
* Como recepcionista do hotel,
* Eu quero alterar o status de disponibilidade dos quartos (Livre, Ocupado, Manutenção, Limpeza),
* Para que eu possa controlar quais quartos estão disponíveis para reserva.
* **Critérios de Aceitação:**
* Status deve ser alterável facilmente
* Quartos não livres não devem permitir novas reservas
* Mudança de status deve ser imediata

## Módulo: Gestão de Hóspedes

## US05 Cadastrar Hóspede
* Como recepcionista do hotel,
* Eu quero cadastrar novos hóspedes com seus dados pessoais (nome, sobrenome, CPF e email),
* Para que eu possa vinculá-los às reservas e manter um registro de clientes.
* **Critérios de Aceitação:**
* Todos os campos devem ser obrigatórios
* CPF deve ser validado no formato correto
* Email deve ser validado no formato correto
* CPF deve ser único no sistema

## US06 - Listar Hóspedes
* Como recepcionista do hotel,
* Eu quero visualizar uma lista de todos os hóspedes cadastrados,
* Para que eu possa consultar e selecionar hóspedes ao criar reservas.
* **Critérios de Aceitação:**
* Lista deve exibir: nome, sobrenome e CPF
* Deve ser possível buscar/filtrar hóspedes
* Lista deve estar ordenada alfabeticamente

## Módulo: Gestão de Reservas

## US07 - Criar Reserva
* Como recepcionista do hotel,
* Eu quero criar uma reserva vinculando um hóspede a um quarto disponível,
* Para que eu possa registrar a ocupação do quarto pelo cliente.
* **Critérios de Aceitação:**
* Deve permitir selecionar hóspede cadastrado
* Deve permitir selecionar apenas quartos com status "Livre"
* Status do quarto deve mudar automaticamente para "Ocupado"
* Reserva deve aparecer na lista de reservas

## US08-Listar Reservas
* Como recepcionista do hotel,
* Eu quero visualizar todas as reservas ativas com informações do quarto e hóspede,
* Para que eu possa acompanhar a ocupação do hotel.
* **Critérios de Aceitação:**
* Lista deve exibir: número do quarto, tipo, nome do hóspede e status
* Status deve ser exibido como chip colorido
* Deve haver botão de edição em cada reserva

## US09 - Editar Reserva
* Como recepcionista do hotel,
* Eu quero editar uma reserva existente,
* Para que eu possa alterar o hóspede, cancelar ou modificar informações da reserva.
* **Critérios de Aceitação:**
* Deve permitir alterar o hóspede vinculado
* Deve permitir cancelar a reserva
* Ao cancelar, o quarto deve voltar ao status "Livre"
* Alterações devem ser refletidas imediatamente

## US10 - Validar Disponibilidade na Reserva
* Como recepcionista do hotel,
* Eu quero que o sistema impeça reservas em quartos não disponíveis,
* Para que eu evite conflitos e duplas reservas.
* **Critérios de Aceitação:**
* Apenas quartos com status "Livre" devem ser selecionáveis
* Sistema deve exibir mensagem de erro ao tentar reservar quarto indisponível
* Lista de quartos disponíveis deve ser atualizada em tempo real