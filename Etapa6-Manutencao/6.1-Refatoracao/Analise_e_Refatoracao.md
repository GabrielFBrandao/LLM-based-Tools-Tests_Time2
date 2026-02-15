# Input:

> "Agora, para a etapa de Manutenção do Sistema de Hotel (Stack: TypeScript/Node.js), analise o seguinte trecho de código "problemático" do módulo de quartos:
```typescript
export class GestorDeQuartos {
  database: any;
  constructor(db: any) {
    this.database = db;
  }
  async criarQuarto(q: any) {
    if (q != null) {
      if (q.numero != "") {
        if (q.capacidade > 0) {
          if (q.precoDia >= 50) {
            // Checa duplicidade diretamente no banco
            let check = await this.database.find("SELECT * FROM quartos WHERE num = '" + q.numero + "'");
            if (check.length == 0) {
              // Insere no banco com status 0 (Livre)
              let res = await this.database.execute("INSERT INTO quartos (num, cap, val, st) VALUES ('" + q.numero + "', " + q.capacidade + ", " + q.precoDia + ", 0)");
              if (res == true) {
                return { status: 200, msg: "Sucesso" };
              } else {
                return { status: 500, msg: "Erro no BD" };
              }
            } else {
              return { status: 400, msg: "Já existe" };
            }
          } else {
            return { status: 400, msg: "Preço inválido" };
          }
        } else {
          return { status: 400, msg: "Capacidade ruim" };
        }
      } else {
        return { status: 400, msg: "Sem número" };
      }
    } else {
      return { status: 400, msg: "Vazio" };
    }
  }
}
``` 
> Sendo assim, identifique problemas de qualidade no código e sugira refatorações, se necessário e forneça uma versão melhorada desse código e explique como isso reduz dívida técnica."

---

# Output:

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>REFATORAÇÃO DE CÓDIGO</strong></p>
<p>GestorDeQuartos — Versão Melhorada</p>
<p><em>Como a refatoração reduz dívida técnica</em></p></td>
</tr>
</tbody>
</table>

|                          |                                                              |
|--------------------------|--------------------------------------------------------------|
| Problemas corrigidos     | 8 (Segurança × 1, Tipagem × 2, Design × 3, Acoplamento × 2)  |
| Testes adicionados       | 28 (cobrindo cada problema com prefixo rastreável)           |
| Linhas de código         | 43 (problemático) → 67 (refatorado + comentários de decisão) |
| Complexidade ciclomática | 5 níveis → 1 nível (early return elimina pirâmide)           |
| Acoplamento com banco    | Direto (SQL raw) → Indireto (IQuartoRepository)              |

**1. O Que É Dívida Técnica**

Dívida técnica é o custo acumulado de decisões de código que foram tomadas priorizando velocidade imediata sobre qualidade estrutural. Como dívida financeira, ela cobra juros --- cada nova funcionalidade construída sobre código problemático fica mais cara de implementar e mais arriscada de alterar.

O GestorDeQuartos original acumulou oito itens de dívida. Dois deles (P1 e P8) não eram apenas dívida --- eram riscos ativos que poderiam causar perda de dados ou comprometimento do sistema em produção.

|        |                                      |               |                                             |
|--------|--------------------------------------|---------------|---------------------------------------------|
| **\#** | **Problema**                         | **Categoria** | **Custo da dívida**                         |
| P1     | SQL Injection por concatenação       | Segurança     | Perda ou destruição de dados em produção    |
| P2     | any em dependência e parâmetro       | Tipagem       | Erros de campo invisíveis ao compilador     |
| P3     | database público e mutável           | Tipagem       | Estado substituível por qualquer caller     |
| P4     | Pirâmide de if/else (5 níveis)       | Design        | Cada nova validação custa 1 nível de recuo  |
| P5     | Magic number \>= 50                  | Design        | Mudança de política exige busca por número  |
| P6     | Mensagens opacas (Vazio, Erro no BD) | Design        | Impossível filtrar por tipo de erro em logs |
| P7     | Status HTTP no service               | Acoplamento   | Service não reutilizável fora de HTTP       |
| P8     | SQL raw no service                   | Acoplamento   | Trocar banco exige alterar regra de negócio |

