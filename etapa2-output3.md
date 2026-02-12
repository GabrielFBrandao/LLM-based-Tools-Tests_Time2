# Architecture Decision Records (ADRs)

## ADR-001: Escolha da Arquitetura Monolítica Modular
**Status:** Aceito  
**Data:** 2024  
**Decisores:** Equipe de Arquitetura

### Contexto
Sistema de reserva para um único hotel com 3 módulos (Quartos, Hóspedes, Reservas).
Necessidade de desenvolvimento rápido, baixo custo operacional e facilidade de manutenção.

### Decisão
Adotar arquitetura Monolítica Modular em Camadas ao invés de microserviços.

### Justificativa
- Escopo limitado (1 hotel, ~50-200 quartos)
-  Operações CRUD simples sem necessidade de escalabilidade independente
-  Equipe pequena (2-3 desenvolvedores)
-  Performance superior (2-10ms vs 50-200ms)
-  Custo 60-70% menor que microserviços
-  Complexidade reduzida

### Consequências
**Positivas:**
-  Deploy simplificado (1 artefato)
-  Debugging facilitado
-  Transações ACID nativas
-  Desenvolvimento 50% mais rápido

**Negativas:**
- Escalabilidade horizontal limitada (mitigado: suficiente para o contexto)
- Acoplamento de deploy (mitigado: módulos isolados)

### Alternativas Consideradas
-  Microserviços: Rejeitado por complexidade excessiva e custo alto
-  Serverless: Rejeitado por cold start e custo imprevisível

---

## ADR-002: Banco de Dados Relacional Único
**Status:** Aceito  
**Data:** 2024  
**Decisores:** Equipe de Arquitetura

### Contexto
Necessidade de armazenar dados de quartos, hóspedes e reservas com relacionamentos fortes e transações ACID.

### Decisão
Utilizar PostgreSQL como banco de dados único e centralizado.

### Justificativa
-  Relacionamentos fortes entre entidades (Reserva  Quarto + Hóspede)
-  Necessidade de transações ACID (criar reserva + atualizar status)
-  Joins eficientes para listagens
-  Validações de integridade referencial
-  Suporte a índices e otimizações

### Consequências
**Positivas:**
-  Consistência de dados garantida
-  Queries complexas simplificadas (JOINs)
-  Backup e recovery centralizados
-  Performance excelente para o volume esperado

**Negativas:**
- Ponto único de falha (mitigado: replicação read-replica)
- Escalabilidade limitada (mitigado: suficiente para 1 hotel)

### Alternativas Consideradas
-  MongoDB: Rejeitado por falta de transações ACID robustas
-  Banco por microserviço: Rejeitado por não usar microserviços

---

## ADR-003: Comunicação Síncrona entre Módulos
**Status:** Aceito  
**Data:** 2024  
**Decisores:** Equipe de Arquitetura

### Contexto
Módulos precisam se comunicar (ex: Reservas precisa atualizar status de Quartos).

### Decisão
Utilizar chamadas de método diretas (in-process) entre módulos via injeção de dependência.

### Justificativa
-  Performance: nanossegundos vs milissegundos
-  Simplicidade: sem overhead de rede ou serialização
-  Transações: ACID nativo do banco
-  Debugging: stack trace completo

### Consequências
**Positivas:**
-  Latência mínima (< 1ms)
-  Código simples e direto
-  Transações atômicas

**Negativas:**
- Acoplamento temporal (mitigado: operações rápidas)
- Sem isolamento de falhas (mitigado: tratamento de exceções)

### Alternativas Consideradas
-  Message Queue (RabbitMQ/Kafka): Rejeitado por complexidade desnecessária
-  HTTP interno: Rejeitado por overhead de rede

---

## ADR-004: Padrão de Camadas (Layered Architecture)
**Status:** Aceito  
**Data:** 2024  
**Decisores:** Equipe de Arquitetura

### Contexto
Necessidade de organizar código de forma clara, testável e manutenível.

### Decisão
Adotar padrão de 4 camadas: Controller → Service → Repository → Database

### Justificativa
-  Separação de responsabilidades clara
-  Testabilidade (mock de camadas inferiores)
-  Reutilização de lógica de negócio
-  Padrão amplamente conhecido

