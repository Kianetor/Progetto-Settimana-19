package kian.backend.dto;

import kian.backend.entities.Utente;

import java.util.UUID;

// Dati dell'utente restituiti al client: mai la password
public record UtenteResponse(
        UUID id,
        String email,
        String nome,
        String ruolo
) {
    public static UtenteResponse of(Utente u) {
        return new UtenteResponse(u.getId(), u.getEmail(), u.getNome(), u.getRuolo().name());
    }
}
