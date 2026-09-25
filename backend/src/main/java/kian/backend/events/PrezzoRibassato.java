package kian.backend.events;

import java.math.BigDecimal;
import java.util.UUID;

// Pubblicato quando l'amministratore abbassa il prezzo di un'auto
public record PrezzoRibassato(
        UUID autoId,
        BigDecimal vecchioPrezzo,
        BigDecimal nuovoPrezzo
) {
}
