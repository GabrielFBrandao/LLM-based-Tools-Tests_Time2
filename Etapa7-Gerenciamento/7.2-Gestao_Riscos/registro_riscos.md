<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>REGISTRO DE RISCOS</strong></p>
<p>Sistema de Reserva de Hotel</p>
<p><em>Riscos técnicos e gerenciais — evidências extraídas do código</em></p></td>
</tr>
</tbody>
</table>

|                                             |                                                            |
|---------------------------------------------|------------------------------------------------------------|
| **🔴 Críticos (Prob. Alto × Impacto Alto)** | **RT-01, RT-02, RG-01**                                    |
| **🟠 Altos**                                | **RT-03, RT-04, RT-06, RG-02**                             |
| **🟡 Médios**                               | **RT-05, RT-07, RT-08, RT-09, RT-10, RG-03, RG-04, RG-05** |
| **🟢 Baixos**                               | **RT-11, RG-06**                                           |

**1. Matriz de Riscos**

Probabilidade e impacto avaliados em escala Baixo / Médio / Alto. Prioridade = combinação das duas dimensões. Evidências extraídas diretamente dos artefatos do projeto.

|        |          |                                                    |           |             |                |               |
|--------|----------|----------------------------------------------------|-----------|-------------|----------------|---------------|
| **ID** | **Tipo** | **Risco**                                          | **Prob.** | **Impacto** | **Prioridade** | **Sprint(s)** |
| RT-01  | T        | Inconsistência quarto↔reserva em falha parcial     | Alto      | Alto        | 🔴 CRÍTICA     | S4 → S11      |
| RT-02  | T        | Persistência em memória: perda total no restart    | Alto      | Alto        | 🔴 CRÍTICA     | S0 → S11      |
| RT-03  | T        | /metrics exposto sem autenticação em produção      | Médio     | Alto        | 🟠 ALTA        | S7 → S15      |
| RT-04  | T        | S11 com 52 SP --- 1,7 σ acima da média histórica   | Alto      | Alto        | 🟠 ALTA        | S11           |
| RT-05  | T        | Cardinalidade Prometheus por rota não normalizada  | Baixo     | Alto        | 🟡 MÉDIA       | S7 → Prod     |
| RT-06  | T        | JWT ausente: autenticação ainda não implementada   | Médio     | Alto        | 🟠 ALTA        | S10           |
| RT-07  | T        | Rollback depende de um único arquivo de backup     | Médio     | Médio       | 🟡 MÉDIA       | S6 → Prod     |
| RT-08  | T        | Testes E2E Playwright: flakiness em CI             | Alto      | Médio       | 🟡 MÉDIA       | S14           |
| RT-09  | T        | LGPD: dados pessoais parcialmente expostos em logs | Médio     | Médio       | 🟡 MÉDIA       | S7 → S15      |
| RT-10  | T        | Ações do CI sem SHA fixada (supply-chain risk)     | Baixo     | Médio       | 🟡 MÉDIA       | S6 → Prod     |
| RT-11  | T        | Rate limiting ausente antes de S10                 | Baixo     | Baixo       | 🟢 BAIXA       | S0 → S10      |
| RG-01  | G        | Bus factor 1: único desenvolvedor no projeto       | Alto      | Alto        | 🔴 CRÍTICA     | S0 -- S15     |
| RG-02  | G        | Scope creep: features além do escopo v1.0          | Médio     | Alto        | 🟠 ALTA        | S10 -- S13    |
| RG-03  | G        | Débito técnico acumulado sem revisão periódica     | Médio     | Médio       | 🟡 MÉDIA       | S10 -- S15    |
| RG-04  | G        | Aprovador de prod indisponível bloqueia deploy     | Baixo     | Médio       | 🟡 MÉDIA       | S6 → Prod     |
| RG-05  | G        | Ambiente de prod não provisionado até S15          | Médio     | Médio       | 🟡 MÉDIA       | S15           |
| RG-06  | G        | Cobertura de testes abaixo de 90% no frontend      | Baixo     | Baixo       | 🟢 BAIXA       | S12 -- S14    |

**2. Riscos Técnicos**

**2.1 Riscos Críticos**

