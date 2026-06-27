package com.entreprise.missions.api.web;

import com.entreprise.missions.api.service.AuthService;
import com.entreprise.missions.core.dto.AuthResponse;
import com.entreprise.missions.core.dto.LoginRequest;
import com.entreprise.missions.core.dto.UtilisateurDto;
import com.entreprise.missions.core.service.UtilisateurService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UtilisateurService utilisateurService;

    public AuthController(
            AuthService authService,
            UtilisateurService utilisateurService
    ) {
        this.authService = authService;
        this.utilisateurService = utilisateurService;
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public UtilisateurDto me(Authentication authentication) {
        return utilisateurService.getCurrentProfile(authentication.getName());
    }
}
