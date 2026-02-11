## Histórias de Usuário com Critérios de Aceitação (Given-When-Then)

## Módulo: Gestão de Quartos

## US01 Cadastrar Quarto
* Como recepcionista do hotel,
* Eu quero cadastrar novos quartos com suas informações (número, capacidade, tipo, preço, comodidades e camas),
* Para que eu possa disponibilizá-los para reserva no sistema.
* **Critérios de Aceitação:**
* **Cenário 1: Cadastro bem-sucedido**
    * Given que estou na tela de cadastro de quarto
    * When preencho todos os campos obrigatórios com dados válidos
    * Then o quarto é cadastrado com sucesso e aparece na lista de quartos
* **Cenário 2: Número de quarto duplicado**
    * Given que já existe um quarto com número 101
    * When tento cadastrar outro quarto com número 101
    * Then o sistema exibe mensagem de erro informando que o número já existe
* **Cenário 3: Adicionar múltiplas camas**
    * Given que estou cadastrando um quarto
    * When adiciono 2 camas do tipo Solteiro e 1 cama Casal King
    * Then o quarto é salvo com as 3 camas vinculadas

## US02-Listar Quartos
* Como recepcionista do hotel,
* Eu quero visualizar uma lista de todos os quartos cadastrados com suas informações principais, Para que eu possa consultar rapidamente a disponibilidade e características dos quartos.
* **Critérios de Aceitação:**
* **Cenário 1: Visualizar lista de quartos**
    * Given que existem quartos cadastrados no sistema
    * When acesso a tela de listagem de quartos
    * Then vejo todos os quartos com número, tipo, preço e disponibilidade
* **Cenário 2: Identificar status visualmente**
    * Given que estou visualizando a lista de quartos
    * When um quarto está com status "Ocupado"
    * Then o status é exibido de forma clara e visível

## US03-Editar Quarto
* Como recepcionista do hotel,
* Eu quero editar as informações de um quarto cadastrado,
* Para que eu possa atualizar preços, comodidades ou corrigir dados incorretos.
* **Critérios de Aceitação:**
* **Cenário 1: Editar quarto com sucesso**
    * Given que estou visualizando a lista de quartos
    * When clico no botão de editar do quarto 101 e altero o preço de R$ 150 para R$ 180
    * Then o quarto é atualizado e a lista exibe o novo preço
* **Cenário 2: Carregar dados atuais**
    * Given que o quarto 101 tem preço R$ 150 e frigobar marcado
    * When clico para editar o quarto 101
    * Then o formulário é preenchido com os dados atuais do quarto

## US04 - Gerenciar Status de Disponibilidade
* Como recepcionista do hotel,
* Eu quero alterar o status de disponibilidade dos quartos (Livre, Ocupado, Manutenção, Limpeza), Para que eu possa controlar quais quartos estão disponíveis para reserva.
* **Critérios de Aceitação:**
* **Cenário 1: Alterar status para Manutenção**
    * Given que o quarto 101 está com status "Livre"
    * When altero o status para "Manutenção"
    * Then o quarto não aparece mais como disponível para reserva
* **Cenário 2: Mudança imediata de status**
    * Given que alterei o status do quarto 101 para "Limpeza"
    * When volto para a lista de quartos
    * Then o status "Limpeza" é exibido imediatamente

## Módulo: Gestão de Hóspedes

## US05 - Cadastrar Hóspede
* Como recepcionista do hotel,
* Eu quero cadastrar novos hóspedes com seus dados pessoais (nome, sobrenome, CPF e email), Para que eu possa vinculá-los às reservas e manter um registro de clientes.
* **Critérios de Aceitação:**
* **Cenário 1: Cadastro bem-sucedido**
    * Given que estou na tela de cadastro de hóspede
    * When preencho nome, sobrenome, CPF válido e email válido
    * Then o hóspede é cadastrado e aparece na lista
* **Cenário 2: CPF inválido**
    * Given que estou cadastrando um hóspede
    * When informo CPF "123.456.789-00" (inválido)
    * Then o sistema exibe mensagem de erro "CPF inválido"
