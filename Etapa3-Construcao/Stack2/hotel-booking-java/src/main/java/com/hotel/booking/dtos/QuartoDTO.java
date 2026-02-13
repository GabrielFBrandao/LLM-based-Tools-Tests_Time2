package com.hotel.booking.dtos;

import com.hotel.booking.enums.TipoQuarto;
import com.hotel.booking.enums.StatusQuarto;
import com.hotel.booking.enums.TipoCama;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuartoDTO {
    private UUID id;
    private String numero;
    private Integer capacidade;
    private TipoQuarto tipo;
    private BigDecimal precoPorNoite;
    private boolean hasMinibar;
    private boolean hasCafeDaManha;
    private boolean hasArCondicionado;
    private boolean hasTV;
    private StatusQuarto status;
    private List<CamaDTO> camas;
    
    // Campos adicionais para resposta
    private String tipoDescricao;
    private String statusDescricao;
    private String precoFormatado;
    private List<String> comodidades;
    private String descricaoCamas;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CamaDTO {
        private UUID id;
        private TipoCama tipo;
        private String tipoDescricao;
        private Integer capacidade;
        private String descricao;
    }
}
