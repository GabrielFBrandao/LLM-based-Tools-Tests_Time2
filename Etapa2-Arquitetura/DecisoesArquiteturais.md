"Documente as decisões arquiteturais críticas do sistema.”
**-Resposta obtida via chat-**

---
# Decisões Arquiteturais Críticas (DAC)

## 1. Estrutura Híbrida: Monolito Modular + Microsserviços Estratégicos

### Decisão
Adotar uma abordagem híbrida que combina um núcleo monolítico modular com microsserviços para componentes críticos.

### Alternativas Consideradas
1. **Arquitetura de Microsserviços Pura**
   - **Vantagem**: Maior escalabilidade e isolamento de falhas
   - **Desvantagem**: Complexidade operacional aumentada e sobrecarga de comunicação

2. **Monolito Tradicional**
   - **Vantagem**: Simplicidade de desenvolvimento e deploy
   - **Desvantagem**: Dificuldade em escalar componentes específicos

### Justificativa
- **Custo-benefício**: Equilíbrio entre complexidade e benefícios reais
- **Time-to-market**: Desenvolvimento mais rápido no início do projeto
- **Evolução gradual**: Possibilidade de extrair microsserviços conforme necessário

### Consequências
- **Positivas**: Menor complexidade operacional inicial, deploy simplificado
- **Negativas**: Necessidade de planejamento cuidadoso para extração futura de serviços

## 2. Separação em Camadas com BFF (Backend For Frontend)

### Decisão
Implementar um padrão BFF para separar as preocupações entre frontend e backend.

### Alternativas Consideradas
1. **API Única**
   - **Vantagem**: Simplicidade
   - **Desvantagem**: Dificuldade em atender necessidades específicas de diferentes clientes

2. **GraphQL Puro**
   - **Vantagem**: Flexibilidade nas consultas
   - **Desvantagem**: Complexidade de implementação para operações de escrita

### Justificativa
- **Otimização de Dados**: Redução de over-fetching e under-fetching
- **Experiência do Desenvolvedor**: APIs mais intuitivas para consumidores específicos
- **Evolução Independente**: Frontend e backend podem evoluir de forma mais independente

### Consequências
- **Positivas**: Melhor desempenho na camada de apresentação
- **Negativas**: Código duplicado entre BFFs, necessidade de sincronização

## 3. Estratégia de Persistência Híbrida

### Decisão
Utilizar múltiplos bancos de dados especializados (PostgreSQL, Redis, MongoDB).

### Alternativas Consideradas
1. **Banco de Dados Único**
   - **Vantagem**: Simplicidade operacional
   - **Desvantagem**: Comprometimento de desempenho para certos casos de uso

2. **Polyglot Persistence Extrema**
   - **Vantagem**: Otimização extrema por caso de uso
   - **Desvantagem**: Complexidade de gerenciamento e consistência

### Justificativa
- **Desempenho**: Cada tecnologia otimizada para seu caso de uso específico
- **Custo**: Uso eficiente de recursos
- **Manutenção**: Ferramentas maduras e bem suportadas

### Consequências
- **Positivas**: Alto desempenho para diferentes padrões de acesso
- **Negativas**: Complexidade aumentada, necessidade de sincronização entre bancos

## 4. Padrão CQRS para Dados de Leitura/Consulta

### Decisão
Separar os modelos de comando (escrita) e consulta (leitura).

### Alternativas Consideradas
1. **Modelo Único**
   - **Vantagem**: Simplicidade conceitual
   - **Desvantagem**: Dificuldade em otimizar para ambos os casos

### Justificativa
- **Desempenho**: Otimizações específicas para leitura (ex: projeções materializadas)
- **Escalabilidade**: Escala independente de leituras e escritas
- **Manutenção**: Separação clara de responsabilidades

### Consequências
- **Positivas**: Melhor desempenho para consultas complexas
- **Negativas**: Complexidade aumentada, eventual consistência

## 5. Comunicação Assíncrona para Operações Não-Críticas

### Decisão
Usar mensageria (RabbitMQ) para operações não-críticas.

### Alternativas Consideradas
1. **Síncrono para Tudo**
   - **Vantagem**: Simplicidade
   - **Desvantagem**: Maior latência e menor resiliência

### Justificativa
- **Resiliência**: Tolerância a falhas em serviços não-críticos
- **Desempenho**: Resposta mais rápida para o usuário final
- **Escalabilidade**: Processamento em background escalável

### Consequências
- **Positivas**: Melhor experiência do usuário, sistema mais resiliente
- **Negativas**: Complexidade de implementação, eventual consistência

## 6. Estratégia de Cache em Múltiplas Camadas

### Decisão
Implementar cache em múltiplos níveis (CDN, Redis, cache do navegador).

### Justativas
- **Desempenho**: Redução da latência e carga no servidor
- **Custo**: Redução da necessidade de dimensionamento de infraestrutura

### Consequências
- **Positivas**: Melhor desempenho percebido
- **Negativas**: Complexidade de invalidação de cache

## 7. Autenticação Baseada em JWT

### Decisão
Usar JWT para autenticação stateless.

### Alternativas Consideradas
1. **Sessões no Servidor**
   - **Vantagem**: Revogação imediata de tokens
   - **Desvantagem**: Estado no servidor, menor escalabilidade

### Justificativa
- **Escalabilidade**: Sem estado no servidor
- **Desempenho**: Verificação rápida de token
- **Portabilidade**: Fácil integração entre serviços

### Consequências
- **Positivas**: Melhor escalabilidade
- **Negativas**: Dificuldade em revogar tokens antes da expiração

## 8. Containerização com Orquestração Kubernetes

### Decisão
Usar Docker e Kubernetes para implantação e orquestração.

### Justificativa
- **Portabilidade**: Execução consistente em diferentes ambientes
- **Escalabilidade**: Dimensionamento automático baseado em métricas
- **Resiliência**: Auto-cura de contêineres com falha

### Consequências
- **Positivas**: Maior confiabilidade e facilidade de implantação
- **Negativas**: Curva de aprendizado, complexidade operacional

## 9. Monitoramento e Observabilidade

### Decisão
Implementar monitoramento abrangente com métricas, logs e rastreamento distribuído.

### Justificativa
- **Manutenção**: Detecção precoce de problemas
- **Desempenho**: Identificação de gargalos
- **Custo**: Otimização de recursos

### Consequências
- **Positivas**: Melhor visibilidade do sistema
- **Negativas**: Sobrecarga de processamento e armazenamento

## 10. Estratégia de Implantação: Blue-Green Deployments

### Decisão
Usar implantações blue-green para atualizações sem tempo de inatividade.

### Justificativa
- **Disponibilidade**: Atualizações sem downtime
- **Rollback**: Reversão rápida em caso de problemas
- **Testes**: Possibilidade de teste em produção (shadow traffic)

### Consequências
- **Positivas**: Maior disponibilidade
- **Negativas**: Maior complexidade e custo de infraestrutura

---

**Nota**: Todas as decisões foram tomadas considerando o equilíbrio entre desempenho, escalabilidade, manutenibilidade e custo, com foco nas necessidades específicas de um sistema de reservas de hotel.

