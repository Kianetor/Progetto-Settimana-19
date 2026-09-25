package kian.backend.controllers;

import jakarta.validation.Valid;
import kian.backend.dto.AvvisoRequest;
import kian.backend.dto.AvvisoResponse;
import kian.backend.dto.DisattivaAvvisoRequest;
import kian.backend.dto.SogliaRequest;
import kian.backend.services.AvvisoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/avvisi")
@RequiredArgsConstructor
public class AvvisoController {

    private final AvvisoService avvisoService;

    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public List<AvvisoResponse> elenco(@AuthenticationPrincipal Jwt jwt) {
        return avvisoService.elenco(utenteId(jwt));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public AvvisoResponse dettaglio(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        return avvisoService.dettaglio(utenteId(jwt), id);
    }

    // 400 se la soglia non è sotto il prezzo attuale, 409 se esiste già un avviso per quell'auto
    @PreAuthorize("isAuthenticated()")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AvvisoResponse crea(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody AvvisoRequest request) {
        return avvisoService.crea(utenteId(jwt), request);
    }

    @PreAuthorize("isAuthenticated()")
    @PatchMapping("/{id}")
    public AvvisoResponse modificaSoglia(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id,
                                         @Valid @RequestBody SogliaRequest request) {
        return avvisoService.modificaSoglia(utenteId(jwt), id, request.soglia());
    }

    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void elimina(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        avvisoService.elimina(utenteId(jwt), id);
    }

    // Pubblico: chi apre il link della mail potrebbe non essere collegato.
    // POST e non GET, così un'anteprima automatica del link non disattiva l'avviso
    @PreAuthorize("permitAll()")
    @PostMapping("/disattiva")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void disattiva(@Valid @RequestBody DisattivaAvvisoRequest request) {
        avvisoService.disattivaConToken(request.token());
    }

    private static UUID utenteId(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }
}
