# Plateforme de gestion des missions

Application portfolio de planification des missions et affectations d'employés. Elle associe un frontend Angular à une API Spring Boot sécurisée, organisée en modules Maven `data`, `core` et `api`.

## Fonctionnalités

- Administration des utilisateurs, spécialités, missions et affectations
- Espace employé avec profil et missions autorisées
- Authentification JWT et contrôle d'accès par rôle
- Contrôle transactionnel de charge simultanée (maximum 100 %)
- Affectation groupée atomique : toutes les affectations sont créées ou aucune
- Tableau de bord fondé exclusivement sur les données persistées

## Rôles et règles métier

- `ADMIN` gère toutes les ressources.
- `EMPLOYE` accède uniquement à ses missions et aux équipes de missions auxquelles il est affecté.
- Une affectation doit rester dans la période de sa mission.
- La charge d'un employé ne dépasse jamais 100 % à une date donnée.
- Une mission ou un employé avec des affectations actives ne peut pas être désactivé.

## Architecture

```text
Angular 19 → Spring Security / JWT → API module → Core business rules → Data / JPA → MySQL
```

Stack : Java 21, Spring Boot 3, Spring Security, JPA/Hibernate, MySQL 8, Maven et Angular 19.

## Démarrage

`.env.example` est une référence : ni PowerShell ni Spring Boot ne chargent automatiquement un fichier `.env`. Définissez réellement la clé JWT dans le shell. Le script installe les modules `data` et `core` avant de lancer `api`.

### A. Développement rapide avec H2

```powershell
$env:APP_JWT_SECRET = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
$env:SPRING_PROFILES_ACTIVE = 'dev'
.\run-backend.ps1
```

### B. MySQL avec Docker

```powershell
docker compose up -d mysql
$env:APP_JWT_SECRET = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
$env:SPRING_DATASOURCE_URL = 'jdbc:mysql://localhost:3306/plateforme_missions?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC'
$env:SPRING_DATASOURCE_USERNAME = 'missions_demo'
$env:SPRING_DATASOURCE_PASSWORD = 'missions_demo_password'
Remove-Item Env:SPRING_PROFILES_ACTIVE -ErrorAction SilentlyContinue
.\run-backend.ps1
```

Puis démarrez le client :

```powershell
cd frontend
npm ci
npm start
```

Le jeu de démonstration est désactivé par défaut. Pour une démonstration locale uniquement, démarrez avec `APP_DEMO_SEED_ENABLED=true`; ne l'activez jamais en production.

## Sécurité

- Aucun secret JWT ni fichier `.env` n'est commité.
- Les échecs de connexion retournent tous `401 Email ou mot de passe incorrect.`
- Les JWT malformés, expirés ou invalides retournent `401`, jamais une erreur interne.
- Les contacts des membres d'équipe sont masqués pour les employés.
- Les origines CORS sont configurées par `APP_CORS_ALLOWED_ORIGINS`.

## Tests et CI

```powershell
mvn test
mvn verify
cd frontend
npm ci
npm test -- --watch=false --browsers=ChromeHeadless
npm run build
```

GitHub Actions exécute indépendamment Maven et Angular sur chaque push et pull request.

## Limites et améliorations futures

Le projet est une démonstration mono-organisation. Une production réelle nécessiterait migrations versionnées, rotation des secrets, observabilité, limitation de débit et une gestion des comptes/permissions adaptée à l'organisation.
