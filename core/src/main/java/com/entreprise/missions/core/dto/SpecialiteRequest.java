package com.entreprise.missions.core.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SpecialiteRequest(
        @NotBlank(message = "Le nom de la spécialité est obligatoire")
        @Size(max = 120, message = "Le nom ne doit pas dépasser 120 caractères")
        String nom,
        @Size(max = 500, message = "La description ne doit pas dépasser 500 caractères")
        String description
) {
}
