package com.hotel.booking.controllers.impl;

import com.hotel.booking.dtos.QuartoDTO;
import com.hotel.booking.dtos.QuartoRequestDTO;
import com.hotel.booking.services.QuartoService;
import com.hotel.booking.enums.TipoQuarto;
import com.hotel.booking.enums.StatusQuarto;
import com.hotel.booking.enums.TipoCama;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Implementação do Controller de Gestão de Quartos
 * 
 * Princípios SOLID aplicados:
 * - Single Responsibility: Responsável apenas pela exposição da API REST de quartos
 * - Open/Closed: Aberto para extensão (novos endpoints), fechado para modificação
 * - Liskov Substitution: Pode ser substituído por qualquer implementação de controller
 * - Interface Segregation: Métodos específicos para operações de quartos
 * - Dependency Inversion: Depende da abstração QuartoService, não da implementação
 * 
 * Clean Code aplicados:
 * - Nomes descritivos e autoexplicativos
 * - Métodos pequenos com única responsabilidade
 * - Validações centralizadas com Bean Validation
 * - Tratamento consistente de respostas HTTP
 * - Documentação via Swagger/OpenAPI
 * 
 * Decisões de implementação:
 * 1. @RestController para configuração automática
 *    - Convenção do Spring Boot
 *    - Serialização JSON automática
 *    - Suporte a content negotiation
 * 
 * 2. @RequestMapping para roteamento base
 *    - Organização lógica dos endpoints
 *    - Facilita versionamento da API
 *    - Consistência na estrutura
 * 
 * 3. @RequiredArgsConstructor para injeção de dependências
 *    - Reduz boilerplate do Lombok
 *    - Garante imutabilidade das dependências
 *    - Facilita testes com mocks
 * 
 * 4. @Validated para habilitar validações
 *    - Suporte a Bean Validation
 *    - Validação automática de DTOs
 *    - Mensagens de erro padronizadas
 * 
 * 5. ResponseEntity para controle completo da resposta
 *    - Status codes HTTP apropriados
 *    - Headers personalizados quando necessário
 *    - Body da resposta tipado
 */
@RestController
@RequestMapping("/api/quartos")
@RequiredArgsConstructor
@Slf4j
@Validated
public class QuartoControllerImpl {

    // Injeção de dependência - Princípio da Inversão de Dependência (DIP)
    private final QuartoService quartoService;

    // ========== ENDPOINTS CRUD ==========

    /**
     * Cria um novo quarto
     * 
     * Endpoint: POST /api/quartos
     * 
     * Decisão: POST para criação de recursos
     * - Segue convenções REST
     * - Idempotência não aplicável
     * - Retorna 201 Created com recurso criado
     * 
     * @param requestDTO Dados do quarto a ser criado
     * @return ResponseEntity com QuartoDTO criado e status 201
     */
    @PostMapping
    public ResponseEntity<QuartoDTO> criarQuarto(@Valid @RequestBody QuartoRequestDTO requestDTO) {
        log.info("Recebida requisição para criar quarto: {}", requestDTO.getNumero());
        
        QuartoDTO quartoCriado = quartoService.criarQuarto(requestDTO);
        
        log.info("Quarto criado com sucesso: ID={}", quartoCriado.getId());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(quartoCriado);
    }

    /**
     * Atualiza um quarto existente
     * 
     * Endpoint: PUT /api/quartos/{id}
     * 
     * Decisão: PUT para atualização completa
     * - Segue convenções REST
     * - Operação idempotente
     * - Retorna 200 OK com recurso atualizado
     * 
     * @param id ID do quarto a ser atualizado
     * @param requestDTO Novos dados do quarto
     * @return ResponseEntity com QuartoDTO atualizado e status 200
     */
    @PutMapping("/{id}")
    public ResponseEntity<QuartoDTO> atualizarQuarto(
            @PathVariable UUID id, 
            @Valid @RequestBody QuartoRequestDTO requestDTO) {
        
        log.info("Recebida requisição para atualizar quarto: ID={}", id);
        
        QuartoDTO quartoAtualizado = quartoService.atualizarQuarto(id, requestDTO);
        
        log.info("Quarto atualizado com sucesso: ID={}", id);
        
        return ResponseEntity.ok(quartoAtualizado);
    }

