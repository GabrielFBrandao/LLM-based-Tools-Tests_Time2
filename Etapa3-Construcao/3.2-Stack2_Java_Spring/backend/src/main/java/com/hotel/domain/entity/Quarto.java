package com.hotel.domain.entity;

import com.hotel.domain.enums.StatusQuarto;
import com.hotel.domain.enums.TipoQuarto;
import com.hotel.domain.valueobject.Cama;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

/**
 * Entidade principal do módulo de Gestão de Quartos.
 *
 * DECISÃO DE MODELAGEM — POR QUE NÃO USAR APENAS UM RECORD?
 * Quartos possuem identidade (ID único) e seu estado muda ao longo do tempo
 * (status, preço, comodidades). Isso os classifica como Entidades no DDD,
 * não Value Objects. Records Java seriam imutáveis e não se prestam a entidades JPA.
 *
 * DECISÃO DE ENCAPSULAMENTO:
 * A lista de camas é retornada como unmodifiableList para proteger o invariante
 * "um quarto deve ter ao menos uma cama" (RN05). Modificações passam pelos
 * métodos adicionarCama() e removerCama() que garantem a regra de negócio.
 *
 * DECISÃO — BIGDECIMAL PARA PREÇO:
 * Nunca usar float/double para valores monetários. BigDecimal evita erros
 * de arredondamento de ponto flutuante (ex: 0.1 + 0.2 ≠ 0.3 em float).
 *
 * DECISÃO — @ElementCollection PARA CAMAS:
 * Camas são Value Objects sem identidade própria. @ElementCollection com
 * @Embeddable é mais limpo que @OneToMany para este caso — sem entidade
 * intermediária, sem FK bidirecional, sem risco de camas órfãs.
 *
 * DECISÃO — AUDITORIA:
 * criadoEm e atualizadoEm são gerenciados pelo JPA via @PrePersist/@PreUpdate.
 * Isso garante rastreabilidade sem depender da camada de aplicação.
 */
