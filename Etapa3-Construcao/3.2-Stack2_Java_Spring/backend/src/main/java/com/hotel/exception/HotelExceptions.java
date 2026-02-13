package com.hotel.exception;

/**
 * Hierarquia de exceções de domínio do sistema hoteleiro.
 *
 * DECISÃO — EXCEÇÕES CUSTOMIZADAS VS GENÉRICAS:
 * Usar exceções específicas do domínio (em vez de IllegalArgumentException,
 * RuntimeException genéricas) tem várias vantagens:
 *
 * 1. O @ControllerAdvice pode tratar cada tipo com HTTP status diferente
 *    (QuartoNaoEncontradoException → 404, QuartoInvalidoException → 400)
 * 2. Mensagens de erro são mais expressivas e rastreáveis
 * 3. O código cliente pode capturar exceções específicas se necessário
 * 4. Documentação implícita do que pode falhar em cada operação
 *
 * DECISÃO — UNCHECKED EXCEPTIONS:
 * Todas estendem RuntimeException (unchecked). Exceções de negócio
 * no Spring raramente devem ser checked pois o framework
 * não as suporta bem em callbacks e streams.
 */
public final class HotelExceptions {

    // Construtor privado — classe utilitária de namespace, não instanciável
    private HotelExceptions() {}

    // =========================================================================
    // Exceções do módulo de Quartos
    // =========================================================================

    /**
     * Lançada quando um quarto não é encontrado pelo ID ou número.
     * Mapeada para HTTP 404 Not Found pelo GlobalExceptionHandler.
     */
    public static class QuartoNaoEncontradoException extends RuntimeException {
        public QuartoNaoEncontradoException(Long id) {
            super("Quarto com ID %d não encontrado.".formatted(id));
        }
        public QuartoNaoEncontradoException(String numero) {
            super("Quarto com número '%s' não encontrado.".formatted(numero));
        }
    }

    /**
     * Lançada quando uma regra de negócio impede a operação no quarto.
     * Mapeada para HTTP 422 Unprocessable Entity.
     * Exemplos: número duplicado (RN01), quarto ocupado (RN09).
     */
    public static class QuartoInvalidoException extends RuntimeException {
        public QuartoInvalidoException(String mensagem) {
            super(mensagem);
        }
    }

    // =========================================================================
    // Exceções do módulo de Hóspedes
    // =========================================================================

    public static class HospedeNaoEncontradoException extends RuntimeException {
        public HospedeNaoEncontradoException(Long id) {
            super("Hóspede com ID %d não encontrado.".formatted(id));
        }
        public HospedeNaoEncontradoException(String cpf) {
            super("Hóspede com CPF '%s' não encontrado.".formatted(cpf));
        }
    }

    public static class HospedeInvalidoException extends RuntimeException {
        public HospedeInvalidoException(String mensagem) {
            super(mensagem);
        }
    }

    // =========================================================================
    // Exceções do módulo de Reservas
    // =========================================================================

    public static class ReservaNaoEncontradaException extends RuntimeException {
        public ReservaNaoEncontradaException(Long id) {
            super("Reserva com ID %d não encontrada.".formatted(id));
        }
    }

    public static class ReservaInvalidaException extends RuntimeException {
        public ReservaInvalidaException(String mensagem) {
            super(mensagem);
        }
    }
}
