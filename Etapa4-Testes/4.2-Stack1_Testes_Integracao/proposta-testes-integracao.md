# Proposta de Testes de Integração
**Fluxo:** Cadastro de Hóspede → Criação de Reserva → Atualização de Disponibilidade

**Stack:** TypeScript 5 + Node.js + React
**Framework:** Jest 29 + ts-jest
**Escopo:** Integração de serviços (sem banco real)
**Total de cenários:** 21 testes distribuídos em 4 suítes
**Validados:** 87 asserções — 87/87 passando

---

## 1. Contexto e Motivação

O sistema já conta com testes unitários cobrindo `QuartoService.cadastrarQuarto()` e `QuartoService.editarQuarto()` de forma isolada — cada regra de negócio verificada com mocks que substituem o repositório.
Testes unitários são rápidos e precisos, mas não respondem a uma pergunta fundamental:

> *"Os serviços de Hóspede, Reserva e Quarto funcionam corretamente quando operam juntos, compartilhando o mesmo estado persistido?"*

É exatamente essa pergunta que os testes de integração respondem. Enquanto testes unitários isolam uma classe por vez, testes de integração exercitam a colaboração real entre múltiplos serviços usando implementações concretas — sem mocks.

| Testes Unitários (existentes) | Testes de Integração (proposta) |
| :--- | :--- |
| Testam uma classe por vez | Testam múltiplos serviços juntos |
| Usam mocks para isolar | Usam implementações reais |
| Rápidos e determinísticos | Validam estado compartilhado |
| Detectam bugs internos | Detectam problemas de contrato |
| Não validam colaboração | Cobrem fluxos de negócio completos |

---

## 2. Arquitetura dos Testes

### 2.1 Estrutura de Arquivos
| Arquivo | Responsabilidade |
| :--- | :--- |
| `domain.integration.ts` | Entidades Hospede e Reserva com regras de negócio |
| `repository.integration.ts` | Interfaces e implementações em memória dos repositórios |
| `service.integration.ts` | HospedeService e ReservaService (regras de negócio) |
| `fixtures.integration.ts` | Contexto integrado, builders e DTOs de teste |
| `fluxo-reserva.integration.test.ts` | 21 testes em 4 suítes temáticas |

### 2.2 Padrão criarContexto()
Cada teste recebe um contexto completamente novo — repositórios e serviços instanciados do zero, com ou sem dados iniciais. Isso garante isolamento total: nenhum estado vaza entre testes.

> **DECISÃO DE DESIGN:** Testes de integração NÃO usam mocks. Os repositórios em memória são implementações reais do contrato `IQuartoRepository`, `IHospedeRepository` e `IReservaRepository` — o mesmo contrato que em produção seria implementado pelo Prisma.

### 2.3 Entidades e Contratos do Domínio
| Entidade | Status | Regras encapsuladas |
| :--- | :--- | :--- |
| **Quarto** | Existente | RN01 número único, RN03 preço, RN05 camas, RF15/RF17 status |
| **Hospede** | Novo | RF09 CPF único, RF10 CPF 11 dígitos, RF11 email válido |
| **Reserva** | Novo | RF18 quarto LIVRE, soft delete, duplo cancelamento bloqueado |

---

## 3. Mapa Completo de Cobertura

Os 21 cenários de teste estão organizados em 4 suítes, cada uma com um foco distinto:

### Suite 1 — Fluxo Principal Completo (5 testes)
| ID | Cenário | Asserção principal |
| :--- | :--- | :--- |
| **INT-FP01** | Fluxo ponta a ponta com sucesso | Todos os 3 passos retornam sucesso=true |
| **INT-FP02** | Estado final correto de cada entidade | Quarto=OCUPADO, reserva=ATIVA, hóspede inalterado |
| **INT-FP03** | IDs na reserva apontam para entidades reais | quartoId e hospedeId resolvem objetos no repo |
| **INT-FP04** | Quarto muda LIVRE → OCUPADO após reserva | Status refletido no repositório compartilhado |
| **INT-FP05** | Quarto volta LIVRE após cancelamento | estaDisponivel=true após cancelar reserva |

