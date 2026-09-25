package kian.backend.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "preferiti",
        uniqueConstraints = @UniqueConstraint(name = "preferiti_utente_auto_unique", columnNames = {"utente_id", "auto_id"}))
@Getter
@Setter
@NoArgsConstructor
public class Preferito {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "utente_id", nullable = false)
    private Utente utente;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "auto_id", nullable = false)
    private Auto auto;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }
}
