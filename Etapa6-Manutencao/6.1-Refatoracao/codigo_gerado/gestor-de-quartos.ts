/**
 * =============================================================================
 * gestor-de-quartos.ts — Versão refatorada de GestorDeQuartos
 *
 * HISTÓRICO DE DÍVIDA TÉCNICA ELIMINADA:
 *
 *   P1 — SQL Injection por concatenação de strings        [SEGURANÇA → CRÍTICA]
 *   P2 — `any` em dependência e parâmetro de entrada      [TIPAGEM   → ALTA]
 *   P3 — `database` público e mutável                     [TIPAGEM   → MÉDIA]
 *   P4 — Pirâmide de if/else com 5 níveis de aninhamento  [DESIGN    → ALTA]
 *   P5 — Magic number `>= 50` sem nome nem origem         [DESIGN    → MÉDIA]
 *   P6 — Mensagens de erro opacas ("Vazio", "Erro no BD") [DESIGN    → MÉDIA]
 *   P7 — Códigos HTTP acoplados à lógica de negócio       [ACOPLAM.  → ALTA]
 *   P8 — SQL raw no service (viola separação de camadas)  [ACOPLAM.  → ALTA]
 *
 * DECISÕES DE ALINHAMENTO COM O SISTEMA:
 *   - Usa IQuartoRepository (repository.ts) — mesmo contrato do QuartoService
 *   - Usa CriarQuartoDTO + Quarto + StatusQuarto (domain.ts) — sem tipos novos
 *   - Usa Resultado<T> (domain.ts) — union type sem exceções para erros previsíveis
 *   - Usa PRECO_MINIMO_DIARIA como constante nomeada — regra de negócio visível
 *   - Sem dependência de Express, HTTP ou banco — testável sem infraestrutura
 * =============================================================================
 */

import {
  Cama,
  CriarQuartoDTO,
  Quarto,
  Resultado,
  StatusQuarto,
} from "./domain";
import { IQuartoRepository } from "./repository";

// =============================================================================
// CONSTANTES DE REGRA DE NEGÓCIO
// =============================================================================

/**
 * Preço mínimo permitido por diária (em R$).
 *
 * CORREÇÃO P5 — Magic number eliminado.
 *
 * ANTES:
 *   if (q.precoDia >= 50) { ... }   ← de onde vem 50? ninguém sabe
 *
 * DEPOIS:
 *   if (dto.precoDiaria < PRECO_MINIMO_DIARIA) { ... }   ← regra nomeada e
 *                                                            visível no diff
 *
 * Benefício: quando a política de preço mínimo mudar, um único commit altera
 * apenas esta constante. Grep por "PRECO_MINIMO_DIARIA" encontra todo uso.
 * Sem a constante, a busca seria por "50" — número que aparece em centenas
 * de outros contextos no codebase.
 */
export const PRECO_MINIMO_DIARIA = 50;

// =============================================================================
// CLASSE REFATORADA
// =============================================================================

export class GestorDeQuartos {
  /**
   * CORREÇÕES P2 + P3 — Tipagem forte e encapsulamento da dependência.
   *
   * ANTES:
   *   database: any;               ← público, mutável, sem contrato
   *   constructor(db: any) { ... } ← aceita qualquer coisa
   *
   * DEPOIS:
   *   private readonly repository: IQuartoRepository
   *
   * `private`:  nenhum código externo pode substituir o repositório após
   *             a construção. Mutação acidental impossível.
   *
   * `readonly`:  reforça no nível de compilação que a referência nunca muda.
   *
   * `IQuartoRepository`: o contrato já existente no sistema. O TypeScript
   *   garante que qualquer implementação (memória, Prisma, mock de teste)
   *   fornecida ao construtor respeite os métodos esperados. Trocar de
   *   SQLite para PostgreSQL exige zero alterações nesta classe.
   *
   * Efeito colateral da tipagem: `q.precoDia` (nome errado do campo original)
   * se tornaria erro de compilação imediato com `CriarQuartoDTO`.
   */
  constructor(private readonly repository: IQuartoRepository) {}

