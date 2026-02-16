package com.hotel.reservas.domain;

import com.hotel.hospedes.domain.Hospede;
import com.hotel.quartos.domain.Disponibilidade;
import com.hotel.quartos.domain.Quarto;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "reserva")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(optional = false)
    private Quarto quarto;

    @ManyToOne(optional = false)
    private Hospede hospede;

    @Column(nullable = false)
    private OffsetDateTime criadoEm = OffsetDateTime.now();

    @Column(nullable = false)
    private OffsetDateTime atualizadoEm = OffsetDateTime.now();

    @Column(nullable = false)
    private String status = "ATIVA"; // Simples para escopo atual

    @Builder
    private Reserva(Quarto quarto, Hospede hospede) {
        if (quarto.getDisponibilidade() != Disponibilidade.LIVRE) {
            throw new IllegalStateException("Quarto indisponível para reserva");
        }
        this.quarto = quarto;
        this.hospede = hospede;
        // Efeito de domínio: marcar quarto como OCUPADO
        this.quarto.alterarDisponibilidade(Disponibilidade.OCUPADO);
    }

    public void trocarHospede(Hospede novo) {
        this.hospede = novo;
        this.atualizadoEm = OffsetDateTime.now();
    }

    public void cancelar() {
        if ("CANCELADA".equals(this.status)) return;
        this.status = "CANCELADA";
        this.atualizadoEm = OffsetDateTime.now();
        this.quarto.alterarDisponibilidade(Disponibilidade.LIVRE);
    }
}
