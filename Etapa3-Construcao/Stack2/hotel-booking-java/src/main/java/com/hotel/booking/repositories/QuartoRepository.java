package com.hotel.booking.repositories;

import com.hotel.booking.entities.Quarto;
import com.hotel.booking.enums.StatusQuarto;
import com.hotel.booking.enums.TipoQuarto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuartoRepository extends JpaRepository<Quarto, java.util.UUID> {

    /**
     * Busca quarto pelo número
     */
    Optional<Quarto> findByNumero(String numero);

    /**
     * Verifica se existe quarto com o número informado
     */
    boolean existsByNumero(String numero);

    /**
     * Verifica se existe quarto com o número informado, ignorando um ID específico
     */
    boolean existsByNumeroAndIdNot(String numero, java.util.UUID id);

    /**
     * Busca quartos por tipo
     */
    List<Quarto> findByTipo(TipoQuarto tipo);

    /**
     * Busca quartos por status
     */
    List<Quarto> findByStatus(StatusQuarto status);

    /**
     * Busca quartos disponíveis
     */
    List<Quarto> findByStatus(StatusQuarto status);

    /**
     * Busca quartos por capacidade mínima
     */
    List<Quarto> findByCapacidadeGreaterThanEqual(Integer capacidade);

    /**
     * Busca quartos por faixa de preço
     */
    @Query("SELECT q FROM Quarto q WHERE q.precoPorNoite BETWEEN :precoMin AND :precoMax")
    List<Quarto> findByPrecoRange(@Param("precoMin") java.math.BigDecimal precoMin, 
                                  @Param("precoMax") java.math.BigDecimal precoMax);

    /**
     * Busca quartos que possuem comodidades específicas
     */
    @Query("SELECT q FROM Quarto q WHERE q.hasMinibar = :hasMinibar AND q.hasCafeDaManha = :hasCafeDaManha")
    List<Quarto> findByComodidades(@Param("hasMinibar") boolean hasMinibar, 
                                   @Param("hasCafeDaManha") boolean hasCafeDaManha);

    /**
     * Busca quartos disponíveis para um período específico
     */
    @Query("SELECT q FROM Quarto q WHERE q.status = :status AND q.id NOT IN " +
           "(SELECT r.quarto.id FROM Reserva r WHERE r.status IN ('CONFIRMADA', 'CHECK_IN') AND " +
           "((r.periodo.checkIn <= :checkOut AND r.periodo.checkOut >= :checkIn)))")
    List<Quarto> findQuartosDisponiveisNoPeriodo(@Param("status") StatusQuarto status,
                                                 @Param("checkIn") java.time.LocalDate checkIn,
                                                 @Param("checkOut") java.time.LocalDate checkOut);

    /**
     * Conta quartos por status
     */
    @Query("SELECT q.status, COUNT(q) FROM Quarto q GROUP BY q.status")
    List<Object[]> countQuartosPorStatus();

    /**
     * Busca quartos com múltiplos filtros
     */
    @Query("SELECT q FROM Quarto q WHERE " +
           "(:tipo IS NULL OR q.tipo = :tipo) AND " +
           "(:status IS NULL OR q.status = :status) AND " +
           "(:capacidadeMinima IS NULL OR q.capacidade >= :capacidadeMinima) AND " +
           "(:precoMax IS NULL OR q.precoPorNoite <= :precoMax)")
    List<Quarto> buscarComFiltros(@Param("tipo") TipoQuarto tipo,
                                  @Param("status") StatusQuarto status,
                                  @Param("capacidadeMinima") Integer capacidadeMinima,
                                  @Param("precoMax") java.math.BigDecimal precoMax);

    /**
     * Busca quartos ordenados por preço
     */
    List<Quarto> findByOrderByPrecoPorNoiteAsc();

    /**
     * Busca quartos ordenados por capacidade
     */
    List<Quarto> findByOrderByCapacidadeDesc();

    /**
     * Busca quartos por número contendo texto
     */
    List<Quarto> findByNumeroContainingIgnoreCase(String numero);

    /**
     * Verifica se quarto está disponível para reserva
     */
    @Query("SELECT CASE WHEN COUNT(r) = 0 THEN true ELSE false END FROM Reserva r " +
           "WHERE r.quarto.id = :quartoId AND r.status IN ('CONFIRMADA', 'CHECK_IN') AND " +
           "((r.periodo.checkIn <= :checkOut AND r.periodo.checkOut >= :checkIn))")
    boolean isQuartoDisponivel(@Param("quartoId") java.util.UUID quartoId,
                               @Param("checkIn") java.time.LocalDate checkIn,
                               @Param("checkOut") java.time.LocalDate checkOut);
}
