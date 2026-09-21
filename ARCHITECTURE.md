# Architecture

Doc: application de gestion de missions à trois modules Maven et un client Angular.

```text
Angular 19
    │ HTTPS / JSON + JWT
    ▼
api (Spring Boot)
    ├── web: validation, HTTP, authorization
    ├── security: JWT, CORS, règles d'accès
    ▼
core
    ├── services métier et transactions
    └── DTO, recherches et règles d'intégrité
    ▼
data (JPA)
    ├── entités et repositories
    ▼
MySQL
```

Les modules `api`, `core` et `data` ont des responsabilités séparées : le web ne porte pas les règles métier, `core` ne dépend pas d'Angular, et `data` isole la persistance.

## Frontières de sécurité

- Le frontend améliore l'expérience utilisateur, mais les contrôles de rôle et d'appartenance sont appliqués par l'API.
- Les employés ne voient l'équipe que des missions auxquelles ils ont une affectation active.
- Les jetons invalides retournent `401`; le client efface alors sa session.
- La clé JWT, les identifiants de base et les origines CORS proviennent de l'environnement.

## Cohérence métier

La création d'affectation verrouille l'employé dans la transaction et calcule la charge maximale simultanée avec un sweep-line. Les opérations de lot sont atomiques. Une mission ou un employé ne peut pas être modifié d'une manière laissant des affectations actives incohérentes.
