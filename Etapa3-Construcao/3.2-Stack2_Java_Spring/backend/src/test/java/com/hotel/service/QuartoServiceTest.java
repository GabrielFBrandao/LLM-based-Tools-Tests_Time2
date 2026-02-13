package com.hotel.service;

import com.hotel.domain.entity.Quarto;
import com.hotel.domain.enums.StatusQuarto;
import com.hotel.domain.enums.TipoCama;
import com.hotel.domain.enums.TipoQuarto;
import com.hotel.dto.request.QuartoRequest;
import com.hotel.dto.response.QuartoResponse;
import com.hotel.exception.HotelExceptions.QuartoInvalidoException;
import com.hotel.exception.HotelExceptions.QuartoNaoEncontradoException;
import com.hotel.mapper.QuartoMapper;
import com.hotel.repository.QuartoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Testes unitários para QuartoService.
 *
 * DECISÃO — ESTRATÉGIA DE TESTES:
 * Testes unitários do Service isolam a lógica de negócio usando Mockito
 * para simular (mock) o Repository e o Mapper. Isso garante que:
 * 1. Testes rodam sem banco de dados (rápidos, determinísticos)
 * 2. Falhas de infraestrutura não mascararam bugs de negócio
 * 3. Cada teste foca em um único comportamento (Arrange-Act-Assert)
 *
 * DECISÃO — @Nested CLASSES:
 * Agrupa testes por operação para melhor organização e legibilidade.
 * O relatório de testes fica hierárquico e fácil de navegar.
 *
 * DECISÃO — ASSERTJ vs JUnit Assertions:
 * AssertJ tem API fluente mais expressiva: assertThat(x).isEqualTo(y)
 * vs assertEquals(y, x). Mensagens de falha também são mais claras.
 *
 * DECISÃO — @DisplayName:
 * Nomes descritivos em português tornam os relatórios de CI legíveis
 * para toda a equipe, incluindo não-desenvolvedores.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("QuartoService — Testes Unitários")
class QuartoServiceTest {

    @Mock
    private QuartoRepository quartoRepository;

    @Mock
    private QuartoMapper quartoMapper;

    @InjectMocks
    private QuartoService quartoService;

    // =========================================================================
    // CADASTRAR QUARTO
    // =========================================================================

    @Nested
    @DisplayName("cadastrarQuarto()")
    class CadastrarQuarto {

        private QuartoRequest.Criar dtoCriar;

        @BeforeEach
        void setup() {
            dtoCriar = new QuartoRequest.Criar(
                "101",
                2,
                TipoQuarto.MODERNO,
                BigDecimal.valueOf(250.00),
                true,   // frigobar
                false,  // cafeManha
                true,   // arCondicionado
                true,   // tv
                List.of(TipoCama.CASAL_QUEEN)
            );
        }

        @Test
        @DisplayName("Deve cadastrar quarto com sucesso quando número é único")
        void deveCadastrarQuartoComSucesso() {
            // ARRANGE
            when(quartoRepository.existsByNumero("101")).thenReturn(false);
            Quarto quartoSalvo = new Quarto("101", 2, TipoQuarto.MODERNO, BigDecimal.valueOf(250.00));
            when(quartoRepository.save(any(Quarto.class))).thenReturn(quartoSalvo);
            QuartoResponse.Detalhe detalheEsperado = criarDetalheStub("101");
            when(quartoMapper.toDetalhe(quartoSalvo)).thenReturn(detalheEsperado);

            // ACT
            QuartoResponse.Detalhe resultado = quartoService.cadastrarQuarto(dtoCriar);

            // ASSERT
            assertThat(resultado).isNotNull();
            assertThat(resultado.numero()).isEqualTo("101");
            verify(quartoRepository).save(any(Quarto.class));
            verify(quartoRepository).existsByNumero("101");
        }

        @Test
        @DisplayName("Deve lançar QuartoInvalidoException quando número já existe (RN01)")
        void deveLancarExcecaoQuandoNumeroJaExiste() {
            // ARRANGE
            when(quartoRepository.existsByNumero("101")).thenReturn(true);

            // ACT + ASSERT
            assertThatThrownBy(() -> quartoService.cadastrarQuarto(dtoCriar))
                .isInstanceOf(QuartoInvalidoException.class)
                .hasMessageContaining("101")
                .hasMessageContaining("RN01");

            // Verifica que save NUNCA foi chamado (quarto não foi persistido)
            verify(quartoRepository, never()).save(any());
        }

        @Test
        @DisplayName("Deve salvar quarto com status LIVRE por padrão")
        void deveSalvarQuartoComStatusLivreInicial() {
            // ARRANGE
            when(quartoRepository.existsByNumero(anyString())).thenReturn(false);
            when(quartoRepository.save(any(Quarto.class))).thenAnswer(inv -> inv.getArgument(0));
            when(quartoMapper.toDetalhe(any())).thenReturn(criarDetalheStub("101"));

            // ACT
            quartoService.cadastrarQuarto(dtoCriar);

            // ASSERT — Captura o quarto passado ao save e verifica o status
            verify(quartoRepository).save(argThat(quarto ->
                quarto.getStatus() == StatusQuarto.LIVRE
            ));
        }
    }

    // =========================================================================
    // EDITAR QUARTO
    // =========================================================================

    @Nested
    @DisplayName("editarQuarto()")
    class EditarQuarto {

