package com.hotel.domain.valueobject;

import com.hotel.domain.enums.TipoCama;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

import java.util.Objects;

/**
 * Value Object que representa uma cama dentro de um quarto.
 *
 * DECISÃO: Modelar Cama como @Embeddable (não @Entity) é uma escolha
 * de Domain-Driven Design. Uma cama não tem identidade própria fora
 * do contexto do quarto — ela NÃO existe sem o quarto que a contém.
 *
 * Esta decisão simplifica o modelo de dados:
 * - Sem tabela separada 'camas' com FK para quartos
 * - JPA persiste a lista como @ElementCollection na tabela 'quarto_camas'
 * - Não há risco de camas órfãs no banco de dados
 *
 * IMUTABILIDADE: Value Objects são imutáveis por definição (DDD).
 * Não há setters — o estado é definido apenas no construtor.
 * Para "alterar" uma cama, remove-se e adiciona-se outra.
 *
 * EQUALS/HASHCODE baseado no tipo, pois dois objetos Cama com o mesmo
 * tipo representam o mesmo conceito de valor, independente da instância.
 */
@Embeddable
public class Cama {

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_cama", nullable = false)
    private TipoCama tipo;

    /**
     * Construtor padrão requerido pelo JPA.
     * DECISÃO: Visibilidade 'protected' para impedir instanciação
     * acidental fora do framework, sem expor o construtor público.
     */
    protected Cama() {}

    /**
     * Factory method estático — torna a criação expressiva.
     * Uso: Cama.de(TipoCama.CASAL_KING) em vez de new Cama(TipoCama.CASAL_KING)
     */
    public static Cama de(TipoCama tipo) {
        Objects.requireNonNull(tipo, "Tipo de cama não pode ser nulo");
        Cama cama = new Cama();
        cama.tipo = tipo;
        return cama;
    }

    public TipoCama getTipo() {
        return tipo;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Cama cama)) return false;
        return tipo == cama.tipo;
    }

    @Override
    public int hashCode() {
        return Objects.hash(tipo);
    }

    @Override
    public String toString() {
        return "Cama{tipo=" + tipo.getDescricao() + "}";
    }
}
