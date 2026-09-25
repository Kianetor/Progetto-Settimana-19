package kian.backend.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Check;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "auto")
@Check(name = "auto_prezzi_check", constraints = "prezzo > 0 AND prezzo_acquisto > 0")
@Getter
@Setter
@NoArgsConstructor
public class Auto {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 60)
    private String marca;

    @Column(nullable = false, length = 80)
    private String modello;

    @Column(nullable = false)
    private Integer anno;

    @Column(nullable = false)
    private Integer chilometri;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Alimentazione alimentazione;

    // Testo libero dell'amministratore: il frontend lo mostra sempre come testo, mai come HTML
    @Column(columnDefinition = "TEXT")
    private String descrizione;

    // Solo indirizzi https (controllato nel DTO): niente "javascript:" dentro un attributo src/href
    @Column(name = "immagine_url", length = 500)
    private String immagineUrl;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal prezzo;

    // Dato riservato: esce solo nelle risposte per l'amministratore
    @Column(name = "prezzo_acquisto", nullable = false, precision = 10, scale = 2)
    private BigDecimal prezzoAcquisto;

    // false = bozza, visibile solo all'amministratore
    @Column(nullable = false)
    private boolean pubblicata = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    // Blocco ottimistico: due modifiche contemporanee non si sovrascrivono in silenzio
    @Version
    private Long version;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
