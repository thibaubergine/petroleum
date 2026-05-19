# 📊 Extension Complète - Structure de Données

## 🎯 Vue d'Ensemble

**Objectif** : Dashboard exhaustif avec 60 ans d'historique, 20+ pays, analyses avancées

---

## 1. PRODUCTION HISTORIQUE (1965-2024)

### **Top 20 Pays Producteurs**

| Rang | Pays | Code | 2023 (mb/d) | Peak Year | Notes |
|------|------|------|-------------|-----------|-------|
| 1 | USA | USA | 12.9 | 2023 | Shale revolution |
| 2 | Saudi Arabia | SAU | 10.5 | 1980, 2023 | Double peak |
| 3 | Russia | RUS | 10.3 | 2019 | Post-Soviet recovery |
| 4 | Canada | CAN | 4.9 | 2023 | Oil sands growth |
| 5 | Iraq | IRQ | 4.5 | 2023 | Post-war recovery |
| 6 | China | CHN | 3.9 | 2015 | Decline phase |
| 7 | UAE | ARE | 3.7 | 2023 | Steady growth |
| 8 | Iran | IRN | 3.1 | 1974 | Sanctions impact |
| 9 | Brazil | BRA | 3.0 | 2023 | Pre-salt boom |
| 10 | Kuwait | KWT | 2.7 | 2023 | OPEC stable |
| 11 | Norway | NOR | 1.9 | 2001 | North Sea decline |
| 12 | Kazakhstan | KAZ | 1.9 | 2023 | Kashagan online |
| 13 | Mexico | MEX | 1.7 | 2004 | Cantarell decline |
| 14 | Nigeria | NGA | 1.5 | 2005 | Instability impact |
| 15 | Qatar | QAT | 1.5 | 2023 | Focus on gas |
| 16 | Angola | AGO | 1.1 | 2008 | Offshore peak |
| 17 | Libya | LBY | 1.2 | 1970 | Civil wars |
| 18 | Algeria | DZA | 0.9 | 2007 | Mature decline |
| 19 | UK | GBR | 0.7 | 1999 | North Sea collapse |
| 20 | Venezuela | VEN | 0.7 | 1970, 1998 | Effondrement |

### **Années Clés à Inclure (Minimum)**

**Historique complet recommandé** : 1965, 1970, 1975, 1980, 1985, 1990, 1995, 2000, 2005, 2010, 2015, 2020, 2021, 2022, 2023, 2024

**Pourquoi ces années** :
- 1973-1974 : Premier choc pétrolier
- 1979-1980 : Révolution iranienne
- 1986 : Contre-choc (prix effondrement)
- 1990-1991 : Guerre du Golfe
- 2003 : Invasion Irak
- 2008 : Prix records ($147/barrel)
- 2014 : Effondrement prix (shale + OPEC)
- 2020 : COVID crash
- 2022 : Ukraine war

---

## 2. PRIX DU PÉTROLE (1960-2024)

### **Benchmarks**

| Benchmark | Région | Qualité (API) | Notes |
|-----------|--------|---------------|-------|
| **Brent** | Mer du Nord | 38° | Référence mondiale |
| **WTI** | USA (Texas) | 39.6° | Référence USA |
| **Dubai** | Moyen-Orient | 31° | Référence Asie |

### **Prix Historiques Clés**

| Année | Événement | Brent (nominal) | Brent (real 2023) |
|-------|-----------|-----------------|-------------------|
| 1970 | Pré-choc | $1.80 | $13.50 |
| 1974 | 1er choc | $11.58 | $70.00 |
| 1980 | 2e choc | $36.83 | $135.00 |
| 1986 | Contre-choc | $14.43 | $38.00 |
| 1998 | Asie crash | $12.72 | $22.00 |
| 2008 | Peak | $97.26 | $135.00 |
| 2014 | Pré-crash | $99.45 | $122.00 |
| 2016 | Bottom | $43.73 | $50.00 |
| 2020 | COVID | $43.21 | $47.00 |
| 2022 | Ukraine | $101.24 | $105.00 |
| 2023 | Moyen | $82.17 | $82.17 |

**Source** : World Bank Commodity Markets (API gratuite)

