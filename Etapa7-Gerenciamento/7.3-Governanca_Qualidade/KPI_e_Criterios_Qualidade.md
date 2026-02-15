<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>GOVERNANÇA E QUALIDADE</strong></p>
<p>Sistema de Reserva de Hotel</p>
<p><em>KPIs e critérios de qualidade derivados dos sistemas de observabilidade implementados</em></p></td>
</tr>
</tbody>
</table>

|                               |                                                          |
|-------------------------------|----------------------------------------------------------|
| KPIs de Confiabilidade (SLOs) | 3 indicadores --- Prometheus + alertas.yml               |
| KPIs de Performance           | 4 indicadores --- Histogram httpRequestDurationSeconds   |
| KPIs de Qualidade de Código   | 5 indicadores --- Jest + ESLint + TypeScript + npm audit |
| KPIs de Processo              | 5 indicadores --- Burndown + GitHub Actions              |
| KPIs de Negócio               | 4 indicadores --- métricas de domínio instrumentadas     |
| Definition of Done            | Critérios por PR, por Sprint e para Go-Live              |

**1. Princípios de Governança**

Cada KPI deste documento é derivado de um artefato já existente no projeto --- uma métrica Prometheus instrumentada, uma regra de alerta em alertas.yml, um arquivo de teste executável ou uma gate do pipeline de CI. Nenhuma métrica foi definida sem uma fonte de coleta identificada.

- Mensurável agora: se a métrica não pode ser coletada hoje com os sistemas existentes (Prometheus, Jest, GitHub Actions), ela não está neste documento. Está no backlog como infraestrutura de medição.

- Acionável: cada KPI tem um threshold que, quando violado, dispara uma ação específica. Métricas sem consequência definida são decorativas.

- Mínimo necessário: 21 KPIs em 5 categorias. Mais do que isso seria overhead de monitoramento sem ganho proporcional de visibilidade.

- Não duplicado: os thresholds aqui documentados são os mesmos que já existem nos alertas Prometheus --- não há duas definições do mesmo SLO em lugares diferentes.

**1.1 Sumário de Thresholds**

|         |                            |               |                  |                 |                   |
|---------|----------------------------|---------------|------------------|-----------------|-------------------|
| **ID**  | **KPI**                    | **🟢 Meta**   | **🟡 Atenção**   | **🔴 Crítico**  | **Fonte**         |
| **K01** | Disponibilidade            | ≥ 99,5% / 30d | 99,0--99,4%      | \< 99,0%        | Prometheus        |
| **K02** | Taxa de erros 5xx          | \< 0,1%       | 0,1--0,5%        | \> 0,5%         | Prometheus        |
| **K03** | Saúde do banco             | 0 erros/5min  | 1--5% erros      | \> 5% erros     | Prometheus        |
| **K04** | Latência p95 global        | \< 500ms      | 500ms--1s        | \> 1s           | Prometheus        |
| **K05** | Latência p99 global        | \< 1s         | 1s--2s           | \> 2s           | Prometheus        |
| **K06** | p95 criarReserva           | \< 200ms      | 200--500ms       | \> 500ms        | Prometheus        |
| **K07** | Heap Node.js               | \< 70%        | 70--80%          | \> 80%          | Prometheus        |
| **K08** | Cobertura backend          | ≥ 90%         | 85--89%          | \< 85%          | Jest              |
| **K09** | Erros TypeScript           | 0             | ---              | ≥ 1             | tsc \--noEmit     |
| **K10** | Avisos ESLint              | 0             | ---              | ≥ 1             | ESLint            |
| **K11** | Taxa de sucesso dos testes | 100%          | 98--99% (E2E)    | \< 98%          | Jest              |
| **K12** | Vulner. npm alta/crítica   | 0             | ---              | ≥ 1             | npm audit         |
| **K13** | Velocidade do sprint       | 35--45 SP     | 28--34 ou 46--52 | \> 52 ou \< 28  | Burndown          |
| **K14** | Tempo de pipeline CI       | \< 8 min      | 8--12 min        | \> 12 min       | GitHub Actions    |
| **K15** | Desvio de estimativa       | ≤ 10%         | 11--20%          | \> 20%          | Burndown          |
| **K16** | Taxa de sucesso de deploy  | 100%          | ---              | \< 100%         | deploy.sh         |
| **K17** | Rastreabilidade RF↔Teste   | 100% RF       | ---              | \< 100%         | Planilha          |
| **K18** | Taxa de ocupação           | 30--85%       | 85--94%          | ≥ 95% ou \< 10% | Prometheus        |
| **K19** | Falha RF18 (indisponível)  | \< 30%        | 30--50%          | \> 50%          | Prometheus        |
| **K20** | Taxa de cancelamento       | \< 15%        | 15--25%          | \> 25%          | Prometheus        |
| **K21** | ERRO_DESCONHECIDO / hora   | 0             | ---              | ≥ 1             | Prometheus + Loki |

