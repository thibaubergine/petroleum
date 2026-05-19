# 🎨 Migration Palette de Couleurs

## Ancienne vs. Nouvelle Palette

### Problème Identifié
- **Trop d'orange** saturé (#D97642, #C85A3C, #E8A04A)
- Manque de contraste subtil
- Aspect trop "chaud"

### Solution
Palette plus sobre, harmonieuse, professionnelle avec nuances de gris, bronze et bleu.

---

## Mapping des Couleurs

| Ancienne | Code | → | Nouvelle | Code |
|----------|------|---|----------|------|
| `oil-orange` | #D97642 | → | `oil-bronze` | #A67C52 |
| `oil-red` | #C85A3C | → | `oil-rust` | #B85450 |
| `oil-black` | #2A2520 | → | `oil-slate` | #2C3E50 |
| `oil-brown` | #8B6340 | → | `oil-copper` | #8B6F47 |
| `oil-gold` | #E8A04A | → | `oil-bronze` | #A67C52 |
| `oil-cream` | #F5EDE0 | → | `oil-sand` | #ECE5D8 |
| `oil-cream-dark` | #E8DCC8 | → | `oil-sand-dark` | #D4C7B3 |

### Nouvelles Couleurs Ajoutées

| Nom | Code | Usage |
|-----|------|-------|
| `oil-steel` | #34495E | Headers secondaires, hover états |
| `oil-olive` | #556B2F | Indicateurs positifs/croissance |
| `oil-slate-dark` | #1A252F | Overlays très sombres |
| `oil-sand-light` | #F5F0E8 | Fonds très clairs |

---

## Flags

| Type | Ancienne | → | Nouvelle |
|------|----------|---|----------|
| Red | #C85A3C | → | #B85450 (rust) |
| Orange | #D97642 | → | #D4A574 (bronze adouci) |
| Blue | #E8A04A | → | #5B7C99 (bleu gris) |
| Purple | — | → | #8B6F9B (violet grisé) |

---

## Remplacement Global

### Dans Tailwind Classes

```javascript
// Texte
'text-oil-black' → 'text-oil-slate'
'text-oil-brown' → 'text-oil-copper'

// Fond
'bg-oil-cream' → 'bg-oil-sand'
'bg-oil-orange' → 'bg-oil-bronze'
'bg-oil-red' → 'bg-oil-rust'

// Bordures
'border-oil-orange' → 'border-oil-bronze'
'border-oil-cream-dark' → 'border-oil-sand-dark'

// Gradients
'from-oil-orange to-oil-red' → 'from-oil-bronze to-oil-copper'
'from-oil-black to-oil-brown' → 'from-oil-slate to-oil-steel'
```

### Dans Composants Recharts

```javascript
// Lignes et barres
stroke="#D97642" → stroke="#A67C52" (bronze)
stroke="#C85A3C" → stroke="#B85450" (rust)
fill="#E8A04A" → fill="#A67C52" (bronze)

// Grilles
stroke="#E8DCC8" → stroke="#D4C7B3" (sand-dark)
```

---

## Fichiers à Mettre à Jour

### Backend
Aucun changement nécessaire.

### Frontend

#### Composants Core (✅ Fait)
- [x] `tailwind.config.js`
- [x] `App.tsx`

#### À Faire
- [ ] `pages/Production.tsx`
- [ ] `pages/Demand.tsx`
- [ ] `pages/Reserves.tsx`
- [ ] `components/charts/RangeChart.tsx`
- [ ] `components/charts/ProjectionChart.tsx`
- [ ] `components/tables/SourceComparisonTable.tsx`
- [ ] `components/tables/PeakOilTable.tsx`
- [ ] `components/tables/ReservesTable.tsx`
- [ ] `components/maps/WorldMap.tsx`

---

## Impact Visuel

### Avant (Orange Dominant)
```
Navigation: Noir + Orange vif
Widgets: Blanc pur + Orange saturé
Gradients: Orange → Rouge
Texte: Noir très chaud
```

### Après (Gris/Bronze Harmonieux)
```
Navigation: Ardoise + Bronze/Cuivre
Widgets: Sable → Sable foncé (gradient subtil)
Gradients: Bronze → Cuivre
Texte: Gris ardoise professionnel
```

### Bénéfices
- ✅ Moins agressif visuellement
- ✅ Plus professionnel
- ✅ Meilleur contraste subtil
- ✅ Harmonieux avec image header (derricks/champs pétroliers)
- ✅ Réduit la fatigue oculaire

---

## Test Visuel

Après rebuild, vérifier :
- [ ] Navigation : Ardoise avec onglet actif bronze/cuivre
- [ ] Widgets : Dégradé sable (pas blanc pur)
- [ ] Graphiques : Couleurs bronze/cuivre (pas orange)
- [ ] Texte : Ardoise (lisible, pas trop chaud)
- [ ] Flags : Rouille, bronze adouci, bleu gris

---

**Status** : Migration partielle (App.tsx + tailwind.config.js)  
**Prochaines étapes** : Mettre à jour tous les composants et pages
