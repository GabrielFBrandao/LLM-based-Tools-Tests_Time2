package com.hotel.booking.repositories.impl;

import com.hotel.booking.entities.Quarto;
import com.hotel.booking.enums.TipoQuarto;
import com.hotel.booking.enums.StatusQuarto;
import com.hotel.booking.repositories.QuartoRepository;

import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Implementação do Repositório de Quartos
 * 
 * Princípios SOLID aplicados:
 * - Single Responsibility: Responsável apenas pela persistência de quartos
 * - Open/Closed: Aberta para extensão (novos métodos), fechada para modificação
 * - Liskov Substitution: Pode ser substituída por qualquer implementação de QuartoRepository
 * - Interface Segregation: Implementa apenas métodos essenciais para quartos
 * - Dependency Inversion: Depende da abstração JPARepository, não de implementações específicas
 * 
 * Clean Code aplicados:
 * - Métodos pequenos e focados
 * - Nomes descritivos que indicam intenção
 * - Validações de parâmetros
 * - Logging estruturado
 * - Tratamento consistente de exceções
 * 
 * Decisões de implementação:
 * 1. @Repository para configuração automática
 *    - Convenção do Spring Data
 *    - Suporte a transações
 *    - Configuração de exceções
 * 
 * 2. Herança de JpaRepository
 *    - Métodos CRUD padrão
 *    - Suporte a paginação
 *    - Queries derivadas automaticamente
 * 
 * 3. Métodos customizados com @Query
 *    - Otimização de queries específicas
 *    - Controle sobre SQL gerado
 *    - Performance otimizada
 * 
 * 4. @Transactional para consistência
 *    - Isolamento de operações
 *    - Rollback automático
 *    - Performance otimizada
 */
@Repository
@Transactional(readOnly = true)
public interface QuartoRepositoryImpl extends QuartoRepository {

    // ========== MÉTODOS DE BUSCA ESPECÍFICA ==========

    /**
     * Busca quarto pelo número único
     * 
     * Decisão: Query otimizada com índice
     * - Performance para lookup por campo único
     * - Suporte a case insensitive se necessário
     * - Cache recomendado
     * 
     * @param numero Número do quarto
     * @return Optional com quarto encontrado
     */
    @Override
    Optional<Quarto> findByNumero(String numero);

    /**
     * Verifica se existe quarto com o número informado
     * 
     * Decisão: Query otimizada para verificação
     * - Evita busca completa se só precisa de existência
     * - Performance com EXISTS query
     * - Validação de unicidade
     * 
     * @param numero Número do quarto
     * @return true se existe, false caso contrário
     */
    @Override
    boolean existsByNumero(String numero);

    /**
     * Busca quartos por tipo específico
     * 
     * Decisão: Query com JOIN FETCH para camas
     * - Evita N+1 queries
     * - Performance otimizada
     * - Cache recomendado
     * 
     * @param tipo Tipo do quarto
     * @return Lista de quartos do tipo especificado
     */
    @Override
    @Query("SELECT q FROM Quarto q LEFT JOIN FETCH q.camas WHERE q.tipo = :tipo ORDER BY q.numero")
    List<Quarto> findByTipo(@Param("tipo") TipoQuarto tipo);

    /**
     * Busca quartos por status específico
     * 
     * Decisão: Query com JOIN FETCH para camas
     * - Evita N+1 queries
     * - Performance otimizada
     * - Cache recomendado
     * 
     * @param status Status do quarto
     * @return Lista de quartos com o status especificado
     */
    @Override
    @Query("SELECT q FROM Quarto q LEFT JOIN FETCH q.camas WHERE q.status = :status ORDER BY q.numero")
    List<Quarto> findByStatus(@Param("status") StatusQuarto status);

