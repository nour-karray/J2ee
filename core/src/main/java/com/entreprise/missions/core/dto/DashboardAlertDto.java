package com.entreprise.missions.core.dto;

import java.time.LocalDate;

public record DashboardAlertDto(
        Long affectationId,
        String employeNom,
        String missionTitre,
        LocalDate dateFin,
        Integer joursRestants
) {
}
