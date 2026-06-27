# Demonstration Des Differentes Fonctionnalites De L'Application

## 1. Objectif

Cette demonstration a pour but de montrer les principales fonctionnalites de l'application **Plateforme de gestion des missions**, a savoir :

- l'authentification et la gestion des roles
- la gestion des specialites
- la gestion des utilisateurs
- la gestion des missions
- la gestion des affectations
- la consultation de l'espace employe
- les validations metier importantes

L'application repose sur :

- un frontend Angular
- un backend Spring Boot
- une base MySQL

## 2. Prerequis Pour La Demonstration

Avant de commencer la demonstration, il faut verifier :

- MySQL demarre
- backend Spring Boot demarre sur `http://localhost:8080`
- frontend Angular demarre sur `http://localhost:4200`

### Comptes Utiles

- Administrateur :
  - `admin@missions.local`
  - mot de passe : `Admin123!`

- Employe :
  - `youssef@missions.local`
  - mot de passe : `Employe123!`

Remarque :
- l'inscription publique libre n'est pas ouverte
- les comptes sont crees par l'administrateur

## 3. Vue Generale De L'Application

L'application propose deux espaces :

- **Espace administrateur**
  - tableau de bord
  - gestion des utilisateurs
  - gestion des missions
  - gestion des affectations
  - gestion des specialites

- **Espace employe**
  - consultation du profil
  - consultation des missions affectees
  - consultation de l'equipe d'une mission

## 4. Demonstration De L'Authentification

### 4.1 Connexion Administrateur

1. Ouvrir la page de connexion.
2. Saisir l'email administrateur.
3. Saisir le mot de passe.
4. Cliquer sur `Se connecter`.

### Resultat Attendu

- le systeme verifie les identifiants
- un token JWT est genere
- l'utilisateur est redirige vers le dashboard administrateur

### 4.2 Connexion Employe

1. Se deconnecter du compte administrateur.
2. Se reconnecter avec un compte employe.

### Resultat Attendu

- l'utilisateur n'accede pas aux pages d'administration
- il accede uniquement a son espace employe

## 5. Demonstration Du Tableau De Bord Administrateur

Apres connexion en tant qu'administrateur :

1. Ouvrir la page `Tableau de bord`.
2. Montrer les indicateurs principaux.

### Elements A Montrer

- nombre de missions
- nombre d'employes actifs
- alertes ou informations recentes
- raccourcis vers les modules principaux

### Interet

Cette page permet a l'administrateur d'avoir une vue rapide sur l'etat global de la plateforme.

## 6. Demonstration De La Gestion Des Specialites

### 6.1 Ajouter Une Specialite

1. Ouvrir le module `Specialites`.
2. Cliquer sur le bouton `Ajouter` ou `Nouvelle specialite`.
3. Remplir :
   - nom
   - description
4. Valider.

### Resultat Attendu

- la specialite est enregistree
- elle apparait dans la liste
- un message de succes est affiche

### 6.2 Modifier Une Specialite

1. Cliquer sur `Modifier` sur une specialite existante.
2. Changer le nom ou la description.
3. Enregistrer.

### Resultat Attendu

- les donnees sont mises a jour
- la liste est rafraichie
- un message de confirmation est affiche

### 6.3 Desactiver Une Specialite

1. Choisir une specialite.
2. Cliquer sur `Desactiver`.

### Resultat Attendu

- la specialite n'est pas forcement supprimee physiquement
- elle est desactivee logiquement
- un message confirme l'operation

## 7. Demonstration De La Gestion Des Utilisateurs

### 7.1 Ajouter Un Utilisateur

1. Ouvrir le module `Utilisateurs`.
2. Cliquer sur `Nouvel utilisateur`.
3. Remplir :
   - prenom
   - nom
   - email
   - telephone
   - role
   - specialite si le role est `EMPLOYE`
   - mot de passe
   - confirmation du mot de passe
4. Valider.

### Resultat Attendu

- le compte est cree
- le matricule est genere automatiquement
- le nouvel utilisateur apparait dans la liste
- une notification de succes est affichee

### 7.2 Demonstration D'Une Validation

Cas a montrer :

- tenter de creer un employe sans specialite
- ou mettre deux mots de passe differents
- ou reutiliser un email deja existant

### Resultat Attendu

- le backend refuse l'enregistrement
- un message clair s'affiche
- l'utilisateur comprend pourquoi l'action a echoue

### 7.3 Modifier Un Utilisateur

1. Cliquer sur `Modifier`.
2. Changer une ou plusieurs informations.
3. Enregistrer.

### Resultat Attendu

- les informations sont mises a jour
- la liste est actualisee
- un message de succes est affiche

### 7.4 Desactiver Un Utilisateur

