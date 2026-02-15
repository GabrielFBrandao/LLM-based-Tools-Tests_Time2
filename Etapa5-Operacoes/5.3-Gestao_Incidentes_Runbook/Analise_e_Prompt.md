# 5.3 - Gestão de Incidentes (Runbook)

## Prompt Enviado
> Agora, para a gestão de incidentes desse sistema, descreva um procedimento de resposta a falhas (runbook).

---

## Análise da Resposta

### Comportamento da Ferramenta
A ferramenta forneceu um documento executável de SRE (Site Reliability Engineering) totalmente ancorado na arquitetura que ela mesma construiu nas etapas anteriores (Node.js, Postgres, Docker). Não foi gerada uma lista genérica, mas sim comandos exatos de terminal (`docker logs`, `curl`, scripts `.sh`) e banco de dados.

### Decisões Técnicas de Destaque
1. **Priorização da Contenção:** A IA enfatizou que a "contenção vem antes da investigação", uma regra de ouro em operações de TI para minimizar o tempo de inatividade (MTTR - Mean Time To Recovery).
2. **Troubleshooting Avançado:** Forneceu queries SQL complexas (ex: como identificar Deadlocks/Locks no Postgres via `pg_stat_activity`) e comandos de Node.js (analisar OOM Kill / ExitCode 137 no Docker).
3. **Reconciliação de Estado:** Conectou o runbook a um possível bug na lógica de negócio (RF15 - Etapa 3), ensinando como fazer uma auditoria no banco para encontrar quartos "Ocupados" sem "Reserva Ativa" correspondente.
4. **Cultura Organizacional:** A inclusão da matriz de escalonamento (quem chamar e quando) e o foco na Cultura *Blameless* (sem culpa) para a redação dos relatórios *Post-mortem* demonstra que a IA entende não apenas de código, mas das metodologias de gestão de times de tecnologia.