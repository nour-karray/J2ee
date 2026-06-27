# Rapport detaille du projet

## 1. Introduction

Ce projet s'appelle **Plateforme de gestion des missions**.  
Il s'agit d'une application web composee de :

- un **frontend Angular**
- un **backend Spring Boot / Spring MVC**
- une **persistance JPA / Hibernate**
- une **base MySQL**
- une **authentification JWT**

L'objectif metier du projet est de permettre a une entreprise de :

- gerer les specialites des employes
- gerer les comptes utilisateurs
- gerer les missions
- affecter un ou plusieurs employes a une mission
- suivre l'etat des missions et des affectations
- donner a chaque employe une vue simple de ses missions

Le projet suit bien l'esprit du cours :

- separation en couches
- architecture 3 tiers
- pattern MVC cote backend
- persistance JPA
- validation metier centralisee dans les services

## 2. Objectif fonctionnel

Le systeme fait intervenir deux types d'utilisateurs :

### 2.1 Administrateur

L'administrateur peut :

- se connecter
- consulter le tableau de bord
- creer, modifier, desactiver des specialites
- creer, modifier, desactiver des utilisateurs
- creer, modifier, desactiver des missions
- creer, modifier, desactiver des affectations
- consulter l'equipe d'une mission

### 2.2 Employe

L'employe peut :

- se connecter
- consulter son profil
- consulter ses missions
- consulter l'equipe d'une mission

Important :

- dans l'etat actuel du projet, **l'inscription libre n'est pas ouverte au public**
- les comptes employes sont crees par l'administrateur

## 3. Architecture globale

Le projet est organise selon une logique **3 tiers** :

### 3.1 Couche presentation

La couche presentation correspond au dossier :

- `frontend/`

Cette couche affiche les pages Angular et dialogue avec l'API REST.

### 3.2 Couche metier

La couche metier correspond surtout au dossier :

- `core/`

Cette couche contient :

- les DTO
- les regles metier
- les validations
- les services

### 3.3 Couche donnees

La couche donnees correspond au dossier :

- `data/`

Cette couche contient :

- les entites JPA
- les enums
- les repositories

### 3.4 Couche exposition web

Le dossier :

- `api/`

fait le lien entre le frontend et la couche metier.

Il contient :

- les controleurs REST
- la securite JWT
- la configuration Spring Boot
- les donnees de demonstration

## 4. Structure physique du projet

### 4.1 Projet parent Maven

Le fichier racine est :

- [pom.xml](C:/Users/User/Desktop/ProjetJ2ee/pom.xml)

Il definit :

- `packaging = pom`
- les modules Maven
- la version Java `21`
- l'heritage depuis `spring-boot-starter-parent`

Modules declares :

- `data`
- `core`
- `api`

### 4.2 Module `data`

Fichiers principaux :

- [BaseEntity.java](C:/Users/User/Desktop/ProjetJ2ee/data/src/main/java/com/entreprise/missions/data/model/BaseEntity.java)
- [Utilisateur.java](C:/Users/User/Desktop/ProjetJ2ee/data/src/main/java/com/entreprise/missions/data/model/Utilisateur.java)
- [Specialite.java](C:/Users/User/Desktop/ProjetJ2ee/data/src/main/java/com/entreprise/missions/data/model/Specialite.java)
- [Mission.java](C:/Users/User/Desktop/ProjetJ2ee/data/src/main/java/com/entreprise/missions/data/model/Mission.java)
- [Affectation.java](C:/Users/User/Desktop/ProjetJ2ee/data/src/main/java/com/entreprise/missions/data/model/Affectation.java)
- repositories dans `data/src/main/java/com/entreprise/missions/data/repository`

Role du module :

- modeliser la base de donnees
- permettre l'acces aux donnees via Spring Data JPA

### 4.3 Module `core`

Fichiers principaux :

- DTO dans `core/src/main/java/com/entreprise/missions/core/dto`
- services dans `core/src/main/java/com/entreprise/missions/core/service`
- specifications dans `core/src/main/java/com/entreprise/missions/core/specification`
- exceptions metier dans `core/src/main/java/com/entreprise/missions/core/exception`

