package com.hotel.reservas.modules.quartos.service;

import com.hotel.reservas.modules.quartos.dto.QuartoRequest;
import com.hotel.reservas.modules.quartos.dto.QuartoResponse;
import com.hotel.reservas.modules.quartos.mapper.QuartoMapper;
import com.hotel.reservas.modules.quartos.model.Quarto;
import com.hotel.reservas.modules.quartos.repository.QuartoRepository;
import com.hotel.reservas.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service responsável pela orquestração de operações de Quarto.
 * 
 * Decisões de implementação:
 * - @RequiredArgsConstructor: Injeção via construtor (imutabilidade)
 * - @Transactional: Garante ACID nas operações de banco
 * - readOnly=true: Otimização para consultas (não cria snapshot)
 * - Delega validações para Validator (SRP)
 * - Delega mapeamento para Mapper (SRP)
 */
@Service
@RequiredArgsConstructor
public class QuartoService {

    private final QuartoRepository quartoRepository;
    private final QuartoValidator quartoValidator; // SRP: Validações isoladas
    private final QuartoMapper quartoMapper; // SRP: Mapeamento isolado

    /**
     * Cria um novo quarto.
     * 
     * Fluxo:
     * 1. Valida unicidade do número
     * 2. Converte DTO para entidade
     * 3. Persiste no banco
     * 4. Retorna DTO de resposta
     */
    @Transactional
    public QuartoResponse criar(QuartoRequest request) {
        quartoValidator.validarNumeroUnico(request.getNumero());
        
        Quarto quarto = quartoMapper.toEntity(request);
        Quarto salvo = quartoRepository.save(quarto);
        
        return quartoMapper.toResponse(salvo);
    }

    /**
     * Atualiza um quarto existente.
     * 
     * Fluxo:
     * 1. Busca quarto existente (lança exceção se não encontrado)
     * 2. Valida novo número (se alterado)
     * 3. Atualiza dados da entidade
     * 4. Persiste alterações
     */
    @Transactional
    public QuartoResponse atualizar(Long id, QuartoRequest request) {
        Quarto quarto = buscarQuartoPorId(id);
        
        quartoValidator.validarNumeroUnicoParaAtualizacao(quarto.getNumero(), request.getNumero());
        
        quartoMapper.updateEntity(request, quarto);
        Quarto atualizado = quartoRepository.save(quarto);
        
        return quartoMapper.toResponse(atualizado);
    }

    /**
     * Lista todos os quartos.
     * 
     * readOnly=true: Otimização - Hibernate não cria snapshot para dirty checking
     */
    @Transactional(readOnly = true)
    public List<QuartoResponse> listarTodos() {
        return quartoRepository.findAll().stream()
                .map(quartoMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public QuartoResponse buscarPorId(Long id) {
        Quarto quarto = buscarQuartoPorId(id);
        return quartoMapper.toResponse(quarto);
    }

    // Método privado reutilizável: DRY (Don't Repeat Yourself)
    private Quarto buscarQuartoPorId(Long id) {
        return quartoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quarto não encontrado com ID: " + id));
    }
}