|                                                                                                                |
|----------------------------------------------------------------------------------------------------------------|
| **RT-01 --- Inconsistência de Estado Quarto↔Reserva em Falha Parcial** *· Probabilidade: Alto · Impacto: Alto* |

|               |                                                                                                                                                                       |
|---------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Evidência** | service.integration.ts L148--150: «Em produção, criar reserva + mudar status do quarto seria uma transação atômica (ADR-007). Aqui os dois passos estão sequenciais.» |

O método ReservaService.criarReserva() executa dois passos sequenciais sem transação: (1) reservaRepository.salvar(novaReserva) e (2) quartoRepository.atualizar(quartoOcupado). Se a segunda chamada falhar, a reserva existe mas o quarto permanece LIVRE --- o sistema aceita uma segunda reserva para o mesmo quarto, violando RF18.

O problema é latente hoje (repositório em memória raramente falha entre duas operações), mas torna-se um risco ativo em S11 quando a conexão com PostgreSQL for introduzida: timeouts, overload do banco ou falha de rede entre os dois await materializam o cenário.

**Plano de Mitigação**

1.  S11: envolver ambas as operações em prisma.\$transaction() --- Prisma faz rollback automático se qualquer operação dentro da transação lançar.

2.  S11: adicionar teste de integração que usa jest.spyOn para lançar erro no segundo await e verifica que nenhum dado foi persistido (nem reserva, nem mudança de status).

3.  S7 (já feito): alerta BancoDeDadosIndisponivel em alertas.yml detecta degradação do banco antes de falhas silenciosas ocorrerem em produção.

4.  Runbook (seção 4.2 do documento já entregue): procedimento de reconciliação manual disponível --- query SQL identifica quartos OCUPADO sem reserva ATIVA e roteia para PATCH /quartos/:id/status.

|                  |                                                                                                                                                 |
|------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| **Contingência** | Se o problema ocorrer antes de S11: executar o script de reconciliação do runbook. O procedimento leva menos de 5 minutos e não exige downtime. |

|                                                                                                                |
|----------------------------------------------------------------------------------------------------------------|
| **RT-02 --- Persistência em Memória: Perda Total de Dados no Restart** *· Probabilidade: Alto · Impacto: Alto* |

|               |                                                                                                                                                                                                   |
|---------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Evidência** | repository.ts L30--38: QuartoRepositoryMemoria usa Map\<string, Quarto\>. Reiniciar o processo Node.js ou executar docker compose down apaga integralmente todos os quartos, hóspedes e reservas. |

O comportamento é correto e intencional para desenvolvimento e testes unitários. O risco operacional surge se o sistema for demonstrado ou validado com dados reais antes de S11: um crash do processo, um restart pelo healthcheck (configurado no docker-compose) ou um deploy rotineiro apaga silenciosamente todo o estado.

**Plano de Mitigação**

5.  Documentar no README com destaque que o ambiente antes de S11 é efêmero --- nenhum dado de cliente real ou de demonstração formal deve ser inserido antes da persistência em banco.

6.  S11 (DB-02): script de seed que reinsere dados representativos automaticamente --- executar após qualquer restart de ambiente de desenvolvimento ou staging.

7.  S11: a substituição por PrismaXxxRepository é a eliminação estrutural do risco. Após S11, nenhum restart perde dados.

8.  Monitorar o alerta APIForaDoAr (alertas.yml) --- detecta restarts frequentes em staging que poderiam passar despercebidos sem monitoramento.

|                  |                                                                                                                                                                            |
|------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Contingência** | Se dados de demonstração forem perdidos: re-executar npm run seed (história DB-02). Documentar o seed como etapa obrigatória do onboarding de qualquer novo desenvolvedor. |

**2.2 Riscos Altos**

|                                                                                                                |
|----------------------------------------------------------------------------------------------------------------|
| **RT-03 --- Endpoint /metrics Exposto Publicamente Sem Autenticação** *· Probabilidade: Médio · Impacto: Alto* |

|               |                                                                                                                                                              |
|---------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Evidência** | middleware.ts L144--148: «Em produção, /metrics NÃO deve ser exposto publicamente. Opções: a) Porta separada :9090 b) Bearer token c) IP allowlist no Nginx» |

