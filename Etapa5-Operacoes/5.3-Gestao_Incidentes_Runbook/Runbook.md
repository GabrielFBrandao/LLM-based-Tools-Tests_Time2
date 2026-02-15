<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>RUNBOOK DE GESTÃO DE INCIDENTES</strong></p>
<p>Sistema de Reserva de Hotel</p>
<p><em>Procedimentos de Resposta a Falhas</em></p></td>
</tr>
</tbody>
</table>

|                      |                                                            |
|----------------------|------------------------------------------------------------|
| Severidade critical  | Resposta em até 15 min --- chama responsável imediatamente |
| Severidade warning   | Investigação no próximo ciclo de trabalho (até 24h)        |
| Alertas documentados | 14 regras em 6 grupos (disponibilidade → infraestrutura)   |
| Stack                | Node.js 22 + PostgreSQL 16 + React/Nginx + Docker Compose  |
| Containers           | hotel-api · hotel-db · hotel-web (/opt/hotel-reservas)     |

**1. Fluxo de Resposta a Incidentes**

Todo incidente percorre cinco fases independentemente da causa raiz. A ordem é fixa --- pular etapas acelera a resolução aparente mas aumenta o risco de reincidência.

|          |                        |                                                                       |
|----------|------------------------|-----------------------------------------------------------------------|
| **Fase** | **Nome**               | **Objetivo**                                                          |
| 1        | Detecção               | Alerta dispara via Prometheus → PagerDuty/Slack                       |
| 2        | Triagem                | Classificar severity, confirmar que não é falso positivo              |
| 3        | Contenção              | Parar o sangramento --- rollback ou restart antes de investigar causa |
| 4        | Investigação           | Correlacionar métricas + logs + trace_id para encontrar causa raiz    |
| 5        | Resolução e Pós-mortem | Corrigir, verificar, documentar, prevenir reincidência                |

|                                                                                                                                                                                                                                    |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| *PRINCÍPIO: Em caso de dúvida entre investigar ou reverter, sempre reverta primeiro. Reverter leva 60 segundos; investigar pode levar horas. O pós-mortem encontra a causa raiz depois que os usuários não estão mais impactados.* |

**2. Triagem Rápida --- Primeiros 5 Minutos**

Ao receber uma notificação, executar nesta ordem antes de qualquer outra ação:

**2.1 Confirmar o incidente (não é falso positivo?)**

> \# 1. Verificar status dos containers
>
> ssh deploy@prod.hotel-reservas.app
>
> cd /opt/hotel-reservas
>
> ./scripts/deploy.sh status
>
> \# 2. Health check manual
>
> curl -s https://hotel-reservas.app/health
>
> \# Esperado: HTTP 200, body: ok
>
> \# 3. Verificar logs recentes (últimos 50 eventos de erro)
>
> docker logs hotel-api \--tail=50 \| grep \'\"level\":\"error\"\'

**2.2 Escalonamento por severity**

|              |                     |                                                                  |
|--------------|---------------------|------------------------------------------------------------------|
| **Severity** | **SLA de resposta** | **Ação imediata**                                                |
| critical     | 15 minutos          | Notificar canal \#incidentes. Abrir incidente. Ir para Seção 3.  |
| warning      | 24 horas            | Registrar no backlog de operações. Investigar na próxima janela. |

**2.3 Comunicação inicial**

> \# Template de mensagem --- canal \#incidentes (Slack)
>
> 🚨 INCIDENTE ABERTO --- Hotel Reservas
>
> Alerta: \<nome do alerta do Prometheus\>
>
> Severity: critical \| warning
>
> Início: \<timestamp do alerta\>
>
> Impacto: \<ex: \'reservas indisponíveis\' \| \'latência elevada\'\>
>
> Responsável: \<seu nome\>
>
> Status: Investigando

**3. Runbooks por Alerta**

