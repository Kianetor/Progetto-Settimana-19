package kian.backend.services;

import kian.backend.dto.PreferitoResponse;
import kian.backend.entities.Auto;
import kian.backend.entities.Preferito;
import kian.backend.repositories.PreferitoRepository;
import kian.backend.repositories.UtenteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PreferitoService {

    private final PreferitoRepository preferitoRepository;
    private final UtenteRepository utenteRepository;
    private final AutoService autoService;

    public record EsitoAggiunta(boolean creato, PreferitoResponse preferito) {
    }

    @Transactional(readOnly = true)
    public List<PreferitoResponse> elenco(UUID utenteId) {
        return preferitoRepository.findByUtenteIdAndAutoPubblicataTrueOrderByCreatedAtDesc(utenteId).stream()
                .map(PreferitoResponse::of)
                .toList();
    }

    // Idempotente: se l'auto è già tra i preferiti restituisce quello esistente
    @Transactional
    public EsitoAggiunta aggiungi(UUID utenteId, UUID autoId) {
        Auto auto = autoService.trovaPubblicata(autoId);
        var esistente = preferitoRepository.findByUtenteIdAndAutoId(utenteId, autoId);
        if (esistente.isPresent()) {
            return new EsitoAggiunta(false, PreferitoResponse.of(esistente.get()));
        }
        Preferito preferito = new Preferito();
        preferito.setUtente(utenteRepository.getReferenceById(utenteId));
        preferito.setAuto(auto);
        preferitoRepository.save(preferito);
        return new EsitoAggiunta(true, PreferitoResponse.of(preferito));
    }

    @Transactional
    public void rimuovi(UUID utenteId, UUID preferitoId) {
        Preferito preferito = preferitoRepository.findByIdAndUtenteId(preferitoId, utenteId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Preferito non trovato"));
        preferitoRepository.delete(preferito);
    }
}