Role du module :

- contenir la logique metier
- faire les validations fonctionnelles
- transformer les entites en DTO

### 4.4 Module `api`

Fichiers principaux :

- [PlateformeMissionsApplication.java](C:/Users/User/Desktop/ProjetJ2ee/api/src/main/java/com/entreprise/missions/api/PlateformeMissionsApplication.java)
- controleurs dans `api/src/main/java/com/entreprise/missions/api/web`
- securite dans `api/src/main/java/com/entreprise/missions/api/security`
- [AuthService.java](C:/Users/User/Desktop/ProjetJ2ee/api/src/main/java/com/entreprise/missions/api/service/AuthService.java)
- [DemoDataSeeder.java](C:/Users/User/Desktop/ProjetJ2ee/api/src/main/java/com/entreprise/missions/api/config/DemoDataSeeder.java)
- [application.yml](C:/Users/User/Desktop/ProjetJ2ee/api/src/main/resources/application.yml)

Role du module :

- lancer l'application
- exposer les endpoints REST
- gerer JWT
- connecter Angular au coeur metier

### 4.5 Frontend Angular

Fichiers principaux :

- [app.routes.ts](C:/Users/User/Desktop/ProjetJ2ee/frontend/src/app/app.routes.ts)
- [app.config.ts](C:/Users/User/Desktop/ProjetJ2ee/frontend/src/app/app.config.ts)
- [api.service.ts](C:/Users/User/Desktop/ProjetJ2ee/frontend/src/app/core/api.service.ts)
- [auth.service.ts](C:/Users/User/Desktop/ProjetJ2ee/frontend/src/app/core/auth.service.ts)
- [auth.interceptor.ts](C:/Users/User/Desktop/ProjetJ2ee/frontend/src/app/core/auth.interceptor.ts)
- [auth.guard.ts](C:/Users/User/Desktop/ProjetJ2ee/frontend/src/app/core/auth.guard.ts)
- [role.guard.ts](C:/Users/User/Desktop/ProjetJ2ee/frontend/src/app/core/role.guard.ts)
- [shell.component.ts](C:/Users/User/Desktop/ProjetJ2ee/frontend/src/app/shell/shell.component.ts)
- pages dans `frontend/src/app/pages`

Role du frontend :

- afficher l'interface utilisateur
- envoyer les formulaires au backend
- afficher les donnees recues depuis l'API
- proteger les pages selon le role

## 5. Organisation logique du code

Le projet suit presque partout le meme schema :

1. le frontend envoie une requete HTTP
2. le controller REST recoit la requete
3. le controller appelle un service metier
4. le service utilise un repository
5. le repository interroge MySQL
6. la reponse remonte vers Angular

Exemple standard :

`Page Angular -> ApiService -> Controller -> Service -> Repository -> MySQL`

## 6. Les entites JPA et la base de donnees

### 6.1 BaseEntity

La classe [BaseEntity.java](C:/Users/User/Desktop/ProjetJ2ee/data/src/main/java/com/entreprise/missions/data/model/BaseEntity.java) apporte a toutes les entites :

- `id`
- `createdAt`
- `updatedAt`
- `actif`

Pourquoi cette classe est utile :

- evite de recopier les memes champs dans toutes les entites
- active la suppression logique via `actif`
- historise automatiquement la creation et la modification

`@PrePersist` et `@PreUpdate` servent a mettre a jour automatiquement les dates.

### 6.2 Utilisateur

La classe [Utilisateur.java](C:/Users/User/Desktop/ProjetJ2ee/data/src/main/java/com/entreprise/missions/data/model/Utilisateur.java) represente :

- un administrateur
- ou un employe

Champs principaux :

- `matricule`
- `prenom`
- `nom`
- `email`
- `telephone`
- `motDePasse`
- `role`
- `specialite`

Relations :

- plusieurs utilisateurs peuvent appartenir a une specialite
- un utilisateur peut avoir plusieurs affectations