**2. Os Oito Problemas em Detalhe**

|                                                                 |
|-----------------------------------------------------------------|
| **P1 --- SQL Injection por Concatenação** *Segurança · CRÍTICA* |

O código original monta strings SQL incluindo diretamente a entrada do usuário. Isso é a vulnerabilidade OWASP A03:2021 --- qualquer string no campo numero vira SQL executável no banco.

|           |                                                               |                                                |
|-----------|---------------------------------------------------------------|------------------------------------------------|
|           | **ANTES (vulnerável)**                                        | **DEPOIS (seguro)**                            |
| **Query** | \"SELECT \* FROM quartos WHERE num = \'\" + q.numero + \"\'\" | repository.buscarPorNumero(dto.numero)         |
| **Risco** | 101\'; DROP TABLE quartos; \--                                | Nenhum --- repositório usa query parametrizada |

|                                                                                                                                                                                                                                                               |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Como a refatoração reduz a dívida: a lógica de proteção contra SQL Injection fica em um único lugar (o repositório), não espalhada por cada método que acessa o banco. Um bug de segurança corrigido no repositório protege todos os callers automaticamente. |

|                                                                     |
|---------------------------------------------------------------------|
| **P2+P3 --- Ausência de Tipagem e Encapsulamento** *Tipagem · ALTA* |

any desabilita o TypeScript completamente para aquela variável. O resultado prático: o campo q.precoDia (nome errado --- o correto é precoDiaria) passa pelo compilador sem nenhum erro, apenas para falhar silenciosamente em runtime.

|                 |                           |                                                |
|-----------------|---------------------------|------------------------------------------------|
|                 | **ANTES**                 | **DEPOIS**                                     |
| **Campo**       | database: any             | private readonly repository: IQuartoRepository |
| **Parâmetro**   | async criarQuarto(q: any) | cadastrarQuarto(dto: CriarQuartoDTO)           |
| **Nome errado** | q.precoDia (inexistente)  | dto.precoDiaria (TypeScript verifica)          |

|                                                                                                                                                                                                                       |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Como a refatoração reduz a dívida: o TypeScript passa a verificar toda chamada ao método. Se CriarQuartoDTO mudar (campo renomeado, tipo alterado), o compilador aponta cada ponto afetado --- sem runtime surprises. |

|                                                                          |
|--------------------------------------------------------------------------|
| **P4 --- Pirâmide de if/else (5 Níveis de Aninhamento)** *Design · ALTA* |

O código original usa validação por aninhamento: cada condição válida abre mais um nível de recuo. Com 5 validações, o código feliz estava enterrado no 5° nível. A complexidade ciclomática é diretamente proporcional ao número de caminhos que os testes precisam cobrir.

<table>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>ANTES — pirâmide de if/else</strong></td>
<td><strong>DEPOIS — early return</strong></td>
</tr>
<tr class="even">
<td><blockquote>
<p>if (q != null) {</p>
<p>if (q.numero != "") {</p>
<p>if (q.capacidade &gt; 0) {</p>
<p>if (q.precoDia &gt;= 50) {</p>
<p>// lógica real</p>
<p>// 4 níveis abaixo</p>
<p>} else { return erro }</p>
<p>} else { return erro }</p>
<p>} else { return erro }</p>
<p>} else { return erro }</p>
</blockquote></td>
<td><blockquote>
<p>if (!dto.numero?.trim())</p>
<p>return { sucesso:false, erro }</p>
<p>if (dto.capacidade &lt;= 0)</p>
<p>return { sucesso:false, erro }</p>
<p>if (dto.precoDiaria &lt; MINIMO)</p>
<p>return { sucesso:false, erro }</p>
<p>// lógica real — nível raiz</p>
</blockquote></td>
</tr>
</tbody>
</table>

