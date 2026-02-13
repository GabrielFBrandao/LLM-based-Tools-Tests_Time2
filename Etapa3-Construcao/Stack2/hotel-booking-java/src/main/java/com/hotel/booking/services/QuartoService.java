package com.hotel.booking.services;

import com.hotel.booking.entities.Quarto;
import com.hotel.booking.entities.Cama;
import com.hotel.booking.enums.TipoQuarto;
import com.hotel.booking.enums.StatusQuarto;
import com.hotel.booking.enums.TipoCama;
import com.hotel.booking.repositories.QuartoRepository;
import com.hotel.booking.repositories.CamaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class QuartoService {

    private final QuartoRepository quartoRepository;
    private final CamaRepository camaRepository;

    // ========== MÉTODOS DE CRUD ==========

    /**
     * Cria um novo quarto
     */
    public Quarto criarQuarto(Quarto quarto) {
        log.info("Criando novo quarto: {}", quarto.getNumero());
        
        validarQuarto(quarto, false);
        
        // Garante que o ID seja gerado
        if (quarto.getId() == null) {
            quarto.setId(UUID.randomUUID());
        }
        
        // Salva o quarto primeiro
        Quarto quartoSalvo = quartoRepository.save(quarto);
        
        // Salva as camas associadas
        if (quarto.getCamas() != null && !quarto.getCamas().isEmpty()) {
            salvarCamas(quartoSalvo.getId(), quarto.getCamas());
        }
        
        log.info("Quarto criado com sucesso: {}", quartoSalvo.getId());
        return quartoSalvo;
    }

    /**
     * Atualiza um quarto existente
     */
    public Quarto atualizarQuarto(UUID id, Quarto quarto) {
        log.info("Atualizando quarto: {}", id);
        
        Quarto quartoExistente = buscarQuartoPorId(id);
        
        // Validações específicas para atualização
        if (!quartoExistente.getNumero().equals(quarto.getNumero())) {
            if (quartoRepository.existsByNumero(quarto.getNumero())) {
                throw new IllegalArgumentException("Número do quarto já existe: " + quarto.getNumero());
            }
        }
        
        // Atualiza os campos permitidos
        quartoExistente.setNumero(quarto.getNumero());
        quartoExistente.setCapacidade(quarto.getCapacidade());
        quartoExistente.setTipo(quarto.getTipo());
        quartoExistente.setPrecoPorNoite(quarto.getPrecoPorNoite());
        quartoExistente.setHasMinibar(quarto.isHasMinibar());
        quartoExistente.setHasCafeDaManha(quarto.isHasCafeDaManha());
        quartoExistente.setHasArCondicionado(quarto.isHasArCondicionado());
        quartoExistente.setHasTV(quarto.isHasTV());
        quartoExistente.setStatus(quarto.getStatus());
        
        validarQuarto(quartoExistente, true);
        
        // Atualiza as camas
        if (quarto.getCamas() != null) {
            // Remove todas as camas existentes
            camaRepository.deleteByQuartoId(id);
            // Adiciona as novas camas
            salvarCamas(id, quarto.getCamas());
        }
        
        Quarto quartoAtualizado = quartoRepository.save(quartoExistente);
        log.info("Quarto atualizado com sucesso: {}", quartoAtualizado.getId());
        return quartoAtualizado;
    }

    /**
     * Busca quarto por ID
     */
    @Transactional(readOnly = true)
    public Quarto buscarQuartoPorId(UUID id) {
        return quartoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Quarto não encontrado: " + id));
    }

    /**
     * Busca quarto por número
     */
    @Transactional(readOnly = true)
    public Quarto buscarQuartoPorNumero(String numero) {
        return quartoRepository.findByNumero(numero)
                .orElseThrow(() -> new IllegalArgumentException("Quarto não encontrado: " + numero));
    }

    /**
     * Lista todos os quartos
     */
    @Transactional(readOnly = true)
    public List<Quarto> listarTodosQuartos() {
        return quartoRepository.findAll();
    }

    /**
     * Deleta um quarto
     */
    public void deletarQuarto(UUID id) {
        log.info("Deletando quarto: {}", id);
        
        Quarto quarto = buscarQuartoPorId(id);
        
        // Verifica se quarto pode ser deletado (não deve ter reservas ativas)
        if (quarto.getStatus() == StatusQuarto.OCUPADO) {
            throw new IllegalStateException("Não é possível deletar um quarto ocupado");
        }
        
        // Deleta as camas associadas
        camaRepository.deleteByQuartoId(id);
        
        // Deleta o quarto
        quartoRepository.deleteById(id);
        
        log.info("Quarto deletado com sucesso: {}", id);
    }

    // ========== MÉTODOS DE BUSCA E FILTRAGEM ==========

    /**
     * Busca quartos por tipo
     */
    @Transactional(readOnly = true)
    public List<Quarto> buscarQuartosPorTipo(TipoQuarto tipo) {
        return quartoRepository.findByTipo(tipo);
    }

    /**
     * Busca quartos por status
     */
    @Transactional(readOnly = true)
    public List<Quarto> buscarQuartosPorStatus(StatusQuarto status) {
        return quartoRepository.findByStatus(status);
    }

    /**
     * Busca quartos disponíveis
     */
    @Transactional(readOnly = true)
    public List<Quarto> buscarQuartosDisponiveis() {
        return quartoRepository.findByStatus(StatusQuarto.DISPONIVEL);
    }

    /**
     * Busca quartos por capacidade mínima
     */
    @Transactional(readOnly = true)
    public List<Quarto> buscarQuartosPorCapacidadeMinima(Integer capacidade) {
        return quartoRepository.findByCapacidadeGreaterThanEqual(capacidade);
    }

    /**
     * Busca quartos por faixa de preço
     */
    @Transactional(readOnly = true)
    public List<Quarto> buscarQuartosPorFaixaPreco(BigDecimal precoMin, BigDecimal precoMax) {
        return quartoRepository.findByPrecoRange(precoMin, precoMax);
    }

    /**
     * Busca quartos com múltiplos filtros
     */
    @Transactional(readOnly = true)
    public List<Quarto> buscarQuartosComFiltros(TipoQuarto tipo, StatusQuarto status, 
                                              Integer capacidadeMinima, BigDecimal precoMax) {
        return quartoRepository.buscarComFiltros(tipo, status, capacidadeMinima, precoMax);
    }

    /**
     * Busca quartos disponíveis para um período específico
     */
    @Transactional(readOnly = true)
    public List<Quarto> buscarQuartosDisponiveisNoPeriodo(LocalDate checkIn, LocalDate checkOut) {
        return quartoRepository.findQuartosDisponiveisNoPeriodo(
            StatusQuarto.DISPONIVEL, checkIn, checkOut);
    }

    /**
     * Busca quartos por número contendo texto
     */
    @Transactional(readOnly = true)
    public List<Quarto> buscarQuartosPorNumero(String texto) {
        return quartoRepository.findByNumeroContainingIgnoreCase(texto);
    }

    // ========== MÉTODOS DE STATUS ==========

    /**
     * Atualiza status do quarto
     */
    public Quarto atualizarStatus(UUID id, StatusQuarto novoStatus) {
        log.info("Atualizando status do quarto {} para {}", id, novoStatus);
        
        Quarto quarto = buscarQuartoPorId(id);
        
        // Validações de transição de status
        validarTransicaoStatus(quarto.getStatus(), novoStatus);
        
        quarto.setStatus(novoStatus);
        Quarto quartoAtualizado = quartoRepository.save(quarto);
        
        log.info("Status atualizado com sucesso");
        return quartoAtualizado;
    }

    /**
     * Marca quarto como disponível
     */
    public Quarto marcarComoDisponivel(UUID id) {
        return atualizarStatus(id, StatusQuarto.DISPONIVEL);
    }

    /**
     * Marca quarto como ocupado
     */
    public Quarto marcarComoOcupado(UUID id) {
        return atualizarStatus(id, StatusQuarto.OCUPADO);
    }

    /**
     * Marca quarto como em manutenção
     */
    public Quarto marcarComoEmManutencao(UUID id) {
        Quarto quarto = buscarQuartoPorId(id);
        if (quarto.getStatus() == StatusQuarto.OCUPADO) {
            throw new IllegalStateException("Não é possível colocar um quarto ocupado em manutenção");
        }
        return atualizarStatus(id, StatusQuarto.MANUTENCAO);
    }

    /**
     * Marca quarto como em limpeza
     */
    public Quarto marcarComoEmLimpeza(UUID id) {
        Quarto quarto = buscarQuartoPorId(id);
        if (quarto.getStatus() == StatusQuarto.OCUPADO) {
            throw new IllegalStateException("Não é possível colocar um quarto ocupado em limpeza");
        }
        return atualizarStatus(id, StatusQuarto.LIMPEZA);
    }

    // ========== MÉTODOS DE CAMAS ==========

    /**
     * Adiciona uma cama ao quarto
     */
    public Quarto adicionarCama(UUID quartoId, TipoCama tipoCama) {
        Quarto quarto = buscarQuartoPorId(quartoId);
        
        Cama novaCama = Cama.builder()
                .id(UUID.randomUUID())
                .tipo(tipoCama)
                .quartoId(quartoId)
                .build();
        
        camaRepository.save(novaCama);
        
        // Atualiza capacidade do quarto
        atualizarCapacidadeQuarto(quarto);
        
        return buscarQuartoPorId(quartoId);
    }

    /**
     * Remove uma cama do quarto
     */
    public Quarto removerCama(UUID quartoId, UUID camaId) {
        Quarto quarto = buscarQuartoPorId(quartoId);
        
        Cama cama = camaRepository.findById(camaId)
                .orElseThrow(() -> new IllegalArgumentException("Cama não encontrada"));
        
        if (!cama.getQuartoId().equals(quartoId)) {
            throw new IllegalArgumentException("Cama não pertence a este quarto");
        }
        
        camaRepository.delete(cama);
        
        // Atualiza capacidade do quarto
        atualizarCapacidadeQuarto(quarto);
        
        return buscarQuartoPorId(quartoId);
    }

    // ========== MÉTODOS DE RELATÓRIOS ==========

    /**
     * Conta quartos por status
     */
    @Transactional(readOnly = true)
    public List<Object[]> contarQuartosPorStatus() {
        return quartoRepository.countQuartosPorStatus();
    }

    /**
     * Lista quartos ordenados por preço
     */
    @Transactional(readOnly = true)
    public List<Quarto> listarQuartosPorPreco() {
        return quartoRepository.findByOrderByPrecoPorNoiteAsc();
    }

    /**
     * Lista quartos ordenados por capacidade
     */
    @Transactional(readOnly = true)
    public List<Quarto> listarQuartosPorCapacidade() {
        return quartoRepository.findByOrderByCapacidadeDesc();
    }

    // ========== MÉTODOS PRIVADOS ==========

    /**
     * Valida dados do quarto
     */
    private void validarQuarto(Quarto quarto, boolean isAtualizacao) {
        if (!isAtualizacao && quartoRepository.existsByNumero(quarto.getNumero())) {
            throw new IllegalArgumentException("Número do quarto já existe: " + quarto.getNumero());
        }
        
        if (quarto.getNumero() == null || quarto.getNumero().trim().isEmpty()) {
            throw new IllegalArgumentException("Número do quarto é obrigatório");
        }
        
        if (quarto.getCapacidade() == null || quarto.getCapacidade() <= 0) {
            throw new IllegalArgumentException("Capacidade deve ser maior que zero");
        }
        
        if (quarto.getPrecoPorNoite() == null || quarto.getPrecoPorNoite().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Preço por noite deve ser maior que zero");
        }
        
        if (quarto.getTipo() == null) {
            throw new IllegalArgumentException("Tipo do quarto é obrigatório");
        }
        
        if (quarto.getStatus() == null) {
            throw new IllegalArgumentException("Status do quarto é obrigatório");
        }
        
        // Valida capacidade vs camas
        if (quarto.getCamas() != null && !quarto.getCamas().isEmpty()) {
            int capacidadeCalculada = calcularCapacidadeCamas(quarto.getCamas());
            if (capacidadeCalculada != quarto.getCapacidade()) {
                throw new IllegalArgumentException(
                    String.format("Capacidade informada (%d) não corresponde à capacidade das camas (%d)",
                            quarto.getCapacidade(), capacidadeCalculada));
            }
        }
    }

    /**
     * Valida transição de status
     */
    private void validarTransicaoStatus(StatusQuarto statusAtual, StatusQuarto novoStatus) {
        // Não permite transição de OCUPADO para DISPONIVEL diretamente
        if (statusAtual == StatusQuarto.OCUPADO && novoStatus == StatusQuarto.DISPONIVEL) {
            throw new IllegalStateException("Quarto ocupado deve passar por limpeza antes de ficar disponível");
        }
        
        // Não permite transição para OCUPADO se não estiver DISPONIVEL
        if (novoStatus == StatusQuarto.OCUPADO && statusAtual != StatusQuarto.DISPONIVEL) {
            throw new IllegalStateException("Apenas quartos disponíveis podem ser ocupados");
        }
    }

    /**
     * Salva camas associadas a um quarto
     */
    private void salvarCamas(UUID quartoId, List<Cama> camas) {
        for (Cama cama : camas) {
            cama.setId(UUID.randomUUID());
            cama.setQuartoId(quartoId);
            camaRepository.save(cama);
        }
    }

    /**
     * Calcula capacidade total baseada nas camas
     */
    private int calcularCapacidadeCamas(List<Cama> camas) {
        return camas.stream()
                .mapToInt(cama -> cama.getCapacidade())
                .sum();
    }

    /**
     * Atualiza capacidade do quarto baseada nas camas
     */
    private void atualizarCapacidadeQuarto(Quarto quarto) {
        List<Cama> camas = camaRepository.findByQuartoId(quarto.getId());
        int novaCapacidade = calcularCapacidadeCamas(camas);
        quarto.setCapacidade(novaCapacidade);
        quartoRepository.save(quarto);
    }
}
