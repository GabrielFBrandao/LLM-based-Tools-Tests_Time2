package com.hotel.booking.enums;

public enum StatusQuarto {
    DISPONIVEL("Disponível"),
    OCUPADO("Ocupado"),
    MANUTENCAO("Em Manutenção"),
    LIMPEZA("Em Limpeza");

    private final String descricao;

    StatusQuarto(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
