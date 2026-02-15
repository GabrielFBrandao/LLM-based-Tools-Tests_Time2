package com.hotel.reservas.modules.quartos.mapper;

import com.hotel.reservas.modules.quartos.dto.QuartoRequest;
import com.hotel.reservas.modules.quartos.dto.QuartoResponse;
import com.hotel.reservas.modules.quartos.model.Cama;
import com.hotel.reservas.modules.quartos.model.Quarto;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

/**
 * Mapper responsável pela conversão entre DTOs e Entidades.
 * 
 * Decisões de implementação:
 * - SRP: Classe dedicada apenas a mapeamento
 * - Sem lógica de negócio: Apenas transformação de dados
 * - Método updateEntity: Reutilização em criação e atualização (DRY)
 * - Relacionamento bidirecional: Define quarto nas camas
 */
@Component
public class QuartoMapper {

    /**
     * Converte Request DTO para Entidade (usado na criação).
     */
    public Quarto toEntity(QuartoRequest request) {
        Quarto quarto = new Quarto();
        updateEntity(request, quarto);
        return quarto;
    }

    /**
     * Atualiza entidade existente com dados do Request DTO.
     * Usado tanto na criação quanto na atualização (DRY).
     * 
     * Importante: clear() nas camas antes de adicionar novas
     * para evitar duplicação em atualizações.
     */
    public void updateEntity(QuartoRequest request, Quarto quarto) {
        quarto.setNumero(request.getNumero());
        quarto.setCapacidade(request.getCapacidade());
        quarto.setTipo(request.getTipo());
        quarto.setPrecoDiaria(request.getPrecoDiaria());
        quarto.setTemFrigobar(request.getTemFrigobar());
        quarto.setTemCafe(request.getTemCafe());
        quarto.setTemAr(request.getTemAr());
        quarto.setTemTv(request.getTemTv());
        quarto.setStatus(request.getStatus());

        if (request.getTiposCamas() != null) {
            quarto.getCamas().clear(); // Remove camas antigas
            request.getTiposCamas().forEach(tipoCama -> {
                Cama cama = new Cama();
                cama.setTipoCama(tipoCama);
                cama.setQuarto(quarto); // Relacionamento bidirecional
                quarto.getCamas().add(cama);
            });
        }
    }

    /**
     * Converte Entidade para Response DTO.
     * Inclui lista de tipos de camas para exibição.
     */
    public QuartoResponse toResponse(Quarto quarto) {
        QuartoResponse response = new QuartoResponse();
        response.setId(quarto.getId());
        response.setNumero(quarto.getNumero());
        response.setCapacidade(quarto.getCapacidade());
        response.setTipo(quarto.getTipo());
        response.setPrecoDiaria(quarto.getPrecoDiaria());
        response.setTemFrigobar(quarto.getTemFrigobar());
        response.setTemCafe(quarto.getTemCafe());
        response.setTemAr(quarto.getTemAr());
        response.setTemTv(quarto.getTemTv());
        response.setStatus(quarto.getStatus());
        response.setTiposCamas(quarto.getCamas().stream()
                .map(Cama::getTipoCama)
                .collect(Collectors.toList()));
        return response;
    }
}
