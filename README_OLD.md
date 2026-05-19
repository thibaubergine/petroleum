# 🛢️ Oil Data Dashboard

Dashboard d'agrégation multi-sources pour l'analyse du secteur pétrolier avec ranges probabilistes et scoring de crédibilité.

## 📋 Architecture

```
oil-dashboard/
├── backend/           # API FastAPI + PostgreSQL
│   ├── app/
│   │   ├── api/routes/      # Endpoints REST
│   │   ├── database/        # Models SQLAlchemy + schemas Pydantic
│   │   ├── services/        # Logique métier (scoring, ranges)
│   │   └── main.py
│   └── init_db.py           # Script d'initialisation avec données exemple
│
├── frontend/          # React + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/      # Charts, tables, filtres
│   │   ├── pages/           # Page Production
│   │   ├── hooks/           # React Query hooks
│   │   └── services/        # API client
│   └── vite.config.ts
│
└── docker-compose.yml # Orchestration complète
```

## 🚀 Démarrage rapide (3 commandes)

### 1. Cloner et configurer
```bash
cd oil-dashboard
```

### 2. Lancer l'infrastructure avec Docker Compose
```bash
docker-compose up -d
```

Cela démarre :
- PostgreSQL (port 5432)
- Backend FastAPI (port 8000)
- Frontend React (port 5173)

### 3. Initialiser la base de données
```bash
docker exec oil-backend python init_db.py
```

✅ **Dashboard accessible sur http://localhost:5173**

📚 **API documentation sur http://localhost:8000/api/docs**

## 📊 Données exemple

Le script `init_db.py` insère :
- **Pays** : Saudi Arabia (SAU)
- **Période** : 2020-2024
- **Sources** : EIA, IEA, OPEC avec scores de crédibilité
- **Ranges** : Low/Central/High calculés avec pondération
- **Flags** : Système d'alertes automatiques

## 🔧 Architecture technique

### Backend (FastAPI)
- **Database** : PostgreSQL 15 avec 3 layers (RAW/HARMONIZED/ANALYTICS)
- **ORM** : SQLAlchemy 2.0
- **Validation** : Pydantic v2
- **API** : FastAPI avec CORS configuré

### Frontend (React)
- **Framework** : React 18 + TypeScript
- **Build** : Vite
- **Data fetching** : TanStack Query (React Query)
- **Charts** : Recharts
- **Styling** : Tailwind CSS

### Base de données (PostgreSQL)

**Layer 1 - RAW** : Données brutes par source
```sql
raw_production (source_id, country_code, year, value, metadata)
```

**Layer 2 - HARMONIZED** : Périmètre commun
```sql
harmonized_production (country_code, year, value, definition_id, source_id)
```

**Layer 3 - ANALYTICS** : Ranges + Flags
```sql
production_ranges (country_code, year, low, central, high, amplitude_percent)
automated_flags (country_code, year, flag_type, flag_reason, severity)
source_credibility (source_id, transparency_score, overall_score)
```

## 🛠️ Développement

### Backend seul
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend seul
```bash
cd frontend
npm install
npm run dev
```

### Accéder à PostgreSQL
```bash
docker exec -it oil-postgres psql -U admin -d oil_data
```

## 📡 Endpoints API

### Production
- `GET /api/production/ranges/{country}?year_start=2020&year_end=2024`
  - Récupère les ranges de production (low/central/high)
  
- `GET /api/production/comparison/{country}/{year}`
  - Compare les valeurs brutes de toutes les sources

### Metadata
- `GET /api/metadata/countries`
  - Liste des pays avec années disponibles
  
- `GET /api/metadata/sources`
  - Scores de crédibilité de toutes les sources

## 🎯 Fonctionnalités du Dashboard

### Page Production
✅ **Graphique ranges** : Visualisation low/central/high avec bandes de confiance
✅ **Filtres** : Sélection pays + période
✅ **Comparaison sources** : Table avec scores de crédibilité
✅ **Flags automatiques** : Badges colorés pour alertes
✅ **Méthodologie** : Explication du scoring

### Système de flags
- 🔴 **Rouge** : Amplitude >50%
- 🟠 **Orange** : Dépendance source unique
- 🔵 **Bleu** : Divergence définitionnelle
- ⚫ **Gris** : Données obsolètes

## 🔄 Prochaines étapes

### Modules à ajouter
1. **Demande** : Projections IEA/EIA/OPEC avec divergences peak oil
2. **Réserves** : Analyse 2P/3P avec flags OPEC inflation
3. **Prix** : Corrélations production/prix avec événements géopolitiques

### Fonctionnalités
- [ ] Export PDF des analyses
- [ ] Comparaison multi-pays
- [ ] Alertes email sur nouveaux flags
- [ ] Intégration APIs sources (EIA, World Bank)
- [ ] Module ETL automatisé

## 📝 Scripts utiles

### Réinitialiser la base de données
```bash
docker-compose down -v  # Supprime les volumes
docker-compose up -d
docker exec oil-backend python init_db.py
```

### Voir les logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Arrêter tout
```bash
docker-compose down
```

## 🏗️ Méthodologie

### Scoring de crédibilité
```
Score global = Transparence × Vérifiabilité × Absence de biais

EIA : 0.95 × 0.90 × 0.85 = 0.73
IEA : 0.90 × 0.85 × 0.80 = 0.61
OPEC : 0.70 × 0.60 × 0.50 = 0.21
```

### Construction des ranges
1. Harmonisation des définitions (crude_only vs all_liquids)
2. Calcul low/central/high pondérés par crédibilité
3. Amplitude = (high - low) / central × 100
4. Flags automatiques selon seuils

## 📞 Support

Pour toute question sur l'architecture ou l'extension du dashboard, consulter :
- Documentation API : http://localhost:8000/api/docs
- Code source : Commenté et organisé par modules

---

**Version** : 1.0.0 (Prototype fonctionnel)
**Données** : Saudi Arabia 2020-2024 (exemple)
**License** : MIT
