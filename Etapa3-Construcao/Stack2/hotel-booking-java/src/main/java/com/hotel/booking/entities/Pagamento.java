package com.hotel.booking.entities;

import com.hotel.booking.enums.MetodoPagamento;
import com.hotel.booking.enums.StatusPagamento;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "pagamentos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Pagamento {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valor;

    @Column(nullable = false)
    private LocalDateTime data = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MetodoPagamento metodo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusPagamento status = StatusPagamento.PENDENTE;

    private String codigoTransacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reserva_id", nullable = false)
    private Reserva reserva;

    @PostLoad
    @PostPersist
    @PostUpdate
    private void validar() {
        if (valor == null || valor.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Valor do pagamento deve ser maior que zero");
        }

        if (metodo == null) {
            throw new IllegalArgumentException("Método de pagamento é obrigatório");
        }

        if (status == null) {
            throw new IllegalArgumentException("Status do pagamento é obrigatório");
        }
    }

    public void processar(String codigoTransacao) {
        if (status != StatusPagamento.PENDENTE) {
            throw new IllegalArgumentException("Pagamento já foi processado");
        }

        this.status = StatusPagamento.APROVADO;
        this.codigoTransacao = codigoTransacao;
    }

    public void recusar(String motivo) {
        if (status != StatusPagamento.PENDENTE) {
            throw new IllegalArgumentException("Pagamento já foi processado");
        }

        this.status = StatusPagamento.RECUSADO;
        this.codigoTransacao = motivo;
    }

    public void estornar() {
        if (status != StatusPagamento.APROVADO) {
            throw new IllegalArgumentException("Apenas pagamentos aprovados podem ser estornados");
        }

        this.status = StatusPagamento.ESTORNADO;
        this.codigoTransacao = "ESTORNO_" + (codigoTransacao != null ? codigoTransacao : "");
    }

    public void reembolsar() {
        if (status != StatusPagamento.APROVADO) {
            throw new IllegalArgumentException("Apenas pagamentos aprovados podem ser reembolsados");
        }

        this.status = StatusPagamento.REEMBOLSADO;
        this.codigoTransacao = "REEMBOLSO_" + (codigoTransacao != null ? codigoTransacao : "");
    }

    public boolean estaPendente() {
        return status == StatusPagamento.PENDENTE;
    }

    public boolean foiAprovado() {
        return status == StatusPagamento.APROVADO;
    }

    public boolean foiRecusado() {
        return status == StatusPagamento.RECUSADO;
    }

    public boolean foiEstornado() {
        return status == StatusPagamento.ESTORNADO;
    }

    public boolean foiReembolsado() {
        return status == StatusPagamento.REEMBOLSADO;
    }

    public String getMetodoDescricao() {
        return metodo.getDescricao();
    }

    public String getStatusDescricao() {
        return status.getDescricao();
    }

    public String getValorFormatado() {
        return String.format("R$ %.2f", valor);
    }

    public String getDataFormatada() {
        return data.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
    }

    public static Pagamento criar(BigDecimal valor, MetodoPagamento metodo, Reserva reserva) {
        return Pagamento.builder()
                .id(UUID.randomUUID())
                .valor(valor)
                .data(LocalDateTime.now())
                .metodo(metodo)
                .status(StatusPagamento.PENDENTE)
                .reserva(reserva)
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
