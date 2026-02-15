# 7.2 - Gestão de Riscos (Técnicos e Gerenciais)

## Prompt Enviado
> Agora, para gestão de riscos:
> * Liste os riscos técnicos e gerenciais com planos de mitigação desse plano.

---

## Resposta da IA: Registro de Riscos

**Sistema de Reserva de Hotel — Riscos técnicos e gerenciais (evidências extraídas do código)** 

* 🔴 **Críticos (Prob. Alto × Impacto Alto):** RT-01, RT-02, RG-01 
* 🟠 **Altos:** RT-03, RT-04, RT-06, RG-02 
* 🟡 **Médios:** RT-05, RT-07, RT-08, RT-09, RT-10, RG-03, RG-04, RG-05 
* 🟢 **Baixos:** RT-11, RG-06 

### 1. Matriz de Riscos
Probabilidade e impacto avaliados em escala Baixo / Médio / Alto. Prioridade = combinação das duas dimensões. Evidências extraídas diretamente dos artefatos do projeto.

| ID | Tipo | Risco | Prob. | Impacto | Prioridade | Sprint(s) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **RT-01** | T | Inconsistência quarto↔reserva em falha parcial | Alto | Alto | 🔴 CRÍTICA | S4 → S11  |
| **RT-02** | T | Persistência em memória: perda total no restart | Alto | Alto | 🔴 CRÍTICA | S0 → S11  |
| **RT-03** | T | `/metrics` exposto sem autenticação em produção | Médio | Alto | 🟠 ALTA | S7 → S15  |
| **RT-04** | T | S11 com 52 SP — 1,7 σ acima da média histórica | Alto | Alto | 🟠 ALTA | S11  |
| **RT-05** | T | Cardinalidade Prometheus por rota não normalizada | Baixo | Alto | 🟡 MÉDIA | S7 → Prod  |
| **RT-06** | T | JWT ausente: autenticação ainda não implementada | Médio | Alto | 🟠 ALTA | S10  |
| **RT-07** | T | Rollback depende de um único arquivo de backup | Médio | Médio | 🟡 MÉDIA | S6 → Prod  |
| **RT-08** | T | Testes E2E Playwright: flakiness em CI | Alto | Médio | 🟡 MÉDIA | S14  |
| **RT-09** | T | LGPD: dados pessoais parcialmente expostos em logs | Médio | Médio | 🟡 MÉDIA | S7 → S15  |
| **RT-10** | T | Ações do CI sem SHA fixada (supply-chain risk) | Baixo | Médio | 🟡 MÉDIA | S6 → Prod  |
| **RT-11** | T | Rate limiting ausente antes de S10 | Baixo | Baixo | 🟢 BAIXA | S0 → S10  |
| **RG-01** | G | Bus factor 1: único desenvolvedor no projeto | Alto | Alto | 🔴 CRÍTICA | S0 – S15  |
| **RG-02** | G | Scope creep: features além do escopo v1.0 | Médio | Alto | 🟠 ALTA | S10 – S13  |
| **RG-03** | G | Débito técnico acumulado sem revisão periódica | Médio | Médio | 🟡 MÉDIA | S10 – S15  |
| **RG-04** | G | Aprovador de prod indisponível bloqueia deploy | Baixo | Médio | 🟡 MÉDIA | S6 → Prod  |
| **RG-05** | G | Ambiente de prod não provisionado até S15 | Médio | Médio | 🟡 MÉDIA | S15  |
| **RG-06** | G | Cobertura de testes abaixo de 90% no frontend | Baixo | Baixo | 🟢 BAIXA | S12 – S14  |

---

### 2. Riscos Técnicos (Detalhes e Mitigações)

#### 2.1 Riscos Críticos

**RT-01 — Inconsistência de Estado Quarto↔Reserva em Falha Parcial** 
* **Evidência:** `service.integration.ts L148–150`: «Em produção, criar reserva + mudar status do quarto seria uma transação atômica (ADR-007). Aqui os dois passos estão sequenciais.» 
* **Contexto:** O método executa dois passos sequenciais sem transação. Se a segunda falhar, a reserva existe mas o quarto permanece LIVRE, violando RF18. O problema se torna ativo em S11 com o PostgreSQL.
* **Mitigação:** S11: envolver ambas as operações em `prisma.$transaction()`. Adicionar teste de integração lançando erro no segundo `await`.
* **Contingência:** Executar o script de reconciliação do runbook (menos de 5 minutos, sem downtime).

**RT-02 — Persistência em Memória: Perda Total de Dados no Restart** 
* **Evidência:** `repository.ts L30–38`: `QuartoRepositoryMemoria` usa `Map<string, Quarto>`. Reiniciar o processo apaga integralmente os dados.
* **Mitigação:** Documentar no README que o ambiente antes de S11 é efêmero. S11: script de seed (`DB-02`) para reinserir dados automaticamente. A substituição por Prisma elimina o risco.
* **Contingência:** Re-executar `npm run seed`. Documentar o seed como etapa obrigatória do onboarding.

#### 2.2 Riscos Altos

**RT-03 — Endpoint `/metrics` Exposto Publicamente Sem Autenticação** 
* **Evidência:** `middleware.ts L144–148` documenta que a rota não deve ser pública em produção.
* **Mitigação:** Antes de S15: adicionar ao `nginx.conf` diretiva retornando 403 para IPs externos. Adicionar Bearer token no `metricsHandler` usando a variável `METRICS_TOKEN`. Teste automatizado no CI/CD validando o 403/401.
* **Contingência:** Alteração de 3 linhas no `nginx.conf` via hotfix.

