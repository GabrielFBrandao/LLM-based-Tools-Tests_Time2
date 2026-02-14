# ⚠️ Riscos e Planos de Mitigação - Sistema de Reserva Hoteleira

## 📊 Matriz de Riscos

### Classificação

**Probabilidade**: Baixa (10%) | Média (30%) | Alta (60%)  
**Impacto**: Baixo (1-2 dias) | Médio (3-5 dias) | Alto (1-2 semanas) | Crítico (> 2 semanas)

**Prioridade**: Probabilidade × Impacto

---

## 🔴 Riscos Críticos (Prioridade Alta)

### R1: Bugs Críticos em Produção

**Categoria**: Técnico  
**Probabilidade**: Média (30%)  
**Impacto**: Crítico (Sistema indisponível)  
**Prioridade**: 🔴 ALTA

#### Descrição
Bugs críticos descobertos após deploy em produção que causam indisponibilidade do sistema ou perda de dados.

#### Indicadores
- Sistema retorna 500 errors
- Dados corrompidos no banco
- Funcionalidade crítica quebrada
- Usuários não conseguem fazer reservas

#### Plano de Mitigação

**Preventivo**:
1. ✅ Cobertura de testes > 90%
2. ✅ Testes E2E de fluxos críticos
3. ✅ Code review obrigatório (2+ devs)
4. ✅ Deploy gradual (canary 10% → 50% → 100%)
5. ✅ Testes de carga no Sprint 7
6. ✅ Staging environment idêntico a produção

**Reativo**:
1. 🚨 Rollback automático se error rate > 5%
2. 🚨 Hotfix em < 2h (time on-call)
3. 🚨 Comunicação imediata aos stakeholders
4. 🚨 Post-mortem obrigatório

**Responsável**: Tech Lead + DevOps  
**Budget de Contingência**: 40h (1 semana)

---

### R2: Performance Degradada

**Categoria**: Técnico  
**Probabilidade**: Média (30%)  
**Impacto**: Alto (Usuários insatisfeitos)  
**Prioridade**: 🔴 ALTA

#### Descrição
Sistema lento (P95 > 5s) causando má experiência do usuário e possível perda de negócio.

#### Indicadores
- P95 latência > 5s
- Timeout em requisições
- Usuários reclamando de lentidão
- Taxa de abandono aumentando

#### Plano de Mitigação

**Preventivo**:
1. ✅ Testes de carga (JMeter) no Sprint 7
2. ✅ Cache Redis para queries frequentes
3. ✅ Índices no banco de dados
4. ✅ Paginação em todas as listas
5. ✅ Lazy loading de imagens
6. ✅ Monitoramento de performance (Prometheus)

**Reativo**:
1. 🚨 Identificar queries lentas (pg_stat_statements)
2. 🚨 Adicionar índices faltantes
3. 🚨 Otimizar queries N+1
4. 🚨 Aumentar recursos (scale up)
5. 🚨 Implementar CDN se necessário

**SLA**: P95 < 1s | P99 < 5s  
**Responsável**: Backend Lead  
**Budget de Contingência**: 24h

---

### R3: Conflitos de Reserva (Race Condition)

**Categoria**: Técnico  
**Probabilidade**: Alta (60%)  
**Impacto**: Alto (Overbooking)  
**Prioridade**: 🔴 ALTA

#### Descrição
Dois usuários reservam o mesmo quarto simultaneamente, causando overbooking.

#### Indicadores
- Quarto com múltiplas reservas ativas
- Reclamações de clientes
- Dados inconsistentes no banco

#### Plano de Mitigação

**Preventivo**:
1. ✅ Transações de banco de dados (ACID)
2. ✅ Lock otimista (version field)
3. ✅ Validação de disponibilidade antes de salvar
4. ✅ Testes de concorrência
5. ✅ Redis para lock distribuído

**Implementação**:
```typescript
// Lock otimista com Prisma
await prisma.quarto.update({
  where: { 
    id: quartoId,
    version: currentVersion // Falha se mudou
  },
  data: {
    status: 'OCUPADO',
    version: { increment: 1 }
  }
});
```

**Reativo**:
1. 🚨 Detectar conflitos via logs
2. 🚨 Cancelar reserva duplicada
3. 🚨 Notificar cliente afetado
4. 🚨 Oferecer compensação