GET /metrics expõe as 17 métricas Prometheus do sistema --- incluindo nomes de rotas, taxas de erro por endpoint, estado do heap Node.js e contadores de operações de negócio. Em produção sem proteção, um atacante pode usar essas informações para mapear a topologia interna, identificar rotas com maior taxa de erro e estimar o volume de operações.

**Plano de Mitigação**

9.  Antes de S15 (go-live): adicionar ao nginx.conf uma diretiva que retorna 403 para qualquer requisição a /metrics vinda de IP fora da rede interna. O Prometheus acessa via rede Docker interna, não pelo Nginx.

10. Alternativa imediata (3 linhas de código): adicionar Bearer token no metricsHandler usando a variável METRICS_TOKEN --- já comentada no middleware.ts como opção b).

11. Adicionar ao pipeline de staging um teste automatizado que verifica: curl https://hotel-staging.app/metrics retorna 403 ou 401. Bloquear go-live se o teste falhar.

|                  |                                                                                                                                                                                                          |
|------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Contingência** | Se descoberto em produção: a correção no nginx.conf é uma alteração de 3 linhas com deploy em menos de 5 minutos via deploy.sh. O rollback automático mantém a versão anterior disponível durante o fix. |

|                                                                                                                  |
|------------------------------------------------------------------------------------------------------------------|
| **RT-04 --- Sprint S11 com 52 SP --- 1,7 Desvios-Padrão Acima da Média** *· Probabilidade: Alto · Impacto: Alto* |

|               |                                                                                                                                                                                                                                        |
|---------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Evidência** | Média histórica S0--S9: 39,2 SP (σ = 7,7). S11 planejada: 52 SP = média + 1,7σ. Contém 7 histórias com dependência em cadeia: DB-01 (schema) → DB-03/DB-04 (repositórios) → DB-05 (transação atômica) → DB-06 (testes com banco real). |

S11 é a sprint tecnicamente mais densa do projeto. Suas histórias têm dependência em cascata: um problema no schema Prisma (DB-01) invalida os três repositórios que dependem dele. A transação atômica (DB-05) depende dos repositórios estarem funcionando. Os testes com banco real (DB-06) dependem de tudo isso estar correto. Uma subestimativa em DB-01 tem efeito cascata sobre todas as 6 histórias seguintes.

**Plano de Mitigação**

12. Antes de S11: realizar um spike de 1--2 dias para validar o schema Prisma e a conexão básica com PostgreSQL. O spike não produz código de produção --- apenas confirma se as estimativas são realizáveis.

13. Se o spike indicar risco: dividir S11 em duas sprints (S11a: schema + migrations + um repositório; S11b: dois repositórios restantes + transação + testes com banco real).

14. Priorizar DB-05 (transação atômica --- história mais arriscada) como segunda história da sprint, não a última. Identificar o risco cedo dá tempo de replanejamento.

15. Usar testcontainers (biblioteca Node.js) nos testes de banco em vez de docker-compose manual --- elimina variabilidade de setup que infla o tempo real de implementação.

|                  |                                                                                                                                                                            |
|------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Contingência** | Se S11 estourar: cortar DB-07 (connection pooling) para a sprint seguinte. É uma otimização de escala, não um bloqueador funcional. Os RF01--RF18 funcionam sem PgBouncer. |

|                                                                                                                            |
|----------------------------------------------------------------------------------------------------------------------------|
| **RT-06 --- JWT Não Implementado --- Autenticação Ausente é Bloqueante para S10** *· Probabilidade: Médio · Impacto: Alto* |

|               |                                                                                                                                                                                                                        |
|---------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Evidência** | docker-compose.yml L69: JWT_SECRET obrigatório via :? (falha explicitamente se ausente). Nenhuma implementação de auth existe no código atual. História API-05 (JWT) está na mesma sprint que os 4 controllers de API. |

Todos os endpoints de S10 precisam de autenticação JWT. A história API-05 está planejada na mesma sprint que API-02, API-03 e API-04. Se JWT for mais complexo que estimado --- decisão entre HS256 e RS256, estratégia de refresh rotation, blacklist de tokens --- ela pode consumir a sprint inteira e deixar os controllers sem cobertura de autenticação.

**Plano de Mitigação**

16. Implementar API-05 (JWT middleware) como primeira história de S10 --- o middleware precisa existir antes de qualquer controller que o use.

