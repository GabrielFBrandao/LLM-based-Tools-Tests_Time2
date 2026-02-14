/**
 * =============================================================================
 * FIXTURES E BUILDERS DE TESTE
 *
 * DECISÃO — POR QUE FIXTURES CENTRALIZADOS?
 * Sem fixtures, cada arquivo de teste cria seus próprios objetos de domínio.
 * Isso gera:
 * - Duplicação massiva de código de setup
 * - Divergência silenciosa entre testes (um usa precoDiaria=100, outro usa 200)
 * - Fragilidade: mudar o construtor de Quarto quebra N arquivos de teste
 *
 * Com builders centralizados:
 * - Um único ponto de criação de objetos de teste
 * - Valores padrão sensatos, sobrescrevíveis por teste
 * - Leitura dos testes foca no "o quê" (comportamento), não no "como criar"
 *
 * DECISÃO — BUILDER PATTERN (fluent interface):
 * QuartoBuilder permite construir objetos customizados de forma legível:
 *   const quarto = umQuarto().comNumero("201").comTipo(TipoQuarto.LUXO).build()
 *
 * Isso é mais expressivo que passar um objeto gigante de parâmetros em cada teste.
 *
 * DECISÃO — DADOS DETERMINÍSTICOS:
 * IDs fixos (não gerados por Date.now) garantem que testes sejam determinísticos
 * e não dependam da ordem de execução ou do timestamp de execução.
 * =============================================================================
 */

import { Cama, CriarQuartoDTO, EditarQuartoDTO, Quarto, StatusQuarto, TipoCama, TipoQuarto } from "../../domain";

// =============================================================================
// BUILDER DE QUARTO
// =============================================================================

/**
 * Builder fluente para criar instâncias de Quarto em testes.
 *
 * USO:
 *   umQuarto().build()                          // quarto com defaults
 *   umQuarto().comNumero("301").build()         // sobrescreve apenas o número
 *   umQuarto().comTipo(TipoQuarto.LUXO)
 *             .comPreco(500)
 *             .comCamas([TipoCama.CASAL_KING])
 *             .build()
 */
export class QuartoBuilder {
  private params: ConstructorParameters<typeof Quarto>[0] = {
    id: "qrt_test_001",
    numero: "101",
    capacidade: 2,
    tipo: TipoQuarto.BASICO,
    precoDiaria: 180,
    temFrigobar: false,
    temCafeDaManha: false,
    temArCondicionado: true,
    temTV: true,
    status: StatusQuarto.LIVRE,
    camas: [new Cama(TipoCama.CASAL_QUEEN, "cama_test_001")],
  };

  comId(id: string): this {
    this.params.id = id;
    return this;
  }

  comNumero(numero: string): this {
    this.params.numero = numero;
    return this;
  }

  comCapacidade(capacidade: number): this {
    this.params.capacidade = capacidade;
    return this;
  }

  comTipo(tipo: TipoQuarto): this {
    this.params.tipo = tipo;
    return this;
  }

  comPreco(precoDiaria: number): this {
    this.params.precoDiaria = precoDiaria;
    return this;
  }

  comStatus(status: StatusQuarto): this {
    this.params.status = status;
    return this;
  }

  comCamas(tipos: TipoCama[]): this {
    this.params.camas = tipos.map((t, i) => new Cama(t, `cama_test_${i}`));
    return this;
  }

  comFrigobar(valor = true): this {
    this.params.temFrigobar = valor;
    return this;
  }

  comCafeDaManha(valor = true): this {
    this.params.temCafeDaManha = valor;
    return this;
  }

  comArCondicionado(valor = true): this {
    this.params.temArCondicionado = valor;
    return this;
  }

  comTV(valor = true): this {
    this.params.temTV = valor;
    return this;
  }

  build(): Quarto {
    // Spread garante que cada build() gera uma instância independente
    return new Quarto({ ...this.params });
  }
}

/** Função de entrada do builder — leitura fluida nos testes */
export const umQuarto = () => new QuartoBuilder();

// =============================================================================
// BUILDERS DE DTO
// =============================================================================

/**
 * DTO padrão para cadastro — válido e completo.
 * Os testes que precisam de um campo inválido sobrescrevem apenas aquele campo.
 *
 * DECISÃO: Funções de factory (não constantes) para que cada teste
 * receba um objeto independente — mutações em um teste não afetam outros.
 */
export const umDtoCadastroValido = (): CriarQuartoDTO => ({
  numero: "201",
  capacidade: 2,
  tipo: TipoQuarto.MODERNO,
  precoDiaria: 250,
  temFrigobar: true,
  temCafeDaManha: false,
  temArCondicionado: true,
  temTV: true,
  tiposCama: [TipoCama.CASAL_QUEEN],
});

export const umDtoEdicaoValido = (): EditarQuartoDTO => ({
  tipo: TipoQuarto.LUXO,
  precoDiaria: 450,
  temFrigobar: true,
  temCafeDaManha: true,
});

// =============================================================================
// CENÁRIOS PRÉ-MONTADOS (conjuntos de quartos para testes de integração)
// =============================================================================

/**
 * Coleção de quartos representativa para testes de listagem e busca.
 * Cobre todos os status e tipos possíveis.
 */
export const quartosDeTeste = {
  livre: () =>
    umQuarto()
      .comId("qrt_livre_001")
      .comNumero("101")
      .comTipo(TipoQuarto.BASICO)
      .comStatus(StatusQuarto.LIVRE)
      .comPreco(180)
      .build(),

  ocupado: () =>
    umQuarto()
      .comId("qrt_ocupado_001")
      .comNumero("102")
      .comTipo(TipoQuarto.MODERNO)
      .comStatus(StatusQuarto.OCUPADO)
      .comPreco(280)
      .comCamas([TipoCama.CASAL_KING])
      .build(),

  emManutencao: () =>
    umQuarto()
      .comId("qrt_manut_001")
      .comNumero("201")
      .comTipo(TipoQuarto.LUXO)
      .comStatus(StatusQuarto.MANUTENCAO)
      .comPreco(580)
      .comCamas([TipoCama.CASAL_KING, TipoCama.SOLTEIRO])
      .build(),

  emLimpeza: () =>
    umQuarto()
      .comId("qrt_limp_001")
      .comNumero("202")
      .comTipo(TipoQuarto.MODERNO)
      .comStatus(StatusQuarto.LIMPEZA)
      .comPreco(320)
      .build(),
};
