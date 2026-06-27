package com.entreprise.missions.core.service;

import com.entreprise.missions.core.dto.AffectationDto;
import com.entreprise.missions.core.dto.AffectationRequest;
import com.entreprise.missions.core.dto.MissionDto;
import com.entreprise.missions.core.exception.BusinessException;
import com.entreprise.missions.core.exception.NotFoundException;
import com.entreprise.missions.core.specification.AffectationSpecifications;
import com.entreprise.missions.data.model.Affectation;
import com.entreprise.missions.data.model.Mission;
import com.entreprise.missions.data.model.Role;
import com.entreprise.missions.data.model.Utilisateur;
import com.entreprise.missions.data.repository.AffectationRepository;
import java.time.LocalDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AffectationService {

    private final AffectationRepository affectationRepository;
    private final UtilisateurService utilisateurService;
    private final MissionService missionService;

    public AffectationService(
            AffectationRepository affectationRepository,
            UtilisateurService utilisateurService,
            MissionService missionService
    ) {
        this.affectationRepository = affectationRepository;
        this.utilisateurService = utilisateurService;
        this.missionService = missionService;
    }

    @Transactional(readOnly = true)
    public Page<AffectationDto> list(
            String search,
            com.entreprise.missions.data.model.AffectationStatus status,
            Long missionId,
            Long employeId,
            LocalDate dateDebut,
            LocalDate dateFin,
            Boolean actif,
            Pageable pageable
    ) {
        Specification<Affectation> specification = Specification
                .where(AffectationSpecifications.bySearch(search))
                .and(AffectationSpecifications.byStatus(status))
                .and(AffectationSpecifications.byMission(missionId))
                .and(AffectationSpecifications.byEmploye(employeId))
                .and(AffectationSpecifications.byDateDebut(dateDebut))
                .and(AffectationSpecifications.byDateFin(dateFin))
                .and(AffectationSpecifications.byActif(actif));
        return affectationRepository.findAll(specification, pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public AffectationDto get(Long id) {
        return toDto(findEntity(id));
    }

    public AffectationDto create(AffectationRequest request) {
        Affectation affectation = new Affectation();
        applyRequest(affectation, request, null);
        return toDto(affectationRepository.save(affectation));
    }

    public AffectationDto update(Long id, AffectationRequest request) {
        Affectation affectation = findEntity(id);
        applyRequest(affectation, request, id);
        return toDto(affectationRepository.save(affectation));
    }

    public void deactivate(Long id) {
        Affectation affectation = findEntity(id);
        affectation.setActif(false);
        affectationRepository.save(affectation);
    }

    @Transactional(readOnly = true)
    public java.util.List<MissionDto> getEmployeeMissions(String email) {
        Utilisateur utilisateur = utilisateurService.loadActiveUserByEmail(email);
        return affectationRepository.findEmployeeAssignments(utilisateur.getId())
                .stream()
                .map(Affectation::getMission)
                .distinct()
                .map(mission -> new MissionDto(
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
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public Affectation findEntity(Long id) {
        return affectationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Affectation introuvable."));
    }

    private void applyRequest(Affectation affectation, AffectationRequest request, Long currentId) {
        validateDates(request.dateDebut(), request.dateFin());
        Utilisateur employe = utilisateurService.findEntity(request.employeId());
        Mission mission = missionService.findEntity(request.missionId());
        validateEmploye(employe);
        validateMissionWindow(mission, request.dateDebut(), request.dateFin());
        validateOccupation(employe, request.dateDebut(), request.dateFin(), request.tauxOccupation(), currentId);

        affectation.setEmploye(employe);
        affectation.setMission(mission);
        affectation.setDateDebut(request.dateDebut());
        affectation.setDateFin(request.dateFin());
        affectation.setTauxOccupation(request.tauxOccupation());
        affectation.setStatus(request.status());
        affectation.setCommentaire(blankToNull(request.commentaire()));
    }

    private void validateEmploye(Utilisateur employe) {
        if (employe.getRole() != Role.EMPLOYE) {
            throw new BusinessException("Seuls les employés peuvent être affectés à une mission.");
        }
        if (!employe.isActif()) {
            throw new BusinessException("L'employé sélectionné est désactivé.");
        }
    }

    private void validateDates(LocalDate dateDebut, LocalDate dateFin) {
        if (dateDebut.isAfter(dateFin)) {
            throw new BusinessException("La date de fin d'affectation doit être postérieure ou égale à la date de début.");
        }
    }

    private void validateMissionWindow(Mission mission, LocalDate dateDebut, LocalDate dateFin) {
        if (dateDebut.isBefore(mission.getDateDebut()) || dateFin.isAfter(mission.getDateFin())) {
            throw new BusinessException("La période d'affectation doit être incluse dans la période de la mission.");
        }
        if (!mission.isActif()) {
            throw new BusinessException("La mission sélectionnée est désactivée.");
        }
    }

    private void validateOccupation(Utilisateur employe, LocalDate dateDebut, LocalDate dateFin, Integer tauxOccupation, Long currentId) {
        int occupationExistante = affectationRepository.findOverlappingForEmploye(employe.getId(), dateDebut, dateFin, currentId)
                .stream()
                .filter(Affectation::isActif)
                .map(Affectation::getTauxOccupation)
                .reduce(0, Integer::sum);

        if (occupationExistante + tauxOccupation > 100) {
            throw new BusinessException("Le taux d'occupation cumulé dépasse 100% sur la période sélectionnée.");
        }
    }

    private AffectationDto toDto(Affectation affectation) {
        return new AffectationDto(
                affectation.getId(),
                affectation.getEmploye().getId(),
                affectation.getEmploye().getNomComplet(),
                affectation.getEmploye().getMatricule(),
                affectation.getMission().getId(),
                affectation.getMission().getTitre(),
                affectation.getMission().getCode(),
                affectation.getDateDebut(),
                affectation.getDateFin(),
                affectation.getTauxOccupation(),
                affectation.getStatus(),
                affectation.getCommentaire(),
                affectation.isActif(),
                affectation.getCreatedAt(),
                affectation.getUpdatedAt()
        );
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
