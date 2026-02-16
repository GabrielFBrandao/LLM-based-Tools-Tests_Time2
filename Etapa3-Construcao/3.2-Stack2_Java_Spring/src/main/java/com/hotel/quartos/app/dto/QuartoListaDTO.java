package com.hotel.quartos.app.dto;

import com.hotel.quartos.domain.Disponibilidade;
import com.hotel.quartos.domain.TipoQuarto;

import java.math.BigDecimal;

// DTO de saída para listagem, contendo os campos solicitados.
public record QuartoListaDTO(
        String id,
        Integer numero,
        TipoQuarto tipo,
        BigDecimal precoHora,
        Disponibilidade disponibilidade
) {}
