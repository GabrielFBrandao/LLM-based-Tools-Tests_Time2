“Liste requisitos funcionais (RF) e não funcionais (RNF) para este sistema.”

---
# Requisitos do Sistema de Reserva de Hotel

## Requisitos Funcionais (RF)

### Módulo de Gestão de Quartos
- **RF-001**: O sistema deve permitir o cadastro de quartos com os seguintes campos: número, capacidade, tipo, preço por diária e comodidades.
- **RF-002**: O sistema deve permitir a listagem de todos os quartos com suas informações básicas.
- **RF-003**: O sistema deve permitir a atualização das informações de um quarto existente.
- **RF-004**: O sistema deve permitir a exclusão lógica de quartos.
- **RF-005**: O sistema deve permitir a alteração do status do quarto (Disponível, Ocupado, Em Manutenção, Em Limpeza).
- **RF-006**: O sistema deve permitir o gerenciamento de camas por quarto, incluindo tipo e quantidade.

### Módulo de Gestão de Hóspedes
- **RF-007**: O sistema deve permitir o cadastro de hóspedes com nome, sobrenome, CPF e e-mail.
- **RF-008**: O sistema deve validar o formato do CPF e e-mail informados.
- **RF-009**: O sistema deve permitir a busca de hóspedes por nome, sobrenome ou CPF.
- **RF-010**: O sistema deve permitir a visualização do histórico de estadias de um hóspede.
- **RF-011**: O sistema deve permitir a atualização dos dados do hóspede.

### Módulo de Gestão de Reservas
- **RF-012**: O sistema deve permitir a realização de reservas informando quarto, hóspede, datas de check-in e check-out.
- **RF-013**: O sistema deve verificar a disponibilidade do quarto no período solicitado.
- **RF-014**: O sistema deve calcular automaticamente o valor total da reserva com base no preço da diária e número de noites.
- **RF-015**: O sistema deve permitir o check-in e check-out de hóspedes.
- **RF-016**: O sistema deve permitir o cancelamento de reservas.
- **RF-017**: O sistema deve enviar e-mail de confirmação ao realizar uma reserva.

### Relatórios
- **RF-018**: O sistema deve gerar relatório de ocupação por período.
- **RF-019**: O sistema deve gerar relatório de faturamento por período.
- **RF-020**: O sistema deve permitir a exportação dos relatórios em PDF e Excel.

## Requisitos Não-Funcionais (RNF)

### Usabilidade
- **RNF-001**: A interface do sistema deve ser intuitiva e de fácil utilização, com tempo de aprendizado não superior a 1 hora.
- **RNF-002**: O sistema deve estar disponível em português do Brasil.

### Desempenho
- **RNF-003**: O sistema deve ter tempo de resposta médio inferior a 2 segundos para a maioria das operações.
- **RNF-004**: O sistema deve suportar até 100 usuários concorrentes sem degradação significativa de desempenho.

### Segurança
- **RNF-005**: O sistema deve implementar autenticação de usuários.
- **RNF-006**: O sistema deve controlar o acesso baseado em perfis de usuário (administrador, recepcionista, gerente).
- **RNF-007**: Dados sensíveis como CPF devem ser armazenados de forma criptografada.
- **RNF-008**: O sistema deve manter logs de todas as operações críticas.

### Confiabilidade
- **RNF-009**: O sistema deve ter disponibilidade de 99,9% do tempo (exceto em manutenções programadas).
- **RNF-010**: O sistema deve realizar backup automático diário dos dados.

### Manutenibilidade
- **RNF-011**: O código-fonte deve seguir as melhores práticas de desenvolvimento e incluir documentação adequada.
- **RNF-012**: O sistema deve ser modular, permitindo manutenções e atualizações sem afetar outras funcionalidades.

### Compatibilidade
- **RNF-013**: O sistema deve ser compatível com os principais navegadores (Chrome, Firefox, Edge, Safari) nas últimas 3 versões estáveis.
- **RNF-014**: O sistema deve ser responsivo, funcionando adequadamente em dispositivos móveis e desktops.

### Escalabilidade
- **RNF-015**: A arquitetura do sistema deve permitir escalabilidade horizontal para atender a aumentos de carga.

### Conformidade
- **RNF-016**: O sistema deve estar em conformidade com a LGPD (Lei Geral de Proteção de Dados).
- **RNF-017**: O sistema deve gerar Nota Fiscal Eletrônica (NF-e) de acordo com a legislação vigente.

### Backup e Recuperação
- **RNF-018**: O sistema deve permitir a recuperação de dados em caso de falhas.
- **RNF-019**: Deve ser possível restaurar o sistema para um ponto específico no tempo.

### Documentação
- **RNF-020**: O sistema deve possuir documentação detalhada para usuários e administradores.
- **RNF-021**: A API deve ter documentação completa, incluindo exemplos de requisições e respostas.