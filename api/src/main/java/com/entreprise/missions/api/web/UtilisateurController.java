package com.entreprise.missions.api.web;

import com.entreprise.missions.core.dto.PagedResponse;
import com.entreprise.missions.core.dto.UtilisateurDto;
import com.entreprise.missions.core.dto.UtilisateurRequest;
import com.entreprise.missions.core.service.UtilisateurService;
import com.entreprise.missions.data.model.Role;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
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
@RequestMapping("/api/utilisateurs")
@PreAuthorize("hasRole('ADMIN')")
public class UtilisateurController {

    private final UtilisateurService utilisateurService;

    public UtilisateurController(UtilisateurService utilisateurService) {
        this.utilisateurService = utilisateurService;
    }

    @GetMapping
    public PagedResponse<UtilisateurDto> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) Long specialiteId,
            @RequestParam(required = false) Boolean actif
    ) {
        return PagedResponse.from(utilisateurService.list(
                search,
                role,
                specialiteId,
                actif,
                PageableFactory.create(page, size, sort, "updatedAt")
        ));
    }

    @GetMapping("/{id}")
    public UtilisateurDto get(@PathVariable Long id) {
        return utilisateurService.get(id);
    }

    @PostMapping
    public UtilisateurDto create(@Valid @RequestBody UtilisateurRequest request) {
        return utilisateurService.create(request);
    }

    @PutMapping("/{id}")
    public UtilisateurDto update(@PathVariable Long id, @Valid @RequestBody UtilisateurRequest request) {
        return utilisateurService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        utilisateurService.deactivate(id);
    }
}