    /**
     * Busca quarto por ID
     * 
     * Endpoint: GET /api/quartos/{id}
     * 
     * Decisão: GET para consulta de recursos
     * - Operação segura e idempotente
     * - Cacheável por padrão
     * - Retorna 200 OK ou 404 Not Found
     * 
     * @param id ID do quarto a ser buscado
     * @return ResponseEntity com QuartoDTO e status 200
     */
    @GetMapping("/{id}")
    public ResponseEntity<QuartoDTO> buscarQuartoPorId(@PathVariable UUID id) {
        log.debug("Recebida requisição para buscar quarto: ID={}", id);
        
        QuartoDTO quarto = quartoService.buscarQuartoPorId(id);
        
        log.debug("Quarto encontrado: ID={}", id);
        
        return ResponseEntity.ok(quarto);
    }

    /**
     * Busca quarto por número
     * 
     * Endpoint: GET /api/quartos/numero/{numero}
     * 
     * Decisão: Endpoint específico para busca por número
     * - Facilita lookup por campo único
     * - Otimização para queries específicas
     * - Clareza na API
     * 
     * @param numero Número do quarto a ser buscado
     * @return ResponseEntity com QuartoDTO e status 200
     */
    @GetMapping("/numero/{numero}")
    public ResponseEntity<QuartoDTO> buscarQuartoPorNumero(@PathVariable String numero) {
        log.debug("Recebida requisição para buscar quarto por número: {}", numero);
        
        QuartoDTO quarto = quartoService.buscarQuartoPorNumero(numero);
        
        log.debug("Quarto encontrado: Número={}", numero);
        
        return ResponseEntity.ok(quarto);
    }

    /**
     * Lista todos os quartos
     * 
     * Endpoint: GET /api/quartos
     * 
     * Decisão: GET para listagem de recursos
     * - Operação segura e idempotente
     * - Suporte a paginação futura
     * - Cacheável por padrão
     * 
     * @return ResponseEntity com lista de QuartoDTO e status 200
     */
    @GetMapping
    public ResponseEntity<List<QuartoDTO>> listarTodosQuartos() {
        log.debug("Recebida requisição para listar todos os quartos");
        
        List<QuartoDTO> quartos = quartoService.listarTodosQuartos();
        
        log.debug("Total de quartos listados: {}", quartos.size());
        
        return ResponseEntity.ok(quartos);
    }

    /**
     * Deleta um quarto
     * 
     * Endpoint: DELETE /api/quartos/{id}
     * 
     * Decisão: DELETE para remoção de recursos
     * - Segue convenções REST
     * - Operação idempotente
     * - Retorna 204 No Content
     * 
     * @param id ID do quarto a ser deletado
     * @return ResponseEntity com status 204
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarQuarto(@PathVariable UUID id) {
        log.info("Recebida requisição para deletar quarto: ID={}", id);
        
        quartoService.deletarQuarto(id);
        
        log.info("Quarto deletado com sucesso: ID={}", id);
        
        return ResponseEntity.noContent().build();
    }

    // ========== ENDPOINTS DE NEGÓCIO ==========

    /**
     * Atualiza status do quarto
     * 
     * Endpoint: PATCH /api/quartos/{id}/status
     * 
     * Decisão: PATCH para atualização parcial
     * - Atualização específica de campo
     * - Operação idempotente
     * - Clareza na intenção
     * 
     * @param id ID do quarto
     * @param novoStatus Novo status do quarto
     * @return ResponseEntity com QuartoDTO atualizado e status 200
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<QuartoDTO> atualizarStatus(
            @PathVariable UUID id, 
            @RequestParam StatusQuarto novoStatus) {
        
        log.info("Recebida requisição para atualizar status: ID={}, Status={}", id, novoStatus);
        
        QuartoDTO quartoAtualizado = quartoService.atualizarStatus(id, novoStatus);
        
        log.info("Status atualizado com sucesso: ID={}, NovoStatus={}", id, novoStatus);
        
        return ResponseEntity.ok(quartoAtualizado);
    }

    /**
     * Marca quarto como disponível
     * 
     * Endpoint: PATCH /api/quartos/{id}/disponivel
     * 
     * Decisão: Endpoint específico para clareza
     * - Facilita uso em código cliente
     * - Reduz verbosidade
     * - Intenção explícita
     * 
     * @param id ID do quarto
     * @return ResponseEntity com QuartoDTO atualizado e status 200
     */
    @PatchMapping("/{id}/disponivel")
    public ResponseEntity<QuartoDTO> marcarComoDisponivel(@PathVariable UUID id) {
        log.info("Recebida requisição para marcar quarto como disponível: ID={}", id);
        
        QuartoDTO quartoAtualizado = quartoService.marcarComoDisponivel(id);
        
        log.info("Quarto marcado como disponível: ID={}", id);
        
        return ResponseEntity.ok(quartoAtualizado);
    }

