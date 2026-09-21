package com.entreprise.missions.core.service;

import com.entreprise.missions.core.dto.DashboardAlertDto;
import com.entreprise.missions.core.dto.DashboardDto;
import com.entreprise.missions.core.dto.DashboardMissionDto;
import com.entreprise.missions.data.model.AffectationStatus;
import com.entreprise.missions.data.model.MissionStatus;
import com.entreprise.missions.data.model.Role;
import com.entreprise.missions.data.repository.AffectationRepository;
import com.entreprise.missions.data.repository.MissionRepository;
import com.entreprise.missions.data.repository.SpecialiteRepository;
import com.entreprise.missions.data.repository.UtilisateurRepository;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final UtilisateurRepository utilisateurRepository;
    private final SpecialiteRepository specialiteRepository;
    private final MissionRepository missionRepository;
    private final AffectationRepository affectationRepository;

    public DashboardService(
            UtilisateurRepository utilisateurRepository,
            SpecialiteRepository specialiteRepository,
            MissionRepository missionRepository,
            AffectationRepository affectationRepository
    ) {
        this.utilisateurRepository = utilisateurRepository;
        this.specialiteRepository = specialiteRepository;
        this.missionRepository = missionRepository;
        this.affectationRepository = affectationRepository;
    }

    public DashboardDto getDashboard() {
        LocalDate today = LocalDate.now();
        LocalDate warningDate = today.plusDays(7);

        return new DashboardDto(
                utilisateurRepository.countByRoleAndActifTrue(Role.EMPLOYE),
                specialiteRepository.countByActifTrue(),
                missionRepository.countByStatusAndActifTrue(MissionStatus.PLANIFIEE),
                missionRepository.countByStatusAndActifTrue(MissionStatus.EN_COURS),
                affectationRepository.countByStatusAndActifTrue(AffectationStatus.ACTIVE),
                affectationRepository.findAssignmentsEndingBetween(today, warningDate)
                        .stream()
                        .map(affectation -> new DashboardAlertDto(
                                affectation.getId(),
                                affectation.getEmploye().getNomComplet(),
                                affectation.getMission().getTitre(),
                                affectation.getDateFin(),
                                (int) ChronoUnit.DAYS.between(today, affectation.getDateFin())
                        ))
                        .toList(),
                missionRepository.findTop5ByActifTrueAndPrioriteIsNotNull().stream()
                        .map(mission -> new DashboardMissionDto(
                                mission.getId(),
                                mission.getCode(),
                                mission.getTitre(),
                                mission.getStatus(),
                                mission.getPriorite(),
                                mission.getDateFin(),
                                (int) mission.getAffectations().stream().filter(a -> a.isActif()).count()
                        ))
                        .toList()
        );
    }
}
