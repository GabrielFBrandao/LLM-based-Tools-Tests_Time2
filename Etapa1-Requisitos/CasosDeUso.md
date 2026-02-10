“Defina os casos de uso principais com atores, pré-condições e pós-condições.”

---
# Casos de Uso do Sistema de Reserva de Hotel

## 1. Realizar Reserva
- **Atores**: Hóspede, Recepcionista
- **Pré-condições**:
  - Usuário autenticado (para hóspede)
  - Quarto disponível no período desejado
  - Dados do hóspede cadastrados no sistema
- **Fluxo Principal**:
  1. O sistema exibe o formulário de reserva
  2. Usuário seleciona datas de check-in e check-out
  3. Sistema lista quartos disponíveis
  4. Usuário seleciona um quarto
  5. Sistema calcula valor total
  6. Usuário confirma reserva
  7. Sistema registra a reserva
  8. Sistema envia e-mail de confirmação
- **Pós-condições**:
  - Reserva registrada no sistema
  - Quarto marcado como reservado no período
  - E-mail de confirmação enviado

## 2. Efetuar Check-in
- **Atores**: Recepcionista
- **Pré-condições**:
  - Reserva confirmada
  - Data de check-in atual
  - Quarto limpo e disponível
- **Fluxo Principal**:
  1. Sistema localiza reserva
  2. Recepcionista confirma documentos
  3. Sistema registra horário de entrada
  4. Sistema atualiza status do quarto para "Ocupado"
  5. Sistema emite chave/cartão de acesso
- **Pós-condições**:
  - Status da reserva alterado para "Em andamento"
  - Status do quarto atualizado
  - Registro de horário de entrada

## 3. Efetuar Check-out
- **Atores**: Recepcionista
- **Pré-condições**:
  - Hóspede com estadia em andamento
  - Data de check-out válida
- **Fluxo Principal**:
  1. Sistema localiza reserva ativa
  2. Sistema calcula valor total da estadia
  3. Recepcionista registra forma de pagamento
  4. Sistema emite recibo
  5. Sistema atualiza status do quarto para "Em limpeza"
- **Pós-condições**:
  - Reserva finalizada
  - Quarto disponível para limpeza
  - Recibo emitido
  - Histórico de hospedagem atualizado

## 4. Gerenciar Cadastro de Quartos
- **Atores**: Gerente, Recepcionista
- **Pré-condições**:
  - Usuário autenticado com permissão
  - Dados do quarto disponíveis
- **Fluxo Principal**:
  1. Usuário acessa cadastro de quartos
  2. Sistema exibe lista de quartos
  3. Usuário seleciona "Novo" ou um quarto existente
  4. Sistema exibe formulário
  5. Usuário preenche/atualiza informações
  6. Sistema valida dados
  7. Sistema salva alterações
- **Pós-condições**:
  - Quarto cadastrado/atualizado
  - Status atualizado no sistema

## 5. Gerenciar Cadastro de Hóspedes
- **Atores**: Recepcionista
- **Pré-condições**:
  - Usuário autenticado
  - Dados do hóspede disponíveis
- **Fluxo Principal**:
  1. Usuário acessa cadastro de hóspedes
  2. Sistema exibe lista de hóspedes
  3. Usuário seleciona "Novo" ou um hóspede existente
  4. Sistema exibe formulário
  5. Usuário preenche/atualiza informações
  6. Sistema valida CPF e e-mail
  7. Sistema salva alterações
- **Pós-condições**:
  - Cadastro do hóspede atualizado
  - Histórico de alterações registrado

## 6. Gerar Relatório de Ocupação
- **Atores**: Gerente
- **Pré-condições**:
  - Usuário autenticado como gerente
  - Período de análise definido
- **Fluxo Principal**:
  1. Usuário acessa módulo de relatórios
  2. Seleciona "Relatório de Ocupação"
  3. Define período de análise
  4. Sistema processa dados
  5. Sistema exibe relatório
  6. Usuário pode exportar relatório
- **Pós-condições**:
  - Relatório gerado
  - Dados disponíveis para exportação

## 7. Gerenciar Manutenção de Quartos
- **Atores**: Gerente, Recepcionista
- **Pré-condições**:
  - Quarto não pode ter reservas ativas
  - Usuário com permissão
- **Fluxo Principal**:
  1. Usuário seleciona quarto
  2. Altera status para "Em manutenção"
  3. Registra motivo e previsão
  4. Sistema atualiza status
  5. Notifica equipe responsável
- **Pós-condições**:
  - Quarto indisponível para reservas
  - Status atualizado
  - Registro de manutenção criado

## 8. Cancelar Reserva
- **Atores**: Hóspede, Recepcionista
- **Pré-condições**:
  - Reserva existente
  - Check-in não realizado
- **Fluxo Principal**:
  1. Usuário localiza reserva
  2. Solicita cancelamento
  3. Sistema verifica política de cancelamento
  4. Sistema calcula multa (se aplicável)
  5. Confirma cancelamento
  6. Atualiza status
  7. Envia confirmação
- **Pós-condições**:
  - Reserva cancelada
  - Quarto liberado
  - E-mail de confirmação enviado

## 9. Realizar Pagamento
- **Atores**: Recepcionista
- **Pré-condições**:
  - Reserva ativa ou finalizada
  - Valor a pagar definido
- **Fluxo Principal**:
  1. Sistema exibe valor a pagar
  2. Recepcionista seleciona forma de pagamento
  3. Sistema processa pagamento
  4. Emite comprovante
  5. Atualiza status financeiro
- **Pós-condições**:
  - Pagamento registrado
  - Status da conta atualizado
  - Comprovante disponível

## 10. Gerenciar Perfil de Usuário
- **Atores**: Todos os usuários autenticados
- **Pré-condições**:
  - Usuário autenticado
  - Dados válidos para atualização
- **Fluxo Principal**:
  1. Usuário acessa perfil
  2. Seleciona edição
  3. Atualiza informações
  4. Sistema valida dados
  5. Confirma alterações
- **Pós-condições**:
  - Dados atualizados
  - Histórico de alterações registrado
  - Sessão atualizada (se necessário)

Estes casos de uso cobrem os fluxos principais do sistema, com seus respectivos atores, pré-condições e pós-condições, fornecendo uma visão abrangente das funcionalidades do sistema de reserva de hote# Casos de Uso do Sistema de Reserva de Hotel

