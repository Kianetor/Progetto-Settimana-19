package kian.backend.repositories;

import kian.backend.entities.Avviso;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AvvisoRepository extends JpaRepository<Avviso, UUID> {

    // Ogni ricerca per id passa anche dal proprietario: l'avviso di un altro utente "non esiste" (404)
    @EntityGraph(attributePaths = "auto")
    Optional<Avviso> findByIdAndUtenteId(UUID id, UUID utenteId);

    @EntityGraph(attributePaths = "auto")
    List<Avviso> findByUtenteIdAndAutoPubblicataTrueOrderByCreatedAtDesc(UUID utenteId);

    boolean existsByUtenteIdAndAutoId(UUID utenteId, UUID autoId);

    // Avvisi la cui soglia è stata attraversata: prima il prezzo era sopra (soglia < vecchio),
    // adesso è uguale o sotto (soglia >= nuovo). Stesso prezzo o ulteriore ribasso non rientrano
    @Query("SELECT a.id FROM Avviso a WHERE a.auto.id = :autoId AND a.auto.pubblicata = true "
            + "AND a.attivo = true AND a.inviato = false AND a.soglia < :vecchio AND a.soglia >= :nuovo")
    List<UUID> idSogliaAttraversata(@Param("autoId") UUID autoId,
                                    @Param("vecchio") BigDecimal vecchio,
                                    @Param("nuovo") BigDecimal nuovo);

    // Prende il segno "inviato" in un colpo solo: con due modifiche ravvicinate solo una delle due
    // aggiorna la riga (restituisce 1) e solo quella spedisce la mail
    @Transactional
    @Modifying(clearAutomatically = true)
    @Query("UPDATE Avviso a SET a.inviato = true, a.inviatoAt = :ora, a.tokenDisattivazioneHash = :tokenHash "
            + "WHERE a.id = :id AND a.inviato = false AND a.attivo = true")
    int segnaInviato(@Param("id") UUID id, @Param("tokenHash") String tokenHash, @Param("ora") Instant ora);

    // Link della mail: il token vale una volta sola perché l'hash viene cancellato insieme alla disattivazione
    @Transactional
    @Modifying(clearAutomatically = true)
    @Query("UPDATE Avviso a SET a.attivo = false, a.tokenDisattivazioneHash = null "
            + "WHERE a.tokenDisattivazioneHash = :tokenHash")
    int disattivaConToken(@Param("tokenHash") String tokenHash);

    // Dati per comporre la mail (utente e auto nella stessa query)
    @EntityGraph(attributePaths = {"utente", "auto"})
    Optional<Avviso> findConDettagliById(UUID id);
}
