package com.hotel.service;

import com.hotel.domain.entity.Quarto;
import com.hotel.domain.enums.StatusQuarto;
import com.hotel.domain.enums.TipoQuarto;
import com.hotel.domain.valueobject.Cama;
import com.hotel.dto.request.QuartoRequest;
import com.hotel.dto.response.QuartoResponse;
import com.hotel.exception.HotelExceptions.QuartoInvalidoException;
import com.hotel.exception.HotelExceptions.QuartoNaoEncontradoException;
import com.hotel.mapper.QuartoMapper;
import com.hotel.repository.QuartoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Serviço de negócio para o módulo de Gestão de Quartos.
 *
 * RESPONSABILIDADE ÚNICA (SRP):
 * Esta classe orquestra operações de negócio relacionadas a quartos.
 * Não sabe COMO os dados são persistidos (responsabilidade do Repository)
 * nem COMO são serializados (responsabilidade do Mapper/Controller).
 *
 * INVERSÃO DE DEPENDÊNCIA (DIP):
 * Depende das interfaces QuartoRepository (Spring Data) e QuartoMapper (@Component).
 * As implementações concretas são injetadas pelo Spring em runtime.
 * Em testes, podem ser substituídas por mocks (Mockito).
 *
 * DECISÃO — INJEÇÃO POR CONSTRUTOR:
 * Preferível à injeção por campo (@Autowired no campo) por:
 * 1. Imutabilidade: campos podem ser 'final'
 * 2. Testabilidade: construtor explícito facilita instanciação em testes
 * 3. Fail-fast: dependências obrigatórias garantidas na criação do bean
 *
 * DECISÃO — @Transactional:
 * - @Transactional(readOnly = true) em operações de leitura: otimização
 *   que avisa ao Hibernate para não rastrear mudanças nas entidades (dirty checking off).
 *   Isso melhora performance e evita flushes acidentais.
 * - @Transactional (readOnly = false, padrão) em operações de escrita:
 *   garante atomicidade — se qualquer passo falhar, o banco faz rollback.
 *   Exemplo crítico: cadastrarQuarto salva quarto + camas. Se camas falharem,
 *   o quarto também é revertido.
 */
@Service
public class QuartoService {

    // DECISÃO: final garante imutabilidade das dependências após construção
    private final QuartoRepository quartoRepository;
    private final QuartoMapper quartoMapper;

    public QuartoService(QuartoRepository quartoRepository, QuartoMapper quartoMapper) {
        this.quartoRepository = quartoRepository;
        this.quartoMapper = quartoMapper;
    }

    // =========================================================================
    // UC02 — Listar Quartos (RF04)
    // =========================================================================

    /**
     * Lista todos os quartos com JOIN FETCH nas camas (evita N+1 queries).
     * readOnly=true: otimização para operações somente leitura.
     */
    @Transactional(readOnly = true)
    public List<QuartoResponse.Resumo> listarQuartos() {
        List<Quarto> quartos = quartoRepository.findAllWithCamas();
        return quartoMapper.toResumoList(quartos);
    }

    /**
     * Lista quartos com filtros opcionais de status e tipo.
     * Filtros null são ignorados (busca sem restrição para aquele campo).
     */
    @Transactional(readOnly = true)
    public List<QuartoResponse.Resumo> listarComFiltros(StatusQuarto status, TipoQuarto tipo) {
        List<Quarto> quartos = quartoRepository.findByFiltros(status, tipo);
        return quartoMapper.toResumoList(quartos);
    }

    /**
     * Busca os detalhes completos de um quarto pelo ID.
     * Lança QuartoNaoEncontradoException (404) se não existir.
     */
    @Transactional(readOnly = true)
    public QuartoResponse.Detalhe buscarPorId(Long id) {
        Quarto quarto = buscarQuartoOuLancarErro(id);
        return quartoMapper.toDetalhe(quarto);
    }

    // =========================================================================
    // UC01 — Cadastrar Quarto (RF01, RF02, RF06)
    // =========================================================================

    /**
     * Cadastra um novo quarto com todas as suas características.
     *
     * FLUXO (UC01 — Fluxo Principal):
     * 1. Valida unicidade do número (RN01 — RF06)
     * 2. Constrói a entidade Quarto
     * 3. Adiciona camas (RN05 — validação via @NotEmpty no DTO)
     * 4. Persiste (status inicial = LIVRE conforme UC01 pós-condição)
     * 5. Retorna o Detalhe do quarto criado
     *
     * @Transactional: quarto e camas persistidos atomicamente.
     * Se salvar camas falhar, o quarto é revertido (rollback).
     */
    @Transactional
    public QuartoResponse.Detalhe cadastrarQuarto(QuartoRequest.Criar dto) {
        // Passo 1: RN01 — Número do quarto deve ser único no sistema
        if (quartoRepository.existsByNumero(dto.numero().trim())) {
            throw new QuartoInvalidoException(
                "Já existe um quarto com o número '%s'. Escolha outro número (RN01)."
                    .formatted(dto.numero())
            );
        }

        // Passo 2: Constrói entidade com campos obrigatórios
        Quarto novoQuarto = new Quarto(
            dto.numero(),
            dto.capacidade(),
            dto.tipo(),
            dto.precoDiaria()
        );

        // Passo 3: Define comodidades
        novoQuarto.setTemFrigobar(dto.temFrigobar());
        novoQuarto.setTemCafeDaManha(dto.temCafeDaManha());
        novoQuarto.setTemArCondicionado(dto.temArCondicionado());
        novoQuarto.setTemTV(dto.temTV());

        // Passo 4: Adiciona camas — RN05 garantido pelo @NotEmpty no DTO
        dto.tiposCama().stream()
            .map(Cama::de)                       // Factory method do Value Object
            .forEach(novoQuarto::adicionarCama); // Método de negócio da entidade

        // Passo 5: Persiste — @PrePersist define criadoEm e atualizadoEm
        Quarto quartoSalvo = quartoRepository.save(novoQuarto);
        return quartoMapper.toDetalhe(quartoSalvo);
    }

