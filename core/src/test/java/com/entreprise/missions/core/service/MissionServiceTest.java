package com.entreprise.missions.core.service;

import com.entreprise.missions.core.dto.MissionRequest;
import com.entreprise.missions.core.exception.BusinessException;
import com.entreprise.missions.data.model.MissionStatus;
import com.entreprise.missions.data.model.Priorite;
import com.entreprise.missions.data.repository.AffectationRepository;
import com.entreprise.missions.data.repository.MissionRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertThrows;

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
}