    /**
     * Marca quarto como ocupado
     * 
     * Endpoint: PATCH /api/quartos/{id}/ocupado
     * 
     * Decisão: Endpoint específico para clareza
     * - Facilita uso em código cliente
     * - Reduz verbosidade
     * - Intenção explícita
     * 
     * @param id ID do quarto
     * @return ResponseEntity com QuartoDTO atualizado e status 200
     */
    @PatchMapping("/{id}/ocupado")
    public ResponseEntity<QuartoDTO> marcarComoOcupado(@PathVariable UUID id) {
        log.info("Recebida requisição para marcar quarto como ocupado: ID={}", id);
        
        QuartoDTO quartoAtualizado = quartoService.marcarComoOcupado(id);
        
        log.info("Quarto marcado como ocupado: ID={}", id);
        
        return ResponseEntity.ok(quartoAtualizado);
    }

    /**
     * Marca quarto como em manutenção
     * 
     * Endpoint: PATCH /api/quartos/{id}/manutencao
     * 
     * Decisão: Endpoint específico para clareza
     * - Facilita uso em código cliente
     * - Reduz verbosidade
     * - Intenção explícita
     * 
     * @param id ID do quarto
     * @return ResponseEntity com QuartoDTO atualizado e status 200
     */
    @PatchMapping("/{id}/manutencao")
    public ResponseEntity<QuartoDTO> marcarComoEmManutencao(@PathVariable UUID id) {
        log.info("Recebida requisição para marcar quarto como em manutenção: ID={}", id);
        
        QuartoDTO quartoAtualizado = quartoService.marcarComoEmManutencao(id);
        
        log.info("Quarto marcado como em manutenção: ID={}", id);
        
        return ResponseEntity.ok(quartoAtualizado);
    }

    /**
     * Marca quarto como em limpeza
     * 
     * Endpoint: PATCH /api/quartos/{id}/limpeza
     * 
     * Decisão: Endpoint específico para clareza
     * - Facilita uso em código cliente
     * - Reduz verbosidade
     * - Intenção explícita
     * 
     * @param id ID do quarto
     * @return ResponseEntity com QuartoDTO atualizado e status 200
     */
    @PatchMapping("/{id}/limpeza")
    public ResponseEntity<QuartoDTO> marcarComoEmLimpeza(@PathVariable UUID id) {
        log.info("Recebida requisição para marcar quarto como em limpeza: ID={}", id);
        
        QuartoDTO quartoAtualizado = quartoService.marcarComoEmLimpeza(id);
        
        log.info("Quarto marcado como em limpeza: ID={}", id);
        
        return ResponseEntity.ok(quartoAtualizado);
    }

    // ========== ENDPOINTS DE BUSCA E FILTRAGEM ==========

    /**
     * Busca quartos por tipo
     * 
     * Endpoint: GET /api/quartos/tipo/{tipo}
     * 
     * Decisão: Endpoint específico para filtragem
     * - Facilita consultas frequentes
     * - Otimização de queries
     * - Clareza na API
     * 
     * @param tipo Tipo do quarto
     * @return ResponseEntity com lista de QuartoDTO e status 200
     */
    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<QuartoDTO>> buscarQuartosPorTipo(@PathVariable TipoQuarto tipo) {
        log.debug("Recebida requisição para buscar quartos por tipo: {}", tipo);
        
        List<QuartoDTO> quartos = quartoService.buscarQuartosPorTipo(tipo);
        
        log.debug("Total de quartos encontrados por tipo {}: {}", tipo, quartos.size());
        
        return ResponseEntity.ok(quartos);
    }

    /**
     * Busca quartos por status
     * 
     * Endpoint: GET /api/quartos/status/{status}
     * 
     * Decisão: Endpoint específico para filtragem
     * - Facilita consultas frequentes
     * - Otimização de queries
     * - Clareza na API
     * 
     * @param status Status do quarto
     * @return ResponseEntity com lista de QuartoDTO e status 200
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<QuartoDTO>> buscarQuartosPorStatus(@PathVariable StatusQuarto status) {
        log.debug("Recebida requisição para buscar quartos por status: {}", status);
        
        List<QuartoDTO> quartos = quartoService.buscarQuartosPorStatus(status);
        
        log.debug("Total de quartos encontrados por status {}: {}", status, quartos.size());
        
        return ResponseEntity.ok(quartos);
    }

    /**
     * Busca quartos disponíveis
     * 
     * Endpoint: GET /api/quartos/disponiveis
     * 
     * Decisão: Endpoint específico para caso comum
     * - Facilita uso em reservas
     * - Otimização para query frequente
     * - Clareza na API
     * 
     * @return ResponseEntity com lista de QuartoDTO disponíveis e status 200
     */
    @GetMapping("/disponiveis")
    public ResponseEntity<List<QuartoDTO>> buscarQuartosDisponiveis() {
        log.debug("Recebida requisição para buscar quartos disponíveis");
        
        List<QuartoDTO> quartos = quartoService.buscarQuartosDisponiveis();
        
        log.debug("Total de quartos disponíveis: {}", quartos.size());
        
        return ResponseEntity.ok(quartos);
    }