Contraintes :

- email unique
- matricule unique

### 6.3 Specialite

La classe [Specialite.java](C:/Users/User/Desktop/ProjetJ2ee/data/src/main/java/com/entreprise/missions/data/model/Specialite.java) represente une competence metier.

Champs :

- `nom`
- `description`

Relation :

- une specialite peut etre liee a plusieurs utilisateurs

### 6.4 Mission

La classe [Mission.java](C:/Users/User/Desktop/ProjetJ2ee/data/src/main/java/com/entreprise/missions/data/model/Mission.java) represente une mission.

Champs :

- `code`
- `titre`
- `description`
- `clientNom`
- `localisation`
- `dateDebut`
- `dateFin`
- `status`
- `priorite`
- `budget`

Relation :

- une mission peut avoir plusieurs affectations

Observation importante :

- le code contient encore `clientNom`
- donc techniquement la mission garde une notion de client dans le modele actuel

### 6.5 Affectation

La classe [Affectation.java](C:/Users/User/Desktop/ProjetJ2ee/data/src/main/java/com/entreprise/missions/data/model/Affectation.java) relie un employe a une mission.

Champs :

- `employe`
- `mission`
- `dateDebut`
- `dateFin`
- `tauxOccupation`
- `status`
- `commentaire`

Cette entite est centrale, car elle porte la logique de charge et de planning.

## 7. Pourquoi il y a des DTO

Le projet n'expose pas directement les entites JPA au frontend.  
A la place, il utilise des DTO.

Exemples :

- [UtilisateurDto.java](C:/Users/User/Desktop/ProjetJ2ee/core/src/main/java/com/entreprise/missions/core/dto/UtilisateurDto.java)
- [MissionDto.java](C:/Users/User/Desktop/ProjetJ2ee/core/src/main/java/com/entreprise/missions/core/dto/MissionDto.java)
- [AffectationDto.java](C:/Users/User/Desktop/ProjetJ2ee/core/src/main/java/com/entreprise/missions/core/dto/AffectationDto.java)
- [SpecialiteDto.java](C:/Users/User/Desktop/ProjetJ2ee/core/src/main/java/com/entreprise/missions/core/dto/SpecialiteDto.java)

Et pour les entrees :

- [UtilisateurRequest.java](C:/Users/User/Desktop/ProjetJ2ee/core/src/main/java/com/entreprise/missions/core/dto/UtilisateurRequest.java)
- [MissionRequest.java](C:/Users/User/Desktop/ProjetJ2ee/core/src/main/java/com/entreprise/missions/core/dto/MissionRequest.java)
- [AffectationRequest.java](C:/Users/User/Desktop/ProjetJ2ee/core/src/main/java/com/entreprise/missions/core/dto/AffectationRequest.java)
- [SpecialiteRequest.java](C:/Users/User/Desktop/ProjetJ2ee/core/src/main/java/com/entreprise/missions/core/dto/SpecialiteRequest.java)

Avantages des DTO :

- securite
- separation propre entre base et API
- controle fin des champs exposes
- validation des donnees entrantes via `@Valid`

## 8. Les services metier

Les services sont le coeur du projet.

### 8.1 UtilisateurService

Fichier :

- [UtilisateurService.java](C:/Users/User/Desktop/ProjetJ2ee/core/src/main/java/com/entreprise/missions/core/service/UtilisateurService.java)

Responsabilites :

- lister les utilisateurs
- creer un utilisateur
- modifier un utilisateur
- desactiver un utilisateur
- charger le profil courant
- verifier unicite email/matricule
- verifier qu'un employe a une specialite
- calculer le taux d'occupation courant

Points de code importants :

- `validateUniqueness(...)`
- `validateRoleSpecialite(...)`
- `applyRequest(...)`
- `toDto(...)`
- `currentOccupation(...)`

### 8.2 SpecialiteService

Fichier :

- [SpecialiteService.java](C:/Users/User/Desktop/ProjetJ2ee/core/src/main/java/com/entreprise/missions/core/service/SpecialiteService.java)

