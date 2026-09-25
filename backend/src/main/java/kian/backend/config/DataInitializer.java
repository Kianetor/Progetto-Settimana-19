package kian.backend.config;

import kian.backend.entities.Ruolo;
import kian.backend.entities.Utente;
import kian.backend.repositories.UtenteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

// Crea l'amministratore all'avvio se non esiste: è l'unico modo per ottenere il ruolo ADMIN
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UtenteRepository utenteRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        String email = adminEmail.trim().toLowerCase(Locale.ROOT);
        if (utenteRepository.findByEmail(email).isEmpty()) {
            Utente admin = new Utente();
            admin.setEmail(email);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setNome("Amministratore");
            admin.setRuolo(Ruolo.ADMIN);
            utenteRepository.save(admin);
            log.info("Creato amministratore utente={}", admin.getId());
        }
    }
}
