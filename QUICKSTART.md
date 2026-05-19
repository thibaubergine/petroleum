# ⚡ Démarrage Ultra-Rapide

## Prérequis
- Docker et Docker Compose installés
- Ports 5432, 8000, 5173 disponibles

## 3 commandes pour tout lancer

### 1️⃣ Lancer l'infrastructure
```bash
docker-compose up -d
```

Attendez ~30 secondes que tout démarre. Vérifiez avec :
```bash
docker-compose ps
```

Vous devez voir 3 conteneurs en état "running" :
- `oil-postgres`
- `oil-backend`
- `oil-frontend`

### 2️⃣ Initialiser la base de données
```bash
docker exec oil-backend python init_db.py
```

Vous devez voir :
```
✓ Tables créées
✓ 3 sources insérées
✓ Données brutes et harmonisées insérées
✓ Ranges de production insérés
✓ Flags insérés
✓ INITIALISATION TERMINÉE AVEC SUCCÈS
```

### 3️⃣ Ouvrir le dashboard
```bash
# Ouvrir dans le navigateur
open http://localhost:5173
```

Ou manuellement : **http://localhost:5173**

---

## ✅ Vérifications

### Backend API (FastAPI)
- URL : http://localhost:8000
- Docs : http://localhost:8000/api/docs
- Health : http://localhost:8000/health

Test rapide :
```bash
curl http://localhost:8000/health
# Doit retourner: {"status":"healthy"}
```

### Frontend (React)
- URL : http://localhost:5173
- Doit afficher la page "Production pétrolière"
- Graphique avec Saudi Arabia 2020-2024

### Base de données (PostgreSQL)
```bash
docker exec -it oil-postgres psql -U admin -d oil_data -c "SELECT COUNT(*) FROM production_ranges;"
# Doit retourner: 5 lignes
```

---

## 🎯 Que faire ensuite ?

1. **Explorer le dashboard**
   - Changer les années (2020-2024)
   - Voir les flags automatiques
   - Consulter la comparaison des sources

2. **Tester l'API**
   - Aller sur http://localhost:8000/api/docs
   - Tester `GET /api/production/ranges/SAU`
   - Voir les réponses JSON

3. **Ajouter des données**
   - Éditer `backend/init_db.py`
   - Ajouter d'autres pays ou années
   - Relancer : `docker exec oil-backend python init_db.py`

---

## 🛑 Arrêter tout

```bash
docker-compose down
```

## 🔄 Réinitialiser complètement

```bash
docker-compose down -v  # Supprime les volumes
docker-compose up -d
docker exec oil-backend python init_db.py
```

---

## 🐛 Problèmes courants

### Le frontend ne charge pas
```bash
docker-compose logs frontend
# Vérifier qu'il n'y a pas d'erreurs npm
```

### Le backend ne répond pas
```bash
docker-compose logs backend
# Vérifier la connexion à PostgreSQL
```

### La base de données est vide
```bash
# Relancer l'init
docker exec oil-backend python init_db.py
```

### Port déjà utilisé
```bash
# Voir quel processus utilise le port
lsof -i :8000  # ou :5173, :5432

# Modifier les ports dans docker-compose.yml si besoin
```

---

## 📦 Sans Docker (développement local)

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Lancer PostgreSQL localement ou modifier DATABASE_URL
export DATABASE_URL="postgresql://admin:secure_password@localhost:5432/oil_data"

uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

**Temps total de setup : ~2 minutes** ⏱️