Responsabilites :

- lister les specialites
- creer une specialite
- modifier une specialite
- desactiver une specialite
- verifier qu'aucun employe actif n'utilise encore la specialite avant desactivation

Point metier important :

- on ne peut pas desactiver une specialite encore affectee a des employes actifs

### 8.3 MissionService

Fichier :

- [MissionService.java](C:/Users/User/Desktop/ProjetJ2ee/core/src/main/java/com/entreprise/missions/core/service/MissionService.java)

Responsabilites :

- lister les missions
- creer une mission
- modifier une mission
- desactiver une mission
- retourner l'equipe d'une mission

Regles :

- le code mission doit etre unique
- `dateDebut <= dateFin`
- une mission ayant encore des affectations actives ne peut pas etre desactivee

### 8.4 AffectationService

Fichier :

- [AffectationService.java](C:/Users/User/Desktop/ProjetJ2ee/core/src/main/java/com/entreprise/missions/core/service/AffectationService.java)

C'est le service le plus important du projet.

Responsabilites :

- lister les affectations
- creer une affectation
- modifier une affectation
- desactiver une affectation
- retourner les missions de l'employe connecte

Regles metier majeures :

- seules les personnes de role `EMPLOYE` peuvent etre affectees
- l'employe doit etre actif
- la mission doit etre active
- la periode d'affectation doit etre incluse dans la mission
- le total des taux d'occupation d'un employe ne doit pas depasser `100%` sur une periode qui se chevauche

Le message :

- `Le taux d'occupation cumule depasse 100%`

vient directement de ce service.

### 8.5 DashboardService

Fichier :

- [DashboardService.java](C:/Users/User/Desktop/ProjetJ2ee/core/src/main/java/com/entreprise/missions/core/service/DashboardService.java)

Responsabilites :

- calculer les indicateurs du tableau de bord
- compter les employes actifs
- compter les specialites
- compter les missions planifiees et actives
- compter les affectations actives
- remonter les alertes de fin proche
- remonter les missions prioritaires

## 9. Repositories et filtrage dynamique

### 9.1 Repositories

Les repositories se trouvent dans :

- `data/src/main/java/com/entreprise/missions/data/repository`

Ils etendent :

- `JpaRepository`
- parfois `JpaSpecificationExecutor`

Exemples :

- [UtilisateurRepository.java](C:/Users/User/Desktop/ProjetJ2ee/data/src/main/java/com/entreprise/missions/data/repository/UtilisateurRepository.java)
- [MissionRepository.java](C:/Users/User/Desktop/ProjetJ2ee/data/src/main/java/com/entreprise/missions/data/repository/MissionRepository.java)
- [SpecialiteRepository.java](C:/Users/User/Desktop/ProjetJ2ee/data/src/main/java/com/entreprise/missions/data/repository/SpecialiteRepository.java)
- [AffectationRepository.java](C:/Users/User/Desktop/ProjetJ2ee/data/src/main/java/com/entreprise/missions/data/repository/AffectationRepository.java)

### 9.2 AffectationRepository

Le fichier [AffectationRepository.java](C:/Users/User/Desktop/ProjetJ2ee/data/src/main/java/com/entreprise/missions/data/repository/AffectationRepository.java) contient plusieurs requetes utiles :

- `findOverlappingForEmploye(...)`
- `findActiveTeamByMissionId(...)`
- `findEmployeeAssignments(...)`
- `findAssignmentsEndingBetween(...)`

La methode `findOverlappingForEmploye(...)` est essentielle pour detecter les chevauchements de planning.

### 9.3 Specifications

Le projet utilise des Specifications JPA pour les filtres dynamiques :

