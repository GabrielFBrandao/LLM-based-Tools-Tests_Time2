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

@RestController
@RequestMapping("/api/v1/quartos")
@RequiredArgsConstructor
public class QuartoController {

    private final QuartoService quartoService;

    @PostMapping
    public ResponseEntity<QuartoResponse> criar(@Valid @RequestBody QuartoRequest request) {
        QuartoResponse response = quartoService.criar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuartoResponse> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody QuartoRequest request) {
        QuartoResponse response = quartoService.atualizar(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<QuartoResponse>> listarTodos() {
        List<QuartoResponse> quartos = quartoService.listarTodos();
        return ResponseEntity.ok(quartos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuartoResponse> buscarPorId(@PathVariable Long id) {
        QuartoResponse response = quartoService.buscarPorId(id);
        return ResponseEntity.ok(response);
    }
}
