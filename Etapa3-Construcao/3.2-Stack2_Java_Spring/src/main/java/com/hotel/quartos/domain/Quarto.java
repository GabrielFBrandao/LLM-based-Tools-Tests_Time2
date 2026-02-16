package com.hotel.quartos.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

// Entidade Quarto com invariantes básicas e métodos de negócio.
// Comentários explicam decisões (DDD light + SOLID).
@Entity
@Table(name = "quarto", uniqueConstraints = @UniqueConstraint(columnNames = "numero"))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Quarto {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private Integer numero; // VO simplificado para exemplo; unicidade garantida por constraint

    @Column(nullable = false)
    private Integer capacidade;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoQuarto tipo;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal precoHora;

    @Column(nullable = false)
    private boolean frigobar;
    @Column(nullable = false)
    private boolean cafeManha;
    @Column(nullable = false)
    private boolean arCondicionado;
    @Column(nullable = false)
    private boolean tv;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Disponibilidade disponibilidade = Disponibilidade.LIVRE;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "quarto_id") // FK mantida em CamaQuarto
    private List<CamaQuarto> camas = new ArrayList<>();

    @Column(nullable = false)
    private boolean ativo = true; // soft delete

    @Builder
    private Quarto(Integer numero,
                  Integer capacidade,
                  TipoQuarto tipo,
                  BigDecimal precoHora,
                  boolean frigobar,
                  boolean cafeManha,
                  boolean arCondicionado,
                  boolean tv,
                  List<CamaQuarto> camas) {
        validarNumero(numero);
        this.numero = numero;
        this.capacidade = validarCapacidade(capacidade);
        this.tipo = tipo;
        this.precoHora = validarPreco(precoHora);
        this.frigobar = frigobar;
        this.cafeManha = cafeManha;
        this.arCondicionado = arCondicionado;
        this.tv = tv;
        if (camas != null) this.camas.addAll(camas);
    }

    // Regras de negócio explícitas (encapsulamento)
    public void atualizarDados(Integer capacidade, TipoQuarto tipo, BigDecimal precoHora,
                               Boolean frigobar, Boolean cafeManha, Boolean arCondicionado, Boolean tv) {
        if (capacidade != null) this.capacidade = validarCapacidade(capacidade);
        if (tipo != null) this.tipo = tipo;
        if (precoHora != null) this.precoHora = validarPreco(precoHora);
        if (frigobar != null) this.frigobar = frigobar;
        if (cafeManha != null) this.cafeManha = cafeManha;
        if (arCondicionado != null) this.arCondicionado = arCondicionado;
        if (tv != null) this.tv = tv;
    }

    public void alterarDisponibilidade(Disponibilidade nova) {
        this.disponibilidade = nova;
    }

    public void definirCamas(List<TipoCama> tipos) {
        this.camas.clear();
        tipos.forEach(t -> this.camas.add(CamaQuarto.builder().tipoCama(t).build()));
    }

    public void desativar() { this.ativo = false; }

    private static void validarNumero(Integer n) {
        if (n == null || n <= 0 || n > 9999) throw new IllegalArgumentException("Número de quarto inválido");
    }

    private static Integer validarCapacidade(Integer c) {
        if (c == null || c <= 0 || c > 20) throw new IllegalArgumentException("Capacidade inválida");
        return c;
    }

    private static BigDecimal validarPreco(BigDecimal p) {
        if (p == null || p.compareTo(BigDecimal.ZERO) <= 0) throw new IllegalArgumentException("Preço por hora inválido");
        return p.setScale(2, BigDecimal.ROUND_HALF_UP);
    }
}
