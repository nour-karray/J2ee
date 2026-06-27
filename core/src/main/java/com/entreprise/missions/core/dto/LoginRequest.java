package com.entreprise.missions.core.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @Email(message = "Adresse email invalide")
        @NotBlank(message = "L'email est obligatoire")
        String email,
        @NotBlank(message = "Le mot de passe est obligatoire")
        String motDePasse
) {
}
