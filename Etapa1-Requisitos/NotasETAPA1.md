# Etapa 1 - Requisitos (Elicitação e Histórias de Usuário)

## 1.1. Elicitação de Requisitos

### O que foi solicitado?
Atuando como Analista de Requisitos e Product Owner, a ferramenta deveria elicitar os Requisitos Funcionais (RF) e Não Funcionais (RNF) para um Sistema de Reserva de Hotel.

### Resultados da Geração (Qodo)
A ferramenta demonstrou boa capacidade de levantamento de requisitos de software, mas apresentou comportamentos peculiares de IAs integradas a IDEs.

**Destaques e Análise Comparativa:**
1. **Falta de Estruturação Visual:** Diferente do Claude que organizou tudo em tabelas Markdown de forma proativa, o Qodo gerou texto contínuo.
2. **Inconsistência (Alucinação Leve):** A IA colocou no título a promessa de "Priorização MoSCoW", mas não aplicou as tags (*Must, Should, Could, Won't*) em nenhum dos requisitos listados.
3. **Vazamento de Contexto da IDE:** No RF-19, o Qodo sugeriu "paleta de cores verde e azul". Isso indica que a IA leu o contexto de outros arquivos abertos no VS Code ou do histórico da interface do usuário, inserindo regras de design que não foram solicitadas no prompt.
4. **Precisão nos Não Funcionais (RNF):** Apesar das falhas de formatação, a qualidade dos RNFs foi muito alta, trazendo métricas testáveis (ex: "tempo de resposta em até 2 segundos com até 5.000 registros" no RNF-02) e requisitos legais (LGPD no RNF-10).

### Conclusão Parcial
O Qodo atende bem ao papel de elicitação, mas exige revisão humana rigorosa para remover alucinações de contexto (vazamento da IDE) e garantir o cumprimento estrito das instruções dadas (como o uso do MoSCoW).

## 1.2. Priorização MoSCoW

### O que foi solicitado?
Classificação dos requisitos previamente gerados utilizando a matriz de priorização MoSCoW (Must, Should, Could, Won't).

### Resultados da Geração (Qodo)
A IA corrigiu sua omissão anterior e gerou a classificação solicitada.

**Destaques:**
1. **Concisão Extrema:** O Qodo listou apenas os identificadores (RF-XX, RNF-XX). É uma abordagem muito comum em ferramentas de autocomplete de código (focadas em não poluir a tela), mas menos amigável para leitura de documentação pura do que a abordagem adotada pelo Claude.
2. **Won't Have Inteligente:** A IA gerou requisitos "negativos" excelentes para fechar o escopo da V1 (sem gateway de pagamento, sem multi-filiais).
3. **Assunções de Negócio:** Nas notas finais, o Qodo justificou escolhas arquiteturais atreladas aos requisitos, como justificar o *Soft Delete* para integridade de dados.

### Conclusão Parcial
O Qodo lida muito bem com correções de escopo via "follow-up prompts". Sua natureza de assistente de IDE faz com que suas respostas textuais sejam mais diretas e menos "formatadas para apresentação" do que as do Claude, focando estritamente no dado bruto.

## 1.3. Histórias de Usuário e BDD

### O que foi solicitado?
Criação de histórias de usuário no formato padrão (Como... quero... para que...) e inclusão de critérios de aceitação no formato GWT (Given-When-Then).

### Resultados da Geração (Qodo)
A ferramenta foi exaustiva e gerou um backlog completo (17 Histórias de Usuário) cobrindo todos os requisitos elicitados anteriormente.

**Destaques:**
1. **Rastreabilidade Proativa:** A IA fechou a resposta com um mapeamento automático cruzando os IDs das Histórias de Usuário com os IDs dos Requisitos (RF/RNF) e as Personas (Admin/Atendente/Manutenção), agregando grande valor ao planejamento.
2. **Sintaxe BDD Achatada:** O Gherkin foi gerado em formato linear (uma linha por critério). Embora seja excelente para leitura humana, exigiria refatoração para inserção direta em frameworks de teste como Cucumber.

## 1.4. Modelagem de Casos de Uso

### O que foi solicitado?
Definição dos casos de uso principais do sistema, incluindo Atores, Pré-condições e Pós-condições.

### Resultados da Geração (Qodo)
A ferramenta listou 14 Casos de Uso detalhados e consistentes com o contexto gerado nas subetapas anteriores.

**Destaques:**
1. **Completude (Exaustividade):** O Qodo tem uma forte tendência a mapear 100% do domínio em cada resposta. Ele transformou todas as 17 Histórias de Usuário anteriores em 14 Casos de Uso formais.
2. **Retenção de Contexto:** A IA lembrou perfeitamente dos papéis definidos e até de detalhes secundários (como a alucinação da "paleta verde e azul" gerada no primeiro prompt), demonstrando uma janela de contexto robusta.
3. **Foco Técnico (Backend):** As pós-condições focaram fortemente em banco de dados e observabilidade ("Registro de auditoria gerado", "operação transacional", "soft delete"), revelando o viés técnico profundo da ferramenta (Codeium).

## 1.5. Rastreabilidade de Requisitos

### O que foi solicitado?
Vincular os requisitos (RFs e RNFs) às histórias de usuário correspondentes, criando uma matriz de rastreabilidade inicial.

### Resultados da Geração (Qodo)
A ferramenta gerou um mapeamento completo e extremamente preciso, relacionando os 36 requisitos às 17 histórias de usuário.

**Destaques:**
1. **Memória de Longo Prazo:** A ferramenta acessou com sucesso o contexto gerado nas etapas 1.1 e 1.3 sem perder a numeração ou o significado de nenhuma *feature*.
2. **Mapeamento N:N:** A IA demonstrou conhecimento técnico ao cruzar requisitos de UI (Feedback Visual) e Banco de Dados (Persistência) com histórias operacionais (como Cadastrar Quarto).
3. **Compreensão de Transversalidade:** Requisitos não funcionais arquiteturais foram corretamente identificados como "transversais", afetando o sistema como um todo.

---

## Conclusão Final da Etapa 1 (Qodo vs Protocolo)

O Qodo atua na Etapa de Requisitos de forma muito pragmática, comportando-se como um Tech Lead técnico em vez de um Product Owner focado em negócios.

**Pontos Fortes:**
* **Exaustividade:** Ele prefere mapear o sistema inteiro de uma vez (gerando 17 US e 14 UC) a obedecer limites numéricos restritos de prompts (como "faça apenas 3").
* **Retenção de Contexto:** Consegue cruzar dezenas de IDs e regras de negócio geradas em prompts separados de forma impecável.
* **Profundidade Técnica:** Suas pré e pós-condições, bem como RNFs, focam rapidamente em persistência, auditoria, banco de dados e arquitetura.

**Pontos de Atenção:**
* **Formatação Simples:** Prefere texto puro ou listas com *bullets* em vez de tabelas ricas, focando na velocidade de leitura dentro da IDE.
* **Viés de Código/IDE:** Tende a absorver contexto externo (como estilos CSS ou paletas de cores abertas no editor) e aluciná-los como requisitos de negócio.