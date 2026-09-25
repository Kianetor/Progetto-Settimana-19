package kian.backend.repositories;

import kian.backend.entities.TokenJwt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TokenJwtRepository extends JpaRepository<TokenJwt, UUID> {

    Optional<TokenJwt> findByTokenHash(String tokenHash);
}
