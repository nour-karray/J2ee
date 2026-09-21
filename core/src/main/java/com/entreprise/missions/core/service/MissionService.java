package com.entreprise.missions.core.service;

import com.entreprise.missions.core.dto.MissionDto;
import com.entreprise.missions.core.dto.MissionRequest;
import com.entreprise.missions.core.dto.MissionTeamMemberDto;
import com.entreprise.missions.core.exception.BusinessException;
import com.entreprise.missions.core.exception.NotFoundException;
import com.entreprise.missions.core.specification.MissionSpecifications;
import com.entreprise.missions.data.model.Affectation;
import com.entreprise.missions.data.model.Mission;
import com.entreprise.missions.data.model.MissionStatus;
import com.entreprise.missions.data.model.Role;
import com.entreprise.missions.data.model.Utilisateur;
import com.entreprise.missions.data.repository.AffectationRepository;
import com.entreprise.missions.data.repository.MissionRepository;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class MissionService {

    private final MissionRepository missionRepository;
    private final AffectationRepository affectationRepository;

    public MissionService(MissionRepository missionRepository, AffectationRepository affectationRepository) {
        this.missionRepository = missionRepository;
        this.affectationRepository = affectationRepository;
    }

    @Transactional(readOnly = true)
    public Page<MissionDto> list(String search, MissionStatus status, java.time.LocalDate dateDebut, java.time.LocalDate dateFin, Boolean actif, Pageable pageable) {
        Specification<Mission> specification = Specification
                .where(MissionSpecifications.bySearch(search))
                .and(MissionSpecifications.byStatus(status))
                .and(MissionSpecifications.byDateDebut(dateDebut))
                .and(MissionSpecifications.byDateFin(dateFin))
                .and(MissionSpecifications.byActif(actif));
        return missionRepository.findAll(specification, pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public MissionDto get(Long id) {
        return toDto(findEntity(id));
    }

    public MissionDto create(MissionRequest request) {
        String code = resolveCode(request.code(), null);
        validateStatusForCreate(request.status());
        validateDates(request.dateDebut(), request.dateFin());
        Mission mission = new Mission();
        applyRequest(mission, request, code);
        return toDto(missionRepository.save(mission));
    }

    public MissionDto update(Long id, MissionRequest request) {
        Mission mission = findEntity(id);
        String code = resolveCode(request.code(), id, mission.getCode());
        validateDates(request.dateDebut(), request.dateFin());
        boolean movesActiveAssignmentOutsideWindow = mission.getAffectations().stream()
                .filter(Affectation::isActif)
                .anyMatch(assignment -> assignment.getDateDebut().isBefore(request.dateDebut())
                        || assignment.getDateFin().isAfter(request.dateFin()));
        if (movesActiveAssignmentOutsideWindow) {
            throw new BusinessException("La nouvelle période de mission exclut une affectation active existante.");
        }
        applyRequest(mission, request, code);
        return toDto(missionRepository.save(mission));
    }

    public void deactivate(Long id) {
        Mission mission = findEntity(id);
        boolean activeAssignments = mission.getAffectations().stream().anyMatch(Affectation::isActif);
        if (activeAssignments) {
            throw new BusinessException("Impossible de désactiver une mission qui possède encore des affectations actives.");
        }
        mission.setActif(false);
        missionRepository.save(mission);
    }

    @Transactional(readOnly = true)
    public List<MissionTeamMemberDto> getTeam(Long missionId, Utilisateur requester) {
        findEntity(missionId);
        boolean administrator = requester.getRole() == Role.ADMIN;
        if (!administrator && !affectationRepository.existsActiveAssignmentForEmployeAndMission(requester.getId(), missionId)) {
            throw new org.springframework.security.access.AccessDeniedException("Accès refusé à cette équipe.");
        }
        return affectationRepository.findActiveTeamByMissionId(missionId)
                .stream()
                .map(affectation -> toTeamMemberDto(affectation, administrator))
                .toList();
    }

    @Transactional(readOnly = true)
    public Mission findEntity(Long id) {
        return missionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Mission introuvable."));
    }

    private void validateUniqueCode(String code, Long id) {
        String normalized = normalize(code);
        boolean exists = id == null
                ? missionRepository.existsByCodeIgnoreCase(normalized)
                : missionRepository.existsByCodeIgnoreCaseAndIdNot(normalized, id);
        if (exists) {
            throw new BusinessException("Une mission avec ce code existe déjà.");
        }
    }

    private String resolveCode(String requestedCode, Long id) {
        return resolveCode(requestedCode, id, null);
    }

    private String resolveCode(String requestedCode, Long id, String fallbackCode) {
        String normalized = normalize(requestedCode);
        if (normalized != null && !normalized.isBlank()) {
            validateUniqueCode(normalized, id);
            return normalized;
        }

        if (fallbackCode != null && !fallbackCode.isBlank()) {
            return fallbackCode;
        }

        return generateUniqueCode();
    }

    private String generateUniqueCode() {
        int year = java.time.LocalDate.now().getYear();
        for (int sequence = 1; sequence <= 9999; sequence++) {
            String candidate = "MIS-" + year + "-" + String.format("%03d", sequence);
            if (!missionRepository.existsByCodeIgnoreCase(candidate)) {
                return candidate;
            }
        }
        throw new BusinessException("Impossible de generer un code unique pour la mission.");
    }

    private void validateStatusForCreate(MissionStatus status) {
        if (status == MissionStatus.TERMINEE || status == MissionStatus.ANNULEE) {
            throw new BusinessException("Une nouvelle mission doit commencer en PLANIFIEE ou EN_COURS.");
        }
    }

    private void validateDates(java.time.LocalDate dateDebut, java.time.LocalDate dateFin) {
        if (dateDebut.isAfter(dateFin)) {
            throw new BusinessException("La date de fin doit être postérieure ou égale à la date de début.");
        }
    }

    private void applyRequest(Mission mission, MissionRequest request, String code) {
        mission.setCode(code);
        mission.setTitre(normalize(request.titre()));
        mission.setDescription(normalize(request.description()));
        mission.setClientNom(normalize(request.clientNom()));
        mission.setLocalisation(normalize(request.localisation()));
        mission.setDateDebut(request.dateDebut());
        mission.setDateFin(request.dateFin());
        mission.setStatus(request.status());
        mission.setPriorite(request.priorite());
        mission.setBudget(request.budget());
    }

    private MissionDto toDto(Mission mission) {
        return new MissionDto(
                mission.getId(),
                mission.getCode(),
                mission.getTitre(),
                mission.getDescription(),
                mission.getClientNom(),
                mission.getLocalisation(),
                mission.getDateDebut(),
                mission.getDateFin(),
                mission.getStatus(),
                mission.getPriorite(),
                mission.getBudget(),
                mission.isActif(),
                (int) mission.getAffectations().stream().filter(Affectation::isActif).count(),
                mission.getCreatedAt(),
                mission.getUpdatedAt()
        );
    }

    private MissionTeamMemberDto toTeamMemberDto(Affectation affectation, boolean includeContactData) {
        return new MissionTeamMemberDto(
                affectation.getId(),
                affectation.getEmploye().getId(),
                affectation.getEmploye().getMatricule(),
                affectation.getEmploye().getNomComplet(),
                includeContactData ? affectation.getEmploye().getEmail() : null,
                includeContactData ? affectation.getEmploye().getTelephone() : null,
                affectation.getEmploye().getSpecialite() != null ? affectation.getEmploye().getSpecialite().getNom() : null,
                affectation.getDateDebut(),
                affectation.getDateFin(),
                affectation.getTauxOccupation(),
                affectation.getStatus()
        );
    }

    private String normalize(String value) {
        return value == null ? null : value.trim();
    }
}
