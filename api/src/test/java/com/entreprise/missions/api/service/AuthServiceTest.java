package com.entreprise.missions.api.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.entreprise.missions.api.security.JwtService;
import com.entreprise.missions.core.dto.LoginRequest;
import com.entreprise.missions.core.service.UtilisateurService;
import com.entreprise.missions.data.model.Utilisateur;
import com.entreprise.missions.data.repository.UtilisateurRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UtilisateurService utilisateurService;
    @Mock private UtilisateurRepository utilisateurRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;

    @Test
    void shouldReturnTheSameGenericErrorForUnknownEmailAndIncorrectPassword() {
        AuthService service = new AuthService(utilisateurService, utilisateurRepository, passwordEncoder, jwtService);
        LoginRequest request = new LoginRequest("employee@demo.invalid", "incorrect-password");
        when(utilisateurRepository.findByEmailIgnoreCase("employee@demo.invalid")).thenReturn(Optional.empty());
        when(passwordEncoder.matches(eq("incorrect-password"), any())).thenReturn(false);

        assertThatThrownBy(() -> service.login(request))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage("Email ou mot de passe incorrect.");

        Utilisateur user = new Utilisateur();
        user.setActif(true);
        user.setMotDePasse("stored-hash");
        when(utilisateurRepository.findByEmailIgnoreCase("employee@demo.invalid")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("incorrect-password", "stored-hash")).thenReturn(false);

        assertThatThrownBy(() -> service.login(request))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage("Email ou mot de passe incorrect.");
        verify(passwordEncoder).matches("incorrect-password", "stored-hash");
    }
}
