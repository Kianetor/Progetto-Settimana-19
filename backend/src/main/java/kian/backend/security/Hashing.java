package kian.backend.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;

// Token casuali e loro hash: nel DB finisce solo l'hash, il valore in chiaro lo conosce solo chi lo riceve
public final class Hashing {

    private static final SecureRandom RANDOM = new SecureRandom();

    private Hashing() {
    }

    public static String sha256(String valore) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(valore.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 non disponibile", e);
        }
    }

    // 32 byte casuali (256 bit) in Base64 URL-safe: non indovinabile e utilizzabile in un link
    public static String tokenCasuale() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
