# 4.1 - Testes Unitários Stack 1 (Node/Jest)

## Prompt Enviado
> Retomando a Stack 1 (TypeScript + Node.js + React) implementada anteriormente:
> Crie testes unitários para:
> * Cadastro de quarto
> * Edição de quarto

---

## Análise da Resposta

### Comportamento da Ferramenta
Após uma falha de *timeout/limite de tokens* na primeira tentativa, a execução via "Tentar Novamente" foi um sucesso absoluto. A IA leu o arquivo PoC anterior e tomou uma decisão arquitetural crucial: **extraiu as classes de Domínio, Repository e Service do arquivo React para módulos TypeScript puros (`src/domain.ts`, `src/service.ts`) para permitir testes isolados em ambiente Node.**

### Qualidade Técnica Observada
A ferramenta gerou **53 testes unitários** automatizados e os executou internamente antes de entregar o ZIP. As decisões técnicas foram de nível Sênior:

1. **Padrão Fluent Builder (`QuartoBuilder`):** Criou builders para instanciar objetos complexos nos testes sem repetição de código (ex: `umQuarto().comNumero("201").build()`).
2. **Mocks Configuráveis:** Ao invés de espalhar `jest.fn()` pelo código, criou uma classe `MockQuartoRepository` com métodos expressivos (`.numeroDiponivel()`, `.salvarRetornaEntrada()`) e *Spies* para verificar comportamento.
3. **Mapas de Cobertura (Coverage Maps):** Inseriu matrizes de casos de teste no cabeçalho dos arquivos, documentando a intenção de cada teste (Caminho Feliz, Regras de Negócio, Testes Negativos).
4. **Testes Negativos Explícitos:** Verificou ativamente se os métodos `salvar()` e `atualizar()` **não** são chamados quando uma validação falha, prevenindo side-effects.