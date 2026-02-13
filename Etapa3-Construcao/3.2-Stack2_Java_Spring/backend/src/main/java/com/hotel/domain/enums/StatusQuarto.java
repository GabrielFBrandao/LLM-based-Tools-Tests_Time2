package com.hotel.domain.enums;

/**
 * Enumeração dos possíveis status de disponibilidade de um quarto.
 *
 * DECISÃO: Modelar disponibilidade como enum (não booleano) é essencial pois
 * o domínio exige 4 estados distintos, cada um com semântica própria:
 *
 * - LIVRE:      Quarto disponível para receber reservas (RF18)
 * - OCUPADO:    Quarto com reserva ativa — definido automaticamente pelo sistema (RF15)
 * - MANUTENCAO: Quarto temporariamente fora de serviço (não aceita reservas)
 * - LIMPEZA:    Quarto em processo de limpeza (não aceita reservas)
 *
 * O método 'aceitaReservas()' encapsula a regra de negócio RF18 diretamente
 * no enum, evitando lógica condicional espalhada pela aplicação.
 * Isso é um exemplo do princípio Tell, Don't Ask do OOP.
 */
public enum StatusQuarto {

    LIVRE("Livre") {
        @Override
        public boolean aceitaReservas() {
            return true;
        }
    },
    OCUPADO("Ocupado") {
        @Override
        public boolean aceitaReservas() {
            return false;
        }
    },
    MANUTENCAO("Manutenção") {
        @Override
        public boolean aceitaReservas() {
            return false;
        }
    },
    LIMPEZA("Limpeza") {
        @Override
        public boolean aceitaReservas() {
            return false;
        }
    };

    private final String descricao;

    StatusQuarto(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }

    /**
     * Regra de negócio RF18 encapsulada no próprio enum.
     * Cada constante define seu próprio comportamento — padrão Strategy via enum.
     */
    public abstract boolean aceitaReservas();
}
