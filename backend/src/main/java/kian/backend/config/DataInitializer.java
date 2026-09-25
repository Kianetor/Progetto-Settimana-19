package kian.backend.config;

import kian.backend.entities.Alimentazione;
import kian.backend.entities.Auto;
import kian.backend.entities.Ruolo;
import kian.backend.entities.Utente;
import kian.backend.repositories.AutoRepository;
import kian.backend.repositories.UtenteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;

// All'avvio crea l'amministratore (unico modo per ottenere il ruolo ADMIN) e, se il catalogo è vuoto, alcune auto di esempio
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UtenteRepository utenteRepository;
    private final AutoRepository autoRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        creaAdmin();
        if (autoRepository.count() == 0) {
            creaAutoDiEsempio();
        }
    }

    private void creaAdmin() {
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

    private void creaAutoDiEsempio() {
        List<Auto> auto = List.of(
                auto("Volkswagen", "Golf 1.6 TDI", 2019, 78_000, Alimentazione.DIESEL, "17900", "14500", true,
                        "Unico proprietario, tagliandi certificati, cerchi in lega da 16\"."),
                auto("Fiat", "500 Hybrid", 2021, 32_000, Alimentazione.IBRIDA, "13500", "11000", true,
                        "Ideale per la città, consumi ridotti, climatizzatore automatico."),
                auto("Toyota", "Yaris Hybrid", 2022, 21_500, Alimentazione.IBRIDA, "18900", "15800", true,
                        "Garanzia ufficiale ancora attiva, cambio automatico."),
                auto("BMW", "Serie 3 320d", 2018, 110_000, Alimentazione.DIESEL, "22500", "18900", true,
                        "Pacchetto M Sport, navigatore, sedili riscaldati."),
                auto("Tesla", "Model 3 Long Range", 2021, 45_000, Alimentazione.ELETTRICA, "32900", "28500", true,
                        "Autopilot, autonomia elevata, ricarica rapida."),
                auto("Dacia", "Sandero Stepway GPL", 2020, 56_000, Alimentazione.GPL, "11900", "9300", true,
                        "Impianto GPL di serie, bassi costi di gestione."),
                auto("Audi", "A4 Avant 2.0 TDI", 2020, 64_000, Alimentazione.DIESEL, "27900", "23000", false,
                        "In preparazione: foto e descrizione in arrivo."));
        autoRepository.saveAll(auto);
        log.info("Create {} auto di esempio", auto.size());
    }

    private static Auto auto(String marca, String modello, int anno, int km, Alimentazione alimentazione,
                             String prezzo, String prezzoAcquisto, boolean pubblicata, String descrizione) {
        Auto a = new Auto();
        a.setMarca(marca);
        a.setModello(modello);
        a.setAnno(anno);
        a.setChilometri(km);
        a.setAlimentazione(alimentazione);
        a.setPrezzo(new BigDecimal(prezzo));
        a.setPrezzoAcquisto(new BigDecimal(prezzoAcquisto));
        a.setPubblicata(pubblicata);
        a.setDescrizione(descrizione);
        return a;
    }
}
