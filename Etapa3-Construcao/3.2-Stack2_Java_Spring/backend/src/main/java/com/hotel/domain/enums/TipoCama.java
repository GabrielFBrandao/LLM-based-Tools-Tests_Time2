package com.hotel.domain.enums;

/**
 * Enumeração dos tipos de cama disponíveis em um quarto.
 *
 * DECISÃO: TipoCama como enum garante que apenas valores válidos
 * sejam utilizados, eliminando a necessidade de validação de string.
 * A capacidade padrão por tipo é um dado de domínio — vive aqui, não no Service.
 */
public enum TipoCama {

    SOLTEIRO("Solteiro", 1),
    CASAL_QUEEN("Casal Queen", 2),
    CASAL_KING("Casal King", 2);

    private final String descricao;

    /**
     * Capacidade padrão de pessoas suportadas por este tipo de cama.
     * Útil para validações futuras de capacidade do quarto vs. camas cadastradas.
     */
    private final int capacidadePadrao;

    TipoCama(String descricao, int capacidadePadrao) {
        this.descricao = descricao;
        this.capacidadePadrao = capacidadePadrao;
    }

    public String getDescricao() {
        return descricao;
    }

    public int getCapacidadePadrao() {
        return capacidadePadrao;
    }
}