        @Test
        @DisplayName("Deve editar quarto com sucesso")
        void deveEditarQuartoComSucesso() {
            // ARRANGE
            Long id = 1L;
            Quarto quartoExistente = new Quarto("101", 2, TipoQuarto.BASICO, BigDecimal.valueOf(150.00));
            QuartoRequest.Editar dtoEditar = new QuartoRequest.Editar(
                null, null, TipoQuarto.MODERNO, BigDecimal.valueOf(200.00),
                null, null, null, null, null
            );

            when(quartoRepository.findById(id)).thenReturn(Optional.of(quartoExistente));
            when(quartoRepository.save(any())).thenReturn(quartoExistente);
            when(quartoMapper.toDetalhe(any())).thenReturn(criarDetalheStub("101"));

            // ACT
            QuartoResponse.Detalhe resultado = quartoService.editarQuarto(id, dtoEditar);

            // ASSERT
            assertThat(resultado).isNotNull();
            verify(quartoRepository).save(argThat(q -> q.getTipo() == TipoQuarto.MODERNO));
        }

        @Test
        @DisplayName("Deve lançar QuartoNaoEncontradoException quando ID não existe")
        void deveLancarExcecaoQuandoIdNaoExiste() {
            // ARRANGE
            when(quartoRepository.findById(99L)).thenReturn(Optional.empty());

            // ACT + ASSERT
            assertThatThrownBy(() ->
                quartoService.editarQuarto(99L, new QuartoRequest.Editar(
                    null, null, null, null, null, null, null, null, null
                ))
            )
                .isInstanceOf(QuartoNaoEncontradoException.class)
                .hasMessageContaining("99");
        }

        @Test
        @DisplayName("Deve lançar exceção ao tentar mudar número para um já existente (RN01)")
        void deveLancarExcecaoNumeroJaUsadoPorOutroQuarto() {
            // ARRANGE
            Long id = 1L;
            Quarto quartoExistente = new Quarto("101", 2, TipoQuarto.BASICO, BigDecimal.valueOf(150.00));
            QuartoRequest.Editar dtoComNumeroConflitante = new QuartoRequest.Editar(
                "102", null, null, null, null, null, null, null, null
            );

            when(quartoRepository.findById(id)).thenReturn(Optional.of(quartoExistente));
            when(quartoRepository.existsByNumeroAndIdNot("102", id)).thenReturn(true);

            // ACT + ASSERT
            assertThatThrownBy(() -> quartoService.editarQuarto(id, dtoComNumeroConflitante))
                .isInstanceOf(QuartoInvalidoException.class)
                .hasMessageContaining("102")
                .hasMessageContaining("RN01");
        }
    }

    // =========================================================================
    // ALTERAR STATUS
    // =========================================================================

    @Nested
    @DisplayName("alterarStatus()")
    class AlterarStatus {

        @Test
        @DisplayName("Deve alterar status com sucesso quando quarto não tem reserva ativa")
        void deveAlterarStatusComSucesso() {
            // ARRANGE
            Long id = 1L;
            Quarto quarto = new Quarto("201", 3, TipoQuarto.LUXO, BigDecimal.valueOf(400.00));
            quarto.alterarStatus(StatusQuarto.LIVRE);

            when(quartoRepository.findById(id)).thenReturn(Optional.of(quarto));
            when(quartoRepository.save(any())).thenReturn(quarto);
            when(quartoMapper.toResumo(any())).thenReturn(criarResumoStub("201", StatusQuarto.LIMPEZA));

            // ACT
            QuartoResponse.Resumo resultado = quartoService.alterarStatus(id, StatusQuarto.LIMPEZA);

            // ASSERT
            assertThat(resultado).isNotNull();
            verify(quartoRepository).save(argThat(q -> q.getStatus() == StatusQuarto.LIMPEZA));
        }

        @Test
        @DisplayName("Deve bloquear alteração de OCUPADO quando há reserva ativa (RN09)")
        void deveBloquearAlteracaoComReservaAtiva() {
            // ARRANGE
            Long id = 1L;
            Quarto quarto = new Quarto("301", 2, TipoQuarto.MODERNO, BigDecimal.valueOf(200.00));
            quarto.alterarStatus(StatusQuarto.OCUPADO);

            when(quartoRepository.findById(id)).thenReturn(Optional.of(quarto));
            when(quartoRepository.temReservaAtiva(id)).thenReturn(true);

            // ACT + ASSERT
            assertThatThrownBy(() -> quartoService.alterarStatus(id, StatusQuarto.LIVRE))
                .isInstanceOf(QuartoInvalidoException.class)
                .hasMessageContaining("reserva ativa")
                .hasMessageContaining("RN09");

            verify(quartoRepository, never()).save(any());
        }
    }

    // =========================================================================
    // HELPERS para criação de stubs nos testes
    // =========================================================================

    private QuartoResponse.Detalhe criarDetalheStub(String numero) {
        return new QuartoResponse.Detalhe(
            1L, numero, 2, TipoQuarto.MODERNO, "Moderno",
            BigDecimal.valueOf(200.00), true, false, true, true,
            StatusQuarto.LIVRE, "Livre", List.of(), null, null
        );
    }

    private QuartoResponse.Resumo criarResumoStub(String numero, StatusQuarto status) {
        return new QuartoResponse.Resumo(
            1L, numero, TipoQuarto.LUXO, "Luxo",
            BigDecimal.valueOf(400.00), status, status.getDescricao(), List.of()
        );
    }
}