**2. KPIs de Confiabilidade (SLOs)**

Os três SLOs abaixo são os mesmos thresholds que definem os alertas ativos em alertas.yml. Não há duas definições do mesmo SLO --- o Prometheus é a fonte de verdade.

|                                                                                      |
|--------------------------------------------------------------------------------------|
| **📡 K01 --- Disponibilidade do Serviço** *--- SLO principal --- ≥ 99,5% em 30 dias* |

|                      |                                                                                                                                           |
|----------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| **Definição**        | % de tempo em que a API responde requisições sem erro em qualquer janela de 30 dias. Equivalência: 99,5% = ≤ 3h 39min de downtime/mês.    |
| **Fonte**            | Alerta APIForaDoAr: rate(http_requests_total)\[5m\] == 0 por 3 min. Complementar: HealthCheckFalhando detecta /health retornando não-2xx. |
| **Coleta**           | Prometheus (scrape a cada 15s) → painel \'Uptime (últimas 24h)\' no dashboard Grafana (linha 1).                                          |
| **Ação --- Atenção** | Investigar causa de degradação: logs via trace_id, alerta Grafana → Slack.                                                                |
| **Ação --- Crítico** | Iniciar RB-01 do runbook imediatamente. Se downtime coincide com deploy: deploy.sh rollback.                                              |

|                   |                             |                                  |
|-------------------|-----------------------------|----------------------------------|
| **🟢 Aceitável**  | **🟡 Atenção**              | **🔴 Crítico**                   |
| ≥ 99,5% / 30 dias | 99,0% -- 99,4% (degradação) | \< 99,0% → \> 7h de downtime/mês |

