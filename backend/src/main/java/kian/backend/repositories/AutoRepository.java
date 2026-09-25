package kian.backend.repositories;

import kian.backend.entities.Auto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface AutoRepository extends JpaRepository<Auto, UUID>, JpaSpecificationExecutor<Auto> {

    // Per il pubblico una bozza non esiste: stessa risposta (404) di un id inesistente
    Optional<Auto> findByIdAndPubblicataTrue(UUID id);
}
