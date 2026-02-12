package com.hotel.booking.enums;

public enum MetodoPagamento {
    CARTAO_CREDITO("Cartão de Crédito"),
    CARTAO_DEBITO("Cartão de Débito"),
    DINHEIRO("Dinheiro"),
    PIX("PIX"),
    TRANSFERENCIA("Transferência Bancária");

    private final String descricao;

    MetodoPagamento(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