|            |                                                                                                            |
|------------|------------------------------------------------------------------------------------------------------------|
| **PromQL** | 1 - (sum(rate(http_requests_total{status_code=\~\"5..\"}\[30d\])) / sum(rate(http_requests_total\[30d\]))) |

|                                                                                     |
|-------------------------------------------------------------------------------------|
| **❌ K02 --- Taxa de Erros 5xx** *--- SLO de integridade das respostas --- \< 0,1%* |

|                                    |                                                                                                                                                        |
|------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Definição**                      | Proporção de requisições HTTP com status 5xx sobre o total, em janela de 5 minutos. Erros 4xx são excluídos --- são erros de cliente, não do servidor. |
| **Fonte**                          | Alerta ErroInternoServidor (alertas.yml): taxa 5xx \> 0,001 por 5 min. Métrica httpRequestsTotal com label status_code (metrics.ts L59).               |
| **Distinção de ERRO_DESCONHECIDO** | 5xx causados por bugs não tratados (K21) vs. crashes de infra são separáveis pelo label error_code nos logs.                                           |
| **Ação --- Crítico**               | Buscar trace_id do erro nos logs Loki. Se regressão de código: rollback. Se infra: RB-06 (banco) ou RB-01 (API).                                       |

|                         |                |                                            |
|-------------------------|----------------|--------------------------------------------|
| **🟢 Aceitável**        | **🟡 Atenção** | **🔴 Crítico**                             |
| \< 0,1% das requisições | 0,1% -- 0,5%   | \> 0,5% (alerta ErroInternoServidor ativo) |

|            |                                                                                                 |
|------------|-------------------------------------------------------------------------------------------------|
| **PromQL** | rate(http_requests_total{status_code=\~\"5..\"}\[5m\]) / rate(http_requests_total\[5m\]) \* 100 |

|                                                                                                   |
|---------------------------------------------------------------------------------------------------|
| **🗄️ K03 --- Saúde do Banco de Dados** *--- Taxa de erro em operações de persistência --- 0/5min* |

|                        |                                                                                                                                                            |
|------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Definição**          | Proporção de operações de banco (SELECT/INSERT/UPDATE via dbOperacaoTotal, metrics.ts L167) que resultam em erro.                                          |
| **Fonte**              | Alerta BancoDeDadosIndisponivel: erro \> 50% por 3 min. K03 é o indicador precoce de K01/K02 --- degradação no banco normalmente precede downtime da API.  |
| **Relevância pré-S11** | Atualmente com repositórios em memória, K03 mede falhas de lógica nos repositórios. A partir de S11 (Prisma), mede falhas reais de conexão com PostgreSQL. |
| **Ação --- Crítico**   | Verificar health do container hotel-db: docker compose ps. Verificar logs: docker logs hotel-db. Iniciar RB-06 do runbook.                                 |

|                                     |                                 |                                               |
|-------------------------------------|---------------------------------|-----------------------------------------------|
| **🟢 Aceitável**                    | **🟡 Atenção**                  | **🔴 Crítico**                                |
| 0 erros em qualquer janela de 5 min | 1% -- 5% das operações com erro | \> 5% (alerta BancoDeDadosIndisponivel ativo) |

**3. KPIs de Performance**

Derivados do Histogram httpRequestDurationSeconds (metrics.ts L75) com buckets \[0.005, 0.01, 0.05, 0.1, 0.2, 0.5, 1, 2, 5\]. Os thresholds espelham exatamente os alertas LatenciaElevadaP95 e LatenciaElevadaP99.

|                                                                         |
|-------------------------------------------------------------------------|
| **⏱ K04 --- Latência p95 Global** *--- SLO de experiência --- \< 500ms* |

|                      |                                                                                                                                                              |
|----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Definição**        | 95% das requisições HTTP são respondidas em menos de Xms. O p95 exclui os 5% mais lentos --- representa a experiência da grande maioria dos usuários finais. |
| **Fonte**            | Alerta LatenciaElevadaP95: histogram_quantile(0.95, \...) \> 0.5 por 5 min. Painel \'Latência p95\' no Grafana (linha 2).                                    |
| **Observação S11+**  | Consultas ao PostgreSQL sem índice adequado podem elevar o p95 acima de 500ms. Os índices únicos em numero e cpf (DB-01) cobrem as buscas mais frequentes.   |
| **Ação --- Atenção** | Verificar painel \'Latência por Rota (p95)\' no Grafana --- identificar qual rota está degradando.                                                           |

|                  |                            |                         |
|------------------|----------------------------|-------------------------|
| **🟢 Aceitável** | **🟡 Atenção**             | **🔴 Crítico**          |
| \< 500ms         | 500ms -- 1s (alerta ativo) | \> 1s (violação de SLO) |

|            |                                                                                                   |
|------------|---------------------------------------------------------------------------------------------------|
| **PromQL** | histogram_quantile(0.95, sum by(route)(rate(http_request_duration_seconds_bucket\[5m\]))) \* 1000 |

|                                                                |
|----------------------------------------------------------------|
| **⏱ K05 --- Latência p99 Global** *--- Tail latency --- \< 1s* |

|                        |                                                                                                                                  |
|------------------------|----------------------------------------------------------------------------------------------------------------------------------|
| **Definição**          | 99% das requisições são respondidas em menos de Xms. O p99 captura os casos extremos: timeouts, queries lentas, GC pauses.       |
| **Fonte**              | Alerta LatenciaElevadaP99: histogram_quantile(0.99, \...) \> 1.0 por 5 min. Painel \'Latência HTTP --- p50/p95/p99\' no Grafana. |
| **Correlação com K07** | p99 elevado + heap \> 80% (K07) indica GC pressure. Os dois KPIs devem ser investigados em conjunto.                             |

|                  |                |                                 |
|------------------|----------------|---------------------------------|
| **🟢 Aceitável** | **🟡 Atenção** | **🔴 Crítico**                  |
| \< 1s            | 1s -- 2s       | \> 2s (usuário percebe timeout) |

|                                                                                     |
|-------------------------------------------------------------------------------------|
| **🏨 K06 --- Latência p95 de criarReserva** *--- SLO do fluxo crítico --- \< 200ms* |

|                             |                                                                                                                                                                                                                    |
|-----------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Definição**               | 95% das criações de reserva (RF12) concluídas em menos de 200ms. Mais restritivo que K04 porque é a operação de maior valor para o negócio.                                                                        |
| **Fonte**                   | Histogram hotel_reserva_duracao_criacao_seconds (metrics.ts L156). Alerta ReservaCriacaoLenta: p95 \> 200ms por 5 min. Falhas RF18 (quarto indisponível) são excluídas do cálculo --- label resultado=\'sucesso\'. |
| **Por que mais restritivo** | criarReserva é a operação mais frequente e crítica do sistema. Degradação aqui impacta diretamente a conversão de reservas.                                                                                        |
| **Ação --- Crítico**        | Verificar se K03 também está degradado (causa banco) ou se é isolado (causa código --- investigar se S11 introduziu query sem índice).                                                                             |

|                  |                |                                             |
|------------------|----------------|---------------------------------------------|
| **🟢 Aceitável** | **🟡 Atenção** | **🔴 Crítico**                              |
| \< 200ms         | 200ms -- 500ms | \> 500ms (alerta ReservaCriacaoLenta ativo) |

|            |                                                                                                                   |
|------------|-------------------------------------------------------------------------------------------------------------------|
| **PromQL** | histogram_quantile(0.95, rate(hotel_reserva_duracao_criacao_seconds_bucket{resultado=\"sucesso\"}\[5m\])) \* 1000 |

|                                                                                     |
|-------------------------------------------------------------------------------------|
| **💾 K07 --- Heap Node.js Utilizado** *--- Saúde de memória do processo --- \< 70%* |

|                 |                                                                                                                                                                                    |
|-----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Definição**   | % do heap V8 em uso sobre o heap total alocado. Heap próximo do limite provoca GC pressure (ver alerta GCExcessivo) e eventual OOM kill.                                           |
| **Fonte**       | hotel_node_nodejs_heap_size_used_bytes / hotel_node_nodejs_heap_size_total_bytes. Alerta MemoriaNodeElevada: \> 80% por 10 min. Painel \'Heap Node.js (MB)\' no Grafana (linha 5). |
| **Memory leak** | Heap crescendo monotonicamente sem cair, mesmo sob baixa carga, indica memory leak. Investigar closures acumulando referências no ciclo de requisição.                             |

|                  |                |                                          |
|------------------|----------------|------------------------------------------|
| **🟢 Aceitável** | **🟡 Atenção** | **🔴 Crítico**                           |
| \< 70%           | 70% -- 80%     | \> 80% (alerta MemoriaNodeElevada ativo) |

|            |                                                                                         |
|------------|-----------------------------------------------------------------------------------------|
| **PromQL** | hotel_node_nodejs_heap_size_used_bytes / hotel_node_nodejs_heap_size_total_bytes \* 100 |

**4. KPIs de Qualidade de Código**

Verificados automaticamente pelo pipeline CI (jobs \'validate\', \'test-unit\', \'test-integration\'). K08, K09, K10 e K11 são gates obrigatórios --- nenhum PR pode ser mergeado com violação em qualquer um deles.

|                                                                                                     |
|-----------------------------------------------------------------------------------------------------|
| **🧪 K08 --- Cobertura de Testes (Backend)** *--- Gate de PR --- ≥ 90% em branches/lines/functions* |

|                          |                                                                                                                                                                                                                     |
|--------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Definição**            | % de linhas, branches e funções do código backend exercitadas pelos testes unitários e de integração.                                                                                                               |
| **Estado atual**         | 140 testes em 6 arquivos: 18 (domínio) + 29 (cadastrarQuarto) + 33 (editarQuarto) + 10 (repositório) + 21 (integração) + 29 (refatoração). Threshold de 90% enforced via Codecov no job test-unit (ci-cd.yml L134). |
| **Gate de PR**           | jest \--coverage com threshold. Se cobertura cair abaixo de 90%, o job falha e o PR não pode ser mergeado.                                                                                                          |
| **Frontend (S12+)**      | Threshold separado: ≥ 70%. React tem limitações de cobertura (event handlers, hooks de efeito) que tornam 90% inviável sem custo desproporcional.                                                                   |
| **Distinção importante** | Cobertura mede o que é exercitado, não a qualidade dos testes. Um teste que executa o código mas não faz asserções relevantes aumenta cobertura sem aumentar confiança.                                             |

|                                    |                                                    |                                                |
|------------------------------------|----------------------------------------------------|------------------------------------------------|
| **🟢 Aceitável**                   | **🟡 Atenção**                                     | **🔴 Crítico**                                 |
| ≥ 90% (branches, lines, functions) | 85% -- 89% (PR bloqueado --- investigar regressão) | \< 85% (regressão grave --- reverter mudanças) |

|                                                                                              |
|----------------------------------------------------------------------------------------------|
| **📘 K09 + K10 --- TypeScript e ESLint** *--- Gates de análise estática --- zero tolerância* |

|                              |                                                                                                                                                                                                             |
|------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **K09 --- Erros TypeScript** | Meta: 0. Comando: npx tsc \--noEmit (ci-cd.yml L91). Verifica tipos, propriedades inexistentes e any implícito em modo strict.                                                                              |
| **K10 --- Avisos ESLint**    | Meta: 0. Comando: npx eslint src/ \--max-warnings 0 (ci-cd.yml L94). Qualquer aviso é tratado como erro --- não existe distinção entre warning e error no gate.                                             |
| **Justificativa histórica**  | O caso P2 da análise de dívida técnica (campo precoDia vs. precoDiaria passado silenciosamente com any) ficou invisível por meses. Com strict mode + \--max-warnings 0, seria capturado no primeiro commit. |
| **Ordem de execução**        | Job \'validate\' executa tsc e ESLint em paralelo, antes dos testes. Se qualquer um falhar, o pipeline para sem gastar tempo de CI com testes.                                                              |

|                                        |                                        |
|----------------------------------------|----------------------------------------|
| **K09 --- TypeScript (tsc \--noEmit)** | **K10 --- ESLint (\--max-warnings 0)** |
| 🟢 0 erros → PR liberado               
 🔴 ≥ 1 erro → PR bloqueado              | 🟢 0 avisos → PR liberado              
                                          🔴 ≥ 1 aviso → PR bloqueado             |

|                                                                                  |
|----------------------------------------------------------------------------------|
| **✅ K11 --- Taxa de Sucesso dos Testes** *--- Suite completa --- 100% passando* |

|                          |                                                                                                                                                                    |
|--------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Definição**            | % de testes que passam sobre o total. Distinto de K08: cobertura mede o que é testado; K11 mede se os testes que existem estão passando.                           |
| **Estado atual**         | 140 testes: 100% passando (S0--S9 concluídos).                                                                                                                     |
| **Regra para test.skip** | Um teste marcado como skip conta como falha de processo, não como teste passando. Deve ser documentado com issue de resolução antes de go-live.                    |
| **E2E (S14+)**           | Threshold diferenciado: ≥ 98% para Playwright em CI, devido ao risco de flakiness documentado em RT-08. Testes @smoke (subconjunto crítico) devem ser sempre 100%. |

|                               |                                             |                                    |
|-------------------------------|---------------------------------------------|------------------------------------|
| **🟢 Aceitável**              | **🟡 Atenção**                              | **🔴 Crítico**                     |
| 100% (unitários e integração) | 98--99% (aceito apenas para E2E/Playwright) | \< 98% ou qualquer falha em @smoke |

|                                                                                                  |
|--------------------------------------------------------------------------------------------------|
| **🔒 K12 --- Vulnerabilidades npm de Alta/Crítica Severidade** *--- Zero tolerância em produção* |

|                               |                                                                                                                                                                            |
|-------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Definição**                 | Número de dependências npm com vulnerabilidade de severidade alta ou crítica, conforme o banco npm Advisory.                                                               |
| **Coleta**                    | npm audit \--audit-level=high no pipeline CI, antes do build das imagens Docker. Dependabot alerts no GitHub para monitoramento contínuo entre PRs.                        |
| **Exceção controlada**        | Se não houver patch disponível: documentar no SECURITY.md com justificativa, CVE, severidade real no contexto do sistema e data de revisão. Nunca ignorar silenciosamente. |
| **Vulnerabilidades moderate** | Não bloqueiam o pipeline --- reportadas como informativo. Revisadas mensalmente.                                                                                           |

|                  |                                 |                                             |
|------------------|---------------------------------|---------------------------------------------|
| **🟢 Aceitável** | **🟡 Atenção**                  | **🔴 Crítico**                              |
| 0 high/critical  | 0 critical + vulnerab. moderate | ≥ 1 high ou ≥ 1 critical (deploy bloqueado) |

**5. KPIs de Processo**

Medidos a partir dos dados do plano de sprints (planilha \'Burndown SP\') e dos logs do GitHub Actions. Revisados ao encerramento de cada sprint.

|                                                                                           |
|-------------------------------------------------------------------------------------------|
| **📊 K13 --- Velocidade do Sprint** *--- Previsibilidade de entrega --- 35--45 SP/sprint* |

|                                                |                                                                                                                                          |
|------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| **Definição**                                  | Story Points com DoD atendido entregues em cada sprint de 2 semanas.                                                                     |
| **Histórico S0--S9**                           | Média = 39,2 SP \| Desvio padrão = 7,7 \| CV = 19,6% \| 8 de 10 sprints dentro de ±1σ. Range: 24 (S0, setup) -- 52 (S6, deploy).         |
| **Meta**                                       | 35--45 SP --- faixa de ±1σ ao redor da média histórica. Sprints fora do range indicam estimativa imprecisa ou impedimento não detectado. |
| **Exceção documentada**                        | S11 planejada com 52 SP (1,7σ acima da média) --- risco RT-04. Monitoramento diário do burndown durante S11.                             |
| **Tendência importa mais que o valor pontual** | Velocidade caindo sprint a sprint é mais preocupante do que uma sprint isolada abaixo do threshold.                                      |

|                    |                     |                                                 |
|--------------------|---------------------|-------------------------------------------------|
| **🟢 Aceitável**   | **🟡 Atenção**      | **🔴 Crítico**                                  |
| 35--45 SP / sprint | 28--34 ou 46--52 SP | \> 52 SP (subestimativa) ou \< 28 (impedimento) |

|                                                                                      |
|--------------------------------------------------------------------------------------|
| **⚡ K14 --- Tempo de Execução do Pipeline CI** *--- Produtividade --- \< 8 minutos* |

|                           |                                                                                                                                                                   |
|---------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Definição**             | Tempo total do pipeline GitHub Actions do push até o último job concluído (excluindo deploy-production, que aguarda aprovação manual).                            |
| **Meta**                  | \< 8 minutos --- definido no DoD do deploy (S6). Jobs validate / test-unit / test-integration rodam em paralelo; o tempo total é determinado pelo job mais lento. |
| **Timeouts configurados** | validate: 10min \| test-unit: 10min \| test-integration: 15min \| build-images: 20min (ci-cd.yml).                                                                |
| **Coleta**                | GitHub Actions → aba Actions do repositório. Tempo visível no histórico de cada run.                                                                              |
| **Ação --- Atenção**      | Verificar cache de node_modules (ci-cd.yml L83). Investigar se um job específico está crescendo --- split de suite de testes pode ser necessário em S13+.         |

|                  |                 |                                            |
|------------------|-----------------|--------------------------------------------|
| **🟢 Aceitável** | **🟡 Atenção**  | **🔴 Crítico**                             |
| \< 8 minutos     | 8 -- 12 minutos | \> 12 minutos (produtividade comprometida) |

|                                                                                         |
|-----------------------------------------------------------------------------------------|
| **📏 K15 --- Desvio de Estimativa por Sprint** *--- Precisão do planejamento --- ≤ 10%* |

|                                           |                                                                                                                                                                  |
|-------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Definição**                             | \|SP planejado − SP entregue\| / SP planejado × 100. Um desvio de 10% em uma sprint de 40 SP = 4 SP = meia história técnica.                                     |
| **Histórico**                             | Sprints S1--S9 concluídas dentro da meta com base nos artefatos entregues. Histórico de desvio \< 5% estimado.                                                   |
| **Tendência crescente é sinal de alerta** | Desvios de 5%, 10%, 15% em sprints consecutivas indicam deterioração sistemática da capacidade de estimativa --- mais preocupante do que um desvio único de 25%. |
| **Ação --- Crítico**                      | Sprint review obrigatória com análise de causa raiz. Causas típicas: subestimativa técnica, scope creep (risco RG-02), ou impedimento não removido.              |

|                  |                |                                              |
|------------------|----------------|----------------------------------------------|
| **🟢 Aceitável** | **🟡 Atenção** | **🔴 Crítico**                               |
| ≤ 10% de desvio  | 11% -- 20%     | \> 20% → sprint review estendida obrigatória |

|                                                                      |
|----------------------------------------------------------------------|
| **🚀 K16 + K17 --- Deploy e Rastreabilidade** *--- Gates de go-live* |

|                                      |                                                                                                                                                                             |
|--------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **K16 --- Sucesso de deploy**        | Meta: 100% dos deploys bem-sucedidos (sem rollback manual). deploy.sh registra sucesso/falha. Health check com 8 retries valida a entrega antes de declarar sucesso.        |
| **K17 --- Rastreabilidade RF↔Teste** | Meta: 100% dos RF implementados rastreados a ≥ 1 teste automatizado. Estado atual: RF01--RF18 (18/18 = 100%) --- planilha Rastreabilidade. RF19--RF27 cobertos em S10--S14. |
| **K16 --- Ação em falha**            | Se rollback foi necessário: post-mortem obrigatório (template no runbook). Investigar se o pipeline CI não detectou a regressão --- gap em K08 ou K11.                      |
| **K17 --- Ação em lacuna**           | RF sem teste após a sprint de implementação: dívida técnica P1, resolução obrigatória antes da sprint seguinte. Nunca avançar sem cobertura de teste no RF implementado.    |

|                                       |                                      |
|---------------------------------------|--------------------------------------|
| **K16 --- Taxa de sucesso de deploy** | **K17 --- Rastreabilidade RF↔Teste** |
| 🟢 100% → sem rollback manual         
 🔴 \< 100% → post-mortem obrigatório   | 🟢 100% RF cobertos                  
                                         🔴 Qualquer RF sem teste → dívida P1  |

**6. KPIs de Negócio**

Derivados das métricas de domínio em instrumented-services.ts, disponíveis no painel \'Métricas de Negócio\' do dashboard Grafana a partir de S7. Os 16 error_codes mapeados (QUARTO\_\*, HOSPEDE\_\*, RESERVA\_\*) e o fallback ERRO_DESCONHECIDO são as fontes destes KPIs.

|                                                                                      |
|--------------------------------------------------------------------------------------|
| **🏨 K18 --- Taxa de Ocupação de Quartos** *--- Eficiência operacional --- 30%--85%* |

|                        |                                                                                                                                                                                                |
|------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Definição**          | % de quartos com status OCUPADO sobre o total de quartos ativos (excluindo MANUTENÇÃO e LIMPEZA). Gauge instantâneo --- atualizado a cada operação de reserva/cancelamento.                    |
| **Fonte**              | hotel_quartos_por_status{status=\'Ocupado\'} / (Livre + Ocupado). Alerta HotelPraticamenteEsgotado: quartos Livres \< 5% por 30 min. Painel \'Distribuição de Quartos por Status\' no Grafana. |
| **Leitura contextual** | Taxa alta em fins de semana é normal. Taxa alta combinada com K19 elevado (muitas falhas RF18) indica inconsistência de dados --- quartos OCUPADO sem reserva ATIVA (risco RT-01).             |
| **Ação --- Crítico**   | Taxa ≥ 95%: verificar se quartos em MANUTENÇÃO/LIMPEZA podem ser acelerados. Taxa \< 10%: verificar consistência de dados com a query de reconciliação do runbook.                             |

|                  |                                  |                                          |
|------------------|----------------------------------|------------------------------------------|
| **🟢 Aceitável** | **🟡 Atenção**                   | **🔴 Crítico**                           |
| 30% -- 85%       | 85% -- 94% (esgotamento próximo) | ≥ 95% ou \< 10% (verificar consistência) |

|            |                                                                                                                                                        |
|------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| **PromQL** | hotel_quartos_por_status{status=\"Ocupado\"} / on() (hotel_quartos_por_status{status=\"Livre\"} + hotel_quartos_por_status{status=\"Ocupado\"}) \* 100 |

|                                                                                                        |
|--------------------------------------------------------------------------------------------------------|
| **🚫 K19 --- Taxa de Falha RF18 (Quarto Indisponível)** *--- Qualidade do fluxo de reserva --- \< 30%* |

|                                  |                                                                                                                                                                                                    |
|----------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Definição**                    | % de tentativas de criação de reserva que falham com error_code QUARTO_INDISPONIVEL sobre o total de tentativas. Mede se os hóspedes conseguem reservar quando tentam.                             |
| **Fonte**                        | hotel_reserva_criacao_total{resultado=\'falha_quarto_indisponivel\'} / hotel_reserva_criacao_total. Alerta AltaTaxaQuartoIndisponivel: \> 50% por 10 min. Painel \'Falhas de Reserva por Motivo\'. |
| **Diagnóstico bifurcado**        | K19 alto + K18 \< 85% (quartos disponíveis existem) = bug no sistema (provavelmente RT-01). K19 alto + K18 ≥ 95% (hotel esgotado) = operação normal --- nenhuma ação necessária.                   |
| **O painel Grafana exibe ambos** | K18 e K19 estão na mesma linha do dashboard para facilitar o diagnóstico sem precisar alternar entre painéis.                                                                                      |

|                  |                |                                                  |
|------------------|----------------|--------------------------------------------------|
| **🟢 Aceitável** | **🟡 Atenção** | **🔴 Crítico**                                   |
| \< 30%           | 30% -- 50%     | \> 50% (alerta AltaTaxaQuartoIndisponivel ativo) |

|                                                                             |
|-----------------------------------------------------------------------------|
| **↩️ K20 --- Taxa de Cancelamento** *--- Satisfação operacional --- \< 15%* |

|                      |                                                                                                                                                                                                    |
|----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Definição**        | % de reservas canceladas sobre o total de reservas criadas na janela de 24 horas.                                                                                                                  |
| **Fonte**            | hotel_reserva_cancelamento_total / hotel_reserva_criacao_total{resultado=\'sucesso\'}. Painel \'Reservas: Criações e Cancelamentos (por hora)\' no Grafana.                                        |
| **Limitação atual**  | Antes de S13 (frontend de reservas), os cancelamentos são todos via API direta --- a taxa não reflete comportamento real de usuário. Este KPI torna-se operacionalmente relevante a partir de S13. |
| **Ação --- Crítico** | Taxa \> 25%: investigar se há cancelamentos automáticos causados por bug (ex: reservas criadas em duplicata por falta de atomicidade --- risco RT-01) ou se é comportamento genuíno de usuário.    |

|                  |                |                                      |
|------------------|----------------|--------------------------------------|
| **🟢 Aceitável** | **🟡 Atenção** | **🔴 Crítico**                       |
| \< 15%           | 15% -- 25%     | \> 25% (bug ou problema operacional) |

|                                                                                             |
|---------------------------------------------------------------------------------------------|
| **⚠️ K21 --- Ocorrências de ERRO_DESCONHECIDO** *--- Proxy de bugs não tratados --- 0/hora* |

|                        |                                                                                                                                                                                                           |
|------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Definição**          | Número de logs com error_code=\'ERRO_DESCONHECIDO\' por hora. É o valor de fallback em instrumented-services.ts L69 --- representa erros que não foram mapeados explicitamente.                           |
| **Fonte**              | toErrorCode() retorna \'ERRO_DESCONHECIDO\' quando nenhum dos 16 padrões de mensagem reconhecidos é encontrado. Label error_code disponível tanto no Prometheus quanto no Loki.                           |
| **Por que é especial** | Os outros KPIs de erro podem ter valores normais não-zero (ex: K19 \> 0 quando o hotel está cheio é normal). ERRO_DESCONHECIDO nunca é normal em produção --- cada ocorrência é um bug ativo não tratado. |
| **Ação imediata**      | Qualquer ocorrência: buscar o trace_id associado no Loki, reproduzir o erro localmente. Se for erro de negócio previsível: adicionar ao mapeamento de toErrorCode(). Se for exceção de runtime: issue P1. |

|                      |                |                                                 |
|----------------------|----------------|-------------------------------------------------|
| **🟢 Aceitável**     | **🟡 Atenção** | **🔴 Crítico**                                  |
| 0 ocorrências / hora | ---            | ≥ 1 / hora (bug ativo --- trace_id obrigatório) |

|                |                                                                                                   |
|----------------|---------------------------------------------------------------------------------------------------|
| **Loki LogQL** | {app=\"hotel-reservas\"} \| json \| error_code = \"ERRO_DESCONHECIDO\" \| count_over_time(\[1h\]) |

**7. Definition of Done**

O DoD opera em três níveis cumulativos: o DoD de Sprint inclui todos os critérios do DoD de PR; o DoD de Go-Live inclui ambos, mais os critérios de produção.

**7.1 DoD de Pull Request**

Verificado automaticamente pelo pipeline CI a cada push em qualquer PR direcionado a develop ou main.

|        |                                                  |                                                            |
|--------|--------------------------------------------------|------------------------------------------------------------|
|        | **Critério**                                     | **Verificação automática**                                 |
| **✅** | K09: tsc \--noEmit com 0 erros                   | Job \'validate\' --- npx tsc \--noEmit                     |
| **✅** | K10: ESLint com 0 avisos (\--max-warnings 0)     | Job \'validate\' --- npx eslint src/ \--max-warnings 0     |
| **✅** | K11: todos os testes unitários passando          | Job \'test-unit\' --- jest                                 |
| **✅** | K08: cobertura backend ≥ 90%                     | Job \'test-unit\' --- jest \--coverage + Codecov threshold |
| **✅** | K11: todos os testes de integração passando      | Job \'test-integration\' --- jest                          |
| **✅** | K12: npm audit sem high/critical                 | Job \'validate\' --- npm audit \--audit-level=high         |
| **📝** | Código revisado por ao menos 1 revisor           | Aprovação no GitHub PR (manual)                            |
| **📝** | Testes adicionados para cada nova funcionalidade | Checklist no template de PR (manual)                       |

**7.2 DoD de Sprint**

Verificado na sprint review ao encerramento de cada sprint de 2 semanas.

|        |                                                                      |                                                     |
|--------|----------------------------------------------------------------------|-----------------------------------------------------|
|        | **Critério**                                                         | **Como verificar**                                  |
| **✅** | Todos os critérios do DoD de PR atendidos                            | Pipeline CI verde em develop                        |
| **✅** | K17: todos os RFs da sprint têm teste associado                      | Planilha Rastreabilidade --- 100% dos RFs da sprint |
| **✅** | K16: deploy em staging bem-sucedido sem rollback                     | ./deploy.sh health staging → OK                     |
| **✅** | K13: SP entregue documentado no burndown                             | Aba \'Burndown SP\' da planilha atualizada          |
| **📝** | Decisões técnicas documentadas inline (ADRs)                         | Comentários no código ou ADR separado (manual)      |
| **📝** | Nenhuma história marcada como done sem critério de aceite verificado | Checklist de aceite no template (manual)            |
| **📝** | Retrospectiva com ações concretas registradas                        | Documento de retrospectiva no repositório (manual)  |

**7.3 DoD de Go-Live (S15)**

Critérios adicionais obrigatórios para deploy em produção. Nenhum pode ser negociado ou adiado.

|        |                                                             |                                                     |
|--------|-------------------------------------------------------------|-----------------------------------------------------|
|        | **Critério**                                                | **Verificação**                                     |
| **✅** | K01 ≥ 99,5%: comprovado em staging por 48h                  | Prometheus: disponibilidade staging pré-go-live     |
| **✅** | K02 \< 0,1%: staging sem 5xx por 48h                        | Prometheus: alerta ErroInternoServidor não disparou |
| **✅** | K21 = 0: zero ERRO_DESCONHECIDO em staging por 48h          | Loki: query K21 retorna 0 para janela de 48h        |
| **✅** | RT-03 mitigado: /metrics retorna 403 sem credencial         | curl https://hotel-reservas.app/metrics → 403       |
| **✅** | K12 = 0: sem vulnerabilidades high/critical                 | npm audit na imagem de produção final               |
| **✅** | K17 = 100%: todos RF01--RF27 com teste                      | Planilha Rastreabilidade: todas as linhas verdes    |
| **✅** | Smoke tests E2E @smoke passando em staging                  | Playwright: 100% dos testes @smoke                  |
| **✅** | 14 alertas Prometheus ativos e testados (disparam em teste) | Verificação manual de cada regra em alertas.yml     |
| **✅** | Runbook impresso e distribuído ao time operacional          | Sessão de treinamento GL-05 concluída               |
| **✅** | Swagger /docs acessível e completo para RF01--RF27          | GET /docs → 200; todos os endpoints documentados    |
| **✅** | Rollback testado em staging com sucesso                     | ./deploy.sh rollback staging executado e validado   |
| **✅** | K14 \< 8min: pipeline CI abaixo do threshold                | GitHub Actions: média das últimas 5 runs            |