17. Decidir a estratégia de auth antes do início de S10: HS256 com JWT_SECRET (simples, já configurado no compose) vs. RS256 com par de chaves. Registrar a decisão no ADR antes de codar.

18. Usar biblioteca estabelecida (jose ou jsonwebtoken) --- não implementar a assinatura/verificação manualmente. Reduz tanto a complexidade quanto os riscos de segurança.

19. Spike de meio dia antes de S10: validar o middleware de auth com supertest (rota protegida retorna 401 sem token, 200 com token válido). Confirma que a estimativa de 8 SP é realista.

|                  |                                                                                                                                                                  |
|------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Contingência** | Se JWT atrasar: implementar rotas de staging com variável AUTH_DISABLED=true para testes funcionais. A flag é removida obrigatoriamente antes de go-live em S15. |

**2.3 Riscos Médios**

|                                                                                                |
|------------------------------------------------------------------------------------------------|
| **RT-05 --- Explosão de Cardinalidade no Prometheus** *· Probabilidade: Baixo · Impacto: Alto* |

|               |                                                                                                                                                                                                                                                                              |
|---------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Evidência** | middleware.ts L21--22: «Sem normalização, cada ID único geraria uma série de métrica separada --- cardinality explosion no Prometheus.» Função normalizarRota() em L48 mitiga o risco atual, mas novos padrões de URL introduzidos em S10 podem não ser cobertos pela regex. |

A normalizarRota() usa heurística baseada em comprimento e presença de underscore para detectar segmentos de ID nas URLs. Funciona para os padrões atuais, mas se S10 introduzir IDs com formatos diferentes (ex: slugs, datas, UUIDs sem underscore como 550e8400-e29b-41d4), a regex não os captura --- gerando uma série Prometheus por valor de ID e esgotando memória do servidor de métricas em dias.

**Plano de Mitigação**

20. S10: ao criar as rotas Express, usar req.route.path como label da métrica em vez da normalização por regex. Express conhece o padrão /quartos/:id nativamente --- elimina a heurística por completo.

21. Adicionar testes unitários para normalizarRota() cobrindo todos os formatos de ID que serão usados em S10--S11 (UUIDs, slugs, IDs compostos).

22. Checklist de revisão de PR: qualquer PR que adicione nova rota HTTP deve incluir verificação de que o padrão de URL é coberto pelo middleware de métricas.

|                  |                                                                                                                                                                                                                   |
|------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Contingência** | Se detectado em produção: remover o label route da métrica afetada via relabeling no Prometheus (quebra dashboards do Grafana, mas para o crescimento imediatamente). Reimplementar com req.route.path em hotfix. |

|                                                                                                        |
|--------------------------------------------------------------------------------------------------------|
| **RT-07 --- Rollback Depende de Um Único Arquivo de Backup** *· Probabilidade: Médio · Impacto: Médio* |

|               |                                                                                                                                                                                                         |
|---------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Evidência** | deploy.sh L125--126: if \[\[ ! -f \$BACKUP_FILE \]\]; then log_error \'Arquivo de backup não encontrado\'. O backup é docker-compose.backup.yml --- se corrompido ou deletado, rollback não é possível. |

**Plano de Mitigação**

23. Versionar backups com sufixo de timestamp: docker-compose.backup.\$(date +%Y%m%d%H%M).yml. Manter as últimas 3 versões. Se o backup mais recente falhar, há fallback nas versões anteriores.

24. Armazenar a tag Docker da versão anterior em um arquivo .last-version separado. Permite reconstruir o ambiente a partir do GHCR mesmo se todos os backups locais forem perdidos.

25. O GitHub Container Registry retém todas as imagens tagueadas: ./deploy.sh deploy prod vX.Y.Z com qualquer tag anterior sempre é uma opção de contingência.

|                  |                                                                                                                                                                                          |
|------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Contingência** | Se BACKUP_FILE não existir: ./scripts/deploy.sh deploy prod \<tag_anterior\> puxa a imagem diretamente do GHCR. Tag anterior disponível no output do pipeline ou nas releases do GitHub. |

|                                                                                               |
|-----------------------------------------------------------------------------------------------|
| **RT-08 --- Testes E2E Playwright: Flakiness em CI** *· Probabilidade: Alto · Impacto: Médio* |