### Consequências
**Positivas:**
-  Código organizado e previsível
-  Testes unitários facilitados
-  Manutenção simplificada
-  Onboarding rápido

**Negativas:**
- Overhead de camadas (mitigado: mínimo para operações simples)

### Estrutura:
```
Controller: Validação de entrada, HTTP
Service: Regras de negócio, orquestração
Repository: Acesso a dados, queries
Database: Persistência
```

---

## ADR-005: Validação em Múltiplas Camadas
**Status:** Aceito  
**Data:** 2024  
**Decisores:** Equipe de Arquitetura

### Contexto
Necessidade de garantir integridade dos dados e segurança (RNF04.1).

### Decisão
Implementar validação em 3 níveis:
1. Frontend (UX)
2. Controller/DTO (formato)
3. Service (regras de negócio)

### Justificativa
-  Defesa em profundidade
-  Feedback rápido ao usuário (frontend)
-  Segurança (backend valida tudo)
-  Integridade de dados

### Consequências
**Positivas:**
-  Dados sempre consistentes
-  Melhor experiência do usuário
-  Segurança reforçada

**Negativas:**
- Duplicação de lógica (mitigado: validações diferentes em cada camada)

### Exemplo:
```
Frontend: CPF com máscara, formato visual
Controller: CPF com 11 dígitos, formato válido
Service: CPF único no banco, dígitos verificadores
```

---

## ADR-006: Gerenciamento de Estado de Quartos
**Status:** Aceito  
**Data:** 2024  
**Decisores:** Equipe de Arquitetura

### Contexto
Quartos têm 4 estados (Livre, Ocupado, Manutenção, Limpeza) que afetam disponibilidade para reserva.

### Decisão
Implementar máquina de estados no QuartosService com transições controladas.

### Justificativa
-  Regra crítica: apenas quartos "Livre" podem ser reservados
-  Transições automáticas (criar reserva → Ocupado)
-  Validações centralizadas
-  Auditoria de mudanças de estado

### Consequências
**Positivas:**
-  Consistência garantida
-  Regras de negócio centralizadas
-  Fácil adicionar novos estados

**Negativas:**
- Lógica adicional no service (mitigado: bem encapsulada)

### Transições Permitidas:
```
Livre → Ocupado (criar reserva)
Ocupado → Livre (cancelar reserva)
Livre → Manutenção (manual)
Livre → Limpeza (manual)
```

---

## ADR-007: Estratégia de Caching
**Status:** Aceito  
**Data:** 2024  
**Decisores:** Equipe de Arquitetura

### Contexto
Requisito RNF02.1: listas devem carregar em < 2s. Dados de quartos e hóspedes mudam pouco.

### Decisão
Implementar cache em memória (Redis opcional) para:
-  Lista de quartos disponíveis (TTL: 30s)
-  Dados de hóspedes (TTL: 5min)

### Justificativa
-  Performance: reduz carga no banco
-  Simplicidade: invalidação fácil (mesmo processo)
-  Custo: Redis opcional (pode usar cache local)

### Consequências
**Positivas:**
-  Listas carregam em < 100ms
-  Redução de 70-80% nas queries ao banco
-  Escalabilidade melhorada

**Negativas:**
- Dados podem ficar desatualizados por até 30s (aceitável)
- Memória adicional (mitigado: volume pequeno)

### Estratégia de Invalidação:
```
Criar/Editar Quarto → Invalida cache de quartos
Criar/Editar Hóspede → Invalida cache de hóspedes
Criar/Cancelar Reserva → Invalida cache de quartos
```

---

## ADR-008: Autenticação e Autorização
**Status:** Aceito  
**Data:** 2024  
**Decisores:** Equipe de Arquitetura

### Contexto
Sistema será usado por recepcionistas. Necessidade de controle de acesso.

### Decisão
Implementar autenticação via JWT (JSON Web Tokens) com sessões stateless.

### Justificativa
-  Stateless: facilita escalabilidade horizontal
-  Padrão da indústria
-  Simples de implementar
-  Suporta refresh tokens

