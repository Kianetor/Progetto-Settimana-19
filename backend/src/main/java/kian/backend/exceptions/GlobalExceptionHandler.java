package kian.backend.exceptions;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.Map;

// Risposte di errore in un formato unico: { "status": ..., "message": ... } oppure { "status": 400, "errors": {...} }
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, Object> validazione(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(e -> errors.putIfAbsent(e.getField(), e.getDefaultMessage()));
        return Map.of("status", 400, "errors", errors);
    }

    // JSON malformato o tipo sbagliato: non restituiamo il dettaglio del parser
    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, Object> richiestaNonValida(Exception ex) {
        return Map.of("status", 400, "message", "Richiesta non valida");
    }

    // Due modifiche contemporanee della stessa auto: la seconda deve ricaricare i dati
    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public Map<String, Object> conflitto(ObjectOptimisticLockingFailureException ex) {
        return Map.of("status", 409, "message", "Dati modificati da un'altra richiesta, ricarica e riprova");
    }

    // Vincolo del database violato (es. due richieste identiche contemporanee): niente dettagli SQL al client
    @ExceptionHandler(DataIntegrityViolationException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public Map<String, Object> vincolo(DataIntegrityViolationException ex) {
        return Map.of("status", 409, "message", "Operazione in conflitto con i dati esistenti");
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> stato(ResponseStatusException ex) {
        int status = ex.getStatusCode().value();
        String message = ex.getReason() != null ? ex.getReason() : "Errore";
        return ResponseEntity.status(status).body(Map.of("status", status, "message", message));
    }
}
