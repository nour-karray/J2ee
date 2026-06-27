package com.entreprise.missions.core.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Le prenom est obligatoire")
        @Size(max = 80, message = "Le prenom ne doit pas depasser 80 caracteres")
        String prenom,
        @NotBlank(message = "Le nom est obligatoire")
        @Size(max = 80, message = "Le nom ne doit pas depasser 80 caracteres")
        String nom,
        @Email(message = "Adresse email invalide")
        @NotBlank(message = "L'email est obligatoire")
        String email,
        @Size(max = 30, message = "Le telephone ne doit pas depasser 30 caracteres")
        String telephone,
        @NotBlank(message = "Le mot de passe est obligatoire")
        @Size(min = 8, max = 100, message = "Le mot de passe doit contenir au moins 8 caracteres")
        String motDePasse,
        @NotNull(message = "La specialite est obligatoire")
        Long specialiteId
) {
}