|               |                                                                                                                                                                                                                        |
|---------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Evidência** | ci-cd.yml: pipeline atual não tem retries configurados para Playwright. Frontend ainda não existe (S12--S13 planejados) --- seletores CSS frágeis e sincronização com API são riscos conhecidos de qualquer suite E2E. |

**Plano de Mitigação**

26. S12--S13 (ao criar os componentes React): usar data-testid em todos os elementos interativos dos formulários. Desacopla seletores E2E das classes CSS que mudam com refatorações de layout.

27. S14: usar page.waitForResponse() para sincronizar com respostas da API em vez de page.waitForTimeout() --- elimina a principal causa de flakiness por timing variável em CI.

28. playwright.config.ts: configurar retries: 2 para CI. Testes que falham por race condition passam na segunda tentativa sem bloquear o pipeline.

29. Separar smoke tests (\< 3 minutos, roda em todo PR com @smoke tag) dos testes completos (roda apenas em main/develop). Smoke tests nunca devem ter retries.

30. Estado limpo por teste: truncate de banco ou transações com rollback em beforeEach dos testes E2E.

|                  |                                                                                                                                                                                                |
|------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Contingência** | Se um teste ficar cronicamente flaky: isolar com tag @quarantine e abrir issue P1. O pipeline de PR continua bloqueando com os demais testes --- o risco de regressão real não é comprometido. |

|                                                                                                            |
|------------------------------------------------------------------------------------------------------------|
| **RT-09 --- LGPD: Dados Pessoais Parcialmente Expostos em Logs** *· Probabilidade: Médio · Impacto: Médio* |

|               |                                                                                                                                                                                                                                                                |
|---------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Evidência** | instrumented-services.ts L205--207: CPF protegido (apenas últimos 3 dígitos logados). L331: motivo de cancelamento não logado. Lacuna: DTOs de entrada contêm CPF e email completos que podem vazar em logs de erro não controlados por exceções não tratadas. |

**Plano de Mitigação**

31. Adicionar sanitização automática no logger.ts: antes de serializar qualquer objeto de contexto, remover recursivamente campos \'cpf\', \'email\', \'senha\', \'token\' e variantes.

32. Auditar todos os pontos de catch que logam o objeto de erro --- garantir que o DTO de entrada (que contém CPF e email) não aparece em nenhum stack trace ou campo error_message.

33. Antes de S15: executar grep -r \'cpf\\email\' nos logs de staging com dados reais de teste --- verificar empiricamente que nenhum valor completo aparece.

34. Configurar LOG_LEVEL=info em staging e produção. Logs debug (mais verbosos, maior risco de vazar contexto) ficam restritos a desenvolvimento local.

|                  |                                                                                                                                                                                                                                                                                             |
|------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Contingência** | Se dados pessoais completos forem encontrados em logs de produção: expurgar os logs afetados imediatamente, avaliar se o incidente se enquadra no Art. 48 da LGPD (notificação à ANPD em 72h se houver risco relevante aos titulares), e implementar a sanitização como hotfix prioritário. |

**2.4 Riscos de Baixa Prioridade**

|        |                                                                                          |                                                                                                                                                                   |                                                                                          |
|--------|------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------|
| **ID** | **Risco**                                                                                | **Mitigação**                                                                                                                                                     | **Contingência**                                                                         |
| RT-10  | CI usa Actions do marketplace sem SHA fixada (supply-chain attack)                       | Fixar cada action como SHA completo: actions/checkout@\<hash\>. Ferramenta Renovate Bot atualiza automaticamente quando nova versão é lançada.                    | Reverter para SHA anterior no ci-cd.yml. Imagem já construída no GHCR não é afetada.     |
| RT-11  | Rate limiting ausente antes de S10 --- API vulnerável a flood em desenvolvimento/staging | Implementar express-rate-limit como primeira história de S10 (antes dos controllers). Nginx já tem capacidade nativa de rate limiting como solução de emergência. | Adicionar limit_req_zone no nginx.conf em menos de 10 minutos se um flood for detectado. |

**3. Riscos Gerenciais**

**3.1 Risco Crítico**