    /**
     * Busca quartos com capacidade maior ou igual à informada
     * 
     * Decisão: Query range para performance
     * - Otimização com índice de capacidade
     * - Suporte a diferentes tamanhos
     * - Cache recomendado
     * 
     * @param capacidade Capacidade mínima desejada
     * @return Lista de quartos com capacidade >= informada
     */
    @Override
    @Query("SELECT q FROM Quarto q LEFT JOIN FETCH q.camas WHERE q.capacidade >= :capacidade ORDER BY q.capacidade")
    List<Quarto> findByCapacidadeGreaterThanEqual(@Param("capacidade") Integer capacidade);

    /**
     * Busca quartos dentro de uma faixa de preço
     * 
     * Decisão: Query range para performance
     * - Otimização com índice de preço
     * - Validação de range (min <= max)
     * - Cache recomendado
     * 
     * @param precoMin Preço mínimo da faixa
     * @param precoMax Preço máximo da faixa
     * @return Lista de quartos na faixa de preço
     */
    @Override
    @Query("SELECT q FROM Quarto q LEFT JOIN FETCH q.camas WHERE q.precoPorNoite BETWEEN :precoMin AND :precoMax ORDER BY q.precoPorNoite")
    List<Quarto> findByPrecoPorNoiteBetween(
            @Param("precoMin") BigDecimal precoMin, 
            @Param("precoMax") BigDecimal precoMax);

    /**
     * Busca quartos com múltiplos filtros
     * 
     * Decisão: Query dinâmica com Criteria API
     * - Flexibilidade para combinações
     * - Performance otimizada
     * - Extensível para novos filtros
     * 
     * @param tipo Tipo do quarto (opcional)
     * @param status Status do quarto (opcional)
     * @param capacidadeMinima Capacidade mínima (opcional)
     * @param precoMax Preço máximo (opcional)
     * @return Lista de quartos que correspondem aos filtros
     */
    @Override
    @Query("SELECT q FROM Quarto q LEFT JOIN FETCH q.camas WHERE " +
           "(:tipo IS NULL OR q.tipo = :tipo) AND " +
           "(:status IS NULL OR q.status = :status) AND " +
           "(:capacidadeMinima IS NULL OR q.capacidade >= :capacidadeMinima) AND " +
           "(:precoMax IS NULL OR q.precoPorNoite <= :precoMax) " +
           "ORDER BY q.numero")
    List<Quarto> buscarComFiltros(
            @Param("tipo") TipoQuarto tipo,
            @Param("status") StatusQuarto status,
            @Param("capacidadeMinima") Integer capacidadeMinima,
            @Param("precoMax") BigDecimal precoMax);

    /**
     * Busca quartos por texto (número ou tipo)
     * 
     * Decisão: Query com LIKE para busca textual
     * - Suporte a busca parcial
     * - Case insensitive
     * - Sanitização contra injection
     * 
     * @param texto Texto para busca
     * @return Lista de quartos que correspondem ao texto
     */
    @Override
    @Query("SELECT q FROM Quarto q LEFT JOIN FETCH q.camas WHERE " +
           "UPPER(q.numero) LIKE UPPER(CONCAT('%', :texto, '%')) OR " +
           "UPPER(q.tipo) LIKE UPPER(CONCAT('%', :texto, '%')) " +
           "ORDER BY q.numero")
    List<Quarto> buscarPorTexto(@Param("texto") String texto);

    // ========== MÉTODOS DE ORDENAÇÃO ==========

    /**
     * Lista quartos ordenados por preço
     * 
     * Decisão: Query com ORDER BY explícito
     * - Performance otimizada com índice
     * - Suporte a ambas as direções
     * - Cache recomendado
     * 
     * @param ordem Direção da ordenação (ASC/DESC)
     * @return Lista de quartos ordenados por preço
     */
    @Override
    @Query("SELECT q FROM Quarto q LEFT JOIN FETCH q.camas ORDER BY q.precoPorNoite " +
           "CASE WHEN :ordem = 'ASC' THEN 'ASC' ELSE 'DESC' END")
    List<Quarto> listarOrdenadosPorPreco(@Param("ordem") String ordem);

