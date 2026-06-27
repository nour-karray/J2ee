package com.entreprise.missions.core.dto;

import java.util.List;

public record DashboardDto(
        long totalEmployes,
        long totalSpecialites,
        long missionsPlanifiees,
        long missionsActives,
        long affectationsActives,
        List<DashboardAlertDto> alertesFinProche,
        List<DashboardMissionDto> missionsPrioritaires
) {
}