|                                                                                                                  |
|------------------------------------------------------------------------------------------------------------------|
| **RG-01 --- Bus Factor 1 --- Projeto Depende de Um Único Desenvolvedor** *· Probabilidade: Alto · Impacto: Alto* |

|               |                                                                                                                                                                                                                                                     |
|---------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Evidência** | Todo o conhecimento de arquitetura, convenções de código, infraestrutura e runbooks reside em um único desenvolvedor. Não há segundo revisor, par de programação ou documentação suficiente para que um substituto retome o projeto em prazo curto. |

Uma indisponibilidade não planejada em qualquer sprint crítica --- especialmente S11 (a mais densa tecnicamente) ou S15 (go-live) --- pode paralisar o projeto sem nenhum substituto capaz de continuar. O bus factor 1 é o único risco que não pode ser mitigado por mudança técnica: exige mudança de processo.

**Plano de Mitigação**

35. Documentação como código (já sendo praticado): cada decisão arquitetural está documentada em comentários inline (ADRs), no runbook e no plano de projeto. Manter esse padrão rigorosamente em S10--S15.

36. Ao final de cada sprint: gravar screencast de 20--30 minutos mostrando o que foi implementado, as decisões tomadas e como executar. Armazenar no Drive do projeto.

37. README sempre executável em menos de 5 comandos: qualquer desenvolvedor deve conseguir subir o ambiente em menos de 30 minutos usando apenas o README.

38. Se o orçamento permitir: onboarding de um segundo desenvolvedor como revisor de código antes de S11 --- reduz o bus factor de 1 para 2 na sprint de maior risco técnico.

39. Revisão do DoD de cada sprint: se uma sprint não pode ser retomada por outra pessoa usando apenas os artefatos entregues, a documentação está incompleta.

|                  |                                                                                                                                                                                                                                                                                                  |
|------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Contingência** | Se o desenvolvedor principal ficar indisponível por mais de uma sprint: (1) congelar novas features; (2) contratar desenvolvedor externo usando a documentação como onboarding acelerado; (3) priorizar apenas a entrega do mínimo funcional já implementado até o momento da indisponibilidade. |

**3.2 Risco Alto**

|                                                                                                  |
|--------------------------------------------------------------------------------------------------|
| **RG-02 --- Scope Creep: Features Além do Escopo v1.0** *· Probabilidade: Médio · Impacto: Alto* |

|               |                                                                                                                                                                                                                                                                                                         |
|---------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Evidência** | O plano cobre RF01--RF27. Ao implementar a API REST em S10, é natural surgir demanda por funcionalidades não planejadas: autenticação multi-tenant, precificação dinâmica, disponibilidade por período de datas. Cada feature extra que entra em S10--S13 atrasa diretamente S14 (E2E) e S15 (go-live). |

**Plano de Mitigação**

40. Manter uma linha explícita entre \'In Scope S10--S15\' e \'Backlog Futuro (pós v1.0)\' na planilha de projeto. Toda nova demanda vai para o Backlog Futuro por padrão --- nenhuma exceção sem replanejar a sprint.

41. Definition of Done de cada sprint inclui revisão de escopo: se uma história foi adicionada mid-sprint que não estava no plano original, deve ser documentada com justificativa e aprovação explícita.

42. Revisão do burndown a cada 5 dias: se o SP restante não está caindo na velocidade esperada, investigar imediatamente se há scope creep ou subestimativa.

43. Para stakeholders: apresentar o escopo de v1.0 como fixo com base nos RF documentados. Features adicionais são negociadas para v1.1 com novo planejamento.

|                  |                                                                                                                                                                                             |
|------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Contingência** | Se scope creep já estiver em andamento: aplicar MoSCoW imediatamente na sprint afetada. Itens classificados como Could e Won\'t saem da sprint sem negociação. O backlog futuro os absorve. |

**3.3 Riscos Médios e Baixos**

