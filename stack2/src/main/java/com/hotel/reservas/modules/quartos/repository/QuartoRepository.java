package com.hotel.reservas.modules.quartos.repository;

import com.hotel.reservas.modules.quartos.model.Quarto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QuartoRepository extends JpaRepository<Quarto, Long> {
    
    Optional<Quarto> findByNumero(String numero);
    
    boolean existsByNumero(String numero);
}