**Responsável**: Backend Lead  
**Budget de Contingência**: 16h

---

## 🟡 Riscos Médios (Prioridade Média)

### R4: Atraso no Cronograma

**Categoria**: Gerencial  
**Probabilidade**: Alta (60%)  
**Impacto**: Médio (Atraso de 1-2 sprints)  
**Prioridade**: 🟡 MÉDIA

#### Descrição
Projeto atrasa devido a estimativas incorretas, scope creep ou impedimentos técnicos.

#### Indicadores
- Velocity abaixo de 35 SP/sprint
- Histórias não completadas
- Burndown chart não convergindo
- Acúmulo de débito técnico

#### Plano de Mitigação

**Preventivo**:
1. ✅ Buffer de 20% nas estimativas
2. ✅ Feature freeze após Sprint 6
3. ✅ Daily standup para identificar bloqueios
4. ✅ Retrospectivas para melhorias contínuas
5. ✅ Priorização clara (MoSCoW)

**Reativo**:
1. 🚨 Reduzir escopo (mover features para v2)
2. 🚨 Adicionar recursos temporários
3. 🚨 Trabalho em paralelo
4. 🚨 Overtime pontual (máx 10h/semana)
5. 🚨 Renegociar prazo com stakeholders

**Responsável**: Scrum Master + PO  
**Budget de Contingência**: 2 sprints (4 semanas)

---

### R5: Falta de Recursos (Desenvolvedores)

**Categoria**: Gerencial  
**Probabilidade**: Média (30%)  
**Impacto**: Alto (Projeto para)  
**Prioridade**: 🟡 MÉDIA

#### Descrição
Desenvolvedor sai do projeto (doença, férias, demissão) causando perda de conhecimento e capacidade.

#### Indicadores
- Desenvolvedor ausente > 3 dias
- Conhecimento concentrado em 1 pessoa
- Documentação desatualizada

#### Plano de Mitigação

**Preventivo**:
1. ✅ Pair programming (conhecimento compartilhado)
2. ✅ Documentação contínua
3. ✅ Code review (todos conhecem o código)
4. ✅ Time backup identificado
5. ✅ Onboarding documentado

**Reativo**:
1. 🚨 Ativar desenvolvedor backup
2. 🚨 Redistribuir tarefas
3. 🚨 Contratar temporário
4. 🚨 Reduzir escopo se necessário

**Responsável**: Tech Lead + RH  
**Budget de Contingência**: 1 desenvolvedor backup

---

### R6: Problemas de Integração

**Categoria**: Técnico  
**Probabilidade**: Média (30%)  
**Impacto**: Médio (Retrabalho)  
**Prioridade**: 🟡 MÉDIA

#### Descrição
Frontend e backend não se integram corretamente devido a contratos de API divergentes.

#### Indicadores
- Erros 400/422 frequentes
- Frontend não exibe dados corretamente
- Tipos TypeScript incompatíveis

#### Plano de Mitigação

**Preventivo**:
1. ✅ Swagger/OpenAPI como contrato
2. ✅ Validação de schema (Zod/Yup)
3. ✅ Testes de contrato (Pact)
4. ✅ TypeScript em ambos os lados
5. ✅ Integração contínua desde Sprint 3

**Reativo**:
1. 🚨 Reunião de alinhamento
2. 🚨 Atualizar contratos
3. 🚨 Testes de integração
4. 🚨 Hotfix se necessário

**Responsável**: Tech Lead  
**Budget de Contingência**: 16h

---

### R7: Vulnerabilidades de Segurança

**Categoria**: Técnico  
**Probabilidade**: Média (30%)  
**Impacto**: Crítico (Dados vazados)  
**Prioridade**: 🟡 MÉDIA

#### Descrição
Vulnerabilidades descobertas (SQL injection, XSS, CSRF) que podem comprometer dados.

#### Indicadores
- Scan de segurança com alertas
- Dependências vulneráveis
- Dados sensíveis expostos

#### Plano de Mitigação

**Preventivo**:
1. ✅ OWASP Top 10 checklist
2. ✅ Dependabot (GitHub)
3. ✅ Sanitização de inputs
4. ✅ Prepared statements (SQL injection)
5. ✅ HTTPS obrigatório
6. ✅ JWT com expiração
7. ✅ Rate limiting
8. ✅ Testes de segurança (Sprint 7)

