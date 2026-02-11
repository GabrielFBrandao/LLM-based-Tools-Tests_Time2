# Notas de Avaliação - Etapa 1 (Engenharia de Requisitos)

Este documento registra a análise crítica humana sobre os artefatos gerados pela ferramenta Claude 3.5 Sonnet na Fase de Engenharia de Requisitos.

---

## 1.1. Elicitação de Requisitos e Priorização (MoSCoW)

### Análise Geral
A ferramenta demonstrou alta capacidade de interpretação de texto e extração de regras de negócio a partir do cenário não estruturado fornecido no prompt de contexto.

### Pontos Positivos (Aderência e Corretude)
1.  **Captura de Restrições Específicas:** A IA identificou corretamente restrições visuais explícitas no prompt, como a "paleta de cores verde e azul" (RNF01) e campos de dados específicos (ex: "Há Frigobar", "Tipo de Cama").
2.  **Regras de Negócio Implícitas:** O sistema inferiu corretamente regras de integridade relacional, como "RF06 - Validar número único de quarto" e "RF11 - CPF único", que são essenciais para a consistência do banco de dados, mesmo que não estivessem explicitamente descritas como "requisitos" no texto original.
3.  **Segurança e Performance:** A IA adicionou requisitos não funcionais padrão de mercado (Sanitização de inputs/RNF08 e Tempo de resposta/RNF06), demonstrando conhecimento de boas práticas de Engenharia de Software além do texto base.

### Observações Críticas (Priorização MoSCoW)
A classificação MoSCoW foi coerente, mas apresentou decisões conservadoras que merecem nota:
* **Edição como "Should Have":** A ferramenta classificou a "Edição de Quartos" (RF03) e "Edição de Reservas" (RF14) como *Should Have*. Em um contexto de MVP (Minimum Viable Product), isso é tecnicamente aceitável (pode-se deletar e criar de novo), mas em um sistema de produção real, a edição é geralmente considerada *Must Have*.
* **Escopo Negativo (Won't Have):** A ferramenta foi muito assertiva ao excluir funcionalidades complexas que não foram solicitadas, como "Gestão Financeira" e "Check-in Automatizado", evitando o *scope creep* (aumento descontrolado de escopo).

### Conclusão da Subetapa
O resultado é **aprovado**. A lista de requisitos serve como base sólida para a criação das Histórias de Usuário e Diagramas subsequentes, exigindo ajustes mínimos ou nulos.

---

## 1.3. Histórias de Usuário e Critérios de Aceite

### 📊 Análise Geral
A ferramenta demonstrou excelente domínio da sintaxe Gherkin (BDD) e da estrutura padrão de User Stories.

### Pontos Positivos
1.  **Cobertura de Cenários de Erro:** A IA não se limitou ao "Caminho Feliz" (Happy Path). Ela gerou espontaneamente cenários de exceção cruciais, como "Tentativa de cadastro com número duplicado" (HU01) e "Tentativa de reserva em quarto ocupado" (HU08).
2.  **Consistência de Status:** A lógica de transição de estados dos quartos foi perfeitamente mapeada nos critérios de aceite. Ex: Na HU11 (Cancelar Reserva), o critério *Then o status do quarto deve mudar para "Livre"* garante a integridade do negócio.
3.  **Detalhamento de UI:** Nas histórias não funcionais (HU12 e HU13), a IA especificou comportamentos de interface (chips coloridos, mensagens que desaparecem), o que facilita muito o trabalho do desenvolvedor Front-end.

### Observações Críticas
* **Validação de CPF:** A HU06 menciona "CPF válido", mas não especifica se a validação é apenas de formato (Regex) ou de dígito verificador (algoritmo oficial). Isso precisaria ser refinado na etapa de desenvolvimento.
* **Edição de Reserva (HU10):** A IA sugeriu que ao trocar um quarto na reserva, o antigo fica "Livre" e o novo "Ocupado". Embora correto logicamente, isso pode gerar conflito se o novo quarto estiver ocupado apenas em *parte* do período. O cenário assume uma simplificação de "reserva por bloco fechado", o que é aceitável para este escopo experimental.

### Conclusão da Subetapa
O artefato é de alta qualidade e pronto para ser utilizado como especificação para testes automatizados (Cucumber/Jest).

---

## 1.4. Casos de Uso Detalhados

### Análise Geral
A ferramenta apresentou um desempenho **acima do esperado**. Além de gerar os Casos de Uso solicitados com estrutura formal completa, ela gerou espontaneamente Regras de Negócio (RNs) numeradas e uma Matriz de Rastreabilidade preliminar.

### Pontos Positivos (Autonomia e Completude)
1.  **Estrutura Robusta:** Os Casos de Uso contêm Fluxos Principais, Alternativos (ex: validações de erro) e de Exceção (erros de sistema), o que é ideal para a etapa de QA (Testes).
2.  **Lógica de Negócio Complexa:** No UC09 (Editar Reserva), a IA descreveu corretamente a lógica de troca de quartos: "libera o antigo" e "ocupa o novo". Isso demonstra compreensão de estado e transição.
3.  **Proatividade:** A geração da Matriz de Rastreabilidade (UC x RF) sem ser solicitada explicitamente neste prompt economiza tempo do analista e garante alinhamento com os passos anteriores.

### Observações Críticas
* **Ator "Sistema":** A ferramenta listou "Sistema" como um ator secundário. Embora útil para visualização de automação, na modelagem UML estrita, o sistema é o sujeito (a fronteira), não um ator. Contudo, para fins de documentação ágil, é aceitável.
* **Reset de Status:** O fluxo de cancelamento (UC10) assume que o quarto volta para "Livre". Em cenários reais, o hotel poderia querer que fosse para "Limpeza" (Dirty) antes de ficar "Livre". Como essa regra não foi especificada no contexto, a IA optou pelo caminho lógico mais simples (Livre), o que está correto perante o input.

### Conclusão da Subetapa
O nível de detalhe (passo a passo dos fluxos) é suficiente para que um desenvolvedor inicie a codificação sem dúvidas sobre o comportamento esperado das telas.

---

## 1.5. Rastreabilidade e Análise de Cobertura

### Análise Geral
A ferramenta entregou um artefato de gerenciamento de projeto completo. A matriz de rastreabilidade bidirecional (Forward e Backward tracing) está correta e lógica.

### Pontos Positivos
1.  **Visão Holística:** A IA conseguiu conectar os três artefatos gerados anteriormente (Lista de Requisitos, Histórias e Casos de Uso) em uma única tabela coerente.
2.  **Identificação de Lacunas (Gap Analysis):** A IA identificou corretamente que requisitos como RNF09 (Autenticação) e RNF10 (Logs) não possuem Histórias de Usuário diretas, classificando-os como "Backend/Infraestrutura" ou "Futuro". Isso demonstra que ela não "alucinou" vínculos onde não existiam.
3.  **Planejamento de Sprints:** A sugestão de ordem de desenvolvimento (Sprint 1 a 4) é tecnicamente sólida, respeitando as dependências de dados (ex: não dá para criar reserva sem ter quarto e hóspede antes).

---

## Conclusão Final da Etapa 1
A ferramenta **Claude 3.5 Sonnet** demonstrou excelente desempenho na fase de Engenharia de Requisitos.
* **Aderência:** 100% aos prompts.
* **Qualidade:** Artefatos detalhados, tecnicamente corretos e prontos para uso em desenvolvimento.
* **Destaque:** Capacidade de manter o contexto longo (Long Context Window) sem "esquecer" os requisitos iniciais ao gerar os últimos artefatos.