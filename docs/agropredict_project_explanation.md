# AgroPredict — Explication complète du projet

## 1. Vue d’ensemble

AgroPredict est une application web full-stack pour la gestion agricole et la prévision de rendement. Elle permet à des utilisateurs comme les agriculteurs, chefs de coopérative, analystes et administrateurs de :

- se connecter / s’inscrire,
- gérer des parcelles agricoles,
- ajouter des cultures et suivre leur stade de développement,
- consulter des prévisions de rendement,
- visualiser la météo locale,
- recevoir des alertes,
- générer des rapports,
- consulter une carte nationale de production.

Le projet est séparé en deux blocs principaux :

- Backend : Node.js + Express + SQLite
- Frontend : React + Vite + TypeScript + Tailwind

---

## 2. Arborescence du projet

### Racine du projet

- /home/nembot/Bureau/BUREAU/agropredict
  - README.md : documentation générale du projet
  - index.html : point d’entrée HTML de base du projet statique
  - style.css : CSS global du prototype initial
  - script.js : script JS du prototype ou version statique
  - client/ : application front-end React
  - server/ : API backend et base SQLite

### Dossier client

- client/package.json : dépendances et scripts du front
- client/vite.config.ts : config Vite, hôte et proxy API
- client/index.html : HTML principal Vite
- client/src/
  - main.tsx : point d’entrée React
  - App.tsx : définition des routes et protection des pages
  - api.ts : client HTTP pour communiquer avec le backend
  - auth.tsx : contexte d’authentification JWT
  - types.ts : types TypeScript pour les données
  - index.css : styles globaux Tailwind + thème
  - components/
    - Layout.tsx : menu latéral, header, thème, navigation
    - ui.tsx : composants réutilisables (cards, badges, headers)
    - CameroonMap.tsx : carte SVG du Cameroun
  - pages/
    - Login.tsx : page de connexion
    - Register.tsx : page d’inscription
    - Dashboard.tsx : overview du tableau de bord
    - Weather.tsx : météo régionale
    - Parcels.tsx : liste des parcelles
    - ParcelForm.tsx : création / édition de parcelle
    - ParcelDetail.tsx : détail d’une parcelle
    - Predictions.tsx : prévisions de rendement
    - Alerts.tsx : alertes de culture / météo
    - Reports.tsx : génération et historique des rapports
    - NationalMap.tsx : carte nationale / statistiques régionales
    - Admin.tsx : gestion utilisateur / modèles ML
    - Profile.tsx : profil utilisateur
    - Cooperative.tsx : vue coopérative

### Dossier server

- server/package.json : dépendances et scripts backend
- server/src/
  - index.js : point d’entrée principal de l’API Express
  - auth.js : JWT + middleware d’authentification + RBAC
  - db.js : création de la base SQLite et des tables
  - prediction.js : moteur de calcul de rendement simulé
  - weather.js : génération météo simulée par région
  - seed.js : données de démonstration pour initialiser la base
  - data/ : base SQLite générée localement

---

## 3. Explication du backend

### 3.1 server/src/db.js

Ce fichier crée la base SQLite et les tables nécessaires.

Tables principales :

- users : utilisateurs, mot de passe hashé, rôle, région, statut actif
- cooperatives : coopératives
- parcels : parcelles (coordonnées, surface, type de sol, irrigation, région)
- crops : cultures associées aux parcelles
- predictions : résultats de prévision de rendement
- alerts : alertes de risque / météo / culture
- reports : historique des rapports générés
- ml_models : modèles de ML et métriques
- crop_events : évènements liés à un crop

Fonction clé :

- init() : exécute le script SQL pour créer les tables si elles n’existent pas.

### 3.2 server/src/auth.js

Ce fichier gère l’authentification, la sécurité et les droits d’accès.

Fonctions clés :

- sign(user) : crée un JWT avec les infos utilisateur
- authenticate : middleware qui vérifie le token JWT
- requireRole(role) : middleware qui vérifie que l’utilisateur a le bon rôle

Rôle principal : sécuriser chaque route API selon le profil de l’utilisateur.

### 3.3 server/src/prediction.js

C’est le cœur métier de la logique “IA / prévision”.

Il simule un moteur de prédiction de rendement agricole à partir de :

- type de culture,
- région,
- type de sol,
- variables climatiques,
- stade de culture,
- pratiques culturales.

Fonctions principales :

- predict(crop, parcel, region, now) : calcule le rendement estimé, scénarios, intervalles de confiance, recommandations.
- historicalComparison(cropType, region) : compare avec des références historiques.
- buildRecommendations(...) : génère des conseils agronomiques.
- hash(), seededNoise() : génération de bruit pseudo-aléatoire stable.

