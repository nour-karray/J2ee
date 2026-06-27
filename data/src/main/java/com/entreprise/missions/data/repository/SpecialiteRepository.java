package com.entreprise.missions.data.repository;

import com.entreprise.missions.data.model.Specialite;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface SpecialiteRepository extends JpaRepository<Specialite, Long>, JpaSpecificationExecutor<Specialite> {

    boolean existsByNomIgnoreCase(String nom);

    boolean existsByNomIgnoreCaseAndIdNot(String nom, Long id);

    Optional<Specialite> findByNomIgnoreCase(String nom);

    long countByActifTrue();
}
