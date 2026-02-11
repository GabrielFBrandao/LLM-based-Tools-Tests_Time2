# Arquitetura

A proposta de arquitetura apresentada pelo modelo SWE 1.0 demonstra um domínio teórico avançado de padrões de desenvolvimento modernos, sugerindo uma abordagem híbrida que combina monolito modular com microsserviços estratégicos. A documentação técnica é detalhada, incluindo um diagrama de componentes coerente e a definição de uma stack tecnológica atualizada (Next.js, NestJS, Spring Boot).

No entanto, a solução evidencia um descompasso significativo entre a complexidade da engenharia proposta e o escopo do problema definido no protocolo ("um sistema para um único hotel" ). A sugestão de utilizar orquestração via Kubernetes, um poliglotismo em linguagens de programação e tecnologias e uma arquitetura orientada a eventos com RabbitMQ caracteriza um claro over-engineering. Para um sistema para um único hotel (~100 usuários concorrentes, conforme definido pelo próprio modelo na etapa anterior), tal infraestrutura introduz uma complexidade acidental que onera o desenvolvimento e a operação sem trazer benefícios proporcionais de negócio.


As justificativas apresentadas, embora corretas sob a ótica de sistemas de larga escala, mostram-se frágeis quando contextualizadas. O argumento de que a separação em microsserviços e o uso de múltiplas stacks facilitariam a manutenção é contraditório neste cenário, visto que a gestão de transações distribuídas e a carga cognitiva de manter tecnologias heterogêneas tendem a aumentar, e não reduzir, o esforço da equipe para um produto deste porte.

# Decisões Arquiteturais

A análise do artefato de Decisões Arquiteturais Críticas confirma que o modelo domina a estrutura formal de documentação técnica, apresentando registros bem organizados com alternativas, justificativas e consequências. Contudo, o conteúdo das decisões reforça a tendência ao over-engineering identificada anteriormente.

A proposição de padrões de alta complexidade, como CQRS, um poliglotismo no uso de linguagens (PostgreSQL, Redis e MongoDB) e orquestração via Kubernetes, mostra-se incoerente com o escopo de um "único hotel" e a previsão de carga de aproximadamente 100 usuários definidos pelo próprio Windsurf na etapa de Requisitos. Embora as justificativas baseadas em escalabilidade e desempenho sejam teoricamente corretas para grandes ecossistemas distribuídos, sua aplicação neste cenário introduz uma complexidade acidental proibitiva. A gestão de infraestrutura para Blue-Green Deployments e a sincronização de modelos de leitura e escrita (CQRS) geram um custo operacional e cognitivo desproporcional ao valor de negócio, evidenciando uma falha na adequação da solução ao tamanho real do problema.

