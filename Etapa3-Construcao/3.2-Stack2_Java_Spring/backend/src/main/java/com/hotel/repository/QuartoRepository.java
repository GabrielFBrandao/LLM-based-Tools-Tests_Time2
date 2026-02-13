package com.hotel.repository;

import com.hotel.domain.entity.Quarto;
import com.hotel.domain.enums.StatusQuarto;
import com.hotel.domain.enums.TipoQuarto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositório JPA para a entidade Quarto.
 *
 * DECISÃO — SPRING DATA JPA:
 * Extendendo JpaRepository<Quarto, Long> herdamos automaticamente:
 * - save(), findById(), findAll(), delete() e outros 20+ métodos
 * - Paginação via Pageable
 * - Queries derivadas por convenção de nome de método
 *
 * Isso implementa o padrão Repository (ADR-005) sem boilerplate.
 * Em termos de SOLID: QuartoService depende desta interface (DIP),
 * e o Spring injeta a implementação concreta em runtime.
 *
 * DECISÃO — QUERY JPQL vs NATIVE:
 * Preferimos JPQL (linguagem orientada a objetos) sobre SQL nativo.
 * JPQL é portável entre bancos (H2 para testes, PostgreSQL em produção)
 * e trabalha com entidades, não com tabelas diretamente.
 *
 * DECISÃO — JOIN FETCH:
 * A query de listagem usa JOIN FETCH para camas para evitar o problema N+1:
 * sem JOIN FETCH, o JPA faria 1 query para quartos + N queries para camas de
 * cada quarto. Com JOIN FETCH, tudo vem em uma única query.
 */
@Repository
public interface QuartoRepository extends JpaRepository<Quarto, Long> {

    /**
     * Verifica existência de quarto com número específico (RF06 — RN01).
     * Usado pelo Service antes de cadastrar para garantir unicidade.
     */
    boolean existsByNumero(String numero);

    /**
     * Busca quarto por número, excluindo um ID específico.
     * DECISÃO: Necessário na edição para verificar unicidade do número
     * sem considerar o próprio quarto sendo editado (UC03 — FA01).
     */
    @Query("SELECT COUNT(q) > 0 FROM Quarto q WHERE q.numero = :numero AND q.id <> :id")
    boolean existsByNumeroAndIdNot(@Param("numero") String numero, @Param("id") Long id);

    /**
     * Listagem de todos os quartos com camas carregadas em uma única query.
     * JOIN FETCH resolve o problema N+1 para a coleção de camas (RF04).
     * ORDER BY garante ordenação por número crescente (RN07).
     */
    @Query("SELECT DISTINCT q FROM Quarto q LEFT JOIN FETCH q.camas ORDER BY q.numero")
    List<Quarto> findAllWithCamas();

    /**
     * Busca quartos disponíveis para reserva (RF18 — apenas LIVRE).
     * Usado no formulário de criação de reserva (UC07).
     */
    @Query("SELECT DISTINCT q FROM Quarto q LEFT JOIN FETCH q.camas " +
           "WHERE q.status = :status ORDER BY q.numero")
    List<Quarto> findByStatusWithCamas(@Param("status") StatusQuarto status);

    /**
     * Busca filtrada para listagem com critérios opcionais.
     * DECISÃO: COALESCE emula parâmetros opcionais em JPQL.
     * Quando o parâmetro é null, a condição é ignorada.
     *
     * Alternativa considerada: Specification Pattern (JPA Criteria API).
     * Rejeitada para este caso por complexidade desnecessária dado
     * o número limitado de filtros.
     */
    @Query("SELECT DISTINCT q FROM Quarto q LEFT JOIN FETCH q.camas " +
           "WHERE (:status IS NULL OR q.status = :status) " +
           "AND (:tipo IS NULL OR q.tipo = :tipo) " +
           "ORDER BY q.numero")
    List<Quarto> findByFiltros(
        @Param("status") StatusQuarto status,
        @Param("tipo") TipoQuarto tipo
    );

    /**
     * Verifica se existe reserva ativa para o quarto (para lógica de negócio).
     * DECISÃO: Query no QuartoRepository, não no ReservaRepository, porque
     * é usada como pré-condição de operações sobre quartos (coesão).
     */
    @Query("SELECT COUNT(r) > 0 FROM Reserva r " +
           "WHERE r.quarto.id = :quartoId AND r.ativa = true")
    boolean temReservaAtiva(@Param("quartoId") Long quartoId);
}
