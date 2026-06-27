package com.entreprise.missions.data.repository;

import com.entreprise.missions.data.model.Affectation;
import com.entreprise.missions.data.model.AffectationStatus;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AffectationRepository extends JpaRepository<Affectation, Long>, JpaSpecificationExecutor<Affectation> {

    @Query("""
            select a from Affectation a
            where a.employe.id = :employeId
              and (:excludeId is null or a.id <> :excludeId)
              and a.actif = true
              and a.dateDebut <= :dateFin
              and a.dateFin >= :dateDebut
            """)
    List<Affectation> findOverlappingForEmploye(
            @Param("employeId") Long employeId,
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin") LocalDate dateFin,
            @Param("excludeId") Long excludeId
    );

    @Query("""
            select a from Affectation a
            join fetch a.employe e
            where a.mission.id = :missionId
              and a.actif = true
              and e.actif = true
            order by e.prenom asc, e.nom asc
            """)
    List<Affectation> findActiveTeamByMissionId(@Param("missionId") Long missionId);

    @Query("""
            select a from Affectation a
            join fetch a.mission m
            where a.employe.id = :employeId
              and a.actif = true
              and m.actif = true
            order by a.dateDebut desc
            """)
    List<Affectation> findEmployeeAssignments(@Param("employeId") Long employeId);

    long countByStatusAndActifTrue(AffectationStatus status);

    @Query("""
            select a from Affectation a
            join fetch a.employe e
            join fetch a.mission m
            where a.actif = true
              and a.dateFin between :start and :end
            order by a.dateFin asc
            """)
    List<Affectation> findAssignmentsEndingBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);
}
