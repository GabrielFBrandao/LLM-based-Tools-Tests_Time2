package com.hotel.booking.repositories;

import com.hotel.booking.entities.Cama;
import com.hotel.booking.enums.TipoCama;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CamaRepository extends JpaRepository<Cama, UUID> {

    /**
     * Busca camas pelo ID do quarto
     */
    List<Cama> findByQuartoId(UUID quartoId);

    /**
     * Conta camas de um quarto por tipo
     */
    @Query("SELECT c.tipo, COUNT(c) FROM Cama c WHERE c.quarto.id = :quartoId GROUP BY c.tipo")
    List<Object[]> countCamasPorTipo(@Param("quartoId") UUID quartoId);

    /**
     * Verifica se quarto possui camas de tipo específico
     */
    boolean existsByQuartoIdAndTipo(UUID quartoId, TipoCama tipo);

    /**
     * Busca camas por tipo em todos os quartos
     */
    List<Cama> findByTipo(TipoCama tipo);

    /**
     * Conta total de camas por tipo em todo o hotel
     */
    @Query("SELECT c.tipo, COUNT(c) FROM Cama c GROUP BY c.tipo")
    List<Object[]> countTotalCamasPorTipo();

    /**
     * Calcula capacidade total de um quarto baseado nas camas
     */
    @Query("SELECT SUM(CASE WHEN c.tipo = 'SOLTEIRO' THEN 1 ELSE 2 END) FROM Cama c WHERE c.quarto.id = :quartoId")
    Integer calcularCapacidadeTotal(@Param("quartoId") UUID quartoId);

    /**
     * Deleta todas as camas de um quarto
     */
    void deleteByQuartoId(UUID quartoId);

    /**
     * Verifica se quarto possui apenas camas de um tipo específico
     */
    @Query("SELECT CASE WHEN COUNT(DISTINCT c.tipo) = 1 THEN true ELSE false END FROM Cama c WHERE c.quarto.id = :quartoId")
    boolean possuiApenasUmTipoDeCama(@Param("quartoId") UUID quartoId);

    /**
     * Busca quartos que possuem camas de tipo específico
     */
    @Query("SELECT DISTINCT c.quarto FROM Cama c WHERE c.tipo = :tipo")
    List<com.hotel.booking.entities.Quarto> findQuartosComCamaTipo(@Param("tipo") TipoCama tipo);

    /**
     * Conta camas de um quarto
     */
    long countByQuartoId(UUID quartoId);
}
