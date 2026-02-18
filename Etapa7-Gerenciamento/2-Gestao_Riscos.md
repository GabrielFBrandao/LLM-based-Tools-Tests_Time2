# Gestão de Riscos

## Riscos Técnicos
1) Falhas de integração entre módulos (quartos, hóspedes, reservas)
- Impacto: médio/alto | Probabilidade: média
- Mitigação: contratos claros (DTOs/ports), testes de integração e smoke após merges; feature flags para ativar partes gradualmente

2) Débito técnico acumulado (prazos apertados)
- Impacto: alto | Probabilidade: média
- Mitigação: política de "refatorar pequeno e sempre"; tech debt register e teto de 15% da capacidade por sprint para dívidas críticas

3) Performance/escala insuficiente
- Impacto: alto | Probabilidade: baixa/média
- Mitigação: perfis e benchmarks em staging; métricas P95/P99; tuning incremental; caching e índices de BD

4) Segurança/autorização fracas
- Impacto: alto | Probabilidade: média
- Mitigação: autenticação/roles mínimas; validações de entrada; scanners SCA/SAST; revisão de secrets e políticas

5) Falhas de dados (integridade/consistência)
- Impacto: alto | Probabilidade: baixa/média
- Mitigação: regras de domínio fortes, transações (quando houver DB), migrações testadas; backups e testes de restauração

## Riscos Gerenciais
1) Escopo em evolução (scope creep)
- Impacto: alto | Probabilidade: média/alta
- Mitigação: governance de backlog, critérios de aceite, controle de mudanças; priorização MoSCoW

2) Estimativas imprecisas / capacidade variável
- Impacto: médio/alto | Probabilidade: média
- Mitigação: reestimativas por sprint; buffers; monitoramento da velocidade e ajuste de plano

3) Dependência de terceiros (APIs/fornecedores)
- Impacto: médio | Probabilidade: média
- Mitigação: contratos claros; mocks; SLAs; planos de contingência

4) Rotatividade/ausência de equipe
- Impacto: médio | Probabilidade: baixa/média
- Mitigação: documentação; pair programming; revisão de código; onboarding estruturado

5) Atrasos em aprovações/decisões
- Impacto: médio | Probabilidade: média
- Mitigação: cadência fixa de comitês; RACI claro; SLAs internos de aprovação
