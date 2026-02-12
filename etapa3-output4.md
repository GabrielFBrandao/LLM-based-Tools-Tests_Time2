Vou adicionar comentários explicativos detalhados em todos os arquivos principais.

Adicionando comentários explicativos na entidade Quarto

`Quarto.ts`

+65-8

Undo

Adicionando comentários explicativos nos erros customizados

`QuartoErrors.ts`

+36-2

 Undo

Adicionando comentários explicativos nos validators

`QuartoValidators.ts`

+27-2

 Undo

Adicionando comentários explicativos nas interfaces

`IQuartoRepository.ts`

+36-3

 Undo

Adicionando comentários explicativos nos mappers

`QuartoMappers.ts`

+32-3

 Undo

Adicionando comentários explicativos detalhados no Service

`QuartosService.ts`

+84-2

 Undo

Adicionando comentários explicativos detalhados no Controller

`QuartosController.ts`

+75-2

 Undo

Adicionando comentários explicativos detalhados nas rotas

`routes.ts`

+65-2

 Undo

Criando documentação sobre decisões de implementação

`DECISOES_IMPLEMENTACAO.md`

+401-0

 Undo

🔄 Undo all changes

---

## ✅ Comentários Explicativos Adicionados!

### 📝 Documentação Completa Implementada

**1. Comentários em Código**

Adicionei comentários detalhados em todos os arquivos principais:

* ✅ **Entidade Quarto:** Explicação de State Pattern, validações, encapsulamento
* ✅ **Erros:** Justificativa de hierarquia e uso de cada erro
* ✅ **Validators:** Explicação de SRP e composição
* ✅ **Interfaces:** Justificativa de ISP e segregação
* ✅ **Mappers:** Explicação de diferentes representações
* ✅ **Service:** Comentários detalhados de cada método e decisões
* ✅ **Controller:** Explicação de responsabilidades e tratamento de erros
* ✅ **Routes:** Justificativa de Factory Pattern e convenções REST

**2. Tipos de Comentários**

Comentários de Decisão:

```typescript
/**
 * Decisão: Usar State Pattern porque:
 * - Encapsula comportamento específico de cada estado
 * - Facilita adição de novos estados (OCP)
 * - Valida transições de forma centralizada
 */
```

Comentários de Responsabilidade:

```typescript
/**
 * Responsabilidades:
 * - Orquestrar operações de negócio
 * - Validar regras de negócio
 *
 * NÃO faz:
 * - Acesso direto a banco de dados
 * - Tratamento de HTTP
 */
```

Comentários de Fluxo:

```typescript
/**
 * Fluxo:
 * 1. Validar dados de entrada
 * 2. Verificar regra de negócio
 * 3. Criar entidade
 * 4. Persistir
 * 5. Retornar DTO
 */
```

**3. Documentação Adicional**

Criei `DECISOES_IMPLEMENTACAO.md` com:

* ✅ Justificativa de cada decisão arquitetural
* ✅ Trade-offs considerados
* ✅ Alternativas rejeitadas e por quê
* ✅ Exemplos práticos de cada decisão
* ✅ Benefícios alcançados

### 🎯 Principais Decisões Documentadas

1. Arquitetura em Camadas - Por que 4 camadas
2. State Pattern - Por que não if/else
3. Validators Separados - Por que um por responsabilidade
4. Mappers Específicos - Por que diferentes representações
5. Erros Customizados - Por que hierarquia de erros
6. Dependency Injection - Por que injetar dependências
7. Interface Segregation - Por que separar Reader/Writer
8. Arrow Functions - Por que no Controller
9. Factory Pattern - Por que encapsular criação
10. Fail-Fast - Por que validar imediatamente

### 📊 Estrutura de Comentários

```typescript
/**
 * Título/Propósito
 *
 * Decisões de Design:
 * - Decisão 1 com justificativa
 * - Decisão 2 com justificativa
 *
 * Responsabilidades:
 * - O que faz
 *
 * NÃO faz:
 * - O que não faz (clareza)
 *
 * Benefícios:
 * - Benefício 1
 * - Benefício 2
 */
```

O código agora está completamente documentado com explicações claras de todas as decisões de implementação! 📚🚀
