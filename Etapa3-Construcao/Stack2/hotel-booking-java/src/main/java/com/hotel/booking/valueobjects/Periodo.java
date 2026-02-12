package com.hotel.booking.valueobjects;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Embeddable
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Periodo {
    private LocalDate checkIn;
    private LocalDate checkOut;

    public Periodo(LocalDate checkIn, LocalDate checkOut) {
        this.checkIn = checkIn;
        this.checkOut = checkOut;
        validarPeriodo();
    }

    private void validarPeriodo() {
        if (checkOut == null || checkIn == null) {
            throw new IllegalArgumentException("Datas de check-in e check-out são obrigatórias");
        }

        if (checkOut.isBefore(checkIn) || checkOut.isEqual(checkIn)) {
            throw new IllegalArgumentException("Check-out deve ser posterior ao check-in");
        }

        if (checkIn.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Check-in não pode ser no passado");
        }

        long dias = getNumeroNoites();
        if (dias > 30) {
            throw new IllegalArgumentException("Período de estadia não pode exceder 30 dias");
        }
    }

    public long getNumeroNoites() {
        return java.time.temporal.ChronoUnit.DAYS.between(checkIn, checkOut);
    }

    public boolean contem(LocalDate data) {
        return !data.isBefore(checkIn) && data.isBefore(checkOut);
    }

    public boolean sobrepoe(Periodo outro) {
        return this.checkIn.isBefore(outro.checkOut) && this.checkOut.isAfter(outro.checkIn);
    }

    public boolean ehValidoParaReserva() {
        return checkIn.isAfter(LocalDate.now().minusDays(1)) && getNumeroNoites() > 0;
    }

    public String getPeriodoFormatado() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        return checkIn.format(formatter) + " a " + checkOut.format(formatter);
    }

    public boolean ehFuturo() {
        return checkIn.isAfter(LocalDate.now());
    }

    public long diasAteCheckIn() {
        LocalDate hoje = LocalDate.now();
        return java.time.temporal.ChronoUnit.DAYS.between(hoje, checkIn);
    }
}
