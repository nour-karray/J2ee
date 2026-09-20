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

Copiez `.env.example` dans votre environnement et définissez un `APP_JWT_SECRET` Base64 aléatoire d'au moins 32 octets. L'API refuse de démarrer sans cette clé.

```powershell
docker compose up -d mysql
mvn spring-boot:run -pl api -Dspring-boot.run.profiles=dev
cd frontend
npm ci
npm start
```

MySQL écoute sur `localhost:3306`. Les identifiants Docker par défaut sont explicitement réservés à la démonstration locale et peuvent être redéfinis par variables d'environnement.

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
