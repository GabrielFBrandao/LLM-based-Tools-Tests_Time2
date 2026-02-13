package com.hotel.domain.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Entidade que representa uma reserva ativa ou histórica no sistema.
 *
 * DECISÃO — POR QUE 'ativa' E NÃO DELETAR FISICAMENTE:
 * Reservas canceladas (RF16) não são deletadas do banco.
 * O campo 'ativa' implementa soft-delete: preserva o histórico para
 * auditoria futura (RN27) e rastreabilidade. Hard-delete perderia dados
 * críticos de negócio.
 *
 * DECISÃO — RELACIONAMENTO COM QUARTO E HÓSPEDE:
 * @ManyToOne com FetchType.LAZY para evitar N+1 queries.
 * O JOIN com quarto/hóspede é feito apenas quando necessário,
 * controlado pelo Service via JPQL com JOIN FETCH.
 *
 * DECISÃO — DATAS:
 * canceladaEm é nullable pois reservas ativas não têm data de cancelamento.
 * Isso é mais expressivo que usar sentinelas (ex: LocalDateTime.MAX).
 */
@Entity
@Table(
    name = "reservas",
    indexes = {
        @Index(name = "idx_reserva_quarto", columnList = "quarto_id"),
        @Index(name = "idx_reserva_hospede", columnList = "hospede_id"),
        @Index(name = "idx_reserva_ativa", columnList = "ativa")
    }
)
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * DECISÃO: @ManyToOne sem cascade — reservas não gerenciam o ciclo
     * de vida de quartos. Quartos existem independentemente de reservas.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quarto_id", nullable = false)
    private Quarto quarto;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hospede_id", nullable = false)
    private Hospede hospede;

    @Column(name = "ativa", nullable = false)
    private boolean ativa = true;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    /**
     * Nullable — preenchido apenas quando a reserva é cancelada.
     * DECISÃO: Campo explícito é mais semântico que verificar ativa == false.
     */
    @Column(name = "cancelada_em")
    private LocalDateTime canceladaEm;

    @Column(name = "motivo_cancelamento", length = 500)
    private String motivoCancelamento;

    protected Reserva() {}

    public Reserva(Quarto quarto, Hospede hospede) {
        this.quarto = Objects.requireNonNull(quarto, "Quarto obrigatório");
        this.hospede = Objects.requireNonNull(hospede, "Hóspede obrigatório");
        this.ativa = true;
    }

    /**
     * Cancela a reserva e registra o motivo e timestamp.
     * DECISÃO: Método de negócio explícito em vez de setter simples.
     * Garante que cancelamento sempre registra data e atualiza flag 'ativa'.
     * Proteção contra duplo cancelamento incluída.
     */
    public void cancelar(String motivo) {
        if (!this.ativa) {
            throw new IllegalStateException("Reserva já está cancelada.");
        }
        this.ativa = false;
        this.canceladaEm = LocalDateTime.now();
        this.motivoCancelamento = motivo;
    }

    @PrePersist
    private void prePersist() {
        this.criadoEm = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public Quarto getQuarto() { return quarto; }
    public Hospede getHospede() { return hospede; }
    public boolean isAtiva() { return ativa; }
    public LocalDateTime getCriadoEm() { return criadoEm; }
    public LocalDateTime getCanceladaEm() { return canceladaEm; }
    public String getMotivoCancelamento() { return motivoCancelamento; }

    /** Permite trocar o quarto da reserva durante edição (UC09 - FA01) */
    public void setQuarto(Quarto quarto) {
        this.quarto = Objects.requireNonNull(quarto, "Quarto obrigatório");
    }

    /** Permite trocar o hóspede da reserva durante edição (UC09 - FA02) */
    public void setHospede(Hospede hospede) {
        this.hospede = Objects.requireNonNull(hospede, "Hóspede obrigatório");
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Reserva reserva)) return false;
        return Objects.equals(id, reserva.id);
    }

    @Override
    public int hashCode() { return Objects.hash(id); }

    @Override
    public String toString() {
        return "Reserva{id=%d, quarto=%s, ativa=%b}".formatted(id, quarto, ativa);
    }
}
