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

@Service
@RequiredArgsConstructor
public class QuartoService {

    private final QuartoRepository quartoRepository;
    private final QuartoValidator quartoValidator;
    private final QuartoMapper quartoMapper;

    @Transactional
    public QuartoResponse criar(QuartoRequest request) {
        quartoValidator.validarNumeroUnico(request.getNumero());
        
        Quarto quarto = quartoMapper.toEntity(request);
        Quarto salvo = quartoRepository.save(quarto);
        
        return quartoMapper.toResponse(salvo);
    }

    @Transactional
    public QuartoResponse atualizar(Long id, QuartoRequest request) {
        Quarto quarto = buscarQuartoPorId(id);
        
        quartoValidator.validarNumeroUnicoParaAtualizacao(quarto.getNumero(), request.getNumero());
        
        quartoMapper.updateEntity(request, quarto);
        Quarto atualizado = quartoRepository.save(quarto);
        
        return quartoMapper.toResponse(atualizado);
    }

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

    private Quarto buscarQuartoPorId(Long id) {
        return quartoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quarto não encontrado com ID: " + id));
    }
}