  /**
   * Cadastra um novo quarto no sistema.
   *
   * CORREÇÃO P7 — Resultado<T> substitui {status: number, msg: string}.
   *
   * ANTES: o service devolvia códigos HTTP (200, 400, 500) — responsabilidade
   * da camada de apresentação (controller/handler Express).
   *
   * DEPOIS: devolve Resultado<Quarto> — union type discriminado por `sucesso`.
   * O controller decide o que fazer: 201, 422, 409 etc. O service descreve
   * apenas o *resultado do negócio*, sem saber que existe HTTP.
   *
   * Isso permite reutilizar este service em: API REST, GraphQL, fila de mensagens,
   * CLI, testes — sem nenhuma alteração.
   */
  cadastrarQuarto(dto: CriarQuartoDTO): Resultado<Quarto> {
    // ── Validações com early return (correção P4 + P6) ───────────────────────
    //
    // ANTES: pirâmide de 5 níveis de if/else aninhados. Adicionar uma nova
    // validação exigia criar outro nível. O leitor precisava rastrear qual
    // `else` fechava qual `if` para entender o fluxo de erro.
    //
    // DEPOIS: cada guarda retorna imediatamente ao detectar condição inválida.
    // O caminho feliz fica no nível raiz, sem recuo. Novas validações são
    // adicionadas como linhas independentes — sem reorganizar a estrutura.
    //
    // CORREÇÃO P6 — Mensagens descritivas.
    // "Vazio", "Capacidade ruim", "Sem número" eram opacas para o chamador
    // e impossíveis de filtrar em logs (o sistema usa error_code derivado
    // da mensagem em instrumented-services.ts). As mensagens novas seguem
    // o padrão já definido em QuartoService.

    if (!dto.numero?.trim()) {
      return { sucesso: false, erro: "Número do quarto é obrigatório." };
    }

    if (dto.capacidade <= 0) {
      return { sucesso: false, erro: "A capacidade deve ser maior que zero." };
    }

    if (dto.precoDiaria < PRECO_MINIMO_DIARIA) {
      return {
        sucesso: false,
        erro: `O preço por diária deve ser de no mínimo R$ ${PRECO_MINIMO_DIARIA},00.`,
      };
    }

    if (!dto.tiposCama || dto.tiposCama.length === 0) {
      return { sucesso: false, erro: "O quarto deve ter pelo menos um tipo de cama." };
    }

    // ── Verificação de duplicidade via repositório (correção P1 + P8) ────────
    //
    // ANTES (dois problemas simultâneos):
    //
    //   await this.database.find(
    //     "SELECT * FROM quartos WHERE num = '" + q.numero + "'"
    //   )
    //
    //   Problema P1 — SQL Injection: qualquer string em q.numero vira SQL.
    //   Entrada: `101'; DROP TABLE quartos; --` executa dois comandos.
    //
    //   Problema P8 — Acoplamento: o service conhece o esquema (`quartos`,
    //   coluna `num`), a sintaxe SQL e o tipo de retorno do driver.
    //   Renomear a coluna `num` para `numero` exige alterar o service.
    //
    // DEPOIS:
    //   O repositório abstrai completamente a persistência. O service não
    //   sabe se os dados estão em memória, PostgreSQL ou outro lugar.
    //   A proteção contra SQL Injection é responsabilidade do repositório
    //   (queries parametrizadas ou ORM) — em um único lugar, não em cada
    //   ponto de acesso ao banco espalhado pelos services.

    const quartoExistente = this.repository.buscarPorNumero(dto.numero.trim());
    if (quartoExistente) {
      return {
        sucesso: false,
        erro: `Já existe um quarto com o número "${dto.numero.trim()}".`,
      };
    }

    // ── Construção da entidade ────────────────────────────────────────────────
    //
    // ANTES: INSERT com SQL raw incluía apenas 4 campos (num, cap, val, st).
    // Campos como tipo, comodidades e camas eram invisíveis — silenciosamente
    // ignorados. Nenhum erro em tempo de compilação.
    //
    // DEPOIS: a entidade Quarto é construída explicitamente com todos os campos
    // do DTO. O TypeScript garante que nenhum campo obrigatório seja esquecido.
    // `status: StatusQuarto.LIVRE` é a pós-condição UC01 — explícita no código,
    // não um inteiro mágico `0` enterrado num INSERT.

    const camas = dto.tiposCama.map((tipo) => new Cama(tipo));

    const novoQuarto = new Quarto({
      numero:           dto.numero.trim(),
      capacidade:       dto.capacidade,
      tipo:             dto.tipo,
      precoDiaria:      dto.precoDiaria,
      temFrigobar:      dto.temFrigobar,
      temCafeDaManha:   dto.temCafeDaManha,
      temArCondicionado: dto.temArCondicionado,
      temTV:            dto.temTV,
      camas,
      status: StatusQuarto.LIVRE, // pós-condição UC01: status inicial sempre LIVRE
    });

    // ── Persistência via repositório ──────────────────────────────────────────
    //
    // ANTES:
    //   let res = await this.database.execute("INSERT INTO quartos ...")
    //   if (res == true) { return { status: 200 } } else { return { status: 500 } }
    //
    //   Dois problemas: (a) `== true` com coerção de tipo — `res` poderia ser
    //   qualquer coisa truthy e passaria; (b) falha do banco retorna status 500
    //   do HTTP diretamente do service, misturando camadas.
    //
    // DEPOIS:
    //   salvar() ou retorna o Quarto salvo ou lança exceção (contrato da interface).
    //   Exceções de infraestrutura (banco fora do ar) propagam naturalmente para
    //   o handler de erro global do Express — sem interceptação desnecessária aqui.
    //   O service só trata erros de *negócio* previsíveis via Resultado<T>.

    const quartoSalvo = this.repository.salvar(novoQuarto);
    return { sucesso: true, dados: quartoSalvo };
  }
}
