package kian.backend.services;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;
import java.util.Map;

// Ricerche costruite con la Criteria API: i valori arrivano al database come parametri legati, mai concatenati
final class SearchUtils {

    private SearchUtils() {
    }

    static Predicate like(CriteriaBuilder cb, Expression<String> campo, String testo) {
        return cb.like(cb.lower(campo), likePattern(testo), '\\');
    }

    // "Contiene", senza distinguere maiuscole; % e _ scritti dall'utente valgono come caratteri normali
    static String likePattern(String testo) {
        String escaped = testo.trim().toLowerCase(Locale.ROOT)
                .replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
        return "%" + escaped + "%";
    }

    static boolean presente(String s) {
        return s != null && !s.isBlank();
    }

    // Il nome della colonna di ordinamento non si può legare come parametro:
    // lo confrontiamo con un elenco chiuso e lo traduciamo nella proprietà JPA. Fuori elenco -> 400
    static Sort traduciSort(Sort richiesto, Map<String, String> consentiti, Sort predefinito) {
        if (richiesto.isUnsorted()) {
            return predefinito;
        }
        return Sort.by(richiesto.stream()
                .map(o -> {
                    String proprieta = consentiti.get(o.getProperty());
                    if (proprieta == null) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                "Ordinamento non consentito. Valori ammessi: " + consentiti.keySet());
                    }
                    return new Sort.Order(o.getDirection(), proprieta);
                })
                .toList());
    }
}