**Reativo**:
1. 🚨 Patch imediato
2. 🚨 Auditoria de logs
3. 🚨 Notificar usuários afetados
4. 🚨 Post-mortem de segurança

**Responsável**: Security Lead + Tech Lead  
**Budget de Contingência**: 24h

---

## 🟢 Riscos Baixos (Prioridade Baixa)

### R8: Dependências Desatualizadas

**Categoria**: Técnico  
**Probabilidade**: Alta (60%)  
**Impacto**: Baixo (Manutenção)  
**Prioridade**: 🟢 BAIXA

#### Descrição
Dependências npm/yarn ficam desatualizadas, causando vulnerabilidades ou incompatibilidades.

#### Plano de Mitigação

**Preventivo**:
1. ✅ Dependabot automático
2. ✅ Atualização mensal
3. ✅ Testes após atualização

**Reativo**:
1. 🚨 Atualizar dependências críticas
2. 🚨 Testar em staging

**Responsável**: Qualquer dev  
**Budget de Contingência**: 4h/mês

---

### R9: Problemas de Infraestrutura

**Categoria**: Técnico  
**Probabilidade**: Baixa (10%)  
**Impacto**: Alto (Downtime)  
**Prioridade**: 🟢 BAIXA

#### Descrição
Problemas com cloud provider (AWS/GCP) causando indisponibilidade.

#### Plano de Mitigação

**Preventivo**:
1. ✅ Multi-AZ deployment
2. ✅ Backup automático diário
3. ✅ Monitoramento 24/7
4. ✅ Runbook de incidentes

**Reativo**:
1. 🚨 Failover automático
2. 🚨 Restaurar de backup
3. 🚨 Comunicar status

**Responsável**: DevOps  
**Budget de Contingência**: 8h

---

### R10: Scope Creep

**Categoria**: Gerencial  
**Probabilidade**: Alta (60%)  
**Impacto**: Médio (Atraso)  
**Prioridade**: 🟢 BAIXA

#### Descrição
Stakeholders solicitam features adicionais durante o desenvolvimento.

#### Plano de Mitigação

**Preventivo**:
1. ✅ Feature freeze após Sprint 6
2. ✅ Backlog priorizado (MoSCoW)
3. ✅ Change request formal
4. ✅ Comunicação clara de impacto

**Reativo**:
1. 🚨 Avaliar impacto
2. 🚨 Negociar prazo/escopo
3. 🚨 Mover para v2 se necessário

**Responsável**: PO + Scrum Master  
**Budget de Contingência**: N/A

---

## 📊 Resumo de Riscos

### Por Categoria

| Categoria | Quantidade | % |
|-----------|------------|---|
| Técnico | 7 | 70% |
| Gerencial | 3 | 30% |

### Por Prioridade

| Prioridade | Quantidade | Budget Contingência |
|------------|------------|---------------------|
| 🔴 Alta | 3 | 80h (2 semanas) |
| 🟡 Média | 4 | 80h (2 semanas) |
| 🟢 Baixa | 3 | 12h |
| **Total** | **10** | **172h** |

### Por Probabilidade

| Probabilidade | Quantidade |
|---------------|------------|
| Alta (60%) | 4 |
| Média (30%) | 5 |
| Baixa (10%) | 1 |

---

## 🎯 Top 5 Riscos (Prioridade × Impacto)

| # | Risco | Score | Ação Imediata |
|---|-------|-------|---------------|
| 1 | Conflitos de Reserva | 60 | Implementar lock otimista |
| 2 | Bugs em Produção | 30 | Deploy gradual + testes |
| 3 | Performance Degradada | 30 | Testes de carga Sprint 7 |
| 4 | Atraso no Cronograma | 18 | Buffer 20% + feature freeze |
| 5 | Vulnerabilidades | 15 | OWASP checklist + scans |

---

## 📋 Plano de Monitoramento

### Indicadores de Risco (KRIs)

| Indicador | Threshold | Ação |
|-----------|-----------|------|
| Velocity | < 30 SP/sprint | Revisar estimativas |
| Error rate | > 1% | Investigar bugs |
| P95 latency | > 1s | Otimizar performance |
| Code coverage | < 85% | Adicionar testes |
| Bugs abertos | > 20 | Sprint de correção |
| Deploy frequency | < 2x/sprint | Revisar pipeline |

