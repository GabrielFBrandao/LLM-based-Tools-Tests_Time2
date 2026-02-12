package com.hotel.booking.enums;

public enum TipoCama {
    SOLTEIRO("Cama de Solteiro"),
    CASAL_KING("Cama de Casal King"),
    CASAL_QUEEN("Cama de Casal Queen");

    private final String descricao;

    TipoCama(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
