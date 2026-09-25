package kian.backend.dto;

import kian.backend.entities.Alimentazione;
import kian.backend.entities.Auto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

// Vista completa per l'amministratore, bozze e prezzo d'acquisto compresi
public record AutoAdminResponse(
        UUID id,
        String marca,
        String modello,
        Integer anno,
        Integer chilometri,
        Alimentazione alimentazione,
        String descrizione,
        String immagineUrl,
        BigDecimal prezzo,
        BigDecimal prezzoAcquisto,
        boolean pubblicata,
        Instant createdAt,
        Instant updatedAt
) {
    public static AutoAdminResponse of(Auto a) {
        return new AutoAdminResponse(a.getId(), a.getMarca(), a.getModello(), a.getAnno(), a.getChilometri(),
                a.getAlimentazione(), a.getDescrizione(), a.getImmagineUrl(), a.getPrezzo(), a.getPrezzoAcquisto(),
                a.isPubblicata(), a.getCreatedAt(), a.getUpdatedAt());
    }
}
