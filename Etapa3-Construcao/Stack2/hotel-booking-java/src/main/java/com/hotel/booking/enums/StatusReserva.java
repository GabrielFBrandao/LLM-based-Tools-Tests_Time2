package com.hotel.booking.enums;

public enum StatusReserva {
    PENDENTE("Pendente"),
    CONFIRMADA("Confirmada"),
    CHECK_IN("Check-in Realizado"),
    CHECK_OUT("Check-out Realizado"),
    CANCELADA("Cancelada"),
    NO_SHOW("Não Compareceu");

    private final String descricao;

    StatusReserva(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
