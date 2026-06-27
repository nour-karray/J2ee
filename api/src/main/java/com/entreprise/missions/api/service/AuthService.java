package com.entreprise.missions.api.service;

import com.entreprise.missions.api.security.JwtService;
import com.entreprise.missions.core.dto.AuthResponse;
import com.entreprise.missions.core.dto.LoginRequest;
import com.entreprise.missions.core.dto.RegisterRequest;
import com.entreprise.missions.core.dto.UtilisateurRequest;
import com.entreprise.missions.core.exception.BusinessException;
import com.entreprise.missions.core.service.UtilisateurService;
import com.entreprise.missions.data.model.Role;
import com.entreprise.missions.data.model.Utilisateur;
import com.entreprise.missions.data.repository.UtilisateurRepository;
import java.util.Locale;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

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
        Utilisateur utilisateur = utilisateurService.loadActiveUserByEmail(request.email());
        if (!passwordEncoder.matches(request.motDePasse(), utilisateur.getMotDePasse())) {
            throw new BusinessException("Email ou mot de passe incorrect.");
        }

        return new AuthResponse(
                jwtService.generateToken(utilisateur),
                utilisateurService.toSessionDto(utilisateur)
        );
    }

    public AuthResponse register(RegisterRequest request) {
        utilisateurService.create(new UtilisateurRequest(
                generateMatricule(),
                request.prenom(),
                request.nom(),
                normalize(request.email()),
                request.telephone(),
                request.motDePasse(),
                Role.EMPLOYE,
                request.specialiteId()
        ));

        Utilisateur utilisateur = utilisateurService.loadActiveUserByEmail(request.email());
        return new AuthResponse(
                jwtService.generateToken(utilisateur),
                utilisateurService.toSessionDto(utilisateur)
        );
    }

    private String generateMatricule() {
        for (int attempt = 0; attempt < 10; attempt++) {
            String candidate = "EMP-WEB-" + UUID.randomUUID().toString()
                    .replace("-", "")
                    .substring(0, 8)
                    .toUpperCase(Locale.ROOT);
            if (!utilisateurRepository.existsByMatriculeIgnoreCase(candidate)) {
                return candidate;
            }
        }
        throw new BusinessException("Impossible de generer un matricule unique pour l'inscription.");
    }

    private String normalize(String value) {
        return value == null ? null : value.trim();
    }
}
