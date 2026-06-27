package com.entreprise.missions.core.service;

import com.entreprise.missions.core.dto.SessionUtilisateurDto;
import com.entreprise.missions.core.dto.UtilisateurDto;
import com.entreprise.missions.core.dto.UtilisateurRequest;
import com.entreprise.missions.core.exception.BusinessException;
import com.entreprise.missions.core.exception.NotFoundException;
import com.entreprise.missions.core.specification.UtilisateurSpecifications;
import com.entreprise.missions.data.model.Affectation;
import com.entreprise.missions.data.model.Role;
import com.entreprise.missions.data.model.Specialite;
import com.entreprise.missions.data.model.Utilisateur;
import com.entreprise.missions.data.repository.UtilisateurRepository;
import java.time.LocalDate;
import java.util.Locale;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final SpecialiteService specialiteService;
    private final PasswordEncoder passwordEncoder;

    public UtilisateurService(
            UtilisateurRepository utilisateurRepository,
            SpecialiteService specialiteService,
            PasswordEncoder passwordEncoder
    ) {
        this.utilisateurRepository = utilisateurRepository;
        this.specialiteService = specialiteService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public Page<UtilisateurDto> list(String search, Role role, Long specialiteId, Boolean actif, Pageable pageable) {
        Specification<Utilisateur> specification = Specification
                .where(UtilisateurSpecifications.bySearch(search))
                .and(UtilisateurSpecifications.byRole(role))
                .and(UtilisateurSpecifications.bySpecialite(specialiteId))
                .and(UtilisateurSpecifications.byActif(actif));
        return utilisateurRepository.findAll(specification, pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public UtilisateurDto get(Long id) {
        return toDto(findEntity(id));
    }

    public UtilisateurDto create(UtilisateurRequest request) {
        String matricule = resolveMatricule(request.matricule(), request.role(), null, null);
        validateEmailUniqueness(request.email(), null);
        validateRoleSpecialite(request.role(), request.specialiteId());
        if (request.motDePasse() == null || request.motDePasse().isBlank()) {
            throw new BusinessException("Le mot de passe est obligatoire a la creation.");
        }

        Utilisateur utilisateur = new Utilisateur();
        applyRequest(utilisateur, request, true, matricule);
        return toDto(utilisateurRepository.save(utilisateur));
    }

    public UtilisateurDto update(Long id, UtilisateurRequest request) {
        Utilisateur utilisateur = findEntity(id);
        String matricule = resolveMatricule(request.matricule(), request.role(), id, utilisateur.getMatricule());
        validateEmailUniqueness(request.email(), id);
        validateRoleSpecialite(request.role(), request.specialiteId());
        applyRequest(utilisateur, request, false, matricule);
        return toDto(utilisateurRepository.save(utilisateur));
    }

    public void deactivate(Long id) {
        Utilisateur utilisateur = findEntity(id);
        utilisateur.setActif(false);
        utilisateurRepository.save(utilisateur);
    }

    @Transactional(readOnly = true)
    public Utilisateur findEntity(Long id) {
        return utilisateurRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Utilisateur introuvable."));
    }

    @Transactional(readOnly = true)
    public Utilisateur loadActiveUserByEmail(String email) {
        Utilisateur utilisateur = utilisateurRepository.findByEmailIgnoreCase(normalize(email))
                .orElseThrow(() -> new NotFoundException("Compte utilisateur introuvable."));
        if (!utilisateur.isActif()) {
            throw new BusinessException("Ce compte est desactive.");
        }
        return utilisateur;
    }

    @Transactional(readOnly = true)
    public UtilisateurDto getCurrentProfile(String email) {
        return toDto(loadActiveUserByEmail(email));
    }

    @Transactional(readOnly = true)
    public SessionUtilisateurDto toSessionDto(Utilisateur utilisateur) {
        return new SessionUtilisateurDto(
                utilisateur.getId(),
                utilisateur.getNomComplet(),
                utilisateur.getEmail(),
                utilisateur.getRole()
        );
    }

    private void validateEmailUniqueness(String rawEmail, Long id) {
        String email = normalize(rawEmail).toLowerCase(Locale.ROOT);
        boolean emailExists = id == null
                ? utilisateurRepository.existsByEmailIgnoreCase(email)
                : utilisateurRepository.existsByEmailIgnoreCaseAndIdNot(email, id);
        if (emailExists) {
            throw new BusinessException("Un utilisateur avec cet email existe deja.");
        }
    }

    private void validateMatriculeUniqueness(String rawMatricule, Long id) {
        String matricule = normalize(rawMatricule);
        boolean matriculeExists = id == null
                ? utilisateurRepository.existsByMatriculeIgnoreCase(matricule)
                : utilisateurRepository.existsByMatriculeIgnoreCaseAndIdNot(matricule, id);
        if (matriculeExists) {
            throw new BusinessException("Un utilisateur avec ce matricule existe deja.");
        }
    }

    private void validateRoleSpecialite(Role role, Long specialiteId) {
        if (role == Role.EMPLOYE && specialiteId == null) {
            throw new BusinessException("Une specialite est obligatoire pour un employe.");
        }
    }

    private String resolveMatricule(String requestedMatricule, Role role, Long id, String fallbackMatricule) {
        String normalized = normalize(requestedMatricule);
        if (normalized != null && !normalized.isBlank()) {
            validateMatriculeUniqueness(normalized, id);
            return normalized;
        }

        if (fallbackMatricule != null && !fallbackMatricule.isBlank()) {
            return fallbackMatricule;
        }

        return generateUniqueMatricule(role);
    }

    private String generateUniqueMatricule(Role role) {
        String prefix = role == Role.ADMIN ? "ADM-" : "EMP-";
        for (int sequence = 1; sequence <= 9999; sequence++) {
            String candidate = prefix + String.format("%03d", sequence);
            if (!utilisateurRepository.existsByMatriculeIgnoreCase(candidate)) {
                return candidate;
            }
        }
        throw new BusinessException("Impossible de generer un matricule unique.");
    }

    private void applyRequest(Utilisateur utilisateur, UtilisateurRequest request, boolean creation, String matricule) {
        utilisateur.setMatricule(matricule);
        utilisateur.setPrenom(normalize(request.prenom()));
        utilisateur.setNom(normalize(request.nom()));
        utilisateur.setEmail(normalize(request.email()).toLowerCase(Locale.ROOT));
        utilisateur.setTelephone(blankToNull(request.telephone()));
        utilisateur.setRole(request.role());

        Specialite specialite = request.specialiteId() == null ? null : specialiteService.findEntity(request.specialiteId());
        utilisateur.setSpecialite(request.role() == Role.ADMIN ? null : specialite);

        if (creation || (request.motDePasse() != null && !request.motDePasse().isBlank())) {
            utilisateur.setMotDePasse(passwordEncoder.encode(request.motDePasse()));
        }
    }

    private UtilisateurDto toDto(Utilisateur utilisateur) {
        return new UtilisateurDto(
                utilisateur.getId(),
                utilisateur.getMatricule(),
                utilisateur.getPrenom(),
                utilisateur.getNom(),
                utilisateur.getNomComplet(),
                utilisateur.getEmail(),
                utilisateur.getTelephone(),
                utilisateur.getRole(),
                utilisateur.getSpecialite() != null ? utilisateur.getSpecialite().getId() : null,
                utilisateur.getSpecialite() != null ? utilisateur.getSpecialite().getNom() : null,
                utilisateur.isActif(),
                currentOccupation(utilisateur),
                utilisateur.getCreatedAt(),
                utilisateur.getUpdatedAt()
        );
    }

    private int currentOccupation(Utilisateur utilisateur) {
        LocalDate today = LocalDate.now();
        return utilisateur.getAffectations().stream()
                .filter(Affectation::isActif)
                .filter(a -> !a.getDateDebut().isAfter(today) && !a.getDateFin().isBefore(today))
                .map(Affectation::getTauxOccupation)
                .reduce(0, Integer::sum);
    }

    private String normalize(String value) {
        return value == null ? null : value.trim();
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
