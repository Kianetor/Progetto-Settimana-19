package kian.backend.services;

import jakarta.persistence.criteria.Predicate;
import kian.backend.dto.AutoSearchParams;
import kian.backend.entities.Auto;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

import static kian.backend.services.SearchUtils.like;
import static kian.backend.services.SearchUtils.presente;

final class AutoSpecifications {

    private AutoSpecifications() {
    }

    // soloPubblicate = true per il catalogo pubblico: le bozze vengono escluse qualunque filtro arrivi
    static Specification<Auto> da(AutoSearchParams p, boolean soloPubblicate) {
        return (root, query, cb) -> {
            List<Predicate> filtri = new ArrayList<>();

            if (soloPubblicate) {
                filtri.add(cb.isTrue(root.get("pubblicata")));
            } else if (p.pubblicata() != null) {
                filtri.add(cb.equal(root.get("pubblicata"), p.pubblicata()));
            }
            if (presente(p.q())) {
                filtri.add(cb.or(
                        like(cb, root.get("marca"), p.q()),
                        like(cb, root.get("modello"), p.q()),
                        like(cb, root.get("descrizione"), p.q())));
            }
            if (presente(p.marca())) filtri.add(like(cb, root.get("marca"), p.marca()));
            if (p.alimentazione() != null) filtri.add(cb.equal(root.get("alimentazione"), p.alimentazione()));
            if (p.prezzoMin() != null) filtri.add(cb.greaterThanOrEqualTo(root.get("prezzo"), p.prezzoMin()));
            if (p.prezzoMax() != null) filtri.add(cb.lessThanOrEqualTo(root.get("prezzo"), p.prezzoMax()));
            if (p.annoMin() != null) filtri.add(cb.greaterThanOrEqualTo(root.get("anno"), p.annoMin()));
            if (p.kmMax() != null) filtri.add(cb.lessThanOrEqualTo(root.get("chilometri"), p.kmMax()));

            return cb.and(filtri.toArray(Predicate[]::new));
        };
    }
}