Ce fichier ne charge pas un vrai modèle ML entraîné ; il simule des calculs cohérents pour une démonstration fonctionnelle.

### 3.4 server/src/weather.js

Génère des prévisions météo par région.

Fonctions :

- forecast(region, days) : retourne une série de jours avec température min/max, précipitations, humidité, vent, UV, risque de gel.

### 3.5 server/src/seed.js

Initialise la base de données avec des données de démonstration.

Il crée :

- comptes utilisateurs,
- coopératives,
- parcelles,
- cultures,
- alertes,
- modèles ML simulés,
- rapports initiaux.

### 3.6 server/src/index.js

C’est le fichier central du backend.

Il contient :

- configuration Express,
- activation CORS,
- gestion du JSON,
- déclaration des routes API,
- logique métier pour auth, parcels, crops, predictions, weather, alerts, reports, admin, stats.

Routes principales :

- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- GET /api/parcels
- POST /api/parcels
- PUT /api/parcels/:id
- DELETE /api/parcels/:id
- POST /api/parcels/:id/crops
- GET /api/predictions
- GET /api/predictions/:cropId
- GET /api/weather/:region
- GET /api/alerts
- POST /api/alerts/:id/ack
- GET /api/reports
- POST /api/reports/generate
- GET /api/models
- GET /api/stats/dashboard
- GET /api/stats/national
- GET /api/users
- PATCH /api/users/:id

---

## 4. Explication du frontend

### 4.1 client/src/main.tsx

Point d’entrée de l’application React.

Fonction :

- monte l’application dans le DOM,
- initialise AuthProvider,
- charge le router,
- affiche App.

### 4.2 client/src/App.tsx

Gère le routing principal et les accès protégés.

Fonctions :

- Protected({ children }) : empêche l’accès à une page si l’utilisateur n’est pas connecté
- App() : définit les routes du site

Routes principales :

- /login
- /register
- / (dashboard protégé)
- /weather
- /parcels
- /parcels/new
- /parcels/:id
- /predictions
- /alerts
- /reports
- /map
- /admin
- /cooperative
- /profile

### 4.3 client/src/auth.tsx

Contexte d’authentification du front.

Fonctions :

- AuthProvider : charge le token localStorage et récupère l’utilisateur connecté
- login(email, password) : envoie la requête de connexion
- register(data) : envoie la requête d’inscription
- logout() : supprime le token et vide l’utilisateur
- useAuth() : hook pour consommer le contexte

### 4.4 client/src/api.ts

Client HTTP dédié à l’API.

Fonctions :

- getToken(), setToken(), clearToken()
- request(path, options) : fait le fetch, injecte le JWT, gère les erreurs 401, parse le JSON

Explication :

- il centralise toutes les requêtes vers le backend,
- évite de réécrire le code d’appel API dans chaque page,
- gère la session automatiquement.

### 4.5 client/src/components/Layout.tsx

Gabarit principal de l’application après connexion.

Ce composant contient :

- le menu latéral,
- le header avec utilisateur, notifications, déconnexion,
- le switch de thème,
- le conteneur principal où toutes les pages sont rendues avec Outlet.

### 4.6 client/src/components/ui.tsx

Composants réutilisables dans plusieurs pages.

- StatCard : carte KPI avec titre, valeur et icône
- Spinner : loader de chargement
- EmptyState : écran vide avec message
- PageHeader : titre et sous-titre de page
- SeverityBadge : badge de gravité d’alerte
- StatusBadge : badge de statut
- formatNumber() : formatage français des nombres
- cropIcon() : icône visuelle selon type de culture

### 4.7 client/src/components/CameroonMap.tsx

Carte SVG du Cameroun utilisée dans les pages de visualisation.

Sa fonction :

- afficher les régions ou parcelles sur un schéma du Cameroun,
- éventuellement mettre en surbrillance des zones,
- servir d’interface visuelle pour la production agricole.

---

## 5. Explication des pages principales

### 5.1 Login.tsx

Chemin : client/src/pages/Login.tsx

Rôle :

- form de connexion,
- appel à login(email, password),
- redirection vers le dashboard si l’authentification réussit,
- affichage des comptes de démonstration.

### 5.2 Register.tsx

Chemin : client/src/pages/Register.tsx

Rôle :

- formulaire d’inscription,
- choix du profil utilisateur et de la région,
- appel à register(data),
- mise en place du compte avec JWT.

### 5.3 Dashboard.tsx

Chemin : client/src/pages/Dashboard.tsx

Rôle :

- synthèse de l’activité agricole,
- KPI globaux,
- production estimée,
- météo 5 jours,
- alertes actives,
- liste des parcelles.

