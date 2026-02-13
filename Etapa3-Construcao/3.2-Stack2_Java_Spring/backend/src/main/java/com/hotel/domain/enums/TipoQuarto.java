package com.hotel.domain.enums;

/**
 * Enumeração dos tipos de quarto disponíveis no hotel.
 *
 * DECISÃO: Usar enum em vez de String puro ou constantes inteiras garante:
 * - Type-safety em tempo de compilação (impossível passar valor inválido)
 * - Comportamento centralizado via métodos do enum (getDescricao)
 * - Serialização consistente com Jackson/JPA (@Enumerated)
 *
 * O atributo 'descricao' armazena o label de exibição para a UI,
 * desacoplando o nome interno do enum do texto apresentado ao usuário.
 */
public enum TipoQuarto {

    BASICO("Básico"),
    MODERNO("Moderno"),
    LUXO("Luxo");

    private final String descricao;

    TipoQuarto(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
