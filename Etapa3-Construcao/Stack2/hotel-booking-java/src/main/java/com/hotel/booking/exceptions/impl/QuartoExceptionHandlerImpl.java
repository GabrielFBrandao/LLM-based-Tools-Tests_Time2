package com.hotel.booking.exceptions.impl;

import com.hotel.booking.exceptions.*;
import com.hotel.booking.dtos.ErrorResponseDTO;
import com.hotel.booking.dtos.ValidationErrorDTO;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import javax.validation.ConstraintViolation;
import javax.validation.ConstraintViolationException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Implementação do Manipulador Centralizado de Exceções
 * 
 * Princípios SOLID aplicados:
 * - Single Responsibility: Responsável apenas pelo tratamento de exceções da API
 * - Open/Closed: Aberto para extensão (novos handlers), fechado para modificação
 * - Liskov Substitution: Pode ser substituído por qualquer implementação de handler
 * - Interface Segregation: Métodos específicos para tipos de exceção
 * - Dependency Inversion: Depende de abstrações (exceções), não de implementações
 * 
 * Clean Code aplicados:
 * - Métodos pequenos e focados
 * - Nomes descritivos que indicam intenção
 * - Logging estruturado
 * - Respostas HTTP consistentes
 * - Documentação via Swagger/OpenAPI
 * 
 * Decisões de implementação:
 * 1. @RestControllerAdvice para captura global
 *    - Tratamento centralizado de exceções
 *    - Aplicação a todos os controllers
 *    - Configuração automática
 * 
 * 2. Estrutura padronizada de erro
 *    - Consistência nas respostas
 *    - Facilita tratamento no frontend
 *    - Informações úteis para debugging
 * 
 * 3. Logging detalhado
 *    - Registro de erros para monitoramento
 *    - Contexto completo do erro
 *    - Facilita debugging
 * 
 * 4. Validação de diferentes tipos de exceção
 *    - Tratamento específico para cada tipo
 *    - Respostas HTTP apropriadas
 *    - Mensagens claras para o cliente
 */
@RestControllerAdvice
@Slf4j
public class QuartoExceptionHandlerImpl {

    // ========== HANDLERS DE EXCEÇÕES DE NEGÓCIO ==========

    /**
     * Trata exceção de quarto não encontrado
     * 
     * Decisão: HTTP 404 para recurso não encontrado
     * - Segue convenções REST
     * - Clareza na resposta
     * - Cacheável por padrão
     * 
     * @param ex Exceção lançada
     * @param request Contexto da requisição
     * @return ResponseEntity com erro 404
     */
    @ExceptionHandler(QuartoNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleQuartoNotFoundException(
            QuartoNotFoundException ex, 
            WebRequest request) {
        
        log.warn("Quarto não encontrado: {}", ex.getMessage());
        
        ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.NOT_FOUND.value())
                .error("Recurso não encontrado")
                .message(ex.getMessage())
                .path(request.getDescription(false))
                .build();
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    /**
     * Trata exceção de quarto já existente
     * 
     * Decisão: HTTP 409 para conflito de dados
     * - Indica violação de unicidade
     * - Clareza na resposta
     * - Não cacheável
     * 
     * @param ex Exceção lançada
     * @param request Contexto da requisição
     * @return ResponseEntity com erro 409
     */
    @ExceptionHandler(QuartoAlreadyExistsException.class)
    public ResponseEntity<ErrorResponseDTO> handleQuartoAlreadyExistsException(
            QuartoAlreadyExistsException ex, 
            WebRequest request) {
        
        log.warn("Quarto já existe: {}", ex.getMessage());
        
        ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.CONFLICT.value())
                .error("Conflito de dados")
                .message(ex.getMessage())
                .path(request.getDescription(false))
                .build();
        
        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }

    /**
     * Trata exceção de transição de status inválida
     * 
     * Decisão: HTTP 400 para requisição inválida
     * - Indica erro de negócio
     * - Clareza na resposta
     * - Não cacheável
     * 
     * @param ex Exceção lançada
     * @param request Contexto da requisição
     * @return ResponseEntity com erro 400
     */
    @ExceptionHandler(InvalidQuartoStatusTransitionException.class)
    public ResponseEntity<ErrorResponseDTO> handleInvalidStatusTransitionException(
            InvalidQuartoStatusTransitionException ex, 
            WebRequest request) {
        
        log.warn("Transição de status inválida: {}", ex.getMessage());
        
        ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Transição de status inválida")
                .message(ex.getMessage())
                .path(request.getDescription(false))
                .build();
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    /**
     * Trata exceção de violação de regra de negócio
     * 
     * Decisão: HTTP 422 para erro semântico
     * - Indica erro de negócio
     * - Diferencia de erro de sintaxe
     * - Clareza na resposta
     * 
     * @param ex Exceção lançada
     * @param request Contexto da requisição
     * @return ResponseEntity com erro 422
     */
    @ExceptionHandler(BusinessRuleViolationException.class)
    public ResponseEntity<ErrorResponseDTO> handleBusinessRuleViolationException(
            BusinessRuleViolationException ex, 
            WebRequest request) {
        
        log.warn("Violação de regra de negócio: {}", ex.getMessage());
        
        ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.UNPROCESSABLE_ENTITY.value())
                .error("Regra de negócio violada")
                .message(ex.getMessage())
                .path(request.getDescription(false))
                .build();
        
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(errorResponse);
    }

    // ========== HANDLERS DE EXCEÇÕES DE VALIDAÇÃO ==========

