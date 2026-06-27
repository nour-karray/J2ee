package com.entreprise.missions.api.web;

import com.entreprise.missions.core.dto.MissionDto;
import com.entreprise.missions.core.dto.UtilisateurDto;
import com.entreprise.missions.core.service.AffectationService;
import com.entreprise.missions.core.service.UtilisateurService;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/employee")
@PreAuthorize("hasRole('EMPLOYE')")
public class EmployeeController {

    private final AffectationService affectationService;
    private final UtilisateurService utilisateurService;

    public EmployeeController(AffectationService affectationService, UtilisateurService utilisateurService) {
        this.affectationService = affectationService;
        this.utilisateurService = utilisateurService;
    }

    @GetMapping("/missions")
    public List<MissionDto> missions(Authentication authentication) {
        return affectationService.getEmployeeMissions(authentication.getName());
    }

    @GetMapping("/profile")
    public UtilisateurDto profile(Authentication authentication) {
        return utilisateurService.getCurrentProfile(authentication.getName());
    }
}
