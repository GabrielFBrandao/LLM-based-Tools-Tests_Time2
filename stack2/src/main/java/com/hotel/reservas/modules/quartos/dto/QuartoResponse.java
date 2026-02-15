package com.hotel.reservas.modules.quartos.dto;

import com.hotel.reservas.modules.quartos.model.Cama;
import com.hotel.reservas.modules.quartos.model.Quarto;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO para resposta de operações de Quarto.
 * 
 * Decisões de implementação:
 * - Sem validações: Dados já validados na entidade
 * - Inclui ID: Necessário para operações subsequentes
 * - Lista de tipos de camas: Simplifica exibição no frontend
 * - Separação Request/Response: Evita expor dados desnecessários
 */
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
