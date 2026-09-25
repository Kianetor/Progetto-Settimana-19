package kian.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank @Email String email,
        @NotBlank String password
) {
    // Il toString generato dal record stamperebbe la password: se l'oggetto finisce in un log resta nascosta
    @Override
    public String toString() {
        return "LoginRequest[email=***, password=***]";
    }
}
