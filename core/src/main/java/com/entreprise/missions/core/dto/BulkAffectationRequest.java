package com.entreprise.missions.core.dto;

import com.entreprise.missions.data.model.AffectationStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

public record BulkAffectationRequest(
        @NotEmpty(message = "Sélectionnez au moins un employé") List<@NotNull Long> employeIds,
        @NotNull Long missionId,
        @NotNull LocalDate dateDebut,
        @NotNull LocalDate dateFin,
        @NotNull @Min(1) @Max(100) Integer tauxOccupation,
        @NotNull AffectationStatus status,
        @Size(max = 800) String commentaire
) {
}