### Consequências
**Positivas:**
-  Escalabilidade horizontal sem sessões compartilhadas
-  Performance (sem consulta ao banco por request)
-  Segurança adequada

**Negativas:**
- Tokens não podem ser revogados facilmente (mitigado: TTL curto + refresh token)

### Implementação:
```
Access Token: 15 minutos
Refresh Token: 7 dias
Armazenamento: HttpOnly Cookie (XSS protection)
```

---

## ADR-009: Tratamento de Erros e Logging
**Status:** Aceito  
**Data:** 2024  
**Decisores:** Equipe de Arquitetura

### Contexto
Necessidade de debugging eficiente e monitoramento de erros.

### Decisão
Implementar logging estruturado com níveis e tratamento centralizado de erros.

### Justificativa
-  Debugging facilitado
-  Monitoramento de produção
-  Rastreabilidade de operações
-  Conformidade (auditoria)

### Consequências
**Positivas:**
-  Erros rastreáveis
-  Métricas de saúde do sistema
-  Auditoria completa

**Negativas:**
- Volume de logs (mitigado: rotação e níveis)

### Níveis de Log:
```
ERROR: Falhas críticas (ex: banco indisponível)
WARN: Situações anormais (ex: CPF duplicado)
INFO: Operações importantes (ex: reserva criada)
DEBUG: Detalhes técnicos (apenas dev)
```

---

## ADR-010: Estratégia de Testes
**Status:** Aceito  
**Data:** 2024  
**Decisores:** Equipe de Arquitetura

### Contexto
Necessidade de garantir qualidade e facilitar refatoração (RNF05.1).

### Decisão
Implementar pirâmide de testes:
-  70% Testes Unitários (services, validators)
-  20% Testes de Integração (controllers + repository)
-  10% Testes E2E (fluxos críticos)

### Justificativa
-  Cobertura adequada
-  Feedback rápido (unitários < 1s)
-  Confiança em refatorações
-  CI/CD eficiente

### Consequências
**Positivas:**
-  Bugs detectados cedo
-  Refatoração segura
-  Documentação viva (testes como exemplos)

**Negativas:**
- Tempo inicial de desenvolvimento (mitigado: economia futura)

### Cobertura Mínima:
```
Services: 90%
Controllers: 80%
Repositories: 70%
Total: 80%
```

---

## ADR-011: Versionamento de API
**Status:** Aceito  
**Data:** 2024  
**Decisores:** Equipe de Arquitetura

### Contexto
API REST precisa evoluir sem quebrar clientes existentes.

### Decisão
Utilizar versionamento via URL:
```
/api/v1/quartos
```

### Justificativa
-  Clareza (versão explícita na URL)
-  Simplicidade (sem headers customizados)
-  Compatibilidade com ferramentas (Swagger, Postman)

### Consequências
**Positivas:**
-  Evolução controlada da API
-  Clientes não quebram
-  Documentação clara por versão

**Negativas:**
- Manutenção de múltiplas versões (mitigado: deprecação planejada)

### Política:
```
v1: Versão inicial (suporte: 12 meses)
v2: Mudanças breaking (quando necessário)
Deprecação: 6 meses de aviso
```

---

## Resumo das Decisões

| ADR | Decisão | Impacto | Prioridade |
|-----|---------|---------|------------|
| ADR-001 | Monolito Modular | Arquitetura geral | 🔴 Crítico |
| ADR-002 | PostgreSQL único | Persistência | 🔴 Crítico |
| ADR-003 | Comunicação síncrona | Performance | 🔴 Crítico |
| ADR-004 | Padrão de camadas | Organização | 🔴 Crítico |
| ADR-005 | Validação múltipla | Segurança | 🟡 Alto |
| ADR-006 | Estado de quartos | Regra de negócio | 🟡 Alto |
| ADR-007 | Caching | Performance | 🟡 Alto |
| ADR-008 | JWT | Segurança | 🟡 Alto |
| ADR-009 | Logging estruturado | Observabilidade | 🟢 Médio |
| ADR-010 | Pirâmide de testes | Qualidade | 🟢 Médio |
| ADR-011 | Versionamento API | Evolução | 🟢 Médio |