### 5.4 Weather.tsx

Chemin : client/src/pages/Weather.tsx

Rôle :

- afficher les prévisions météo d’une région,
- montrer temp min/max, humidité, pluie, vent, risque de gel.

### 5.5 Parcels.tsx

Chemin : client/src/pages/Parcels.tsx

Rôle :

- lister les parcelles de l’utilisateur,
- montrer la répartition par région,
- ouvrir le détail ou créer une nouvelle parcelle.

### 5.6 ParcelForm.tsx

Chemin : client/src/pages/ParcelForm.tsx

Rôle :

- créer ou modifier une parcelle,
- renseigner coordonnées, superficie, sol, irrigation, région,
- soumettre vers l’API backend.

### 5.7 ParcelDetail.tsx

Chemin : client/src/pages/ParcelDetail.tsx

Rôle :

- show le détail complet d’une parcelle,
- afficher ses cultures,
- afficher les prévisions de rendement associées.

### 5.8 Predictions.tsx

Chemin : client/src/pages/Predictions.tsx

Rôle :

- afficher les scénarios optimiste / médian / pessimiste,
- comparer avec historique,
- montrer les recommandations d’optimisation,
- présenter les facteurs explicatifs du modèle.

### 5.9 Alerts.tsx

Chemin : client/src/pages/Alerts.tsx

Rôle :

- afficher les alertes actives et traitées,
- filtrer par gravité,
- fournir des conseils d’action.

### 5.10 Reports.tsx

Chemin : client/src/pages/Reports.tsx

Rôle :

- sélectionner un type de rapport,
- le générer,
- simuler un export PDF / Excel / CSV,
- afficher l’historique des rapports.

### 5.11 NationalMap.tsx

Chemin : client/src/pages/NationalMap.tsx

Rôle :

- afficher les statistiques nationales,
- comparer production par région,
- visualiser les meilleures cultures nationales.

### 5.12 Admin.tsx

Chemin : client/src/pages/Admin.tsx

Rôle :

- gérer les utilisateurs,
- vérifier les rôles,
- activer / désactiver des comptes,
- consulter les modèles ML et leurs performances.

### 5.13 Profile.tsx

Chemin : client/src/pages/Profile.tsx

Rôle :

- afficher les infos personnelles,
- présenter le rôle et les préférences/région du compte.

### 5.14 Cooperative.tsx

Chemin : client/src/pages/Cooperative.tsx

Rôle :

- montrer les statistiques de la coopérative,
- classement des membres,
- production agrégée par culture,
- vue dédiée au chef de coopérative.

---

## 6. Flux de données global

Le flux standard est le suivant :

1. Un utilisateur se connecte via Login.tsx.
2. Le front envoie une requête à /api/auth/login.
3. Le backend vérifie le mot de passe et renvoie un JWT.
4. Le JWT est stocké dans localStorage.
5. Chaque page appelle api.ts pour demander des données à l’API.
6. Le backend vérifie le token et le rôle avec authenticate / requireRole.
7. Les données sont récupérées depuis SQLite.
8. Les résultats sont affichés dans le front via les pages React.

---

## 7. Ce que fait chaque partie du projet

### Backend

- sécurise le système,
- centralise la logique métier,
- manipule la base de données,
- gère les rôles,
- calcule les prévisions,
- sert les données au front.

### Frontend

- rend l’interface utilisateur,
- affiche les cartes, tables et graphes,
- permet les interactions utilisateur,
- appelle les routes API,
- permet l’usage par les profils métiers.

### Base de données

- stocke les comptes,
- stocke les parcelles et cultures,
- stocke les alertes et prévisions,
- sert de mémoire du système pendant la démonstration.

---

## 8. Fichiers de configuration importants

- client/package.json : configuration du frontend
- server/package.json : configuration du backend
- client/vite.config.ts : config Vite + proxy des appels API vers le backend
- client/tailwind.config.js : thème Tailwind personnalisé
- client/src/index.css : styles globaux et composants Tailwind

---

## 9. Résumé simple

Si on résume en une phrase :

- le backend gère la logique, l’authentification et les calculs,
- le frontend affiche les données et permet de naviguer,
- SQLite sert de base de données locale,
- les pages métier couvrent les besoins d’un système d’aide à la décision agricole.

---

## 10. Conclusion

Le projet AgroPredict est une simulation complète d’une plateforme agricole intelligente. Son objectif est de montrer une application Web fonctionnelle qui couvre l’authentification, la gestion de parcelles, la météo, les prévisions, les alertes et les rapports. La structure est pensée pour être facilement extensible vers un vrai système de production avec API plus robuste, base PostgreSQL, modèles d’IA réels et exports PDF plus avancés.
