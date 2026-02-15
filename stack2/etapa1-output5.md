## Casos de Uso

## Atores do Sistema
* Recepcionista: Usuário principal que gerencia quartos, hóspedes e reservas

## UC01 Cadastrar Quarto
* **Ator principal:** Recepcionista
* **Pré-condições:**
    * Recepcionista está autenticado no sistema
    * Recepcionista tem acesso ao módulo de Gestão de Quartos
* **Fluxo Principal:**
    1. Recepcionista acessa a tela de cadastro de quartos
    2. Sistema exibe formulário de cadastro
    3. Recepcionista preenche número, capacidade, tipo, preço e comodidades
    4. Recepcionista adiciona informações de camas
    5. Recepcionista confirma o cadastro
    6. Sistema valida os dados
    7. Sistema salva o quarto com status "Livre"
    8. Sistema exibe mensagem de sucesso
* **Fluxo Alternativo 1 - Número duplicado:**
    * 6a. Sistema detecta número de quarto já existente
    * 6b. Sistema exibe mensagem de erro
    * 6c. Retorna ao passo 3
* **Pós-condições:**
    * Quarto cadastrado no sistema
    * Quarto disponível na lista com status "Livre"

## UC02-Editar Quarto
* **Ator principal:** Recepcionista
* **Pré-condições:**
    * Recepcionista está autenticado no sistema
    * Quarto existe no sistema
* **Fluxo Principal:**
    1. Recepcionista acessa a lista de quartos
    2. Recepcionista clica no botão de editar do quarto desejado
    3. Sistema carrega dados atuais do quarto
    4. Recepcionista altera os campos desejados
    5. Recepcionista confirma as alterações
    6. Sistema valida os dados
    7. Sistema atualiza o quarto
    8. Sistema exibe mensagem de sucesso
* **Pós-condições:**
    * Dados do quarto atualizados no sistema
    * Alterações refletidas na lista de quartos

## UC03-Alterar Status de Quarto
* **Ator principal:** Recepcionista
* **Pré-condições:**
    * Recepcionista está autenticado no sistema
    * Quarto existe no sistema
* **Fluxo Principal:**
    1. Recepcionista acessa a lista de quartos ou edição de quarto
    2. Recepcionista seleciona novo status (Livre, Ocupado, Manutenção, Limpeza)
    3. Sistema atualiza o status do quarto
    4. Sistema exibe status atualizado
* **Pós-condições:**
    * Status do quarto atualizado
    * Disponibilidade para reserva ajustada conforme novo status

## UC04-Cadastrar Hóspede
* **Ator principal:** Recepcionista
* **Pré-condições:**
    * Recepcionista está autenticado no sistema
    * Recepcionista tem acesso ao módulo de Gestão de Hóspedes
* **Fluxo Principal:**
    1. Recepcionista acessa a tela de cadastro de hóspedes
    2. Sistema exibe formulário de cadastro
    3. Recepcionista preenche nome, sobrenome, CPF e email
    4. Recepcionista confirma o cadastro
    5. Sistema valida CPF e email
    6. Sistema verifica se CPF já existe
    7. Sistema salva o hóspede
    8. Sistema exibe mensagem de sucesso
* **Fluxo Alternativo 1 CPF inválido:**
    * 5a. Sistema detecta CPF em formato inválido
    * 5b. Sistema exibe mensagem "CPF inválido"
    * 5c. Retorna ao passo 3
* **Fluxo Alternativo 2 - Email inválido:**
    * 5a. Sistema detecta email em formato inválido
    * 5b. Sistema exibe mensagem "Email inválido"
    * 5c. Retorna ao passo 3
* **Fluxo Alternativo 3 - CPF duplicado:**
    * 6a. Sistema detecta CPF já cadastrado
    * 6b. Sistema exibe mensagem "CPF já cadastrado"
    * 6c. Retorna ao passo 3
* **Pós-condições:**
    * Hóspede cadastrado no sistema
    * Hóspede disponível para vinculação em reservas

