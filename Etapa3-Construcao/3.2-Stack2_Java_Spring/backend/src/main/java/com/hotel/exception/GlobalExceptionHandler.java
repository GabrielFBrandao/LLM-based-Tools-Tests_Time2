package com.hotel.exception;

import com.hotel.exception.HotelExceptions.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;
import java.time.Instant;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Tratamento centralizado de exceções para toda a API.
 *
 * DECISÃO — @RestControllerAdvice + ProblemDetail (RFC 9457):
 * Spring 6+ suporta ProblemDetail nativamente — formato padrão de erros HTTP.
 * Vantagens:
 * 1. Resposta de erro padronizada em toda a API
 * 2. Sem código de tratamento de erro espalhado nos Controllers
 * 3. Compatível com RFC 9457 (substituiu RFC 7807) — padrão da indústria
 * 4. Fácil extensão com campos customizados (setProperty)
 *
 * DECISÃO — MAPEAMENTO DE STATUS HTTP:
 * - 404 Not Found: recurso não existe (Quarto/Hóspede/Reserva não encontrado)
 * - 422 Unprocessable Entity: requisição válida mas viola regra de negócio
 * - 400 Bad Request: dados de entrada com formato/validação inválidos
 * - 500 Internal Server Error: erros não antecipados (fallback)
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ── 404 Not Found ─────────────────────────────────────────────────────────

    @ExceptionHandler({
        QuartoNaoEncontradoException.class,
        HospedeNaoEncontradoException.class,
        ReservaNaoEncontradaException.class
    })
    public ProblemDetail handleNaoEncontrado(RuntimeException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
            HttpStatus.NOT_FOUND, ex.getMessage()
        );
        problem.setType(URI.create("/erros/nao-encontrado"));
        problem.setTitle("Recurso não encontrado");
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    // ── 422 Unprocessable Entity (violação de regra de negócio) ──────────────

    @ExceptionHandler({
        QuartoInvalidoException.class,
        HospedeInvalidoException.class,
        ReservaInvalidaException.class
    })
    public ProblemDetail handleRegraDeNegocio(RuntimeException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
            HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage()
        );
        problem.setType(URI.create("/erros/regra-de-negocio"));
        problem.setTitle("Violação de regra de negócio");
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    // ── 400 Bad Request (falha na validação Jakarta @Valid) ───────────────────

    /**
     * Captura erros de validação (@Valid) e retorna todos os campos inválidos.
     *
     * DECISÃO: Retornar TODOS os erros de uma vez (não apenas o primeiro).
     * O usuário/cliente sabe de todas as correções necessárias em uma única chamada.
     * Map<campo, mensagem> é uma estrutura clara para o frontend tratar.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidacao(MethodArgumentNotValidException ex) {
        Map<String, String> erros = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .collect(Collectors.toMap(
                FieldError::getField,
                fe -> fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "Valor inválido",
                (msg1, msg2) -> msg1 // Em caso de múltiplos erros no mesmo campo, mantém o primeiro
            ));

        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        problem.setType(URI.create("/erros/validacao"));
        problem.setTitle("Dados inválidos");
        problem.setDetail("Um ou mais campos contêm valores inválidos.");
        problem.setProperty("erros", erros);
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    // ── 400 Bad Request (IllegalArgumentException da entidade) ────────────────

    @ExceptionHandler(IllegalArgumentException.class)
    public ProblemDetail handleIllegalArgument(IllegalArgumentException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
            HttpStatus.BAD_REQUEST, ex.getMessage()
        );
        problem.setType(URI.create("/erros/argumento-invalido"));
        problem.setTitle("Argumento inválido");
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    // ── 500 Internal Server Error (fallback para erros não antecipados) ────────

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleErroGenerico(Exception ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
            HttpStatus.INTERNAL_SERVER_ERROR,
            "Ocorreu um erro interno. Por favor, tente novamente."
        );
        problem.setType(URI.create("/erros/interno"));
        problem.setTitle("Erro interno do servidor");
        problem.setProperty("timestamp", Instant.now());
        // DECISÃO: Não expor mensagem interna da exceção (ex.getMessage()) em produção
        // por segurança — pode revelar detalhes de implementação.
        return problem;
    }
}