- [UtilisateurSpecifications.java](C:/Users/User/Desktop/ProjetJ2ee/core/src/main/java/com/entreprise/missions/core/specification/UtilisateurSpecifications.java)
- [MissionSpecifications.java](C:/Users/User/Desktop/ProjetJ2ee/core/src/main/java/com/entreprise/missions/core/specification/MissionSpecifications.java)
- [AffectationSpecifications.java](C:/Users/User/Desktop/ProjetJ2ee/core/src/main/java/com/entreprise/missions/core/specification/AffectationSpecifications.java)
- [SpecialiteSpecifications.java](C:/Users/User/Desktop/ProjetJ2ee/core/src/main/java/com/entreprise/missions/core/specification/SpecialiteSpecifications.java)

Pourquoi cette approche est bonne :

- un seul endpoint peut servir plusieurs combinaisons de filtres
- le code reste modulable
- on evite de multiplier les methodes SQL

## 10. Couche web REST

Les controleurs se trouvent dans :

- `api/src/main/java/com/entreprise/missions/api/web`

### 10.1 AuthController

Fichier :

- [AuthController.java](C:/Users/User/Desktop/ProjetJ2ee/api/src/main/java/com/entreprise/missions/api/web/AuthController.java)

Endpoints :

- `POST /api/auth/login`
- `GET /api/auth/me`

### 10.2 UtilisateurController

Fichier :

- [UtilisateurController.java](C:/Users/User/Desktop/ProjetJ2ee/api/src/main/java/com/entreprise/missions/api/web/UtilisateurController.java)

Endpoints :

- `GET /api/utilisateurs`
- `GET /api/utilisateurs/{id}`
- `POST /api/utilisateurs`
- `PUT /api/utilisateurs/{id}`
- `DELETE /api/utilisateurs/{id}`

Droit :

- `ADMIN` uniquement

### 10.3 SpecialiteController

Fichier :

- [SpecialiteController.java](C:/Users/User/Desktop/ProjetJ2ee/api/src/main/java/com/entreprise/missions/api/web/SpecialiteController.java)

CRUD admin sur les specialites.

### 10.4 MissionController

Fichier :

- [MissionController.java](C:/Users/User/Desktop/ProjetJ2ee/api/src/main/java/com/entreprise/missions/api/web/MissionController.java)

Endpoints principaux :

- CRUD admin sur les missions
- `GET /api/missions/{id}/team`

Le endpoint `team` est accessible a :

- `ADMIN`
- `EMPLOYE`

### 10.5 AffectationController

Fichier :

- [AffectationController.java](C:/Users/User/Desktop/ProjetJ2ee/api/src/main/java/com/entreprise/missions/api/web/AffectationController.java)

CRUD admin sur les affectations.

### 10.6 AdminDashboardController

Fichier :

- [AdminDashboardController.java](C:/Users/User/Desktop/ProjetJ2ee/api/src/main/java/com/entreprise/missions/api/web/AdminDashboardController.java)

Endpoint :

- `GET /api/admin/dashboard`

### 10.7 EmployeeController

Fichier :

- [EmployeeController.java](C:/Users/User/Desktop/ProjetJ2ee/api/src/main/java/com/entreprise/missions/api/web/EmployeeController.java)

Endpoints :

- `GET /api/employee/missions`
- `GET /api/employee/profile`

## 11. Gestion des erreurs

Le projet centralise la gestion des erreurs dans :

- [RestExceptionHandler.java](C:/Users/User/Desktop/ProjetJ2ee/api/src/main/java/com/entreprise/missions/api/web/RestExceptionHandler.java)

Comportement :

- `NotFoundException` -> `404`
- `BusinessException` -> `400`
- `MethodArgumentNotValidException` -> `400`
- `AccessDeniedException` -> `403`
- autre erreur -> `500`

Interet :

- le frontend recoit toujours un JSON coherent
- les messages sont plus propres pour l'utilisateur

## 12. Securite JWT

### 12.1 SecurityConfig

Fichier :

- [SecurityConfig.java](C:/Users/User/Desktop/ProjetJ2ee/api/src/main/java/com/entreprise/missions/api/security/SecurityConfig.java)

Ce fichier configure :

- CORS
- CSRF desactive
- sessions stateless
- filtre JWT
- routes publiques
- `PasswordEncoder`

Routes publiques :