* **Cenário 3: Email inválido**
    * Given que estou cadastrando um hóspede
    * When informo email "joao@email" (sem domínio completo)
    * Then o sistema exibe mensagem de erro "Email inválido"
* **Cenário 4: CPF duplicado**
    * Given que já existe um hóspede com CPF "123.456.789-10"
    * When tento cadastrar outro hóspede com o mesmo CPF
    * Then o sistema exibe mensagem "CPF já cadastrado"

## US06 - Listar Hóspedes
* Como recepcionista do hotel,
* Eu quero visualizar uma lista de todos os hóspedes cadastrados, Para que eu possa consultar e selecionar hóspedes ao criar reservas.
* **Critérios de Aceitação:**
* **Cenário 1: Visualizar lista ordenada**
    * Given que existem hóspedes cadastrados
    * When acesso a lista de hóspedes
    * Then vejo todos os hóspedes ordenados alfabeticamente por nome
* **Cenário 2: Exibir informações corretas**
    * Given que estou visualizando a lista de hóspedes
    * When a lista é carregada
    * Then vejo nome, sobrenome e CPF de cada hóspede (sem email)

## Módulo: Gestão de Reservas

## US07 - Criar Reserva
* Como recepcionista do hotel,
* Eu quero criar uma reserva vinculando um hóspede a um quarto disponível, Para que eu possa registrar a ocupação do quarto pelo cliente.
* **Critérios de Aceitação:**
* **Cenário 1: Criar reserva com sucesso**
    * Given que o quarto 101 está com status "Livre" e o hóspede João Silva está cadastrado
    * When crio uma reserva vinculando João Silva ao quarto 101
    * Then a reserva é criada, o quarto muda para status "Ocupado" e aparece na lista de reservas
* **Cenário 2: Selecionar apenas quartos livres**
    * Given que estou criando uma reserva
    * When visualizo a lista de quartos disponíveis
    * Then vejo apenas quartos com status "Livre"

## US08-Listar Reservas
* Como recepcionista do hotel,
* Eu quero visualizar todas as reservas ativas com informações do quarto e hóspede,
* Para que eu possa acompanhar a ocupação do hotel.
* **Critérios de Aceitação:**
* **Cenário 1: Visualizar lista completa**
    * Given que existem reservas ativas no sistema
    * When acesso a lista de reservas
    * Then vejo número do quarto, tipo, nome do hóspede e status em formato de chip
* **Cenário 2: Status visual com chip**
    * Given que estou visualizando a lista de reservas
    * When uma reserva tem status "Ocupado"
    * Then o status é exibido como chip colorido

## US09-Editar Reserva
* Como recepcionista do hotel,
* Eu quero editar uma reserva existente,
* Para que eu possa alterar o hóspede, cancelar ou modificar informações da reserva.
* **Critérios de Aceitação:**
* **Cenário 1: Alterar hóspede da reserva**
    * Given que existe uma reserva do quarto 101 para João Silva
    * When edito a reserva e altero o hóspede para Maria Santos
    * Then a reserva é atualizada e Maria Santos aparece vinculada ao quarto 101
* **Cenário 2: Cancelar reserva**
    * Given que existe uma reserva ativa do quarto 101
    * When cancelo a reserva
    * Then a reserva é removida e o quarto 101 volta ao status "Livre"

## US10 - Validar Disponibilidade na Reserva
* Como recepcionista do hotel,
* Eu quero que o sistema impeça reservas em quartos não disponíveis, Para que eu evite conflitos e duplas reservas.
* **Critérios de Aceitação:**
* **Cenário 1: Impedir reserva de quarto ocupado**
    * Given que o quarto 101 está com status "Ocupado"
    * When tento criar uma reserva para o quarto 101
    * Then o sistema exibe mensagem "Quarto não disponível para reserva"
* **Cenário 2: Impedir reserva de quarto em manutenção**
    * Given que o quarto 102 está com status "Manutenção"
    * When tento selecionar o quarto 102 para reserva
    * Then o quarto 102 não aparece na lista de quartos disponíveis