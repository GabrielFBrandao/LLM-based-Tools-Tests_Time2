# 📅 Cronograma de Sprints - Sistema de Reserva Hoteleira

## 🎯 Visão Geral do Projeto

**Projeto**: Sistema de Reserva Hoteleira Completo  
**Duração**: 10 sprints (20 semanas / ~5 meses)  
**Time**: 4 desenvolvedores + 1 tech lead + 1 QA  
**Metodologia**: Scrum (sprints de 2 semanas)

---

## 📊 Roadmap Visual

```
Sprint 1-2:  Backend Core        [████████] 4 semanas
Sprint 3-4:  Frontend Core       [████████] 4 semanas  
Sprint 5-6:  Integração          [████████] 4 semanas
Sprint 7:    Testes & QA         [████] 2 semanas
Sprint 8:    Deploy & DevOps     [████] 2 semanas
Sprint 9:    Monitoramento       [████] 2 semanas
Sprint 10:   Produção & Docs     [████] 2 semanas
─────────────────────────────────────────────────────
Total:                           20 semanas
```

---

## 🚀 Sprint 1-2: Backend Core (Semanas 1-4)

**Objetivo**: Implementar módulos de negócio e APIs REST

### Sprint 1 (Semanas 1-2)

| ID | Task | Responsável | Horas | Story Points |
|----|------|-------------|-------|--------------|
| S1.1 | Setup projeto (Node + TypeScript) | Dev 1 | 4h | 2 |
| S1.2 | Configurar PostgreSQL + Prisma | Dev 1 | 6h | 3 |
| S1.3 | Implementar módulo Quartos | Dev 2 | 16h | 8 |
| S1.4 | Implementar módulo Hóspedes | Dev 3 | 12h | 6 |
| S1.5 | Implementar State Pattern | Dev 2 | 8h | 5 |
| S1.6 | Testes unitários Quartos | Dev 4 | 10h | 5 |
| S1.7 | Testes unitários Hóspedes | Dev 4 | 8h | 4 |
| S1.8 | Code review e ajustes | Time | 6h | 3 |

**Total**: 70 horas | 36 story points

### Sprint 2 (Semanas 3-4)

| ID | Task | Responsável | Horas | Story Points |
|----|------|-------------|-------|--------------|
| S2.1 | Implementar módulo Reservas | Dev 1 | 16h | 8 |
| S2.2 | Validações de negócio | Dev 2 | 10h | 5 |
| S2.3 | Controllers REST API | Dev 3 | 12h | 6 |
| S2.4 | DTOs e Mappers | Dev 4 | 8h | 4 |
| S2.5 | Testes unitários Reservas | Dev 1 | 10h | 5 |
| S2.6 | Testes de integração | Dev 2 | 12h | 6 |
| S2.7 | Documentação Swagger | Dev 3 | 6h | 3 |
| S2.8 | Code review e ajustes | Time | 6h | 3 |

**Total**: 80 horas | 40 story points

### Entregáveis Sprint 1-2
- ✅ API REST completa (3 módulos)
- ✅ 21 testes unitários
- ✅ 6 testes de integração
- ✅ Documentação Swagger
- ✅ Cobertura de testes > 90%

---

## 🎨 Sprint 3-4: Frontend Core (Semanas 5-8)

**Objetivo**: Implementar interface web com React

### Sprint 3 (Semanas 5-6)

| ID | Task | Responsável | Horas | Story Points |
|----|------|-------------|-------|--------------|
| S3.1 | Setup React + TypeScript | Dev 1 | 4h | 2 |
| S3.2 | Configurar routing e state | Dev 1 | 6h | 3 |
| S3.3 | Tela de listagem de quartos | Dev 2 | 12h | 6 |
| S3.4 | Tela de cadastro de quartos | Dev 2 | 10h | 5 |
| S3.5 | Tela de listagem de hóspedes | Dev 3 | 10h | 5 |
| S3.6 | Tela de cadastro de hóspedes | Dev 3 | 10h | 5 |
| S3.7 | Componentes reutilizáveis | Dev 4 | 12h | 6 |
| S3.8 | Integração com API | Dev 1 | 8h | 4 |

