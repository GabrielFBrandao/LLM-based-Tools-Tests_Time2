package com.hotel.booking.valueobjects;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Endereco {
    private String logradouro;
    private String numero;
    private String complemento;
    private String bairro;
    private String cidade;
    private String estado;
    private String cep;
    private String pais;

    public boolean ehValido() {
        return logradouro != null && !logradouro.trim().isEmpty() &&
               numero != null && !numero.trim().isEmpty() &&
               bairro != null && !bairro.trim().isEmpty() &&
               cidade != null && !cidade.trim().isEmpty() &&
               estado != null && !estado.trim().isEmpty() &&
               cep != null && validarCEP(cep);
    }

    private boolean validarCEP(String cep) {
        return cep.matches("^\\d{5}-\\d{3}$");
    }

    public String getEnderecoCompleto() {
        StringBuilder endereco = new StringBuilder();
        endereco.append(logradouro).append(", ").append(numero);
        
        if (complemento != null && !complemento.trim().isEmpty()) {
            endereco.append(" - ").append(complemento);
        }
        
        endereco.append(", ").append(bairro);
        endereco.append(", ").append(cidade).append(" - ").append(estado);
        endereco.append(", ").append(cep);
        
        return endereco.toString();
    }
}
