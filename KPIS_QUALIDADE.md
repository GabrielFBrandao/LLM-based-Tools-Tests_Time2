# 📊 KPIs e Critérios de Qualidade - Sistema de Reserva Hoteleira

## 🎯 Visão Geral

**Objetivo**: Definir métricas mensuráveis para avaliar sucesso do projeto em 4 dimensões:
1. **Qualidade de Código**
2. **Performance e Confiabilidade**
3. **Processo de Desenvolvimento**
4. **Negócio e Produto**

---

## 📐 1. KPIs de Qualidade de Código

### 1.1 Cobertura de Testes

**Métrica**: Percentual de código coberto por testes

| Tipo | Target | Mínimo Aceitável | Medição |
|------|--------|------------------|---------|
| Unitários | 95% | 90% | Jest coverage |
| Integração | 90% | 85% | Jest E2E |
| E2E | 80% | 75% | Cypress |
| **Geral** | **90%** | **85%** | Combinado |

**Como Medir**:
```bash
npm run test:coverage
# Gera relatório em coverage/lcov-report/index.html
```

**Frequência**: A cada commit (CI/CD)  
**Responsável**: Todos os desenvolvedores  
**Ação se abaixo**: Adicionar testes antes de merge

---

### 1.2 Qualidade de Código (Code Quality)

**Métrica**: Score de qualidade estática

| Ferramenta | Métrica | Target | Mínimo |
|------------|---------|--------|--------|
| SonarQube | Quality Gate | A | B |
| ESLint | Warnings | 0 | 5 |
| TypeScript | Errors | 0 | 0 |
| Complexity | Cyclomatic | < 10 | < 15 |

**Como Medir**:
```bash
npm run lint
npm run type-check
# SonarQube scan automático no CI
```

**Frequência**: A cada PR  
**Responsável**: Code reviewer  
**Ação se abaixo**: Refatorar antes de merge

---

### 1.3 Dívida Técnica

**Métrica**: Tempo estimado para corrigir code smells

| Indicador | Target | Máximo |
|-----------|--------|--------|
| Technical Debt Ratio | < 5% | < 10% |
| Code Smells | < 50 | < 100 |
| Duplicação | < 3% | < 5% |
| Bugs (SonarQube) | 0 | 5 |

**Como Medir**: SonarQube dashboard

**Frequência**: Semanal  
**Responsável**: Tech Lead  
**Ação se acima**: Sprint de refatoração

---

### 1.4 Code Review

**Métrica**: Qualidade e velocidade de revisão

| Indicador | Target | Máximo |
|-----------|--------|--------|
| Tempo de review | < 4h | < 24h |
| Comentários por PR | 3-10 | - |
| Aprovações necessárias | 2 | - |
| PRs rejeitados | < 10% | < 20% |

**Como Medir**: GitHub Insights

**Frequência**: Diária  
**Responsável**: Tech Lead  
**Ação se acima**: Pair programming

---

## ⚡ 2. KPIs de Performance e Confiabilidade

### 2.1 Performance (Latência)

**Métrica**: Tempo de resposta das APIs

| Percentil | Target | Máximo | Crítico |
|-----------|--------|--------|---------|
| P50 (Mediana) | < 200ms | < 500ms | > 1s |
| P95 | < 500ms | < 1s | > 2s |
| P99 | < 1s | < 5s | > 10s |
| Timeout | 30s | - | - |

**Como Medir**:
```promql
# Prometheus query
histogram_quantile(0.95, 
  rate(http_request_duration_seconds_bucket[5m])
)
```

**Frequência**: Contínua (Prometheus)  
**Responsável**: Backend Lead  
**Ação se acima**: Otimizar queries/cache

---

### 2.2 Disponibilidade (Uptime)

**Métrica**: Percentual de tempo online

| Período | Target | Mínimo | Downtime Permitido |
|---------|--------|--------|--------------------|
| Mensal | 99.9% | 99.5% | 43 min/mês |
| Semanal | 99.9% | 99.0% | 10 min/semana |
| Diário | 99.9% | 99.0% | 1.4 min/dia |

**Como Medir**: Prometheus + Grafana

**Frequência**: Contínua  
**Responsável**: DevOps  
**Ação se abaixo**: Investigar causa raiz

---

### 2.3 Taxa de Erro

**Métrica**: Percentual de requisições com erro

