# Plano de Projeto

Horizonte: 4 sprints (2 semanas cada) = 8 semanas totais

Metodologia: Scrum (iterações fixas, backlog priorizado, dailies, reviews e retros a cada sprint)

## Cronograma por Sprints

Sprint 1 (Semanas 1-2)
- Refinamento do backlog inicial e arquitetura base
- Implementação Stack1 (módulos iniciais): entidades/quartos, casos de uso principais
- Protótipo frontend para cadastro/listagem de quartos
- Ambiente de dev e CI básicos (lint, build)

Sprint 2 (Semanas 3-4)
- Ampliação de funcionalidades: hóspedes e reservas (casos de uso nucleares)
- Integração frontend ↔ backend (fluxos principais)
- Testes unitários abrangentes (quartos/hóspedes/reservas)
- Estruturar logs básicos e métricas iniciais

Sprint 3 (Semanas 5-6)
- Testes de integração e e2e básicos (fluxos críticos)
- Hardening de segurança (auth básica/roles, validações)
- Preparação de deploy: Docker, Compose/Kubernetes (staging)
- Observabilidade: métricas/alertas/dashboards iniciais

Sprint 4 (Semanas 7-8)
- Performance tuning (pontos quentes)
- Preparação para release (prod): CI/CD com gates, rollback
- Testes de aceitação e estabilização (bugfix)
- Documentação final e handover

## Estimativas (story points ou horas)
- Sprint capacity (exemplo): 40 pontos/sprint (time de 4 devs, 10 pts/dev) ou ~160h/sprint (4 devs × 40h)
- Macro-estimativas por épico (pontos):
  - Domínio quartos (entidades, casos de uso, repo memória + persistência simples): 20-25 pts
  - Hóspedes (domínio + casos de uso + validações VO): 13-20 pts
  - Reservas (regras, disponibilidade, conflitos, cálculo valores): 21-34 pts
  - Frontend CRUDs (quartos/hóspedes/reservas): 21-34 pts
  - Testes (unit, integração, e2e smoke): 21-34 pts
  - DevOps (Docker, CI/CD, observabilidade, ambientes): 13-21 pts
  - Segurança (auth básica/roles, validações extras): 8-13 pts

Observações de estimativa
- Usar Planning Poker por squad para afinar.
- Considerar dependências e riscos (buffers ~15%).
- Reavaliar ao final de cada sprint com base nos dados reais (velocidade).
