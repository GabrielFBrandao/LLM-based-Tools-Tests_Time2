package com.hotel.reservas.modules.quartos.dto;

import com.hotel.reservas.modules.quartos.model.Cama;
import com.hotel.reservas.modules.quartos.model.Quarto;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO para requisição de criação/atualização de Quarto.
 * 
 * Decisões de implementação:
 * - Bean Validation: Validação declarativa no DTO
 * - @NotBlank vs @NotNull: Strings não podem ser vazias
 * - @DecimalMin: Validação de valor mínimo para preço
 * - Mensagens customizadas: Feedback claro ao cliente
 * - Separação Request/Response: Controle de dados de entrada/saída
 */
@Data
public class QuartoRequest {

    @NotBlank(message = "Número do quarto é obrigatório")
    private String numero;

    @NotNull(message = "Capacidade é obrigatória")
    @Min(value = 1, message = "Capacidade mínima é 1")
    private Integer capacidade;

    @NotBlank(message = "Tipo é obrigatório")
    private String tipo;

    @NotNull(message = "Preço da diária é obrigatório")
    @DecimalMin(value = "0.01", message = "Preço deve ser maior que zero")
    private BigDecimal precoDiaria;

    private Boolean temFrigobar;
    private Boolean temCafe;
    private Boolean temAr;
    private Boolean temTv;

    @NotNull(message = "Status é obrigatório")
    private Quarto.StatusQuarto status;

    // Lista opcional: Quarto pode não ter camas cadastradas inicialmente
    private List<Cama.TipoCama> tiposCamas;
}
