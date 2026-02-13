# Etapa 3 – Construção (Geração de Código)

## 3.1. Stack 1: Node.js + TypeScript + React

### Resultado: Arquitetura "Single-File PoC"
Diferente de uma estrutura de projeto tradicional (vários arquivos e pastas), a ferramenta optou por gerar uma **Prova de Conceito (PoC) Unificada**. Todo o código (Entidades, Regras de Negócio, Repositório em Memória e Componentes React) foi entregue em um único arquivo `.tsx` extenso ou em blocos sequenciais na mesma resposta.

### Pontos Fortes (Qualidade de Código)
1.  **Aderência ao SOLID:**
    * **SRP:** Mesmo em um único arquivo, houve separação clara entre *Service* (Lógica), *Repository* (Dados) e *Components* (UI).
    * **DIP:** O Service depende de `IQuartoRepository` (abstração), permitindo trocar a implementação em memória por um banco real facilmente.
2.  **Imutabilidade:** A decisão de usar `readonly` e métodos `copiarCom()` nas entidades demonstra maturidade técnica avançada, ideal para evitar bugs em React.
3.  **Tipagem:** Uso estrito de TypeScript com Enums e Interfaces.

### Pontos de Fricção (Usabilidade)
1.  **Ambiente não Incluso:** O código gerado é logicamente correto, mas **não executável** imediatamente. A ferramenta não forneceu os arquivos de configuração do ambiente (`package.json`, `tsconfig.json`, `vite.config.js`).
2.  **Diagnóstico de IDE:** Ao salvar o arquivo no VS Code, o editor aponta múltiplos erros de importação (ex: `Cannot find module 'react'`), pois as dependências não foram instaladas.
3.  **Decisão de Infraestrutura:** Para evitar limites de token e complexidade de setup, a IA simulou o Backend no navegador (`QuartoRepositoryMemoria`), ao invés de criar uma API Node.js real conectada a um banco.

### Conclusão da Stack 1
A ferramenta priorizou a **corretude lógica** e a **didática** em detrimento da **estrutura de deploy**. É excelente para gerar o "núcleo" da aplicação, mas exige um desenvolvedor experiente para configurar o ambiente ao redor desse código.

## 3.2. Stack 2: Java 17 + Spring Boot 3

### Resultado: Projeto Maven Completo
A ferramenta entregou um projeto **altamente estruturado**, seguindo os padrões de mercado (Maven), com separação física de arquivos e entrega via arquivo ZIP.

### Pontos Fortes
1.  **Infraestrutura Real:** Diferente da Stack 1 (que simulou o banco), aqui a IA configurou JPA/Hibernate real, arquivos `pom.xml` com dependências corretas e `application.properties`. O projeto é compilável.
2.  **Modelagem Avançada:** O uso de `@Embeddable` para a classe `Cama` (Value Object) ao invés de uma entidade separada demonstra conhecimento profundo de modelagem relacional otimizada.
3.  **Padronização:** O código segue fielmente a arquitetura Spring (Controller -> Service -> Repository), facilitando a leitura por qualquer desenvolvedor Java.

### Conclusão Geral da Etapa 3 (Comparativo)
O experimento revelou uma diferença significativa de comportamento da IA dependendo da linguagem:
* **Node/React (Flexível):** A IA tende a simplificar, gerar "mockups" ou sofrer com a falta de padrões rígidos de projeto, resultando em código que exige setup manual pesado.
* **Java/Spring (Opinativo):** A IA performa muito melhor, gerando projetos prontos para build, com estrutura de pastas correta e configuração automática de dependências.

**Veredito:** Para geração de *scaffolding* de projetos complexos, a ferramenta é mais eficaz em stacks com frameworks "opinionated" (como Spring Boot) do que em stacks "unopinionated" (como Express/React).