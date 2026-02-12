package com.hotel.booking.entities;

import com.hotel.booking.enums.TipoCama;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "camas")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Cama {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoCama tipo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quarto_id", nullable = false)
    private Quarto quarto;

    public boolean ehSolteiro() {
        return tipo == TipoCama.SOLTEIRO;
    }

    public boolean ehCasal() {
        return tipo == TipoCama.CASAL_KING || tipo == TipoCama.CASAL_QUEEN;
    }

    public boolean ehKing() {
        return tipo == TipoCama.CASAL_KING;
    }

    public boolean ehQueen() {
        return tipo == TipoCama.CASAL_QUEEN;
    }

    public Integer getCapacidade() {
        return ehSolteiro() ? 1 : 2;
    }

    public String getDescricao() {
        return tipo.getDescricao();
    }

    public boolean ehValida() {
        return id != null && tipo != null && quarto != null;
    }
}