    // =========================================================================
    // UC03 — Editar Quarto (RF03)
    // =========================================================================

    /**
     * Edita os campos de um quarto existente.
     *
     * DECISÃO — EDIÇÃO PARCIAL (PATCH SEMÂNTICO):
     * Apenas campos não-nulos no DTO são atualizados.
     * Isso evita que o cliente precise enviar todos os campos para alterar apenas um.
     *
     * DECISÃO — LOAD THEN MODIFY:
     * Carregamos a entidade do banco, aplicamos as mudanças e salvamos.
     * Alternativa (bulk UPDATE com JPQL) seria mais eficiente mas perderia:
     * - Execução dos @PreUpdate callbacks
     * - Validações nos setters da entidade
     * - Geração do histórico pelo Hibernate (futuro)
     */
    @Transactional
    public QuartoResponse.Detalhe editarQuarto(Long id, QuartoRequest.Editar dto) {
        Quarto quarto = buscarQuartoOuLancarErro(id);

        // Verifica unicidade do número apenas se foi alterado (UC03 — FA01)
        if (dto.numero() != null && !dto.numero().equals(quarto.getNumero())) {
            if (quartoRepository.existsByNumeroAndIdNot(dto.numero().trim(), id)) {
                throw new QuartoInvalidoException(
                    "Já existe outro quarto com o número '%s' (RN01).".formatted(dto.numero())
                );
            }
            quarto.setNumero(dto.numero());
        }

        // Aplica alterações apenas nos campos fornecidos (null = não alterar)
        if (dto.capacidade() != null)      quarto.setCapacidade(dto.capacidade());
        if (dto.tipo() != null)             quarto.setTipo(dto.tipo());
        if (dto.precoDiaria() != null)      quarto.setPrecoDiaria(dto.precoDiaria());
        if (dto.temFrigobar() != null)      quarto.setTemFrigobar(dto.temFrigobar());
        if (dto.temCafeDaManha() != null)   quarto.setTemCafeDaManha(dto.temCafeDaManha());
        if (dto.temArCondicionado() != null) quarto.setTemArCondicionado(dto.temArCondicionado());
        if (dto.temTV() != null)            quarto.setTemTV(dto.temTV());

        // Atualiza camas apenas se fornecidas no request (UC03 — FA03)
        if (dto.tiposCama() != null && !dto.tiposCama().isEmpty()) {
            List<Cama> novasCamas = dto.tiposCama().stream()
                .map(Cama::de)
                .toList();
            quarto.redefinirCamas(novasCamas); // Método protege invariante RN05
        }

        // DECISÃO: save() com entidade gerenciada pelo JPA faz UPDATE, não INSERT.
        // O Hibernate detecta dirty fields automaticamente (dirty checking).
        Quarto quartoAtualizado = quartoRepository.save(quarto);
        return quartoMapper.toDetalhe(quartoAtualizado);
    }

    // =========================================================================
    // UC04 — Alterar Status de Disponibilidade (RF05)
    // =========================================================================

    /**
     * Altera o status de disponibilidade de um quarto.
     *
     * DECISÃO — ENDPOINT SEPARADO (PATCH /quartos/{id}/status):
     * Status é uma operação semântica diferente de "editar campos do quarto".
     * Separar em endpoint próprio:
     * 1. Permite permissões diferentes futuramente (ex: só gerente muda para MANUTENCAO)
     * 2. Registra alteração de status no log de auditoria separadamente (RN10)
     * 3. Evita que operações de edição comuns alterem o status acidentalmente
     */
    @Transactional
    public QuartoResponse.Resumo alterarStatus(Long id, StatusQuarto novoStatus) {
        Quarto quarto = buscarQuartoOuLancarErro(id);

        // RN09: Quartos com reserva ativa devem manter status OCUPADO
        // Aviso se tentar remover OCUPADO de quarto com reserva ativa
        if (quarto.getStatus() == StatusQuarto.OCUPADO
                && novoStatus != StatusQuarto.OCUPADO
                && quartoRepository.temReservaAtiva(id)) {
            throw new QuartoInvalidoException(
                "O quarto %s possui reserva ativa e não pode ter status alterado manualmente. "
                    .formatted(quarto.getNumero()) +
                "Cancele a reserva primeiro (RN09)."
            );
        }

        quarto.alterarStatus(novoStatus);
        Quarto quartoAtualizado = quartoRepository.save(quarto);
        return quartoMapper.toResumo(quartoAtualizado);
    }

    // =========================================================================
    // Método privado auxiliar — reutilizado por múltiplas operações
    // DECISÃO: DRY — busca com tratamento de erro centralizado.
    // =========================================================================

    /**
     * Busca o quarto pelo ID ou lança exceção padronizada.
     * DECISÃO: Centralizar o tratamento de "não encontrado" evita duplicar
     * o orElseThrow() em todos os métodos que precisam do quarto.
     */
    private Quarto buscarQuartoOuLancarErro(Long id) {
        return quartoRepository.findById(id)
            .orElseThrow(() -> new QuartoNaoEncontradoException(id));
    }
}
