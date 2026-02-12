package com.hotel.booking.examples;

import com.hotel.booking.entities.*;
import com.hotel.booking.enums.*;
import com.hotel.booking.valueobjects.Endereco;
import com.hotel.booking.valueobjects.Periodo;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ExemploUso {

    public static void main(String[] args) {
        System.out.println("=== Sistema de Reserva de Hotel - Demonstração Java ===\n");

        // 1. Criando um hóspede
        System.out.println("1. Criando hóspede...");
        Endereco endereco = Endereco.builder()
                .logradouro("Rua das Flores")
                .numero("123")
                .complemento("Apto 45")
                .bairro("Centro")
                .cidade("São Paulo")
                .estado("SP")
                .cep("01234-567")
                .pais("Brasil")
                .build();

        Hospede hospede = Hospede.criar(
                "João",
                "Silva",
                "123.456.789-00",
                "joao.silva@email.com",
                "(11) 98765-4321",
                endereco
        );

        System.out.println("Hóspede criado: " + hospede.getNomeCompleto());
        System.out.println("CPF: " + hospede.getCpfFormatado());
        System.out.println("E-mail: " + hospede.getEmail());
        System.out.println("Telefone: " + hospede.getTelefoneFormatado());
        System.out.println("Endereço: " + endereco.getEnderecoCompleto() + "\n");

        // 2. Criando um quarto
        System.out.println("2. Criando quarto...");
        Quarto quarto = Quarto.criar(
                "101",
                2,
                TipoQuarto.LUXO,
                new BigDecimal("350.00"),
                true, // minibar
                true, // café da manhã
                true, // ar condicionado
                true  // TV
        );

        // Adicionando camas ao quarto
        quarto.adicionarCama(TipoCama.CASAL_KING);
        System.out.println("Quarto criado: " + quarto.getNumero());
        System.out.println("Tipo: " + quarto.getTipoDescricao());
        System.out.println("Capacidade: " + quarto.getCapacidade() + " pessoas");
        System.out.println("Preço: " + quarto.getPrecoFormatado() + " por noite");
        System.out.println("Comodidades: " + String.join(", ", quarto.getComodidades()));
        System.out.println("Camas: " + quarto.getCamas().stream()
                .map(Cama::getDescricao)
                .reduce((a, b) -> a + ", " + b)
                .orElse("") + "\n");

        // 3. Criando uma reserva
        System.out.println("3. Criando reserva...");
        Periodo periodo = Periodo.builder()
                .checkIn(LocalDate.of(2025, 3, 10))
                .checkOut(LocalDate.of(2025, 3, 15))
                .build();

        Reserva reserva = Reserva.criar(hospede, quarto, periodo);
        System.out.println("Reserva criada: " + reserva.getCodigoReserva());
        System.out.println("Período: " + reserva.getPeriodo().getPeriodoFormatado());
        System.out.println("Número de noites: " + reserva.getPeriodo().getNumeroNoites());
        System.out.println("Valor total: " + reserva.getValorTotalFormatado());
        System.out.println("Status: " + reserva.getStatusDescricao() + "\n");

        // 4. Adicionando hóspedes adicionais
        System.out.println("4. Adicionando hóspedes adicionais...");
        Hospede hospede2 = Hospede.criar(
                "Maria",
                "Silva",
                "987.654.321-00",
                "maria.silva@email.com",
                null,
                null
        );

        reserva.adicionarHospede(hospede2);
        System.out.println("Hóspedes adicionais: " + reserva.getHospedesAdicionais().size());
        System.out.println("Total de hóspedes: " + reserva.getNumeroTotalHospedes());
        System.out.println("Novo valor total: " + reserva.getValorTotalFormatado() + "\n");

        // 5. Confirmando a reserva
        System.out.println("5. Confirmando reserva...");
        reserva.confirmar();
        System.out.println("Status atualizado: " + reserva.getStatusDescricao() + "\n");

        // 6. Simulando check-in
        System.out.println("6. Simulando check-in...");
        // Para simular, vamos ajustar a data para hoje
        LocalDate hoje = LocalDate.now();
        Periodo periodoCheckIn = Periodo.builder()
                .checkIn(hoje)
                .checkOut(hoje.plusDays(2))
                .build();

        reserva = Reserva.criar(hospede, quarto, periodoCheckIn);
        reserva.confirmar();
        reserva.realizarCheckIn();
        System.out.println("Check-in realizado em: " + 
                reserva.getDataCheckIn().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
        System.out.println("Status: " + reserva.getStatusDescricao() + "\n");

        // 7. Adicionando pagamentos
        System.out.println("7. Adicionando pagamentos...");
        Pagamento pagamento1 = Pagamento.criar(
                reserva.getValorTotal().multiply(new BigDecimal("0.5")),
                MetodoPagamento.CARTAO_CREDITO,
                reserva
        );
        pagamento1.processar("TXN_123456");
        reserva.adicionarPagamento(pagamento1);

        Pagamento pagamento2 = Pagamento.criar(
                reserva.getValorRestante(),
                MetodoPagamento.PIX,
                reserva
        );
        pagamento2.processar("PIX_789012");
        reserva.adicionarPagamento(pagamento2);

        System.out.println("Pagamentos realizados: " + reserva.getPagamentos().size());
        System.out.println("Valor pago: " + reserva.getValorPagoFormatado());
        System.out.println("Valor restante: " + reserva.getValorRestanteFormatado());
        System.out.println("Reserva totalmente paga: " + reserva.estaTotalmentePaga() + "\n");

        // 8. Simulando check-out
        System.out.println("8. Simulando check-out...");
        reserva.realizarCheckOut();
        System.out.println("Check-out realizado em: " + 
                reserva.getDataCheckOut().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
        System.out.println("Status final: " + reserva.getStatusDescricao());
        System.out.println("Reserva finalizada: " + reserva.estaFinalizada() + "\n");

        // 9. Exemplo de validações e erros
        System.out.println("9. Testando validações...");
        try {
            // Tentando criar quarto sem camas
            Quarto quartoInvalido = Quarto.criar("102", 1, TipoQuarto.BASICO, new BigDecimal("150.00"));
        } catch (Exception e) {
            System.out.println("✓ Validação de quarto sem camas: " + e.getMessage());
        }

        try {
            // Tentando criar hóspede com CPF inválido
            Hospede hospedeInvalido = Hospede.criar("Teste", "Erro", "123", "invalido@email.com", null, null);
        } catch (Exception e) {
            System.out.println("✓ Validação de CPF inválido: " + e.getMessage());
        }

        try {
            // Tentando criar período com check-out anterior ao check-in
            Periodo periodoInvalido = Periodo.builder()
                    .checkIn(LocalDate.of(2025, 3, 15))
                    .checkOut(LocalDate.of(2025, 3, 10))
                    .build();
        } catch (Exception e) {
            System.out.println("✓ Validação de período inválido: " + e.getMessage());
        }

        try {
            // Tentando fazer check-in em reserva não confirmada
            Reserva reservaPendente = Reserva.criar(hospede, quarto, periodo);
            reservaPendente.realizarCheckIn();
        } catch (Exception e) {
            System.out.println("✓ Validação de check-in em reserva pendente: " + e.getMessage());
        }

        System.out.println("\n=== Demonstração concluída com sucesso! ===");
    }
}
