package com.hotel.reservas.modules.quartos.service;

import com.hotel.reservas.modules.quartos.dto.QuartoRequest;
import com.hotel.reservas.modules.quartos.dto.QuartoResponse;
import com.hotel.reservas.modules.quartos.model.Cama;
import com.hotel.reservas.modules.quartos.model.Quarto;
import com.hotel.reservas.modules.quartos.repository.QuartoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuartoService {

    private final QuartoRepository quartoRepository;

    @Transactional
    public QuartoResponse criar(QuartoRequest request) {
        if (quartoRepository.existsByNumero(request.getNumero())) {
            throw new IllegalArgumentException("Quarto com número " + request.getNumero() + " já existe");
        }

        Quarto quarto = new Quarto();
        mapearParaEntidade(request, quarto);

        Quarto salvo = quartoRepository.save(quarto);
        return mapearParaResponse(salvo);
    }

    @Transactional
    public QuartoResponse atualizar(Long id, QuartoRequest request) {
        Quarto quarto = quartoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Quarto não encontrado"));

        if (!quarto.getNumero().equals(request.getNumero()) && 
            quartoRepository.existsByNumero(request.getNumero())) {
            throw new IllegalArgumentException("Quarto com número " + request.getNumero() + " já existe");
        }

        quarto.getCamas().clear();
        mapearParaEntidade(request, quarto);

        Quarto atualizado = quartoRepository.save(quarto);
        return mapearParaResponse(atualizado);
    }

    @Transactional(readOnly = true)
    public List<QuartoResponse> listarTodos() {
        return quartoRepository.findAll().stream()
                .map(this::mapearParaResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public QuartoResponse buscarPorId(Long id) {
        Quarto quarto = quartoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Quarto não encontrado"));
        return mapearParaResponse(quarto);
    }

    private void mapearParaEntidade(QuartoRequest request, Quarto quarto) {
        quarto.setNumero(request.getNumero());
        quarto.setCapacidade(request.getCapacidade());
        quarto.setTipo(request.getTipo());
        quarto.setPrecoDiaria(request.getPrecoDiaria());
        quarto.setTemFrigobar(request.getTemFrigobar());
        quarto.setTemCafe(request.getTemCafe());
        quarto.setTemAr(request.getTemAr());
        quarto.setTemTv(request.getTemTv());
        quarto.setStatus(request.getStatus());

        if (request.getTiposCamas() != null) {
            request.getTiposCamas().forEach(tipoCama -> {
                Cama cama = new Cama();
                cama.setTipoCama(tipoCama);
                cama.setQuarto(quarto);
                quarto.getCamas().add(cama);
            });
        }
    }

    private QuartoResponse mapearParaResponse(Quarto quarto) {
        QuartoResponse response = new QuartoResponse();
        response.setId(quarto.getId());
        response.setNumero(quarto.getNumero());
        response.setCapacidade(quarto.getCapacidade());
        response.setTipo(quarto.getTipo());
        response.setPrecoDiaria(quarto.getPrecoDiaria());
        response.setTemFrigobar(quarto.getTemFrigobar());
        response.setTemCafe(quarto.getTemCafe());
        response.setTemAr(quarto.getTemAr());
        response.setTemTv(quarto.getTemTv());
        response.setStatus(quarto.getStatus());
        response.setTiposCamas(quarto.getCamas().stream()
                .map(Cama::getTipoCama)
                .collect(Collectors.toList()));
        return response;
    }
}
