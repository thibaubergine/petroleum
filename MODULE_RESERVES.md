# 🗺️ Module Réserves - Guide Complet

## 🎯 Objectif

Visualiser les **réserves pétrolières mondiales** avec une carte interactive, identifier les **manipulations historiques**, et documenter les **cas notoires** (Venezuela, Kuwait, OPEC quota wars).

---

## 📊 Données Incluses

### **15 Pays (Top Mondial 2023)**

| Rang | Pays | Réserves 1P | OPEC | Audité | Flags |
|------|------|-------------|------|--------|-------|
| 1 | Venezuela | 303.8 Gb | ✓ | ✗ | 🟣 Purple |
| 2 | Saudi Arabia | 297.5 Gb | ✓ | ✗ | 🟠 Orange |
| 3 | Canada | 168.1 Gb | ✗ | ✓ | — |
| 4 | Iran | 157.8 Gb | ✓ | ✗ | 🟠 Orange |
| 5 | Iraq | 145.0 Gb | ✓ | ✗ | 🟠 Orange |
| 6 | Russia | 107.8 Gb | ✗ | ✗ | 🟠 Orange |
| 7 | Kuwait | 101.5 Gb | ✓ | ✗ | 🔴 Red |
| 8 | UAE | 97.8 Gb | ✓ | ✗ | 🔴 Red |
| 9 | USA | 68.8 Gb | ✗ | ✓ | — |
| 10 | Libya | 48.4 Gb | ✓ | ✗ | — |
| 11 | Nigeria | 36.9 Gb | ✓ | ✗ | — |
| 12 | Kazakhstan | 30.0 Gb | ✗ | ✗ | — |
| 13 | China | 26.0 Gb | ✗ | ✗ | — |
| 14 | Qatar | 25.2 Gb | ✓ | ✗ | — |
| 15 | Brazil | 15.0 Gb | ✗ | ✓ | — |

**Total Flags : 7 (4 critiques)**

---

## 🚩 Typologie des Flags

### **🔴 Rouge - Manipulation Avérée**
- **Kuwait** : Leak 2006 révèle 48 Gb vs. 101 Gb officiel (+111% gap)
- **UAE** : Inflation OPEC 1986 (de 30 à 92 Gb sans découverte)

### **🟣 Violet - Écart Claimed vs. Recoverable**
- **Venezuela** : 303 Gb claimed vs. ~50 Gb recoverable (heavy oil <20% recovery)

### **🟠 Orange - Non-Audité / Source Unique**
- **Saudi Arabia** : Jamais audité indépendamment, estimations Aramco
- **Iran / Iraq** : Données gouvernementales non-vérifiées
- **Russia** : Post-2022, données manipulées (sanctions)

### **🔵 Bleu - Divergence Définitionnelle**
- (Non utilisé dans ce dataset, réservé pour 1P vs 2P vs 3P)

---

## 🗺️ Carte Interactive

### **Fonctionnalités**
- **Marqueurs colorés** : Taille et couleur selon réserves
- **Anneau OPEC** : Cercle doré autour des membres OPEC
- **Indicateur flags** : Point rouge sur pays avec flags critiques
- **Hover** : Tooltip avec nom, réserves, nombre de flags
- **Clic** : Affiche détails complets du pays

### **Couleurs Marqueurs**
- **Rouge cuivré** : >200 Gb (Massive)
- **Orange** : 100-200 Gb (Très élevé)
- **Or** : 50-100 Gb (Élevé)
- **Brun** : 20-50 Gb (Moyen)
- **Noir** : <20 Gb (Faible)

---

## 📖 Cas Notoires Documentés

### **1. OPEC Quota Wars (1985-1990)**
**Contexte** : Les quotas OPEC étaient liés aux réserves déclarées.

**Manipulations** :
- **Kuwait** : 64 → 90 Gb (1985) — +41%
- **UAE** : 30 → 92 Gb (1986) — +207%
- **Iran** : 49 → 93 Gb (1987) — +90%
- **Iraq** : 47 → 100 Gb (1988) — +113%

**Total inflation** : +300 Gb sans découvertes majeures

**Conséquence** : Ces chiffres gonflés sont toujours utilisés aujourd'hui.

---

### **2. Venezuela : Heavy Oil Illusion**
**Chiffre officiel** : 303.8 Gb (1er mondial)

**Réalité** :
- 80% dans Orinoco Belt (heavy oil, API <10°)
- Taux de récupération : <20% vs. 30-40% pour conventional
- Coûts extraction : $25-40/barrel vs. $10-15 pour Saudi light
- **Réserves techniquement récupérables** : ~50 Gb

**Gap** : +506%

**Implication** : Valorisation boursière PDVSA surévaluée, politiques énergétiques basées sur des chiffres irréalistes.

---

### **3. Kuwait Leak (2006)**
**Document interne divulgué** : Petroleum Intelligence Weekly

**Chiffres** :
- **Officiel** : 101.5 Gb
- **Interne** : 48 Gb
- **Gap** : +111%

**Détails** :
- Burgan field (biggest reservoir) : 24 Gb official vs. 6-9 Gb internal
- Production decline masked depuis 1970s
- Pas de révision officielle après le leak

---

### **4. Russia Post-2022**
**Contexte** : Sanctions internationales après invasion Ukraine

