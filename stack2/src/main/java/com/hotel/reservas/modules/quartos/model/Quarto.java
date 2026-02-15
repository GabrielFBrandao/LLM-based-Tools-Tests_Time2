package com.hotel.reservas.modules.quartos.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidade JPA que representa um quarto do hotel.
 * 
 * Decisões de implementação:
 * - Lombok @Data: Reduz boilerplate (getters/setters/equals/hashCode)
 * - BigDecimal para precoDiaria: Precisão em valores monetários
 * - Enum para status: Type-safety e valores controlados
 * - OneToMany com cascade: Gerenciamento automático de camas
 */
@Entity
@Table(name = "quartos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Quarto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Unique constraint garante que não existam quartos duplicados
    @Column(nullable = false, unique = true)
    private String numero;

    @Column(nullable = false)
    private Integer capacidade;

    @Column(nullable = false)
    private String tipo;

    // BigDecimal evita problemas de arredondamento com valores monetários
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

    // EnumType.STRING armazena nome legível no banco (não ordinal)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusQuarto status;

    // CascadeType.ALL: Operações em Quarto refletem em Cama
    // orphanRemoval: Remove camas desvinculadas automaticamente
    @OneToMany(mappedBy = "quarto", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Cama> camas = new ArrayList<>();

    public enum StatusQuarto {
        LIVRE, OCUPADO, MANUTENCAO, LIMPEZA
    }
}
