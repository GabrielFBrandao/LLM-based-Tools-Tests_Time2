package com.hotel.booking.services.impl;

import com.hotel.booking.entities.Quarto;
import com.hotel.booking.entities.Cama;
import com.hotel.booking.enums.TipoQuarto;
import com.hotel.booking.enums.StatusQuarto;
import com.hotel.booking.enums.TipoCama;
import com.hotel.booking.repositories.QuartoRepository;
import com.hotel.booking.repositories.CamaRepository;
import com.hotel.booking.services.QuartoService;
import com.hotel.booking.dtos.QuartoDTO;
import com.hotel.booking.dtos.QuartoRequestDTO;
import com.hotel.booking.mappers.QuartoMapper;
import com.hotel.booking.exceptions.QuartoNotFoundException;
import com.hotel.booking.exceptions.QuartoAlreadyExistsException;
import com.hotel.booking.exceptions.InvalidQuartoStatusTransitionException;
import com.hotel.booking.exceptions.BusinessRuleViolationException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementação do Serviço de Gestão de Quartos
 * 
 * Princípios SOLID aplicados:
 * - Single Responsibility: Responsável apenas pela lógica de negócio de quartos
 * - Open/Closed: Aberta para extensão (novas regras), fechada para modificação
 * - Liskov Substitution: Pode ser substituída por qualquer implementação de QuartoService
 * - Interface Segregation: Implementa apenas métodos essenciais para gestão de quartos
 * - Dependency Inversion: Depende de abstrações (interfaces), não de implementações
 * 
 * Clean Code aplicados:
 * - Métodos pequenos com única responsabilidade
 * - Nomes descritivos que indicam intenção
 * - Tratamento de erros centralizado
 * - Injeção de dependências via construtor
 * - Separação clara entre regras de negócio e infraestrutura
 * 
 * Decisões de implementação:
 * 1. @Service para injeção automática pelo Spring
 *    - Facilita configuração e testes
 *    - Segue convenções do framework
 *    - Suporte a proxies e AOP
 * 
 * 2. @RequiredArgsConstructor para injeção de dependências
 *    - Reduz boilerplate do Lombok
 *    - Garante imutabilidade das dependências
 *    - Facilita testes com mocks
 * 
 * 3. @Transactional para consistência de dados
 *    - Garante atomicidade das operações
 *    - Rollback automático em caso de erro
 *    - Isolamento de transações
 * 
 * 4. @Slf4j para logging estruturado
 *    - Facilita debugging e monitoramento
 *    - Suporte a diferentes níveis de log
 *    - Formatação automática
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class QuartoServiceImpl implements QuartoService {

    // Dependências injetadas - Princípio da Inversão de Dependência (DIP)
    private final QuartoRepository quartoRepository;
    private final CamaRepository camaRepository;
    private final QuartoMapper quartoMapper;

    // ========== MÉTODOS CRUD ==========

    /**
     * Cria um novo quarto no sistema
     * 
     * Decisão: Validação de regras de negócio antes da persistência
     * - Garante consistência dos dados
     * - Prevenção de objetos inválidos
     * - Feedback imediato ao cliente
     * 
     * @param requestDTO Dados do quarto a ser criado
     * @return QuartoDTO com dados do quarto criado
     * @throws QuartoAlreadyExistsException se já existe quarto com mesmo número
     * @throws BusinessRuleViolationException se violar regras de negócio
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public QuartoDTO criarQuarto(QuartoRequestDTO requestDTO) {
        log.info("Iniciando criação do quarto: {}", requestDTO.getNumero());
        
        try {
            // Validações de negócio específicas para criação
            validarCriacaoQuarto(requestDTO);

            // Conversão para entidade
            Quarto quarto = quartoMapper.toEntity(requestDTO);
            
            // Persistência
            Quarto quartoSalvo = quartoRepository.save(quarto);
            
            log.info("Quarto criado com sucesso: ID={}, Número={}", 
                    quartoSalvo.getId(), quartoSalvo.getNumero());
            
            return quartoMapper.toDTO(quartoSalvo);
            
        } catch (QuartoAlreadyExistsException | BusinessRuleViolationException e) {
            log.warn("Erro de negócio ao criar quarto {}: {}", 
                    requestDTO.getNumero(), e.getMessage());
            throw e;
            
        } catch (Exception e) {
            log.error("Erro inesperado ao criar quarto: {}", requestDTO.getNumero(), e);
            throw new RuntimeException("Erro ao criar quarto", e);
        }
    }

    /**
     * Atualiza um quarto existente
     * 
     * Decisão: Validação de existência e consistência
     * - Garante que quarto existe antes de atualizar
     * - Valida mudanças de estado
     * - Preserva histórico quando necessário
     * 
     * @param id ID do quarto a ser atualizado
     * @param requestDTO Novos dados do quarto
     * @return QuartoDTO com dados atualizados
     * @throws QuartoNotFoundException se quarto não encontrado
     * @throws BusinessRuleViolationException se violar regras de negócio
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public QuartoDTO atualizarQuarto(UUID id, QuartoRequestDTO requestDTO) {
        log.info("Iniciando atualização do quarto: ID={}", id);
        
        try {
            // Busca quarto existente
            Quarto quartoExistente = buscarQuartoPorIdInternal(id);
            
            // Validações específicas para atualização
            validarAtualizacaoQuarto(quartoExistente, requestDTO);
            
            // Atualização dos campos
            atualizarCamposQuarto(quartoExistente, requestDTO);
            
            // Persistência
            Quarto quartoAtualizado = quartoRepository.save(quartoExistente);
            
            log.info("Quarto atualizado com sucesso: ID={}", id);
            
            return quartoMapper.toDTO(quartoAtualizado);
            
        } catch (QuartoNotFoundException | BusinessRuleViolationException e) {
            log.warn("Erro de negócio ao atualizar quarto {}: {}", id, e.getMessage());
            throw e;
            
        } catch (Exception e) {
            log.error("Erro inesperado ao atualizar quarto: {}", id, e);
            throw new RuntimeException("Erro ao atualizar quarto", e);
        }
    }

    /**
     * Busca quarto por ID
     * 
     * Decisão: Método simples com tratamento de exceção
     * - Lança exceção específica se não encontrado
     * - Facilita tratamento no controller
     * - Consistência na API
     * 
     * @param id ID do quarto
     * @return QuartoDTO com dados do quarto
     * @throws QuartoNotFoundException se quarto não encontrado
     */
    @Override
    @Transactional(readOnly = true)
    public QuartoDTO buscarQuartoPorId(UUID id) {
        log.debug("Buscando quarto por ID: {}", id);
        
        Quarto quarto = buscarQuartoPorIdInternal(id);
        
        log.debug("Quarto encontrado: ID={}, Número={}", quarto.getId(), quarto.getNumero());
        
        return quartoMapper.toDTO(quarto);
    }

    /**
     * Busca quarto por número
     * 
     * Decisão: Método específico para campo único
     * - Otimização para busca por número
     * - Facilita validação de duplicidade
     * - Suporte a lookup rápido
     * 
     * @param numero Número do quarto
     * @return QuartoDTO com dados do quarto
     * @throws QuartoNotFoundException se quarto não encontrado
     */
    @Override
    @Transactional(readOnly = true)
    public QuartoDTO buscarQuartoPorNumero(String numero) {
        log.debug("Buscando quarto por número: {}", numero);
        
        Quarto quarto = quartoRepository.findByNumero(numero)
                .orElseThrow(() -> new QuartoNotFoundException("Quarto não encontrado: " + numero));
        
        log.debug("Quarto encontrado: ID={}, Número={}", quarto.getId(), quarto.getNumero());
        
        return quartoMapper.toDTO(quarto);
    }

    /**
     * Lista todos os quartos
     * 
     * Decisão: Método simples com paginação implícita
     * - Retorna todos os registros (limitado pelo repository)
     * - Facilita implementação de cache
     * - Suporte a ordenação padrão
     * 
     * @return Lista de QuartoDTO
     */
    @Override
    @Transactional(readOnly = true)
    public List<QuartoDTO> listarTodosQuartos() {
        log.debug("Listando todos os quartos");
        
        List<Quarto> quartos = quartoRepository.findAll();
        
        log.debug("Total de quartos encontrados: {}", quartos.size());
        
        return quartos.stream()
                .map(quartoMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Deleta um quarto
     * 
     * Decisão: Validação de regras de deleção
     * - Prevenção de deleção de quartos ocupados
     * - Preservação de integridade referencial
     * - Soft delete quando apropriado
     * 
     * @param id ID do quarto a ser deletado
     * @throws QuartoNotFoundException se quarto não encontrado
     * @throws BusinessRuleViolationException se quarto não pode ser deletado
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deletarQuarto(UUID id) {
        log.info("Iniciando deleção do quarto: ID={}", id);
        
        try {
            Quarto quarto = buscarQuartoPorIdInternal(id);
            
            // Validação de regras de negócio
            if (!podeSerDeletado(quarto)) {
                throw new BusinessRuleViolationException(
                    "Não é possível deletar um quarto ocupado");
            }
            
            // Deleção em cascata das camas
            camaRepository.deleteByQuartoId(id);
            
            // Deleção do quarto
            quartoRepository.deleteById(id);
            
            log.info("Quarto deletado com sucesso: ID={}", id);
            
        } catch (QuartoNotFoundException | BusinessRuleViolationException e) {
            log.warn("Erro de negócio ao deletar quarto {}: {}", id, e.getMessage());
            throw e;
            
        } catch (Exception e) {
            log.error("Erro inesperado ao deletar quarto: {}", id, e);
            throw new RuntimeException("Erro ao deletar quarto", e);
        }
    }

    // ========== MÉTODOS DE NEGÓCIO ==========

    /**
     * Atualiza status do quarto com validação de transição
     * 
     * Decisão: Máquina de estados para status
     * - Valida transições válidas
     * - Documenta fluxo de negócio
     * - Facilita auditoria
     * 
     * @param id ID do quarto
     * @param novoStatus Novo status do quarto
     * @return QuartoDTO com status atualizado
     * @throws QuartoNotFoundException se quarto não encontrado
     * @throws InvalidQuartoStatusTransitionException se transição inválida
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public QuartoDTO atualizarStatus(UUID id, StatusQuarto novoStatus) {
        log.info("Atualizando status do quarto: ID={}, NovoStatus={}", id, novoStatus);
        
        try {
            Quarto quarto = buscarQuartoPorIdInternal(id);
            StatusQuarto statusAnterior = quarto.getStatus();
            
            // Validação de transição de estado
            validarTransicaoStatus(statusAnterior, novoStatus);
            
            // Atualização
            quarto.setStatus(novoStatus);
            Quarto quartoAtualizado = quartoRepository.save(quarto);
            
            log.info("Status atualizado com sucesso: ID={}, {} -> {}", 
                    id, statusAnterior, novoStatus);
            
            return quartoMapper.toDTO(quartoAtualizado);
            
        } catch (QuartoNotFoundException | InvalidQuartoStatusTransitionException e) {
            log.warn("Erro ao atualizar status do quarto {}: {}", id, e.getMessage());
            throw e;
            
        } catch (Exception e) {
            log.error("Erro inesperado ao atualizar status do quarto: {}", id, e);
            throw new RuntimeException("Erro ao atualizar status", e);
        }
    }

    /**
     * Marca quarto como disponível
     * 
     * Decisão: Método específico para clareza
     * - Facilita uso em código cliente
     * - Encapsula lógica de status
     * - Reduz verbosidade
     * 
     * @param id ID do quarto
     * @return QuartoDTO com status atualizado
     */
    @Override
    public QuartoDTO marcarComoDisponivel(UUID id) {
        return atualizarStatus(id, StatusQuarto.DISPONIVEL);
    }

    /**
     * Marca quarto como ocupado
     * 
     * Decisão: Validação prévia de ocupação
     * - Garante que quarto pode ser ocupado
     * - Previne estados inconsistentes
     * - Facilita debugging
     * 
     * @param id ID do quarto
     * @return QuartoDTO com status atualizado
     * @throws BusinessRuleViolationException se quarto não pode ser ocupado
     */
    @Override
    public QuartoDTO marcarComoOcupado(UUID id) {
        Quarto quarto = buscarQuartoPorIdInternal(id);
        
        if (!podeSerOcupado(quarto)) {
            throw new BusinessRuleViolationException(
                "Quarto não pode ser ocupado no status atual");
        }
        
        return atualizarStatus(id, StatusQuarto.OCUPADO);
    }

    /**
     * Marca quarto como em manutenção
     * 
     * Decisão: Validação de estado para manutenção
     * - Previne manutenção em quartos ocupados
     * - Garante fluxo correto de operações
     * - Facilita gestão de operações
     * 
     * @param id ID do quarto
     * @return QuartoDTO com status atualizado
     * @throws BusinessRuleViolationException se quarto estiver ocupado
     */
    @Override
    public QuartoDTO marcarComoEmManutencao(UUID id) {
        Quarto quarto = buscarQuartoPorIdInternal(id);
        
        if (quarto.getStatus() == StatusQuarto.OCUPADO) {
            throw new BusinessRuleViolationException(
                "Não é possível colocar um quarto ocupado em manutenção");
        }
        
        return atualizarStatus(id, StatusQuarto.MANUTENCAO);
    }

    /**
     * Marca quarto como em limpeza
     * 
     * Decisão: Validação de estado para limpeza
     * - Apenas quartos não ocupados podem ir para limpeza
     * - Facilita gestão de housekeeping
     * - Prevenção de conflitos de operações
     * 
     * @param id ID do quarto
     * @return QuartoDTO com status atualizado
     * @throws BusinessRuleViolationException se quarto estiver ocupado
     */
    @Override
    public QuartoDTO marcarComoEmLimpeza(UUID id) {
        Quarto quarto = buscarQuartoPorIdInternal(id);
        
        if (quarto.getStatus() == StatusQuarto.OCUPADO) {
            throw new BusinessRuleViolationException(
                "Não é possível colocar um quarto ocupado em limpeza");
        }
        
        return atualizarStatus(id, StatusQuarto.LIMPEZA);
    }

    // ========== MÉTODOS DE BUSCA E FILTRAGEM ==========

    /**
     * Busca quartos por tipo
     * 
     * Decisão: Delegação para repository com validação
     * - Centraliza lógica de busca no repository
     * - Facilita implementação de cache
     * - Suporte a diferentes estratégias
     * 
     * @param tipo Tipo do quarto
     * @return Lista de QuartoDTO do tipo especificado
     */
    @Override
    @Transactional(readOnly = true)
    public List<QuartoDTO> buscarQuartosPorTipo(TipoQuarto tipo) {
        log.debug("Buscando quartos por tipo: {}", tipo);
        
        List<Quarto> quartos = quartoRepository.findByTipo(tipo);
        
        return quartos.stream()
                .map(quartoMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Busca quartos por status
     * 
     * Decisão: Método essencial para gestão
     * - Operação mais comum no sistema
     * - Otimização de query
     * - Suporte a real-time updates
     * 
     * @param status Status do quarto
     * @return Lista de QuartoDTO com o status especificado
     */
    @Override
    @Transactional(readOnly = true)
    public List<QuartoDTO> buscarQuartosPorStatus(StatusQuarto status) {
        log.debug("Buscando quartos por status: {}", status);
        
        List<Quarto> quartos = quartoRepository.findByStatus(status);
        
        return quartos.stream()
                .map(quartoMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Busca quartos disponíveis
     * 
     * Decisão: Método específico para caso comum
     * - Facilita uso em reservas
     * - Otimização para query frequente
     * - Cache recomendado
     * 
     * @return Lista de QuartoDTO disponíveis
     */
    @Override
    @Transactional(readOnly = true)
    public List<QuartoDTO> buscarQuartosDisponiveis() {
        log.debug("Buscando quartos disponíveis");
        
        List<Quarto> quartos = quartoRepository.findByStatus(StatusQuarto.DISPONIVEL);
        
        return quartos.stream()
                .map(quartoMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Busca quartos por capacidade mínima
     * 
     * Decisão: Busca por capacidade numérica
     * - Facilita reservas para grupos
     * - Suporte a diferentes tamanhos
     * - Otimização range query
     * 
     * @param capacidade Capacidade mínima desejada
     * @return Lista de QuartoDTO com capacidade >= informada
     */
    @Override
    @Transactional(readOnly = true)
    public List<QuartoDTO> buscarQuartosPorCapacidadeMinima(Integer capacidade) {
        log.debug("Buscando quartos por capacidade mínima: {}", capacidade);
        
        List<Quarto> quartos = quartoRepository.findByCapacidadeGreaterThanEqual(capacidade);
        
        return quartos.stream()
                .map(quartoMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Busca quartos por faixa de preço
     * 
     * Decisão: Busca por range de preço
     * - Facilita filtragem por orçamento
     * - Validação de range (min <= max)
     * - Otimização para queries de preço
     * 
     * @param precoMin Preço mínimo da faixa
     * @param precoMax Preço máximo da faixa
     * @return Lista de QuartoDTO na faixa de preço
     */
    @Override
    @Transactional(readOnly = true)
    public List<QuartoDTO> buscarQuartosPorFaixaPreco(BigDecimal precoMin, BigDecimal precoMax) {
        log.debug("Buscando quartos por faixa de preço: {} - {}", precoMin, precoMax);
        
        // Validação de range
        if (precoMin.compareTo(BigDecimal.ZERO) < 0 || precoMax.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessRuleViolationException("Preços não podem ser negativos");
        }
        
        if (precoMin.compareTo(precoMax) > 0) {
            throw new BusinessRuleViolationException("Preço mínimo não pode ser maior que o preço máximo");
        }
        
        List<Quarto> quartos = quartoRepository.findByPrecoPorNoiteBetween(precoMin, precoMax);
        
        return quartos.stream()
                .map(quartoMapper::toDTO)
                .collect(Collectors.toList());
    }

    // ========== MÉTODOS DE CAMAS ==========

    /**
     * Adiciona uma cama ao quarto
     * 
     * Decisão: Validação de capacidade e consistência
     * - Garante que quarto existe
     * - Valida capacidade máxima
     * - Atualiza capacidade do quarto
     * 
     * @param quartoId ID do quarto
     * @param tipoCama Tipo da cama a ser adicionada
     * @return QuartoDTO com a nova cama
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public QuartoDTO adicionarCama(UUID quartoId, TipoCama tipoCama) {
        log.info("Adicionando cama ao quarto: ID={}, Tipo={}", quartoId, tipoCama);
        
        try {
            Quarto quarto = buscarQuartoPorIdInternal(quartoId);
            
            // Valida capacidade máxima
            if (quarto.getCapacidade() >= 10) {
                throw new BusinessRuleViolationException("Capacidade máxima do quarto é 10 pessoas");
            }
            
            // Cria nova cama
            Cama novaCama = Cama.builder()
                    .id(UUID.randomUUID())
                    .tipo(tipoCama)
                    .quarto(quarto)
                    .build();
            
            // Salva cama
            camaRepository.save(novaCama);
            
            // Atualiza capacidade do quarto
            Integer capacidadeAdicional = tipoCama == TipoCama.SOLTEIRO ? 1 : 2;
            quarto.setCapacidade(quarto.getCapacidade() + capacidadeAdicional);
            quartoRepository.save(quarto);
            
            log.info("Cama adicionada com sucesso: QuartoID={}, CamaID={}", 
                    quartoId, novaCama.getId());
            
            return quartoMapper.toDTO(quarto);
            
        } catch (BusinessRuleViolationException e) {
            log.warn("Erro de negócio ao adicionar cama ao quarto {}: {}", quartoId, e.getMessage());
            throw e;
            
        } catch (Exception e) {
            log.error("Erro inesperado ao adicionar cama ao quarto: {}", quartoId, e);
            throw new RuntimeException("Erro ao adicionar cama", e);
        }
    }

    /**
     * Remove uma cama do quarto
     * 
     * Decisão: Validação de capacidade mínima
     * - Garante que quarto existe
     * - Mantém pelo menos uma cama
     * - Atualiza capacidade do quarto
     * 
     * @param quartoId ID do quarto
     * @param camaId ID da cama a ser removida
     * @return QuartoDTO sem a cama removida
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public QuartoDTO removerCama(UUID quartoId, UUID camaId) {
        log.info("Removendo cama do quarto: QuartoID={}, CamaID={}", quartoId, camaId);
        
        try {
            Quarto quarto = buscarQuartoPorIdInternal(quartoId);
            
            // Busca cama
            Cama cama = camaRepository.findById(camaId)
                    .orElseThrow(() -> new BusinessRuleViolationException("Cama não encontrada"));
            
            // Verifica se a cama pertence ao quarto
            if (!cama.getQuarto().getId().equals(quartoId)) {
                throw new BusinessRuleViolationException("Cama não pertence ao quarto informado");
            }
            
            // Verifica se manterá pelo menos uma cama
            long totalCamas = camaRepository.countByQuartoId(quartoId);
            if (totalCamas <= 1) {
                throw new BusinessRuleViolationException("Quarto deve ter pelo menos uma cama");
            }
            
            // Remove cama
            camaRepository.delete(cama);
            
            // Atualiza capacidade do quarto
            Integer capacidadeRemovida = cama.getTipo() == TipoCama.SOLTEIRO ? 1 : 2;
            quarto.setCapacidade(Math.max(1, quarto.getCapacidade() - capacidadeRemovida));
            quartoRepository.save(quarto);
            
            log.info("Cama removida com sucesso: QuartoID={}, CamaID={}", quartoId, camaId);
            
            return quartoMapper.toDTO(quarto);
            
        } catch (BusinessRuleViolationException e) {
            log.warn("Erro de negócio ao remover cama do quarto {}: {}", quartoId, e.getMessage());
            throw e;
            
        } catch (Exception e) {
            log.error("Erro inesperado ao remover cama do quarto: {}", quartoId, e);
            throw new RuntimeException("Erro ao remover cama", e);
        }
    }

    // ========== MÉTODOS PRIVADOS ==========

    /**
     * Busca quarto por ID internamente
     * 
     * Decisão: Método privado para reutilização
     * - Centraliza lógica de busca
     * - Padroniza tratamento de exceção
     * - Facilita manutenção
     * 
     * @param id ID do quarto
     * @return Entidade Quarto
     * @throws QuartoNotFoundException se não encontrado
     */
    private Quarto buscarQuartoPorIdInternal(UUID id) {
        return quartoRepository.findById(id)
                .orElseThrow(() -> new QuartoNotFoundException("Quarto não encontrado: " + id));
    }

    /**
     * Valida regras específicas para criação de quarto
     * 
     * Decisão: Separação de validações por contexto
     * - Validações específicas para criação
     * - Facilita manutenção das regras
     * - Reutilização em outros contextos
     * 
     * @param requestDTO Dados do quarto a ser criado
     */
    private void validarCriacaoQuarto(QuartoRequestDTO requestDTO) {
        // Verifica duplicidade de número
        if (quartoRepository.existsByNumero(requestDTO.getNumero())) {
            throw new QuartoAlreadyExistsException(
                    "Já existe um quarto com o número: " + requestDTO.getNumero());
        }
        
        // Validações de negócio específicas
        if (requestDTO.getCapacidade() > 10) {
            throw new BusinessRuleViolationException("Capacidade máxima permitida é de 10 pessoas");
        }
        
        if (requestDTO.getPrecoPorNoite().compareTo(new BigDecimal("10000")) > 0) {
            throw new BusinessRuleViolationException("Preço máximo permitido é R$ 10.000,00");
        }
    }

    /**
     * Valida regras específicas para atualização de quarto
     * 
     * Decisão: Validações contextuais para atualização
     * - Permite mudanças específicas
     * - Preserva regras de integridade
     * - Facilita auditoria
     * 
     * @param quartoExistente Quarto existente
     * @param requestDTO Novos dados
     */
    private void validarAtualizacaoQuarto(Quarto quartoExistente, QuartoRequestDTO requestDTO) {
        // Se mudou o número, verifica duplicidade
        if (!quartoExistente.getNumero().equals(requestDTO.getNumero())) {
            if (quartoRepository.existsByNumero(requestDTO.getNumero())) {
                throw new QuartoAlreadyExistsException(
                        "Já existe um quarto com o número: " + requestDTO.getNumero());
            }
        }
    }

    /**
     * Atualiza campos do quarto com novos dados
     * 
     * Decisão: Método de atualização estruturado
     * - Atualização campo por campo
     * - Preserva campos não informados
     * - Facilita debugging
     * 
     * @param quarto Quarto a ser atualizado
     * @param requestDTO Novos dados
     */
    private void atualizarCamposQuarto(Quarto quarto, QuartoRequestDTO requestDTO) {
        quarto.setNumero(requestDTO.getNumero());
        quarto.setCapacidade(requestDTO.getCapacidade());
        quarto.setTipo(requestDTO.getTipo());
        quarto.setPrecoPorNoite(requestDTO.getPrecoPorNoite());
        quarto.setHasMinibar(requestDTO.isHasMinibar());
        quarto.setHasCafeDaManha(requestDTO.isHasCafeDaManha());
        quarto.setHasArCondicionado(requestDTO.isHasArCondicionado());
        quarto.setHasTV(requestDTO.isHasTV());
        
        // Status só é atualizado se informado explicitamente
        if (requestDTO.getStatus() != null) {
            quarto.setStatus(requestDTO.getStatus());
        }
    }

    /**
     * Valida transição de status do quarto
     * 
     * Decisão: Máquina de estados explícita
     * - Documenta fluxo permitido
     * - Previne transições inválidas
     * - Facilita auditoria
     * 
     * @param statusAtual Status atual
     * @param novoStatus Novo status
     */
    private void validarTransicaoStatus(StatusQuarto statusAtual, StatusQuarto novoStatus) {
        if (statusAtual == novoStatus) {
            return; // Mesmo status, não precisa validar
        }
        
        Map<StatusQuarto, List<StatusQuarto>> transicoesPermitidas = Map.of(
            StatusQuarto.DISPONIVEL, List.of(StatusQuarto.OCUPADO, StatusQuarto.MANUTENCAO, StatusQuarto.LIMPEZA),
            StatusQuarto.OCUPADO, List.of(StatusQuarto.LIMPEZA),
            StatusQuarto.LIMPEZA, List.of(StatusQuarto.DISPONIVEL, StatusQuarto.MANUTENCAO),
            StatusQuarto.MANUTENCAO, List.of(StatusQuarto.DISPONIVEL, StatusQuarto.LIMPEZA)
        );
        
        List<StatusQuarto> statusPermitidos = transicoesPermitidas.get(statusAtual);
        if (statusPermitidos == null || !statusPermitidos.contains(novoStatus)) {
            throw new InvalidQuartoStatusTransitionException(
                    String.format("Transição de status inválida: %s -> %s", statusAtual, novoStatus));
        }
    }

    /**
     * Verifica se quarto pode ser deletado
     * 
     * Decisão: Método de verificação de estado
     * - Prevenção de deleção indevida
     * - Preservação de integridade de dados
     * - Facilita auditoria
     * 
     * @param quarto Quarto a ser verificado
     * @return true se pode ser deletado
     */
    private boolean podeSerDeletado(Quarto quarto) {
        return quarto.getStatus() != StatusQuarto.OCUPADO;
    }

    /**
     * Verifica se quarto pode ser ocupado
     * 
     * Decisão: Método com regras de negócio específicas
     * - Centraliza validações complexas
     * - Facilita mudanças nas regras
     * - Documenta implicitamente o fluxo de negócio
     * 
     * @param quarto Quarto a ser verificado
     * @return true se pode ser ocupado
     */
    private boolean podeSerOcupado(Quarto quarto) {
        return quarto.getStatus() == StatusQuarto.DISPONIVEL && 
               quarto.getCapacidade() > 0 && 
               !quarto.getCamas().isEmpty();
    }
}
