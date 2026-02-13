package com.hotel.controller;

import com.hotel.domain.enums.StatusQuarto;
import com.hotel.domain.enums.TipoQuarto;
import com.hotel.dto.request.QuartoRequest;
import com.hotel.dto.response.QuartoResponse;
import com.hotel.service.QuartoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST para o módulo de Gestão de Quartos.
 *
 * RESPONSABILIDADE ÚNICA (SRP):
 * O Controller é responsável APENAS por:
 * 1. Receber requisições HTTP e validar formato (@Valid)
 * 2. Delegar ao Service (não contém lógica de negócio)
 * 3. Formatar e retornar a resposta HTTP adequada
 *
 * DECISÃO — @RestController vs @Controller:
 * @RestController = @Controller + @ResponseBody em todos os métodos.
 * Para APIs REST que retornam JSON, @RestController é o padrão.
 *
 * DECISÃO — ResponseEntity vs retorno direto:
 * ResponseEntity permite controlar o status HTTP explicitamente.
 * - 201 Created (não 200 OK) para cadastro — semântica REST correta
 * - 200 OK para consultas e atualizações
 * - O corpo sempre é tipado, facilitando documentação com Swagger/OpenAPI
 *
 * DECISÃO — MAPEAMENTO DE ENDPOINTS (ADR-004 — REST):
 * POST   /api/quartos             → cadastrar
 * GET    /api/quartos             → listar (com filtros opcionais via query params)
 * GET    /api/quartos/{id}        → buscar por ID (detalhe completo)
 * PUT    /api/quartos/{id}        → editar (campos opcionais — PATCH semântico)
 * PATCH  /api/quartos/{id}/status → alterar status especificamente (RF05)
 *
 * DECISÃO — INJEÇÃO POR CONSTRUTOR:
 * Mesmas razões do Service: imutabilidade, testabilidade, fail-fast.
 */
@RestController
@RequestMapping("/api/quartos")
public class QuartoController {

    private final QuartoService quartoService;

    public QuartoController(QuartoService quartoService) {
        this.quartoService = quartoService;
    }

    // =========================================================================
    // GET /api/quartos — Listagem (UC02 — RF04)
    // =========================================================================

    /**
     * Lista todos os quartos com filtros opcionais.
     *
     * DECISÃO — @RequestParam com required=false:
     * Filtros são opcionais — sem eles, retorna todos os quartos.
     * Com filtros, retorna apenas os que correspondem.
     *
     * Exemplos de uso:
     * GET /api/quartos                        → todos
     * GET /api/quartos?status=LIVRE           → apenas livres
     * GET /api/quartos?tipo=LUXO              → apenas luxo
     * GET /api/quartos?status=LIVRE&tipo=LUXO → livres E luxo
     */
    @GetMapping
    public ResponseEntity<List<QuartoResponse.Resumo>> listar(
        @RequestParam(required = false) StatusQuarto status,
        @RequestParam(required = false) TipoQuarto tipo
    ) {
        List<QuartoResponse.Resumo> quartos = (status != null || tipo != null)
            ? quartoService.listarComFiltros(status, tipo)
            : quartoService.listarQuartos();

        return ResponseEntity.ok(quartos);
    }

    // =========================================================================
    // GET /api/quartos/{id} — Detalhe (para tela de edição)
    // =========================================================================

    @GetMapping("/{id}")
    public ResponseEntity<QuartoResponse.Detalhe> buscarPorId(@PathVariable Long id) {
        QuartoResponse.Detalhe quarto = quartoService.buscarPorId(id);
        return ResponseEntity.ok(quarto);
    }

    // =========================================================================
    // POST /api/quartos — Cadastro (UC01 — RF01)
    // =========================================================================

    /**
     * Cadastra um novo quarto.
     *
     * @Valid dispara as validações Jakarta Validation do QuartoRequest.Criar
     * ANTES de chamar o service. Se inválido, retorna 400 automaticamente
     * pelo GlobalExceptionHandler (sem código no controller).
     *
     * Retorna 201 Created com o recurso criado no corpo — padrão REST.
     */
    @PostMapping
    public ResponseEntity<QuartoResponse.Detalhe> cadastrar(
        @Valid @RequestBody QuartoRequest.Criar dto
    ) {
        QuartoResponse.Detalhe quartoCreado = quartoService.cadastrarQuarto(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(quartoCreado);
    }

    // =========================================================================
    // PUT /api/quartos/{id} — Edição (UC03 — RF03)
    // =========================================================================

    /**
     * Edita um quarto existente.
     * Campos nulos no body são ignorados (edição parcial).
     */
    @PutMapping("/{id}")
    public ResponseEntity<QuartoResponse.Detalhe> editar(
        @PathVariable Long id,
        @Valid @RequestBody QuartoRequest.Editar dto
    ) {
        QuartoResponse.Detalhe quartoAtualizado = quartoService.editarQuarto(id, dto);
        return ResponseEntity.ok(quartoAtualizado);
    }

    // =========================================================================
    // PATCH /api/quartos/{id}/status — Alterar Status (UC04 — RF05)
    // =========================================================================

    /**
     * Altera apenas o status de disponibilidade do quarto.
     *
     * DECISÃO — PATCH /status em vez de incluir no PUT:
     * Operação semântica distinta — em produção terá autorização diferente
     * e será auditada separadamente (RN10).
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<QuartoResponse.Resumo> alterarStatus(
        @PathVariable Long id,
        @Valid @RequestBody QuartoRequest.AlterarStatus dto
    ) {
        QuartoResponse.Resumo quarto = quartoService.alterarStatus(id, dto.status());
        return ResponseEntity.ok(quarto);
    }
}
