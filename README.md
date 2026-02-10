# LLM-based-Tools-Tests_Time2

Os testes foram realizados na IDE Windsurf, com acesso à todas as funcionalidades do Codeium e do Agente Cascade. O modelo utilizado foi o SWE 1.0, sendo esse o modelo gratuito e de uso irrestrito da IDE. Antes dos testes, foi passado o contexto geral da aplicação (especificado no Protocolo_v1.3).

Na realização dos testes, procurei garantir que não haja nenhum contexto implícito que possa influenciar de alguma forma o resultado dos testes, portanto, criei uma nova conversa com o chat do Windsurf e segui o plano especificado no protocolo à risca.

Para garantir a rastreabilidade dos testes, cada commit será baseado na pergunta referente aos testes realizados. 


Por exemplo: 
Na etapa 1, a primeira pergunta é "1. Elicitação e estruturação de requisitos", contendo os prompts “Liste requisitos funcionais (RF) e não funcionais (RNF) para este sistema.” e “Classifique-os por prioridade (MoSCoW).”
No caso, o commit será nomeado com o nome da pergunta e conterá os artefatos gerados em cada prompt. Além disso, haverá um documento que contém as minhas anotações acerca dos resultados dos prompts enviados.


Em casos onde a ferramenta gerar arquivos juntamente com uma resposta textual no chat (ou não gerar arquivos, apenas resposta textual), irei documentá-la num .md e explicitarei que aquela resposta é resultado de um prompt em específico juntamente com o prompt em questão no início do arquivo. Caso a ferramenta gere um .md de fato, irei deixar explícito no início do documento que este é um arquivo gerado pela IA.

    
