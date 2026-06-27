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
        existing.setTauxOccupation(80);

        when(utilisateurService.findEntity(1L)).thenReturn(employe);
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
}