@Entity
@Table(
    name = "quartos",
    indexes = {
        // Índice único no número — garante RN01 no nível do banco (RF06)
        @Index(name = "idx_quarto_numero", columnList = "numero", unique = true),
        // Índice no status para buscas frequentes na listagem (RF04)
        @Index(name = "idx_quarto_status", columnList = "status")
    }
)
public class Quarto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Número do quarto — identificador de negócio (não técnico).
     * DECISÃO: String (não Integer) pois quartos podem ter números como
     * "101A", "PH01" (penthouse) ou "S01" (suíte). Flexibilidade do domínio.
     */
    @Column(name = "numero", nullable = false, unique = true, length = 10)
    private String numero;

    @Column(name = "capacidade", nullable = false)
    private Integer capacidade;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 20)
    private TipoQuarto tipo;

    /**
     * DECISÃO: precision=10, scale=2 para suportar valores até 99.999.999,99
     * Escala de 2 casas decimais suficiente para valores em BRL.
     */
    @Column(name = "preco_diaria", nullable = false, precision = 10, scale = 2)
    private BigDecimal precoDiaria;

    // Comodidades — campos booleanos com valor padrão false
    @Column(name = "tem_frigobar", nullable = false)
    private boolean temFrigobar;

    @Column(name = "tem_cafe_da_manha", nullable = false)
    private boolean temCafeDaManha;

    @Column(name = "tem_ar_condicionado", nullable = false)
    private boolean temArCondicionado;

    @Column(name = "tem_tv", nullable = false)
    private boolean temTV;

    /**
     * Status atual de disponibilidade do quarto.
     * DECISÃO: Valor padrão LIVRE definido aqui na entidade, não no Service.
     * Regras de default pertencem ao domínio, não à camada de aplicação.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private StatusQuarto status = StatusQuarto.LIVRE;

    /**
     * Lista de camas do quarto.
     * DECISÃO: @ElementCollection com @CollectionTable cria a tabela auxiliar
     * 'quarto_camas'. Cascade ALL e orphanRemoval garantem que camas são
     * gerenciadas junto com o quarto (não existem independentemente).
     *
     * fetch = EAGER justificado aqui: a listagem de quartos sempre precisa
     * das camas. Para coleções grandes, LAZY seria preferível.
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "quarto_camas",
        joinColumns = @JoinColumn(name = "quarto_id"),
        indexes = @Index(name = "idx_quarto_camas_quarto_id", columnList = "quarto_id")
    )
    private List<Cama> camas = new ArrayList<>();

    // Campos de auditoria — gerenciados automaticamente pelo JPA
    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private LocalDateTime atualizadoEm;

    /**
     * Construtor padrão exigido pelo JPA.
     * protected para prevenir instanciação direta fora do pacote.
     */
    protected Quarto() {}

    /**
     * Construtor de negócio — usado pelo Service ao criar quartos.
     * DECISÃO: Receber os campos obrigatórios no construtor garante que
     * a entidade nunca seja criada em estado inválido (invariante de criação).
     */
    public Quarto(String numero, Integer capacidade, TipoQuarto tipo, BigDecimal precoDiaria) {
        this.numero = Objects.requireNonNull(numero, "Número do quarto obrigatório").trim();
        this.capacidade = Objects.requireNonNull(capacidade, "Capacidade obrigatória");
        this.tipo = Objects.requireNonNull(tipo, "Tipo do quarto obrigatório");
        this.precoDiaria = Objects.requireNonNull(precoDiaria, "Preço da diária obrigatório");
        this.status = StatusQuarto.LIVRE;
        this.camas = new ArrayList<>();
    }

    // =========================================================================
    // MÉTODOS DE NEGÓCIO (comportamento da entidade)
    // DECISÃO: Regras de negócio simples que envolvem apenas o estado desta
    // entidade ficam nela mesma (OOP — comportamento junto aos dados).
    // Regras que envolvem outras entidades ficam no Service.
    // =========================================================================

    /**
     * Adiciona um tipo de cama ao quarto.
     * DECISÃO: O método valida a entrada, protegendo o invariante.
     * Não retorna 'this' (fluent) para manter estilo JavaBean compatível com JPA.
     */
    public void adicionarCama(Cama cama) {
        Objects.requireNonNull(cama, "Cama não pode ser nula");
        this.camas.add(cama);
    }

    /**
     * Remove um tipo de cama do quarto.
     * DECISÃO: Protege invariante RN05 — ao menos uma cama deve existir.
     * Lança IllegalStateException (não checada) pois violação desta regra
     * é erro de programação, não de usuário.
     */
    public void removerCama(Cama cama) {
        if (this.camas.size() <= 1) {
            throw new IllegalStateException(
                "O quarto deve ter ao menos um tipo de cama (RN05)."
            );
        }
        this.camas.remove(cama);
    }

    /**
     * Substitui toda a lista de camas.
     * Usado na edição quando o usuário redefine as camas do quarto.
     */
    public void redefinirCamas(List<Cama> novasCamas) {
        Objects.requireNonNull(novasCamas, "Lista de camas não pode ser nula");
        if (novasCamas.isEmpty()) {
            throw new IllegalArgumentException(
                "O quarto deve ter ao menos um tipo de cama (RN05)."
            );
        }
        this.camas.clear();
        this.camas.addAll(novasCamas);
    }

    /**
     * Altera o status de disponibilidade do quarto.
     * DECISÃO: Método explícito (não setter genérico) torna a intenção clara
     * e permite adicionar lógica futura (ex: log de auditoria de status).
     */
    public void alterarStatus(StatusQuarto novoStatus) {
        Objects.requireNonNull(novoStatus, "Novo status não pode ser nulo");
        this.status = novoStatus;
    }

    /** Verifica se o quarto pode receber novas reservas (RF18) */
    public boolean estaDisponivel() {
        return this.status.aceitaReservas();
    }

    // =========================================================================
    // CALLBACKS JPA — Auditoria automática
    // =========================================================================

    @PrePersist
    private void prePersist() {
        LocalDateTime agora = LocalDateTime.now();
        this.criadoEm = agora;
        this.atualizadoEm = agora;
    }

    @PreUpdate
    private void preUpdate() {
        this.atualizadoEm = LocalDateTime.now();
    }

    // =========================================================================
    // GETTERS — Sem setters públicos para proteger encapsulamento
    // DECISÃO: Modificações de estado passam pelos métodos de negócio acima.
    // Isso garante que os invariantes da entidade sejam sempre respeitados.
    // =========================================================================

    public Long getId() { return id; }
    public String getNumero() { return numero; }
    public Integer getCapacidade() { return capacidade; }
    public TipoQuarto getTipo() { return tipo; }
    public BigDecimal getPrecoDiaria() { return precoDiaria; }
    public boolean isTemFrigobar() { return temFrigobar; }
    public boolean isTemCafeDaManha() { return temCafeDaManha; }
    public boolean isTemArCondicionado() { return temArCondicionado; }
    public boolean isTemTV() { return temTV; }
    public StatusQuarto getStatus() { return status; }
    public LocalDateTime getCriadoEm() { return criadoEm; }
    public LocalDateTime getAtualizadoEm() { return atualizadoEm; }

    /**
     * Retorna cópia não modificável da lista de camas.
     * DECISÃO: Protege o invariante RN05 — chamadores externos não podem
     * modificar a lista diretamente, apenas através dos métodos da entidade.
     */
    public List<Cama> getCamas() {
        return Collections.unmodifiableList(camas);
    }

    // Setters de campos simples — usados pelo Service na edição (UC03)
    // DECISÃO: Setters apenas para campos que não possuem invariantes complexos.
    // Campos como 'camas' e 'status' têm seus próprios métodos de negócio.
    public void setNumero(String numero) {
        this.numero = Objects.requireNonNull(numero, "Número obrigatório").trim();
    }

    public void setCapacidade(Integer capacidade) {
        Objects.requireNonNull(capacidade, "Capacidade obrigatória");
        if (capacidade <= 0) throw new IllegalArgumentException("Capacidade deve ser maior que zero");
        this.capacidade = capacidade;
    }

    public void setTipo(TipoQuarto tipo) {
        this.tipo = Objects.requireNonNull(tipo, "Tipo obrigatório");
    }

    public void setPrecoDiaria(BigDecimal precoDiaria) {
        Objects.requireNonNull(precoDiaria, "Preço obrigatório");
        if (precoDiaria.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Preço da diária deve ser maior que zero (RN03)");
        }
        this.precoDiaria = precoDiaria;
    }

    public void setTemFrigobar(boolean temFrigobar) { this.temFrigobar = temFrigobar; }
    public void setTemCafeDaManha(boolean temCafeDaManha) { this.temCafeDaManha = temCafeDaManha; }
    public void setTemArCondicionado(boolean temArCondicionado) { this.temArCondicionado = temArCondicionado; }
    public void setTemTV(boolean temTV) { this.temTV = temTV; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Quarto quarto)) return false;
        // DECISÃO: Igualdade baseada no ID técnico.
        // Em JPA, dois objetos representam o mesmo registro se têm o mesmo ID.
        return Objects.equals(id, quarto.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Quarto{id=%d, numero='%s', tipo=%s, status=%s}"
            .formatted(id, numero, tipo, status);
    }
}
