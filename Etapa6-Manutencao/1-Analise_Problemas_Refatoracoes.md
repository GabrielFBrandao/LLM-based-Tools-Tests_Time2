# Etapa 6 - Manutenção

## 1. Problemas de qualidade identificados e sugestões de refatoração

Código analisado (original, problemas visíveis):

```
export class GerenciadorQuartos { // Método para processar reserva processar(q: any, s: string, d: any) { if (q != null) { if (s == "RESERVAR") { if (d > 0) { if (q.tipo == 1) { q.precoTotal = d 150; } else if (q.tipo == 2) { q.precoTotal = d 250; } else { q.precoTotal = d * 400; } q.status = "OCUPADO"; return q; } else { console.log("erro de dias"); return null; } } else { return false; } } return null; } } 
```

Principais problemas:
- Legibilidade muito baixa: tudo em uma única linha, aninhamento excessivo (deep nesting) e nomes crípticos (q, s, d).
- Tipagem fraca: uso de `any`, valores mágicos (1, 2, 150, 250, 400, strings de status/ação), ausência de enums ou value objects.
- Lógica incorreta e possíveis bugs:
  - `q.precoTotal = d 150;` e `d 250;` aparentam faltar o operador `*` (erro de sintaxe/lógica).
  - Retornos inconsistentes: `return q`, `return null`, `return false` (contrato indefinido/ambíguo).
- Atribuições diretas em objeto mutável externo (quebra de encapsulamento, sem validação).
- Tratamento de erro pobre: `console.log("erro de dias")` ao invés de lançar erro controlado ou retornar um resultado tipado.
- Acoplamento a representação de `q` (campo `tipo`, `status`, `precoTotal`) sem contrato/inteface.
- Regras de negócio implícitas/espalhadas: preço por dia por tipo de quarto, transição de status.
- Falta de testes e separação de preocupações (cálculo de preço, validação e mudança de status tudo junto).

Sugestões de refatoração:
- Introduzir tipagem explícita com interfaces e enums (`TipoQuarto`, `AcaoReserva`, `StatusQuarto`).
- Normalizar retorno: usar um tipo de retorno claro (ex.: `ResultadoProcessamento` com sucesso/erro) ou lançar exceções de domínio.
- Separar responsabilidades: cálculo de preço, validação de entrada e transição de status.
- Remover valores mágicos: usar um mapa de tarifário por tipo de quarto.
- Evitar mutabilidade de entrada: retornar um novo objeto ou encapsular atualização em método controlado.
- Adotar guard clauses para reduzir aninhamento e melhorar legibilidade.
- Preparar para extensibilidade: adicionar novos tipos de quarto sem alterar lógica principal (Open/Closed).