| Tipo | Target | Máximo | Crítico |
|------|--------|--------|---------|
| 4xx (Cliente) | < 5% | < 10% | > 20% |
| 5xx (Servidor) | < 0.1% | < 1% | > 5% |
| **Total** | **< 1%** | **< 5%** | **> 10%** |

**Como Medir**:
```promql
sum(rate(http_errors_total[5m])) / 
sum(rate(http_requests_total[5m]))
```

**Frequência**: Contínua  
**Responsável**: Backend Lead  
**Ação se acima**: Hotfix imediato

---

### 2.4 Performance de Banco de Dados

**Métrica**: Tempo de execução de queries

| Métrica | Target | Máximo |
|---------|--------|--------|
| Query P95 | < 50ms | < 100ms |
| Query P99 | < 100ms | < 500ms |
| Slow queries | 0 | 5/dia |
| Conexões ativas | < 50 | < 100 |

**Como Medir**: PostgreSQL pg_stat_statements

**Frequência**: Diária  
**Responsável**: DBA/Backend Lead  
**Ação se acima**: Adicionar índices

---

### 2.5 Cache Hit Rate

**Métrica**: Percentual de requisições servidas do cache

| Cache | Target | Mínimo |
|-------|--------|--------|
| Redis | > 80% | > 70% |
| Browser | > 90% | > 80% |

**Como Medir**: Redis INFO stats

**Frequência**: Diária  
**Responsável**: Backend Lead  
**Ação se abaixo**: Revisar estratégia de cache

---

## 🔄 3. KPIs de Processo de Desenvolvimento

### 3.1 Velocity (Velocidade)

**Métrica**: Story points completados por sprint

| Indicador | Target | Mínimo |
|-----------|--------|--------|
| Velocity média | 35-40 SP | 30 SP |
| Variação | ±10% | ±20% |
| Commitment vs Delivered | 100% | 90% |

**Como Medir**: Jira/GitHub Projects

**Frequência**: Por sprint  
**Responsável**: Scrum Master  
**Ação se abaixo**: Revisar estimativas

---

### 3.2 Lead Time

**Métrica**: Tempo de ideia até produção

| Fase | Target | Máximo |
|------|--------|--------|
| Backlog → In Progress | < 1 sprint | < 2 sprints |
| In Progress → Code Review | < 3 dias | < 5 dias |
| Code Review → Merged | < 1 dia | < 2 dias |
| Merged → Deploy | < 1 dia | < 2 dias |
| **Total Lead Time** | **< 1 semana** | **< 2 semanas** |

**Como Medir**: Jira cycle time report

**Frequência**: Semanal  
**Responsável**: Scrum Master  
**Ação se acima**: Identificar gargalos

---

### 3.3 Deploy Frequency

**Métrica**: Frequência de deploys

| Ambiente | Target | Mínimo |
|----------|--------|--------|
| Staging | 2x/dia | 1x/dia |
| Production | 2x/sprint | 1x/sprint |

**Como Medir**: GitHub Actions logs

**Frequência**: Semanal  
**Responsável**: DevOps  
**Ação se abaixo**: Revisar pipeline

---

### 3.4 Change Failure Rate

**Métrica**: Percentual de deploys que causam falha

| Métrica | Target | Máximo |
|---------|--------|--------|
| Rollbacks | < 5% | < 10% |
| Hotfixes | < 10% | < 20% |

**Como Medir**: Logs de deploy

**Frequência**: Por sprint  
**Responsável**: Tech Lead  
**Ação se acima**: Melhorar testes

---

### 3.5 Mean Time to Recovery (MTTR)

**Métrica**: Tempo médio para recuperar de falha

| Severidade | Target | Máximo |
|------------|--------|--------|
| Crítico (S1) | < 1h | < 2h |
| Alto (S2) | < 4h | < 8h |
| Médio (S3) | < 1 dia | < 2 dias |

**Como Medir**: Incident tracking

**Frequência**: Por incidente  
**Responsável**: Tech Lead  
**Ação se acima**: Melhorar runbook

---

### 3.6 Bugs em Produção

**Métrica**: Quantidade de bugs descobertos em produção

| Severidade | Target | Máximo |
|------------|--------|--------|
| Crítico | 0 | 1/mês |
| Alto | < 2/mês | < 5/mês |
| Médio | < 5/mês | < 10/mês |
| **Total** | **< 10/mês** | **< 20/mês** |

