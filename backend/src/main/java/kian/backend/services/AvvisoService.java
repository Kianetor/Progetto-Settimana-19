package kian.backend.services;

import kian.backend.dto.AvvisoRequest;
import kian.backend.dto.AvvisoResponse;
import kian.backend.entities.Auto;
import kian.backend.entities.Avviso;
import kian.backend.repositories.AvvisoRepository;
import kian.backend.repositories.UtenteRepository;
import kian.backend.security.Hashing;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AvvisoService {

    private final AvvisoRepository avvisoRepository;
    private final UtenteRepository utenteRepository;
    private final AutoService autoService;

    @Transactional(readOnly = true)
    public List<AvvisoResponse> elenco(UUID utenteId) {
        return avvisoRepository.findByUtenteIdAndAutoPubblicataTrueOrderByCreatedAtDesc(utenteId).stream()
                .map(AvvisoResponse::of)
                .toList();
    }

    @Transactional(readOnly = true)
    public AvvisoResponse dettaglio(UUID utenteId, UUID avvisoId) {
        return AvvisoResponse.of(trova(utenteId, avvisoId));
    }

    @Transactional
    public AvvisoResponse crea(UUID utenteId, AvvisoRequest r) {
        Auto auto = autoService.trovaPubblicata(r.autoId());
        verificaSoglia(auto, r.soglia());
        if (avvisoRepository.existsByUtenteIdAndAutoId(utenteId, auto.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Hai già un avviso per questa auto: modifica la soglia");
        }
        Avviso avviso = new Avviso();
        avviso.setUtente(utenteRepository.getReferenceById(utenteId));
        avviso.setAuto(auto);
        avviso.setSoglia(r.soglia());
        avvisoRepository.save(avviso);
        log.info("Creato avviso={} utente={}", avviso.getId(), utenteId);
        return AvvisoResponse.of(avviso);
    }

    // Una soglia nuova è un avviso nuovo: torna attivo e da inviare, il vecchio link smette di valere
    @Transactional
    public AvvisoResponse modificaSoglia(UUID utenteId, UUID avvisoId, BigDecimal soglia) {
        Avviso avviso = trova(utenteId, avvisoId);
        verificaSoglia(avviso.getAuto(), soglia);
        avviso.setSoglia(soglia);
        avviso.setInviato(false);
        avviso.setInviatoAt(null);
        avviso.setAttivo(true);
        avviso.setTokenDisattivazioneHash(null);
        return AvvisoResponse.of(avviso);
    }

    @Transactional
    public void elimina(UUID utenteId, UUID avvisoId) {
        avvisoRepository.delete(trova(utenteId, avvisoId));
    }

    // Dal link della mail, senza login: vale solo il token casuale, mai l'id dell'avviso
    public void disattivaConToken(String token) {
        if (avvisoRepository.disattivaConToken(Hashing.sha256(token.trim())) == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Link non valido o già usato");
        }
    }

    private Avviso trova(UUID utenteId, UUID avvisoId) {
        return avvisoRepository.findByIdAndUtenteId(avvisoId, utenteId)
                .filter(a -> a.getAuto().isPubblicata())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Avviso non trovato"));
    }

    // Con la soglia già sopra il prezzo attuale l'avviso non potrebbe mai "attraversarla" scendendo
    private static void verificaSoglia(Auto auto, BigDecimal soglia) {
        if (soglia.compareTo(auto.getPrezzo()) >= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La soglia deve essere inferiore al prezzo attuale");
        }
    }
}
