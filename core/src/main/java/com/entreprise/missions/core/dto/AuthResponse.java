package com.entreprise.missions.core.dto;

public record AuthResponse(
        String token,
        SessionUtilisateurDto utilisateur
) {
}
