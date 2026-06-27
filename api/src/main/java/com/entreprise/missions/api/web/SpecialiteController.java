package com.entreprise.missions.api.web;

import com.entreprise.missions.core.dto.PagedResponse;
import com.entreprise.missions.core.dto.SpecialiteDto;
import com.entreprise.missions.core.dto.SpecialiteRequest;
import com.entreprise.missions.core.service.SpecialiteService;
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
@RequestMapping("/api/specialites")
@PreAuthorize("hasRole('ADMIN')")
public class SpecialiteController {

    private final SpecialiteService specialiteService;

    public SpecialiteController(SpecialiteService specialiteService) {
        this.specialiteService = specialiteService;
    }

    @GetMapping
    public PagedResponse<SpecialiteDto> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean actif
    ) {
        return PagedResponse.from(specialiteService.list(search, actif, PageableFactory.create(page, size, sort, "updatedAt")));
    }

    @GetMapping("/{id}")
    public SpecialiteDto get(@PathVariable Long id) {
        return specialiteService.get(id);
    }

    @PostMapping
    public SpecialiteDto create(@Valid @RequestBody SpecialiteRequest request) {
        return specialiteService.create(request);
    }

    @PutMapping("/{id}")
    public SpecialiteDto update(@PathVariable Long id, @Valid @RequestBody SpecialiteRequest request) {
        return specialiteService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        specialiteService.deactivate(id);
    }
}
