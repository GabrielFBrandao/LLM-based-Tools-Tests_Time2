package com.hotel.reservas.modules.quartos.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "quartos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Quarto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String numero;

    @Column(nullable = false)
    private Integer capacidade;

    @Column(nullable = false)
    private String tipo;

    @Column(name = "preco_diaria", nullable = false)
    private BigDecimal precoDiaria;

    @Column(name = "tem_frigobar")
    private Boolean temFrigobar;

    @Column(name = "tem_cafe")
    private Boolean temCafe;

    @Column(name = "tem_ar")
    private Boolean temAr;

    @Column(name = "tem_tv")
    private Boolean temTv;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusQuarto status;

    public enum StatusQuarto {
        LIVRE, OCUPADO, MANUTENCAO, LIMPEZA
    }
}
