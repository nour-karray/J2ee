package com.entreprise.missions.core.specification;

import com.entreprise.missions.data.model.Affectation;
import com.entreprise.missions.data.model.AffectationStatus;
import java.time.LocalDate;
import org.springframework.data.jpa.domain.Specification;

public final class AffectationSpecifications {

    private AffectationSpecifications() {
    }

    public static Specification<Affectation> bySearch(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return cb.conjunction();
            }
            query.distinct(true);
            var employe = root.join("employe");
            var mission = root.join("mission");
            String like = "%" + search.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(employe.get("prenom")), like),
                    cb.like(cb.lower(employe.get("nom")), like),
                    cb.like(cb.lower(employe.get("matricule")), like),
                    cb.like(cb.lower(mission.get("titre")), like),
                    cb.like(cb.lower(mission.get("code")), like)
            );
        };
    }

    public static Specification<Affectation> byStatus(AffectationStatus status) {
        return (root, query, cb) -> status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }

    public static Specification<Affectation> byMission(Long missionId) {
        return (root, query, cb) -> missionId == null ? cb.conjunction() : cb.equal(root.get("mission").get("id"), missionId);
    }

    public static Specification<Affectation> byEmploye(Long employeId) {
        return (root, query, cb) -> employeId == null ? cb.conjunction() : cb.equal(root.get("employe").get("id"), employeId);
    }

    public static Specification<Affectation> byDateDebut(LocalDate dateDebut) {
        return (root, query, cb) -> dateDebut == null ? cb.conjunction() : cb.greaterThanOrEqualTo(root.get("dateDebut"), dateDebut);
    }

    public static Specification<Affectation> byDateFin(LocalDate dateFin) {
        return (root, query, cb) -> dateFin == null ? cb.conjunction() : cb.lessThanOrEqualTo(root.get("dateFin"), dateFin);
    }

    public static Specification<Affectation> byActif(Boolean actif) {
        return (root, query, cb) -> actif == null ? cb.conjunction() : cb.equal(root.get("actif"), actif);
    }
}
