/**
 * =============================================================================
 * CAMADA DE DOMÍNIO — Tipos, Enums e Entidades
 *
 * Extraído do módulo hotel-management.tsx para ser testável de forma
 * independente do React. Em um projeto real, este seria o módulo
 * compartilhado entre frontend e backend (monorepo).
 * =============================================================================
 */

// -----------------------------------------------------------------------------
// ENUMERAÇÕES DO DOMÍNIO
// DECISÃO: Const objects com "as const" permitem usar como tipo e como valor,
// o que não é possível com TypeScript enums nativos em todos os cenários.
// -----------------------------------------------------------------------------

export const TipoQuarto = {
  BASICO: "Básico",
  MODERNO: "Moderno",
  LUXO: "Luxo",
} as const;
export type TipoQuarto = (typeof TipoQuarto)[keyof typeof TipoQuarto];

export const StatusQuarto = {
  LIVRE: "Livre",
  OCUPADO: "Ocupado",
  MANUTENCAO: "Manutenção",
  LIMPEZA: "Limpeza",
} as const;
export type StatusQuarto = (typeof StatusQuarto)[keyof typeof StatusQuarto];

export const TipoCama = {
  SOLTEIRO: "Solteiro",
  CASAL_KING: "Casal King",
  CASAL_QUEEN: "Casal Queen",
} as const;
export type TipoCama = (typeof TipoCama)[keyof typeof TipoCama];

// -----------------------------------------------------------------------------
// ENTIDADE CAMA (Value Object)
// DECISÃO: Cama é uma entidade separada (não apenas uma string) para suportar
// a regra de negócio RN05: "Todo quarto deve ter pelo menos um tipo de cama".
// -----------------------------------------------------------------------------

export class Cama {
  readonly id: string;
  readonly tipo: TipoCama;

  constructor(tipo: TipoCama, id?: string) {
    this.tipo = tipo;
    this.id = id ?? `cama_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }

  static fromData(data: { id: string; tipo: TipoCama }): Cama {
    return new Cama(data.tipo, data.id);
  }
}

// -----------------------------------------------------------------------------
// ENTIDADE QUARTO
// DECISÃO: Imutável — modificações geram nova instância via copiarCom().
// Isso facilita rastreamento de estado e previne mutações acidentais.
// -----------------------------------------------------------------------------

export class Quarto {
  readonly id: string;
  readonly numero: string;
  readonly capacidade: number;
  readonly tipo: TipoQuarto;
  readonly precoDiaria: number;
  readonly temFrigobar: boolean;
  readonly temCafeDaManha: boolean;
  readonly temArCondicionado: boolean;
  readonly temTV: boolean;
  readonly status: StatusQuarto;
  readonly camas: readonly Cama[];

  constructor(params: {
    numero: string;
    capacidade: number;
    tipo: TipoQuarto;
    precoDiaria: number;
    temFrigobar?: boolean;
    temCafeDaManha?: boolean;
    temArCondicionado?: boolean;
    temTV?: boolean;
    status?: StatusQuarto;
    camas?: Cama[];
    id?: string;
  }) {
    this.numero = params.numero;
    this.capacidade = params.capacidade;
    this.tipo = params.tipo;
    this.precoDiaria = params.precoDiaria;
    this.temFrigobar = params.temFrigobar ?? false;
    this.temCafeDaManha = params.temCafeDaManha ?? false;
    this.temArCondicionado = params.temArCondicionado ?? false;
    this.temTV = params.temTV ?? false;
    this.status = params.status ?? StatusQuarto.LIVRE;
    this.camas = params.camas ?? [];
    this.id = params.id ?? `qrt_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }

  copiarCom(alteracoes: Partial<Omit<Quarto, "id" | "copiarCom">>): Quarto {
    return new Quarto({
      id: this.id,
      numero: alteracoes.numero ?? this.numero,
      capacidade: alteracoes.capacidade ?? this.capacidade,
      tipo: alteracoes.tipo ?? this.tipo,
      precoDiaria: alteracoes.precoDiaria ?? this.precoDiaria,
      temFrigobar: alteracoes.temFrigobar ?? this.temFrigobar,
      temCafeDaManha: alteracoes.temCafeDaManha ?? this.temCafeDaManha,
      temArCondicionado: alteracoes.temArCondicionado ?? this.temArCondicionado,
      temTV: alteracoes.temTV ?? this.temTV,
      status: alteracoes.status ?? this.status,
      camas: (alteracoes.camas as Cama[]) ?? [...this.camas],
    });
  }

  get estaDisponivel(): boolean {
    return this.status === StatusQuarto.LIVRE;
  }

  get precoFormatado(): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(this.precoDiaria);
  }

  get comodidades(): string[] {
    return [
      this.temFrigobar && "Frigobar",
      this.temCafeDaManha && "Café da manhã",
      this.temArCondicionado && "Ar-condicionado",
      this.temTV && "TV",
    ].filter(Boolean) as string[];
  }
}

// -----------------------------------------------------------------------------
// DTOs
// -----------------------------------------------------------------------------

export interface CriarQuartoDTO {
  numero: string;
  capacidade: number;
  tipo: TipoQuarto;
  precoDiaria: number;
  temFrigobar: boolean;
  temCafeDaManha: boolean;
  temArCondicionado: boolean;
  temTV: boolean;
  tiposCama: TipoCama[];
}

export type EditarQuartoDTO = Partial<CriarQuartoDTO>;

// -----------------------------------------------------------------------------
// TIPO RESULTADO — evita exceções para erros de negócio previsíveis
// DECISÃO: Union type discriminada por "sucesso" — TypeScript garante
// que o código chamador trate ambos os casos via type narrowing.
// -----------------------------------------------------------------------------

export type Resultado<T> =
  | { sucesso: true; dados: T }
  | { sucesso: false; erro: string };
