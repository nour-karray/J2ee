# Plateforme De Gestion Des Missions

Application de demonstration construite avec `Angular` en frontend et `Spring Boot / Spring MVC / JPA / JWT` en backend, dans l'esprit du cours sur l'architecture `3 tiers + MVC + persistance`.

## Structure

- `data/`: entites JPA, enums et repositories
- `core/`: DTO, regles metier, validations et services
- `api/`: application Spring Boot executable, securite JWT, controleurs REST et seed de demonstration
- `frontend/`: SPA Angular avec dashboard admin et espace employe
- `docs/diagrams/`: diagrammes Mermaid demandes par le sujet

## Fonctionnalites

- Authentification JWT avec roles `ADMIN` et `EMPLOYE`
- Gestion des specialites, utilisateurs, missions et affectations
- Dashboard admin avec alertes et indicateurs
- Consultation employe: profil, missions et equipe d'une mission
- Validations metier:
  - email et matricule uniques
  - specialite obligatoire pour un employe
  - dates de mission coherentes
  - dates d'affectation incluses dans la mission
  - charge cumulee d'un employe `<= 100%`

## Lancement Backend

Le backend est un projet Maven multi-modules. Si tu lances `api` seul sans reinstaller `core` et `data`, tu peux avoir une erreur `ClassNotFoundException` ou `NoClassDefFoundError`.

### Methode recommandee sous Windows PowerShell

Depuis la racine du projet:

```powershell
cd C:\Users\User\Desktop\ProjetJ2ee
.\run-backend.ps1
```

### Methode manuelle

1. Demarrer MySQL localement.
2. Depuis la racine du projet, reinstaller les modules locaux:

```powershell
cd C:\Users\User\Desktop\ProjetJ2ee
mvn -DskipTests install
```

3. Ensuite seulement, lancer l'API:

```powershell
cd C:\Users\User\Desktop\ProjetJ2ee\api
$env:SPRING_DATASOURCE_URL='jdbc:mysql://localhost:3307/plateforme_missions?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=Africa/Lagos'
$env:SPRING_DATASOURCE_USERNAME='missions'
$env:SPRING_DATASOURCE_PASSWORD='missions123'
mvn spring-boot:run
```

API disponible sur [http://localhost:8080](http://localhost:8080).

## Lancement Frontend

Depuis [frontend/package.json](/C:/Users/User/Desktop/ProjetJ2ee/frontend/package.json):

```powershell
cd C:\Users\User\Desktop\ProjetJ2ee\frontend
npm install
npm start
```

Frontend disponible sur [http://localhost:4200](http://localhost:4200).

## Variables utiles

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `APP_JWT_SECRET`
- `APP_JWT_EXPIRATION_HOURS`

Les valeurs par defaut sont definies dans [application.yml](/C:/Users/User/Desktop/ProjetJ2ee/api/src/main/resources/application.yml:1).

## Comptes De Demonstration

- `admin@missions.local / Admin123!`
- `youssef@missions.local / Employe123!`
- `salma@missions.local / Employe123!`

## Diagrammes

- [Cas d'utilisation](/C:/Users/User/Desktop/ProjetJ2ee/docs/diagrams/use-case.mmd)
- [Diagramme de classes](/C:/Users/User/Desktop/ProjetJ2ee/docs/diagrams/class-diagram.mmd)
- [Schema entites-relationnel](/C:/Users/User/Desktop/ProjetJ2ee/docs/diagrams/entity-relationship.mmd)
- [Diagramme de composants](/C:/Users/User/Desktop/ProjetJ2ee/docs/diagrams/component-diagram.mmd)
- [Sequence authentification JWT](/C:/Users/User/Desktop/ProjetJ2ee/docs/diagrams/sequence-auth-jwt.mmd)
- [Sequence affectation employe -> mission](/C:/Users/User/Desktop/ProjetJ2ee/docs/diagrams/sequence-assignment.mmd)

## IntelliJ

- Ouvrir le projet racine comme projet Maven
- Recharger le `pom.xml` parent pour charger `data`, `core` et `api`
- Ouvrir `frontend/` comme module JavaScript si tu veux travailler Angular dans le meme workspace
- Lancer `PlateformeMissionsApplication` depuis [PlateformeMissionsApplication.java](/C:/Users/User/Desktop/ProjetJ2ee/api/src/main/java/com/entreprise/missions/api/PlateformeMissionsApplication.java:1)
