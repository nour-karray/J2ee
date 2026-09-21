package com.entreprise.missions.core.service;

import com.entreprise.missions.core.dto.AffectationRequest;
import com.entreprise.missions.core.exception.BusinessException;
import com.entreprise.missions.data.model.Affectation;
import com.entreprise.missions.data.model.AffectationStatus;
import com.entreprise.missions.data.model.Mission;
import com.entreprise.missions.data.model.Role;
import com.entreprise.missions.data.model.Utilisateur;
import com.entreprise.missions.data.repository.AffectationRepository;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AffectationServiceTest {

    @Mock
    private AffectationRepository affectationRepository;

    @Mock
    private UtilisateurService utilisateurService;

    @Mock
    private MissionService missionService;

    @InjectMocks
    private AffectationService affectationService;

    @Test
    void shouldRejectAssignmentWhenOccupationWouldExceedOneHundredPercent() {
        Utilisateur employe = new Utilisateur();
        employe.setRole(Role.EMPLOYE);
        employe.setActif(true);

        Mission mission = new Mission();
        mission.setActif(true);
        mission.setDateDebut(LocalDate.of(2026, 4, 1));
        mission.setDateFin(LocalDate.of(2026, 5, 30));

        Affectation existing = new Affectation();
        existing.setActif(true);
        existing.setDateDebut(LocalDate.of(2026, 4, 1));
        existing.setDateFin(LocalDate.of(2026, 4, 30));
        existing.setTauxOccupation(80);

        when(utilisateurService.findEntityForAssignment(1L)).thenReturn(employe);
        when(missionService.findEntity(2L)).thenReturn(mission);
        when(affectationRepository.findOverlappingForEmploye(any(), any(), any(), isNull())).thenReturn(List.of(existing));

        AffectationRequest request = new AffectationRequest(
                1L,
                2L,
                LocalDate.of(2026, 4, 10),
                LocalDate.of(2026, 4, 20),
                30,
                AffectationStatus.ACTIVE,
                "Charge trop élevée"
        );

        assertThrows(BusinessException.class, () -> affectationService.create(request));
    }

    @Test
    void shouldAllowDisjointAssignmentsWhenTheirMaximumConcurrentLoadIsWithinLimit() {
        Utilisateur employe = new Utilisateur();
        employe.setRole(Role.EMPLOYE);
        employe.setActif(true);
        Mission mission = new Mission();
        mission.setActif(true);
        mission.setDateDebut(LocalDate.of(2026, 1, 1));
        mission.setDateFin(LocalDate.of(2026, 1, 31));

        Affectation first = assignment(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 10), 40);
        Affectation second = assignment(LocalDate.of(2026, 1, 20), LocalDate.of(2026, 1, 31), 40);
        when(utilisateurService.findEntityForAssignment(1L)).thenReturn(employe);
        when(missionService.findEntity(2L)).thenReturn(mission);
        when(affectationRepository.findOverlappingForEmploye(any(), any(), any(), isNull())).thenReturn(List.of(first, second));
        when(affectationRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        AffectationRequest request = new AffectationRequest(1L, 2L, LocalDate.of(2026, 1, 1),
                LocalDate.of(2026, 1, 31), 50, AffectationStatus.ACTIVE, null);

        org.junit.jupiter.api.Assertions.assertDoesNotThrow(() -> affectationService.create(request));
    }

    @Test
    void shouldAllowExactlyOneHundredPercentAndRejectPartialOverlapAboveIt() {
        Utilisateur employe = new Utilisateur();
        employe.setRole(Role.EMPLOYE);
        employe.setActif(true);
        Mission mission = new Mission();
        mission.setActif(true);
        mission.setDateDebut(LocalDate.of(2026, 1, 1));
        mission.setDateFin(LocalDate.of(2026, 1, 31));
        when(utilisateurService.findEntityForAssignment(1L)).thenReturn(employe);
        when(missionService.findEntity(2L)).thenReturn(mission);
        when(affectationRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        when(affectationRepository.findOverlappingForEmploye(any(), any(), any(), isNull()))
                .thenReturn(List.of(assignment(LocalDate.of(2026, 1, 5), LocalDate.of(2026, 1, 15), 60)));
        org.junit.jupiter.api.Assertions.assertDoesNotThrow(() -> affectationService.create(new AffectationRequest(1L, 2L,
                LocalDate.of(2026, 1, 5), LocalDate.of(2026, 1, 15), 40, AffectationStatus.ACTIVE, null)));

        when(affectationRepository.findOverlappingForEmploye(any(), any(), any(), isNull())).thenReturn(List.of(
                assignment(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 10), 60),
                assignment(LocalDate.of(2026, 1, 8), LocalDate.of(2026, 1, 20), 30)));
        assertThrows(BusinessException.class, () -> affectationService.create(new AffectationRequest(1L, 2L,
                LocalDate.of(2026, 1, 5), LocalDate.of(2026, 1, 15), 20, AffectationStatus.ACTIVE, null)));
    }

    private Affectation assignment(LocalDate start, LocalDate end, int rate) {
        Affectation assignment = new Affectation();
        assignment.setActif(true);
        assignment.setDateDebut(start);
        assignment.setDateFin(end);
        assignment.setTauxOccupation(rate);
        return assignment;
    }
}
