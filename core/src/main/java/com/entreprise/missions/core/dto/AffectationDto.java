package com.entreprise.missions.core.dto;

import com.entreprise.missions.data.model.AffectationStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record AffectationDto(
        Long id,
        Long employeId,
        String employeNom,
        String employeMatricule,
        Long missionId,
        String missionTitre,
        String missionCode,
        LocalDate dateDebut,
        LocalDate dateFin,
        Integer tauxOccupation,
        AffectationStatus status,
        String commentaire,
        boolean actif,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
