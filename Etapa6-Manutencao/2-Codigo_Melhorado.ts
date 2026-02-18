// Etapa 6 - Manutenção: Versão melhorada do código

export enum TipoQuarto {
  BASICO = 1,
  MODERNO = 2,
  LUXO = 3,
}

export enum StatusQuarto {
  LIVRE = 'LIVRE',
  OCUPADO = 'OCUPADO',
}

export enum AcaoReserva {
  RESERVAR = 'RESERVAR',
}

export interface Quarto {
  id: string;
  tipo: TipoQuarto;
  status: StatusQuarto;
  precoTotal?: number;
}

export interface ProcessarReservaInput {
  quarto: Quarto | null | undefined;
  acao: AcaoReserva;
  dias: number; // número de diárias
}

export interface ProcessarReservaResultado {
  sucesso: boolean;
  erro?: string;
  quarto?: Quarto;
}

const TARIFA_DIARIA_POR_TIPO: Record<TipoQuarto, number> = {
  [TipoQuarto.BASICO]: 150,
  [TipoQuarto.MODERNO]: 250,
  [TipoQuarto.LUXO]: 400,
};

export class GerenciadorQuartos {
  // processa uma reserva para um quarto, validando entradas e tarifário
  processar({ quarto, acao, dias }: ProcessarReservaInput): ProcessarReservaResultado {
    if (!quarto) return { sucesso: false, erro: 'Quarto inválido' };
    if (acao !== AcaoReserva.RESERVAR) return { sucesso: false, erro: 'Ação não suportada' };
    if (!Number.isFinite(dias) || dias <= 0) return { sucesso: false, erro: 'Quantidade de dias inválida' };

    const tarifa = TARIFA_DIARIA_POR_TIPO[quarto.tipo];
    if (!tarifa) return { sucesso: false, erro: 'Tipo de quarto inválido' };

    // Evita mutar diretamente o objeto de entrada
    const precoTotal = dias * tarifa;
    const atualizado: Quarto = {
      ...quarto,
      status: StatusQuarto.OCUPADO,
      precoTotal,
    };

    return { sucesso: true, quarto: atualizado };
  }
}