Cada seção abaixo corresponde a um alerta definido em alertas.yml. Os comandos referenciam exatamente os containers (hotel-api, hotel-db, hotel-web) e scripts (deploy.sh) do ambiente de produção.

|                                          |
|------------------------------------------|
| **RB-01 --- APIForaDoAr** *\[CRITICAL\]* |

**Condição:** rate(http_requests_total)\[5m\] == 0 por 3 minutos

**Causa provável:** container hotel-api parado, OOM kill, porta 3000 bloqueada, deploy interrompido

**Diagnóstico**

> \# Verificar estado de todos os containers
>
> docker compose ps
>
> \# Se hotel-api estiver \'Exited\' ou ausente:
>
> docker inspect hotel-api \--format=\'{{.State.ExitCode}} {{.State.Error}}\'
>
> \# ExitCode 137 = OOM kill (falta de memória)
>
> \# ExitCode 1 = crash da aplicação
>
> \# Verificar logs do crash
>
> docker logs hotel-api \--tail=100
>
> \# Verificar se o banco está saudável (hotel-api depende do banco)
>
> docker compose ps hotel-db
>
> docker exec hotel-db pg_isready -U hotel_user -d hotel_reservas

**Contenção --- decisão em árvore**

|                                         |                                                               |
|-----------------------------------------|---------------------------------------------------------------|
| **Situação observada**                  | **Ação**                                                      |
| hotel-api Exited após deploy recente    | Rollback imediato: ./scripts/deploy.sh rollback               |
| hotel-api Exited por OOM (ExitCode 137) | Restart + monitorar heap: docker compose restart hotel-api    |
| hotel-db Exited ou unhealthy            | Prioridade: subir o banco primeiro (seção RB-06)              |
| hotel-api rodando mas sem responder     | docker compose restart hotel-api                              |
| Nenhum container Exited                 | Verificar firewall/rede: curl -v http://localhost:3000/health |

**Rollback (deploy recente suspeito)**

> cd /opt/hotel-reservas
>
> ./scripts/deploy.sh rollback
>
> \# Aguarda 15s e valida:
>
> ./scripts/deploy.sh health prod

|                                                                                                                                                      |
|------------------------------------------------------------------------------------------------------------------------------------------------------|
| *VERIFICAÇÃO PÓS-RESOLUÇÃO: rate(http_requests_total)\[5m\] deve retornar \> 0 no Prometheus. Manter monitoramento por 30 minutos após a resolução.* |

|                                                  |
|--------------------------------------------------|
| **RB-02 --- HealthCheckFalhando** *\[CRITICAL\]* |

**Condição:** GET /health retornando status != 2xx por 2 minutos

**Causa provável:** banco inacessível, variável de ambiente ausente, inicialização incompleta

**Diagnóstico**

> \# Testar o endpoint manualmente
>
> curl -sv https://hotel-reservas.app/health
>
> \# Se retornar 500: ver logs para saber qual dependência falhou
>
> \# Ver logs do momento exato da falha
>
> docker logs hotel-api \--since=10m \| grep -E \'\"level\":\"error\"\|error\|Error\'
>
> \# Verificar variáveis de ambiente obrigatórias
>
> docker exec hotel-api env \| grep -E \'DATABASE_URL\|JWT_SECRET\|NODE_ENV\'
>
> \# DATABASE_URL e JWT_SECRET não devem estar vazios
>
> \# Verificar conexão com o banco a partir do container da API
>
> docker exec hotel-api wget -qO- http://hotel-db:5432 2\>&1 \| head -5

**Contenção**

> \# Se variável de ambiente ausente: corrigir .env e restartar
>
> vim /opt/hotel-reservas/.env
>
> docker compose up -d hotel-api
>
> \# Se banco inacessível: ir para RB-06 (BancoDeDadosIndisponivel)
>
> \# Se causa desconhecida: rollback e investigar depois
>
> ./scripts/deploy.sh rollback