    /**
     * Trata exceção de validação de DTOs (@Valid)
     * 
     * Decisão: HTTP 400 para erro de validação
     * - Detalha todos os campos inválidos
     * - Facilita correção no frontend
     * - Estrutura padronizada
     * 
     * @param ex Exceção lançada
     * @param request Contexto da requisição
     * @return ResponseEntity com erro 400 e detalhes dos campos
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDTO> handleMethodArgumentNotValidException(
            MethodArgumentNotValidException ex, 
            WebRequest request) {
        
        log.warn("Erro de validação em DTO: {}", ex.getMessage());
        
        List<ValidationErrorDTO> validationErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(this::criarValidationError)
                .collect(Collectors.toList());
        
        ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Erro de validação")
                .message("Dados inválidos na requisição")
                .path(request.getDescription(false))
                .validationErrors(validationErrors)
                .build();
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    /**
     * Trata exceção de validação de binding
     * 
     * Decisão: HTTP 400 para erro de validação
     * - Similar ao handler anterior
     * - Trata diferentes tipos de validação
     * - Consistência na resposta
     * 
     * @param ex Exceção lançada
     * @param request Contexto da requisição
     * @return ResponseEntity com erro 400 e detalhes dos campos
     */
    @ExceptionHandler(BindException.class)
    public ResponseEntity<ErrorResponseDTO> handleBindException(
            BindException ex, 
            WebRequest request) {
        
        log.warn("Erro de binding: {}", ex.getMessage());
        
        List<ValidationErrorDTO> validationErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(this::criarValidationError)
                .collect(Collectors.toList());
        
        ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Erro de validação")
                .message("Dados inválidos na requisição")
                .path(request.getDescription(false))
                .validationErrors(validationErrors)
                .build();
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    /**
     * Trata exceção de validação de constraints
     * 
     * Decisão: HTTP 400 para erro de validação
     * - Trata validações em nível de serviço
     * - Formata mensagens de constraints
     * - Consistência na resposta
     * 
     * @param ex Exceção lançada
     * @param request Contexto da requisição
     * @return ResponseEntity com erro 400 e detalhes das violações
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponseDTO> handleConstraintViolationException(
            ConstraintViolationException ex, 
            WebRequest request) {
        
        log.warn("Violação de constraint: {}", ex.getMessage());
        
        List<ValidationErrorDTO> validationErrors = ex.getConstraintViolations()
                .stream()
                .map(this::criarValidationErrorFromConstraint)
                .collect(Collectors.toList());
        
        ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Erro de validação")
                .message("Violação de regras de validação")
                .path(request.getDescription(false))
                .validationErrors(validationErrors)
                .build();
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    // ========== HANDLERS DE EXCEÇÕES GENÉRICAS ==========

    /**
     * Trata exceção de argumento ilegal
     * 
     * Decisão: HTTP 400 para argumento inválido
     * - Indica erro de programação ou uso
     * - Clareza na resposta
     * - Não expõe detalhes internos
     * 
     * @param ex Exceção lançada
     * @param request Contexto da requisição
     * @return ResponseEntity com erro 400
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponseDTO> handleIllegalArgumentException(
            IllegalArgumentException ex, 
            WebRequest request) {
        
        log.warn("Argumento ilegal: {}", ex.getMessage());
        
        ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Argumento inválido")
                .message(ex.getMessage())
                .path(request.getDescription(false))
                .build();
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    /**
     * Trata exceções genéricas não tratadas
     * 
     * Decisão: HTTP 500 para erro interno
     * - Captura exceções inesperadas
     * - Não expõe detalhes sensíveis
     * - Registro completo para debugging
     * 
     * @param ex Exceção lançada
     * @param request Contexto da requisição
     * @return ResponseEntity com erro 500
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDTO> handleGenericException(
            Exception ex, 
            WebRequest request) {
        
        log.error("Erro interno não tratado: ", ex);
        
        ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error("Erro interno do servidor")
                .message("Ocorreu um erro inesperado. Tente novamente mais tarde.")
                .path(request.getDescription(false))
                .build();
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }

    // ========== MÉTODOS PRIVADOS AUXILIARES ==========

    /**
     * Cria ValidationErrorDTO a partir de FieldError
     * 
     * Decisão: Método auxiliar para reutilização
     * - Formatação padronizada
     * - Extração de informações relevantes
     * - Facilita manutenção
     * 
     * @param fieldError Erro de campo do Spring Validation
     * @return ValidationErrorDTO formatado
     */
    private ValidationErrorDTO criarValidationError(FieldError fieldError) {
        return ValidationErrorDTO.builder()
                .field(fieldError.getField())
                .rejectedValue(fieldError.getRejectedValue())
                .message(fieldError.getDefaultMessage())
                .build();
    }

    /**
     * Cria ValidationErrorDTO a partir de ConstraintViolation
     * 
     * Decisão: Método auxiliar para reutilização
     * - Formatação padronizada
     * - Extração de informações relevantes
     * - Facilita manutenção
     * 
     * @param violation Violação de constraint
     * @return ValidationErrorDTO formatado
     */
    private ValidationErrorDTO criarValidationErrorFromConstraint(ConstraintViolation<?> violation) {
        String fieldName = violation.getPropertyPath().toString();
        
        // Remove o nome do método se presente
        if (fieldName.contains(".")) {
            fieldName = fieldName.substring(fieldName.lastIndexOf('.') + 1);
        }
        
        return ValidationErrorDTO.builder()
                .field(fieldName)
                .rejectedValue(violation.getInvalidValue())
                .message(violation.getMessage())
                .build();
    }
}
