package com.hotel.reservas.modules.quartos.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entidade que representa uma cama dentro de um quarto.
 * 
 * Decisões de implementação:
 * - ManyToOne LAZY: Evita carregar Quarto desnecessáriamente
 * - Enum para tipo: Valores controlados (SOLTEIRO, KING, QUEEN)
 * - Relacionamento bidirecional: Facilita navegação Quarto <-> Cama
 */
@Entity
@Table(name = "camas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cama {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // FetchType.LAZY: Carrega Quarto apenas quando necessário (performance)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quarto_id", nullable = false)
    private Quarto quarto;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_cama", nullable = false)
    private TipoCama tipoCama;

    public enum TipoCama {
        SOLTEIRO, KING, QUEEN
    }
}
