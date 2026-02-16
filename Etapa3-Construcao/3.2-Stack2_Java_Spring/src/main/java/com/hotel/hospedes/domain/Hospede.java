package com.hotel.hospedes.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "hospede", uniqueConstraints = @UniqueConstraint(columnNames = "cpf"))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Hospede {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String sobrenome;

    @Column(nullable = false, length = 11)
    private String cpf; // Validação de DV pode ser aplicada via @Pattern ou serviço

    @Column(nullable = false)
    private String email; // Validação @Email em DTO

    @Column(nullable = false)
    private boolean ativo = true;

    @Builder
    private Hospede(String nome, String sobrenome, String cpf, String email) {
        this.nome = validarNome(nome);
        this.sobrenome = validarNome(sobrenome);
        this.cpf = cpf; // Simplificado; regra mais rígida pode ser aplicada em VO/validador
        this.email = email;
    }

    public void atualizar(String nome, String sobrenome, String email) {
        if (nome != null) this.nome = validarNome(nome);
        if (sobrenome != null) this.sobrenome = validarNome(sobrenome);
        if (email != null) this.email = email;
    }

    public void desativar() { this.ativo = false; }

    private static String validarNome(String v) {
        if (v == null || v.trim().length() < 2) throw new IllegalArgumentException("Nome inválido");
        return v.trim();
    }
}
