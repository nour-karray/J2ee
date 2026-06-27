package com.entreprise.missions.core.specification;

import com.entreprise.missions.data.model.Role;
import com.entreprise.missions.data.model.Specialite;
import com.entreprise.missions.data.model.Utilisateur;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

public final class UtilisateurSpecifications {

    private UtilisateurSpecifications() {
    }

    public static Specification<Utilisateur> bySearch(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return cb.conjunction();
            }
            query.distinct(true);
            Join<Utilisateur, Specialite> specialiteJoin = root.join("specialite", jakarta.persistence.criteria.JoinType.LEFT);
            String like = "%" + search.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("prenom")), like),
                    cb.like(cb.lower(root.get("nom")), like),
                    cb.like(cb.lower(root.get("email")), like),
                    cb.like(cb.lower(root.get("matricule")), like),
                    cb.like(cb.lower(specialiteJoin.get("nom")), like)
            );
        };
    }

    public static Specification<Utilisateur> byRole(Role role) {
        return (root, query, cb) -> role == null ? cb.conjunction() : cb.equal(root.get("role"), role);
    }

    public static Specification<Utilisateur> bySpecialite(Long specialiteId) {
        return (root, query, cb) -> specialiteId == null
                ? cb.conjunction()
                : cb.equal(root.join("specialite", jakarta.persistence.criteria.JoinType.LEFT).get("id"), specialiteId);
    }

    public static Specification<Utilisateur> byActif(Boolean actif) {
        return (root, query, cb) -> actif == null ? cb.conjunction() : cb.equal(root.get("actif"), actif);
    }
}
