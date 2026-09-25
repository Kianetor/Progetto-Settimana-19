package kian.backend.services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import kian.backend.entities.Auto;
import kian.backend.entities.Avviso;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.enabled}")
    private boolean mailAbilitata;

    @Value("${app.mail.from}")
    private String mittente;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public void inviaAvvisoPrezzo(Avviso avviso, String token) throws MessagingException {
        // Il token va dopo "#": il frammento non viene mai spedito al server, quindi non finisce nei log di accesso
        String link = frontendUrl.replaceAll("/+$", "") + "/disattiva-avviso#token=" + token;
        Auto auto = avviso.getAuto();

        if (!mailAbilitata) {
            // Modalità di prova senza Gmail (MAIL_ENABLED=false): il link serve per provare la disattivazione
            log.info("Mail simulata avviso={} link={}", avviso.getId(), link);
            return;
        }

        MimeMessage messaggio = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(messaggio, "UTF-8");
        helper.setFrom(mittente);
        helper.setTo(avviso.getUtente().getEmail());
        helper.setSubject(oggetto(auto));
        helper.setText(corpoHtml(avviso, auto, link), true);
        mailSender.send(messaggio);
    }

    // L'oggetto è testo semplice: tolgo gli a capo, che in un'intestazione potrebbero aggiungerne altre
    static String oggetto(Auto auto) {
        return ("Prezzo in calo: " + auto.getMarca() + " " + auto.getModello()).replaceAll("[\\r\\n]+", " ");
    }

    // Ogni valore che arriva da utenti o amministratore passa da htmlEscape prima di entrare nell'HTML
    static String corpoHtml(Avviso avviso, Auto auto, String link) {
        String nome = HtmlUtils.htmlEscape(avviso.getUtente().getNome());
        String titolo = HtmlUtils.htmlEscape(auto.getMarca() + " " + auto.getModello());
        String prezzo = HtmlUtils.htmlEscape(euro(auto.getPrezzo()));
        String soglia = HtmlUtils.htmlEscape(euro(avviso.getSoglia()));
        String href = HtmlUtils.htmlEscape(link);

        return """
                <!DOCTYPE html>
                <html lang="it">
                <body style="font-family: Arial, sans-serif; color: #1f2937;">
                  <h2>Buone notizie, %s!</h2>
                  <p>Il prezzo di <strong>%s</strong> è sceso a <strong>%s</strong>,
                     sotto la soglia di %s che avevi impostato.</p>
                  <p>Questo avviso non ti manderà altre mail.</p>
                  <p style="font-size: 12px; color: #6b7280;">
                    Non vuoi più questo avviso? <a href="%s">Disattivalo</a>.
                  </p>
                </body>
                </html>
                """.formatted(nome, titolo, prezzo, soglia, href);
    }

    private static String euro(BigDecimal valore) {
        return NumberFormat.getCurrencyInstance(Locale.ITALY).format(valore);
    }
}
