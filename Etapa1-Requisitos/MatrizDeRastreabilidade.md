“Vincule requisitos às histórias de usuário correspondentes.”

---
# Vinculação de Requisitos às Histórias de Usuário

## Módulo de Gestão de Quartos

### RF-001: Cadastro de quartos
- **HU-003**: Como recepcionista, eu quero cadastrar um novo quarto no sistema
- **HU-004**: Como recepcionista, eu quero atualizar o status de um quarto

### RF-002: Listagem de quartos
- **HU-001**: Como hóspede, eu quero visualizar a lista de quartos disponíveis
- **HU-002**: Como hóspede, eu quero ver os detalhes completos de um quarto

### RF-003: Atualização de quartos
- **HU-003**: Como recepcionista, eu quero cadastrar um novo quarto no sistema
- **HU-004**: Como recepcionista, eu quero atualizar o status de um quarto

### RF-004: Exclusão lógica de quartos
- **HU-003**: Como recepcionista, eu quero cadastrar um novo quarto no sistema
- **HU-004**: Como recepcionista, eu quero atualizar o status de um quarto

### RF-005: Alteração de status do quarto
- **HU-004**: Como recepcionista, eu quero atualizar o status de um quarto
- **HU-021**: Como recepcionista, eu quero prorrogar uma estadia

### RF-006: Gerenciamento de camas
- **HU-005**: Como recepcionista, eu quero adicionar/remover camas de um quarto

## Módulo de Gestão de Hóspedes

### RF-007: Cadastro de hóspedes
- **HU-008**: Como hóspede, eu quero me cadastrar no sistema
- **HU-010**: Como recepcionista, eu quero cadastrar um novo hóspede

### RF-008: Validação de CPF e e-mail
- **HU-008**: Como hóspede, eu quero me cadastrar no sistema
- **HU-010**: Como recepcionista, eu quero cadastrar um novo hóspede

### RF-009: Busca de hóspedes
- **HU-011**: Como recepcionista, eu quero buscar um hóspede por nome ou CPF

### RF-010: Histórico de estadias
- **HU-012**: Como recepcionista, eu quero visualizar o histórico de estadias de um hóspede

### RF-011: Atualização de dados do hóspede
- **HU-009**: Como hóspede, eu quero atualizar meus dados cadastrais

## Módulo de Gestão de Reservas

### RF-012: Realização de reservas
- **HU-014**: Como hóspede, eu quero verificar a disponibilidade de quartos
- **HU-015**: Como hóspede, eu quero realizar uma reserva online
- **HU-018**: Como recepcionista, eu quero registrar o check-in de um hóspede

### RF-013: Verificação de disponibilidade
- **HU-014**: Como hóspede, eu quero verificar a disponibilidade de quartos
- **HU-021**: Como recepcionista, eu quero prorrogar uma estadia

### RF-014: Cálculo do valor total
- **HU-015**: Como hóspede, eu quero realizar uma reserva online
- **HU-019**: Como recepcionista, eu quero registrar o check-out de um hóspede

### RF-015: Check-in e check-out
- **HU-018**: Como recepcionista, eu quero registrar o check-in de um hóspede
- **HU-019**: Como recepcionista, eu quero registrar o check-out de um hóspede

### RF-016: Cancelamento de reservas
- **HU-017**: Como hóspede, eu quero cancelar uma reserva

### RF-017: E-mail de confirmação
- **HU-016**: Como hóspede, eu quero receber um e-mail de confirmação da minha reserva

## Módulo de Relatórios

### RF-018: Relatório de ocupação
- **HU-022**: Como gerente, eu quero visualizar a taxa de ocupação do hotel
- **HU-020**: Como recepcionista, eu quero visualizar todas as reservas do dia

### RF-019: Relatório de faturamento
- **HU-023**: Como gerente, eu quero gerar relatórios de faturamento

### RF-020: Exportação de relatórios
- **HU-024**: Como gerente, eu quero exportar relatórios em formato Excel

## Módulo de Autenticação

### RNF-005: Autenticação de usuários
- **HU-027**: Como usuário, eu quero fazer login no sistema
- **HU-028**: Como usuário, eu quero redefinir minha senha

### RNF-006: Controle de acesso por perfis
- **HU-029**: Como administrador, eu quero gerenciar os perfis de acesso dos usuários

### RNF-007: Criptografia de dados sensíveis
- **HU-008**: Como hóspede, eu quero me cadastrar no sistema
- **HU-010**: Como recepcionista, eu quero cadastrar um novo hóspede

## Requisitos Não-Funcionais

### RNF-001: Interface intuitiva
- Aplicável a todas as histórias de usuário de interface

### RNF-002: Suporte a português
- Aplicável a todo o sistema

### RNF-003: Tempo de resposta < 2s
- Aplicável a todas as operações do sistema

### RNF-004: Suporte a 100 usuários concorrentes
- Aplicável a todas as operações do sistema

### RNF-008: Logs de operações
- **HU-030**: Como administrador, eu quero visualizar logs de acesso ao sistema

### RNF-009: Disponibilidade 99,9%
- Aplicável a todo o sistema

### RNF-010: Backup automático
- Aplicável à persistência de dados do sistema

Esta matriz de rastreabilidade mostra como cada requisito funcional e não-funcional se relaciona com as histórias de usuário correspondentes, garantindo que todos os requisitos estejam cobertos pelo desenvolvimento.