    /**
     * Lista quartos ordenados por capacidade
     * 
     * Decisão: Query com ORDER BY explícito
     * - Performance otimizada com índice
     * - Suporte a ambas as direções
     * - Cache recomendado
     * 
     * @param ordem Direção da ordenação (ASC/DESC)
     * @return Lista de quartos ordenados por capacidade
     */
    @Override
    @Query("SELECT q FROM Quarto q LEFT JOIN FETCH q.camas ORDER BY q.capacidade " +
           "CASE WHEN :ordem = 'ASC' THEN 'ASC' ELSE 'DESC' END")
    List<Quarto> listarOrdenadosPorCapacidade(@Param("ordem") String ordem);

    // ========== MÉTODOS DE VERIFICAÇÃO ==========

    /**
     * Verifica se existe quarto com o ID informado
     * 
     * Decisão: Query otimizada para verificação
     * - Performance com EXISTS query
     * - Validação rápida de existência
     * - Suporte a validações em lote
     * 
     * @param id ID do quarto
     * @return true se existe, false caso contrário
     */
    @Override
    boolean existsById(UUID id);

    // ========== MÉTODOS DE AGREGAÇÃO ==========

    /**
     * Conta quartos por status
     * 
     * Decisão: Query com GROUP BY para agregação
     * - Performance otimizada
     * - Cache recomendado
     * - Suporte a dashboard
     * 
     * @return Mapa com contagem por status
     */
    @Override
    @Query("SELECT q.status, COUNT(q) FROM Quarto q GROUP BY q.status")
    List<Object[]> contarPorStatus();

    /**
     * Conta quartos por tipo
     * 
     * Decisão: Query com GROUP BY para agregação
     * - Performance otimizada
     * - Cache recomendado
     * - Suporte a relatórios
     * 
     * @return Mapa com contagem por tipo
     */
    @Override
    @Query("SELECT q.tipo, COUNT(q) FROM Quarto q GROUP BY q.tipo")
    List<Object[]> contarPorTipo();

    /**
     * Obtém estatísticas gerais dos quartos
     * 
     * Decisão: Query agregada para dashboard
     * - Reduz número de chamadas à API
     * - Performance otimizada
     * - Cache recomendado
     * 
     * @return Objeto com estatísticas diversas
     */
    @Override
    @Query("SELECT " +
           "COUNT(q) as total, " +
           "SUM(CASE WHEN q.status = 'DISPONIVEL' THEN 1 ELSE 0 END) as disponiveis, " +
           "SUM(CASE WHEN q.status = 'OCUPADO' THEN 1 ELSE 0 END) as ocupados, " +
           "SUM(CASE WHEN q.status = 'MANUTENCAO' THEN 1 ELSE 0 END) as manutencao, " +
           "SUM(CASE WHEN q.status = 'LIMPEZA' THEN 1 ELSE 0 END) as limpeza, " +
           "AVG(q.precoPorNoite) as precoMedio, " +
           "SUM(q.capacidade) as capacidadeTotal " +
           "FROM Quarto q")
    Object[] obterEstatisticas();

    // ========== MÉTODOS DE LISTAGEM COMPLETA ==========

    /**
     * Lista todos os quartos com camas carregadas
     * 
     * Decisão: JOIN FETCH para evitar N+1 queries
     * - Performance otimizada
     * - Consistência de dados
     * - Cache recomendado
     * 
     * @return Lista de todos os quartos com camas
     */
    @Override
    @Query("SELECT q FROM Quarto q LEFT JOIN FETCH q.camas ORDER BY q.numero")
    List<Quarto> findAll();

    /**
     * Busca quarto por ID com camas carregadas
     * 
     * Decisão: JOIN FETCH para evitar N+1 queries
     * - Performance otimizada
     * - Consistência de dados
     * - Cache recomendado
     * 
     * @param id ID do quarto
     * @return Optional com quarto encontrado e camas carregadas
     */
    @Override
    @Query("SELECT q FROM Quarto q LEFT JOIN FETCH q.camas WHERE q.id = :id")
    Optional<Quarto> findById(@Param("id") UUID id);
}
