package com.entreprise.missions.core.service;

import com.entreprise.missions.core.dto.UtilisateurRequest;
import com.entreprise.missions.core.exception.BusinessException;
import com.entreprise.missions.data.model.Role;
import com.entreprise.missions.data.model.Utilisateur;
import com.entreprise.missions.data.model.Affectation;
import com.entreprise.missions.data.repository.UtilisateurRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;
import java.util.List;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
class UtilisateurServiceTest {

    @Mock
    private UtilisateurRepository utilisateurRepository;

    @Mock
    private SpecialiteService specialiteService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UtilisateurService utilisateurService;

    @Test
    void shouldRejectEmployeeWithoutSpecialite() {
        UtilisateurRequest request = new UtilisateurRequest(
                "EMP-100",
                "Aya",
                "Ben Salem",
                "employee@demo.invalid",
                "0000",
                "Employe123!",
                Role.EMPLOYE,
                null
        );

        assertThrows(BusinessException.class, () -> utilisateurService.create(request));
    }

    @Test
    void shouldRejectRoleChangeAndDeactivationForEmployeeWithActiveAssignments() {
        Utilisateur employee = new Utilisateur();
        employee.setRole(Role.EMPLOYE);
        employee.setMatricule("EMP-1");
        Affectation assignment = new Affectation();
        assignment.setActif(true);
        employee.setAffectations(List.of(assignment));
        when(utilisateurRepository.findById(1L)).thenReturn(Optional.of(employee));

        UtilisateurRequest adminRequest = new UtilisateurRequest("EMP-1", "Employee", "One", "employee@demo.invalid",
                null, null, Role.ADMIN, null);
        assertThrows(BusinessException.class, () -> utilisateurService.update(1L, adminRequest));
        assertThrows(BusinessException.class, () -> utilisateurService.deactivate(1L));
    }
}
