package kian.backend.controllers;

import jakarta.validation.Valid;
import kian.backend.dto.LoginRequest;
import kian.backend.dto.LoginResponse;
import kian.backend.dto.RegisterRequest;
import kian.backend.dto.UtenteResponse;
import kian.backend.services.UtenteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UtenteService utenteService;

    @PreAuthorize("permitAll()")
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UtenteResponse register(@Valid @RequestBody RegisterRequest request) {
        return utenteService.registra(request);
    }

    @PreAuthorize("permitAll()")
    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return utenteService.login(request);
    }

    // Revoca il JWT usato nella richiesta
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@AuthenticationPrincipal Jwt jwt) {
        utenteService.logout(jwt.getTokenValue());
    }
}
