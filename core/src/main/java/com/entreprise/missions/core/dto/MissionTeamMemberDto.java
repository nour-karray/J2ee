package com.entreprise.missions.core.dto;

import com.entreprise.missions.data.model.AffectationStatus;
import java.time.LocalDate;

public record MissionTeamMemberDto(
        Long affectationId,
        Long employeId,
        String matricule,
        String nomComplet,
        String email,
        String telephone,
        String specialite,
        LocalDate dateDebut,
        LocalDate dateFin,
        Integer tauxOccupation,
        AffectationStatus status
) {
}
