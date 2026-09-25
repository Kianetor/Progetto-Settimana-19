package kian.backend.dto;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

// Solo auto e soglia: "inviato", "attivo" o "utenteId" aggiunti al corpo vengono ignorati
public record AvvisoRequest(
        @NotNull UUID autoId,
        @NotNull @Positive @Digits(integer = 8, fraction = 2) BigDecimal soglia
) {
}
