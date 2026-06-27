package com.entreprise.missions.core.dto;

import com.entreprise.missions.data.model.MissionStatus;
import com.entreprise.missions.data.model.Priorite;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record MissionDto(
        Long id,
        String code,
        String titre,
        String description,
        String clientNom,
        String localisation,
        LocalDate dateDebut,
        LocalDate dateFin,
        MissionStatus status,
        Priorite priorite,
        BigDecimal budget,
        boolean actif,
        int nombreAffectations,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
