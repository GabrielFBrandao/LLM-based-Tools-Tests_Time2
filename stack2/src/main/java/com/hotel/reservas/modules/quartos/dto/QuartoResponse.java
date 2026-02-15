package com.hotel.reservas.modules.quartos.dto;

import com.hotel.reservas.modules.quartos.model.Cama;
import com.hotel.reservas.modules.quartos.model.Quarto;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class QuartoResponse {

    private Long id;
    private String numero;
    private Integer capacidade;
    private String tipo;
    private BigDecimal precoDiaria;
    private Boolean temFrigobar;
    private Boolean temCafe;
    private Boolean temAr;
    private Boolean temTv;
    private Quarto.StatusQuarto status;
    private List<Cama.TipoCama> tiposCamas;
}