    /**
     * Busca quartos por capacidade mínima
     * 
     * Endpoint: GET /api/quartos/capacidade/{capacidade}
     * 
     * Decisão: Endpoint específico para filtragem
     * - Facilita reservas para grupos
     * - Otimização de queries
     * - Clareza na API
     * 
     * @param capacidade Capacidade mínima desejada
     * @return ResponseEntity com lista de QuartoDTO e status 200
     */
    @GetMapping("/capacidade/{capacidade}")
    public ResponseEntity<List<QuartoDTO>> buscarQuartosPorCapacidadeMinima(@PathVariable Integer capacidade) {
        log.debug("Recebida requisição para buscar quartos por capacidade mínima: {}", capacidade);
        
        List<QuartoDTO> quartos = quartoService.buscarQuartosPorCapacidadeMinima(capacidade);
        
        log.debug("Total de quartos encontrados com capacidade >= {}: {}", capacidade, quartos.size());
        
        return ResponseEntity.ok(quartos);
    }

    /**
     * Busca quartos por faixa de preço
     * 
     * Endpoint: GET /api/quartos/preco?min={min}&max={max}
     * 
     * Decisão: Query parameters para range
     * - Facilita filtragem por orçamento
     * - Flexibilidade nos parâmetros
     * - Clareza na API
     * 
     * @param precoMin Preço mínimo da faixa
     * @param precoMax Preço máximo da faixa
     * @return ResponseEntity com lista de QuartoDTO e status 200
     */
    @GetMapping("/preco")
    public ResponseEntity<List<QuartoDTO>> buscarQuartosPorFaixaPreco(
            @RequestParam BigDecimal precoMin,
            @RequestParam BigDecimal precoMax) {
        
        log.debug("Recebida requisição para buscar quartos por faixa de preço: {} - {}", precoMin, precoMax);
        
        List<QuartoDTO> quartos = quartoService.buscarQuartosPorFaixaPreco(precoMin, precoMax);
        
        log.debug("Total de quartos encontrados na faixa de preço: {}", quartos.size());
        
        return ResponseEntity.ok(quartos);
    }

    // ========== ENDPOINTS DE CAMAS ==========

    /**
     * Adiciona uma cama ao quarto
     * 
     * Endpoint: POST /api/quartos/{id}/camas
     * 
     * Decisão: Recurso aninhado para camas
     * - Relacionamento claro na API
     * - Segue convenções REST
     * - Clareza na estrutura
     * 
     * @param id ID do quarto
     * @param tipoCama Tipo da cama a ser adicionada
     * @return ResponseEntity com QuartoDTO atualizado e status 201
     */
    @PostMapping("/{id}/camas")
    public ResponseEntity<QuartoDTO> adicionarCama(
            @PathVariable UUID id, 
            @RequestParam TipoCama tipoCama) {
        
        log.info("Recebida requisição para adicionar cama ao quarto: ID={}, Tipo={}", id, tipoCama);
        
        QuartoDTO quartoAtualizado = quartoService.adicionarCama(id, tipoCama);
        
        log.info("Cama adicionada com sucesso ao quarto: ID={}", id);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(quartoAtualizado);
    }

    /**
     * Remove uma cama do quarto
     * 
     * Endpoint: DELETE /api/quartos/{id}/camas/{camaId}
     * 
     * Decisão: Recurso aninhado para camas
     * - Relacionamento claro na API
     * - Segue convenções REST
     * - Clareza na estrutura
     * 
     * @param id ID do quarto
     * @param camaId ID da cama a ser removida
     * @return ResponseEntity com QuartoDTO atualizado e status 200
     */
    @DeleteMapping("/{id}/camas/{camaId}")
    public ResponseEntity<QuartoDTO> removerCama(
            @PathVariable UUID id, 
            @PathVariable UUID camaId) {
        
        log.info("Recebida requisição para remover cama do quarto: QuartoID={}, CamaID={}", id, camaId);
        
        QuartoDTO quartoAtualizado = quartoService.removerCama(id, camaId);
        
        log.info("Cama removida com sucesso do quarto: QuartoID={}, CamaID={}", id, camaId);
        
        return ResponseEntity.ok(quartoAtualizado);
    }
}