|                                                 |
|-------------------------------------------------|
| **RB-03 --- LatenciaElevadaP99** *\[CRITICAL\]* |

**Condição:** quantile(0.99) \> 1 segundo por 5 minutos (SLO violado)

**Causa provável:** GC excessivo, leak de memória, lock no banco, query lenta, carga súbita

**Diagnóstico --- sequência de queries Prometheus**

> \# Qual rota está mais lenta?
>
> histogram_quantile(0.99, sum by(route) (rate(http_request_duration_seconds_bucket\[5m\]))) \* 1000
>
> \# O GC está causando pausas? (\> 100ms/ciclo é problemático)
>
> rate(hotel_node_nodejs_gc_duration_seconds_sum\[5m\])
>
> / rate(hotel_node_nodejs_gc_duration_seconds_count\[5m\]) \* 1000
>
> \# Memória heap está próxima do limite?
>
> hotel_node_nodejs_heap_size_used_bytes / hotel_node_nodejs_heap_size_total_bytes \* 100
>
> \# Operações de banco lentas?
>
> histogram_quantile(0.99, rate(hotel_db_operacao_duration_seconds_bucket\[5m\])) \* 1000

**Contenção por causa raiz**

|                            |                                                                 |
|----------------------------|-----------------------------------------------------------------|
| **Causa identificada**     | **Ação**                                                        |
| Heap \> 80% (OOM iminente) | docker compose restart hotel-api (libera heap imediatamente)    |
| GC \> 100ms/ciclo          | Restart hotel-api + monitorar se se repete (indica leak)        |
| Rota específica lenta      | Logs: filtrar por route=\'/reservas\' + trace_id para ver query |
| Banco lento                | Ver pg_stat_activity no PostgreSQL (seção 4.3)                  |
| Deploy recente             | Rollback: ./scripts/deploy.sh rollback                          |

|                                                  |
|--------------------------------------------------|
| **RB-04 --- ErroInternoServidor** *\[CRITICAL\]* |

**Condição:** taxa de 5xx \> 0.1% por 5 minutos

**Causa provável:** exceção não tratada, integração com banco quebrando, variável ausente em runtime

**Diagnóstico**

