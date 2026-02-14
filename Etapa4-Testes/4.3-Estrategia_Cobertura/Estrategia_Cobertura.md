# Input:

> "Agora, explique a estratégia de cobertura de testes definida anteriormente."

---

# Output:

# Estratégia de Cobertura de Testes

A estratégia foi organizada em duas camadas complementares — **unitários** e **integração** — cada uma com escopo, ferramental e objetivos distintos. A ideia central é que cada camada detecta um tipo diferente de problema.

---

## Camada 1 — Testes Unitários (53 testes)
Os unitários cobrem três subníveis do código de produção:

### 1a. Entidades de domínio (`entidades.test.ts`)
O ponto de partida foi testar a lógica embutida nas próprias entidades, independente de qualquer serviço. A decisão documentada no arquivo é direta: `Quarto` e `Cama` têm comportamento próprio — `copiarCom()`, `estaDisponivel`, `comodidades`, `precoFormatado` — e esse comportamento merece validação isolada. São os testes mais rápidos e estáveis da suíte inteira porque não dependem de mocks, repositórios nem frameworks.

### 1b. Repositório em memória (`repository.test.ts`)
O repositório tem lógica própria que não vem de graça: ordenação numérica de quartos ao listar, case-sensitivity na busca por número, lançamento de erro ao atualizar ID inexistente. A justificativa no arquivo é a do Princípio de Liskov — garantir que a implementação em memória respeita integralmente o contrato `IQuartoRepository`. Em um projeto com Prisma, haveria testes equivalentes contra banco real.

### 1c. QuartoService (`cadastrarQuarto.test.ts`, `editarQuarto.test.ts`)
Aqui está o maior volume. Cada arquivo começa com um mapa explícito de cobertura (a tabela no topo), dividido em categorias com prefixos de rastreabilidade:
* **FP (Fluxo Principal):** o caminho feliz em cada variação relevante. Não basta um teste genérico de sucesso — cada pós-condição importante tem seu próprio teste (ex: FP02 verifica status inicial LIVRE).
* **RN (Regras de Negócio):** uma para cada regra, com sufixo por operação (ex: na edição, mudar para o próprio número não é duplicata).
* **NP (Comportamento Negativo):** verificam ausência de efeito colateral em falha. Os testes NP01 a NP07 usam o *spy* do repositório para confirmar que `salvar()` ou `atualizar()` **não foi chamado** quando uma regra falhou.
* **IM (Imutabilidade):** garantem que `editarQuarto` não muta o objeto original (uso do `copiarCom()`).
* **CM, CB, CD, TP:** categorias menores para comodidades, camas, e tipos.

### Infraestrutura dos Unitários: Builder + Mock Configurável
* **QuartoBuilder:** Usa interface fluente para que cada teste sobrescreva apenas o campo relevante: `umQuarto().comPreco(-50).build()`. Evita que mudanças no construtor quebrem dezenas de testes.
* **MockQuartoRepository:** Mock manual centralizado com métodos expressivos (`.numeroDiponivel()`, `.salvarRetornaEntrada()`) e helpers de asserção (`.vezesSalvo`), tornando as asserções comportamentais mais legíveis que `jest.fn()`.

---

## Camada 2 — Testes de Integração (21 testes, 87 asserções)
A motivação é precisa: os unitários não conseguem responder se os serviços funcionam juntos compartilhando o mesmo estado. A principal diferença técnica é que **não há mocks** — os repositórios em memória são implementações reais.

Os 21 testes estão divididos em 4 suítes:
* **Suite 1 — Fluxo Principal:** valida o caminho feliz completo. Destacam-se testes que verificam a pós-condição no repositório compartilhado, não apenas no valor retornado.
* **Suite 2 — Consistência entre serviços:** Diferencia-se dos unitários pois testa estado compartilhado. Ex: um quarto marcado como OCUPADO pelo `ReservaService` não é aceito numa segunda reserva no `QuartoService`.
* **Suite 3 — Falhas parciais:** Aborda integridade do estado após erros. Ex: verifica que quando a reserva falha por hóspede inexistente, o quarto permanece LIVRE (evitando bugs de ordenação).
* **Suite 4 — Cenários avançados:** Inclui ciclos de vida completos (LIVRE→OCUPADO→LIVRE→OCUPADO) e fluxos exatos de API REST (zero dados pré-criados, tudo via DTOs).

---

## O padrão que atravessa ambas as camadas
Em todos os testes, o padrão **AAA (Arrange-Act-Assert)** é explícito com comentários, e todo arquivo começa com um **mapa de cobertura** que funciona como especificação executável: se está no mapa, existe um teste correspondente. Isso torna a cobertura intencional e auditável.