1. Selectionner un utilisateur.
2. Cliquer sur `Desactiver`.

### Resultat Attendu

- le compte est desactive
- il n'apparait plus comme compte actif

## 8. Demonstration De La Gestion Des Missions

### 8.1 Ajouter Une Mission

1. Ouvrir le module `Missions`.
2. Cliquer sur `Ajouter une mission`.
3. Remplir :
   - titre
   - description
   - client ou structure selon la version actuelle
   - localisation
   - date debut
   - date fin
   - statut initial
   - priorite

### Resultat Attendu

- la mission est enregistree
- son code est genere automatiquement
- elle apparait dans la liste
- un message de succes est affiche

### 8.2 Modifier Une Mission

1. Cliquer sur `Modifier`.
2. Mettre a jour les dates, le statut ou la description.
3. Enregistrer.

### Resultat Attendu

- la mission est mise a jour
- le changement est visible dans la liste

### 8.3 Validation Metier Sur Les Dates

Exemple a montrer :

- mettre une date de fin avant la date de debut

### Resultat Attendu

- le systeme refuse la mission
- un message d'erreur indique que la periode est invalide

## 9. Demonstration De La Gestion Des Affectations

### 9.1 Creer Une Affectation

1. Ouvrir le module `Affectations`.
2. Cliquer sur `Ajouter`.
3. Choisir :
   - mission
   - employe
   - date debut
   - date fin
   - taux d'occupation
   - statut
   - commentaire
4. Valider.

### Resultat Attendu

- l'affectation est creee
- elle apparait dans la liste
- un message de succes est affiche

### 9.2 Affecter Plusieurs Employes A Une Mission

Selon l'interface actuelle :

1. Selectionner une mission.
2. Choisir plusieurs employes dans la liste.
3. Valider l'affectation.

### Resultat Attendu

- plusieurs employes sont lies a la meme mission
- l'operation reste encadree par les regles metier

### 9.3 Validation Metier Importante

Cas a montrer :

- creer une affectation qui fait depasser `100%` de charge a un employe sur la meme periode

### Resultat Attendu

- le systeme refuse l'affectation
- le message explique que le taux d'occupation cumule depasse `100%`

Ce point est important car il montre que l'application ne fait pas qu'enregistrer des donnees : elle applique de vraies regles de gestion.

## 10. Demonstration De La Recherche Et Des Filtres

Sur les pages :

- Utilisateurs
- Missions
- Affectations
- Specialites

on peut montrer :

1. saisie d'un mot cle
2. choix d'un filtre
3. clic sur `Appliquer`

### Resultat Attendu

- la liste se met a jour
- seules les donnees correspondant aux criteres sont affichees

## 11. Demonstration De L'Espace Employe

### 11.1 Consultation Du Profil

1. Se connecter avec un compte employe.
2. Ouvrir `Mon profil`.

### Resultat Attendu

- l'employe consulte ses informations
- il ne peut pas acceder aux pages d'administration

### 11.2 Consultation Des Missions Affectees

1. Ouvrir `Mes missions`.
2. Montrer les missions reliees a l'employe connecte.

### Resultat Attendu

- seules les missions de cet employe sont visibles

### 11.3 Consultation De L'Equipe D'Une Mission

1. Ouvrir le detail ou l'equipe d'une mission.
2. Afficher les autres employes affectes.

### Resultat Attendu

- l'employe voit la composition de l'equipe sans avoir acces a la gestion complete

## 12. Demonstration De La Gestion Des Erreurs Et Des Messages

L'application doit montrer clairement si une action a reussi ou echoue.

Points a montrer :

- popup ou message de succes apres ajout
- popup ou message d'erreur si validation metier echoue
- message si un email existe deja
- message si le mot de passe est invalide
- message si la charge d'un employe depasse `100%`

### Interet

Cette partie montre que l'application est utilisable et comprehensible pour l'utilisateur final.

## 13. Scenario De Demonstration Recommande A L'Oral

Voici un enchainement simple et efficace :

1. Presenter la page de connexion.
2. Se connecter en administrateur.
3. Montrer le tableau de bord.
4. Ajouter une specialite.
5. Ajouter un utilisateur employe.
6. Ajouter une mission.
7. Creer une affectation.
8. Montrer une erreur volontaire de validation.
9. Se deconnecter.
10. Se connecter en employe.
11. Montrer les missions de l'employe et son profil.

## 14. Conclusion

Cette demonstration met en evidence que l'application permet :

- de securiser l'acces par role
- de gerer les donnees principales de l'entreprise
- d'appliquer des regles metier coherentes
- d'offrir un espace dedie a l'administrateur et a l'employe

L'application ne se limite donc pas a des operations CRUD simples ; elle integre egalement des controles de gestion utiles pour le suivi des missions et des ressources humaines.
