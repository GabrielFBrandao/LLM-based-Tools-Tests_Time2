Output para Elicitação e estruturação de requisitos e Histórias de usuário:

---

# Sistema de Reservas de Hotel – Documentação de Requisitos

## Requisitos Funcionais (RF)

| ID | Requisito | Prioridade (MoSCoW) |
|----|-----------|---------------------|
| RF01 | Cadastrar quartos com número, capacidade, tipo, preço, amenidades e camas | Must |
| RF02 | Listar quartos com número, tipo, preço e disponibilidade | Must |
| RF03 | Editar informações de um quarto | Must |
| RF04 | Alterar disponibilidade do quarto (Ocupado, Livre, Manutenção, Limpeza) | Must |
| RF05 | Cadastrar hóspedes com nome, sobrenome, CPF e e-mail | Must |
| RF06 | Listar hóspedes com nome, sobrenome e CPF | Must |
| RF07 | Listar reservas com número do quarto, tipo, nome do hóspede e disponibilidade | Must |
| RF08 | Editar uma reserva existente | Must |
| RF09 | Associar um hóspede a um quarto (criar reserva) | Should |
| RF10 | Validar CPF no cadastro de hóspede | Should |
| RF11 | Impedir cadastro de quarto com número duplicado | Should |
| RF12 | Filtrar/buscar quartos por tipo ou disponibilidade | Could |
| RF13 | Filtrar/buscar hóspedes por nome ou CPF | Could |
| RF14 | Excluir quarto (se não houver reserva ativa) | Won't (v1) |
| RF15 | Excluir hóspede (se não houver reserva ativa) | Won't (v1) |

## Requisitos Não Funcionais (RNF)

| ID | Requisito | Prioridade (MoSCoW) |
|----|-----------|---------------------|
| RNF01 | Interface web responsiva com paleta verde e azul | Must |
| RNF02 | Componentes modernos e consistentes (design system) | Must |
| RNF03 | Feedback visual ao usuário (toasts de sucesso/erro) | Should |
| RNF04 | Tempo de resposta da interface < 1s para operações CRUD | Should |
| RNF05 | Dados persistidos (não perder ao recarregar) | Should |
| RNF06 | Validação de formulários no lado do cliente | Should |
| RNF07 | Acessibilidade básica (labels, navegação por teclado) | Could |
| RNF08 | Suporte a múltiplos navegadores (Chrome, Firefox, Edge) | Could |

## Histórias de Usuário

### HU01 – Cadastrar Quarto

Como recepcionista, eu quero cadastrar um quarto informando número, capacidade, tipo, preço, amenidades e camas, para que o hotel tenha um registro atualizado dos quartos disponíveis.

**Critérios de Aceitação:**

* Given o recepcionista está na tela de cadastro de quarto, When preenche todos os campos obrigatórios e clica em salvar, Then o quarto é adicionado à lista com status "Livre".
* Given já existe um quarto com o mesmo número, When tenta cadastrar, Then o sistema exibe mensagem de erro.

### HU02 – Listar Quartos

Como recepcionista, eu quero visualizar todos os quartos em uma lista com número, tipo, preço e disponibilidade, para que eu tenha uma visão geral da ocupação do hotel.

**Critérios de Aceitação:**

* Given existem quartos cadastrados, When o recepcionista acessa a lista de quartos, Then todos os quartos são exibidos com suas informações.
* Given a lista está visível, When o recepcionista clica no ícone de lápis, Then o formulário de edição do quarto é aberto.

### HU03 – Editar Quarto

Como recepcionista, eu quero editar as informações de um quarto existente, para que eu possa corrigir dados ou atualizar preços e amenidades.

**Critérios de Aceitação:**

* Given o formulário de edição está aberto com os dados do quarto, When o recepcionista altera campos e salva, Then a lista reflete as alterações.

### HU04 – Cadastrar Hóspede

Como recepcionista, eu quero cadastrar um hóspede com nome, sobrenome, CPF e e-mail, para que eu possa associá-lo a uma reserva.

**Critérios de Aceitação:**

* Given o recepcionista está na tela de cadastro de hóspede, When preenche todos os campos e salva, Then o hóspede aparece na lista.
* Given o CPF informado é inválido, When tenta salvar, Then o sistema exibe erro de validação.

### HU05 – Listar Hóspedes

Como recepcionista, eu quero ver a lista de hóspedes com nome, sobrenome e CPF, para que eu possa localizar rapidamente um hóspede.

**Critérios de Aceitação:**

* Given existem hóspedes cadastrados, When o recepcionista acessa a lista, Then todos são exibidos com nome, sobrenome e CPF.

### HU06 – Listar Reservas

Como recepcionista, eu quero visualizar todas as reservas com número do quarto, tipo, nome do hóspede e disponibilidade (em chip colorido), para que eu acompanhe o status das reservas.

**Critérios de Aceitação:**

* Given existem reservas cadastradas, When o recepcionista acessa a gestão de reservas, Then a lista exibe todas as reservas com chips de disponibilidade.
* Given a lista está visível, When clica no ícone de lápis de uma reserva, Then o formulário de edição da reserva é aberto.