## UC05 - Listar Hóspedes
* **Ator principal:** Recepcionista
* **Pré-condições:**
    * Recepcionista está autenticado no sistema
* **Fluxo Principal:**
    1. Recepcionista acessa a lista de hóspedes
    2. Sistema busca todos os hóspedes cadastrados
    3. Sistema ordena hóspedes alfabeticamente
    4. Sistema exibe lista com nome, sobrenome e CPF
* **Pós-condições:**
    * Lista de hóspedes exibida

## UC06 - Criar Reserva
* **Ator principal:** Recepcionista
* **Pré-condições:**
    * Recepcionista está autenticado no sistema
    * Existe pelo menos um quarto com status "Livre"
    * Existe pelo menos um hóspede cadastrado
* **Fluxo Principal:**
    1. Recepcionista acessa a tela de criação de reserva
    2. Sistema exibe lista de quartos com status "Livre"
    3. Recepcionista seleciona um quarto
    4. Sistema exibe lista de hóspedes cadastrados
    5. Recepcionista seleciona um hóspede
    6. Recepcionista confirma a reserva
    7. Sistema cria a reserva
    8. Sistema altera status do quarto para "Ocupado"
    9. Sistema exibe mensagem de sucesso
* **Fluxo Alternativo 1 - Nenhum quarto disponível:**
    * 2a. Sistema não encontra quartos com status "Livre"
    * 2b. Sistema exibe mensagem "Nenhum quarto disponível"
    * 2c. Caso de uso encerrado
* **Pós-condições:**
    * Reserva criada no sistema
    * Quarto com status alterado para "Ocupado"
    * Reserva visível na lista de reservas

## UC07- Editar Reserva
* **Ator principal:** Recepcionista
* **Pré-condições:**
    * Recepcionista está autenticado no sistema
    * Reserva existe no sistema
* **Fluxo Principal:**
    1. Recepcionista acessa a lista de reservas
    2. Recepcionista clica no botão de editar da reserva desejada
    3. Sistema carrega dados atuais da reserva
    4. Recepcionista altera o hóspede vinculado
    5. Recepcionista confirma as alterações
    6. Sistema atualiza a reserva
    7. Sistema exibe mensagem de sucesso
* **Pós-condições:**
    * Reserva atualizada no sistema
    * Alterações refletidas na lista de reservas

## UC08-Cancelar Reserva
* **Ator principal:** Recepcionista
* **Pré-condições:**
    * Recepcionista está autenticado no sistema
    * Reserva existe no sistema
* **Fluxo Principal:**
    1. Recepcionista acessa a edição de reserva
    2. Recepcionista seleciona opção de cancelar
    3. Sistema solicita confirmação
    4. Recepcionista confirma o cancelamento
    5. Sistema remove a reserva
    6. Sistema altera status do quarto para "Livre"
    7. Sistema exibe mensagem de sucesso
* **Pós-condições:**
    * Reserva removida do sistema
    * Quarto com status alterado para "Livre"
    * Quarto disponível para novas reservas

## UC09-Listar Reservas
* **Ator principal:** Recepcionista
* **Pré-condições:**
    * Recepcionista está autenticado no sistema
* **Fluxo Principal:**
    1. Recepcionista acessa a lista de reservas
    2. Sistema busca todas as reservas ativas
    3. Sistema exibe lista com número do quarto, tipo, nome do hóspede e status em chip
* **Pós-condições:**
    * Lista de reservas exibida com informações completas

## UC10 Listar Quartos
* **Ator principal:** Recepcionista
* **Pré-condições:**
    * Recepcionista está autenticado no sistema
* **Fluxo Principal:**
    1. Recepcionista acessa a lista de quartos
    2. Sistema busca todos os quartos cadastrados
    3. Sistema exibe lista com número, tipo, preço e disponibilidade
* **Pós-condições:**
    * Lista de quartos exibida com informações completas