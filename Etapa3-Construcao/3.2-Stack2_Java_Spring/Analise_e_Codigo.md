# 3.2 - Construção: Stack 2 (Java + Spring Boot) - Modelo de Dados e Gestão de Quartos

## Prompt Enviado (Interação 1)
> Para os próximos passos, considere que a stack tecnológica definida agora é: Java + Spring. Com isso:
> - Implemente as classes para: Quarto, Hóspede e Reserva;
> - Considerando o módulo de Gestão de Quartos, implemente: - Cadastro de quarto - Edição de quarto - Listagem de quartos com: - Número - Tipo - Preço por hora - Disponibilidade (Ocupado, Livre, Manutenção, Limpeza) - Suporte a múltiplas camas por quarto (Solteiro, King, Queen);
> - Garanta princípios SOLID e clean code;
> - Explique decisões de implementação em comentários.

---

## Comportamento da IA (Qodo)

Atuando como um **Agente Autônomo na IDE**, a ferramenta inicializou um projeto Maven/Spring Boot completo, criando 16 arquivos físicos:
1. Arquivos de configuração: `pom.xml`, `application.yml` (configurado para banco em memória H2).
2. Classe Main: `SistemaReservasApplication.java`.
3. Separação em pacotes de domínio (`com.hotel.quartos`, `com.hotel.hospedes`, `com.hotel.reservas`), contendo:
   * **Entidades/Enums:** `Quarto.java`, `Hospede.java`, `Reserva.java`, `CamaQuarto.java`, etc.
   * **Repositório:** `QuartoRepository.java` (estendendo `JpaRepository`).
   * **DTOs:** `QuartoInputDTO.java`, `QuartoUpdateDTO.java`, `QuartoListaDTO.java`.
   * **Camada de Serviço:** `QuartoService.java`.
   * **Camada de API:** `QuartoController.java`.

---

## Análise Crítica do Código Gerado

1. **Aderência ao Padrão Spring (Framework Conventions):** A IA demonstrou conhecimento profundo do ecossistema Spring. Utilizou corretamente as anotações `@RestController`, `@Service`, `@Entity`, `@OneToMany`, demonstrando que entende a injeção de dependências e o mapeamento objeto-relacional (JPA/Hibernate).
2. **Separação de Preocupações (SOLID/Clean Code):** A regra de negócio não vazou para o Controller. A IA criou DTOs específicos (`QuartoInputDTO` e `QuartoUpdateDTO`) para blindar as Entidades da borda externa da API, aplicando o Princípio da Responsabilidade Única (SRP).
3. **Persistência Imediata (H2):** Proativamente, a IA configurou o `application.yml` para rodar um banco H2 em memória, permitindo que o desenvolvedor execute o comando `mvn spring-boot:run` e teste a API imediatamente sem precisar configurar um banco de dados externo.

---

## Avaliação de Métricas 

### 1. Percentual de Requisitos Atendidos
* **Número total de requisitos solicitados:** 9 (Classes: Quarto, Hóspede, Reserva. Módulo Quartos: Cadastro, Edição, Listagem. Atributos: Número, Tipo, Preço/hora, Disponibilidade, Camas Múltiplas).
* **Número total de requisitos cobertos:** 9.
* **Resultado final (%):** **100% de atendimento.**

### 2. Atendimento aos Critérios de Aceitação
* O código atende plenamente aos critérios de SOLID e Clean Code solicitados. O uso do padrão DTO e o isolamento das anotações JPA nas Entidades provam a aderência às boas práticas do mundo Java.

### 3. Quantidade de Linhas de Código (LOC)
*(Nota: Contagem englobando apenas código executável dos arquivos `.java` e XML/YML gerados, excluindo comentários explicativos, importações e linhas em branco)*.
* **LOC Executável Estimado:** ~380 a 450 linhas.

### 4. Número de Funções/Métodos
*(Contagem explícita incluindo métodos de negócio, mapeamento de controller, injeção via construtor e setters/getters gerados explicitamente no código)*.
* **Total Estimado:** ~40 funções/métodos.

### 5. Número de Interações
* Prompt inicial (definido e padronizado pelo protocolo): **1ª interação**.
* Refinamento: 0
* Correção: 0
* **Total de Interações para atingir o resultado correto:** 1.