**Total**: 72 horas | 36 story points

### Sprint 4 (Semanas 7-8)

| ID | Task | Responsável | Horas | Story Points |
|----|------|-------------|-------|--------------|
| S4.1 | Tela de reservas | Dev 1 | 14h | 7 |
| S4.2 | Filtros e busca | Dev 2 | 10h | 5 |
| S4.3 | Validações de formulário | Dev 3 | 8h | 4 |
| S4.4 | Feedback visual (toasts, loading) | Dev 4 | 8h | 4 |
| S4.5 | Responsividade mobile | Dev 2 | 10h | 5 |
| S4.6 | Testes de componentes | Dev 3 | 12h | 6 |
| S4.7 | Acessibilidade (a11y) | Dev 4 | 8h | 4 |
| S4.8 | Code review e ajustes | Time | 6h | 3 |

**Total**: 76 horas | 38 story points

### Entregáveis Sprint 3-4
- ✅ Interface completa (3 módulos)
- ✅ Integração com backend
- ✅ Responsivo (mobile/desktop)
- ✅ Testes de componentes
- ✅ Acessibilidade WCAG 2.1

---

## 🔗 Sprint 5-6: Integração (Semanas 9-12)

**Objetivo**: Integrar frontend + backend e implementar features avançadas

### Sprint 5 (Semanas 9-10)

| ID | Task | Responsável | Horas | Story Points |
|----|------|-------------|-------|--------------|
| S5.1 | Autenticação JWT | Dev 1 | 12h | 6 |
| S5.2 | Autorização (roles) | Dev 1 | 8h | 4 |
| S5.3 | Cache com Redis | Dev 2 | 10h | 5 |
| S5.4 | Upload de imagens | Dev 3 | 10h | 5 |
| S5.5 | Paginação e ordenação | Dev 4 | 8h | 4 |
| S5.6 | Filtros avançados | Dev 2 | 10h | 5 |
| S5.7 | Testes E2E (Cypress) | QA | 12h | 6 |
| S5.8 | Code review e ajustes | Time | 6h | 3 |

**Total**: 76 horas | 38 story points

### Sprint 6 (Semanas 11-12)

| ID | Task | Responsável | Horas | Story Points |
|----|------|-------------|-------|--------------|
| S6.1 | Relatórios e dashboards | Dev 1 | 12h | 6 |
| S6.2 | Exportação (PDF, Excel) | Dev 2 | 10h | 5 |
| S6.3 | Notificações (email) | Dev 3 | 10h | 5 |
| S6.4 | Auditoria de ações | Dev 4 | 8h | 4 |
| S6.5 | Tratamento de erros global | Dev 1 | 8h | 4 |
| S6.6 | Testes de integração E2E | QA | 12h | 6 |
| S6.7 | Performance optimization | Dev 2 | 8h | 4 |
| S6.8 | Code review e ajustes | Time | 6h | 3 |

**Total**: 74 horas | 37 story points

### Entregáveis Sprint 5-6
- ✅ Autenticação e autorização
- ✅ Cache implementado
- ✅ Features avançadas
- ✅ Testes E2E completos
- ✅ Performance otimizada

---

## 🧪 Sprint 7: Testes & QA (Semanas 13-14)

**Objetivo**: Garantir qualidade e estabilidade

| ID | Task | Responsável | Horas | Story Points |
|----|------|-------------|-------|--------------|
| S7.1 | Testes de carga (JMeter) | QA | 10h | 5 |
| S7.2 | Testes de segurança (OWASP) | Dev 1 | 8h | 4 |
| S7.3 | Testes de regressão | QA | 12h | 6 |
| S7.4 | Correção de bugs críticos | Time | 16h | 8 |
| S7.5 | Testes de usabilidade | QA | 8h | 4 |
| S7.6 | Testes de acessibilidade | Dev 2 | 6h | 3 |
| S7.7 | Documentação de testes | QA | 6h | 3 |
| S7.8 | Relatório de qualidade | Tech Lead | 4h | 2 |

**Total**: 70 horas | 35 story points