**Como Medir**: Jira bug tracking

**Frequência**: Mensal  
**Responsável**: QA Lead  
**Ação se acima**: Sprint de correção

---

## 💼 4. KPIs de Negócio e Produto

### 4.1 Funcionalidades Entregues

**Métrica**: Percentual do escopo entregue

| Sprint | Target | Mínimo |
|--------|--------|--------|
| Sprint 1-2 | 100% | 90% |
| Sprint 3-4 | 100% | 90% |
| Sprint 5-6 | 100% | 90% |
| **Total** | **100%** | **95%** |

**Como Medir**: Jira roadmap

**Frequência**: Por sprint  
**Responsável**: PO  
**Ação se abaixo**: Renegociar escopo

---

### 4.2 Satisfação do Stakeholder

**Métrica**: Score de satisfação

| Indicador | Target | Mínimo |
|-----------|--------|--------|
| Sprint Review | 4.5/5 | 4.0/5 |
| Entrega Final | 4.5/5 | 4.0/5 |

**Como Medir**: Survey após sprint review

**Frequência**: Por sprint  
**Responsável**: PO  
**Ação se abaixo**: Reunião de alinhamento

---

### 4.3 Aderência ao Cronograma

**Métrica**: Desvio do prazo planejado

| Indicador | Target | Máximo |
|-----------|--------|--------|
| Desvio por sprint | 0 dias | 2 dias |
| Desvio total | 0 sprints | 1 sprint |

**Como Medir**: Comparar planejado vs real

**Frequência**: Por sprint  
**Responsável**: Scrum Master  
**Ação se acima**: Replanejar

---

### 4.4 Aderência ao Budget

**Métrica**: Desvio do orçamento

| Indicador | Target | Máximo |
|-----------|--------|--------|
| Desvio por sprint | 0% | 10% |
| Desvio total | 0% | 15% |

**Como Medir**: Horas trabalhadas vs planejadas

**Frequência**: Por sprint  
**Responsável**: Scrum Master  
**Ação se acima**: Revisar estimativas

---

## 📋 Critérios de Qualidade (Quality Gates)

### Gate 1: Sprint Review (Cada Sprint)

**Critérios Obrigatórios**:
- [ ] Todas as histórias "Done" (DoD completo)
- [ ] Cobertura de testes > 90%
- [ ] Zero bugs críticos
- [ ] Code review aprovado
- [ ] Demo funcional

**Aprovação**: PO + Tech Lead

---

### Gate 2: Staging (Sprint 8)

**Critérios Obrigatórios**:
- [ ] Todos os testes passando
- [ ] Performance: P95 < 1s
- [ ] Disponibilidade: 99.9%
- [ ] Taxa de erro < 1%
- [ ] Testes de carga aprovados
- [ ] Testes de segurança aprovados
- [ ] Documentação completa

**Aprovação**: Tech Lead + QA Lead

---

### Gate 3: Produção (Sprint 10)

**Critérios Obrigatórios**:
- [ ] Staging estável por 1 semana
- [ ] Zero bugs críticos
- [ ] Runbook documentado
- [ ] Monitoramento ativo
- [ ] Backup configurado
- [ ] Rollback testado
- [ ] Treinamento realizado
- [ ] Aprovação do PO

**Aprovação**: PO + Tech Lead + DevOps

---

## 📊 Dashboard de KPIs

### Dashboard 1: Qualidade de Código

```
┌─────────────────────────────────────────┐
│ Code Quality Dashboard                  │
├─────────────────────────────────────────┤
│ Coverage:        [████████░░] 92%  ✅   │
│ Code Smells:     [██░░░░░░░░] 23   ✅   │
│ Tech Debt:       [███░░░░░░░] 4.2% ✅   │
│ Duplicação:      [██░░░░░░░░] 2.1% ✅   │
│ Bugs:            [░░░░░░░░░░] 0    ✅   │
└─────────────────────────────────────────┘
```

---

### Dashboard 2: Performance

```
┌─────────────────────────────────────────┐
│ Performance Dashboard                   │
├─────────────────────────────────────────┤
│ P50 Latency:     [███░░░░░░░] 180ms ✅  │
│ P95 Latency:     [████░░░░░░] 420ms ✅  │
│ P99 Latency:     [█████░░░░░] 890ms ✅  │
│ Error Rate:      [█░░░░░░░░░] 0.3% ✅   │
│ Uptime:          [██████████] 99.95% ✅ │
└─────────────────────────────────────────┘
```

