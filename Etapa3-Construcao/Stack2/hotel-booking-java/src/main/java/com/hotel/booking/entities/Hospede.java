package com.hotel.booking.entities;

import com.hotel.booking.valueobjects.Endereco;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

@Entity
@Table(name = "hospedes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Hospede {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String sobrenome;

    @Column(unique = true, nullable = false)
    private String cpf;

    @Column(unique = true, nullable = false)
    private String email;

    private String telefone;

    @Embedded
    private Endereco endereco;

    @Column(nullable = false)
    private LocalDateTime dataCadastro = LocalDateTime.now();

    @PostLoad
    @PostPersist
    @PostUpdate
    private void validar() {
        if (nome == null || nome.trim().isEmpty()) {
            throw new IllegalArgumentException("Nome é obrigatório");
        }

        if (sobrenome == null || sobrenome.trim().isEmpty()) {
            throw new IllegalArgumentException("Sobrenome é obrigatório");
        }

        if (!validarCPF(cpf)) {
            throw new IllegalArgumentException("CPF inválido");
        }

        if (!validarEmail(email)) {
            throw new IllegalArgumentException("E-mail inválido");
        }
    }

    private boolean validarCPF(String cpf) {
        // Remove caracteres não numéricos
        String cpfNumerico = cpf.replaceAll("\\D", "");
        
        // Verifica se tem 11 dígitos
        if (cpfNumerico.length() != 11) {
            return false;
        }

        // Verifica se todos os dígitos são iguais
        if (cpfNumerico.matches("(\\d)\\1{10}")) {
            return false;
        }

        // Validação do dígito verificador
        int soma = 0;
        int resto;

        // Valida primeiro dígito
        for (int i = 1; i <= 9; i++) {
            soma += Integer.parseInt(cpfNumerico.substring(i - 1, i)) * (11 - i);
        }
        resto = (soma * 10) % 11;
        if (resto == 10 || resto == 11) resto = 0;
        if (resto != Integer.parseInt(cpfNumerico.substring(9, 10))) {
            return false;
        }

        // Valida segundo dígito
        soma = 0;
        for (int i = 1; i <= 10; i++) {
            soma += Integer.parseInt(cpfNumerico.substring(i - 1, i)) * (12 - i);
        }
        resto = (soma * 10) % 11;
        if (resto == 10 || resto == 11) resto = 0;
        if (resto != Integer.parseInt(cpfNumerico.substring(10, 11))) {
            return false;
        }

        return true;
    }

    private boolean validarEmail(String email) {
        Pattern emailRegex = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
        return emailRegex.matcher(email).matches();
    }

    public String getNomeCompleto() {
        return (nome + " " + sobrenome).trim();
    }

    public String getCpfFormatado() {
        String cpfNumerico = cpf.replaceAll("\\D", "");
        return cpfNumerico.replaceAll("(\\d{3})(\\d{3})(\\d{3})(\\d{2})", "$1.$2.$3-$4");
    }

    public String getTelefoneFormatado() {
        if (telefone == null || telefone.trim().isEmpty()) {
            return "";
        }
        
        String telefoneNumerico = telefone.replaceAll("\\D", "");
        
        if (telefoneNumerico.length() == 11) {
            return telefoneNumerico.replaceAll("(\\d{2})(\\d{5})(\\d{4})", "($1) $2-$3");
        } else if (telefoneNumerico.length() == 10) {
            return telefoneNumerico.replaceAll("(\\d{2})(\\d{4})(\\d{4})", "($1) $2-$3");
        }
        
        return telefone;
    }

    public void atualizarDados(DadosHospede dados) {
        if (dados.nome != null) this.nome = dados.nome;
        if (dados.sobrenome != null) this.sobrenome = dados.sobrenome;
        if (dados.cpf != null) this.cpf = dados.cpf;
        if (dados.email != null) this.email = dados.email;
        if (dados.telefone != null) this.telefone = dados.telefone;
        if (dados.endereco != null) this.endereco = dados.endereco;
    }

    public void atualizarEndereco(Endereco endereco) {
        this.endereco = endereco;
    }

    public boolean temEnderecoCompleto() {
        return endereco != null && endereco.ehValido();
    }

    public boolean temTelefone() {
        return telefone != null && !telefone.trim().isEmpty();
    }

    public boolean ehRecemCadastrado() {
        LocalDateTime trintaDiasAtras = LocalDateTime.now().minusDays(30);
        return dataCadastro.isAfter(trintaDiasAtras);
    }

    public static Hospede criar(
            String nome,
            String sobrenome,
            String cpf,
            String email,
            String telefone,
            Endereco endereco
    ) {
        return Hospede.builder()
                .id(UUID.randomUUID())
                .nome(nome)
                .sobrenome(sobrenome)
                .cpf(cpf)
                .email(email)
                .telefone(telefone)
                .endereco(endereco)
                .dataCadastro(LocalDateTime.now())
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

    public static List<Hospede> buscarPorTermo(String termo, List<Hospede> hospedes) {
        String termoNormalizado = termo.toLowerCase().trim();
        String termoNumerico = termo.replaceAll("\\D", "");
        
        return hospedes.stream()
                .filter(hospede -> 
                    hospede.nome.toLowerCase().contains(termoNormalizado) ||
                    hospede.sobrenome.toLowerCase().contains(termoNormalizado) ||
                    hospede.cpf.replaceAll("\\D", "").contains(termoNumerico) ||
                    hospede.email.toLowerCase().contains(termoNormalizado)
                )
                .toList();
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DadosHospede {
        private String nome;
        private String sobrenome;
        private String cpf;
        private String email;
        private String telefone;
        private Endereco endereco;
    }
}