**Problème** :
- Transparence dégradée
- Données impossibles à vérifier depuis 2022
- Potentielle manipulation pour rassurer marchés

**Flag orange** : Non-vérifiable

---

## 🏗️ Architecture Backend

### **Nouveaux Modèles**

```python
Reserves
- country_code (ISO alpha-3)
- country_name
- year
- source_id
- proven_1p / probable_2p / possible_3p (Gb)
- is_audited (boolean)
- is_opec_member (boolean)
- notes

ReserveFlag
- country_code
- year (NULL pour flags structurels)
- flag_type (red, orange, blue, purple)
- flag_reason
- severity (1-5)
- details (JSON)
```

### **Nouveaux Endpoints**

```
GET /api/reserves/all?year=2023&country_code=VEN
  → Toutes les réserves (filtres optionnels)

GET /api/reserves/flags?country_code=KWT
  → Tous les flags (filtres optionnels)

GET /api/reserves/map?year=2023
  → Données pour carte du monde (avec coordonnées géo)

GET /api/reserves/top?year=2023&limit=15
  → Top N pays par réserves prouvées
```

---

## 🎨 Interface Frontend

### **Page Reserves.tsx**

**Section 1 : Contexte**
- Explication controverses réserves
- Manipulations OPEC 1980s
- Enjeux valorisations boursières

**Section 2 : Carte du Monde**
- 15 pays avec marqueurs interactifs
- Légende (taille, couleur, OPEC, flags)
- Détails pays au clic

**Section 3 : Catégories 1P/2P/3P**
- Définitions détaillées
- Probabilités de récupération
- Usage par pays

**Section 4 : Cas Notoires**
- 4 encadrés (OPEC, Venezuela, Kuwait, Russia)
- Chiffres précis
- Contexte historique

**Section 5 : Table Détaillée**
- 15 pays avec toutes colonnes
- Flags visuels
- Notes techniques

**Section 6 : Méthodologie**
- Sources (BP, EIA)
- Typologie flags
- Critères audit

---

## 🚀 Pour Utiliser

### **1. Rebuild backend + frontend**

```powershell
docker-compose down
docker-compose up -d --build
```

### **2. Réinitialiser DB**

```powershell
docker exec oil-backend python init_db.py
```

**Output attendu** :
```
🗺️ MODULE RÉSERVES:
- 15 pays (Top mondial)
- Année: 2023
- Réserves 1P/2P/3P
- 7 flags critiques (Venezuela, Kuwait, UAE, etc.)
- Cas notoires documentés
```

### **3. Accéder au module**

```
http://localhost:5173/reserves
```

Ou cliquer sur l'onglet **RÉSERVES** dans la navigation.

---

## 📈 Insights Clés

### **Pays Fiables (Audités)**
- ✅ **Canada** : NI 51-101 compliant, oil sands transparents
- ✅ **USA** : SEC-audited, shale revolution documentée
- ✅ **Brazil** : Petrobras-audited, pre-salt offshore

### **Pays Suspects (Non-Audités OPEC)**
- ⚠️ **Venezuela** : Heavy oil non-récupérable
- ⚠️ **Kuwait** : Leak 2006 jamais résolu
- ⚠️ **UAE** : Inflation 1986 non-justifiée
- ⚠️ **Saudi Arabia** : Zéro audit externe
- ⚠️ **Iran / Iraq** : Données gouvernementales

### **Cas Spéciaux**
- ⚠️ **Russia** : Post-2022 non-vérifiable

---

## 🔧 Fichiers Créés

### **Backend (6 fichiers)**
```
✅ database/models.py              (+ Reserves, ReserveFlag)
✅ database/schemas.py             (+ 4 nouveaux schémas)
✅ services/reserves_analyzer.py   (nouveau - logique analyse)
✅ api/routes/reserves.py          (nouveau - 4 endpoints)
✅ main.py                         (+ import reserves routes)
✅ init_db.py                      (+ données 15 pays + 7 flags)
```

### **Frontend (7 fichiers)**
```
✅ types/index.ts                  (+ 3 nouveaux types)
✅ services/endpoints.ts           (+ reservesAPI)
✅ hooks/useReserves.ts            (nouveau - 4 hooks)
✅ components/maps/WorldMap.tsx    (nouveau - carte interactive)
✅ components/tables/ReservesTable.tsx  (nouveau)
✅ pages/Reserves.tsx              (nouveau - page complète)
✅ App.tsx                         (+ route /reserves)
```

---

## 🎯 Prochaines Extensions Possibles

- [ ] Historique réserves 1980-2023 (visualiser inflation OPEC)
- [ ] Ratio R/P (Reserves-to-Production) par pays
- [ ] Graphique évolution réserves Venezuela (peak 2010)
- [ ] Comparaison reserves/production (combien d'années restantes)
- [ ] Filtre par catégorie (1P only, 2P, 3P)
- [ ] Export PDF rapport complet
- [ ] Animation timeline OPEC inflation 1985-1990

---

**Module Réserves : Opérationnel** ✅  
**Pays : 15 (Top mondial)**  
**Flags : 7 critiques**  
**Cas notoires : 4 documentés**  
**Carte : Interactive avec 15 marqueurs**
