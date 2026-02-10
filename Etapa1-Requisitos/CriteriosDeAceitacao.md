“Inclua critérios de aceitação no formato padrão (Given-When-Then).”


Vou adicionar critérios de aceitação detalhados para cada história de usuário, seguindo o formato Gherkin (Given-When-Then). Vou começar com as histórias de maior prioridade:

## Módulo de Gestão de Quartos

### HU-001: Visualizar lista de quartos disponíveis
**Critérios de Aceitação:**
```
Cenário: Visualizar lista de quartos disponíveis
  Dado que estou na página inicial do sistema
  Quando eu acessar a seção de quartos
  Então devo ver uma lista de todos os quartos disponíveis
  E cada item deve exibir número, tipo e preço por noite
  E devo ver o status de disponibilidade de cada quarto
```

### HU-002: Visualizar detalhes de um quarto
**Critérios de Aceitação:**
```
Cenário: Visualizar detalhes do quarto
  Dado que estou visualizando a lista de quartos
  Quando eu clicar em um quarto específico
  Então devo ver uma página com:
    - Fotos do quarto
    - Descrição completa
    - Lista de comodidades
    - Preço por noite
    - Status de disponibilidade
    - Capacidade máxima
```

### HU-003: Cadastrar novo quarto (Recepção)
**Critérios de Aceitação:**
```
Cenário: Cadastrar quarto com sucesso
  Dado que estou autenticado como recepcionista
  E estou na tela de cadastro de quartos
  Quando eu preencher todos os campos obrigatórios:
    - Número do quarto: 101
    - Tipo: Luxo
    - Capacidade: 2
    - Preço por noite: R$ 350,00
  E clicar em "Salvar"
  Então o sistema deve exibir mensagem de sucesso
  E o quarto deve estar disponível para reserva

Cenário: Tentar cadastrar quarto com número já existente
  Dado que já existe um quarto com número 101
  Quando eu tentar cadastrar outro quarto com o mesmo número
  Então o sistema deve exibir mensagem de erro
  E não deve salvar o cadastro
```

### HU-004: Atualizar status do quarto
**Critérios de Aceitação:**
```
Cenário: Atualizar status para "Em manutenção"
  Dado que estou visualizando os detalhes do quarto 101
  Quando eu selecionar "Em manutenção" no campo status
  E clicar em "Salvar alterações"
  Então o sistema deve exibir mensagem de sucesso
  E o status do quarto deve ser atualizado
  E o quarto não deve aparecer como disponível para reservas
```

## Módulo de Gestão de Hóspedes

### HU-008: Cadastro de hóspede
**Critérios de Aceitação:**
```
Cenário: Cadastrar novo hóspede com sucesso
  Dado que estou na tela de cadastro de hóspedes
  Quando eu preencher:
    - Nome: João
    - Sobrenome: Silva
    - CPF: 123.456.789-00
    - E-mail: joao@email.com
  E clicar em "Salvar"
  Então o sistema deve exibir mensagem de sucesso
  E o hóspede deve estar disponível para reservas

Cenário: Tentar cadastrar com CPF inválido
  Dado que estou na tela de cadastro de hóspedes
  Quando eu preencher o campo CPF com "123"
  E tentar salvar
  Então o sistema deve exibir mensagem de CPF inválido
  E não deve permitir o cadastro
```

### HU-010: Cadastrar hóspede (Recepção)
**Critérios de Aceitação:**
```
Cenário: Cadastrar hóspede na recepção
  Dado que estou autenticado como recepcionista
  E estou na tela de check-in
  Quando eu selecionar "Novo hóspede"
  E preencher os dados obrigatórios
  E finalizar o cadastro
  Então o sistema deve criar o cadastro
  E vincular automaticamente à reserva atual
  E exibir mensagem de confirmação
```

## Módulo de Gestão de Reservas

### HU-012: Realizar reserva
**Critérios de Aceitação:**
```
Cenário: Reserva com sucesso
  Dado que estou na tela de nova reserva
  Quando eu selecionar:
    - Hóspede: João Silva
    - Quarto: 101 (Luxo)
    - Check-in: 10/03/2025
    - Check-out: 15/03/2025
    - Número de hóspedes: 2
  E confirmar a reserva
  Então o sistema deve exibir o resumo da reserva
  E o status deve ser "Confirmada"
  E o quarto deve aparecer como ocupado nas datas selecionadas

Cenário: Tentar reservar quarto já reservado
  Dado que o quarto 101 já está reservado para 10/03/2025 a 15/03/2025
  Quando eu tentar fazer uma reserva para o mesmo período
  Então o sistema deve exibir mensagem de indisponibilidade
  E sugerir datas alternativas
```

### HU-015: Check-in
**Critérios de Aceitação:**
```
Cenário: Realizar check-in
  Dado que existe uma reserva confirmada para o quarto 101
  E estou na tela de check-in
  Quando eu localizar a reserva
  E confirmar os dados do hóspede
  E registrar o número do documento de identificação
  E clicar em "Confirmar Check-in"
  Então o sistema deve registrar o horário do check-in
  E o status da reserva deve mudar para "Em andamento"
  E o status do quarto deve mudar para "Ocupado"
```

### HU-016: Check-out
**Critérios de Aceitação:**
```
Cenário: Realizar check-out
  Dado que o hóspede do quarto 101 está fazendo check-out
  E estou na tela de check-out
  Quando eu localizar a reserva ativa
  E registrar o horário de saída
  E confirmar o pagamento
  E clicar em "Finalizar Estadia"
  Então o sistema deve:
    - Calcular o valor total da estadia
    - Gerar a conta para pagamento
    - Atualizar o status da reserva para "Concluída"
    - Mudar o status do quarto para "Em limpeza"
    - Emitir o recibo
```

## Módulo de Relatórios

### HU-022: Relatório de ocupação
**Critérios de Aceitação:**
```
Cenário: Gerar relatório de ocupação
  Dado que estou autenticado como gerente
  E estou na tela de relatórios
  Quando eu selecionar "Relatório de Ocupação"
  E definir o período: 01/03/2025 a 31/03/2025
  E clicar em "Gerar Relatório"
  Então o sistema deve exibir:
    - Taxa de ocupação por dia
    - Média de ocupação no período
    - Quartos mais ocupados
    - Períodos de maior e menor ocupação
  E devo ter a opção de exportar para Excel
```

## Módulo de Autenticação

### HU-027: Login no sistema
**Critérios de Aceitação:**
```
Cenário: Login bem-sucedido
  Dado que estou na tela de login
  Quando eu informar credenciais válidas
    - E-mail: recepcao@hotel.com
    - Senha: ********
  E clicar em "Entrar"
  Então devo ser redirecionado para o dashboard
  E ver meu nome e cargo no cabeçalho

Cenário: Tentativa de login com credenciais inválidas
  Dado que estou na tela de login
  Quando eu informar credenciais inválidas
  E clicar em "Entrar"
  Então o sistema deve exibir mensagem de erro
  E não deve permitir o acesso
```

Estes critérios de aceitação seguem o padrão Gherkin (Given-When-Then) e podem ser utilizados como base para a criação de testes automatizados. Cada cenário descreve um fluxo específico com pré-condições, ações e resultados esperados.

