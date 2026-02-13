package com.hotel.booking.mappers.impl;

import com.hotel.booking.dtos.QuartoDTO;
import com.hotel.booking.dtos.QuartoRequestDTO;
import com.hotel.booking.dtos.CamaDTO;
import com.hotel.booking.dtos.CamaRequestDTO;
import com.hotel.booking.entities.Quarto;
import com.hotel.booking.entities.Cama;
import com.hotel.booking.mappers.QuartoMapper;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;
import java.util.UUID;

/**
 * Implementação do Mapper de Quartos
 * 
 * Princípios SOLID aplicados:
 * - Single Responsibility: Responsável apenas pela conversão entre DTOs e Entidades
 * - Open/Closed: Aberta para extensão (novos mapeamentos), fechada para modificação
 * - Liskov Substitution: Pode ser substituída por qualquer implementação de QuartoMapper
 * - Interface Segregation: Implementa apenas métodos essenciais de mapeamento
 * - Dependency Inversion: Depende de abstrações (DTOs e Entidades), não de implementações
 * 
 * Clean Code aplicados:
 * - Métodos pequenos e focados
 * - Nomes descritivos que indicam intenção
 * - Validações de parâmetros
 * - Imutabilidade onde aplicável
 * - Tratamento consistente de nulos
 * 
 * Decisões de implementação:
 * 1. @Component para injeção automática
 *    - Convenção do Spring Boot
 *    - Suporte a @Autowired
 *    - Configuração automática
 * 
 * 2. Streams Java para transformações
 *    - Código funcional e declarativo
 *    - Performance otimizada
 *    - Facilita paralelização
 * 
 * 3. Validações de nulos
 *    - Prevenção de NullPointerException
 *    - Comportamento consistente
 *    - Facilita debugging
 * 
 * 4. Geração de IDs quando necessário
 *    - Garante consistência dos dados
 *    - Facilita criação de novas entidades
 *    - Evita IDs nulos
 */
@Component
public class QuartoMapperImpl implements QuartoMapper {

    // ========== MÉTODOS DE CONVERSÃO ENTIDADE -> DTO ==========

    /**
     * Converte entidade Quarto para QuartoDTO
     * 
     * Decisão: Mapeamento completo com campos derivados
     * - Inclui informações calculadas
     * - Formatação de dados
     * - Consistência na API
     * 
     * @param entity Entidade Quarto a ser convertida
     * @return QuartoDTO com dados mapeados
     * @throws IllegalArgumentException se entity for nula
     */
    @Override
    public QuartoDTO toDTO(Quarto entity) {
        if (entity == null) {
            throw new IllegalArgumentException("Entidade Quarto não pode ser nula");
        }

        return QuartoDTO.builder()
                .id(entity.getId())
                .numero(entity.getNumero())
                .capacidade(entity.getCapacidade())
                .tipo(entity.getTipo())
                .precoPorNoite(entity.getPrecoPorNoite())
                .hasMinibar(entity.isHasMinibar())
                .hasCafeDaManha(entity.isHasCafeDaManha())
                .hasArCondicionado(entity.isHasArCondicionado())
                .hasTV(entity.isHasTV())
                .status(entity.getStatus())
                .camas(entity.getCamas() != null ? 
                        entity.getCamas().stream()
                                .map(this::toCamaDTO)
                                .collect(Collectors.toList()) : 
                        List.of())
                // Campos derivados para facilitar consumo no frontend
                .capacidadeTotal(calcularCapacidadeTotal(entity))
                .comodidades(obterComodidades(entity))
                .descricaoCamas(gerarDescricaoCamas(entity))
                .disponivel(entity.getStatus() == StatusQuarto.DISPONIVEL)
                .build();
    }

