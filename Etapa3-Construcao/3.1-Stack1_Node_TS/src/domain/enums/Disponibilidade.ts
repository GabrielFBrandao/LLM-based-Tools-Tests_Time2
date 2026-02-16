// Enum fechado para estados de disponibilidade do quarto.
// Mantém o domínio explícito e reduz erros por strings mágicas.
export enum Disponibilidade {
  LIVRE = 'LIVRE',
  OCUPADO = 'OCUPADO',
  MANUTENCAO = 'MANUTENCAO',
  LIMPEZA = 'LIMPEZA',
}
