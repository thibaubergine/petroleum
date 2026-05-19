# 🔄 Refonte en Cours - État des Modifications

## ✅ Modifications Appliquées

### 1. Nouvelle Image Header
- ✅ Image champs pétroliers américains copiée dans `/public/header-bg.png`
- ✅ Position ajustée dans `App.tsx` (`center center`)

### 2. Nouvelle Palette de Couleurs
- ✅ `tailwind.config.js` mis à jour
- ✅ Palette harmonieuse : Gris ardoise, Bronze, Cuivre, Sable
- ✅ Moins d'orange saturé, plus sobre et professionnel

### 3. App.tsx Mis à Jour
- ✅ Navigation avec nouvelles couleurs
- ✅ Header avec nouvel overlay (ardoise au lieu de noir)

---

## 🚧 En Cours / À Faire

### Retirer les Émojis
**Fichiers à nettoyer** :
- `pages/Demand.tsx` (📈, 📍, 🏛️, 🎭, etc.)
- `pages/Reserves.tsx` (🗺️, 📊, ⚠️, etc.)
- `pages/Production.tsx` (si émojis présents)

**Action** : Remplacer tous les span avec émojis par du texte simple.

### Migration Palette Complète
**Fichiers à mettre à jour** :
- `pages/Production.tsx`
- `pages/Demand.tsx`
- `pages/Reserves.tsx`
- `components/charts/RangeChart.tsx`
- `components/charts/ProjectionChart.tsx`
- `components/tables/*.tsx`
- `components/maps/WorldMap.tsx`

**Remplacement** :
```
oil-orange → oil-bronze
oil-red → oil-rust
oil-black → oil-slate
oil-brown → oil-copper
oil-cream → oil-sand
oil-cream-dark → oil-sand-dark
```

Voir `COLOR_MIGRATION.md` pour mapping complet.

---

## 🎯 Fonctionnalités Demandées (Non Implémentées)

### 1. Module Production - Méthodes d'Extraction
**Objectif** : Différencier production par méthode

**À Créer** :
- Nouveau modèle `ProductionByMethod` (conventional, oil_sands, offshore, shale, etc.)
- Endpoint `/production/by-method`
- Graphique stacked area chart
- Données exemple (Canada oil sands, USA shale, Saudi conventional)

**Méthodes à Inclure** :
- Conventional (onshore)
- Offshore (deep-water, ultra-deep)
- Oil sands / Tar sands
- Shale / Tight oil
- Enhanced oil recovery (EOR)

### 2. Module Production - EROEI
**Objectif** : Energy Return on Energy Invested

**À Créer** :
- Modèle `EROEIData` (method, year, eroei_ratio)
- Endpoint `/production/eroei`
- Graphique évolution EROEI par méthode (1970-2024)

**Données Clés** :
- Conventional 1970s: ~30:1
- Conventional 2020s: ~15:1
- Oil sands: ~3-5:1
- Shale: ~5-10:1
- Offshore deep: ~10:1

**Insight** : Déclin continu de l'EROEI = plus d'énergie pour extraire

### 3. Module Réserves - Types de Réserves
**Objectif** : Différencier par type d'hydrocarbure

**À Créer** :
- Ajouter colonne `reserve_type` au modèle `Reserves`
- Types : 'conventional', 'oil_sands', 'extra_heavy', 'shale', 'offshore'
- Graphique camembert par type
- Définitions simples dans UI

**Définitions à Ajouter** :
- **Conventional** : Pétrole conventionnel, API >25°, facile à extraire
- **Oil Sands** : Bitume dans sable, API <10°, extraction complexe (Canada)
- **Extra Heavy** : API 10-20°, viscosité élevée (Venezuela)
- **Shale** : Pétrole de schiste, fracturation hydraulique (USA)
- **Offshore** : En mer, coûts élevés, profondeurs variables

### 4. Carte du Monde - Bug à Corriger
**Problème** : La carte ne s'affiche pas

**Diagnostic Possible** :
- Dimensions SVG mal calculées
- CSS conflictuel
- Coordonnées hors limites
- Composant non monté

**Solution** : Vérifier `WorldMap.tsx` dimensions et rendering

---

## 📋 Checklist Complète

### Phase 1 : Design (Partiel)
- [x] Nouvelle image header
- [x] Nouvelle palette Tailwind
- [x] App.tsx mis à jour
- [ ] Tous composants avec nouvelle palette
- [ ] Retirer tous émojis

### Phase 2 : Fonctionnalités
- [ ] Production par méthode (backend + frontend)
- [ ] EROEI évolution (backend + frontend)
- [ ] Réserves par type (backend + frontend)
- [ ] Définitions simples réserves
- [ ] Corriger bug carte mondiale

### Phase 3 : Polish
- [ ] Tester toutes pages
- [ ] Vérifier cohérence visuelle
- [ ] Documentation utilisateur
- [ ] Screenshots

---

## 🚀 Prochaines Étapes Recommandées

**Option A - Design d'Abord** :
1. Finir migration palette (tous fichiers)
2. Retirer tous émojis
3. Tester visuellement
4. Puis ajouter fonctionnalités

**Option B - Fonctionnalités Prioritaires** :
1. Créer production par méthode + EROEI
2. Créer réserves par type + définitions
3. Corriger carte
4. Finir migration palette après

**Recommandation** : Option A (design stable d'abord, fonctionnalités ensuite)

---

**Status Actuel** : 20% design, 0% nouvelles fonctionnalités  
**Temps Estimé** : 2-3 heures pour finir migration palette + retrait émojis  
**Puis** : 3-4 heures pour production/méthodes + EROEI + réserves/types
