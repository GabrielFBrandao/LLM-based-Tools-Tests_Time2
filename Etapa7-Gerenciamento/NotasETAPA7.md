# Etapa 7 - Gerenciamento (Agile & Qualidade)

## 7.1. Plano de Projeto (Sprints e Estimativas)

### O que foi solicitado?
Criação de um cronograma baseado em Sprints e estimativa de esforço em Story Points (SP) ou horas para o Sistema de Hotel.

### Resultados da Geração
A ferramenta atendeu ao pedido gerando um backlog altamente estruturado em formato CSV/Planilha, dividido em 4 visões: Visão Geral, Backlog Detalhado, Matriz de Rastreabilidade e Gráfico de Burndown.

**Destaques Gerenciais:**
1. **Retroalimentação de Contexto:** A IA utilizou os códigos, testes e infraestrutura gerados nas Etapas 1 a 6 como evidência empírica para calcular o "esforço já gasto", calibrando a pontuação (Story Points) das sprints futuras.
2. **Métricas Ágeis Aplicadas:** Uso correto da escala de Fibonacci (3, 5, 8, 13) para estimativa de complexidade e estruturação de *Definition of Done (DoD)* orientados a métricas (ex: "*Pipeline roda em < 8 min*").
3. **Rastreabilidade (Requirements Traceability Matrix - RTM):** A ferramenta conectou com sucesso os RFs (Requisitos Funcionais) da Etapa 1 com os arquivos de teste da Etapa 4, provando que o escopo foi não apenas implementado, mas verificado.

### Conclusão Parcial
A IA demonstrou uma forte capacidade de atuar como *Agile Master*. Ela não gera apenas cronogramas ilusórios, mas cria artefatos de planejamento aderentes à realidade técnica do código já escrito.

## 7.2. Gestão de Riscos (Técnicos e Gerenciais)

### O que foi solicitado?
Listagem de riscos técnicos e gerenciais do projeto com planos de mitigação e contingência.

### Resultados da Geração
O Claude apresentou uma maturidade excepcional de Tech Lead. Ele não inventou riscos genéricos; ele **analisou o código fonte gerado nas etapas 1 a 6** e extraiu dívidas técnicas e decisões arquiteturais temporárias, mapeando-as como riscos formais de projeto.

**Destaques Gerenciais:**
1. **Riscos Baseados em Código (Fact-based):** Identificou que os testes em memória (S0 a S9) são um risco crítico de perda de dados se o sistema reiniciar, traçando o plano de substituí-los por Prisma na Sprint 11.
2. **Mitigação vs Contingência:** Diferenciou claramente "o que fazer para evitar" (Mitigação) de "o que fazer se a bomba estourar" (Contingência), sugerindo scripts do *Runbook* da Etapa 5 como contingência ativa.
3. **Riscos Ágeis:** O reconhecimento do "Bus Factor 1" (projeto dependente de uma única pessoa) e do "Scope Creep" reflete as preocupações reais do dia a dia de metodologias ágeis de desenvolvimento.

## 7.3. Governança e Qualidade (KPIs e DoD)

### O que foi solicitado?
Definição de KPIs e critérios de qualidade (Definition of Done) para o projeto.

### Resultados da Geração
A ferramenta estabeleceu 21 KPIs divididos em métricas de Confiabilidade (SLO), Performance, Qualidade de Código, Processo e Negócio, além de um Definition of Done completo de 3 níveis.

### Conclusão Geral da Etapa 7 (Gerenciamento) e do Experimento
A Etapa 7 comprovou que a IA pode atuar em alto nível de gestão técnica. Ela não perdeu o contexto gerado nas Etapas 1 a 6. Pelo contrário, ela utilizou os códigos TypeScript, os alertas YAML e os scripts Bash que ela mesma gerou como métricas concretas e executáveis para embasar um cronograma (Sprints), um levantamento de Riscos e um painel de Qualidade e Governança.

O experimento como um todo demonstra que **o Claude 3.5 Sonnet possui memória contextual avançada, aderência estrita às boas práticas de Engenharia de Software e capacidade de raciocínio crítico ponta a ponta (Requisitos → Deploy → Gerenciamento).**