package com.hotel.booking.entities;

import com.hotel.booking.enums.StatusQuarto;
import com.hotel.booking.enums.TipoCama;
import com.hotel.booking.enums.TipoQuarto;
import com.hotel.booking.valueobjects.Periodo;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "quartos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Quarto {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String numero;

    @Column(nullable = false)
    private Integer capacidade;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoQuarto tipo;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precoPorNoite;

    @Column(nullable = false)
    private Boolean hasMinibar = false;

    @Column(nullable = false)
    private Boolean hasCafeDaManha = false;

    @Column(nullable = false)
    private Boolean hasArCondicionado = false;

    @Column(nullable = false)
    private Boolean hasTV = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusQuarto status = StatusQuarto.DISPONIVEL;

    @OneToMany(mappedBy = "quarto", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Cama> camas = new ArrayList<>();

    @PostLoad
    @PostPersist
    @PostUpdate
    private void validar() {
        if (numero == null || numero.trim().isEmpty()) {
            throw new IllegalArgumentException("Número do quarto é obrigatório");
        }

        if (capacidade == null || capacidade <= 0) {
            throw new IllegalArgumentException("Capacidade deve ser maior que zero");
        }

        if (precoPorNoite == null || precoPorNoite.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Preço por noite deve ser maior que zero");
        }

        if (camas == null || camas.isEmpty()) {
            throw new IllegalArgumentException("Quarto deve ter pelo menos uma cama");
        }

        // Verifica se a capacidade das camas corresponde à capacidade do quarto
        Integer capacidadeCamas = camas.stream()
                .mapToInt(Cama::getCapacidade)
                .sum();
        
        if (!capacidadeCamas.equals(capacidade)) {
            throw new IllegalArgumentException(
                String.format("Capacidade das camas (%d) não corresponde à capacidade do quarto (%d)", 
                             capacidadeCamas, capacidade)
            );
        }
    }

    public void adicionarCama(TipoCama tipo) {
        Cama novaCama = Cama.builder()
                .id(UUID.randomUUID())
                .tipo(tipo)
                .quarto(this)
                .build();
        
        camas.add(novaCama);
        this.capacidade += novaCama.getCapacidade();
    }

    public void removerCama(UUID camaId) {
        Cama camaRemovida = camas.stream()
                .filter(c -> c.getId().equals(camaId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Cama não encontrada"));

        camas.remove(camaRemovida);
        this.capacidade -= camaRemovida.getCapacidade();
    }

    public boolean estaDisponivel(Periodo periodo) {
        return status == StatusQuarto.DISPONIVEL;
    }

    public void atualizarStatus(StatusQuarto novoStatus) {
        this.status = novoStatus;
    }

    public boolean estaOcupado() {
        return status == StatusQuarto.OCUPADO;
    }

    public boolean estaEmManutencao() {
        return status == StatusQuarto.MANUTENCAO;
    }

    public boolean estaEmLimpeza() {
        return status == StatusQuarto.LIMPEZA;
    }

    public String getTipoDescricao() {
        return tipo.getDescricao();
    }

    public String getStatusDescricao() {
        return status.getDescricao();
    }

    public BigDecimal calcularPrecoTotal(Periodo periodo) {
        BigDecimal valorBase = precoPorNoite.multiply(
            BigDecimal.valueOf(periodo.getNumeroNoites())
        );

        // Adiciona custo do café da manhã se aplicável
        if (hasCafeDaManha) {
            BigDecimal custoCafeDaManha = BigDecimal.valueOf(50)
                .multiply(BigDecimal.valueOf(periodo.getNumeroNoites()));
            valorBase = valorBase.add(custoCafeDaManha);
        }

        return valorBase;
    }

    public List<String> getComodidades() {
        List<String> comodidades = new ArrayList<>();
        
        if (hasMinibar) comodidades.add("Frigobar");
        if (hasCafeDaManha) comodidades.add("Café da Manhã");
        if (hasArCondicionado) comodidades.add("Ar-Condicionado");
        if (hasTV) comodidades.add("TV");

        return comodidades;
    }

    public String getPrecoFormatado() {
        return String.format("R$ %.2f", precoPorNoite);
    }

    public static Quarto criar(
            String numero,
            Integer capacidade,
            TipoQuarto tipo,
            BigDecimal precoPorNoite,
            Boolean hasMinibar,
            Boolean hasCafeDaManha,
            Boolean hasArCondicionado,
            Boolean hasTV
    ) {
        return Quarto.builder()
                .id(UUID.randomUUID())
                .numero(numero)
                .capacidade(capacidade)
                .tipo(tipo)
                .precoPorNoite(precoPorNoite)
                .hasMinibar(hasMinibar != null ? hasMinibar : false)
                .hasCafeDaManha(hasCafeDaManha != null ? hasCafeDaManha : false)
                .hasArCondicionado(hasArCondicionado != null ? hasArCondicionado : false)
                .hasTV(hasTV != null ? hasTV : false)
                .status(StatusQuarto.DISPONIVEL)
                .camas(new ArrayList<>())
                .build();
    }

    public boolean ehValido() {
        try {
            validar();
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
