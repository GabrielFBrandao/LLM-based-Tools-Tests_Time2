import { CPF } from '../value-objects/CPF.js';
import { Email } from '../value-objects/Email.js';

// Entidade Hóspede com VOs para CPF e Email, garantindo consistência.
export class Hospede {
  private _id?: string;
  private _nome: string;
  private _sobrenome: string;
  private _cpf: CPF;
  private _email: Email;
  private _ativo = true;

  private constructor(params: { id?: string; nome: string; sobrenome: string; cpf: CPF; email: Email }) {
    this._id = params.id;
    this._nome = Hospede.validarNome(params.nome);
    this._sobrenome = Hospede.validarNome(params.sobrenome);
    this._cpf = params.cpf;
    this._email = params.email;
  }

  static criar(params: { id?: string; nome: string; sobrenome: string; cpf: CPF; email: Email }): Hospede {
    return new Hospede(params);
  }

  atualizar(parciais: Partial<{ nome: string; sobrenome: string; email: Email }>): void {
    if (parciais.nome !== undefined) this._nome = Hospede.validarNome(parciais.nome);
    if (parciais.sobrenome !== undefined) this._sobrenome = Hospede.validarNome(parciais.sobrenome);
    if (parciais.email !== undefined) this._email = parciais.email;
  }

  desativar(): void { this._ativo = false; }

  private static validarNome(v: string): string {
    const t = v.trim();
    if (t.length < 2) throw new Error('Nome inválido');
    return t;
  }

  get id(): string | undefined { return this._id; }
  get nome(): string { return this._nome; }
  get sobrenome(): string { return this._sobrenome; }
  get cpf(): CPF { return this._cpf; }
  get email(): Email { return this._email; }
  get ativo(): boolean { return this._ativo; }
}