### Entregáveis Sprint 7
- ✅ Relatório de testes de carga
- ✅ Relatório de segurança
- ✅ Bugs críticos corrigidos
- ✅ Cobertura de testes > 90%
- ✅ QA sign-off

---

## 🐳 Sprint 8: Deploy & DevOps (Semanas 15-16)

**Objetivo**: Configurar infraestrutura e pipeline CI/CD

| ID | Task | Responsável | Horas | Story Points |
|----|------|-------------|-------|--------------|
| S8.1 | Dockerfiles multi-stage | Dev 1 | 8h | 4 |
| S8.2 | Docker Compose | Dev 1 | 6h | 3 |
| S8.3 | GitHub Actions CI/CD | Dev 2 | 10h | 5 |
| S8.4 | Configurar ambientes (staging/prod) | Dev 2 | 8h | 4 |
| S8.5 | Nginx reverse proxy | Dev 3 | 6h | 3 |
| S8.6 | SSL/TLS certificates | Dev 3 | 4h | 2 |
| S8.7 | Backup automático | Dev 4 | 8h | 4 |
| S8.8 | Deploy em staging | Time | 10h | 5 |
| S8.9 | Testes em staging | QA | 8h | 4 |
| S8.10 | Documentação de deploy | Tech Lead | 6h | 3 |

**Total**: 74 horas | 37 story points

### Entregáveis Sprint 8
- ✅ Pipeline CI/CD funcionando
- ✅ Deploy automático staging
- ✅ Infraestrutura configurada
- ✅ Backup automático
- ✅ Staging testado e aprovado

---

## 📊 Sprint 9: Monitoramento (Semanas 17-18)

**Objetivo**: Implementar observabilidade completa

| ID | Task | Responsável | Horas | Story Points |
|----|------|-------------|-------|--------------|
| S9.1 | Prometheus + métricas | Dev 1 | 10h | 5 |
| S9.2 | Grafana dashboards | Dev 1 | 8h | 4 |
| S9.3 | Logs estruturados (Winston) | Dev 2 | 8h | 4 |
| S9.4 | Alertas (Prometheus) | Dev 2 | 8h | 4 |
| S9.5 | Healthchecks | Dev 3 | 6h | 3 |
| S9.6 | APM (opcional) | Dev 3 | 8h | 4 |
| S9.7 | Runbook de incidentes | Tech Lead | 8h | 4 |
| S9.8 | Documentação de monitoramento | Tech Lead | 6h | 3 |
| S9.9 | Testes de alertas | QA | 6h | 3 |

**Total**: 68 horas | 34 story points

### Entregáveis Sprint 9
- ✅ 17 métricas Prometheus
- ✅ 5 dashboards Grafana
- ✅ 8 alertas configurados
- ✅ Logs estruturados
- ✅ Runbook completo

---

## 🚢 Sprint 10: Produção & Docs (Semanas 19-20)

**Objetivo**: Deploy em produção e finalização

| ID | Task | Responsável | Horas | Story Points |
|----|------|-------------|-------|--------------|
| S10.1 | Deploy canary (10%) | DevOps | 4h | 2 |
| S10.2 | Monitoramento 24h | Time | 8h | 4 |
| S10.3 | Deploy gradual (50%) | DevOps | 2h | 1 |
| S10.4 | Monitoramento 48h | Time | 4h | 2 |
| S10.5 | Deploy completo (100%) | DevOps | 2h | 1 |
| S10.6 | Documentação técnica | Dev 1 | 10h | 5 |
| S10.7 | Documentação de usuário | Dev 2 | 10h | 5 |
| S10.8 | Vídeos tutoriais | Dev 3 | 8h | 4 |
| S10.9 | Treinamento da equipe | Tech Lead | 8h | 4 |
| S10.10 | Post-mortem e retrospectiva | Time | 6h | 3 |
| S10.11 | Handover para suporte | Tech Lead | 4h | 2 |

**Total**: 66 horas | 33 story points

### Entregáveis Sprint 10
- ✅ Sistema em produção (100%)
- ✅ Documentação completa
- ✅ Equipe treinada
- ✅ Handover realizado
- ✅ Retrospectiva documentada

---

