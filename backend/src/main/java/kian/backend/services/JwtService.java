package kian.backend.services;

import kian.backend.dto.LoginResponse;
import kian.backend.entities.TokenJwt;
import kian.backend.entities.Utente;
import kian.backend.repositories.TokenJwtRepository;
import kian.backend.security.Hashing;
import kian.backend.security.SecurityConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JwtService {

    private final JwtEncoder jwtEncoder;
    private final TokenJwtRepository tokenJwtRepository;

    @Value("${app.jwt.expiration-minutes}")
    private long expirationMinutes;

    // Nel token solo quello che serve al server: id utente (sub) e ruolo. Niente email né nome
    @Transactional
    public LoginResponse emetti(Utente utente) {
        Instant now = Instant.now();
        Instant expiresAt = now.plus(expirationMinutes, ChronoUnit.MINUTES);

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .id(UUID.randomUUID().toString())
                .subject(utente.getId().toString())
                .issuedAt(now)
                .expiresAt(expiresAt)
                .claim(SecurityConfig.ROLES_CLAIM, List.of(utente.getRuolo().name()))
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        String token = jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();

        TokenJwt registrato = new TokenJwt();
        registrato.setUtente(utente);
        registrato.setTokenHash(Hashing.sha256(token));
        registrato.setExpiresAt(expiresAt);
        tokenJwtRepository.save(registrato);

        return new LoginResponse(token, "Bearer", expiresAt);
    }

    @Transactional
    public void revoca(String token) {
        tokenJwtRepository.findByTokenHash(Hashing.sha256(token))
                .ifPresent(t -> t.setRevocato(true));
    }
}