---

### Dashboard 3: Processo

```
┌─────────────────────────────────────────┐
│ Process Dashboard                       │
├─────────────────────────────────────────┤
│ Velocity:        [████████░░] 38 SP ✅  │
│ Lead Time:       [████░░░░░░] 5 dias ✅ │
│ Deploy Freq:     [██████░░░░] 1.8/dia ✅│
│ MTTR:            [███░░░░░░░] 45min ✅  │
│ Bugs Prod:       [██░░░░░░░░] 3/mês ✅  │
└─────────────────────────────────────────┘
```

---

## 📈 Relatórios

### Relatório Semanal (Tech Lead)

**Conteúdo**:
1. Velocity da semana
2. Bugs encontrados/corrigidos
3. Performance metrics
4. Bloqueios identificados
5. Ações para próxima semana

**Destinatários**: PO + Scrum Master

---

### Relatório de Sprint (Scrum Master)

**Conteúdo**:
1. Velocity do sprint
2. Histórias completadas
3. Desvios de prazo/budget
4. Riscos identificados
5. Retrospectiva

**Destinatários**: Stakeholders

---

### Relatório Mensal (PO)

**Conteúdo**:
1. Progresso do roadmap
2. KPIs de negócio
3. Satisfação dos stakeholders
4. Budget consumido
5. Próximos passos

**Destinatários**: Executivos

---

## ✅ Checklist de Qualidade por Sprint

### Sprint 1-2 (Backend)
- [ ] Cobertura > 90%
- [ ] Zero warnings ESLint
- [ ] Swagger completo
- [ ] Testes de integração

### Sprint 3-4 (Frontend)
- [ ] Componentes testados
- [ ] Acessibilidade WCAG 2.1
- [ ] Responsivo mobile/desktop
- [ ] Performance Lighthouse > 90

### Sprint 5-6 (Integração)
- [ ] Testes E2E completos
- [ ] Autenticação segura
- [ ] Cache funcionando
- [ ] Error handling global

### Sprint 7 (QA)
- [ ] Testes de carga aprovados
- [ ] Testes de segurança aprovados
- [ ] Bugs críticos = 0
- [ ] Performance dentro do SLA

### Sprint 8 (DevOps)
- [ ] Pipeline CI/CD funcionando
- [ ] Deploy automático
- [ ] Rollback testado
- [ ] Backup configurado

### Sprint 9 (Monitoramento)
- [ ] Alertas configurados
- [ ] Dashboards criados
- [ ] Runbook documentado
- [ ] On-call definido

### Sprint 10 (Produção)
- [ ] Deploy 100% sem incidentes
- [ ] Métricas estáveis
- [ ] Documentação completa
- [ ] Treinamento realizado

---

## 🎯 Metas SMART

### Meta 1: Qualidade
**S**pecific: Atingir 90% de cobertura de testes  
**M**easurable: Jest coverage report  
**A**chievable: Com disciplina de TDD  
**R**elevant: Reduz bugs em produção  
**T**ime-bound: Até Sprint 7

### Meta 2: Performance
**S**pecific: P95 < 1s em todas as APIs  
**M**easurable: Prometheus metrics  
**A**chievable: Com cache e otimizações  
**R**elevant: Melhora experiência do usuário  
**T**ime-bound: Até Sprint 7

### Meta 3: Disponibilidade
**S**pecific: 99.9% uptime mensal  
**M**easurable: Prometheus uptime  
**A**chievable: Com monitoramento e alertas  
**R**elevant: Confiabilidade do sistema  
**T**ime-bound: A partir de Sprint 10

---

## 📞 Responsabilidades

| KPI | Responsável | Frequência |
|-----|-------------|------------|
| Cobertura de testes | Todos os devs | Contínua |
| Code quality | Tech Lead | Semanal |
| Performance | Backend Lead | Diária |
| Disponibilidade | DevOps | Contínua |
| Velocity | Scrum Master | Por sprint |
| Bugs | QA Lead | Diária |
| Satisfação | PO | Por sprint |

---

**Versão**: 1.0  
**Última Atualização**: 2024-01-01  
**Revisão**: Mensal  
**Aprovado por**: Tech Lead + PO
