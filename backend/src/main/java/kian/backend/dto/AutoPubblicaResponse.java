package kian.backend.dto;

import kian.backend.entities.Alimentazione;
import kian.backend.entities.Auto;

import java.math.BigDecimal;
import java.util.UUID;

// Quello che vede chiunque: niente prezzo d'acquisto né stato di pubblicazione
public record AutoPubblicaResponse(
        UUID id,
        String marca,
        String modello,
        Integer anno,
        Integer chilometri,
        Alimentazione alimentazione,
        String descrizione,
        String immagineUrl,
        BigDecimal prezzo
) {
    public static AutoPubblicaResponse of(Auto a) {
        return new AutoPubblicaResponse(a.getId(), a.getMarca(), a.getModello(), a.getAnno(), a.getChilometri(),
                a.getAlimentazione(), a.getDescrizione(), a.getImmagineUrl(), a.getPrezzo());
    }
}
