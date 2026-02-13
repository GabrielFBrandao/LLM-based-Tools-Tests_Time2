package com.hotel.booking.controllers;

import com.hotel.booking.entities.Quarto;
import com.hotel.booking.entities.Cama;
import com.hotel.booking.enums.TipoQuarto;
import com.hotel.booking.enums.StatusQuarto;
import com.hotel.booking.enums.TipoCama;
import com.hotel.booking.services.QuartoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/quartos")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class QuartoController {

    private final QuartoService quartoService;

    // ========== ENDPOINTS DE CRUD ==========

    /**
     * Cria um novo quarto
     */
    @PostMapping
    public ResponseEntity<Quarto> criarQuarto(@Valid @RequestBody Quarto quarto) {
        log.info("Recebida requisição para criar quarto: {}", quarto.getNumero());
        try {
            Quarto quartoCriado = quartoService.criarQuarto(quarto);
            return ResponseEntity.status(HttpStatus.CREATED).body(quartoCriado);
        } catch (IllegalArgumentException e) {
            log.error("Erro ao criar quarto: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Erro inesperado ao criar quarto", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Atualiza um quarto existente
     */
    @PutMapping("/{id}")
    public ResponseEntity<Quarto> atualizarQuarto(
            @PathVariable UUID id, 
            @Valid @RequestBody Quarto quarto) {
        log.info("Recebida requisição para atualizar quarto: {}", id);
        try {
            Quarto quartoAtualizado = quartoService.atualizarQuarto(id, quarto);
            return ResponseEntity.ok(quartoAtualizado);
        } catch (IllegalArgumentException e) {
            log.error("Erro ao atualizar quarto: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Erro inesperado ao atualizar quarto", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Busca quarto por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Quarto> buscarQuartoPorId(@PathVariable UUID id) {
        log.info("Buscando quarto por ID: {}", id);
        try {
            Quarto quarto = quartoService.buscarQuartoPorId(id);
            return ResponseEntity.ok(quarto);
        } catch (IllegalArgumentException e) {
            log.error("Quarto não encontrado: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro ao buscar quarto", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Busca quarto por número
     */
    @GetMapping("/numero/{numero}")
    public ResponseEntity<Quarto> buscarQuartoPorNumero(@PathVariable String numero) {
        log.info("Buscando quarto por número: {}", numero);
        try {
            Quarto quarto = quartoService.buscarQuartoPorNumero(numero);
            return ResponseEntity.ok(quarto);
        } catch (IllegalArgumentException e) {
            log.error("Quarto não encontrado: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro ao buscar quarto", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Lista todos os quartos
     */
    @GetMapping
    public ResponseEntity<List<Quarto>> listarTodosQuartos() {
        log.info("Listando todos os quartos");
        try {
            List<Quarto> quartos = quartoService.listarTodosQuartos();
            return ResponseEntity.ok(quartos);
        } catch (Exception e) {
            log.error("Erro ao listar quartos", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Deleta um quarto
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarQuarto(@PathVariable UUID id) {
        log.info("Recebida requisição para deletar quarto: {}", id);
        try {
            quartoService.deletarQuarto(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.error("Erro ao deletar quarto: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            log.error("Estado inválido para deletar quarto: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (Exception e) {
            log.error("Erro inesperado ao deletar quarto", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ========== ENDPOINTS DE BUSCA E FILTRAGEM ==========

    /**
     * Busca quartos por tipo
     */
    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<Quarto>> buscarQuartosPorTipo(@PathVariable TipoQuarto tipo) {
        log.info("Buscando quartos por tipo: {}", tipo);
        try {
            List<Quarto> quartos = quartoService.buscarQuartosPorTipo(tipo);
            return ResponseEntity.ok(quartos);
        } catch (Exception e) {
            log.error("Erro ao buscar quartos por tipo", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Busca quartos por status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Quarto>> buscarQuartosPorStatus(@PathVariable StatusQuarto status) {
        log.info("Buscando quartos por status: {}", status);
        try {
            List<Quarto> quartos = quartoService.buscarQuartosPorStatus(status);
            return ResponseEntity.ok(quartos);
        } catch (Exception e) {
            log.error("Erro ao buscar quartos por status", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Busca quartos disponíveis
     */
    @GetMapping("/disponiveis")
    public ResponseEntity<List<Quarto>> buscarQuartosDisponiveis() {
        log.info("Buscando quartos disponíveis");
        try {
            List<Quarto> quartos = quartoService.buscarQuartosDisponiveis();
            return ResponseEntity.ok(quartos);
        } catch (Exception e) {
            log.error("Erro ao buscar quartos disponíveis", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Busca quartos por capacidade mínima
     */
    @GetMapping("/capacidade/{capacidade}")
    public ResponseEntity<List<Quarto>> buscarQuartosPorCapacidadeMinima(@PathVariable Integer capacidade) {
        log.info("Buscando quartos com capacidade mínima: {}", capacidade);
        try {
            List<Quarto> quartos = quartoService.buscarQuartosPorCapacidadeMinima(capacidade);
            return ResponseEntity.ok(quartos);
        } catch (Exception e) {
            log.error("Erro ao buscar quartos por capacidade", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Busca quartos por faixa de preço
     */
    @GetMapping("/preco")
    public ResponseEntity<List<Quarto>> buscarQuartosPorFaixaPreco(
            @RequestParam BigDecimal precoMin,
            @RequestParam BigDecimal precoMax) {
        log.info("Buscando quartos na faixa de preço: {} - {}", precoMin, precoMax);
        try {
            List<Quarto> quartos = quartoService.buscarQuartosPorFaixaPreco(precoMin, precoMax);
            return ResponseEntity.ok(quartos);
        } catch (Exception e) {
            log.error("Erro ao buscar quartos por faixa de preço", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Busca quartos com múltiplos filtros
     */
    @GetMapping("/filtrar")
    public ResponseEntity<List<Quarto>> buscarQuartosComFiltros(
            @RequestParam(required = false) TipoQuarto tipo,
            @RequestParam(required = false) StatusQuarto status,
            @RequestParam(required = false) Integer capacidadeMinima,
            @RequestParam(required = false) BigDecimal precoMax) {
        log.info("Buscando quartos com filtros - tipo: {}, status: {}, capacidade: {}, precoMax: {}", 
                tipo, status, capacidadeMinima, precoMax);
        try {
            List<Quarto> quartos = quartoService.buscarQuartosComFiltros(
                    tipo, status, capacidadeMinima, precoMax);
            return ResponseEntity.ok(quartos);
        } catch (Exception e) {
            log.error("Erro ao buscar quartos com filtros", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Busca quartos disponíveis para um período específico
     */
    @GetMapping("/disponiveis-periodo")
    public ResponseEntity<List<Quarto>> buscarQuartosDisponiveisNoPeriodo(
            @RequestParam LocalDate checkIn,
            @RequestParam LocalDate checkOut) {
        log.info("Buscando quartos disponíveis no período: {} a {}", checkIn, checkOut);
        try {
            List<Quarto> quartos = quartoService.buscarQuartosDisponiveisNoPeriodo(checkIn, checkOut);
            return ResponseEntity.ok(quartos);
        } catch (Exception e) {
            log.error("Erro ao buscar quartos disponíveis no período", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Busca quartos por número contendo texto
     */
    @GetMapping("/buscar")
    public ResponseEntity<List<Quarto>> buscarQuartosPorNumero(@RequestParam String texto) {
        log.info("Buscando quartos contendo: {}", texto);
        try {
            List<Quarto> quartos = quartoService.buscarQuartosPorNumero(texto);
            return ResponseEntity.ok(quartos);
        } catch (Exception e) {
            log.error("Erro ao buscar quartos por texto", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ========== ENDPOINTS DE STATUS ==========

    /**
     * Atualiza status do quarto
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<Quarto> atualizarStatus(
            @PathVariable UUID id, 
            @RequestParam StatusQuarto status) {
        log.info("Atualizando status do quarto {} para {}", id, status);
        try {
            Quarto quartoAtualizado = quartoService.atualizarStatus(id, status);
            return ResponseEntity.ok(quartoAtualizado);
        } catch (IllegalArgumentException e) {
            log.error("Erro ao atualizar status: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            log.error("Transição de status inválida: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (Exception e) {
            log.error("Erro inesperado ao atualizar status", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Marca quarto como disponível
     */
    @PatchMapping("/{id}/disponivel")
    public ResponseEntity<Quarto> marcarComoDisponivel(@PathVariable UUID id) {
        log.info("Marcando quarto {} como disponível", id);
        try {
            Quarto quarto = quartoService.marcarComoDisponivel(id);
            return ResponseEntity.ok(quarto);
        } catch (Exception e) {
            log.error("Erro ao marcar quarto como disponível", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Marca quarto como ocupado
     */
    @PatchMapping("/{id}/ocupado")
    public ResponseEntity<Quarto> marcarComoOcupado(@PathVariable UUID id) {
        log.info("Marcando quarto {} como ocupado", id);
        try {
            Quarto quarto = quartoService.marcarComoOcupado(id);
            return ResponseEntity.ok(quarto);
        } catch (Exception e) {
            log.error("Erro ao marcar quarto como ocupado", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Marca quarto como em manutenção
     */
    @PatchMapping("/{id}/manutencao")
    public ResponseEntity<Quarto> marcarComoEmManutencao(@PathVariable UUID id) {
        log.info("Marcando quarto {} como em manutenção", id);
        try {
            Quarto quarto = quartoService.marcarComoEmManutencao(id);
            return ResponseEntity.ok(quarto);
        } catch (IllegalArgumentException e) {
            log.error("Erro ao marcar quarto como em manutenção: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Erro inesperado ao marcar quarto como em manutenção", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Marca quarto como em limpeza
     */
    @PatchMapping("/{id}/limpeza")
    public ResponseEntity<Quarto> marcarComoEmLimpeza(@PathVariable UUID id) {
        log.info("Marcando quarto {} como em limpeza", id);
        try {
            Quarto quarto = quartoService.marcarComoEmLimpeza(id);
            return ResponseEntity.ok(quarto);
        } catch (IllegalArgumentException e) {
            log.error("Erro ao marcar quarto como em limpeza: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Erro inesperado ao marcar quarto como em limpeza", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ========== ENDPOINTS DE CAMAS ==========

    /**
     * Adiciona uma cama ao quarto
     */
    @PostMapping("/{id}/camas")
    public ResponseEntity<Quarto> adicionarCama(
            @PathVariable UUID id, 
            @RequestParam TipoCama tipoCama) {
        log.info("Adicionando cama tipo {} ao quarto {}", tipoCama, id);
        try {
            Quarto quarto = quartoService.adicionarCama(id, tipoCama);
            return ResponseEntity.ok(quarto);
        } catch (Exception e) {
            log.error("Erro ao adicionar cama", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Remove uma cama do quarto
     */
    @DeleteMapping("/{id}/camas/{camaId}")
    public ResponseEntity<Quarto> removerCama(
            @PathVariable UUID id, 
            @PathVariable UUID camaId) {
        log.info("Removendo cama {} do quarto {}", camaId, id);
        try {
            Quarto quarto = quartoService.removerCama(id, camaId);
            return ResponseEntity.ok(quarto);
        } catch (IllegalArgumentException e) {
            log.error("Erro ao remover cama: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Erro inesperado ao remover cama", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ========== ENDPOINTS DE RELATÓRIOS ==========

    /**
     * Conta quartos por status
     */
    @GetMapping("/relatorio/contagem-por-status")
    public ResponseEntity<List<Object[]>> contarQuartosPorStatus() {
        log.info("Gerando relatório de contagem de quartos por status");
        try {
            List<Object[]> resultado = quartoService.contarQuartosPorStatus();
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            log.error("Erro ao gerar relatório", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Lista quartos ordenados por preço
     */
    @GetMapping("/ordenados/preco")
    public ResponseEntity<List<Quarto>> listarQuartosPorPreco() {
        log.info("Listando quartos ordenados por preço");
        try {
            List<Quarto> quartos = quartoService.listarQuartosPorPreco();
            return ResponseEntity.ok(quartos);
        } catch (Exception e) {
            log.error("Erro ao listar quartos por preço", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Lista quartos ordenados por capacidade
     */
    @GetMapping("/ordenados/capacidade")
    public ResponseEntity<List<Quarto>> listarQuartosPorCapacidade() {
        log.info("Listando quartos ordenados por capacidade");
        try {
            List<Quarto> quartos = quartoService.listarQuartosPorCapacidade();
            return ResponseEntity.ok(quartos);
        } catch (Exception e) {
            log.error("Erro ao listar quartos por capacidade", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