- `POST /api/auth/login`
- `GET /actuator/health`

Le reste demande un token.

### 12.2 AuthService

Fichier :

- [AuthService.java](C:/Users/User/Desktop/ProjetJ2ee/api/src/main/java/com/entreprise/missions/api/service/AuthService.java)

Role :

- verifier l'email et le mot de passe
- generer un token JWT
- retourner un `AuthResponse`

Observation :

- le service contient encore une methode `register(...)`
- mais cette inscription n'est pas exposee dans le controller actuel

### 12.3 JwtService

Fichier :

- [JwtService.java](C:/Users/User/Desktop/ProjetJ2ee/api/src/main/java/com/entreprise/missions/api/security/JwtService.java)

Role :

- construire le JWT
- extraire le username depuis le token
- verifier validite et expiration

Le token embarque notamment :

- l'email
- le role
- le nom complet

### 12.4 JwtAuthenticationFilter

Fichier :

- [JwtAuthenticationFilter.java](C:/Users/User/Desktop/ProjetJ2ee/api/src/main/java/com/entreprise/missions/api/security/JwtAuthenticationFilter.java)

Role :

- lire le header `Authorization`
- verifier le token
- remettre l'utilisateur dans le contexte Spring Security

### 12.5 AppUserDetailsService

Fichier :

- [AppUserDetailsService.java](C:/Users/User/Desktop/ProjetJ2ee/api/src/main/java/com/entreprise/missions/api/security/AppUserDetailsService.java)

Role :

- charger l'utilisateur depuis la base
- verifier qu'il est actif
- convertir son role en `ROLE_ADMIN` ou `ROLE_EMPLOYE`

## 13. Frontend Angular

## 13.1 Structure

Le frontend se trouve dans :

- `frontend/src/app`

Sous-ensembles principaux :

- `core/`
- `pages/`
- `shell/`

### 13.2 Routing

Fichier :

- [app.routes.ts](C:/Users/User/Desktop/ProjetJ2ee/frontend/src/app/app.routes.ts)

Principes :

- `/login` pour la connexion
- shell protege pour le reste
- routes admin
- routes employe
- route partagee pour l'equipe d'une mission

### 13.3 AuthService Angular

Fichier :

- [auth.service.ts](C:/Users/User/Desktop/ProjetJ2ee/frontend/src/app/core/auth.service.ts)

Role :

- envoyer le login
- stocker le token
- stocker l'utilisateur de session
- calculer `isAuthenticated`
- calculer le role courant

Le token est stocke dans :

- `sessionStorage`

### 13.4 Interceptor

Fichier :

- [auth.interceptor.ts](C:/Users/User/Desktop/ProjetJ2ee/frontend/src/app/core/auth.interceptor.ts)

Role :

- intercepter toutes les requetes HTTP
- ajouter automatiquement le header `Authorization: Bearer ...`

### 13.5 Guards

Fichiers :

- [auth.guard.ts](C:/Users/User/Desktop/ProjetJ2ee/frontend/src/app/core/auth.guard.ts)
- [role.guard.ts](C:/Users/User/Desktop/ProjetJ2ee/frontend/src/app/core/role.guard.ts)

Role :

- bloquer les utilisateurs non connectes
- bloquer les utilisateurs qui n'ont pas le bon role

### 13.6 ApiService

Fichier :

- [api.service.ts](C:/Users/User/Desktop/ProjetJ2ee/frontend/src/app/core/api.service.ts)

Role :

- centraliser tous les appels API
- eviter d'ecrire les URLs REST dans chaque page

Exemples :

- `listSpecialites(...)`
- `createUtilisateur(...)`
- `listMissions(...)`
- `createAffectation(...)`
- `getDashboard()`
- `getEmployeeProfile()`

### 13.7 models.ts

Fichier :

- [models.ts](C:/Users/User/Desktop/ProjetJ2ee/frontend/src/app/core/models.ts)

Role :

- decrire les types TypeScript utilises par Angular

Interet :

- meilleur autocompletion
- meilleure verification de type
- moins d'erreurs de structure JSON

