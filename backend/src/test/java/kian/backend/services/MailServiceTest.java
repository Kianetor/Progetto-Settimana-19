package kian.backend.services;

import kian.backend.entities.Auto;
import kian.backend.entities.Avviso;
import kian.backend.entities.Utente;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class MailServiceTest {

    @Test
    void ilTemplateFaLEscapeDiOgniValore() {
        Utente utente = new Utente();
        utente.setNome("<script>alert('nome')</script>");
        Auto auto = new Auto();
        auto.setMarca("<img src=x onerror=alert(1)>");
        auto.setModello("Golf \"GTI\"");
        auto.setPrezzo(new BigDecimal("12000"));
        Avviso avviso = new Avviso();
        avviso.setUtente(utente);
        avviso.setAuto(auto);
        avviso.setSoglia(new BigDecimal("12500"));

        String html = MailService.corpoHtml(avviso, auto, "http://localhost:5173/disattiva-avviso#token=abc\"><x");

        assertFalse(html.contains("<script>"));
        assertFalse(html.contains("<img"));
        assertFalse(html.contains("\"><x"));
        assertTrue(html.contains("&lt;script&gt;"));
        assertTrue(html.contains("&lt;img src=x onerror=alert(1)&gt;"));
        assertTrue(html.contains("Golf &quot;GTI&quot;"));
    }

    @Test
    void lOggettoNonContieneACapo() {
        Auto auto = new Auto();
        auto.setMarca("Fiat\r\nBcc: tutti@esempio.it");
        auto.setModello("500");

        String oggetto = MailService.oggetto(auto);

        assertFalse(oggetto.contains("\n"));
        assertFalse(oggetto.contains("\r"));
    }
}
