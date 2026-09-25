package kian.backend.services;

import kian.backend.dto.LoginRequest;
import kian.backend.dto.LoginResponse;
import kian.backend.dto.ProfiloRequest;
import kian.backend.dto.RegisterRequest;
import kian.backend.dto.UtenteResponse;
import kian.backend.entities.Ruolo;
import kian.backend.entities.Utente;
import kian.backend.repositories.UtenteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;
import java.util.UUID;

// Nei log solo l'id dell'utente e l'esito: niente email, password o token
@Slf4j
@Service
@RequiredArgsConstructor
public class UtenteService {

    private final UtenteRepository utenteRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public LoginResponse login(LoginRequest request) {
        // Stesso errore per email inesistente e password errata: non riveliamo quali email sono registrate
        Utente utente = utenteRepository.findByEmail(normalizzaEmail(request.email()))
                .filter(u -> passwordEncoder.matches(request.password(), u.getPassword()))
                .orElseThrow(() -> {
                    log.warn("Login fallito");
                    return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenziali non valide");
                });
        log.info("Login riuscito utente={}", utente.getId());
        return jwtService.emetti(utente);
    }

    @Transactional
    public UtenteResponse registra(RegisterRequest request) {
        String email = normalizzaEmail(request.email());
        if (utenteRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email già registrata");
        }

        Utente utente = new Utente();
        utente.setEmail(email);
        utente.setPassword(passwordEncoder.encode(request.password()));
        utente.setNome(request.nome().trim());
        utente.setRuolo(Ruolo.USER);
        utenteRepository.save(utente);

        log.info("Registrato utente={}", utente.getId());
        return UtenteResponse.of(utente);
    }

    public void logout(String token) {
        jwtService.revoca(token);
    }

    @Transactional(readOnly = true)
    public UtenteResponse me(UUID utenteId) {
        return UtenteResponse.of(trova(utenteId));
    }

    @Transactional
    public UtenteResponse aggiornaProfilo(UUID utenteId, ProfiloRequest request) {
        Utente utente = trova(utenteId);
        utente.setNome(request.nome().trim());
        return UtenteResponse.of(utente);
    }

    private Utente trova(UUID utenteId) {
        return utenteRepository.findById(utenteId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utente non trovato"));
    }

    static String normalizzaEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
