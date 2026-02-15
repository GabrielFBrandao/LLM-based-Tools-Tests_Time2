package com.hotel.reservas.modules.quartos.service;

import com.hotel.reservas.modules.quartos.repository.QuartoRepository;
import com.hotel.reservas.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Componente responsável por validações de regras de negócio de Quarto.
 * 
 * Decisões de implementação:
 * - SRP: Classe dedicada apenas a validações
 * - @Component: Bean gerenciado pelo Spring (injeção de dependência)
 * - Lança BusinessException: Exceção específica de domínio
 * - Métodos descritivos: Intentão clara do que está sendo validado
 */
@Component
@RequiredArgsConstructor
public class QuartoValidator {

    private final QuartoRepository quartoRepository;

    /**
     * Valida se o número do quarto já existe no banco.
     * Usado na criação de novos quartos.
     */
    public void validarNumeroUnico(String numero) {
        if (quartoRepository.existsByNumero(numero)) {
            throw new BusinessException("Quarto com número " + numero + " já existe");
        }
    }

    /**
     * Valida se o novo número do quarto já existe (exceto o próprio).
     * Usado na atualização de quartos existentes.
     */
    public void validarNumeroUnicoParaAtualizacao(String numeroAtual, String novoNumero) {
        if (!numeroAtual.equals(novoNumero) && quartoRepository.existsByNumero(novoNumero)) {
            throw new BusinessException("Quarto com número " + novoNumero + " já existe");
        }
    }
}
