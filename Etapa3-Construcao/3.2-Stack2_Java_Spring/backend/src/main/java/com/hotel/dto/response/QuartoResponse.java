package com.hotel.dto.response;

import com.hotel.domain.enums.StatusQuarto;
import com.hotel.domain.enums.TipoCama;
import com.hotel.domain.enums.TipoQuarto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTOs de saída (response) para o módulo de Quartos.
 *
 * DECISÃO — POR QUE NÃO RETORNAR A ENTIDADE DIRETAMENTE:
 * 1. Controle total sobre o que é exposto na API (não vazar campos internos)
 * 2. Evitar problemas de serialização circular (Quarto → Reservas → Quarto)
 * 3. Diferentes representações para diferentes contextos:
 *    - Resumo: para listagens (menos dados, menos tráfego de rede)
 *    - Detalhe: para visualização individual (todos os campos)
 * 4. Desacoplamento: mudanças na entidade não quebram o contrato da API
 *
 * DECISÃO — RECORD PARA RESPONSE:
 * Records são ideais pois responses são imutáveis por natureza —
 * criados no mapeamento e consumidos na serialização, nunca modificados.
 *
 * DECISÃO — CAMPOS DESCRICAO NOS ENUMS:
 * Retornamos tanto o enum (para o frontend processar) quanto a descrição
 * em português (para exibir diretamente). O frontend pode usar qualquer um.
 */
public final class QuartoResponse {

    private QuartoResponse() {}

    /**
     * Representação resumida para listagem (UC02 — RF04).
     * Contém apenas os campos exibidos na tabela/grid de quartos.
     */
    public record Resumo(
        Long id,
        String numero,
        TipoQuarto tipo,
        String tipoDescricao,
        BigDecimal precoDiaria,
        StatusQuarto status,
        String statusDescricao,
        List<CamaInfo> camas
    ) {
        /** Construtor de conveniência para verificar disponibilidade na UI */
        public boolean estaDisponivel() {
            return status.aceitaReservas();
        }
    }

    /**
     * Representação completa para visualização/edição (UC03).
     * Inclui todos os campos, comodidades e metadados de auditoria.
     */
    public record Detalhe(
        Long id,
        String numero,
        Integer capacidade,
        TipoQuarto tipo,
        String tipoDescricao,
        BigDecimal precoDiaria,
        boolean temFrigobar,
        boolean temCafeDaManha,
        boolean temArCondicionado,
        boolean temTV,
        StatusQuarto status,
        String statusDescricao,
        List<CamaInfo> camas,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm
    ) {}

    /**
     * Informações de uma cama para serialização.
     * DECISÃO: Record aninhado em vez de expor o @Embeddable diretamente.
     * Controla exatamente o que é serializado do Value Object Cama.
     */
    public record CamaInfo(
        TipoCama tipo,
        String tipoDescricao,
        int capacidadePadrao
    ) {}
}
