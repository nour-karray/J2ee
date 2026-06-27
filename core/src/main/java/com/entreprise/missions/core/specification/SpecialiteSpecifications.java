package com.entreprise.missions.core.specification;

import com.entreprise.missions.data.model.Specialite;
import org.springframework.data.jpa.domain.Specification;

public final class SpecialiteSpecifications {

    private SpecialiteSpecifications() {
    }

    public static Specification<Specialite> bySearch(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return cb.conjunction();
            }
            String like = "%" + search.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("nom")), like),
                    cb.like(cb.lower(root.get("description")), like)
            );
        };
    }

    public static Specification<Specialite> byActif(Boolean actif) {
        return (root, query, cb) -> actif == null ? cb.conjunction() : cb.equal(root.get("actif"), actif);
    }
}
