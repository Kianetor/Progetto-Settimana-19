package kian.backend.dto;

import jakarta.validation.constraints.*;
import kian.backend.entities.Alimentazione;

import java.math.BigDecimal;

// Creazione e modifica di un'auto (solo amministratore)
public record AutoRequest(
        @NotBlank @Size(max = 60) String marca,
        @NotBlank @Size(max = 80) String modello,
        @NotNull @Min(1900) @Max(2100) Integer anno,
        @NotNull @PositiveOrZero @Max(2_000_000) Integer chilometri,
        @NotNull Alimentazione alimentazione,
        @Size(max = 5000) String descrizione,
        @Size(max = 500)
        @Pattern(regexp = "^https://[^\\s\"'<>]+$", message = "deve essere un indirizzo https")
        String immagineUrl,
        @NotNull @Positive @Digits(integer = 8, fraction = 2) BigDecimal prezzo,
        @NotNull @Positive @Digits(integer = 8, fraction = 2) BigDecimal prezzoAcquisto,
        @NotNull Boolean pubblicata
) {
}
