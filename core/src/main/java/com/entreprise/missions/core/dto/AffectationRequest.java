package com.entreprise.missions.core.dto;

import com.entreprise.missions.data.model.AffectationStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record AffectationRequest(
        @NotNull(message = "L'employé est obligatoire")
        Long employeId,
        @NotNull(message = "La mission est obligatoire")
        Long missionId,
        @NotNull(message = "La date de début est obligatoire")
        LocalDate dateDebut,
        @NotNull(message = "La date de fin est obligatoire")
        LocalDate dateFin,
        @NotNull(message = "Le taux d'occupation est obligatoire")
        @Min(value = 1, message = "Le taux minimum est 1%")
        @Max(value = 100, message = "Le taux maximum est 100%")
        Integer tauxOccupation,
        @NotNull(message = "Le statut est obligatoire")
        AffectationStatus status,
        @Size(max = 800, message = "Le commentaire ne doit pas dépasser 800 caractères")
        String commentaire
) {
}
