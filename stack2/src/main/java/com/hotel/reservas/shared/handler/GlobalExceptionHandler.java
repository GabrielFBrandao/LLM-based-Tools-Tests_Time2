package com.hotel.reservas.shared.handler;

import com.hotel.reservas.shared.exception.BusinessException;
import com.hotel.reservas.shared.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Handler global para tratamento centralizado de exceções.
 * 
 * Decisões de implementação:
 * - @RestControllerAdvice: Intercepta exceções de todos os controllers
 * - Exceções específicas: Tratamento diferenciado por tipo
 * - Status HTTP semânticos: 404 (Not Found), 400 (Bad Request)
 * - Records para responses: Imutabilidade e concisão (Java 14+)
 * - Timestamp: Rastreabilidade de erros
 * - Validação Bean: Retorna mapa campo->erro para feedback detalhado
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    // Trata recursos não encontrados (404)
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex) {
        ErrorResponse error = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                ex.getMessage(),
                LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    // Trata violações de regras de negócio (400)
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException ex) {
        ErrorResponse error = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                ex.getMessage(),
                LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    // Trata erros de validação Bean Validation (400)
    // Retorna mapa detalhado: campo -> mensagem de erro
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        ValidationErrorResponse response = new ValidationErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Erro de validação",
                LocalDateTime.now(),
                errors
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // Record para resposta de erro simples (imutável)
    record ErrorResponse(int status, String message, LocalDateTime timestamp) {}
    
    // Record para resposta de erro de validação (com detalhes por campo)
    record ValidationErrorResponse(int status, String message, LocalDateTime timestamp, Map<String, String> errors) {}
}
