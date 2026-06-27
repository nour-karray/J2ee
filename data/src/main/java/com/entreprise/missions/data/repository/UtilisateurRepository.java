package com.entreprise.missions.data.repository;

import com.entreprise.missions.data.model.Role;
import com.entreprise.missions.data.model.Utilisateur;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long>, JpaSpecificationExecutor<Utilisateur> {

    Optional<Utilisateur> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);

    boolean existsByMatriculeIgnoreCase(String matricule);

    boolean existsByMatriculeIgnoreCaseAndIdNot(String matricule, Long id);

    long countByRoleAndActifTrue(Role role);
}
