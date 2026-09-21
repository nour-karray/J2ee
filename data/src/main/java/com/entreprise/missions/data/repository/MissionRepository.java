package com.entreprise.missions.data.repository;

import com.entreprise.missions.data.model.Mission;
import com.entreprise.missions.data.model.MissionStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface MissionRepository extends JpaRepository<Mission, Long>, JpaSpecificationExecutor<Mission> {

    boolean existsByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCaseAndIdNot(String code, Long id);

    long countByStatusAndActifTrue(MissionStatus status);

    @Query("""
            select m from Mission m where m.actif = true and m.priorite is not null
            order by case m.priorite
                when com.entreprise.missions.data.model.Priorite.HAUTE then 1
                when com.entreprise.missions.data.model.Priorite.MOYENNE then 2
                when com.entreprise.missions.data.model.Priorite.BASSE then 3
                else 4 end, m.updatedAt desc
            """)
    List<Mission> findTop5ByActifTrueAndPrioriteIsNotNull();
}
