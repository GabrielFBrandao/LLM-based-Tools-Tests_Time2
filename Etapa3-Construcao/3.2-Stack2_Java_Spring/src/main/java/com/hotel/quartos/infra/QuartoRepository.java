package com.hotel.quartos.infra;

import com.hotel.quartos.domain.Quarto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface QuartoRepository extends JpaRepository<Quarto, String> {
    Optional<Quarto> findByNumero(Integer numero);
}
