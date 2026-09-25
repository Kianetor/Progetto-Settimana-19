package kian.backend.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

// Solo l'auto: l'utente è sempre quello del JWT, un "utenteId" nel corpo viene ignorato
public record PreferitoRequest(
        @NotNull UUID autoId
) {
}
