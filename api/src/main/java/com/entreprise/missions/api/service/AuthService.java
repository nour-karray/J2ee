package com.entreprise.missions.api.service;

import com.entreprise.missions.api.security.JwtService;
import com.entreprise.missions.core.dto.AuthResponse;
import com.entreprise.missions.core.dto.LoginRequest;
import com.entreprise.missions.core.service.UtilisateurService;
import com.entreprise.missions.data.model.Utilisateur;
import com.entreprise.missions.data.repository.UtilisateurRepository;
import java.util.Locale;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private static final String INVALID_CREDENTIALS = "Email ou mot de passe incorrect.";
    // Fixed BCrypt work prevents an account-existence timing oracle for unknown emails.
    private static final String DUMMY_PASSWORD_HASH = "$2a$10$7EqJtq98hPqEX7fNZaFWoO5QewO5s8B3kx69vwkJL60Mfss8xTcNm";

    private final UtilisateurService utilisateurService;
    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UtilisateurService utilisateurService,
            UtilisateurRepository utilisateurRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.utilisateurService = utilisateurService;
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse login(LoginRequest request) {
        Utilisateur utilisateur = utilisateurRepository.findByEmailIgnoreCase(normalize(request.email())).orElse(null);
        String passwordHash = utilisateur == null ? DUMMY_PASSWORD_HASH : utilisateur.getMotDePasse();
        boolean passwordMatches = passwordEncoder.matches(request.motDePasse(), passwordHash);
        if (utilisateur == null || !utilisateur.isActif() || !passwordMatches) {
            throw new BadCredentialsException(INVALID_CREDENTIALS);
        }
        return new AuthResponse(jwtService.generateToken(utilisateur), utilisateurService.toSessionDto(utilisateur));
    }

    private String normalize(String value) {
        return value == null ? null : value.trim().toLowerCase(Locale.ROOT);
    }
}
