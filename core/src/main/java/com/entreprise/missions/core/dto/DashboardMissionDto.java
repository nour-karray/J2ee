package com.entreprise.missions.core.dto;

import com.entreprise.missions.data.model.MissionStatus;
import com.entreprise.missions.data.model.Priorite;
import java.time.LocalDate;

public record DashboardMissionDto(
        Long id,
        String code,
        String titre,
        MissionStatus status,
        Priorite priorite,
        LocalDate dateFin,
        int nombreAffectations
) {
}
