package kian.backend.events;

import kian.backend.entities.Avviso;
import kian.backend.repositories.AvvisoRepository;
import kian.backend.security.Hashing;
import kian.backend.services.MailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class AvvisoPrezzoListener {

    private final AvvisoRepository avvisoRepository;
    private final MailService mailService;

    // AFTER_COMMIT: se il salvataggio del prezzo fallisce l'evento non arriva e non parte nessuna mail.
    // @Async: gira su un altro thread, la risposta all'amministratore non aspetta Gmail
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onPrezzoRibassato(PrezzoRibassato evento) {
        List<UUID> ids = avvisoRepository.idSogliaAttraversata(
                evento.autoId(), evento.vecchioPrezzo(), evento.nuovoPrezzo());
        ids.forEach(this::notifica);
    }

    private void notifica(UUID avvisoId) {
        String token = Hashing.tokenCasuale();
        // Il segno "inviato" si prende prima di spedire e in un colpo solo: se un'altra modifica
        // ravvicinata l'ha già preso, qui la riga aggiornata è 0 e la mail non parte una seconda volta
        if (avvisoRepository.segnaInviato(avvisoId, Hashing.sha256(token), Instant.now()) != 1) {
            return;
        }
        Avviso avviso = avvisoRepository.findConDettagliById(avvisoId).orElse(null);
        if (avviso == null) {
            return;
        }
        try {
            mailService.inviaAvvisoPrezzo(avviso, token);
            log.info("Avviso notificato avviso={}", avvisoId);
        } catch (Exception e) {
            // Scelta: l'avviso resta inviato e la mail è persa. Meglio una mail mancata che un doppione;
            // l'id nel log permette di ricontrollare a mano. Niente indirizzo email nel log
            log.warn("Invio mail fallito avviso={} errore={}", avvisoId, e.getClass().getSimpleName());
        }
    }
}
