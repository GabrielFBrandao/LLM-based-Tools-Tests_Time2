package com.hotel.booking.dtos;

import com.hotel.booking.enums.TipoQuarto;
import com.hotel.booking.enums.StatusQuarto;
import com.hotel.booking.enums.TipoCama;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuartoRequestDTO {
    
    @NotBlank(message = "Número do quarto é obrigatório")
    @Size(max = 10, message = "Número do quarto deve ter no máximo 10 caracteres")
    private String numero;
    
    @NotNull(message = "Capacidade é obrigatória")
    @Min(value = 1, message = "Capacidade deve ser no mínimo 1")
    @Max(value = 10, message = "Capacidade deve ser no máximo 10")
    private Integer capacidade;
    
    @NotNull(message = "Tipo do quarto é obrigatório")
    private TipoQuarto tipo;
    
    @NotNull(message = "Preço por noite é obrigatório")
    @DecimalMin(value = "0.01", message = "Preço por noite deve ser maior que zero")
    @DecimalMax(value = "9999.99", message = "Preço por noite deve ser menor que 10000")
    private BigDecimal precoPorNoite;
    
    private boolean hasMinibar;
    private boolean hasCafeDaManha;
    private boolean hasArCondicionado;
    private boolean hasTV;
    
    private StatusQuarto status;
    
    @NotEmpty(message = "Quarto deve ter pelo menos uma cama")
    @Valid
    private List<CamaRequestDTO> camas;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CamaRequestDTO {
        
        @NotNull(message = "Tipo da cama é obrigatório")
        private TipoCama tipo;
    }
}
