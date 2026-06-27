package com.entreprise.missions.api.config;

import com.entreprise.missions.core.dto.AffectationRequest;
import com.entreprise.missions.core.dto.MissionRequest;
import com.entreprise.missions.core.dto.SpecialiteRequest;
import com.entreprise.missions.core.dto.UtilisateurRequest;
import com.entreprise.missions.core.service.AffectationService;
import com.entreprise.missions.core.service.MissionService;
import com.entreprise.missions.core.service.SpecialiteService;
import com.entreprise.missions.core.service.UtilisateurService;
import com.entreprise.missions.data.model.AffectationStatus;
import com.entreprise.missions.data.model.MissionStatus;
import com.entreprise.missions.data.model.Priorite;
import com.entreprise.missions.data.model.Role;
import com.entreprise.missions.data.repository.UtilisateurRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DemoDataSeeder {

    private static final String DEMO_ADMIN_EMAIL = "admin@missions.local";

    @Bean
    CommandLineRunner seedDemoData(
            UtilisateurRepository utilisateurRepository,
            SpecialiteService specialiteService,
            UtilisateurService utilisateurService,
            MissionService missionService,
            AffectationService affectationService
    ) {
        return args -> {
            utilisateurRepository.findByEmailIgnoreCase(DEMO_ADMIN_EMAIL).ifPresent(admin -> {
                admin.setPrenom("Souhayla");
                admin.setNom("Derbel");
                utilisateurRepository.save(admin);
            });

            if (utilisateurRepository.count() > 0) {
                return;
            }

            var dev = specialiteService.create(new SpecialiteRequest("Ingénierie Logicielle", "Développement web et API"));
            var qa = specialiteService.create(new SpecialiteRequest("Qualité Logicielle", "Tests, recette et automatisation"));
            var pm = specialiteService.create(new SpecialiteRequest("Pilotage Projet", "Planification et coordination"));

            var admin = utilisateurService.create(new UtilisateurRequest(
                    "ADM-001",
                    "Souhayla",
                    "Derbel",
                    DEMO_ADMIN_EMAIL,
                    "+21620101010",
                    "Admin123!",
                    Role.ADMIN,
                    null
            ));

            var employeeOne = utilisateurService.create(new UtilisateurRequest(
                    "EMP-001",
                    "brahim",
                    "Gharbi",
                    "youssef@missions.local",
                    "+21622111222",
                    "Employe123!",
                    Role.EMPLOYE,
                    dev.id()
            ));

            var employeeTwo = utilisateurService.create(new UtilisateurRequest(
                    "EMP-002",
                    "Salma",
                    "Trabelsi",
                    "salma@missions.local",
                    "+21622333444",
                    "Employe123!",
                    Role.EMPLOYE,
                    qa.id()
            ));

            var employeeThree = utilisateurService.create(new UtilisateurRequest(
                    "EMP-003",
                    "Karim",
                    "Mansouri",
                    "karim@missions.local",
                    "+21622555666",
                    "Employe123!",
                    Role.EMPLOYE,
                    pm.id()
            ));

            var missionOne = missionService.create(new MissionRequest(
                    "MIS-2026-001",
                    "Migration du portail client",
                    "Refonte Angular/Spring d'un portail client multi-rôles.",
                    "Groupe Atlas",
                    "Tunis",
                    LocalDate.now().minusDays(10),
                    LocalDate.now().plusDays(60),
                    MissionStatus.EN_COURS,
                    Priorite.HAUTE,
                    new BigDecimal("85000.00")
            ));

            var missionTwo = missionService.create(new MissionRequest(
                    "MIS-2026-002",
                    "Audit qualité release mobile",
                    "Préparer la campagne de validation et le reporting qualité.",
                    "Nova Digital",
                    "Sfax",
                    LocalDate.now().plusDays(3),
                    LocalDate.now().plusDays(40),
                    MissionStatus.PLANIFIEE,
                    Priorite.MOYENNE,
                    new BigDecimal("28000.00")
            ));

            affectationService.create(new AffectationRequest(
                    employeeOne.id(),
                    missionOne.id(),
                    LocalDate.now().minusDays(7),
                    LocalDate.now().plusDays(20),
                    60,
                    AffectationStatus.ACTIVE,
                    "Lead développeur frontend/backend."
            ));

            affectationService.create(new AffectationRequest(
                    employeeTwo.id(),
                    missionOne.id(),
                    LocalDate.now().minusDays(4),
                    LocalDate.now().plusDays(5),
                    30,
                    AffectationStatus.ACTIVE,
                    "Recette qualité et suivi bugs bloquants."
            ));

            affectationService.create(new AffectationRequest(
                    employeeThree.id(),
                    missionTwo.id(),
                    LocalDate.now().plusDays(3),
                    LocalDate.now().plusDays(25),
                    40,
                    AffectationStatus.PLANIFIEE,
                    "Pilotage opérationnel et suivi client."
            ));
        };
    }
}