---

## 3. RÉSERVES HISTORIQUES (1980-2024)

### **Événements Majeurs à Documenter**

#### **Inflation OPEC (1986-1990)**
| Pays | 1985 (Gb) | 1990 (Gb) | Increase | Note |
|------|-----------|-----------|----------|------|
| Saudi | 171 | 260 | +52% | Pas de découvertes majeures |
| Iraq | 47 | 100 | +113% | Guerre Iran-Irak |
| UAE | 33 | 98 | +197% | Quotas OPEC-driven |
| Iran | 59 | 93 | +58% | Post-guerre |
| Kuwait | 92 | 97 | +5% | Conservatif |
| Venezuela | 55 | 60 | +9% | Avant Orinoco |

#### **Découvertes Majeures**
- **1968** : Prudhoe Bay (Alaska) - 25 Gb
- **1976** : Cantarell (Mexique) - 35 Gb
- **2000** : Kashagan (Kazakhstan) - 13 Gb
- **2007** : Tupi (Brésil pre-salt) - 8 Gb
- **2011** : Libra (Brésil) - 12 Gb

---

## 4. ÉVÉNEMENTS GÉOPOLITIQUES

### **Base de Données Événements**

```sql
-- Guerres & Conflits
Libya Civil War 2011: -1.5 mb/d, 180 days, severity 5
Iraq War 2003: -2.0 mb/d, 90 days, severity 5
Nigeria Militants 2006-2010: -0.8 mb/d, 1460 days, severity 3

-- Sanctions
Iran 2012-2015: -1.2 mb/d, 1095 days, severity 4
Iran 2018-2024: -2.0 mb/d, ongoing, severity 5
Russia 2022-2024: -0.5 mb/d, ongoing, severity 3
Venezuela 2017-2024: -2.5 mb/d, ongoing, severity 5

-- Découvertes
Kashagan 2000: +1.6 mb/d potential
Brazil Pre-salt 2007: +2.0 mb/d potential
US Shale 2008-2015: +8.0 mb/d actual

-- Accidents
Deepwater Horizon 2010: -0.2 mb/d, 87 days, severity 5
Piper Alpha 1988: -0.3 mb/d, permanent, severity 5
```

---

## 5. ANALYSES À CALCULER

### **A. Métriques par Pays**

#### **CAGR (Compound Annual Growth Rate)**
```python
# Périodes clés
CAGR_1965_1980  # Pre-peak era
CAGR_1980_2000  # Mature production
CAGR_2000_2010  # Pre-shale
CAGR_2010_2024  # Shale revolution
```

#### **Peak Detection**
```python
{
  "country": "NOR",
  "peak_year": 2001,
  "peak_production": 3.4,
  "current_production": 1.9,
  "decline_rate": -2.8,  # % per year
  "years_since_peak": 23,
  "confidence": 0.95
}
```

#### **Decline Curves**
```python
# Types
- Exponential: Q(t) = Q0 * exp(-D*t)
- Hyperbolic: Q(t) = Q0 / (1 + b*D*t)^(1/b)
- Harmonic: b=1 (slower decline)

# Par pays
USA_Permian: hyperbolic, b=0.3, D=35% (shale)
Norway: exponential, D=4.5% (offshore mature)
Saudi_Ghawar: harmonic, b=1.0, D=2% (giant field)
```

### **B. Analyses Cross-Country**

#### **OPEC vs Non-OPEC**
```python
{
  "year": 2023,
  "opec_production": 28.5,    # mb/d
  "non_opec": 72.1,            # mb/d
  "opec_share": 28.3,          # %
  "opec_spare_capacity": 3.2   # mb/d
}
```

#### **Correlation Prix/Production**
```python
# Par pays
correlation_matrix = {
  "SAU_price": 0.15,  # Faible (swing producer)
  "USA_price": -0.05, # Neutre (shale flexible)
  "VEN_price": -0.45  # Négative (effondrement)
}
```

### **C. Analyses Prédictives**

#### **Hubbert Peak Model**
```python
# Paramètres
URR = 250  # Ultimate Recoverable Resources (Gb)
peak_year = 2001
peak_rate = 3.4

# Projection
production_2030 = hubbert_curve(2030, URR, peak_year, peak_rate)
```

