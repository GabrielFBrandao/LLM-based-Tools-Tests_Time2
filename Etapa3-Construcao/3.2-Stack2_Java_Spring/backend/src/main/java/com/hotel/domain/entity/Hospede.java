package com.hotel.domain.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Entidade que representa um hóspede cadastrado no sistema.
 *
 * DECISÃO — SEPARAÇÃO CPF/EMAIL:
 * CPF é identificador de negócio (único, imutável) — recebe @Column unique=true.
 * Email é informação de contato (pode mudar) — sem restrição unique no banco,
 * pois um hóspede pode atualizar seu e-mail ao longo do tempo.
 *
 * DECISÃO — RELACIONAMENTO COM RESERVAS:
 * mappedBy="hospede" indica que Reserva é a dona do relacionamento (tem a FK).
 * cascade = {PERSIST, MERGE} sem REMOVE: deletar hóspede não deve deletar
 * o histórico de reservas (requisito de auditoria futuro).
 * fetch = LAZY porque a lista de reservas quase nunca é necessária ao
 * buscar/listar hóspedes — carregamento sob demanda melhora performance.
 */
@Entity
@Table(
    name = "hospedes",
    indexes = {
        @Index(name = "idx_hospede_cpf", columnList = "cpf", unique = true),
        @Index(name = "idx_hospede_nome", columnList = "nome, sobrenome")
    }
)
public class Hospede {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome", nullable = false, length = 100)
    private String nome;

    @Column(name = "sobrenome", nullable = false, length = 100)
    private String sobrenome;

    /**
     * CPF armazenado apenas com dígitos (sem máscara).
     * DECISÃO: Normalizar no banco facilita buscas e evita duplicatas
     * por diferença de formatação (ex: "123.456.789-00" vs "12345678900").
     * A máscara é responsabilidade da camada de apresentação.
     */
    @Column(name = "cpf", nullable = false, unique = true, length = 11)
    private String cpf;

    @Column(name = "email", nullable = false, length = 200)
    private String email;

    /**
     * Histórico de reservas do hóspede.
     * DECISÃO: Relacionamento declarado aqui para navegabilidade,
     * mas o carregamento é LAZY e controlado pela camada de serviço.
     */
    @OneToMany(
        mappedBy = "hospede",
        cascade = {CascadeType.PERSIST, CascadeType.MERGE},
        fetch = FetchType.LAZY
    )
    private List<Reserva> reservas = new ArrayList<>();

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private LocalDateTime atualizadoEm;

    protected Hospede() {}

    public Hospede(String nome, String sobrenome, String cpf, String email) {
        this.nome = Objects.requireNonNull(nome, "Nome obrigatório").trim();
        this.sobrenome = Objects.requireNonNull(sobrenome, "Sobrenome obrigatório").trim();
        this.cpf = Objects.requireNonNull(cpf, "CPF obrigatório");
        this.email = Objects.requireNonNull(email, "Email obrigatório").toLowerCase().trim();
    }

    /** Nome completo para exibição — lógica de apresentação na entidade é aceitável aqui */
    public String getNomeCompleto() {
        return nome + " " + sobrenome;
    }

    @PrePersist
    private void prePersist() {
        LocalDateTime agora = LocalDateTime.now();
        this.criadoEm = agora;
        this.atualizadoEm = agora;
    }

    @PreUpdate
    private void preUpdate() {
        this.atualizadoEm = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getSobrenome() { return sobrenome; }
    public String getCpf() { return cpf; }
    public String getEmail() { return email; }
    public List<Reserva> getReservas() { return reservas; }
    public LocalDateTime getCriadoEm() { return criadoEm; }
    public LocalDateTime getAtualizadoEm() { return atualizadoEm; }

    public void setNome(String nome) { this.nome = Objects.requireNonNull(nome).trim(); }
    public void setSobrenome(String sobrenome) { this.sobrenome = Objects.requireNonNull(sobrenome).trim(); }
    public void setEmail(String email) { this.email = Objects.requireNonNull(email).toLowerCase().trim(); }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Hospede hospede)) return false;
        return Objects.equals(id, hospede.id);
    }

    @Override
    public int hashCode() { return Objects.hash(id); }

    @Override
    public String toString() {
        return "Hospede{id=%d, nome='%s', cpf='%s'}".formatted(id, getNomeCompleto(), cpf);
    }
}
