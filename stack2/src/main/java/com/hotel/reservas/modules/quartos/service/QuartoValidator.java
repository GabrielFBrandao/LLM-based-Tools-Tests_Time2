package com.hotel.reservas.modules.quartos.service;

import com.hotel.reservas.modules.quartos.repository.QuartoRepository;
import com.hotel.reservas.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class QuartoValidator {

    private final QuartoRepository quartoRepository;

    public void validarNumeroUnico(String numero) {
        if (quartoRepository.existsByNumero(numero)) {
            throw new BusinessException("Quarto com número " + numero + " já existe");
        }
    }

    public void validarNumeroUnicoParaAtualizacao(String numeroAtual, String novoNumero) {
        if (!numeroAtual.equals(novoNumero) && quartoRepository.existsByNumero(novoNumero)) {
            throw new BusinessException("Quarto com número " + novoNumero + " já existe");
        }
    }
}
