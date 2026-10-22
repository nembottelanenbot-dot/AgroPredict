# 🌾 AgroPredict — Plateforme de Prévision des Rendements Agricoles

Application web full-stack développée conformément au cahier des charges
**CDC-AGROPREDICT-2026-V2.0** (« Création d'une Plateforme Numérique pour la Prévision des
Rendements Agricoles »).

> **IA au service de l'agriculture** — prévision des rendements, alertes précoces et
> recommandations agronomiques personnalisées.

---

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+ (testé avec Node 20)

### Installation & lancement

```bash
# 1. Backend (API + base SQLite)
cd server
npm install
npm run seed        # initialise la base avec les données de démo (une seule fois)
npm start           # démarre l'API sur http://0.0.0.0:8080

# 2. Frontend (React + Vite + TypeScript + Tailwind)
cd ../client
npm install
npm run build       # compile dans client/dist (servi par le backend)
# OU pour le développement :
npm run dev         # Vite sur http://localhost:5173 (proxy API vers :8080)
```

Une fois le backend démarré, ouvrez **http://localhost:8080** : il sert à la fois l'API
(`/api/*`) et l'application web compilée.

### Comptes de démonstration (mot de passe : `Demo@2026`)

| Profil                | Email                          |
|-----------------------|--------------------------------|
| Super Administrateur  | admin@agropredict.cm           |
| Agriculteur           | solange.nkeng@agropredict.cm   |
| Chef de coopérative   | maurice.tchoua@agropredict.cm  |
| Analyste              | cedric.nganou@agropredict.cm   |
| Agent de terrain      | fatimatou.hamadou@agropredict.cm |
| Admin régional        | berthe.kamga@agropredict.cm    |

---

## 🗂️ Fonctionnalités implémentées

| Module | Fonctionnalités |
|--------|-----------------|
| **Authentification** | Inscription, connexion, JWT, 6 rôles (RBAC), déconnexion |
| **Tableau de bord** | KPI (parcelles, superficie, production estimée), météo 5 jours, alertes actives, graphique production par culture |
| **Gestion des parcelles** | CRUD complet, géolocalisation (lat/lon), type de sol, irrigation, région, carte schématique |
| **Suivi des cultures** | Ajout de culture (type, variété, date de semis), stade phénologique |
| **Prévisions de rendement** | Modèles ML simulés (XGBoost/RF/LSTM), scénarios optimiste/médian/pessimiste, intervalles de confiance 80 % / 95 %, horizons J+30/60/90, facteurs explicatifs, comparaison historique, recommandations |
| **Météorologie** | Prévisions 10 jours, températures, précipitations, humidité, vent, UV, risque de gel |
| **Alertes** | Sécheresse, excès pluviométrique, anomalie NDVI, phytosanitaire, rappels — par gravité, avec recommandations |
| **Rapports & exports** | Génération (simulée) PDF/Excel/CSV, historique |
| **Carte nationale** | Heatmap de production par région (vue Analyste/Décideur) |
| **Coopérative** | Agrégation membres, classement performance, production par culture |
| **Administration** | Gestion utilisateurs (rôles, régions, activation), métriques des modèles ML |

### Rôles & permissions (RBAC)
`agriculteur` · `chef_cooperative` · `agent_terrain` · `analyste` · `admin_regional` · `super_admin`
— chaque rôle n'accède qu'aux fonctionnalités autorisées (section 6.1 du CDC).

---

## 🧱 Architecture

```
agropredict/
├── server/                 # Backend Node.js + Express
│   ├── src/index.js        # API REST (/api/*) + serveur statique
│   ├── src/db.js           # Schéma SQLite (users, parcels, crops, predictions…)
│   ├── src/seed.js         # Données de démonstration
│   ├── src/prediction.js   # Moteur de prévision (simulation ML)
│   ├── src/weather.js      # Génération météo par région
│   └── src/auth.js         # JWT + RBAC
└── client/                 # Frontend React + Vite + TypeScript + Tailwind
    └── src/
        ├── pages/          # Dashboard, Parcels, Predictions, Weather, Alerts…
        ├── components/     # Layout, CameroonMap (SVG), ui
        ├── api.ts          # Client HTTP
        └── auth.tsx        # Contexte d'authentification
```

### Choix techniques (adaptés au contexte de démonstration)
- **Base de données** : SQLite (via `better-sqlite3`) — simple, sans serveur. Le CDC prévoit
  PostgreSQL + PostGIS en production ; le schéma reste portable.
- **Moteur de prévision** : simulation déterministe (modèle hybride) basée sur la culture, la
  région, le sol et les pratiques, avec scénarios et intervalles de confiance. En production,
  les modèles XGBoost / LSTM entraînés remplacent ce simulateur (section 10 du CDC).
- **Carte** : composant SVG maison (aucune dépendance de tuiles externes), remplaçable par
  Leaflet/Mapbox pour de vraies cartes interactives (section 11.3).

### Charte graphique (section 11.2 du CDC)
Couleur primaire `#2E7D32` · secondaire `#FF8F00` · erreur `#C62828` · fond `#FAFAFA` ·
typographies **Poppins** (titres) et **Inter** (corps) · base 16px.

---

## 📌 Limites connues (version de démonstration)

- Prévisions **simulées** (pas de modèles ML réellement entraînés ni de données satellite Sentinel-2).
- Génération de rapports **simulée** (pas de fichier PDF réel).
- Pas d'application mobile ni de canal USSD/SMS (prévus Phase 2/3 du CDC).
- Carte schématique du Cameroun (non géographique précise).

---

*Projet réalisé à partir du CDC-AGROPREDICT-2026-V2.0 — document confidentiel.*
