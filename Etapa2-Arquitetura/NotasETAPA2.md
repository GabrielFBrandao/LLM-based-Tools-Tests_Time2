# Etapa 2 - Arquitetura e Projeto de Software

## 2.1. Definição Arquitetural

### O que foi solicitado?
Proposição de uma arquitetura para o sistema com justificativas focadas em desempenho, escalabilidade e manutenção.

### Resultados da Geração (Qodo)
A ferramenta propôs um **Monólito Modular** utilizando princípios da **Clean Architecture / Arquitetura Hexagonal**.

**Destaques:**
1. **Maturidade Técnica:** O Qodo justificou a escolha do Monólito argumentando que a baixa latência de rede interna e a facilidade de transação atômica atendem perfeitamente ao requisito RNF-09 (100 usuários simultâneos). Mencionou o uso do *Strangler Fig Pattern* para futuras migrações.
2. **Leitura de Contexto:** A IA seguiu estritamente as tecnologias e o modelo de domínio solicitados no `contexto_sistema.md` inicial.
3. **Rastreabilidade Ininterrupta:** As justificativas foram amarradas aos IDs gerados na Etapa 1 (ex: "garantir consistência (RNF-04)").

## 2.2. Decisões Arquiteturais (ADRs)

### O que foi solicitado?
Documentação das decisões arquiteturais críticas do sistema.

### Resultados da Geração (Qodo)
A ferramenta gerou 10 ADRs perfeitamente formatados, cobrindo todo o espectro do projeto (Backend, Frontend, Persistência, Segurança, Evolução). 

**Destaques:**
1. **Opinionated AI (Tomada de Decisão):** A IA assumiu o papel de Arquiteto e definiu explicitamente o ecossistema tecnológico (NestJS, React, Postgres, TypeORM), demonstrando assertividade e conhecimento de stacks modernas.
2. **Avaliação de Trade-offs:** Em todas as decisões, a ferramenta listou corretamente as consequências negativas, provando que compreende que toda escolha arquitetural possui um custo embutido (ex: complexidade de senhas, overhead de frameworks).
3. **Persistência de Memória:** A IA citou os RNFs e RFs elicitados nas primeiras etapas para justificar as decisões, garantindo rastreabilidade total desde os requisitos até a arquitetura técnica.

## 2.3. Modelagem de Sistema (Diagramas)

### O que foi solicitado?
Geração do diagrama de componentes e do diagrama de classes principal abordando as entidades: Quarto, Hóspede e Reserva.

### Resultados da Geração (Qodo)
A ferramenta gerou o código PlantUML e, agindo como um agente autônomo na IDE, criou e salvou os arquivos fisicamente no *workspace*.

**Destaques:**
1. **Atuação na IDE:** A capacidade de manipular o *File System* (criando arquivos e pastas) é um diferencial massivo do Qodo em relação a ferramentas baseadas exclusivamente em chat via navegador. 
2. **Value Objects (DDD):** A IA demonstrou conhecimento avançado de design de software ao separar conceitos em Classes de Entidade (Quarto, Hóspede) e *Value Objects* (CPF, Email), agregando métodos de validação diretamente nos tipos.
3. **Coesão:** Os diagramas refletem 100% o que foi decidido nos ADRs anteriores, sem invenção de novas tecnologias (manteve PostgreSQL, REST/JSON, SPA e Monólito Modular).

## 2.4. Padrões de Projeto

### O que foi solicitado?
Sugestão e justificativa de padrões de projeto aplicáveis ao sistema.

### Resultados da Geração (Qodo)
A ferramenta sugeriu 21 padrões de projeto (DDD, GoF, UX, Infraestrutura) mapeados diretamente para as funcionalidades do sistema de Hotel.

**Destaques:**
1. **Engenharia de Software Aplicada:** A sugestão de padrões táticos (como *Specification* para filtros de busca e *State* para a máquina de estados do Quarto) demonstra que a IA não faz apenas "recuperação de texto", mas aplica conceitos acadêmicos a problemas reais.
2. **Integração Front e Back:** Diferente de IAs que focam apenas no backend ao falar de padrões, o Qodo incluiu padrões de interface como *MVVM*, *Container-Presenter* e *Memoization*, provando ter uma visão Full-Stack do projeto.

---

## Conclusão Final da Etapa 2 (Qodo vs Protocolo)

A Etapa 2 confirmou o Qodo como uma ferramenta excepcionalmente forte em Design de Sistema e Arquitetura de Software. 

**Pontos Fortes:**
* **Opinionated e Decisivo:** Toma decisões tecnológicas claras (ex: Node.js, NestJS, Postgres, React) e as defende com trade-offs realistas nos ADRs.
* **Autonomia na IDE:** Capacidade de gerar, nomear e salvar arquivos físicos (`.puml`) diretamente no *workspace*, atuando como um co-piloto de arquitetura.
* **Domínio de DDD:** Forte compreensão de Domain-Driven Design, evidenciada pela criação de Value Objects, Domain Services e Repositories consistentes.
* **Memória de Contexto Longa:** Manteve os requisitos da Etapa 1 perfeitamente vivos durante toda a estruturação técnica.

**Pontos de Atenção:**
* **Formatação em Texto Puro:** Para a documentação, o Qodo gera blocos de texto denso sem formatação visual rica (como tabelas ou negritos estruturados), exigindo um trabalho de lapidação humana (limpeza de quebras de linha) para compor documentos oficiais.