package com.hotel.mapper;

import com.hotel.domain.entity.Quarto;
import com.hotel.domain.valueobject.Cama;
import com.hotel.dto.response.QuartoResponse;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Mapper responsável por converter entre entidades e DTOs do módulo de Quartos.
 *
 * DECISÃO — MAPPER MANUAL VS MAPSTRUCT:
 * MapStruct geraria este código automaticamente via annotation processor.
 * Optamos por mapper manual aqui para:
 * 1. Tornar o código explícito e legível (sem geração de código "mágico")
 * 2. Não adicionar dependência extra para um mapper simples
 * 3. Facilitar entendimento em contexto de demonstração
 *
 * Em produção com muitas entidades, MapStruct seria a escolha certa.
 *
 * PRINCÍPIO SRP: A responsabilidade de conversão fica isolada nesta classe.
 * Service e Controller nunca constroem DTOs diretamente.
 *
 * DECISÃO — @Component: Spring gerencia o ciclo de vida.
 * Injetável por @Autowired / construtor nos Services e Controllers.
 */
@Component
public class QuartoMapper {

    /**
     * Converte Quarto para representação resumida da listagem.
     * Inclui apenas campos necessários para a tabela/grid (RF04).
     */
    public QuartoResponse.Resumo toResumo(Quarto quarto) {
        return new QuartoResponse.Resumo(
            quarto.getId(),
            quarto.getNumero(),
            quarto.getTipo(),
            quarto.getTipo().getDescricao(),
            quarto.getPrecoDiaria(),
            quarto.getStatus(),
            quarto.getStatus().getDescricao(),
            mapCamas(quarto.getCamas())
        );
    }

    /**
     * Converte Quarto para representação detalhada.
     * Inclui todos os campos para tela de edição/visualização.
     */
    public QuartoResponse.Detalhe toDetalhe(Quarto quarto) {
        return new QuartoResponse.Detalhe(
            quarto.getId(),
            quarto.getNumero(),
            quarto.getCapacidade(),
            quarto.getTipo(),
            quarto.getTipo().getDescricao(),
            quarto.getPrecoDiaria(),
            quarto.isTemFrigobar(),
            quarto.isTemCafeDaManha(),
            quarto.isTemArCondicionado(),
            quarto.isTemTV(),
            quarto.getStatus(),
            quarto.getStatus().getDescricao(),
            mapCamas(quarto.getCamas()),
            quarto.getCriadoEm(),
            quarto.getAtualizadoEm()
        );
    }

    /** Converte lista de entidades para lista de resumos */
    public List<QuartoResponse.Resumo> toResumoList(List<Quarto> quartos) {
        return quartos.stream()
            .map(this::toResumo)
            .toList(); // toList() — imutável, disponível desde Java 16
    }

    /** Converte Value Object Cama para CamaInfo */
    private QuartoResponse.CamaInfo mapCama(Cama cama) {
        return new QuartoResponse.CamaInfo(
            cama.getTipo(),
            cama.getTipo().getDescricao(),
            cama.getTipo().getCapacidadePadrao()
        );
    }

    private List<QuartoResponse.CamaInfo> mapCamas(List<Cama> camas) {
        return camas.stream()
            .map(this::mapCama)
            .toList();
    }
}
