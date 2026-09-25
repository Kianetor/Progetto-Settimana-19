package kian.backend.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Check;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

// Avviso di prezzo: lega un utente a un'auto con una soglia. Una volta inviato resta inviato
@Entity
@Table(name = "avvisi",
        uniqueConstraints = @UniqueConstraint(name = "avvisi_utente_auto_unique", columnNames = {"utente_id", "auto_id"}))
@Check(name = "avvisi_soglia_check", constraints = "soglia > 0")
@Getter
@Setter
@NoArgsConstructor
public class Avviso {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "utente_id", nullable = false)
    private Utente utente;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "auto_id", nullable = false)
    private Auto auto;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal soglia;

    // Diventa true in un colpo solo (UPDATE ... WHERE inviato = false) prima di spedire la mail
    @Column(nullable = false)
    private boolean inviato = false;

    @Column(name = "inviato_at")
    private Instant inviatoAt;

    // false = disattivato dall'utente (anche dal link nella mail)
    @Column(nullable = false)
    private boolean attivo = true;

    // SHA-256 del token monouso del link di disattivazione; il token in chiaro esiste solo nella mail
    @Column(name = "token_disattivazione_hash", unique = true, length = 64)
    private String tokenDisattivazioneHash;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }
}
