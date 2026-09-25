package kian.backend.dto;

import kian.backend.entities.Avviso;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

// Mai il token di disattivazione né il suo hash
public record AvvisoResponse(
        UUID id,
        AutoPubblicaResponse auto,
        BigDecimal soglia,
        boolean inviato,
        Instant inviatoAt,
        boolean attivo,
        Instant createdAt
) {
    public static AvvisoResponse of(Avviso a) {
        return new AvvisoResponse(a.getId(), AutoPubblicaResponse.of(a.getAuto()), a.getSoglia(),
                a.isInviato(), a.getInviatoAt(), a.isAttivo(), a.getCreatedAt());
    }
}
