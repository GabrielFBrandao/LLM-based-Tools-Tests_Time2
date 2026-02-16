import { TipoQuarto } from '../enums/TipoQuarto.js';
import { Disponibilidade } from '../enums/Disponibilidade.js';
import { NumeroQuarto } from '../value-objects/NumeroQuarto.js';
import { PrecoHora } from '../value-objects/PrecoHora.js';
import { CamaQuarto } from './CamaQuarto.js';
import { TipoCama } from '../enums/TipoCama.js';

// Entidade Quarto: encapsula invariantes e comportamentos do quarto.
// Comentários explicam decisões SOLID/DDD.
export class Quarto {
  // Mantemos id opcional por ora (repositório atribui se necessário)
  private _id?: string;
  private _numero: NumeroQuarto;
  private _capacidade: number;
  private _tipo: TipoQuarto;
  private _precoHora: PrecoHora;
  private _frigobar: boolean;
  private _cafeManha: boolean;
  private _arCondicionado: boolean;
  private _tv: boolean;
  private _disponibilidade: Disponibilidade;
  private _camas: CamaQuarto[] = [];
  private _ativo = true; // soft delete

  private constructor(params: {
    id?: string;
    numero: NumeroQuarto;
    capacidade: number;
    tipo: TipoQuarto;
    precoHora: PrecoHora;
    frigobar: boolean;
    cafeManha: boolean;
    arCondicionado: boolean;
    tv: boolean;
    disponibilidade?: Disponibilidade;
    camas?: CamaQuarto[];
  }) {
    this._id = params.id;
    this._numero = params.numero;
    this._capacidade = Quarto.validarCapacidade(params.capacidade);
    this._tipo = params.tipo;
    this._precoHora = params.precoHora;
    this._frigobar = params.frigobar;
    this._cafeManha = params.cafeManha;
    this._arCondicionado = params.arCondicionado;
    this._tv = params.tv;
    this._disponibilidade = params.disponibilidade ?? Disponibilidade.LIVRE;
    this._camas = params.camas ? [...params.camas] : [];
  }

  // Fábrica estática centraliza regras de criação (SRP) e mantém invariantes desde o início.
  static criar(params: {
    id?: string;
    numero: NumeroQuarto;
    capacidade: number;
    tipo: TipoQuarto;
    precoHora: PrecoHora;
    frigobar: boolean;
    cafeManha: boolean;
    arCondicionado: boolean;
    tv: boolean;
    disponibilidade?: Disponibilidade;
    camas?: CamaQuarto[];
  }): Quarto {
    return new Quarto(params);
  }

  // Métodos de negócio explícitos promovem encapsulamento (EVITA set público indiscriminado)
  atualizarDados(parciais: Partial<{
    capacidade: number;
    tipo: TipoQuarto;
    precoHora: PrecoHora;
    frigobar: boolean;
    cafeManha: boolean;
    arCondicionado: boolean;
    tv: boolean;
  }>): void {
    if (parciais.capacidade !== undefined) this._capacidade = Quarto.validarCapacidade(parciais.capacidade);
    if (parciais.tipo !== undefined) this._tipo = parciais.tipo;
    if (parciais.precoHora !== undefined) this._precoHora = parciais.precoHora;
    if (parciais.frigobar !== undefined) this._frigobar = parciais.frigobar;
    if (parciais.cafeManha !== undefined) this._cafeManha = parciais.cafeManha;
    if (parciais.arCondicionado !== undefined) this._arCondicionado = parciais.arCondicionado;
    if (parciais.tv !== undefined) this._tv = parciais.tv;
  }

  alterarDisponibilidade(nova: Disponibilidade): void {
    this._disponibilidade = nova;
  }

  definirCamas(tipos: TipoCama[]): void {
    // substitui o conjunto de camas (operação idempotente)
    this._camas = tipos.map(t => new CamaQuarto(t));
  }

  desativar(): void { this._ativo = false; }

  private static validarCapacidade(cap: number): number {
    if (!Number.isInteger(cap) || cap <= 0 || cap > 20) throw new Error('Capacidade inválida');
    return cap;
  }

  // Getters somente leitura garantem imutabilidade externa
  get id(): string | undefined { return this._id; }
  get numero(): NumeroQuarto { return this._numero; }
  get capacidade(): number { return this._capacidade; }
  get tipo(): TipoQuarto { return this._tipo; }
  get precoHora(): PrecoHora { return this._precoHora; }
  get frigobar(): boolean { return this._frigobar; }
  get cafeManha(): boolean { return this._cafeManha; }
  get arCondicionado(): boolean { return this._arCondicionado; }
  get tv(): boolean { return this._tv; }
  get disponibilidade(): Disponibilidade { return this._disponibilidade; }
  get camas(): ReadonlyArray<CamaQuarto> { return this._camas; }
  get ativo(): boolean { return this._ativo; }
}