## 14. Shell et experience utilisateur

Le shell principal est :

- [shell.component.ts](C:/Users/User/Desktop/ProjetJ2ee/frontend/src/app/shell/shell.component.ts)

Il contient :

- la sidebar
- la topbar
- la recherche de navigation
- le bouton deconnexion
- le `router-outlet`

Le shell adapte automatiquement son menu selon le role :

- admin
- employe

## 15. Pages principales du frontend

### 15.1 Login

Fichier :

- [login-page.component.ts](C:/Users/User/Desktop/ProjetJ2ee/frontend/src/app/pages/auth/login-page.component.ts)

Fonctionnement :

- reactive form
- appel a `authService.login(...)`
- si succes -> redirection vers `/`
- si echec -> affichage d'un message

### 15.2 Redirection par role

Fichier :

- [role-redirect.component.ts](C:/Users/User/Desktop/ProjetJ2ee/frontend/src/app/pages/shared/role-redirect.component.ts)

Si le role est :

- `ADMIN` -> `/admin/dashboard`
- `EMPLOYE` -> `/employee/missions`

### 15.3 Dashboard admin

Fichier :

- [dashboard-page.component.ts](C:/Users/User/Desktop/ProjetJ2ee/frontend/src/app/pages/admin/dashboard-page.component.ts)

La page :

- appelle `/api/admin/dashboard`
- construit les cartes de KPI
- construit le donut
- construit la liste des alertes et evenements

### 15.4 Pages de gestion

Pages principales :

- [specialites-page.component.ts](C:/Users/User/Desktop/ProjetJ2ee/frontend/src/app/pages/admin/specialites-page.component.ts)
- [utilisateurs-page.component.ts](C:/Users/User/Desktop/ProjetJ2ee/frontend/src/app/pages/admin/utilisateurs-page.component.ts)
- [missions-page.component.ts](C:/Users/User/Desktop/ProjetJ2ee/frontend/src/app/pages/admin/missions-page.component.ts)
- [affectations-page.component.ts](C:/Users/User/Desktop/ProjetJ2ee/frontend/src/app/pages/admin/affectations-page.component.ts)

Etat actuel apres refonte UI :

- liste principale
- bouton `Ajouter`
- popup modal pour creation/modification
- boutons `Modifier` et `Desactiver`

### 15.5 Feedback utilisateur

Fichier :

- [feedback.service.ts](C:/Users/User/Desktop/ProjetJ2ee/frontend/src/app/core/feedback.service.ts)

Role :

- afficher des toasts
- afficher des dialogues de confirmation

Utilisation :

- succes apres creation
- erreur apres validation ou echec serveur
- confirmation avant desactivation

## 16. Flux complet d'une fonctionnalite

### 16.1 Flux de connexion

1. l'utilisateur remplit le formulaire Angular
2. Angular appelle `POST /api/auth/login`
3. `AuthController` recoit la requete
4. `AuthService` verifie l'utilisateur
5. `JwtService` genere le token
6. Angular stocke le token dans `sessionStorage`
7. l'interceptor ajoute le token aux requetes suivantes
8. `JwtAuthenticationFilter` authentifie l'utilisateur cote backend

### 16.2 Flux creation utilisateur

1. l'admin clique sur `Ajouter`
2. la popup s'ouvre
3. Angular envoie le formulaire a `/api/utilisateurs`
4. `UtilisateurController` recoit
5. `UtilisateurService` verifie unicite et specialite
6. le mot de passe est chiffre
7. l'utilisateur est enregistre en base
8. Angular recharge la liste et affiche une notification

### 16.3 Flux creation mission

1. l'admin clique sur `Ajouter une mission`
2. Angular envoie `/api/missions`
3. `MissionService` verifie le code et les dates
4. l'entite mission est enregistree
5. le frontend recharge la liste

### 16.4 Flux creation affectation

