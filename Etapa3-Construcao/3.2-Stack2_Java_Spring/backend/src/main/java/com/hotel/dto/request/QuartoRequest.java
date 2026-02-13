package com.hotel.dto.request;

import com.hotel.domain.enums.TipoCama;
import com.hotel.domain.enums.TipoQuarto;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTOs de entrada (request) para o módulo de Quartos.
 *
 * DECISÃO — CLASSES ANINHADAS COMO DTOs:
 * Agrupar DTOs relacionados em uma classe contêiner (inner classes estáticas)
 * mantém o código organizado sem criar dezenas de arquivos de DTO separados.
 * O padrão é amplamente utilizado (Spring Security, Stripe API, etc.).
 *
 * DECISÃO — DTO vs ENTIDADE NA REQUISIÇÃO:
 * NUNCA receber a entidade Quarto diretamente no Controller.
 * Motivações:
 * 1. Segurança: evita Mass Assignment Vulnerability (campos como 'id', 'status',
 *    'criadoEm' não devem ser aceitos do cliente)
 * 2. Flexibilidade: o contrato da API pode evoluir independente da entidade
 * 3. Validação: @Valid aplica as anotações Jakarta Validation antes de entrar no service
 *
 * DECISÃO — RECORD vs CLASS:
 * Records Java são ideais para DTOs (imutáveis, equals/hashCode/toString automáticos).
 * Optamos por records aqui — suporte completo desde Java 16.
 */
public final class QuartoRequest {

    private QuartoRequest() {}

    /**
     * DTO para cadastro de quarto (UC01 — RF01).
     * Todos os campos com validação Jakarta.
     */
    public record Criar(

        @NotBlank(message = "Número do quarto é obrigatório")
        @Size(max = 10, message = "Número do quarto deve ter no máximo 10 caracteres")
        String numero,

        @NotNull(message = "Capacidade é obrigatória")
        @Min(value = 1, message = "Capacidade deve ser de no mínimo 1 pessoa")
        @Max(value = 20, message = "Capacidade máxima é de 20 pessoas")
        Integer capacidade,

        @NotNull(message = "Tipo do quarto é obrigatório")
        TipoQuarto tipo,

        /**
         * DECISÃO: @Positive em vez de @Min(0) pois queremos > 0, não >= 0.
         * @DecimalMin com inclusive=false teria o mesmo efeito mas é menos legível.
         */
        @NotNull(message = "Preço da diária é obrigatório")
        @Positive(message = "Preço da diária deve ser maior que zero (RN03)")
        @Digits(integer = 8, fraction = 2, message = "Preço inválido")
        BigDecimal precoDiaria,

        // Comodidades — null equivale a false (primitivo boolean não aceita null)
        boolean temFrigobar,
        boolean temCafeDaManha,
        boolean temArCondicionado,
        boolean temTV,

        /**
         * Lista de tipos de cama.
         * DECISÃO: List<TipoCama> (não Set) pois o mesmo tipo pode aparecer
         * mais de uma vez (quarto com duas camas solteiro, por exemplo).
         * RN05: ao menos uma cama obrigatória.
         */
        @NotEmpty(message = "O quarto deve ter pelo menos um tipo de cama (RN05)")
        List<@NotNull(message = "Tipo de cama não pode ser nulo") TipoCama> tiposCama

    ) {}

    /**
     * DTO para edição de quarto (UC03 — RF03).
     * DECISÃO: Campos opcionais (null = não alterar).
     * Essa abordagem (PATCH semântico) é mais flexível que
     * exigir todos os campos em toda edição (sobrescrita total).
     */
    public record Editar(

        @Size(max = 10, message = "Número deve ter no máximo 10 caracteres")
        String numero,

        @Min(value = 1, message = "Capacidade mínima é 1")
        Integer capacidade,

        TipoQuarto tipo,

        @Positive(message = "Preço deve ser maior que zero")
        BigDecimal precoDiaria,

        Boolean temFrigobar,
        Boolean temCafeDaManha,
        Boolean temArCondicionado,
        Boolean temTV,

        // Null = não alterar as camas; lista vazia = erro de validação
        List<TipoCama> tiposCama

    ) {}

    /**
     * DTO para alteração de status (UC04 — RF05).
     * DECISÃO: DTO específico para operação PATCH de status.
     * Evita que o endpoint de status aceite campos não relacionados.
     */
    public record AlterarStatus(

        @NotNull(message = "Novo status é obrigatório")
        com.hotel.domain.enums.StatusQuarto status

    ) {}
}
