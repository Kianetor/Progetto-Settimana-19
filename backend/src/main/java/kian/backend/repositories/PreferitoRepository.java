package kian.backend.repositories;

import kian.backend.entities.Preferito;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

// Ogni ricerca per id passa anche dal proprietario: il preferito di un altro utente "non esiste" (404)
public interface PreferitoRepository extends JpaRepository<Preferito, UUID> {

    // Le auto tornate in bozza spariscono dai preferiti finché non vengono ripubblicate
    @EntityGraph(attributePaths = "auto")
    List<Preferito> findByUtenteIdAndAutoPubblicataTrueOrderByCreatedAtDesc(UUID utenteId);

    @EntityGraph(attributePaths = "auto")
    Optional<Preferito> findByIdAndUtenteId(UUID id, UUID utenteId);

    @EntityGraph(attributePaths = "auto")
    Optional<Preferito> findByUtenteIdAndAutoId(UUID utenteId, UUID autoId);
}
