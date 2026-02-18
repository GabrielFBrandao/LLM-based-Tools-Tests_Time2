# Etapa 6 - Manutenção

## 3. Como a melhoria reduz a dívida técnica

- Tipagem forte e contratos claros:
  - Substituição de `any` por interfaces (`Quarto`, `ProcessarReservaInput`) e enums (`TipoQuarto`, `StatusQuarto`, `AcaoReserva`).
  - Reduz ambiguidade de retorno (uso de `ProcessarReservaResultado`) e facilita testes e evolução.

- Remoção de valores mágicos e centralização de regras:
  - Mapa `TARIFA_DIARIA_POR_TIPO` concentra o tarifário, tornando simples alterar/adicionar tipos sem mexer em `if/else` espalhados.

- Melhor legibilidade e manutenibilidade:
  - Guard clauses reduzem aninhamento e deixam as pré-condições explícitas.
  - Nomes significativos para variáveis e parâmetros (`quarto`, `acao`, `dias`).

- Encapsulamento e imutabilidade:
  - Evita mutar o objeto recebido; retorna uma cópia atualizada. Isso reduz efeitos colaterais e bugs difíceis de rastrear.

- Tratamento de erros padronizado:
  - Ao invés de `console.log` e retornos heterogêneos (`null`/`false`), usa-se um resultado tipado com `sucesso`/`erro`, que facilita instrumentação e logs padronizados.

- Extensibilidade e teste:
  - Código mais modular: cálculo de preço destacado por tabela; fácil de cobrir com testes unitários e de negócio.
  - Preparado para integração com camadas de domínio mais ricas (ex.: VO para dias, políticas sazonais, descontos).

- Alinhamento a boas práticas (SOLID/clean code):
  - Responsabilidade única do método `processar` (valida, calcula e projeta novo estado padronizado), sem misturar I/O ou logs arbitrários.
  - Aberto para extensão (novos tipos/regras) com baixo acoplamento.

Resultado: menor probabilidade de regressões, menor custo de evolução de regras e maior confiabilidade operacional.
