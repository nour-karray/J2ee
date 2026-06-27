package com.entreprise.missions.core.service;

import com.entreprise.missions.core.dto.UtilisateurRequest;
import com.entreprise.missions.core.exception.BusinessException;
import com.entreprise.missions.data.model.Role;
import com.entreprise.missions.data.repository.UtilisateurRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertThrows;

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
                "aya@missions.local",
                "0000",
                "Employe123!",
                Role.EMPLOYE,
                null
        );

        assertThrows(BusinessException.class, () -> utilisateurService.create(request));
    }
}
