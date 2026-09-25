package kian.backend.controllers;

import jakarta.validation.Valid;
import kian.backend.dto.*;
import kian.backend.services.AutoService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

// Solo amministratore: senza token 401, con token di un utente normale 403
@RestController
@RequestMapping("/api/admin/auto")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminAutoController {

    private final AutoService autoService;

    // Anche le bozze; filtro facoltativo ?pubblicata=false
    @GetMapping
    public PageResponse<AutoAdminResponse> elenco(@ModelAttribute AutoSearchParams params,
                                                  @PageableDefault(size = 20) Pageable pageable) {
        return autoService.elencoAdmin(params, pageable);
    }

    @GetMapping("/{id}")
    public AutoAdminResponse dettaglio(@PathVariable UUID id) {
        return autoService.dettaglioAdmin(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AutoAdminResponse crea(@Valid @RequestBody AutoRequest request) {
        return autoService.crea(request);
    }

    @PutMapping("/{id}")
    public AutoAdminResponse modifica(@PathVariable UUID id, @Valid @RequestBody AutoRequest request) {
        return autoService.modifica(id, request);
    }

    @PatchMapping("/{id}/prezzo")
    public AutoAdminResponse modificaPrezzo(@PathVariable UUID id, @Valid @RequestBody PrezzoRequest request) {
        return autoService.modificaPrezzo(id, request);
    }
}
