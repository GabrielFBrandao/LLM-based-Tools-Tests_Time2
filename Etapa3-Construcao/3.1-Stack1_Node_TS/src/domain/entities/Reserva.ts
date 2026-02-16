import { Quarto } from './Quarto.js';
import { Hospede } from './Hospede.js';
import { Disponibilidade } from '../enums/Disponibilidade.js';

// Entidade Reserva controla o vínculo hóspede-quarto.
// Para o escopo sem datas, o estado do quarto determina ocupação.
export class Reserva {
  private _id?: string;
  private _quarto: Quarto;
  private _hospede: Hospede;
  private _criadoEm: Date;
  private _atualizadoEm: Date;
  private _status: 'ATIVA' | 'CANCELADA' = 'ATIVA';

  private constructor(params: { id?: string; quarto: Quarto; hospede: Hospede; criadoEm?: Date }) {
    if (params.quarto.disponibilidade !== Disponibilidade.LIVRE) {
      throw new Error('Quarto indisponível para reserva');
    }
    this._id = params.id;
    this._quarto = params.quarto;
    this._hospede = params.hospede;
    this._criadoEm = params.criadoEm ?? new Date();
    this._atualizadoEm = new Date();
    // Efeito de domínio: marcar quarto como OCUPADO
    this._quarto.alterarDisponibilidade(Disponibilidade.OCUPADO);
  }

  static criar(params: { id?: string; quarto: Quarto; hospede: Hospede; criadoEm?: Date }): Reserva {
    return new Reserva(params);
  }

  trocarHospede(novo: Hospede): void {
    this._hospede = novo;
    this._atualizadoEm = new Date();
  }

  cancelar(): void {
    if (this._status === 'CANCELADA') return;
    this._status = 'CANCELADA';
    this._atualizadoEm = new Date();
    // Ao cancelar, o quarto retorna a LIVRE (simples, sem datas).
    this._quarto.alterarDisponibilidade(Disponibilidade.LIVRE);
  }

  get id(): string | undefined { return this._id; }
  get quarto(): Quarto { return this._quarto; }
  get hospede(): Hospede { return this._hospede; }
  get criadoEm(): Date { return this._criadoEm; }
  get atualizadoEm(): Date { return this._atualizadoEm; }
  get status(): 'ATIVA' | 'CANCELADA' { return this._status; }
}