1. l'admin ouvre la popup d'affectation
2. il choisit une mission
3. il choisit un ou plusieurs employes
4. il choisit les dates et le taux
5. Angular fait une pre-verification cote interface
6. le backend refait les controles de verite
7. le repository cherche les chevauchements
8. si la charge est acceptable, l'affectation est creee
9. sinon une `BusinessException` est retournee

## 17. Pagination et tri

Le projet utilise :

- [PageableFactory.java](C:/Users/User/Desktop/ProjetJ2ee/api/src/main/java/com/entreprise/missions/api/web/PageableFactory.java)
- [PagedResponse.java](C:/Users/User/Desktop/ProjetJ2ee/core/src/main/java/com/entreprise/missions/core/dto/PagedResponse.java)

Le backend recoit :

- `page`
- `size`
- `sort`

Puis renvoie :

- `content`
- `totalElements`
- `totalPages`
- `page`
- `size`

## 18. Donnees de demonstration

Le fichier :

- [DemoDataSeeder.java](C:/Users/User/Desktop/ProjetJ2ee/api/src/main/java/com/entreprise/missions/api/config/DemoDataSeeder.java)

sert a peupler la base si elle est vide.

Il cree :

- 3 specialites
- 1 admin
- 3 employes
- 2 missions
- 3 affectations

Comptes demo :

- `admin@missions.local / Admin123!`
- `youssef@missions.local / Employe123!`
- `salma@missions.local / Employe123!`

Observation technique :

- certaines chaines de caracteres presentent un probleme d'encodage visuel dans ce fichier
- cela ne bloque pas le fonctionnement, mais le texte meriterait un nettoyage

## 19. Configuration et lancement

Configuration principale :

- [application.yml](C:/Users/User/Desktop/ProjetJ2ee/api/src/main/resources/application.yml)

Variables utiles :

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `APP_JWT_SECRET`
- `APP_JWT_EXPIRATION_HOURS`

Frontend :

- Angular sur `localhost:4200`

Backend :

- Spring Boot sur `localhost:8080`

Base :

- MySQL

## 20. Points forts du code

- bonne separation des couches
- usage coherent de DTO
- validations metier dans les services
- securite JWT bien separee
- filtres dynamiques via Specifications
- frontend type avec interfaces TypeScript
- notifications utilisateur et confirmations
- architecture assez propre pour un projet pedagogique

## 21. Limites et points d'attention

- le modele mission contient encore `clientNom`
- l'inscription libre n'est pas exposee meme si une methode `register(...)` existe
- certaines chaines du seed ont un probleme d'encodage
- il y a encore des ajustements UI possibles pour uniformiser toutes les pages
- la suppression est logique, pas physique

## 22. Conclusion

Ce projet est une application complete de gestion des missions, construite proprement autour d'une architecture separee :

- Angular pour la presentation
- Spring MVC pour l'exposition web
- services `core` pour la logique metier
- JPA pour la persistance
- MySQL comme base

Le coeur reel du projet se trouve dans :

- les services metier
- les entites JPA
- la securite JWT
- la relation entre utilisateurs, missions, specialites et affectations

Si tu veux comprendre le projet tres vite, lis dans cet ordre :

1. [app.routes.ts](C:/Users/User/Desktop/ProjetJ2ee/frontend/src/app/app.routes.ts)
2. [api.service.ts](C:/Users/User/Desktop/ProjetJ2ee/frontend/src/app/core/api.service.ts)
3. [AffectationController.java](C:/Users/User/Desktop/ProjetJ2ee/api/src/main/java/com/entreprise/missions/api/web/AffectationController.java)
4. [AffectationService.java](C:/Users/User/Desktop/ProjetJ2ee/core/src/main/java/com/entreprise/missions/core/service/AffectationService.java)
5. [AffectationRepository.java](C:/Users/User/Desktop/ProjetJ2ee/data/src/main/java/com/entreprise/missions/data/repository/AffectationRepository.java)
6. [Affectation.java](C:/Users/User/Desktop/ProjetJ2ee/data/src/main/java/com/entreprise/missions/data/model/Affectation.java)

Avec cette chaine, tu comprends deja presque toute la logique du projet.