## 📊 Resumo Executivo

### Distribuição de Esforço

| Sprint | Foco | Horas | Story Points | % Total |
|--------|------|-------|--------------|---------|
| Sprint 1 | Backend Core | 70h | 36 | 10% |
| Sprint 2 | Backend Core | 80h | 40 | 11% |
| Sprint 3 | Frontend Core | 72h | 36 | 10% |
| Sprint 4 | Frontend Core | 76h | 38 | 11% |
| Sprint 5 | Integração | 76h | 38 | 11% |
| Sprint 6 | Integração | 74h | 37 | 10% |
| Sprint 7 | Testes & QA | 70h | 35 | 10% |
| Sprint 8 | Deploy & DevOps | 74h | 37 | 10% |
| Sprint 9 | Monitoramento | 68h | 34 | 9% |
| Sprint 10 | Produção & Docs | 66h | 33 | 9% |
| **TOTAL** | | **726h** | **364 SP** | **100%** |

### Alocação de Recursos

**Time**: 4 devs + 1 tech lead + 1 QA = 6 pessoas

**Capacidade por sprint**:
- 4 devs × 40h = 160h
- 1 tech lead × 20h = 20h (50% dedicação)
- 1 QA × 40h = 40h (a partir Sprint 5)
- **Total**: ~180-220h por sprint

**Utilização**: 70-80h/sprint = ~40% da capacidade  
**Permite**: Trabalho paralelo em bugs e melhorias

---

## 🎯 Milestones Críticos

| # | Milestone | Sprint | Semana | Critério de Sucesso |
|---|-----------|--------|--------|---------------------|
| M1 | Backend MVP | Sprint 2 | 4 | API REST completa + testes |
| M2 | Frontend MVP | Sprint 4 | 8 | Interface completa + integrada |
| M3 | Features Completas | Sprint 6 | 12 | Todas features implementadas |
| M4 | QA Aprovado | Sprint 7 | 14 | Testes passando + bugs corrigidos |
| M5 | Staging OK | Sprint 8 | 16 | Deploy staging funcionando |
| M6 | Produção 100% | Sprint 10 | 20 | Sistema em produção |

---

## 📋 Cerimônias Scrum

### Daily Standup (15min - 9h)
- O que fiz ontem?
- O que farei hoje?
- Algum bloqueio?

### Sprint Planning (4h - Segunda-feira)
- Review do backlog
- Refinamento de histórias
- Estimativa (Planning Poker)
- Commitment do sprint

### Sprint Review (2h - Sexta-feira)
- Demo das entregas
- Feedback dos stakeholders
- Atualização do roadmap

### Sprint Retrospective (1.5h - Sexta-feira)
- O que funcionou bem?
- O que pode melhorar?
- Action items para próximo sprint

### Backlog Refinement (2h - Quarta-feira)
- Refinar histórias futuras
- Esclarecer requisitos
- Estimar complexidade

---

## 📈 Métricas de Acompanhamento

### Por Sprint

| Métrica | Target | Como Medir |
|---------|--------|------------|
| Velocity | 35-40 SP | Story points completados |
| Bugs encontrados | < 10 | Jira/GitHub Issues |
| Code coverage | > 90% | Jest/Cypress reports |
| Code review time | < 24h | GitHub PR metrics |
| Build time | < 5min | CI/CD pipeline |
| Deploy frequency | 2x/sprint | GitHub Actions |

### Geral do Projeto

| Métrica | Target | Status |
|---------|--------|--------|
| Prazo | 20 semanas | 📊 On track |
| Budget | 726 horas | 📊 On track |
| Qualidade | > 90% coverage | 📊 On track |
| Performance | P95 < 1s | 📊 On track |
| Disponibilidade | 99.9% | 📊 On track |

---

## ⚠️ Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Atraso no backend | Média | Alto | Buffer de 1 sprint |
| Bugs em produção | Média | Alto | Deploy gradual + rollback |
| Performance ruim | Baixa | Alto | Testes de carga Sprint 7 |
| Scope creep | Alta | Médio | Feature freeze após Sprint 6 |
| Falta de recursos | Baixa | Alto | Time backup identificado |
| Dependências externas | Média | Médio | Identificar cedo + alternativas |

