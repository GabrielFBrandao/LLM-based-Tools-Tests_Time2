package com.hotel.quartos.domain;

import jakarta.persistence.*;
import lombok.*;

// Entidade para suportar N camas por quarto (OneToMany Quarto->CamaQuarto)
@Entity
@Table(name = "cama_quarto")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CamaQuarto {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoCama tipoCama;
}
