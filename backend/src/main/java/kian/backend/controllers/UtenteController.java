package kian.backend.controllers;

import jakarta.validation.Valid;
import kian.backend.dto.ProfiloRequest;
import kian.backend.dto.UtenteResponse;
import kian.backend.services.UtenteService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

// L'utente è sempre quello del JWT: nessun id utente arriva dal client
@RestController
@RequestMapping("/api/utenti/me")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class UtenteController {

    private final UtenteService utenteService;

    @GetMapping
    public UtenteResponse me(@AuthenticationPrincipal Jwt jwt) {
        return utenteService.me(UUID.fromString(jwt.getSubject()));
    }

    @PatchMapping
    public UtenteResponse aggiornaProfilo(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ProfiloRequest request) {
        return utenteService.aggiornaProfilo(UUID.fromString(jwt.getSubject()), request);
    }
}