### Revisão de Riscos

**Frequência**: Semanal (Sprint Planning)

**Checklist**:
- [ ] Revisar riscos existentes
- [ ] Identificar novos riscos
- [ ] Atualizar probabilidades
- [ ] Verificar planos de mitigação
- [ ] Comunicar mudanças

---

## 🚨 Plano de Resposta a Incidentes

### Severidade 1 (Crítico)

**Definição**: Sistema indisponível ou perda de dados

**Resposta**:
1. ⏱️ 0min: Detectar (alertas automáticos)
2. ⏱️ 5min: Notificar time on-call
3. ⏱️ 15min: Iniciar investigação
4. ⏱️ 30min: Comunicar stakeholders
5. ⏱️ 2h: Resolver ou rollback
6. ⏱️ 24h: Post-mortem

**Time**: Tech Lead + 2 devs + DevOps

---

### Severidade 2 (Alto)

**Definição**: Funcionalidade crítica quebrada

**Resposta**:
1. ⏱️ 0min: Detectar
2. ⏱️ 15min: Notificar time
3. ⏱️ 1h: Iniciar investigação
4. ⏱️ 4h: Resolver ou workaround
5. ⏱️ 48h: Post-mortem

**Time**: 1-2 devs

---

### Severidade 3 (Médio)

**Definição**: Bug não crítico

**Resposta**:
1. Criar ticket
2. Priorizar no backlog
3. Resolver no próximo sprint

---

## 📞 Contatos de Emergência

| Papel | Nome | Telefone | Disponibilidade |
|-------|------|----------|-----------------|
| Tech Lead | TL | +55 11 9xxxx-xxxx | 24/7 |
| DevOps | Ops | +55 11 9xxxx-xxxx | 24/7 |
| Backend Lead | Dev1 | +55 11 9xxxx-xxxx | 8h-20h |
| Frontend Lead | Dev2 | +55 11 9xxxx-xxxx | 8h-20h |
| PO | PO | +55 11 9xxxx-xxxx | 8h-18h |

---

## 🎓 Lições Aprendidas (Template)

### Incidente: [Nome]
**Data**: YYYY-MM-DD  
**Duração**: Xh  
**Impacto**: X usuários

**O que aconteceu?**
- Descrição

**Causa raiz**
- Análise

**O que funcionou bem?**
- Pontos positivos

**O que pode melhorar?**
- Ações de melhoria

**Action items**
- [ ] Ação 1
- [ ] Ação 2

---

## ✅ Checklist de Mitigação de Riscos

### Sprint 1-2 (Backend)
- [ ] Testes unitários > 90%
- [ ] Code review obrigatório
- [ ] Validações de negócio
- [ ] Lock otimista implementado

### Sprint 3-4 (Frontend)
- [ ] Validações de formulário
- [ ] Error handling
- [ ] Loading states
- [ ] Testes de componentes

### Sprint 5-6 (Integração)
- [ ] Testes E2E
- [ ] Contratos de API validados
- [ ] Autenticação segura
- [ ] Rate limiting

### Sprint 7 (QA)
- [ ] Testes de carga
- [ ] Testes de segurança
- [ ] Testes de regressão
- [ ] Bugs críticos corrigidos

### Sprint 8 (DevOps)
- [ ] Deploy gradual configurado
- [ ] Rollback automático
- [ ] Backup automático
- [ ] Monitoramento ativo

### Sprint 9 (Monitoramento)
- [ ] Alertas configurados
- [ ] Dashboards criados
- [ ] Runbook documentado
- [ ] On-call definido

### Sprint 10 (Produção)
- [ ] Deploy 100% sem incidentes
- [ ] Métricas estáveis
- [ ] Documentação completa
- [ ] Handover realizado

---

## 📈 Métricas de Sucesso

**Objetivo**: Minimizar impacto dos riscos

| Métrica | Target | Atual |
|---------|--------|-------|
| Incidentes críticos | 0 | - |
| MTTR (Mean Time to Recover) | < 2h | - |
| Uptime | 99.9% | - |
| Bugs em produção | < 5/mês | - |
| Atraso no cronograma | 0 sprints | - |

---

**Versão**: 1.0  
**Última Revisão**: 2024-01-01  
**Próxima Revisão**: Semanal  
**Responsável**: Tech Lead + Scrum Master
