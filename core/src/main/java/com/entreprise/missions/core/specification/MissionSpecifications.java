package com.entreprise.missions.core.specification;

import com.entreprise.missions.data.model.Mission;
import com.entreprise.missions.data.model.MissionStatus;
import java.time.LocalDate;
import org.springframework.data.jpa.domain.Specification;

public final class MissionSpecifications {

    private MissionSpecifications() {
    }

    public static Specification<Mission> bySearch(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return cb.conjunction();
            }
            String like = "%" + search.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("code")), like),
                    cb.like(cb.lower(root.get("titre")), like),
                    cb.like(cb.lower(root.get("clientNom")), like),
                    cb.like(cb.lower(root.get("localisation")), like)
            );
        };
    }

    public static Specification<Mission> byStatus(MissionStatus status) {
        return (root, query, cb) -> status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }

    public static Specification<Mission> byDateDebut(LocalDate dateDebut) {
        return (root, query, cb) -> dateDebut == null ? cb.conjunction() : cb.greaterThanOrEqualTo(root.get("dateDebut"), dateDebut);
    }

    public static Specification<Mission> byDateFin(LocalDate dateFin) {
        return (root, query, cb) -> dateFin == null ? cb.conjunction() : cb.lessThanOrEqualTo(root.get("dateFin"), dateFin);
    }

    public static Specification<Mission> byActif(Boolean actif) {
        return (root, query, cb) -> actif == null ? cb.conjunction() : cb.equal(root.get("actif"), actif);
    }
}
