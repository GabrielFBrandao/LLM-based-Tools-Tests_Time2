# Governança e Qualidade

## KPIs (indicadores)
- Velocidade do time por sprint (story points concluídos)
- Lead time de mudança (commit → produção)
- Taxa de sucesso de deploys (sem rollback)
- Cobertura de testes (unit/integration) mínima: 70% linhas, 80% branches para módulos críticos
- Taxa de defeitos pós-release (bugs por sprint)
- Disponibilidade do serviço (SLO): ≥ 99.9% em produção
- Desempenho: P95 < 500ms nos endpoints críticos em horário de pico
- Taxa de erro (5xx) < 2% por endpoint em janelas de 5 min

## Critérios de Qualidade (Definição de Pronto e Aceite)
- Código
  - Padrões de lint sem erros; revisões de código aprovadas (2 revisores para módulos críticos)
  - Sem vulnerabilidades altas/críticas nas verificações SCA/SAST
  - Testes unitários e integração cobrindo os cenários principais, com thresholds mínimos atendidos
- Documentação
  - Atualização de READMEs, decisões arquiteturais (ADR) e mudanças relevantes
  - Rotas/contratos (OpenAPI/Swagger) sincronizados
- Operação
  - Pipelines verdes (build/test/lint/scan)
  - Observabilidade básica: logs estruturados e métricas-chave coletadas
  - Deploy em staging com smoke tests bem-sucedidos

## Governança
- Cerimônias Scrum: planning, dailies, review e retro
- Gestão de backlog com priorização MoSCoW e critérios de aceite claros
- Comitê técnico quinzenal para decisões de arquitetura e tech debt
- Ritos de segurança mensais (revisão de dependências, políticas, segredos)
- Gestão de versões semânticas (semver) com changelog gerado no release
