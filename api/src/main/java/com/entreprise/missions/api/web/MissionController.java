package com.entreprise.missions.api.web;

import com.entreprise.missions.core.dto.MissionDto;
import com.entreprise.missions.core.dto.MissionRequest;
import com.entreprise.missions.core.dto.MissionTeamMemberDto;
import com.entreprise.missions.core.dto.PagedResponse;
import com.entreprise.missions.core.service.MissionService;
import com.entreprise.missions.core.service.UtilisateurService;
import com.entreprise.missions.data.model.MissionStatus;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/missions")
public class MissionController {

    private final MissionService missionService;
    private final UtilisateurService utilisateurService;

    public MissionController(MissionService missionService, UtilisateurService utilisateurService) {
        this.missionService = missionService;
        this.utilisateurService = utilisateurService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public PagedResponse<MissionDto> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) MissionStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin,
            @RequestParam(required = false) Boolean actif
    ) {
        return PagedResponse.from(missionService.list(
                search,
                status,
                dateDebut,
                dateFin,
                actif,
                PageableFactory.create(page, size, sort, "updatedAt")
        ));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public MissionDto get(@PathVariable Long id) {
        return missionService.get(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public MissionDto create(@Valid @RequestBody MissionRequest request) {
        return missionService.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public MissionDto update(@PathVariable Long id, @Valid @RequestBody MissionRequest request) {
        return missionService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        missionService.deactivate(id);
    }

    @GetMapping("/{id}/team")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EMPLOYE')")
    public List<MissionTeamMemberDto> team(@PathVariable Long id, Authentication authentication) {
        return missionService.getTeam(id, utilisateurService.loadActiveUserByEmail(authentication.getName()));
    }
}
