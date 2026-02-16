package com.hotel.quartos.app.dto;

import com.hotel.quartos.domain.TipoCama;
import com.hotel.quartos.domain.TipoQuarto;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;

// DTO de entrada para cadastro/edição. Validações de borda na camada de aplicação.
public record QuartoInputDTO(
        @NotNull @Positive @Max(9999) Integer numero,
        @NotNull @Positive @Max(20) Integer capacidade,
        @NotNull TipoQuarto tipo,
        @NotNull @DecimalMin("0.01") BigDecimal precoHora,
        @NotNull Boolean frigobar,
        @NotNull Boolean cafeManha,
        @NotNull Boolean arCondicionado,
        @NotNull Boolean tv,
        @NotNull @Size(min = 1) List<TipoCama> camas
) {}
