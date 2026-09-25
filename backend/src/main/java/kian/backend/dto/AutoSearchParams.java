package kian.backend.dto;

import kian.backend.entities.Alimentazione;

import java.math.BigDecimal;

// Filtri del catalogo da query string, tutti facoltativi e combinati in AND
public record AutoSearchParams(
        String q,                 // testo libero su marca, modello e descrizione
        String marca,
        Alimentazione alimentazione,
        BigDecimal prezzoMin,
        BigDecimal prezzoMax,
        Integer annoMin,
        Integer kmMax,
        Boolean pubblicata        // considerato solo nella ricerca dell'amministratore
) {
}
