package kian.backend.services;

import kian.backend.dto.*;
import kian.backend.entities.Auto;
import kian.backend.events.PrezzoRibassato;
import kian.backend.repositories.AutoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AutoService {

    // Colonne ordinabili dal catalogo pubblico: nome nel parametro sort -> proprietà JPA
    private static final Map<String, String> SORT_PUBBLICI = Map.of(
            "prezzo", "prezzo",
            "anno", "anno",
            "chilometri", "chilometri",
            "marca", "marca",
            "modello", "modello",
            "recenti", "createdAt");

    // L'amministratore può ordinare anche per i campi riservati
    private static final Map<String, String> SORT_ADMIN;

    static {
        Map<String, String> admin = new HashMap<>(SORT_PUBBLICI);
        admin.put("prezzoAcquisto", "prezzoAcquisto");
        admin.put("pubblicata", "pubblicata");
        admin.put("aggiornate", "updatedAt");
        SORT_ADMIN = Map.copyOf(admin);
    }

    private static final Sort SORT_PREDEFINITO = Sort.by(Sort.Direction.DESC, "createdAt");

    private final AutoRepository autoRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional(readOnly = true)
    public PageResponse<AutoPubblicaResponse> catalogo(AutoSearchParams params, Pageable pageable) {
        Pageable richiesta = conSort(pageable, SORT_PUBBLICI);
        return PageResponse.of(autoRepository.findAll(AutoSpecifications.da(params, true), richiesta)
                .map(AutoPubblicaResponse::of));
    }

    @Transactional(readOnly = true)
    public AutoPubblicaResponse dettaglioPubblico(UUID id) {
        return AutoPubblicaResponse.of(trovaPubblicata(id));
    }

    @Transactional(readOnly = true)
    public PageResponse<AutoAdminResponse> elencoAdmin(AutoSearchParams params, Pageable pageable) {
        Pageable richiesta = conSort(pageable, SORT_ADMIN);
        return PageResponse.of(autoRepository.findAll(AutoSpecifications.da(params, false), richiesta)
                .map(AutoAdminResponse::of));
    }

    @Transactional(readOnly = true)
    public AutoAdminResponse dettaglioAdmin(UUID id) {
        return AutoAdminResponse.of(trova(id));
    }

    @Transactional
    public AutoAdminResponse crea(AutoRequest r) {
        Auto auto = new Auto();
        applica(auto, r);
        auto.setPrezzo(r.prezzo());
        autoRepository.save(auto);
        log.info("Creata auto={}", auto.getId());
        return AutoAdminResponse.of(auto);
    }

    @Transactional
    public AutoAdminResponse modifica(UUID id, AutoRequest r) {
        Auto auto = trova(id);
        applica(auto, r);
        cambiaPrezzo(auto, r.prezzo());
        return AutoAdminResponse.of(auto);
    }

    @Transactional
    public AutoAdminResponse modificaPrezzo(UUID id, PrezzoRequest r) {
        Auto auto = trova(id);
        cambiaPrezzo(auto, r.prezzo());
        return AutoAdminResponse.of(auto);
    }

    // Unico punto in cui cambia il prezzo di un'auto esistente. Solo un ribasso può far scattare un avviso:
    // l'evento viene consegnato agli ascoltatori dopo il commit, quindi mai per un salvataggio fallito
    private void cambiaPrezzo(Auto auto, BigDecimal nuovo) {
        BigDecimal vecchio = auto.getPrezzo();
        if (vecchio.compareTo(nuovo) == 0) {
            return;
        }
        auto.setPrezzo(nuovo);
        log.info("Prezzo cambiato auto={}", auto.getId());
        if (nuovo.compareTo(vecchio) < 0) {
            eventPublisher.publishEvent(new PrezzoRibassato(auto.getId(), vecchio, nuovo));
        }
    }

    private static void applica(Auto auto, AutoRequest r) {
        auto.setMarca(r.marca().trim());
        auto.setModello(r.modello().trim());
        auto.setAnno(r.anno());
        auto.setChilometri(r.chilometri());
        auto.setAlimentazione(r.alimentazione());
        auto.setDescrizione(r.descrizione() == null || r.descrizione().isBlank() ? null : r.descrizione().trim());
        auto.setImmagineUrl(r.immagineUrl() == null || r.immagineUrl().isBlank() ? null : r.immagineUrl().trim());
        auto.setPrezzoAcquisto(r.prezzoAcquisto());
        auto.setPubblicata(r.pubblicata());
    }

    Auto trovaPubblicata(UUID id) {
        return autoRepository.findByIdAndPubblicataTrue(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Auto non trovata"));
    }

    private Auto trova(UUID id) {
        return autoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Auto non trovata"));
    }

    private static Pageable conSort(Pageable pageable, Map<String, String> consentiti) {
        Sort sort = SearchUtils.traduciSort(pageable.getSort(), consentiti, SORT_PREDEFINITO);
        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
    }
}
