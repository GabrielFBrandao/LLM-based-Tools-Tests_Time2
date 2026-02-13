package com.hotel.booking.mappers;

import com.hotel.booking.dtos.QuartoDTO;
import com.hotel.booking.dtos.QuartoRequestDTO;
import com.hotel.booking.entities.Quarto;
import com.hotel.booking.entities.Cama;
import com.hotel.booking.enums.TipoQuarto;
import com.hotel.booking.enums.StatusQuarto;
import com.hotel.booking.enums.TipoCama;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class QuartoMapper {

    // ========== CONVERSÃO ENTIDADE -> DTO ==========

    /**
     * Converte entidade Quarto para QuartoDTO
     */
    public QuartoDTO toDTO(Quarto quarto) {
        if (quarto == null) {
            return null;
        }

        List<QuartoDTO.CamaDTO> camasDTO = quarto.getCamas().stream()
                .map(this::toCamaDTO)
                .collect(Collectors.toList());

        return QuartoDTO.builder()
                .id(quarto.getId())
                .numero(quarto.getNumero())
                .capacidade(quarto.getCapacidade())
                .tipo(quarto.getTipo())
                .precoPorNoite(quarto.getPrecoPorNoite())
                .hasMinibar(quarto.isHasMinibar())
                .hasCafeDaManha(quarto.isHasCafeDaManha())
                .hasArCondicionado(quarto.isHasArCondicionado())
                .hasTV(quarto.isHasTV())
                .status(quarto.getStatus())
                .camas(camasDTO)
                .tipoDescricao(getTipoDescricao(quarto.getTipo()))
                .statusDescricao(getStatusDescricao(quarto.getStatus()))
                .precoFormatado(formatarPreco(quarto.getPrecoPorNoite()))
                .comodidades(getComodidades(quarto))
                .descricaoCamas(getDescricaoCamas(quarto.getCamas()))
                .build();
    }

    /**
     * Converte lista de entidades para lista de DTOs
     */
    public List<QuartoDTO> toDTOList(List<Quarto> quartos) {
        return quartos.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Converte entidade Cama para CamaDTO
     */
    public QuartoDTO.CamaDTO toCamaDTO(Cama cama) {
        if (cama == null) {
            return null;
        }

        return QuartoDTO.CamaDTO.builder()
                .id(cama.getId())
                .tipo(cama.getTipo())
                .tipoDescricao(getTipoCamaDescricao(cama.getTipo()))
                .capacidade(cama.getCapacidade())
                .descricao(cama.getDescricao())
                .build();
    }

    // ========== CONVERSÃO DTO -> ENTIDADE ==========

    /**
     * Converte QuartoRequestDTO para entidade Quarto
     */
    public Quarto toEntity(QuartoRequestDTO dto) {
        if (dto == null) {
            return null;
        }

        List<Cama> camas = dto.getCamas().stream()
                .map(this::toCamaEntity)
                .collect(Collectors.toList());

        return Quarto.builder()
                .numero(dto.getNumero())
                .capacidade(dto.getCapacidade())
                .tipo(dto.getTipo())
                .precoPorNoite(dto.getPrecoPorNoite())
                .hasMinibar(dto.isHasMinibar())
                .hasCafeDaManha(dto.isHasCafeDaManha())
                .hasArCondicionado(dto.isHasArCondicionado())
                .hasTV(dto.isHasTV())
                .status(dto.getStatus() != null ? dto.getStatus() : StatusQuarto.DISPONIVEL)
                .camas(camas)
                .build();
    }

    /**
     * Converte CamaRequestDTO para entidade Cama
     */
    public Cama toCamaEntity(QuartoRequestDTO.CamaRequestDTO dto) {
        if (dto == null) {
            return null;
        }

        return Cama.builder()
                .tipo(dto.getTipo())
                .build();
    }

    /**
     * Atualiza entidade Quarto com dados do DTO
     */
    public void updateEntityFromDTO(QuartoRequestDTO dto, Quarto entity) {
        if (dto == null || entity == null) {
            return;
        }

        entity.setNumero(dto.getNumero());
        entity.setCapacidade(dto.getCapacidade());
        entity.setTipo(dto.getTipo());
        entity.setPrecoPorNoite(dto.getPrecoPorNoite());
        entity.setHasMinibar(dto.isHasMinibar());
        entity.setHasCafeDaManha(dto.isHasCafeDaManha());
        entity.setHasArCondicionado(dto.isHasArCondicionado());
        entity.setHasTV(dto.isHasTV());
        
        if (dto.getStatus() != null) {
            entity.setStatus(dto.getStatus());
        }

        // Atualiza camas se fornecidas
        if (dto.getCamas() != null) {
            List<Cama> camas = dto.getCamas().stream()
                    .map(this::toCamaEntity)
                    .collect(Collectors.toList());
            entity.setCamas(camas);
        }
    }

    // ========== MÉTODOS UTILITÁRIOS ==========

    /**
     * Obtém descrição do tipo de quarto
     */
    private String getTipoDescricao(TipoQuarto tipo) {
        if (tipo == null) return null;
        return tipo.getDescricao();
    }

    /**
     * Obtém descrição do status do quarto
     */
    private String getStatusDescricao(StatusQuarto status) {
        if (status == null) return null;
        return status.getDescricao();
    }

    /**
     * Obtém descrição do tipo de cama
     */
    private String getTipoCamaDescricao(TipoCama tipo) {
        if (tipo == null) return null;
        return tipo.getDescricao();
    }

    /**
     * Formata preço para exibição
     */
    private String formatarPreco(java.math.BigDecimal preco) {
        if (preco == null) return null;
        return String.format("R$ %.2f", preco);
    }

    /**
     * Obtém lista de comodidades do quarto
     */
    private List<String> getComodidades(Quarto quarto) {
        return java.util.Arrays.asList(
                quarto.isHasMinibar() ? "Frigobar" : null,
                quarto.isHasCafeDaManha() ? "Café da Manhã" : null,
                quarto.isHasArCondicionado() ? "Ar-Condicionado" : null,
                quarto.isHasTV() ? "TV" : null
        ).stream()
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());
    }

    /**
     * Obtém descrição das camas do quarto
     */
    private String getDescricaoCamas(List<Cama> camas) {
        if (camas == null || camas.isEmpty()) {
            return "Nenhuma cama";
        }

        java.util.Map<TipoCama, Long> contagem = camas.stream()
                .collect(Collectors.groupingBy(Cama::getTipo, Collectors.counting()));

        return contagem.entrySet().stream()
                .map(entry -> {
                    String tipo = getTipoCamaDescricao(entry.getKey());
                    Long quantidade = entry.getValue();
                    return quantidade > 1 ? quantidade + "x " + tipo : tipo;
                })
                .collect(Collectors.joining(", "));
    }

    /**
     * Valida consistência entre capacidade e camas
     */
    public boolean validarCapacidadeCamas(Integer capacidade, List<Cama> camas) {
        if (capacidade == null || camas == null || camas.isEmpty()) {
            return false;
        }

        int capacidadeCalculada = camas.stream()
                .mapToInt(Cama::getCapacidade)
                .sum();

        return capacidadeCalculada == capacidade;
    }

    /**
     * Calcula capacidade total das camas
     */
    public int calcularCapacidadeCamas(List<Cama> camas) {
        if (camas == null || camas.isEmpty()) {
            return 0;
        }

        return camas.stream()
                .mapToInt(Cama::getCapacidade)
                .sum();
    }
}
