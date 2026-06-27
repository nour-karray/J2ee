package com.entreprise.missions.core.dto;

import java.time.LocalDateTime;

public record SpecialiteDto(
        Long id,
        String nom,
        String description,
        boolean actif,
        long nombreEmployes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
