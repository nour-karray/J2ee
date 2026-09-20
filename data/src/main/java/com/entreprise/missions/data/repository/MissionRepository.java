package com.entreprise.missions.data.repository;

import com.entreprise.missions.data.model.Mission;
import com.entreprise.missions.data.model.MissionStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface MissionRepository extends JpaRepository<Mission, Long>, JpaSpecificationExecutor<Mission> {

    boolean existsByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCaseAndIdNot(String code, Long id);

    long countByStatusAndActifTrue(MissionStatus status);

    List<Mission> findTop5ByActifTrueAndPrioriteIsNotNullOrderByPrioriteDescUpdatedAtDesc();
}