> \# Qual rota está retornando 500?
>
> sum by(route) (rate(http_requests_total{status_code=\'500\'}\[5m\]))
>
> \# Filtrar erros nos logs (com trace_id para rastrear a requisição inteira)
>
> docker logs hotel-api \--since=15m \| grep \'\"level\":\"error\"\' \| head -20
>
> \# Pegar um trace_id específico e ver todos os logs daquela requisição
>
> \# Substituir TRACE_ID pelo valor encontrado no log de erro
>
> docker logs hotel-api \--since=30m \| grep \'TRACE_ID\'
>
> \# Verificar error_code mais frequente (indica qual service está falhando)
>
> docker logs hotel-api \--since=15m \\
>
> \| grep \'\"level\":\"error\"\' \\
>
> \| python3 -c \"import sys,json; \[print(json.loads(l).get(\'error_code\',\'\')) for l in sys.stdin\]\" \\
>
> \| sort \| uniq -c \| sort -rn \| head -10

**Contenção**

> \# Se erros começaram após deploy: rollback imediato
>
> ./scripts/deploy.sh rollback
>
> \# Se erros por banco inacessível: ir para RB-06
>
> \# Se erro isolado em endpoint específico: não há rollback simples.
>
> \# Documentar o trace_id, abrir issue, monitorar se a taxa sobe.

|                                                                                                                                                                                                                                  |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| *IMPORTANTE: O campo error_code nos logs distingue erros de negócio (ex: QUARTO_INDISPONIVEL --- esperado) de erros de infraestrutura (ERRO_DESCONHECIDO --- não esperado). Só os segundos são bugs que requerem ação imediata.* |

|                                                        |
|--------------------------------------------------------|
| **RB-05 --- AltaTaxaQuartoIndisponivel** *\[WARNING\]* |

**Condição:** falhas RF18 (QUARTO_INDISPONIVEL) \> 50% das tentativas de reserva por 10 minutos

**Causa provável:** hotel lotado (normal) OU bug de sincronização entre ReservaService e QuartoService (RF15)

**Diagnóstico --- distinguir operacional de bug**

> \# Quantos quartos LIVRES existem agora?
>
> hotel_quartos_por_status{status=\'Livre\'}
>
> \# Se = 0: hotel lotado. Alerta esperado em alta temporada.
>
> \# Se \> 0: possível bug de sincronização.
>
> \# Verificar se há quartos marcados OCUPADO sem reserva ATIVA correspondente
>
> \# (requer query no banco --- seção 4.2)
>
> \# Logs para ver qual quarto está rejeitando reservas repetidamente
>
> docker logs hotel-api \--since=20m \\
>
> \| grep \'QUARTO_INDISPONIVEL\' \\
>
> \| python3 -c \"import sys,json; \[print(json.loads(l).get(\'quartoId\',\'\')) for l in sys.stdin\]\" \\
>
> \| sort \| uniq -c \| sort -rn \| head -5
>
> \# Se um único quartoId aparece muito: estado inconsistente naquele quarto

**Contenção por causa raiz**

|                                            |                                                            |
|--------------------------------------------|------------------------------------------------------------|
| **Causa identificada**                     | **Ação**                                                   |
| Quartos LIVRES = 0 (hotel cheio)           | Operacional: fechar novas reservas na UI. Não é bug.       |
| Quarto OCUPADO sem reserva ATIVA           | Corrigir estado via API: PATCH /quartos/:id/status → LIVRE |
| Bug em RF15 (quarto não voltou para LIVRE) | Rollback. Ver seção 4.2 para reconciliar estado.           |

|                                                       |
|-------------------------------------------------------|
| **RB-06 --- BancoDeDadosIndisponivel** *\[CRITICAL\]* |

**Condição:** erros em hotel_db_operacao_total \> 50% das operações por 3 minutos

**Causa provável:** container hotel-db parado, disco cheio, conexões esgotadas, corrupção de dados

**Diagnóstico**

> \# Estado do container do banco
>
> docker compose ps hotel-db
>
> docker logs hotel-db \--tail=50
>
> \# Verificar espaço em disco (causa frequente de crash do Postgres)
>
> df -h /var/lib/docker
>
> \# Se \> 90% cheio: disco cheio é a causa. Ver Contenção abaixo.
>
> \# Testar conectividade ao banco
>
> docker exec hotel-db pg_isready -U hotel_user -d hotel_reservas
>
> \# Verificar conexões ativas (limite padrão Postgres: 100)
>
> docker exec hotel-db psql -U hotel_user -d hotel_reservas \\
>
> -c \"SELECT count(\*), state FROM pg_stat_activity GROUP BY state;\"

**Contenção por causa raiz**

|                             |                                                                               |
|-----------------------------|-------------------------------------------------------------------------------|
| **Causa identificada**      | **Ação**                                                                      |
| Container Exited            | docker compose restart hotel-db ; sleep 20 ; docker compose restart hotel-api |
| Disco cheio (\> 90%)        | Liberar espaço: docker system prune -f. Verificar logs antigos.               |
| Conexões esgotadas          | SIGTERM nas conexões idle: SELECT pg_terminate_backend(pid)                   |
| Banco não sobe após restart | Verificar integridade: docker exec hotel-db pg_dumpall \--check               |

|                                                                                                                                                                                                        |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| *DADOS: O volume hotel-db-data persiste os dados do PostgreSQL. Um restart do container NÃO apaga dados. Apenas \'docker volume rm hotel-db-data\' apagaria --- nunca executar sem backup confirmado.* |

|                                                              |
|--------------------------------------------------------------|
| **RB-07 --- MemoriaNodeElevada + GCExcessivo** *\[WARNING\]* |

**Condição:** heap_usado/heap_total \> 80% por 10 minutos (ou GC médio \> 100ms/ciclo)

**Causa provável:** memory leak, crescimento de cache sem limite, listeners de evento não removidos

**Diagnóstico**

> \# Tendência de crescimento de heap (está crescendo sem parar?)
>
> \# No Grafana: painel \'Heap Node.js (MB)\' --- verificar se sobe continuamente
>
> \# Uso atual de memória do container
>
> docker stats hotel-api \--no-stream \--format \'{{.MemUsage}} / {{.MemPerc}}\'
>
> \# GC stats (conectar ao processo Node via \--inspect para heap snapshot)
>
> \# ATENÇÃO: \--inspect expõe porta 9229 --- usar apenas em janela de manutenção
>
> docker exec hotel-api node \--v8-options \| grep heap

**Contenção**

> \# Restart imediato se heap \> 90% (evitar OOM kill pelo sistema)
>
> docker compose restart hotel-api
>
> \# Se o problema se repete após cada restart (leak confirmado):
>
> \# 1. Abrir issue com priority:high
>
> \# 2. Configurar restart automático como paliativo:
>
> \# Em docker-compose.yml, hotel-api já tem restart: unless-stopped
>
> \# Adicionar healthcheck de memória se necessário

|                                                                               |
|-------------------------------------------------------------------------------|
| **RB-08 --- HotelPraticamenteEsgotado + AltaManutencaoQuartos** *\[WARNING\]* |

**Condição 1:** quartos_livres/total \< 5% por 30 minutos

**Condição 2:** quartos em manutenção/total \> 30% por 60 minutos

Esses alertas são operacionais, não de infraestrutura. A resposta envolve a equipe de operações do hotel, não apenas engenharia.

**Resposta**

- HotelPraticamenteEsgotado: verificar se quartos em Manutenção ou Limpeza podem ser liberados. Comunicar equipe de recepção para suspender novos cadastros se necessário.

- AltaManutencaoQuartos: verificar com a equipe de manutenção se há quartos que podem voltar para LIVRE. Se for acidental (bug no alterarStatus), corrigir via API.

- Verificar no Grafana o painel \'Distribuição de Quartos por Status\' para ver a proporção atual.

- Verificar se há quartos em Manutenção há mais de 24h sem atualização (possível estado preso).

**4. Procedimentos Especiais**

**4.1 Rollback de Deploy**

O rollback é a ação mais rápida disponível quando um deploy causa regressão. O script deploy.sh mantém um backup do docker-compose.yml anterior.

> \# ROLLBACK PADRÃO --- restaura versão anterior
>
> ssh deploy@prod.hotel-reservas.app
>
> cd /opt/hotel-reservas
>
> ./scripts/deploy.sh rollback
>
> \# Aguarda 10s e exibe: docker compose ps
>
> \# Verificar que a versão anterior está rodando
>
> ./scripts/deploy.sh health prod
>
> \# Rollback para versão específica (se backup não está disponível)
>
> ./scripts/deploy.sh deploy prod v1.2.2
>
> \# Requer confirmação interativa: digitar \'sim\'

|                                                                                                                                                                                                                   |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| *O rollback automático no pipeline (if: failure() no deploy-production) executa os mesmos comandos. Se o health check pós-deploy falhar, ele restaura o backup sem intervenção humana e envia notificação Slack.* |

**4.2 Reconciliação de Estado --- Quarto OCUPADO sem Reserva ATIVA**

O fluxo RF15 (quarto → OCUPADO ao criar reserva) e RF17 (quarto → LIVRE ao cancelar) são sequenciais. Em caso de falha parcial, o quarto pode ficar OCUPADO sem reserva ATIVA correspondente. Para diagnosticar e corrigir:

> \# 1. Identificar inconsistências
>
> \# Quartos OCUPADO que não têm reserva ATIVA associada:
>
> docker exec hotel-db psql -U hotel_user -d hotel_reservas -c \"
>
> SELECT q.id, q.numero, q.status
>
> FROM quartos q
>
> WHERE q.status = \'Ocupado\'
>
> AND NOT EXISTS (
>
> SELECT 1 FROM reservas r
>
> WHERE r.quarto_id = q.id AND r.status = \'Ativa\'
>
> );\"
>
> \# 2. Para cada quarto inconsistente, corrigir via API
>
> curl -X PATCH https://hotel-reservas.app/api/quartos/\<quartoId\>/status \\
>
> -H \'Authorization: Bearer \<JWT_ADMIN\>\' \\
>
> -H \'Content-Type: application/json\' \\
>
> -d \'{\"status\": \"Livre\"}\'
>
> \# 3. Verificar no Prometheus após correção
>
> \# hotel_quartos_por_status deve refletir o novo estado

**4.3 Investigação de Query Lenta no Banco**

Quando o alerta LatenciaElevadaP99 aponta operações de banco como causa raiz:

> \# Queries mais lentas em execução agora
>
> docker exec hotel-db psql -U hotel_user -d hotel_reservas -c \"
>
> SELECT pid, now() - query_start AS duracao,
>
> state, query
>
> FROM pg_stat_activity
>
> WHERE state != \'idle\'
>
> ORDER BY duracao DESC
>
> LIMIT 10;\"
>
> \# Locks bloqueando queries
>
> docker exec hotel-db psql -U hotel_user -d hotel_reservas -c \"
>
> SELECT blocked.pid, blocked.query,
>
> blocking.pid AS blocking_pid, blocking.query AS blocking_query
>
> FROM pg_stat_activity blocked
>
> JOIN pg_stat_activity blocking
>
> ON blocking.pid = ANY(pg_blocking_pids(blocked.pid))
>
> WHERE cardinality(pg_blocking_pids(blocked.pid)) \> 0;\"
>
> \# Se houver lock: terminar processo bloqueante (com cuidado)
>
> docker exec hotel-db psql -U hotel_user -d hotel_reservas \\
>
> -c \"SELECT pg_terminate_backend(\<blocking_pid\>);\"

**4.4 Investigar uma Requisição pelo trace_id**

Quando um usuário reporta erro em uma operação específica e você tem o trace_id (presente no header X-Trace-Id da resposta HTTP):

> \# Filtrar todos os logs de uma requisição específica
>
> TRACE=\'a1b2c3d4e5f6g7h8\' \# substituir pelo trace_id real
>
> docker logs hotel-api \--since=2h \\
>
> \| grep \"\\trace_id\\:\\\$TRACE\\\" \\
>
> \| python3 -c \"
>
> import sys, json
>
> for line in sys.stdin:
>
> try:
>
> e = json.loads(line)
>
> print(f\"{e\[\'timestamp\'\]} \[{e\[\'level\'\].upper()}\] {e\[\'service\'\]} --- {e\[\'message\'\]}\")
>
> for k in \[\'duration_ms\',\'error_code\',\'error_message\',\'quartoId\',\'hospedeId\',\'reservaId\'\]:
>
> if k in e: print(f\' {k}: {e\[k\]}\')
>
> except: pass
>
> \"

|                                                                                                                                                                                                      |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| *A saída mostra a cadeia completa: entrada HTTP → serviço chamado → resultado → duração. Com isso é possível identificar exatamente em qual etapa a requisição falhou e qual error_code foi gerado.* |

**5. Pós-Mortem --- Documentação Pós-Incidente**

Todo incidente critical deve ter um pós-mortem escrito em até 48h. O objetivo não é atribuir culpa, mas aprender e prevenir recorrência. Usar o template abaixo:

|                     |                                                                                   |
|---------------------|-----------------------------------------------------------------------------------|
| **Seção**           | **Conteúdo esperado**                                                             |
| Data e duração      | Ex: 15/02/2025, 14:32 --- 15:10 (38 min)                                          |
| Alerta disparado    | Nome exato do alerta Prometheus (ex: APIForaDoAr)                                 |
| Impacto             | Quantas requisições afetadas, quais operações, impacto para usuários              |
| Linha do tempo      | Hora a hora: alerta → triagem → contenção → resolução                             |
| Causa raiz          | O que exatamente causou (ex: deploy v1.3.1 introduziu memory leak)                |
| Causa raiz profunda | Por que a causa raiz existia? (ex: falta de teste de carga, threshold incorrecto) |
| O que funcionou     | O que no processo de resposta foi eficiente                                       |
| O que pode melhorar | Lacunas no runbook, ferramentas ausentes, alertas que não dispararam              |
| Ações corretivas    | Issue \#X: adicionar teste, Issue \#Y: ajustar threshold                          |

|                                                                                                                                                                                                |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| *CULTURA BLAMELESS: Pós-mortems eficazes focam em sistemas e processos, não em pessoas. A pergunta certa é \'o que no nosso sistema permitiu que isso acontecesse?\' --- não \'quem errou?\'.* |

**6. Referência Rápida --- Comandos Frequentes**

**6.1 Status e saúde**

> ./scripts/deploy.sh status \# containers + uso de recursos
>
> ./scripts/deploy.sh health prod \# health check com retry
>
> curl https://hotel-reservas.app/health
>
> docker compose ps \# estado de cada container
>
> docker stats \--no-stream \# CPU e memória em tempo real

**6.2 Logs**

> docker logs hotel-api \--tail=50 -f \# seguir logs ao vivo
>
> docker logs hotel-api \--since=30m \# últimos 30 minutos
>
> docker logs hotel-api \| grep \'\"level\":\"error\"\' \# apenas erros
>
> docker logs hotel-db \--tail=50 \# logs do banco

**6.3 Contenção rápida**

> ./scripts/deploy.sh rollback \# versão anterior
>
> docker compose restart hotel-api \# restart da API
>
> docker compose restart hotel-db \# restart do banco
>
> docker compose up -d \# recriar containers mortos
>
> docker compose down && docker compose up -d \# reset completo

**6.4 Queries Prometheus de triagem imediata**

|                     |                                                                                          |
|---------------------|------------------------------------------------------------------------------------------|
| **O que verificar** | **Query**                                                                                |
| API respondendo?    | rate(http_requests_total\[5m\]) \> 0                                                     |
| Taxa de erros 5xx   | rate(http_requests_total{status_code=\~\'5..\'}\[5m\]) / rate(http_requests_total\[5m\]) |
| Latência p95 atual  | histogram_quantile(0.95, rate(http_request_duration_seconds_bucket\[5m\]))               |
| Reservas ativas     | hotel_reservas_ativas_atual                                                              |
| Quartos livres      | hotel_quartos_por_status{status=\'Livre\'}                                               |
| Heap Node.js %      | hotel_node_nodejs_heap_size_used_bytes / hotel_node_nodejs_heap_size_total_bytes \* 100  |

**6.5 Contatos e escalação**

|                       |                                              |                                    |
|-----------------------|----------------------------------------------|------------------------------------|
| **Papel**             | **Responsabilidade**                         | **Quando acionar**                 |
| Engenheiro de Plantão | Resposta inicial a alertas critical          | Imediatamente ao receber alerta    |
| Tech Lead Backend     | Decisões de arquitetura, rollback não-padrão | Se contenção não resolver em 30min |
| DBA / Infra           | Problemas de banco, disco, rede              | Alertas BancoDeDadosIndisponivel   |
| Product Owner         | Comunicação com usuários afetados            | Incidentes com duração \> 15min    |
