package com.entreprise.missions.api.web;

import com.entreprise.missions.api.service.AuthService;
import com.entreprise.missions.core.dto.AuthResponse;
import com.entreprise.missions.core.dto.SessionUtilisateurDto;
import com.entreprise.missions.core.dto.UtilisateurDto;
import com.entreprise.missions.core.service.UtilisateurService;
import com.entreprise.missions.data.model.Role;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AuthControllerWebTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private AuthService authService;

    @Mock
    private UtilisateurService utilisateurService;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper().findAndRegisterModules();
        AuthController controller = new AuthController(authService, utilisateurService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new RestExceptionHandler())
                .build();
    }

    @Test
    void shouldAuthenticateUser() throws Exception {
        when(authService.login(any())).thenReturn(new AuthResponse(
                "demo-token",
                new SessionUtilisateurDto(1L, "Souhayla Derbel", "admin@missions.local", Role.ADMIN)
        ));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(java.util.Map.of(
                                "email", "admin@missions.local",
                                "motDePasse", "Admin123!"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("demo-token"))
                .andExpect(jsonPath("$.utilisateur.role").value("ADMIN"));
    }

    @Test
    void shouldReturnCurrentUserProfile() throws Exception {
        when(utilisateurService.getCurrentProfile(eq("admin@missions.local"))).thenReturn(new UtilisateurDto(
                1L,
                "ADM-001",
                "Souhayla",
                "Derbel",
                "Souhayla Derbel",
                "admin@missions.local",
                null,
                Role.ADMIN,
                null,
                null,
                true,
                0,
                null,
                null
        ));

        mockMvc.perform(get("/api/auth/me")
                        .principal(new UsernamePasswordAuthenticationToken("admin@missions.local", null)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("admin@missions.local"))
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }
}
