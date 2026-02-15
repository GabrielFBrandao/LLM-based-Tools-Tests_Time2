package com.hotel.reservas.modules.quartos.controller;

import com.hotel.reservas.modules.quartos.dto.QuartoRequest;
import com.hotel.reservas.modules.quartos.dto.QuartoResponse;
import com.hotel.reservas.modules.quartos.service.QuartoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST para gerenciamento de Quartos.
 * 
 * Decisões de implementação:
 * - @RestController: Combina @Controller + @ResponseBody
 * - @RequestMapping: Prefixo /api/v1 para versionamento de API
 * - @Valid: Ativa validação Bean Validation nos DTOs
 * - ResponseEntity: Controle explícito de status HTTP
 * - HttpStatus.CREATED (201): Semântica correta para criação
 */
@RestController
@RequestMapping("/api/v1/quartos")
@RequiredArgsConstructor
public class QuartoController {

    private final QuartoService quartoService;

    // POST: Criação de recurso - Retorna 201 Created
    @PostMapping
    public ResponseEntity<QuartoResponse> criar(@Valid @RequestBody QuartoRequest request) {
        QuartoResponse response = quartoService.criar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // PUT: Atualização completa - Retorna 200 OK
    @PutMapping("/{id}")
    public ResponseEntity<QuartoResponse> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody QuartoRequest request) {
        QuartoResponse response = quartoService.atualizar(id, request);
        return ResponseEntity.ok(response);
    }

    // GET: Listagem - Retorna 200 OK
    @GetMapping
    public ResponseEntity<List<QuartoResponse>> listarTodos() {
        List<QuartoResponse> quartos = quartoService.listarTodos();
        return ResponseEntity.ok(quartos);
    }

    // GET por ID: Busca individual - Retorna 200 OK ou 404 Not Found
    @GetMapping("/{id}")
    public ResponseEntity<QuartoResponse> buscarPorId(@PathVariable Long id) {
        QuartoResponse response = quartoService.buscarPorId(id);
        return ResponseEntity.ok(response);
    }
}
