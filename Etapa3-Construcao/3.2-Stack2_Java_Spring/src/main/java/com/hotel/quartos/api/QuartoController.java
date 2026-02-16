package com.hotel.quartos.api;

import com.hotel.quartos.app.QuartoService;
import com.hotel.quartos.app.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

// Controller REST fino (Controller → Service → Domain). Validações de entrada com Bean Validation.
@RestController
@RequestMapping("/api/v1/quartos")
public class QuartoController {

    private final QuartoService service;

    public QuartoController(QuartoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<QuartoListaDTO> cadastrar(@RequestBody @Valid QuartoInputDTO dto) {
        var salvo = service.cadastrar(dto);
        var saida = new QuartoListaDTO(salvo.getId(), salvo.getNumero(), salvo.getTipo(), salvo.getPrecoHora(), salvo.getDisponibilidade());
        return ResponseEntity.created(URI.create("/api/v1/quartos/" + salvo.getId())).body(saida);
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuartoListaDTO> editar(@PathVariable String id, @RequestBody QuartoUpdateDTO dto) {
        var atualizado = service.editar(id, dto);
        var saida = new QuartoListaDTO(atualizado.getId(), atualizado.getNumero(), atualizado.getTipo(), atualizado.getPrecoHora(), atualizado.getDisponibilidade());
        return ResponseEntity.ok(saida);
    }

    @GetMapping
    public List<QuartoListaDTO> listar() {
        return service.listar();
    }
}
