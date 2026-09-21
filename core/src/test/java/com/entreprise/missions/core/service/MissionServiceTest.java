package com.entreprise.missions.core.service;

import com.entreprise.missions.core.dto.MissionRequest;
import com.entreprise.missions.core.exception.BusinessException;
import com.entreprise.missions.data.model.MissionStatus;
import com.entreprise.missions.data.model.Mission;
import com.entreprise.missions.data.model.Affectation;
import com.entreprise.missions.data.model.Priorite;
import com.entreprise.missions.data.repository.AffectationRepository;
import com.entreprise.missions.data.repository.MissionRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MissionServiceTest {

    @Mock
    private MissionRepository missionRepository;

    @Mock
    private AffectationRepository affectationRepository;

    @InjectMocks
    private MissionService missionService;

    @Test
    void shouldRejectMissionWhenEndDateIsBeforeStartDate() {
        MissionRequest request = new MissionRequest(
                "MIS-001",
                "Mission invalide",
                "Description",
                "Client",
                "Lagos",
                LocalDate.of(2026, 4, 30),
                LocalDate.of(2026, 4, 20),
                MissionStatus.PLANIFIEE,
                Priorite.HAUTE,
                new BigDecimal("5000")
        );

        assertThrows(BusinessException.class, () -> missionService.create(request));
    }

    @Test
    void shouldRejectMissionWindowThatExcludesAnActiveAssignment() {
        Mission mission = new Mission();
        mission.setCode("MIS-001");
        mission.setDateDebut(LocalDate.of(2026, 1, 1));
        mission.setDateFin(LocalDate.of(2026, 1, 31));
        Affectation assignment = new Affectation();
        assignment.setActif(true);
        assignment.setDateDebut(LocalDate.of(2026, 1, 5));
        assignment.setDateFin(LocalDate.of(2026, 1, 25));
        mission.setAffectations(List.of(assignment));
        when(missionRepository.findById(1L)).thenReturn(Optional.of(mission));

        MissionRequest request = new MissionRequest("MIS-001", "Mission", "Description", "Client", "Tunis",
                LocalDate.of(2026, 1, 10), LocalDate.of(2026, 1, 20), MissionStatus.EN_COURS,
                Priorite.HAUTE, new BigDecimal("1"));
        assertThrows(BusinessException.class, () -> missionService.update(1L, request));
    }
}