### Suite 2 — Consistência Entre Serviços (5 testes)
| ID | Cenário | Asserção principal |
| :--- | :--- | :--- |
| **INT-CS01** | Quarto OCUPADO rejeita nova reserva | reservaRepo.count()=0 após rejeição |
| **INT-CS02** | CPF duplicado rejeitado entre cadastros | hospedeRepo ainda tem apenas 1 hóspede |
| **INT-CS03** | Referências cruzadas consistentes no repo | quartoId e hospedeId resolvem entidades corretas |
| **INT-CS04** | Múltiplas reservas para quartos distintos | Ambos os quartos ficam OCUPADO, IDs únicos |
| **INT-CS05** | Cancelar reserva A não afeta reserva B | Quarto A=LIVRE, quarto B=OCUPADO após cancelamento |

### Suite 3 — Integridade em Falhas Parciais (4 testes)
| ID | Cenário | Asserção principal |
| :--- | :--- | :--- |
| **INT-FH01** | Falha no hóspede não altera quartos | Status e contagem de quartos inalterados |
| **INT-FH02** | Race condition: 2ª reserva no mesmo quarto | reservaRepo.count()=1 (só a 1ª persiste) |
| **INT-FH03** | Hóspede inexistente: quarto permanece LIVRE | NÃO muda status antes de validar hóspede |
| **INT-FH04** | Duplo cancelamento rejeitado sem side effects | Quarto não volta a OCUPADO no 2º cancelamento |

### Suite 4 — Cenários de Negócio Avançados (7 testes)
| ID | Cenário | Asserção principal |
| :--- | :--- | :--- |
| **INT-CN01** | Mesmo hóspede reserva quartos distintos | Histórico do hóspede tem 2 reservas ativas |
| **INT-CN02** | Ciclo completo LIVRE→OCUPADO→LIVRE→OCUPADO | Histórico preserva reservas ativa e cancelada |
| **INT-CN03** | Quarto em MANUTENÇÃO não aceita reserva | Mensagem inclui número do quarto e status atual |
| **INT-CN04** | Quarto em LIMPEZA não aceita reserva | reservaRepo.count()=0 após tentativa rejeitada |
| **INT-CN05** | Histórico completo de um hóspede (3 reservas) | 2 ativas + 1 cancelada, todas no histórico |
| **INT-CN06** | Cancelamento preserva dados originais | ID, quartoId, hospedeId, criadaEm, motivo intactos |
| **INT-CN07** | Fluxo completo via DTOs (zero pré-dados) | Simula entrada real via API REST do início ao fim |

---

## 4. Decisões Técnicas

### 4.1 Por que implementações reais em vez de mocks?
Testes unitários usam mocks para isolar um módulo — o que é a escolha certa para aquele nível. Mas mocks, por definição, não testam se dois módulos se entendem. Considere este cenário:

> **Bug clássico de integração:** `QuartoService.criarReserva()` chama `quartoRepo.atualizar()` com o quarto correto — mas o `QuartoRepositoryMemoria.atualizar()` lança erro porque o ID não estava no Map. O teste unitário (com mock) nunca veria esse bug. O teste de integração vê.

Usar repositórios em memória reais garante que:
* O estado escrito por um serviço é lido corretamente por outro.
* Erros de contrato entre interface e implementação são detectados.
* O fluxo de chamadas sequenciais (criar reserva → atualizar quarto) é validado de ponta a ponta.

### 4.2 Isolamento com criarContexto()
Cada teste cria seu próprio contexto com repositórios e serviços frescos. Isso evita o problema de "test pollution" — onde um teste que modifica estado global afeta os resultados dos testes seguintes.

| ❌ Anti-padrão: estado compartilhado | ✅ Padrão adotado: fresh fixture |
| :--- | :--- |
| `beforeAll()` inicializa repositório | Cada teste chama `criarContexto()` |
| Testes executam em sequência | Zero estado compartilhado |
| Falha em teste T1 pode quebrar T2 | Testes são completamente independentes |
| Flaky tests difíceis de diagnosticar | Falha sempre tem causa local |

### 4.3 Verificação de estado, não apenas de retorno
Um erro comum em testes de integração é verificar apenas o valor retornado pela operação, sem checar o estado final nos repositórios. Esta proposta vai além:

