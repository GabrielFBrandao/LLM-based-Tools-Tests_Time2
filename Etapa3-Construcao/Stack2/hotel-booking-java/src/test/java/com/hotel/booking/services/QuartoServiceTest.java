package com.hotel.booking.services;

import com.hotel.booking.entities.Quarto;
import com.hotel.booking.entities.Cama;
import com.hotel.booking.enums.TipoQuarto;
import com.hotel.booking.enums.StatusQuarto;
import com.hotel.booking.enums.TipoCama;
import com.hotel.booking.repositories.QuartoRepository;
import com.hotel.booking.repositories.CamaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes do QuartoService")
class QuartoServiceTest {

    @Mock
    private QuartoRepository quartoRepository;

    @Mock
    private CamaRepository camaRepository;

    @InjectMocks
    private QuartoService quartoService;

    private Quarto quartoTeste;
    private List<Cama> camasTeste;

    @BeforeEach
    void setUp() {
        UUID quartoId = UUID.randomUUID();
        
        camasTeste = Arrays.asList(
                Cama.builder()
                        .id(UUID.randomUUID())
                        .tipo(TipoCama.CASAL_KING)
                        .quartoId(quartoId)
                        .build()
        );

        quartoTeste = Quarto.builder()
                .id(quartoId)
                .numero("101")
                .capacidade(2)
                .tipo(TipoQuarto.LUXO)
                .precoPorNoite(new BigDecimal("350.00"))
                .hasMinibar(true)
                .hasCafeDaManha(true)
                .hasArCondicionado(true)
                .hasTV(true)
                .status(StatusQuarto.DISPONIVEL)
                .camas(camasTeste)
                .build();
    }

    @Test
    @DisplayName("Deve criar quarto com sucesso")
    void deveCriarQuartoComSucesso() {
        // Arrange
        when(quartoRepository.existsByNumero(anyString())).thenReturn(false);
        when(quartoRepository.save(any(Quarto.class))).thenReturn(quartoTeste);
        when(camaRepository.saveAll(anyList())).thenReturn(camasTeste);

        // Act
        Quarto resultado = quartoService.criarQuarto(quartoTeste);

        // Assert
        assertNotNull(resultado);
        assertEquals("101", resultado.getNumero());
        assertEquals(TipoQuarto.LUXO, resultado.getTipo());
        assertEquals(StatusQuarto.DISPONIVEL, resultado.getStatus());
        verify(quartoRepository).save(any(Quarto.class));
        verify(camaRepository).saveAll(anyList());
    }

    @Test
    @DisplayName("Deve lançar exceção ao criar quarto com número duplicado")
    void deveLancarExcecaoAoCriarQuartoComNumeroDuplicado() {
        // Arrange
        when(quartoRepository.existsByNumero("101")).thenReturn(true);

        // Act & Assert
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> quartoService.criarQuarto(quartoTeste)
        );

