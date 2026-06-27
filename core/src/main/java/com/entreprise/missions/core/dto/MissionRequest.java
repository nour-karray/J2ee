package com.entreprise.missions.core.dto;

import com.entreprise.missions.data.model.MissionStatus;
import com.entreprise.missions.data.model.Priorite;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public record MissionRequest(
        @Size(max = 40, message = "Le code ne doit pas depasser 40 caracteres")
        String code,
        @NotBlank(message = "Le titre est obligatoire")
        @Size(max = 150, message = "Le titre ne doit pas depasser 150 caracteres")
        String titre,
        @NotBlank(message = "La description est obligatoire")
        @Size(max = 1500, message = "La description ne doit pas depasser 1500 caracteres")
        String description,
        @NotBlank(message = "Le client est obligatoire")
        @Size(max = 120, message = "Le nom du client ne doit pas depasser 120 caracteres")
        String clientNom,
        @NotBlank(message = "La localisation est obligatoire")
        @Size(max = 120, message = "La localisation ne doit pas depasser 120 caracteres")
        String localisation,
        @NotNull(message = "La date de debut est obligatoire")
        LocalDate dateDebut,
        @NotNull(message = "La date de fin est obligatoire")
        LocalDate dateFin,
        @NotNull(message = "Le statut est obligatoire")
        MissionStatus status,
        @NotNull(message = "La priorite est obligatoire")
        Priorite priorite,
        BigDecimal budget
) {
}