---

## 🎓 Definition of Done (DoD)

Para cada história ser considerada "Done":

**Código**
- [ ] Implementado conforme requisitos
- [ ] Code review aprovado (2+ devs)
- [ ] Sem warnings de linter
- [ ] Sem vulnerabilidades conhecidas

**Testes**
- [ ] Testes unitários (coverage > 90%)
- [ ] Testes de integração passando
- [ ] Testes E2E (features críticas)
- [ ] Testes manuais (QA)

**Documentação**
- [ ] Código documentado (JSDoc)
- [ ] README atualizado
- [ ] Swagger atualizado (APIs)
- [ ] Changelog atualizado

**Deploy**
- [ ] Build passando no CI
- [ ] Deploy em staging OK
- [ ] Aprovação do PO
- [ ] Merged na branch principal

---

## 🚀 Quick Start - Semana 1

### Dia 1 (Segunda)
```bash
# Setup inicial
git clone <repo>
npm install
docker-compose up -d postgres redis

# Sprint Planning
- Revisar backlog Sprint 1
- Estimar histórias
- Commitment do time
```

### Dia 2-4 (Terça-Quinta)
```bash
# Desenvolvimento
- Implementar tasks S1.1 a S1.5
- Daily standup 9h
- Code review contínuo
```

### Dia 5 (Sexta)
```bash
# Review e Retro
- Demo das entregas
- Sprint Review com stakeholders
- Sprint Retrospective
- Preparar Sprint 2
```

---

## 📞 Comunicação

### Stakeholders

| Papel | Pessoa | Frequência | Canal |
|-------|--------|------------|-------|
| Product Owner | PO | Diário | Slack + Sprint Review |
| Tech Lead | TL | Diário | Daily Standup |
| QA Lead | QA | Diário | Daily Standup |
| DevOps | Ops | Semanal | Planning + Review |
| Gerente | GM | Semanal | Status Report |

### Canais

- **Slack**: #hotel-dev (desenvolvimento)
- **Slack**: #hotel-qa (qualidade)
- **Slack**: #hotel-deploy (deploys)
- **Jira**: Gestão de tarefas
- **Confluence**: Documentação
- **GitHub**: Código + PRs
- **Email**: Status semanal stakeholders

---

## ✅ Checklist de Início de Projeto

### Preparação (Semana 0)

- [ ] Aprovação do budget
- [ ] Time alocado (4 devs + TL + QA)
- [ ] Infraestrutura provisionada
- [ ] Repositório criado
- [ ] Jira/GitHub Projects configurado
- [ ] Slack channels criados
- [ ] Kick-off meeting realizado
- [ ] Documentação inicial pronta

### Ferramentas Necessárias

- [ ] GitHub (código)
- [ ] Jira (gestão)
- [ ] Slack (comunicação)
- [ ] Docker (desenvolvimento)
- [ ] PostgreSQL (banco)
- [ ] Redis (cache)
- [ ] AWS/GCP (cloud)

---

## 🎉 Entregáveis Finais

### Código
- ✅ Backend completo (Node + TypeScript)
- ✅ Frontend completo (React + TypeScript)
- ✅ 27+ testes automatizados
- ✅ Cobertura > 90%

### Infraestrutura
- ✅ Docker + Docker Compose
- ✅ CI/CD (GitHub Actions)
- ✅ Staging + Production
- ✅ Monitoramento (Prometheus + Grafana)

### Documentação
- ✅ Documentação técnica
- ✅ Documentação de usuário
- ✅ Swagger API
- ✅ Runbook de incidentes
- ✅ Vídeos tutoriais

### Qualidade
- ✅ Performance: P95 < 1s
- ✅ Disponibilidade: 99.9%
- ✅ Segurança: OWASP Top 10
- ✅ Acessibilidade: WCAG 2.1

---

**Versão**: 1.0  
**Data**: 2024-01-01  
**Responsável**: Tech Lead  
**Status**: 📋 Pronto para execução  
**Duração**: 20 semanas (5 meses)  
**Esforço**: 726 horas | 364 story points