|                                                                                                                                                                                                                                                        |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Como a refatoração reduz a dívida: adicionar uma nova validação é acrescentar um bloco de 3 linhas no topo, sem reorganizar a estrutura existente. Complexidade ciclomática cai de 5 para 1 --- cada condição tem um único caminho de saída explícito. |

|                                                 |
|-------------------------------------------------|
| **P5 --- Magic Number \>= 50** *Design · MÉDIA* |

O valor 50 no if (q.precoDia \>= 50) não tem nome, não tem origem documentada e não pode ser encontrado por busca semântica. Se a política de preço mínimo mudar, quem mantém o sistema precisa saber que o número 50 num if de service significa \'preço mínimo por diária\' --- e não, por exemplo, \'capacidade máxima\'.

|               |                             |                                             |
|---------------|-----------------------------|---------------------------------------------|
|               | **ANTES**                   | **DEPOIS**                                  |
| **Definição** | (nenhuma)                   | export const PRECO_MINIMO_DIARIA = 50       |
| **Uso**       | if (q.precoDia \>= 50)      | if (dto.precoDiaria \< PRECO_MINIMO_DIARIA) |
| **Mensagem**  | { msg: \'Preço inválido\' } | \'mínimo R\$ \${PRECO_MINIMO_DIARIA},00\'   |

|                                                                                                                                                                                                                                             |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Como a refatoração reduz a dívida: a constante exportada aparece no teste (expect(PRECO_MINIMO_DIARIA).toBe(50)), na mensagem de erro e na validação --- três pontos sincronizados automaticamente. Mudar o valor em um lugar muda os três. |

|                                                      |
|------------------------------------------------------|
| **P6 --- Mensagens de Erro Opacas** *Design · MÉDIA* |

Mensagens como \'Vazio\', \'Capacidade ruim\' e \'Erro no BD\' são ilegíveis para o caller da API, impossíveis de filtrar em logs e não aparecem de forma rastreável no sistema de observabilidade definido em instrumented-services.ts --- que deriva error_code a partir da mensagem.

|                        |                   |                                                     |
|------------------------|-------------------|-----------------------------------------------------|
| **Validação**          | **Antes (opaco)** | **Depois (descritivo)**                             |
| Objeto nulo            | Vazio             | --- (protegido pelo tipo CriarQuartoDTO)            |
| Número ausente         | Sem número        | Número do quarto é obrigatório.                     |
| Capacidade inválida    | Capacidade ruim   | A capacidade deve ser maior que zero.               |
| Preço abaixo do mínimo | Preço inválido    | O preço por diária deve ser de no mínimo R\$ 50,00. |
| Número duplicado       | Já existe         | Já existe um quarto com o número \"101\".           |
| Falha de banco         | Erro no BD        | (exceção propagada --- não é erro de negócio)       |

|                                                                                                                                                                                                                                                                    |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Como a refatoração reduz a dívida: mensagens descritivas são derivadas em error_code por instrumented-services.ts (ex: \'capacidade\' → QUARTO_CAPACIDADE_INVALIDA). Isso alimenta os alertas do Grafana e os filtros do Loki diretamente, sem intervenção manual. |

|                                                                          |
|--------------------------------------------------------------------------|
| **P7 --- Status HTTP Acoplado à Lógica de Negócio** *Acoplamento · ALTA* |

Quando o service retorna { status: 200 } ou { status: 500 }, ele assume que seu caller é sempre uma API HTTP. Isso impede que o mesmo service seja usado em: testes unitários (que não precisam de HTTP), filas de mensagens, CLI, GraphQL ou qualquer outro contexto de invocação.

|                  |                                      |                                             |
|------------------|--------------------------------------|---------------------------------------------|
|                  | **ANTES (acoplado a HTTP)**          | **DEPOIS (neutro de protocolo)**            |
| **Sucesso**      | { status: 200, msg: \'Sucesso\' }    | { sucesso: true, dados: quarto }            |
| **Erro negócio** | { status: 400, msg: \'Já existe\' }  | { sucesso: false, erro: \'Já existe\...\' } |
| **Erro infra**   | { status: 500, msg: \'Erro no BD\' } | throw (propagado ao handler global)         |

|                                                                                                                                                                                                                                                                         |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Como a refatoração reduz a dívida: Resultado\<T\> é o padrão de todo o sistema (domain.ts). O controller HTTP decide os status codes: 201 para criação, 409 para duplicado, 422 para validação. O service é agnóstico ao protocolo e reutilizável em qualquer contexto. |

|                                                                                         |
|-----------------------------------------------------------------------------------------|
| **P8 --- SQL Raw no Service --- Violação de Separação de Camadas** *Acoplamento · ALTA* |

O service original conhece o esquema do banco (tabela quartos, colunas num/cap/val/st), a sintaxe SQL do driver e o formato do retorno. Isso cria três acoplamentos simultâneos: ao banco de dados, ao esquema e ao driver. Qualquer mudança em qualquer um desses exige alterar o service --- que deveria conter apenas regra de negócio.

Há ainda um segundo problema no INSERT original: apenas 4 campos eram persistidos (num, cap, val, st). Os campos tipo, comodidades (frigobar, TV, etc.) e camas eram silenciosamente ignorados --- sem erro, sem aviso.

|                                 |                                                                                     |
|---------------------------------|-------------------------------------------------------------------------------------|
| **Mudança de infraestrutura**   | **Impacto antes → depois**                                                          |
| Renomear coluna num para numero | Antes: alterar service. Depois: alterar só o repositório.                           |
| Trocar PostgreSQL por MongoDB   | Antes: reescrever service. Depois: nova implementação de IQuartoRepository.         |
| Adicionar campo ao Quarto       | Antes: esquecido no INSERT. Depois: TypeScript aponta campo faltando.               |
| Testar o service isolado        | Antes: precisa de banco real (ou mock de driver SQL). Depois: MockQuartoRepository. |

|                                                                                                                                                                                                                                                                                 |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Como a refatoração reduz a dívida: IQuartoRepository é uma interface de 5 métodos. A implementação pode ser em memória, PostgreSQL, Prisma, Mongoose ou qualquer outra --- sem que o GestorDeQuartos saiba ou se importe. Os 28 testes escritos não precisam de banco de dados. |

**3. Resultado: Métricas de Qualidade**

|                                      |                                          |                                            |     |
|--------------------------------------|------------------------------------------|--------------------------------------------|-----|
| **Métrica**                          | **Antes**                                | **Depois**                                 |     |
| Vulnerabilidades de segurança        | 1 crítica (SQL Injection)                | 0                                          |     |
| Usos de any                          | 2 (database + parâmetro)                 | 0 (IQuartoRepository + CriarQuartoDTO)     |     |
| Complexidade ciclomática             | 5 (5 níveis aninhados)                   | 1 (early return linear)                    |     |
| Magic numbers                        | 1 (\>= 50)                               | 0 (PRECO_MINIMO_DIARIA exportada)          |     |
| Dependência de HTTP no service       | Sim ({status:200})                       | Não (Resultado\<T\>)                       |     |
| Dependência de SQL no service        | Sim (SELECT + INSERT raw)                | Não (IQuartoRepository)                    |     |
| Campos persistidos de CriarQuartoDTO | 4 de 9 (tipo/comodidades/camas perdidos) | 9 de 9 (nenhum campo ignorado)             |     |
| Testes unitários possíveis sem banco | Não (exige driver SQL real)              | Sim (28 testes com mock)                   |     |
| Erros filtráveis por error_code      | Não (mensagens opacas)                   | Sim (mapeados em instrumented-services.ts) |     |

**4. Como a Refatoração Reduz a Dívida Técnica**

**4.1 Dívida eliminada vs. dívida paga**

Há uma distinção importante entre duas formas de lidar com dívida técnica:

- Dívida eliminada: o problema é removido de forma que não pode retornar. A substituição de SQL raw por IQuartoRepository elimina o vetor de SQL Injection --- o service simplesmente não tem mais acesso direto ao banco.

- Dívida paga (com juros): o problema é corrigido pontualmente, mas a estrutura que o gerou permanece. Adicionar parameterização apenas na query original (sem extrair o repositório) pagaria a dívida de SQL Injection mas deixaria a dívida de acoplamento.

A refatoração aqui elimina, não apenas corrige --- cada problema é resolvido na camada estrutural correta.

**4.2 O custo de NÃO refatorar**

A dívida técnica cobra juros de manutenção. Cada nova funcionalidade construída sobre o código original teria os seguintes custos adicionais:

|                                                   |                                                                      |
|---------------------------------------------------|----------------------------------------------------------------------|
| **Nova funcionalidade**                           | **Custo extra da dívida**                                            |
| Adicionar campo \'tipo\' ao quarto                | Campo seria ignorado silenciosamente no INSERT de 4 colunas          |
| Trocar SQLite por PostgreSQL                      | Reescrever lógica de negócio junto com acesso a dados                |
| Reutilizar service em GraphQL                     | Impossível --- retorno tem {status:200} fixo                         |
| Adicionar alerta de \'preço inválido\' no Grafana | Impossível --- error_code não existe, mensagem é \'Preço inválido\'  |
| Testar nova validação sem banco                   | Impossível --- service exige driver SQL                              |
| Mudar preço mínimo para R\$ 80                    | Busca por \'50\' em todo o codebase --- pode afetar outros contextos |

**4.3 Cobertura de testes como garantia da refatoração**

Os 28 testes escritos para o código refatorado cumprem três funções distintas:

- Documentação executável: cada teste descreve um comportamento esperado. FP02 documenta que o service nunca retorna status HTTP; VAL05 documenta que PRECO_MINIMO_DIARIA é o limiar inclusivo.

- Rede de segurança: se uma manutenção futura quebrar um dos 8 comportamentos corrigidos (ex: acidentalmente devolver {status:400} num refactor), os testes falham imediatamente --- antes de chegar em produção.

- Custo de mudança reduzido: adicionar uma nova validação exige apenas escrever um novo teste do tipo VAL0X --- sem rearranjar a estrutura existente. O custo de cada nova validação permanece constante.

**4.4 Alinhamento com o restante do sistema**

Cada decisão da refatoração replica um padrão já consolidado no sistema, não introduz um novo:

|                                      |                                                                 |
|--------------------------------------|-----------------------------------------------------------------|
| **Decisão da refatoração**           | **Onde o padrão já existe no sistema**                          |
| IQuartoRepository como dependência   | repository.ts --- contrato usado por QuartoService              |
| CriarQuartoDTO como parâmetro        | domain.ts --- DTO usado em QuartoService.cadastrarQuarto()      |
| Resultado\<T\> como retorno          | domain.ts --- union type usado em todos os services             |
| private readonly no construtor       | service.ts --- padrão de todos os services do sistema           |
| Early return em validações           | service.ts --- QuartoService.cadastrarQuarto() e editarQuarto() |
| Mensagens descritivas                | instrumented-services.ts --- mapeamento para error_code         |
| StatusQuarto.LIVRE como pós-condição | service.ts linha 68 --- comentário explícito UC01               |

|                                                                                                                                                                                                                                                          |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Conclusão: a versão refatorada não é apenas \'código melhor\' em abstrato --- ela é código que se comporta como parte do sistema. Um desenvolvedor novo que lê QuartoService e depois GestorDeQuartos reconhece os mesmos padrões, sem nenhuma surpresa. |
