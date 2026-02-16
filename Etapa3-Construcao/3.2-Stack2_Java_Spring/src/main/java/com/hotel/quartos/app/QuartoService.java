package com.hotel.quartos.app;

import com.hotel.quartos.app.dto.*;
import com.hotel.quartos.domain.CamaQuarto;
import com.hotel.quartos.domain.Quarto;
import com.hotel.quartos.domain.TipoCama;
import com.hotel.quartos.infra.QuartoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

// Serviço de aplicação (Use Case) para orquestrar regras e persistência.
// Aplica SRP (cada método tem propósito claro) e DIP (depende da interface do repositório JPA).
@Service
public class QuartoService {

    private final QuartoRepository repo;

    public QuartoService(QuartoRepository repo) {
        this.repo = repo;
    }

    @Transactional
    public Quarto cadastrar(QuartoInputDTO dto) {
        repo.findByNumero(dto.numero()).ifPresent(q -> { throw new IllegalArgumentException("Número de quarto já existe"); });

        Quarto q = Quarto.builder()
                .numero(dto.numero())
                .capacidade(dto.capacidade())
                .tipo(dto.tipo())
                .precoHora(dto.precoHora())
                .frigobar(dto.frigobar())
                .cafeManha(dto.cafeManha())
                .arCondicionado(dto.arCondicionado())
                .tv(dto.tv())
                .build();
        q.definirCamas(dto.camas());
        return repo.save(q);
    }

    @Transactional
    public Quarto editar(String id, QuartoUpdateDTO dto) {
        Quarto q = repo.findById(id).orElseThrow(() -> new NoSuchElementException("Quarto não encontrado"));
        q.atualizarDados(dto.capacidade(), dto.tipo(), dto.precoHora(), dto.frigobar(), dto.cafeManha(), dto.arCondicionado(), dto.tv());
        if (dto.camas() != null) {
            // Garante domínio fechado de tipos
            dto.camas().forEach(c -> TipoCama.valueOf(c.name()));
            q.definirCamas(dto.camas());
        }
        return repo.save(q);
    }

    @Transactional(readOnly = true)
    public List<QuartoListaDTO> listar() {
        return repo.findAll().stream()
                .filter(Quarto::isAtivo)
                .map(q -> new QuartoListaDTO(q.getId(), q.getNumero(), q.getTipo(), q.getPrecoHora(), q.getDisponibilidade()))
                .toList();
    }
}
