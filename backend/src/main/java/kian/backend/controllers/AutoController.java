package kian.backend.controllers;

import kian.backend.dto.AutoPubblicaResponse;
import kian.backend.dto.AutoSearchParams;
import kian.backend.dto.PageResponse;
import kian.backend.services.AutoService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

// Catalogo pubblico: solo auto pubblicate, senza dati riservati
@RestController
@RequestMapping("/api/auto")
@RequiredArgsConstructor
@PreAuthorize("permitAll()")
public class AutoController {

    private final AutoService autoService;

    // Esempio: /api/auto?q=golf&alimentazione=DIESEL&prezzoMax=20000&sort=prezzo,asc&page=0&size=12
    @GetMapping
    public PageResponse<AutoPubblicaResponse> catalogo(@ModelAttribute AutoSearchParams params,
                                                       @PageableDefault(size = 12) Pageable pageable) {
        return autoService.catalogo(params, pageable);
    }

    @GetMapping("/{id}")
    public AutoPubblicaResponse dettaglio(@PathVariable UUID id) {
        return autoService.dettaglioPubblico(id);
    }
}
