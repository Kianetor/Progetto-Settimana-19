package kian.backend.dto;

import kian.backend.entities.Preferito;

import java.time.Instant;
import java.util.UUID;

public record PreferitoResponse(
        UUID id,
        AutoPubblicaResponse auto,
        Instant createdAt
) {
    public static PreferitoResponse of(Preferito p) {
        return new PreferitoResponse(p.getId(), AutoPubblicaResponse.of(p.getAuto()), p.getCreatedAt());
    }
}
