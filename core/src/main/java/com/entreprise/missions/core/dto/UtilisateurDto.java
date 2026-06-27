package com.entreprise.missions.core.dto;

import com.entreprise.missions.data.model.Role;
import java.time.LocalDateTime;

public record UtilisateurDto(
        Long id,
        String matricule,
        String prenom,
        String nom,
        String nomComplet,
        String email,
        String telephone,
        Role role,
        Long specialiteId,
        String specialiteNom,
        boolean actif,
        Integer tauxOccupationActuel,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