**RT-04 — Sprint S11 com 52 SP — 1,7 Desvios-Padrão Acima da Média** 
* **Evidência:** Média histórica S0–S9: 39,2 SP. S11 planejada: 52 SP. Contém 7 histórias com dependência em cadeia.
* **Mitigação:** Realizar um *spike* de 1–2 dias antes da S11 para validar schema e conexão. Se arriscado, dividir S11 em duas sprints. Usar `testcontainers` nos testes em vez de docker-compose manual.
* **Contingência:** Cortar `DB-07` (connection pooling) para a sprint seguinte.

**RT-06 — JWT Não Implementado — Autenticação Ausente é Bloqueante para S10** 
* **Evidência:** `docker-compose.yml L69` exige `JWT_SECRET`, mas não há auth no código. História `API-05` concorre com controllers na S10.
* **Mitigação:** Implementar `API-05` como primeira história de S10. Decidir estratégia antes da sprint (HS256 vs RS256) e registrar em ADR. Usar biblioteca estabelecida (jose ou jsonwebtoken).
* **Contingência:** Implementar rotas em staging com `AUTH_DISABLED=true` (removido obrigatoriamente antes do go-live).

#### 2.3 Riscos Médios
* **RT-05 — Explosão de Cardinalidade no Prometheus:** Usar `req.route.path` em S10 em vez de normalização por regex. Se detectado em prod, remover label `route` via relabeling no Prometheus.
* **RT-07 — Rollback Depende de Um Único Arquivo de Backup:** Versionar backups com sufixo de timestamp e manter a tag Docker da versão anterior no GHCR.
* **RT-08 — Testes E2E Playwright Flakiness em CI:** Usar `data-testid` , configurar `retries: 2` para CI  e isolar testes instáveis com tag `@quarantine`.
* **RT-09 — LGPD: Dados Pessoais Parcialmente Expostos em Logs:** Adicionar sanitização automática no `logger.ts` para ofuscar recursivamente CPF/Email. Configurar `LOG_LEVEL=info` em staging/prod.

#### 2.4 Riscos Baixos
| ID | Risco | Mitigação | Contingência |
| :--- | :--- | :--- | :--- |
| **RT-10** | Ações do CI sem SHA fixada (supply-chain attack) | Fixar cada action com hash. Usar Renovate Bot para atualizar.  | Reverter para SHA anterior no `ci-cd.yml`.  |
| **RT-11** | Rate limiting ausente antes de S10 | Implementar `express-rate-limit` como primeira história de S10.  | Adicionar `limit_req_zone` no Nginx.  |

---

### 3. Riscos Gerenciais

**RG-01 — Bus Factor 1 — Projeto Depende de Um Único Desenvolvedor [CRÍTICO]** 
* **Evidência:** Todo conhecimento reside em uma pessoa. Falta paralisa S11 ou S15.
* **Mitigação:** Documentação como código. Gravar screencast de 20-30 min ao fim de cada sprint. README executável em menos de 30 min.
* **Contingência:** (1) congelar novas features; (2) onboarding acelerado de dev externo; (3) entregar apenas o mínimo já funcional.

**RG-02 — Scope Creep: Features Além do Escopo v1.0 [ALTO]** 
* **Evidência:** Demanda por precificação dinâmica ou multi-tenant durante S10 atrasa go-live.
* **Mitigação:** Linha explícita entre escopo da v1.0 e Backlog Futuro na planilha. Revisar DoD para impedir inserções sem justificativa.
* **Contingência:** Aplicar MoSCoW imediatamente na sprint; descartar itens *Could/Won't*.

**Demais Riscos Gerenciais:**
* **RG-03 — Débito técnico acumulado:** Reservar 10-15% da capacidade para refatoração. Nunca acumular mais de 2 sprints sem revisão.
* **RG-04 — Aprovador de prod indisponível:** Documentar critério de *break-glass* (deploy via script direto com post-mortem obrigatório).
* **RG-05 — Ambiente não provisionado:** Iniciar provisionamento de DNS e SSL na S13, não na S15, para evitar latência de propagação.
* **RG-06 — Cobertura de testes cai < 90% (React):** Separar thresholds no Jest (Backend > 90% bloqueante, Frontend > 70% não bloqueante).

---

### 4. Monitoramento Contínuo
A revisão de riscos está integrada ao pipeline de CI e ao Grafana:

| Risco | Sinal de Materialização | Como Monitorar | Frequência |
| :--- | :--- | :--- | :--- |
| **RT-01** | Quarto OCUPADO sem reserva ATIVA | Query reconciliação + alerta BD | Semanal  |
| **RT-03** | `/metrics` retorna 200 sem credencial | `curl` no pipeline de staging | Pré-go-live  |
| **RT-04** | SP consumido S11 > 60% na semana 1 | Burndown diário da aba SP | Diário (S11)  |
| **RT-08** | > 2 falhas E2E não determinísticas | GitHub Actions: histórico de runs | Semanal (S14+)  |
| **RG-01** | Sprint sem screencast/ADRs | Checklist do DoD na sprint | Por sprint  |
| **RG-03** | Cobertura de testes caindo | `jest --coverage` no CI (badge) | Por PR  |