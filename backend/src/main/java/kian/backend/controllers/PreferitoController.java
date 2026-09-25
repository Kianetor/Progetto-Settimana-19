package kian.backend.controllers;

import jakarta.validation.Valid;
import kian.backend.dto.PreferitoRequest;
import kian.backend.dto.PreferitoResponse;
import kian.backend.services.PreferitoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/preferiti")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class PreferitoController {

    private final PreferitoService preferitoService;

    @GetMapping
    public List<PreferitoResponse> elenco(@AuthenticationPrincipal Jwt jwt) {
        return preferitoService.elenco(utenteId(jwt));
    }

    // 201 se aggiunto adesso, 200 se era già tra i preferiti
    @PostMapping
    public ResponseEntity<PreferitoResponse> aggiungi(@AuthenticationPrincipal Jwt jwt,
                                                      @Valid @RequestBody PreferitoRequest request) {
        var esito = preferitoService.aggiungi(utenteId(jwt), request.autoId());
        return ResponseEntity.status(esito.creato() ? HttpStatus.CREATED : HttpStatus.OK).body(esito.preferito());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void rimuovi(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        preferitoService.rimuovi(utenteId(jwt), id);
    }

    private static UUID utenteId(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }
}
