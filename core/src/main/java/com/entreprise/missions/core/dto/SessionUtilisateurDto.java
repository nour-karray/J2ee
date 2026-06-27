package com.entreprise.missions.core.dto;

import com.entreprise.missions.data.model.Role;

public record SessionUtilisateurDto(
        Long id,
        String nomComplet,
        String email,
        Role role
) {
}
