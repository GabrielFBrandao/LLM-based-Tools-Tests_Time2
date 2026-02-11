“Justifique a escolha considerando desempenho, escalabilidade e manutenção.”
**-Resposta obtida via chat-**

---
# Justificativa da Arquitetura Proposta

## 1. Decisão por Arquitetura Híbrida (Monolito Modular + Microsserviços)

### Desempenho
- **Baixa Latencia**: A abordagem monolítica modular com microsserviços estratégicos reduz a sobrecarga de comunicação entre serviços, mantendo a latência baixa para operações críticas como check-in/check-out.
- **Otimização de Recursos**: Componentes menos críticos compartilham recursos de forma mais eficiente no monolito, enquanto serviços com necessidades específicas de desempenho (como pagamentos) são isolados.

### Escalabilidade
- **Escala Seletiva**: Permite escalar horizontalmente apenas os serviços que realmente precisam (ex: serviço de reservas durante picos de demanda), enquanto componentes menos críticos permanecem em um único contêiner.
- **Isolamento de Carga**: O serviço de pagamentos, por exemplo, pode ser dimensionado independentemente durante picos de check-out.

### Manutenção
- **Menor Complexidade Operacional**: Reduz a complexidade de gerenciamento em comparação com uma arquitetura totalmente baseada em microsserviços.
- **Atualizações Mais Simples**: Módulos dentro do monolito podem ser atualizados de forma coordenada, reduzindo problemas de compatibilidade.

## 2. Separação em Camadas

### Desempenho
- **Cache Estratégico**: A camada de API Gateway implementa cache para respostas comuns, reduzindo a carga nos serviços.
- **Otimização de Consultas**: Separação clara entre leitura (GraphQL) e escrita (REST) permite otimizações específicas.

### Escalabilidade
- **Escalabilidade Horizontal**: Cada camada pode ser dimensionada independentemente conforme a demanda.
- **Balanceamento de Carga**: O API Gateway gerencia a distribuição de carga entre instâncias de serviços.

### Manutenção
- **Separação de Responsabilidades**: Cada camada tem uma responsabilidade bem definida, facilitando a manutenção.
- **Testabilidade**: Camadas bem definidas permitem testes mais isolados e direcionados.

## 3. Banco de Dados Híbrido (PostgreSQL + Redis + MongoDB)

### Desempenho
- **Otimização por Caso de Uso**: PostgreSQL para transações ACID, Redis para cache e MongoDB para dados não estruturados.
- **Redução de Latência**: Redis como camada de cache para consultas frequentes.

### Escalabilidade
- **Padrão CQRS**: Separação entre comandos (escrita) e consultas (leitura) permite otimizações independentes.
- **Sharding Natural**: Dados podem ser particionados por domínio (ex: reservas ativas vs. históricas).

### Manutenção
- **Ferramentas Especializadas**: Cada banco de dados é usado para o que faz de melhor.
- **Migrações Controladas**: Ferramentas como Flyway/Liquibase para gerenciamento de esquema.

## 4. Comunicação Assíncrona com Mensageria

### Desempenho
- **Processamento em Background**: Operações não críticas (envio de e-mails, atualizações de relatórios) não impactam o fluxo principal.
- **Melhor Utilização de Recursos**: Processamento em lotes e agendamento de tarefas pesadas.

### Escalabilidade
- **Desacoplamento**: Serviços podem processar mensagens em seu próprio ritmo.
- **Resiliência**: Filas garantem que mensagens não sejam perdidas mesmo em falhas.

### Manutenção
- **Monitoramento**: Facilita o rastreamento de fluxos de trabalho assíncronos.
- **Retry Automático**: Tratamento de falhas embutido no padrão de mensageria.

## 5. Infraestrutura como Código e Contêineres

### Desempenho
- **Otimização de Recursos**: Contêineres são mais leves que VMs, com inicialização mais rápida.
- **Consistência**: Ambiente idêntico entre desenvolvimento e produção.

### Escalabilidade
- **Orquestração**: Kubernetes permite dimensionamento automático baseado em métricas.
- **Portabilidade**: Fácil migração entre nuvens ou ambientes híbridos.

### Manutenção
- **Versionamento**: Infraestrutura como código permite rastreamento de mudanças.
- **Recuperação de Desastres**: Recriação rápida de ambientes a partir do código.

## 6. Considerações de Custo

### Desempenho
- **Otimização de Custos**: Alocação de recursos baseada em demanda real.
- **Caching Estratégico**: Reduz a necessidade de dimensionamento excessivo.

### Escalabilidade
- **Crescimento Gradual**: Pode começar com menos recursos e escalar conforme necessário.
- **Otimização de Custos em Nuvem**: Escalabilidade automática reduz custos com ociosidade.

### Manutenção
- **Automação**: Reduz a necessidade de intervenção manual.
- **Monitoramento Proativo**: Identificação precoce de problemas antes que afetem os usuários.

## Conclusão

Esta arquitetura oferece um equilíbrio cuidadoso entre desempenho, escalabilidade e manutenibilidade, projetada especificamente para as necessidades de um sistema de reservas de hotel. A abordagem híbrida permite começar com uma base sólida e modular, com a flexibilidade de extrair microsserviços adicionais conforme a aplicação cresce e os requisitos evoluem.





A separação clara de responsabilidades, combinada com tecnologias modernas e práticas recomendadas de engenharia de software, garante que o sistema possa lidar com cargas variáveis de trabalho, mantenha um bom desempenho mesmo sob carga e permaneça sustentável à medida que a equipe e os requisitos mudam ao longo do tempo.

