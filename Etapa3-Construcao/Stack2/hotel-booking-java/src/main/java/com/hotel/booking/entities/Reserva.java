package com.hotel.booking.entities;

import com.hotel.booking.enums.StatusReserva;
import com.hotel.booking.valueobjects.Periodo;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "reservas")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Reserva {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String codigoReserva;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospede_id", nullable = false)
    private Hospede hospede;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quarto_id", nullable = false)
    private Quarto quarto;

    @Embedded
    private Periodo periodo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusReserva status = StatusReserva.PENDENTE;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valorTotal = BigDecimal.ZERO;

    @ManyToMany
    @JoinTable(
        name = "reserva_hospedes_adicionais",
        joinColumns = @JoinColumn(name = "reserva_id"),
        inverseJoinColumns = @JoinColumn(name = "hospede_id")
    )
    @Builder.Default
    private List<Hospede> hospedesAdicionais = new ArrayList<>();

    @OneToMany(mappedBy = "reserva", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Pagamento> pagamentos = new ArrayList<>();

    @Column(nullable = false)
    private LocalDateTime dataCriacao = LocalDateTime.now();

    private LocalDateTime dataCheckIn;
    private LocalDateTime dataCheckOut;

    @PostLoad
    @PostPersist
    @PostUpdate
    private void validar() {
        if (hospede == null) {
            throw new IllegalArgumentException("Hóspede é obrigatório");
        }

        if (quarto == null) {
            throw new IllegalArgumentException("Quarto é obrigatório");
        }

        if (periodo == null) {
            throw new IllegalArgumentException("Período é obrigatório");
        }

        if (valorTotal == null || valorTotal.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Valor total não pode ser negativo");
        }
    }

    public BigDecimal calcularValorTotal() {
        BigDecimal valorBase = quarto.calcularPrecoTotal(periodo);
        int numeroHospedes = 1 + hospedesAdicionais.size();
        
        // Adiciona taxa adicional por hóspede extra
        BigDecimal valorTotal = valorBase;
        if (numeroHospedes > quarto.getCapacidade()) {
            BigDecimal taxaExtra = BigDecimal.valueOf(50)
                .multiply(BigDecimal.valueOf(numeroHospedes - quarto.getCapacidade()))
                .multiply(BigDecimal.valueOf(periodo.getNumeroNoites()));
            valorTotal = valorTotal.add(taxaExtra);
        }

        return valorTotal;
    }

    public void adicionarHospede(Hospede hospede) {
        if (status != StatusReserva.PENDENTE) {
            throw new IllegalArgumentException("Apenas reservas pendentes podem ser modificadas");
        }

        // Verifica se o hóspede já está na reserva
        if (this.hospede.equals(hospede) || 
            hospedesAdicionais.stream().anyMatch(h -> h.equals(hospede))) {
            throw new IllegalArgumentException("Hóspede já está na reserva");
        }

        hospedesAdicionais.add(hospede);
        this.valorTotal = calcularValorTotal();
    }

    public void removerHospede(UUID hospedeId) {
        if (status != StatusReserva.PENDENTE) {
            throw new IllegalArgumentException("Apenas reservas pendentes podem ser modificadas");
        }

        boolean removido = hospedesAdicionais.removeIf(h -> h.getId().equals(hospedeId));
        if (!removido) {
            throw new IllegalArgumentException("Hóspede não encontrado na reserva");
        }

        this.valorTotal = calcularValorTotal();
    }

    public void confirmar() {
        if (status != StatusReserva.PENDENTE) {
            throw new IllegalArgumentException("Apenas reservas pendentes podem ser confirmadas");
        }
        this.status = StatusReserva.CONFIRMADA;
    }

    public void realizarCheckIn() {
        if (status != StatusReserva.CONFIRMADA) {
            throw new IllegalArgumentException("Apenas reservas confirmadas podem fazer check-in");
        }

        LocalDateTime hoje = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime checkIn = periodo.getCheckIn().atStartOfDay();

        if (hoje.isBefore(checkIn)) {
            throw new IllegalArgumentException("Check-in só pode ser realizado a partir da data de check-in");
        }

        this.status = StatusReserva.CHECK_IN;
        this.dataCheckIn = LocalDateTime.now();
    }

    public void realizarCheckOut() {
        if (status != StatusReserva.CHECK_IN) {
            throw new IllegalArgumentException("Apenas reservas em check-in podem fazer check-out");
        }

        this.status = StatusReserva.CHECK_OUT;
        this.dataCheckOut = LocalDateTime.now();
    }

    public void cancelar(String motivo) {
        if (status == StatusReserva.CHECK_OUT || status == StatusReserva.CANCELADA) {
            throw new IllegalArgumentException("Reserva já finalizada ou cancelada");
        }

        this.status = StatusReserva.CANCELADA;
    }

    public void registrarNoShow() {
        if (status != StatusReserva.CONFIRMADA) {
            throw new IllegalArgumentException("Apenas reservas confirmadas podem ser marcadas como no-show");
        }

        LocalDateTime hoje = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime checkIn = periodo.getCheckIn().atStartOfDay();

        if (hoje.isBefore(checkIn) || hoje.isEqual(checkIn)) {
            throw new IllegalArgumentException("No-show só pode ser registrado após a data de check-in");
        }

        this.status = StatusReserva.NO_SHOW;
    }

    public void adicionarPagamento(Pagamento pagamento) {
        pagamentos.add(pagamento);
    }

    public BigDecimal getValorPago() {
        return pagamentos.stream()
                .filter(Pagamento::foiAprovado)
                .map(Pagamento::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getValorRestante() {
        return valorTotal.subtract(getValorPago());
    }

    public boolean estaTotalmentePaga() {
        return getValorRestante().compareTo(BigDecimal.ZERO) <= 0;
    }

    public List<Hospede> getTodosHospedes() {
        List<Hospede> todos = new ArrayList<>();
        todos.add(hospede);
        todos.addAll(hospedesAdicionais);
        return todos;
    }

    public int getNumeroTotalHospedes() {
        return 1 + hospedesAdicionais.size();
    }

    public boolean estaAtiva() {
        return status == StatusReserva.CONFIRMADA || 
               status == StatusReserva.CHECK_IN;
    }

    public boolean estaFinalizada() {
        return status == StatusReserva.CHECK_OUT || 
               status == StatusReserva.CANCELADA || 
               status == StatusReserva.NO_SHOW;
    }

    public String getStatusDescricao() {
        return status.getDescricao();
    }

    public String getValorTotalFormatado() {
        return String.format("R$ %.2f", valorTotal);
    }

    public String getValorPagoFormatado() {
        return String.format("R$ %.2f", getValorPago());
    }

    public String getValorRestanteFormatado() {
        return String.format("R$ %.2f", getValorRestante());
    }

    public static Reserva criar(Hospede hospede, Quarto quarto, Periodo periodo) {
        String codigoReserva = gerarCodigoReserva();
        
        Reserva reserva = Reserva.builder()
                .id(UUID.randomUUID())
                .codigoReserva(codigoReserva)
                .hospede(hospede)
                .quarto(quarto)
                .periodo(periodo)
                .status(StatusReserva.PENDENTE)
                .valorTotal(BigDecimal.ZERO)
                .hospedesAdicionais(new ArrayList<>())
                .pagamentos(new ArrayList<>())
                .dataCriacao(LocalDateTime.now())
                .build();

        // Calcula o valor total
        reserva.setValorTotal(reserva.calcularValorTotal());
        
        return reserva;
    }

    private static String gerarCodigoReserva() {
        String timestamp = Long.toString(System.currentTimeMillis(), 36).toUpperCase();
        String random = UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        return "RES-" + timestamp + "-" + random;
    }

    public boolean ehValida() {
        try {
            validar();
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
