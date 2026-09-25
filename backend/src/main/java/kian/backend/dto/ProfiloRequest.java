package kian.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// Dal profilo si cambia solo il nome: email, ruolo e password non passano da qui
public record ProfiloRequest(
        @NotBlank @Size(max = 60) String nome
) {
}