    /**
     * Converte lista de entidades Quarto para lista de QuartoDTO
     * 
     * Decisão: Stream para transformação funcional
     * - Performance otimizada
     * - Código conciso
     * - Facilita paralelização
     * 
     * @param entities Lista de entidades a ser convertida
     * @return Lista de DTOs convertidos
     * @throws IllegalArgumentException se entities for nula
     */
    @Override
    public List<QuartoDTO> toDTO(List<Quarto> entities) {
        if (entities == null) {
            throw new IllegalArgumentException("Lista de entidades Quarto não pode ser nula");
        }

        return entities.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Converte entidade Cama para CamaDTO
     * 
     * Decisão: Mapeamento simples com validação
     * - Consistência na estrutura
     * - Validação de nulos
     * - Facilita debugging
     * 
     * @param entity Entidade Cama a ser convertida
     * @return CamaDTO com dados mapeados
     * @throws IllegalArgumentException se entity for nula
     */
    @Override
    public CamaDTO toCamaDTO(Cama entity) {
        if (entity == null) {
            throw new IllegalArgumentException("Entidade Cama não pode ser nula");
        }

        return CamaDTO.builder()
                .id(entity.getId())
                .tipo(entity.getTipo())
                .quartoId(entity.getQuarto() != null ? entity.getQuarto().getId() : null)
                .capacidade(calcularCapacidadeCama(entity.getTipo()))
                .descricao(gerarDescricaoCama(entity.getTipo()))
                .build();
    }

    // ========== MÉTODOS DE CONVERSÃO DTO -> ENTIDADE ==========

    /**
     * Converte QuartoRequestDTO para entidade Quarto
     * 
     * Decisão: Mapeamento com geração de ID
     * - Gera ID se não existir
     * - Valida dados obrigatórios
     * - Prepara para persistência
     * 
     * @param dto DTO com dados do quarto
     * @return Entidade Quarto com dados mapeados
     * @throws IllegalArgumentException se dto for nulo
     */
    @Override
    public Quarto toEntity(QuartoRequestDTO dto) {
        if (dto == null) {
            throw new IllegalArgumentException("QuartoRequestDTO não pode ser nulo");
        }

        Quarto.QuartoBuilder builder = Quarto.builder()
                .id(dto.getId() != null ? dto.getId() : UUID.randomUUID())
                .numero(dto.getNumero())
                .capacidade(dto.getCapacidade())
                .tipo(dto.getTipo())
                .precoPorNoite(dto.getPrecoPorNoite())
                .hasMinibar(dto.isHasMinibar())
                .hasCafeDaManha(dto.isHasCafeDaManha())
                .hasArCondicionado(dto.isHasArCondicionado())
                .hasTV(dto.isHasTV())
                .status(dto.getStatus() != null ? dto.getStatus() : StatusQuarto.DISPONIVEL);

        // Mapeamento das camas
        if (dto.getCamas() != null && !dto.getCamas().isEmpty()) {
            List<Cama> camas = dto.getCamas().stream()
                    .map(camaDTO -> toCamaEntity(camaDTO, null)) // quarto será setado depois
                    .collect(Collectors.toList());
            builder.camas(camas);
        }

        return builder.build();
    }

    /**
     * Converte lista de QuartoRequestDTO para lista de entidades Quarto
     * 
     * Decisão: Stream para transformação funcional
     * - Performance otimizada
     * - Código conciso
     * - Facilita paralelização
     * 
     * @param dtos Lista de DTOs a ser convertida
     * @return Lista de entidades convertidas
     * @throws IllegalArgumentException se dtos for nula
     */
    @Override
    public List<Quarto> toEntity(List<QuartoRequestDTO> dtos) {
        if (dtos == null) {
            throw new IllegalArgumentException("Lista de QuartoRequestDTO não pode ser nula");
        }

        return dtos.stream()
                .map(this::toEntity)
                .collect(Collectors.toList());
    }

    /**
     * Converte CamaRequestDTO para entidade Cama
     * 
     * Decisão: Mapeamento com referência ao quarto
     * - Associação bidirecional
     * - Geração de ID se necessário
     * - Validação de dados
     * 
     * @param dto DTO com dados da cama
     * @param quarto Entidade Quarto associada (pode ser nulo para criação)
     * @return Entidade Cama com dados mapeados
     * @throws IllegalArgumentException se dto for nulo
     */
    @Override
    public Cama toCamaEntity(CamaRequestDTO dto, Quarto quarto) {
        if (dto == null) {
            throw new IllegalArgumentException("CamaRequestDTO não pode ser nulo");
        }

        return Cama.builder()
                .id(dto.getId() != null ? dto.getId() : UUID.randomUUID())
                .tipo(dto.getTipo())
                .quarto(quarto)
                .build();
    }

    // ========== MÉTODOS DE ATUALIZAÇÃO ==========

    /**
     * Atualiza entidade Quarto com dados do DTO
     * 
     * Decisão: Atualização seletiva de campos
     * - Preserva campos não informados
     * - Atualiza apenas dados relevantes
     * - Mantém consistência
     * 
     * @param entity Entidade a ser atualizada
     * @param dto DTO com novos dados
     * @throws IllegalArgumentException se entity ou dto forem nulos
     */
    @Override
    public void updateEntity(Quarto entity, QuartoRequestDTO dto) {
        if (entity == null) {
            throw new IllegalArgumentException("Entidade Quarto não pode ser nula");
        }
        if (dto == null) {
            throw new IllegalArgumentException("QuartoRequestDTO não pode ser nulo");
        }

        // Atualização apenas dos campos informados
        if (dto.getNumero() != null) {
            entity.setNumero(dto.getNumero());
        }
        if (dto.getCapacidade() != null) {
            entity.setCapacidade(dto.getCapacidade());
        }
        if (dto.getTipo() != null) {
            entity.setTipo(dto.getTipo());
        }
        if (dto.getPrecoPorNoite() != null) {
            entity.setPrecoPorNoite(dto.getPrecoPorNoite());
        }
        if (dto.isHasMinibar() != null) {
            entity.setHasMinibar(dto.isHasMinibar());
        }
        if (dto.isHasCafeDaManha() != null) {
            entity.setHasCafeDaManha(dto.isHasCafeDaManha());
        }
        if (dto.isHasArCondicionado() != null) {
            entity.setHasArCondicionado(dto.isHasArCondicionado());
        }
        if (dto.isHasTV() != null) {
            entity.setHasTV(dto.isHasTV());
        }
        if (dto.getStatus() != null) {
            entity.setStatus(dto.getStatus());
        }

        // TODO: Implementar atualização das camas se necessário
        // Isso requer uma lógica mais complexa para adicionar/remover camas
    }

    // ========== MÉTODOS PRIVADOS AUXILIARES ==========

    /**
     * Calcula capacidade total do quarto baseada nas camas
     * 
     * Decisão: Método privado para reutilização
     * - Lógica centralizada
     * - Facilita manutenção
     * - Performance otimizada
     * 
     * @param quarto Entidade Quarto
     * @return Capacidade total calculada
     */
    private Integer calcularCapacidadeTotal(Quarto quarto) {
        if (quarto.getCamas() == null || quarto.getCamas().isEmpty()) {
            return 0;
        }

        return quarto.getCamas().stream()
                .mapToInt(cama -> calcularCapacidadeCama(cama.getTipo()))
                .sum();
    }

    /**
     * Calcula capacidade de uma cama baseada no tipo
     * 
     * Decisão: Método simples com validação
     * - Lógica centralizada
     * - Facilita extensão
     * - Performance otimizada
     * 
     * @param tipoCama Tipo da cama
     * @return Capacidade da cama
     */
    private Integer calcularCapacidadeCama(TipoCama tipoCama) {
        if (tipoCama == null) {
            return 0;
        }

        switch (tipoCama) {
            case SOLTEIRO:
                return 1;
            case CASAL_KING:
            case CASAL_QUEEN:
                return 2;
            default:
                return 1; // Valor padrão para tipos desconhecidos
        }
    }

    /**
     * Obtém lista de comodidades do quarto
     * 
     * Decisão: Método para formatação de dados
     * - Centraliza lógica de exibição
     * - Facilita internacionalização
     * - Consistência na API
     * 
     * @param quarto Entidade Quarto
     * @return Lista de comodidades
     */
    private List<String> obterComodidades(Quarto quarto) {
        List<String> comodidades = new ArrayList<>();

        if (quarto.isHasMinibar()) {
            comodidades.add("Frigobar");
        }
        if (quarto.isHasCafeDaManha()) {
            comodidades.add("Café da Manhã");
        }
        if (quarto.isHasArCondicionado()) {
            comodidades.add("Ar-Condicionado");
        }
        if (quarto.isHasTV()) {
            comodidades.add("TV");
        }

        return comodidades;
    }

    /**
     * Gera descrição formatada das camas do quarto
     * 
     * Decisão: Método para formatação de exibição
     * - Agrupa camas por tipo
     * - Formato compacto e legível
     * - Facilita UI
     * 
     * @param quarto Entidade Quarto
     * @return Descrição formatada das camas
     */
    private String gerarDescricaoCamas(Quarto quarto) {
        if (quarto.getCamas() == null || quarto.getCamas().isEmpty()) {
            return "Nenhuma cama";
        }

        // Agrupa camas por tipo para exibição compacta
        Map<TipoCama, Long> agrupado = quarto.getCamas().stream()
                .collect(Collectors.groupingBy(
                        Cama::getTipo,
                        Collectors.counting()
                ));

        return agrupado.entrySet().stream()
                .map(entry -> {
                    TipoCama tipo = entry.getKey();
                    Long quantidade = entry.getValue();
                    
                    String nomeTipo = obterNomeTipoCama(tipo);
                    return quantidade > 1 ? 
                            String.format("%dx %s", quantidade, nomeTipo) : 
                            nomeTipo;
                })
                .collect(Collectors.joining(", "));
    }

    /**
     * Gera descrição de um tipo de cama
     * 
     * Decisão: Método para formatação
     * - Centraliza nomes dos tipos
     * - Facilita internacionalização
     * - Consistência na exibição
     * 
     * @param tipoCama Tipo da cama
     * @return Nome formatado do tipo
     */
    private String gerarDescricaoCama(TipoCama tipoCama) {
        if (tipoCama == null) {
            return "Tipo desconhecido";
        }

        switch (tipoCama) {
            case SOLTEIRO:
                return "Cama de Solteiro";
            case CASAL_KING:
                return "Cama de Casal King";
            case CASAL_QUEEN:
                return "Cama de Casal Queen";
            default:
                return "Tipo desconhecido";
        }
    }

    /**
     * Obtém nome formatado do tipo de cama
     * 
     * Decisão: Método auxiliar para reutilização
     * - Centraliza nomes dos tipos
     * - Facilita manutenção
     * - Consistência na API
     * 
     * @param tipoCama Tipo da cama
     * @return Nome formatado
     */
    private String obterNomeTipoCama(TipoCama tipoCama) {
        if (tipoCama == null) {
            return "Desconhecido";
        }

        switch (tipoCama) {
            case SOLTEIRO:
                return "Solteiro";
            case CASAL_KING:
                return "Casal King";
            case CASAL_QUEEN:
                return "Casal Queen";
            default:
                return "Desconhecido";
        }
    }
}
