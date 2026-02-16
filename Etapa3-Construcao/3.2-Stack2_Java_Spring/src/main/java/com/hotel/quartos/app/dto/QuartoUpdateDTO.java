package com.hotel.quartos.app.dto;

import com.hotel.quartos.domain.TipoCama;
import com.hotel.quartos.domain.TipoQuarto;

import java.math.BigDecimal;
import java.util.List;

public record QuartoUpdateDTO(
        Integer capacidade,
        TipoQuarto tipo,
        BigDecimal precoHora,
        Boolean frigobar,
        Boolean cafeManha,
        Boolean arCondicionado,
        Boolean tv,
        List<TipoCama> camas
) {}
