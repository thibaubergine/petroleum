# 📈 Module Demande - Guide Complet

## 🎯 Objectif

Analyser les **divergences entre projections** de demande pétrolière (IEA, EIA, OPEC) et détecter automatiquement les **peaks de demande** par scénario.

---

## 📊 Données Incluses

### **5 Scénarios de projection (2024-2050)**

| Source | Scénario | Peak Détecté | Année Peak | Valeur Peak | Déclin |
|--------|----------|--------------|------------|-------------|---------|
| **IEA** | Stated Policies | ✅ Oui | 2030 | 105.1 mb/d | -4.2%/an |
| **IEA** | Net Zero 2050 | ✅ Oui | 2025 | 101.5 mb/d | -8.5%/an |
| **EIA** | Reference | ❌ Non | — | — | Croissance continue |
| **EIA** | Low Growth | ✅ Oui | 2035 | 107.5 mb/d | -2.1%/an |
| **OPEC** | Reference | ❌ Non | — | — | Croissance continue |

---

## 🔍 Divergences Majeures

### **Timing du Peak**
- **Plus tôt** : 2025 (IEA Net Zero)
- **Plus tard** : 2035 (EIA Low Growth)
- **Jamais** : OPEC et EIA Reference
- **Écart** : 10-25 ans selon scénarios

### **Demande en 2050**
- **Minimum** : 24 mb/d (IEA Net Zero)
- **Maximum** : 116 mb/d (OPEC Reference)
- **Ratio** : 1 à 5
- **Amplitude** : >300%

### **Taux de Déclin Post-Peak**
- **Agressif** : -8.5%/an (IEA NZE)
- **Modéré** : -4.2%/an (IEA STEPS)
- **Doux** : -2.1%/an (EIA Low)

---

## 🏗️ Architecture Backend

### **Nouveaux Modèles**

```python
DemandProjection
- source_id (iea, eia, opec)
- scenario (stated_policies, net_zero, reference, low_growth)
- year (2024-2050)
- demand_value (mb/d)

PeakOilAnalysis
- source_id
- scenario
- peak_year (NULL si pas de peak)
- peak_value
- has_peak (boolean)
- decline_rate (% par an)
```

### **Nouveaux Endpoints**

```
GET /api/demand/projections
  → Toutes les projections (filtres: source, scenario, années)

GET /api/demand/peak-analysis
  → Analyse des peaks par scénario

GET /api/demand/comparison/{year}
  → Comparaison tous scénarios pour une année donnée

GET /api/demand/scenarios
  → Liste des scénarios disponibles par source
```

---

## 🎨 Interface Frontend

### **Page Demand.tsx**

**Section 1 : Contexte**
- Explication des divergences IEA/EIA/OPEC
- Fond dégradé or/orange

**Section 2 : Graphique Projections**
- 5 courbes (1 par scénario)
- Couleurs distinctes par source
- Axe X : 2024-2050
- Axe Y : Demande en mb/d

**Section 3 : Table Peak Oil**
- Colonnes : Source, Scénario, Peak Détecté, Année, Valeur, Déclin
- Badges colorés : Rouge (peak) / Orange (pas de peak)
- Tri par source

**Section 4 : Divergences Clés**
- Fond rouge/orange
- 3 points majeurs :
  - Peak timing (25+ ans d'écart)
  - Demande 2050 (ratio 1:5)
  - Taux déclin (jusqu'à -8.5%/an)

**Section 5 : Méthodologie**
- Fond or/orange
- Sources + méthode détection peak

### **Navigation**

Barre de navigation noire en haut :
- 📊 Production (module existant)
- 📈 Demande (nouveau module)

Onglet actif : gradient orange-rouge

---

## 🚀 Pour Utiliser

### **1. Initialiser la base de données**

```bash
docker exec oil-backend python init_db.py
```

**Nouveau output attendu :**
```
📈 MODULE DEMANDE:
- Projections: 2024-2050
- Sources: IEA (2 scénarios), EIA (2 scénarios), OPEC (1 scénario)
- Peak oil analysé pour chaque scénario
- Divergences calculées
```

### **2. Accéder au module**

```
http://localhost:5173/demand
```

Ou cliquer sur l'onglet **📈 Demande** dans la navigation.

---

## 📈 Insights Clés

### **Vision IEA (la plus pessimiste)**
- Peak rapide (2025-2030)
- Déclin marqué dans scénarios climatiques
- Cohérent avec objectifs Net Zero

### **Vision EIA (milieu de gamme)**
- Croissance modérée dans scénario de référence
- Peak possible vers 2035 en scénario bas
- Prudente sur transition énergétique

### **Vision OPEC (la plus optimiste)**
- Pas de peak anticipé
- Croissance continue jusqu'en 2050
- Assume une demande soutenue des pays émergents

---

## 🔧 Fichiers Créés/Modifiés

### **Backend (7 fichiers)**
```
✅ database/models.py           (+ DemandProjection, PeakOilAnalysis)
✅ database/schemas.py          (+ 4 nouveaux schémas)
✅ services/demand_analyzer.py  (nouveau - logique analyse)
✅ api/routes/demand.py         (nouveau - 4 endpoints)
✅ main.py                      (+ import demand routes)
✅ init_db.py                   (+ fonctions données demande)
```

### **Frontend (6 fichiers)**
```
✅ types/index.ts               (+ 3 nouveaux types)
✅ services/endpoints.ts        (+ demandAPI)
✅ hooks/useDemand.ts           (nouveau - 4 hooks)
✅ components/charts/ProjectionChart.tsx  (nouveau)
✅ components/tables/PeakOilTable.tsx     (nouveau)
✅ pages/Demand.tsx             (nouveau - page complète)
✅ App.tsx                      (+ React Router + Navigation)
```

---

## 🎯 Prochaines Extensions Possibles

- [ ] Ajouter scénarios additionnels (APS, SDS, etc.)
- [ ] Graphique interactif avec sélection scénarios
- [ ] Comparaison année par année avec sliders
- [ ] Export PDF de l'analyse
- [ ] Alertes sur divergences >50%
- [ ] Corrélations demande vs. prix

---

**Module Demande : Opérationnel** ✅
**Données : 55 points de projection sur 27 ans**
**Scénarios : 5 trajectoires distinctes**
**Peak analysis : Automatique pour tous les scénarios**
