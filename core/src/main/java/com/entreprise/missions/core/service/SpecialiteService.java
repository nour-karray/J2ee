package com.entreprise.missions.core.service;

import com.entreprise.missions.core.dto.SpecialiteDto;
import com.entreprise.missions.core.dto.SpecialiteRequest;
import com.entreprise.missions.core.exception.BusinessException;
import com.entreprise.missions.core.exception.NotFoundException;
import com.entreprise.missions.core.specification.SpecialiteSpecifications;
import com.entreprise.missions.data.model.Specialite;
import com.entreprise.missions.data.repository.SpecialiteRepository;
import com.entreprise.missions.data.repository.UtilisateurRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class SpecialiteService {

    private final SpecialiteRepository specialiteRepository;
    private final UtilisateurRepository utilisateurRepository;

    public SpecialiteService(SpecialiteRepository specialiteRepository, UtilisateurRepository utilisateurRepository) {
        this.specialiteRepository = specialiteRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    @Transactional(readOnly = true)
    public Page<SpecialiteDto> list(String search, Boolean actif, Pageable pageable) {
        Specification<Specialite> specification = Specification
                .where(SpecialiteSpecifications.bySearch(search))
                .and(SpecialiteSpecifications.byActif(actif));

        return specialiteRepository.findAll(specification, pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public SpecialiteDto get(Long id) {
        return toDto(findEntity(id));
    }

    public SpecialiteDto create(SpecialiteRequest request) {
        validateUniqueName(request.nom(), null);
        Specialite specialite = new Specialite();
        applyRequest(specialite, request);
        return toDto(specialiteRepository.save(specialite));
    }

    public SpecialiteDto update(Long id, SpecialiteRequest request) {
        validateUniqueName(request.nom(), id);
        Specialite specialite = findEntity(id);
        applyRequest(specialite, request);
        return toDto(specialiteRepository.save(specialite));
    }

    public void deactivate(Long id) {
        Specialite specialite = findEntity(id);
        long activeUsers = specialite.getUtilisateurs().stream().filter(u -> u.isActif()).count();
        if (activeUsers > 0) {
            throw new BusinessException("Impossible de désactiver une spécialité encore affectée à des employés actifs.");
        }
        specialite.setActif(false);
        specialiteRepository.save(specialite);
    }

    @Transactional(readOnly = true)
    public Specialite findEntity(Long id) {
        return specialiteRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Spécialité introuvable."));
    }

    private void validateUniqueName(String nom, Long id) {
        String normalized = normalize(nom);
        boolean exists = id == null
                ? specialiteRepository.existsByNomIgnoreCase(normalized)
                : specialiteRepository.existsByNomIgnoreCaseAndIdNot(normalized, id);
        if (exists) {
            throw new BusinessException("Une spécialité avec ce nom existe déjà.");
        }
    }

    private void applyRequest(Specialite specialite, SpecialiteRequest request) {
        specialite.setNom(normalize(request.nom()));
        specialite.setDescription(blankToNull(request.description()));
    }

    private SpecialiteDto toDto(Specialite specialite) {
        return new SpecialiteDto(
                specialite.getId(),
                specialite.getNom(),
                specialite.getDescription(),
                specialite.isActif(),
                specialite.getUtilisateurs().stream().filter(u -> u.isActif()).count(),
                specialite.getCreatedAt(),
                specialite.getUpdatedAt()
        );
    }

    private String normalize(String value) {
        return value == null ? null : value.trim();
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