---

## 6. SOURCES DE DONNÉES

### **Production Historique**
1. **BP Statistical Review of World Energy**
   - URL: https://www.energyinst.org/statistical-review
   - Fichiers Excel publics
   - 1965-2023
   - Tous pays majeurs

2. **EIA International Energy Statistics**
   - API: https://www.eia.gov/opendata/
   - 1980-2024
   - Mensuel disponible

3. **JODI (Joint Organisations Data Initiative)**
   - API: https://www.jodidata.org/
   - 2000-2024
   - Mensuel, 90+ pays

### **Prix**
1. **World Bank Commodity Markets**
   - API: https://data.worldbank.org/
   - 1960-2024
   - Brent, WTI, Dubai
   - Real & nominal

2. **FRED (Federal Reserve Economic Data)**
   - API gratuite
   - Historique complet

### **Événements**
1. **ACLED (Armed Conflict Location & Event Data Project)**
   - Conflits documentés
   - Géolocalisation

2. **Recherche manuelle**
   - Wikipedia événements pétroliers
   - Reuters archives
   - OPEC bulletins

---

## 7. SCRIPTS D'IMPORT

### **Structure Fichiers**

```
backend/
  data/
    bp_statistical_2023.xlsx        # BP data
    world_bank_prices.csv           # Prix 1960-2024
    jodi_monthly_latest.json        # Production récente
    geopolitical_events.json        # Événements manuels
  scripts/
    import_bp_data.py              # Import BP Statistical
    import_prices.py               # Import prix WB
    import_jodi.py                 # Import JODI
    calculate_analytics.py         # Calcul métriques
    detect_peaks.py                # Peak detection
```

### **Exemple Script BP Import**

```python
import pandas as pd
from app.database.models import HistoricalProduction

def import_bp_data(filepath):
    """Import BP Statistical Review Excel"""
    df = pd.read_excel(
        filepath, 
        sheet_name='Oil Production - Barrels',
        header=2
    )
    
    for _, row in df.iterrows():
        country = row['Country']
        for year in range(1965, 2024):
            if year in row:
                db.add(HistoricalProduction(
                    country_code=get_code(country),
                    country_name=country,
                    year=year,
                    production_value=row[year],
                    source_id='bp_statistical_2023'
                ))
```

---

## 8. PRIORITÉS D'IMPLÉMENTATION

### **Phase 1 : Infrastructure** ✅ FAIT
- [x] Modèles DB (OilPrice, HistoricalProduction, etc.)
- [x] Schémas API
- [ ] Migrations DB

### **Phase 2 : Données Historiques (2h)**
- [ ] Import BP Statistical Review (1965-2023)
- [ ] Import prix World Bank (1960-2024)
- [ ] Minimum 10 pays × 60 ans

### **Phase 3 : Extension Géographique (2h)**
- [ ] Ajouter 15 pays restants
- [ ] Coordonnées + flags
- [ ] Données JODI récentes

### **Phase 4 : Événements (1h)**
- [ ] Base événements géopolitiques
- [ ] 50+ événements clés
- [ ] Liens production

### **Phase 5 : Analytics (3h)**
- [ ] Calcul CAGR par pays
- [ ] Peak detection
- [ ] Decline curves
- [ ] Correlations

### **Phase 6 : Frontend (4h)**
- [ ] Slider temporel
- [ ] Graphiques historiques
- [ ] Module analytics
- [ ] Module prix
- [ ] Événements timeline

---

## 📊 RÉSUMÉ QUANTITATIF

**Données Totales** :
- Production : 20 pays × 60 ans × 3 sources = **3,600 rows**
- Prix : 3 benchmarks × 65 ans × 365 jours = **71,175 rows** (ou annuel = 195)
- Réserves : 25 pays × 45 ans = **1,125 rows**
- Événements : ~200 événements
- Analytics : 20 pays × 10 métriques = **200 rows**

**Total** : ~**5,500 rows** de données

**Temps estimé total** : **15-20h** pour implémentation complète

---

**PROCHAINE ÉTAPE** : Créer les scripts d'import et commencer avec BP Statistical Review
