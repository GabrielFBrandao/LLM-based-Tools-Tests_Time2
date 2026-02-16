# Etapa 3 - Construção (Geração de Código)

## 3.1. Stack 1 (TypeScript) - Domínio e Gestão de Quartos

### O que foi solicitado?
Implementação do modelo de domínio (Quarto, Hóspede, Reserva) e dos casos de uso de Gestão de Quartos (Cadastro, Edição, Listagem) usando TypeScript/Node.js, aplicando SOLID e Clean Code.

### Resultados da Geração (Qodo)
A ferramenta teve um desempenho magistral. Atuando como agente autônomo integrado à IDE, criou toda a árvore de diretórios e arquivos físicos.

**Destaques:**
1. **Zero-shot execution:** A IA não precisou de nenhum prompt corretivo (1 única interação) para gerar um projeto Node.js compilável e executável.
2. **Arquitetura de Produção:** O código gerado não é um "rascunho de estudante". A separação em `domain`, `application` e `infra` com uso de *Value Objects* demonstra código a nível de Engenheiro de Software Pleno/Sênior.
3. **Prontidão de Teste:** A IA gerou proativamente arquivos de configuração (`tsconfig.json`) e um script demo para rodar o código no terminal imediatamente.

## 3.2. Stack 2 (Java + Spring Boot) - Domínio e Gestão de Quartos

### O que foi solicitado?
Implementação exata do prompt anterior (Domínio e CRUD de Quartos), mas utilizando a stack Java + Spring Boot.

### Resultados da Geração (Qodo)
A ferramenta não apenas gerou o código das classes, mas estruturou um projeto Maven completo e compilável, separando corretamente as camadas arquiteturais.

**Destaques:**
1. **Domínio de Framework:** O Qodo gerou anotações do Spring Data JPA (`@Entity`, `@OneToMany`) e do Spring Web (`@RestController`, `@PostMapping`) com extrema precisão, respeitando as convenções da comunidade Java.
2. **Uso de DTOs:** Diferente de IAs júniores que expõem Entidades diretamente na API, o Qodo isolou a camada de apresentação usando *Data Transfer Objects* (`QuartoInputDTO`, `QuartoListaDTO`), garantindo segurança e Clean Code.

---

## Conclusão Final da Etapa 3 (Qodo vs Protocolo)

A Etapa 3 consagra a principal força motriz do Qodo: **ele não é apenas um chatbot de geração de texto, ele é um Agente de Software Autônomo integrado à IDE.**

**Pontos Fortes:**
* **Geração Física de Arquivos:** Tanto em TypeScript quanto em Java, a ferramenta manipulou o File System para criar a árvore de diretórios arquiteturalmente correta, incluindo arquivos de configuração (`package.json`, `pom.xml`, `application.yml`).
* **Zero-shot Completo:** Não foi necessária nenhuma interação de correção (re-prompt) para que ele gerasse código limpo, em conformidade com o SOLID e aderente aos paradigmas de Domain-Driven Design solicitados na Etapa 2.
* **Prontidão de Execução:** Em ambas as linguagens, a IA entregou projetos configurados para rodar imediatamente no terminal local, demonstrando um foco intenso em produtividade do desenvolvedor (Developer Experience - DX).

A ferramenta cumpriu 100% dos requisitos exigidos em ambas as stacks testadas com o número mínimo de interações possível (1 interação para cada).