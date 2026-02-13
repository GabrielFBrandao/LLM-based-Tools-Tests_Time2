# 3.2 - Implementação Stack 2 (Java + Spring Boot)

## Prompt Enviado
> Agora, para fins de comparação experimental, vamos mudar a tecnologia.
> Gere a implementação do MESMO escopo (Módulo de Gestão de Quartos), mas utilizando a **Stack 2: Java 17 + Spring Boot 3**.
> ... (resto do prompt igual ao anterior)

---

## Resposta da IA (Análise)

Diferente da Stack 1 (Node/React), onde a ferramenta optou por uma implementação simplificada em arquivo único, para a Stack Java ela gerou um **projeto Maven completo e estruturado**, entregue via arquivo ZIP.

### Estrutura Implementada
O projeto segue o padrão clássico de Camadas do Spring Boot:
* **Controller:** Camada REST (`QuartoController`)
* **Service:** Regras de Negócio (`QuartoService` com `@Transactional`)
* **Repository:** Interface `JpaRepository`
* **Model/Entity:** Classes anotadas com JPA (`@Entity`, `@Embeddable` para Cama)
* **DTO:** Records ou Classes para transferência de dados.

### Decisões Técnicas Notáveis
* **Cama como Value Object:** Modelada como `@Embeddable` (`@ElementCollection`), o que simplifica o banco de dados (tabela `quarto_camas` gerenciada automaticamente pelo Hibernate).
* **Enum Rico:** Lógica de domínio (`aceitaReservas()`) dentro do Enum `StatusQuarto`, evitando "Service anêmico".
* **Tratamento de Erros:** Implementação do padrão **RFC 9457 (Problem Details)** para erros de API.
* **Testes:** Inclusão de testes unitários (`QuartoServiceTest`).

### Comparativo Stack 1 vs Stack 2
A geração de código Java foi significativamente mais robusta e "pronta para produção" do que a versão Node.js. A ferramenta parece ter mais facilidade em seguir os padrões rígidos do Spring do que em escolher uma arquitetura no ecossistema flexível do JavaScript.