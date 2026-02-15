# 7.1 - Plano de Projeto (Sprints e Estimativas)

## Prompt Enviado
> Agora, para a etapa de Gerenciamento do nosso projeto do Sistema de Reserva de Hotel (Stack: TypeScript/Node.js/React), no plano de projeto:
> * Proponha um cronograma baseado em sprints.
> * Estime esforço em story points ou horas.

---

## Análise da Resposta e Estrutura do Plano

A ferramenta atuou como um *Agile Master*, gerando um planejamento completo distribuído em 4 visões (disponíveis nos arquivos CSV na pasta `planilhas/`). A inteligência do plano se baseou em mapear os artefatos já gerados nas etapas anteriores do projeto como "Sprints Concluídas" (S1 a S9), calibrando a velocidade futura do time com base em dados reais.

### 📊 Estrutura da Planilha Gerada

#### Aba 1 — Visão Geral (16 Sprints)
Uma linha por sprint, de S0 a S15. O projeto completo soma 626 SP / 626h, com velocidade média histórica de ~40 SP/sprint medida nas 9 sprints já concluídas. 
* **Critérios Objetivos (DoD):** Cada linha tem entregas concretas e um critério de *Definition of Done* (DoD). Por exemplo, a S6 (Deploy) não diz "criar pipeline", diz *"docker compose up sobe em < 60s; pipeline < 8 min; rollback automático em falha"*.
* **Estimativa:** A métrica de 1 SP = 1 hora foi usada deliberadamente para um time pequeno, funcionando como referência de complexidade relativa.

#### Aba 2 — Backlog Detalhado (98 Histórias)
Cada história possui: ID rastreável (ex: QS-01, TI-03, E2E-02), categoria, SP, horas, status, Requisito Funcional (RF) ou Regra de Negócio (RN) de origem, critério de aceite objetivo e nota técnica.
* **Calibração de SP:** Baseada na sequência de *Fibonacci* (3, 5, 8, 13). Exemplo: `QS-01` (cadastrarQuarto com 4 validações + repositório) = 8 SP, enquanto `DOM-02` (entidade Cama simples) = 3 SP.

#### Aba 3 — Rastreabilidade RF ↔ Sprint
Mapeamento de 27 requisitos funcionais (RF01–RF27), cruzando a sprint de implementação, as Story IDs associadas e qual arquivo de teste cobre aquele comportamento. Os testes referenciados (ex: `cadastrarQuarto.test.ts`) são os arquivos reais produzidos nas etapas anteriores.

#### Aba 4 — Burndown SP
Tabela *Sprint a Sprint* com SP acumulado, SP restante (Linha Ideal) e SP restante (Real). As 9 sprints iniciais provam que a linha real acompanhou a ideal dentro de uma margem de erro de 5%, validando as projeções para as Sprints 10 a 15.

---

### Decisões de Estimativa (Justificativa da IA)

Três princípios guiaram os números, todos ancorados no histórico do próprio projeto:

1. **Calibração pelo Real:** A S3 (Testes Unitários) tomou 38 SP porque os 62 testes escritos exigiram documentação AAA, fixtures centralizadas e mocks completos. A S6 (Deploy) tomou 52 SP porque incluiu Dockerfiles, Nginx, CI/CD e scripts de rollback. O esforço foi medido pelo código efetivamente gerado.
2. **A Incerteza Cresce com o Futuro:** S10–S11 (API REST + Banco) receberam SPs mais altos por envolverem decisões em aberto (estratégia de auth JWT, modelagem Prisma). Já as S14–S15 têm SPs menores porque a maior parte do risco técnico já foi absorvida nas sprints iniciais.
3. **Velocidade Medida, não Assumida:** A média de 40 SP/sprint (S1–S9) foi o único insumo usado para projetar o futuro (S10–S15). Não foi utilizado *Planning Poker* abstrato, mas sim o *Lead Time* real das entregas já feitas no repositório.