|        |                                                                                  |                                                                                                                                                                                        |                                                                                                                                                                              |
|--------|----------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **ID** | **Risco**                                                                        | **Mitigação**                                                                                                                                                                          | **Contingência**                                                                                                                                                             |
| RG-03  | Débito técnico acumulado nas sprints S10--S15 sem revisão periódica              | Reservar 10--15% da capacidade de cada sprint para refatoração (S8 mostrou que 38 SP é viável para uma sprint dedicada a qualidade). Nunca acumular mais de 2 sprints sem revisão.     | Sprint dedicada de refatoração, como S8. Prioridade aumenta se cobertura de testes começar a cair ou se o número de bugs reportados aumentar.                                |
| RG-04  | Aprovador de prod indisponível bloqueia deploy urgente                           | Definir dois aprovadores no GitHub Environment \'production\'. Documentar critério de break-glass (deploy sem aprovação com log de auditoria obrigatório e post-mortem dentro de 48h). | Break-glass: deploy.sh deploy prod \<tag\> diretamente no servidor. Requer registro manual no changelog e post-mortem obrigatório.                                           |
| RG-05  | Ambiente de produção não provisionado: DNS, SSL e secrets ainda não configurados | Iniciar provisionamento do ambiente de produção em S13, não S15. DNS e SSL têm latência de propagação de até 48h --- deixar para S15 cria risco de go-live atrasado.                   | Se DNS não propagar até S15: usar IP direto + certificado autoassinado para smoke tests internos, migrar para domínio em S15+1.                                              |
| RG-06  | Cobertura de testes cai abaixo de 90% ao adicionar código React (S12--S14)       | Configurar thresholds separados no jest.config: backend ≥ 90% (bloqueia PR), frontend ≥ 70% (warning + issue P2). React tem mais limitações de cobertura que Node.js puro.             | Se cobertura backend cair: bloquear merge via CI até correção. Se frontend: criar issue P2, não bloquear --- evita paralisar entrega de feature por limitação de ferramenta. |

**4. Monitoramento Contínuo**

Os riscos identificados têm indicadores observáveis nos sistemas já implementados. A revisão não exige processos separados --- está integrada ao pipeline de CI e ao Grafana.

|           |                                                     |                                                                         |                   |                 |
|-----------|-----------------------------------------------------|-------------------------------------------------------------------------|-------------------|-----------------|
| **Risco** | **Sinal de Materialização**                         | **Como Monitorar**                                                      | **Frequência**    | **Responsável** |
| RT-01     | Quarto OCUPADO sem reserva ATIVA                    | Query reconciliação (runbook S. 4.2) + alerta BancoDeDadosIndisponivel  | Semanal (pré-S11) | Dev             |
| RT-02     | Dados ausentes após restart do container            | docker logs hotel-api pós-restart; comportamento esperado e documentado | A cada restart    | Dev             |
| RT-03     | /metrics retorna 200 sem credencial em staging      | curl https://hotel-staging.app/metrics no pipeline de staging           | Pré-go-live (S15) | CI/CD           |
| RT-04     | SP consumido de S11 \> 60% na primeira semana       | Burndown diário da aba \'Burndown SP\' da planilha                      | Diário em S11     | Dev             |
| RT-05     | Crescimento anômalo de séries no Prometheus         | GET /api/v1/label/\_\_name\_\_/values --- comparar count entre semanas  | Semanal           | Dev             |
| RT-07     | BACKUP_FILE ausente ou desatualizado                | ls -la /opt/hotel-reservas/\*.backup\* antes de cada deploy             | Pré-deploy        | Deploy script   |
| RT-08     | Mais de 2 falhas E2E não determinísticas por semana | GitHub Actions: histórico de runs do job e2e-smoke                      | Semanal (S14+)    | CI              |
| RT-09     | CPF ou email completo em logs de staging            | grep -r \'cpf\\@.\*\\\' nos logs antes de go-live                       | Pré-S15           | Dev             |
| RG-01     | Sprint sem screencast ou sem decisões documentadas  | Checklist do DoD ao fechar cada sprint                                  | Por sprint        | Dev             |
| RG-02     | SP planejado da sprint \> histórico + 15%           | Aba \'Burndown SP\' da planilha de projeto                              | Por sprint        | Dev             |
| RG-03     | Cobertura de testes caindo sprint a sprint          | jest \--coverage no CI (badge no README)                                | Por PR            | CI              |

Revisão completa do risk register recomendada no início das sprints S10, S11, S14 e S15 --- sprints com maior concentração de riscos ativos. Cada revisão deve atualizar o status dos riscos (ativo / mitigado / materializado / obsoleto) e adicionar novos riscos identificados durante a sprint anterior.
