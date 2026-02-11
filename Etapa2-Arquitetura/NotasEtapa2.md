# Arquitetura

A proposta de arquitetura apresentada pelo modelo SWE 1.0 demonstra um domínio teórico avançado de padrões de desenvolvimento modernos, sugerindo uma abordagem híbrida que combina monolito modular com microsserviços estratégicos. A documentação técnica é detalhada, incluindo um diagrama de componentes coerente e a definição de uma stack tecnológica atualizada (Next.js, NestJS, Spring Boot).

No entanto, a solução evidencia um descompasso significativo entre a complexidade da engenharia proposta e o escopo do problema definido no protocolo ("um sistema para um único hotel" ). A sugestão de utilizar orquestração via Kubernetes, um poliglotismo em linguagens de programação e tecnologias e uma arquitetura orientada a eventos com RabbitMQ caracteriza um claro over-engineering. Para um sistema para um único hotel (~100 usuários concorrentes, conforme definido pelo próprio modelo na etapa anterior), tal infraestrutura introduz uma complexidade acidental que onera o desenvolvimento e a operação sem trazer benefícios proporcionais de negócio.


As justificativas apresentadas, embora corretas sob a ótica de sistemas de larga escala, mostram-se frágeis quando contextualizadas. O argumento de que a separação em microsserviços e o uso de múltiplas stacks facilitariam a manutenção é contraditório neste cenário, visto que a gestão de transações distribuídas e a carga cognitiva de manter tecnologias heterogêneas tendem a aumentar, e não reduzir, o esforço da equipe para um produto deste porte.
