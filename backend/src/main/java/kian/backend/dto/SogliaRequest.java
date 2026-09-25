package kian.backend.dto;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record SogliaRequest(
        @NotNull @Positive @Digits(integer = 8, fraction = 2) BigDecimal soglia
) {
}
