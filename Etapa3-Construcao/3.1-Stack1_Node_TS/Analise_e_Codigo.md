# 3.1 - Construção: Stack 1 (TypeScript) - Modelo de Dados e Gestão de Quartos

## Prompt Enviado (Interação 1)
> Para os próximos passos, considere que a stack tecnológica definida é: TypeScript + Node.js + React. Com isso:
> - Implemente as classes para: Quarto, Hóspede e Reserva;
> - Considerando o módulo de Gestão de Quartos, implemente: - Cadastro de quarto - Edição de quarto - Listagem de quartos com: - Número - Tipo - Preço por hora - Disponibilidade (Ocupado, Livre, Manutenção, Limpeza) - Suporte a múltiplas camas por quarto (Solteiro, King, Queen);
> - Garanta princípios SOLID e clean code;
> - Explique decisões de implementação em comentários.

---

## Comportamento da IA (Qodo)

A IA não gerou código apenas no chat. Atuando como um **Agente Autônomo na IDE**, ela:
1. Planejou a estrutura de pastas baseada em Clean Architecture e DDD.
2. Criou fisicamente os arquivos de configuração (`package.json`, `tsconfig.json`).
3. Criou fisicamente 26 arquivos TypeScript divididos em:
   * `src/domain/enums/`
   * `src/domain/value-objects/`
   * `src/domain/entities/`
   * `src/common/errors/`
   * `src/application/quartos/ports/`
   * `src/application/quartos/dtos/`
   * `src/application/quartos/use-cases/`
   * `src/infra/repositories/`
   * `src/demo/`

*(Nota: Os arquivos gerados encontram-se na raiz da pasta `3.1-Stack1_TypeScript/src` deste repositório).*

---

## Análise Crítica do Código Gerado

1. **Aderência Restrita a DDD e SOLID:**
   * **SRP (Single Responsibility):** A IA separou Casos de Uso (ex: `CadastrarQuarto.ts`) das Entidades de Domínio.
   * **OCP/DIP (Open/Closed e Dependency Inversion):** O acesso a dados foi abstraído via interface (`QuartoRepository.ts`), e a IA implementou um repositório em memória (`InMemoryQuartoRepository.ts`) injetado nos casos de uso.
   * **Value Objects:** Regras de validação de `CPF`, `Email`, `NumeroQuarto` e `PrecoHora` foram isoladas em classes próprias, impedindo que as Entidades fiquem infladas (Primitive Obsession anti-pattern evitado).
2. **Over-delivery Operacional:** O prompt pediu apenas a implementação das classes. A IA entregou um projeto executável completo, incluindo um script de demonstração (`quartos-demo.ts`) para provar que a lógica funciona no terminal.
3. **Comentários Arquiteturais:** A IA inseriu comentários técnicos no código justificando escolhas, como exigido no prompt. (Ex: *"Entidades usam fábricas estáticas para garantir invariantes desde a criação"*).

---

## Avaliação de Métricas

### 1. Percentual de Requisitos Atendidos
* **Requisitos Solicitados:** 9 (Classes: Quarto, Hóspede, Reserva. Módulo Quartos: Cadastro, Edição, Listagem. Atributos: Número, Tipo, Preço/hora, Disponibilidade, Camas Múltiplas).
* **Requisitos Atendidos:** 9.
* **Resultado:** **100% de atendimento.**

### 2. Atendimento aos Critérios de Aceitação
* O código atende plenamente aos critérios de SOLID e Clean Code solicitados, com forte isolamento de domínio.

### 3. Quantidade de Linhas de Código (LOC)
*(Nota: Contagem aproximada englobando apenas código executável dos 26 arquivos TypeScript gerados, excluindo comentários, interfaces puras, DTOs de tipagem e linhas em branco)*.
* **LOC Executável Estimado:** ~350 a 450 linhas.

### 4. Número de Funções/Métodos
*(Contagem explícita nas entidades, value objects, casos de uso e repositório)*.
* **Total Estimado:** ~45 funções/métodos (incluindo construtores privados, *factory methods* como `create()`, métodos de domínio como `atualizarStatus()`, e métodos de repositório/casos de uso).

### 5. Número de Interações
* Prompt inicial (definido e padronizado pelo protocolo): **1ª interação**.
* Refinamento: 0
* Correção: 0
* **Total de Interações para sucesso:** 1.