        assertEquals("Número do quarto já existe: 101", exception.getMessage());
        verify(quartoRepository, never()).save(any(Quarto.class));
    }

    @Test
    @DisplayName("Deve atualizar quarto com sucesso")
    void deveAtualizarQuartoComSucesso() {
        // Arrange
        UUID quartoId = quartoTeste.getId();
        Quarto quartoAtualizado = Quarto.builder()
                .numero("102")
                .capacidade(3)
                .tipo(TipoQuarto.MODERNO)
                .precoPorNoite(new BigDecimal("280.00"))
                .hasMinibar(false)
                .hasCafeDaManha(true)
                .hasArCondicionado(true)
                .hasTV(false)
                .status(StatusQuarto.MANUTENCAO)
                .camas(camasTeste)
                .build();

        when(quartoRepository.findById(quartoId)).thenReturn(Optional.of(quartoTeste));
        when(quartoRepository.existsByNumeroAndIdNot("102", quartoId)).thenReturn(false);
        when(quartoRepository.save(any(Quarto.class))).thenReturn(quartoTeste);

        // Act
        Quarto resultado = quartoService.atualizarQuarto(quartoId, quartoAtualizado);

        // Assert
        assertNotNull(resultado);
        verify(quartoRepository).save(any(Quarto.class));
        verify(camaRepository).deleteByQuartoId(quartoId);
    }

    @Test
    @DisplayName("Deve buscar quarto por ID com sucesso")
    void deveBuscarQuartoPorIdComSucesso() {
        // Arrange
        UUID quartoId = quartoTeste.getId();
        when(quartoRepository.findById(quartoId)).thenReturn(Optional.of(quartoTeste));

        // Act
        Quarto resultado = quartoService.buscarQuartoPorId(quartoId);

        // Assert
        assertNotNull(resultado);
        assertEquals(quartoId, resultado.getId());
        assertEquals("101", resultado.getNumero());
        verify(quartoRepository).findById(quartoId);
    }

    @Test
    @DisplayName("Deve lançar exceção ao buscar quarto por ID inexistente")
    void deveLancarExcecaoAoBuscarQuartoPorIdInexistente() {
        // Arrange
        UUID idInexistente = UUID.randomUUID();
        when(quartoRepository.findById(idInexistente)).thenReturn(Optional.empty());

        // Act & Assert
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> quartoService.buscarQuartoPorId(idInexistente)
        );

        assertEquals("Quarto não encontrado: " + idInexistente, exception.getMessage());
    }

    @Test
    @DisplayName("Deve buscar quartos por tipo com sucesso")
    void deveBuscarQuartosPorTipoComSucesso() {
        // Arrange
        List<Quarto> quartosLuxo = Arrays.asList(quartoTeste);
        when(quartoRepository.findByTipo(TipoQuarto.LUXO)).thenReturn(quartosLuxo);

        // Act
        List<Quarto> resultado = quartoService.buscarQuartosPorTipo(TipoQuarto.LUXO);

        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals(TipoQuarto.LUXO, resultado.get(0).getTipo());
        verify(quartoRepository).findByTipo(TipoQuarto.LUXO);
    }

    @Test
    @DisplayName("Deve buscar quartos por status com sucesso")
    void deveBuscarQuartosPorStatusComSucesso() {
        // Arrange
        List<Quarto> quartosDisponiveis = Arrays.asList(quartoTeste);
        when(quartoRepository.findByStatus(StatusQuarto.DISPONIVEL)).thenReturn(quartosDisponiveis);

        // Act
        List<Quarto> resultado = quartoService.buscarQuartosPorStatus(StatusQuarto.DISPONIVEL);

        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals(StatusQuarto.DISPONIVEL, resultado.get(0).getStatus());
        verify(quartoRepository).findByStatus(StatusQuarto.DISPONIVEL);
    }

    @Test
    @DisplayName("Deve atualizar status do quarto com sucesso")
    void deveAtualizarStatusDoQuartoComSucesso() {
        // Arrange
        UUID quartoId = quartoTeste.getId();
        when(quartoRepository.findById(quartoId)).thenReturn(Optional.of(quartoTeste));
        when(quartoRepository.save(any(Quarto.class))).thenReturn(quartoTeste);

        // Act
        Quarto resultado = quartoService.atualizarStatus(quartoId, StatusQuarto.OCUPADO);

        // Assert
        assertNotNull(resultado);
        verify(quartoRepository).save(any(Quarto.class));
    }

    @Test
    @DisplayName("Deve lançar exceção ao tentar ocupar quarto não disponível")
    void deveLancarExcecaoAoTentarOcuparQuartoNaoDisponivel() {
        // Arrange
        UUID quartoId = quartoTeste.getId();
        quartoTeste.setStatus(StatusQuarto.MANUTENCAO);
        when(quartoRepository.findById(quartoId)).thenReturn(Optional.of(quartoTeste));

        // Act & Assert
        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> quartoService.atualizarStatus(quartoId, StatusQuarto.OCUPADO)
        );

        assertEquals("Apenas quartos disponíveis podem ser ocupados", exception.getMessage());
    }

    @Test
    @DisplayName("Deve adicionar cama ao quarto com sucesso")
    void deveAdicionarCamaAoQuartoComSucesso() {
        // Arrange
        UUID quartoId = quartoTeste.getId();
        when(quartoRepository.findById(quartoId)).thenReturn(Optional.of(quartoTeste));
        when(camaRepository.save(any(Cama.class))).thenReturn(new Cama());
        when(quartoRepository.save(any(Quarto.class))).thenReturn(quartoTeste);

        // Act
        Quarto resultado = quartoService.adicionarCama(quartoId, TipoCama.SOLTEIRO);

        // Assert
        assertNotNull(resultado);
        verify(camaRepository).save(any(Cama.class));
        verify(quartoRepository).save(any(Quarto.class));
    }

    @Test
    @DisplayName("Deve deletar quarto com sucesso")
    void deveDeletarQuartoComSucesso() {
        // Arrange
        UUID quartoId = quartoTeste.getId();
        quartoTeste.setStatus(StatusQuarto.DISPONIVEL); // Status permite deleção
        when(quartoRepository.findById(quartoId)).thenReturn(Optional.of(quartoTeste));

        // Act
        quartoService.deletarQuarto(quartoId);

        // Assert
        verify(camaRepository).deleteByQuartoId(quartoId);
        verify(quartoRepository).deleteById(quartoId);
    }

    @Test
    @DisplayName("Deve lançar exceção ao tentar deletar quarto ocupado")
    void deveLancarExcecaoAoTentarDeletarQuartoOcupado() {
        // Arrange
        UUID quartoId = quartoTeste.getId();
        quartoTeste.setStatus(StatusQuarto.OCUPADO);
        when(quartoRepository.findById(quartoId)).thenReturn(Optional.of(quartoTeste));

        // Act & Assert
        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> quartoService.deletarQuarto(quartoId)
        );

        assertEquals("Não é possível deletar um quarto ocupado", exception.getMessage());
        verify(quartoRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("Deve buscar quartos com filtros múltiplos")
    void deveBuscarQuartosComFiltrosMultiplas() {
        // Arrange
        List<Quarto> quartosFiltrados = Arrays.asList(quartoTeste);
        when(quartoRepository.buscarComFiltros(
                eq(TipoQuarto.LUXO),
                eq(StatusQuarto.DISPONIVEL),
                eq(2),
                isNull()
        )).thenReturn(quartosFiltrados);

        // Act
        List<Quarto> resultado = quartoService.buscarQuartosComFiltros(
                TipoQuarto.LUXO,
                StatusQuarto.DISPONIVEL,
                2,
                null
        );

        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        verify(quartoRepository).buscarComFiltros(
                eq(TipoQuarto.LUXO),
                eq(StatusQuarto.DISPONIVEL),
                eq(2),
                isNull()
        );
    }

    @Test
    @DisplayName("Deve listar todos os quartos")
    void deveListarTodosQuartos() {
        // Arrange
        List<Quarto> todosQuartos = Arrays.asList(quartoTeste);
        when(quartoRepository.findAll()).thenReturn(todosQuartos);

        // Act
        List<Quarto> resultado = quartoService.listarTodosQuartos();

        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        verify(quartoRepository).findAll();
    }
}