### HU07 – Editar Reserva

Como recepcionista, eu quero editar uma reserva existente (alterar hóspede ou status), para que eu mantenha os dados atualizados.

**Critérios de Aceitação:**

* Given o formulário de edição da reserva está aberto, When o recepcionista altera o status ou hóspede e salva, Then a lista de reservas é atualizada.

### HU08 – Alterar Disponibilidade do Quarto

Como recepcionista, eu quero alterar a disponibilidade de um quarto (Ocupado, Livre, Manutenção, Limpeza), para que a equipe saiba o status atual de cada quarto.

**Critérios de Aceitação:**

* Given o recepcionista está editando um quarto, When altera a disponibilidade e salva, Then o novo status é refletido na lista com o chip correspondente.

Aguardando suas próximas instruções para iniciar a implementação! 🏨

---

Output para: Casos de uso e Rastreabilidade inicial

---

# Casos de Uso – Sistema de Reserva de Hotel

## Ator Principal

**Recepcionista** – Único ator do sistema, responsável por operar todos os módulos.

## UC01 – Cadastrar Quarto

| Item | Descrição |
|------|-----------|
| Ator | Recepcionista |
| Pré-condições | Nenhuma |
| Fluxo Principal | 1. Acessa "Gestão de Quartos" → 2. Clica em "Novo Quarto" → 3. Preenche número, capacidade, tipo, preço, amenidades e camas → 4. Confirma cadastro |
| Pós-condições | Quarto registrado com status "Livre" |
| Fluxo Alternativo | 3a. Número duplicado → sistema exibe erro e impede cadastro |
| Requisitos | RF01, RF02, RF03, RF10 |
| História | HU01 |

## UC02 – Listar e Editar Quartos

| Item | Descrição |
|------|-----------|
| Ator | Recepcionista |
| Pré-condições | Ao menos 1 quarto cadastrado |
| Fluxo Principal | 1. Acessa lista de quartos → 2. Visualiza número, tipo, preço e disponibilidade → 3. Clica no ícone de lápis → 4. Edita dados → 5. Salva |
| Pós-condições | Dados do quarto atualizados |
| Fluxo Alternativo | 3a. Altera disponibilidade (Livre/Ocupado/Manutenção/Limpeza) |
| Requisitos | RF04, RF05, RF11 |
| História | HU02, HU03 |

## UC03 – Cadastrar Hóspede

| Item | Descrição |
|------|-----------|
| Ator | Recepcionista |
| Pré-condições | Nenhuma |
| Fluxo Principal | 1. Acessa "Gestão de Hóspedes" → 2. Clica em "Novo Hóspede" → 3. Preenche nome, sobrenome, CPF e e-mail → 4. Confirma |
| Pós-condições | Hóspede registrado no sistema |
| Fluxo Alternativo | 3a. CPF duplicado → erro. 3b. CPF inválido → erro |
| Requisitos | RF06, RF07, RF12 |
| História | HU04 |

## UC04 – Listar Hóspedes

| Item | Descrição |
|------|-----------|
| Ator | Recepcionista |
| Pré-condições | Ao menos 1 hóspede cadastrado |
| Fluxo Principal | 1. Acessa lista de hóspedes → 2. Visualiza nome, sobrenome e CPF |
| Pós-condições | Nenhuma (consulta) |
| Requisitos | RF08 |
| História | HU05 |

## UC05 – Criar Reserva

| Item | Descrição |
|------|-----------|
| Ator | Recepcionista |
| Pré-condições | Quarto com status "Livre" e hóspede cadastrado |
| Fluxo Principal | 1. Acessa "Gestão de Reservas" → 2. Seleciona quarto livre → 3. Vincula hóspede → 4. Confirma reserva |
| Pós-condições | Reserva criada; quarto muda para "Ocupado" |
| Fluxo Alternativo | 2a. Quarto não está livre → botão de reserva indisponível |
| Requisitos | RF09, RF13, RF14 |
| História | HU06 |

## UC06 – Editar/Encerrar Reserva

| Item | Descrição |
|------|-----------|
| Ator | Recepcionista |
| Pré-condições | Reserva existente |
| Fluxo Principal | 1. Na lista de reservas, clica no lápis → 2. Altera dados ou encerra reserva → 3. Salva |
| Pós-condições | Reserva atualizada; se encerrada, quarto volta a "Livre" |
| Requisitos | RF09, RF15 |
| História | HU07, HU08 |

## Matriz de Rastreabilidade

| Requisito | História | Caso de Uso |
|-----------|----------|-------------|
| RF01-RF03, RF10 | HU01 | UC01 |
| RF04-RF05, RF11 | HU02, HU03 | UC02 |
| RF06-RF07, RF12 | HU04 | UC03 |
| RF08 | HU05 | UC04 |
| RF09, RF13-RF14 | HU06 | UC05 |
| RF09, RF15 | HU07, HU08 | UC06 |

Aguardo suas próximas instruções para iniciar a implementação ou detalhar mais algum artefato.
