package com.entreprise.missions.api.web;

import com.entreprise.missions.core.dto.AffectationDto;
import com.entreprise.missions.core.dto.AffectationRequest;
import com.entreprise.missions.core.dto.PagedResponse;
import com.entreprise.missions.core.service.AffectationService;
import com.entreprise.missions.data.model.AffectationStatus;
import jakarta.validation.Valid;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
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
@RequestMapping("/api/affectations")
@PreAuthorize("hasRole('ADMIN')")
public class AffectationController {

    private final AffectationService affectationService;

    public AffectationController(AffectationService affectationService) {
        this.affectationService = affectationService;
    }

    @GetMapping
    public PagedResponse<AffectationDto> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) AffectationStatus status,
            @RequestParam(required = false) Long missionId,
            @RequestParam(required = false) Long employeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin,
            @RequestParam(required = false) Boolean actif
    ) {
        return PagedResponse.from(affectationService.list(
                search,
                status,
                missionId,
                employeId,
                dateDebut,
                dateFin,
                actif,
                PageableFactory.create(page, size, sort, "updatedAt")
        ));
    }

    @GetMapping("/{id}")
    public AffectationDto get(@PathVariable Long id) {
        return affectationService.get(id);
    }

    @PostMapping
    public AffectationDto create(@Valid @RequestBody AffectationRequest request) {
        return affectationService.create(request);
    }

    @PutMapping("/{id}")
    public AffectationDto update(@PathVariable Long id, @Valid @RequestBody AffectationRequest request) {
        return affectationService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        affectationService.deactivate(id);
    }
}