| Teste | Verifica o retorno | Verifica o estado no repositório |
| :--- | :--- | :--- |
| **INT-FP04** | `criarReserva()` retorna sucesso=true | `quartoRepo.buscarPorId(id)?.status === OCUPADO` |
| **INT-FH03** | `criarReserva()` retorna sucesso=false | `quartoRepo.buscarPorId(id)?.status === LIVRE` (não mudou) |
| **INT-FH02** | 2ª reserva retorna sucesso=false | `reservaRepo.count() === 1` (só a 1ª persiste) |

---

## 5. Suite 3 em Detalhe: Integridade em Falhas

Esta suíte merece atenção especial por cobrir um problema que testes unitários são incapazes de detectar: garantir que uma falha em qualquer etapa do fluxo não deixa o sistema em estado inconsistente.

### 5.1 INT-FH02 — Race Condition Básico
Simula dois usuários tentando reservar o mesmo quarto quase simultaneamente. O sistema deve garantir que apenas a primeira reserva seja aceita:
* **Passo 1:** Hóspede A cria reserva para quarto 101 → sucesso, quarto fica OCUPADO
* **Passo 2:** Hóspede B tenta reservar quarto 101 → rejeitado com erro RF18
* **Assert 1:** `reservaRepo.count() === 1` (só a primeira persiste)
* **Assert 2:** Quarto permanece OCUPADO pela primeira reserva

### 5.2 INT-FH03 — Ordem das Validações
Este teste detectaria um bug crítico de implementação: se o serviço mudasse o status do quarto ANTES de validar a existência do hóspede, o sistema ficaria em estado inválido (quarto OCUPADO sem reserva correspondente):
> **Ordem correta validada pelo teste:** (1) Busca o quarto → (2) Verifica disponibilidade → (3) Busca o hóspede → (4) Persiste a reserva → (5) Atualiza o status do quarto. A falha no passo 3 deve retornar erro SEM executar os passos 4 e 5.

### 5.3 INT-FH04 — Idempotência do Cancelamento
Garante que o duplo cancelamento não produz efeitos colaterais — especialmente que o quarto não muda de status novamente após já ter voltado para LIVRE:
* **Passo 1:** Reserva criada → quarto fica OCUPADO
* **Passo 2:** Primeiro cancelamento → quarto volta para LIVRE
* **Passo 3:** Segundo cancelamento → rejeitado com "já está cancelada"
* **Assert:** Quarto permanece LIVRE (o segundo cancelamento não o alterou novamente)

---

## 6. Rastreabilidade: Regras de Negócio ↔ Testes

| Regra | Descrição | Testes que cobrem |
| :--- | :--- | :--- |
| **RF09** | CPF único no sistema | INT-CS02 |
| **RF10** | CPF com exatamente 11 dígitos numéricos | INT-CN07 (via DTO) |
| **RF11** | Email com formato válido | INT-CN07 (via DTO) |
| **RF15** | Quarto muda para OCUPADO ao criar reserva | INT-FP04, INT-CS04, INT-CN01 |
| **RF16** | Cancelamento exige motivo obrigatório | INT-CN06 |
| **RF17** | Quarto volta para LIVRE ao cancelar reserva | INT-FP05, INT-CS05, INT-CN02 |
| **RF18** | Quarto deve estar LIVRE para ser reservado | INT-CS01, INT-CN03, INT-CN04, INT-FH02 |
| **RN27** | Reservas canceladas mantidas (soft delete) | INT-CN02, INT-CN05, INT-CN06 |
| **—** | Duplo cancelamento bloqueado | INT-FH04 |
| **—** | Status do quarto não muda em falha parcial | INT-FH03 |

---

## 7. Como Executar

| Comando | Descrição |
| :--- | :--- |
| `npm test` | Todos os testes (unitários + integração) |
| `npm test -- --testPathPattern=integration` | Apenas testes de integração |
| `npm run test:coverage` | Todos com relatório de cobertura (meta: ≥90%) |
| `npm run test:verbose` | Saída detalhada com nome de cada teste |

> **Pré-requisito:** `npm install (jest, ts-jest, @types/jest, typescript)`. Rede necessária apenas na instalação inicial — os testes de integração não dependem de banco de dados, servidores externos ou rede.