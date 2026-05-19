"""
import_worldbank.py — Données World Bank

Indicateurs importés :
  - FP.CPI.TOTL.ZG : Inflation (% annuel)
  - NY.GDP.PCAP.CD : PIB par habitant (USD courants)
  - NY.GDP.MKTP.KD.ZG : Croissance PIB (%)
  - EG.USE.PCAP.KG.OE : Consommation énergie per capita (kg éq. pétrole)
  - SP.POP.TOTL : Population totale

API World Bank : https://api.worldbank.org/v2/country/{code}/indicator/{indicator}
Gratuite, sans clé, limite 1000 req/heure
"""

import sys, json, time
sys.path.append('/app')

import urllib.request
from decimal import Decimal
from app.database.connection import SessionLocal
from app.database.models import WorldBankMacro

# ── Pays prioritaires (producteurs majeurs + consommateurs clés) ─────────────
COUNTRIES = {
    # Producteurs majeurs
    'SAU': 'Arabie Saoudite', 'RUS': 'Russie',       'USA': 'États-Unis',
    'IRQ': 'Iraq',            'IRN': 'Iran',           'ARE': 'Émirats Arabes',
    'CAN': 'Canada',          'VEN': 'Venezuela',      'NOR': 'Norvège',
    'NGA': 'Nigeria',         'KWT': 'Koweït',         'BRA': 'Brésil',
    'GBR': 'Royaume-Uni',     'CHN': 'Chine',          'MEX': 'Mexique',
    'KAZ': 'Kazakhstan',      'DZA': 'Algérie',        'QAT': 'Qatar',
    # Consommateurs importants
    'DEU': 'Allemagne',       'JPN': 'Japon',          'IND': 'Inde',
    'FRA': 'France',          'KOR': 'Corée du Sud',   'IDN': 'Indonésie',
    # Économies de référence
    'NLD': 'Pays-Bas',        'SGP': 'Singapour',      'ZAF': 'Afrique du Sud',
}

INDICATORS = {
    'FP.CPI.TOTL.ZG':    'Inflation (% annuel)',
    'NY.GDP.PCAP.CD':    'PIB par habitant (USD)',
    'NY.GDP.MKTP.KD.ZG': 'Croissance PIB (%)',
    'EG.USE.PCAP.KG.OE': 'Consommation énergie/habitant (kg éq. pétrole)',
    'SP.POP.TOTL':       'Population totale',
}

# Codes WB → codes ISO3 (quelques conversions nécessaires)
WB_CODE_MAP = {
    'IRN': 'IR',   # Iran : code WB différent
    'VEN': 'VE',
}

def fetch_wb(country_code: str, indicator: str) -> list[dict]:
    """Fetch données World Bank pour un pays et un indicateur"""
    # Convertir code ISO3 → code WB si nécessaire
    wb_code = country_code  # WB accepte ISO3 directement pour la plupart
    
    url = (
        f"https://api.worldbank.org/v2/country/{wb_code}/indicator/{indicator}"
        f"?format=json&per_page=70&mrv=60&date=1960:2026"
    )
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read())
        
        if not data or len(data) < 2 or not data[1]:
            return []
        
        results = []
        for row in data[1]:
            if row.get('value') is not None:
                try:
                    results.append({
                        'year': int(row['date']),
                        'value': float(row['value'])
                    })
                except (ValueError, TypeError):
                    pass
        return results
    except Exception as e:
        return []


def import_worldbank():
    db = SessionLocal()
    total_inserted = 0
    total_updated = 0
    
    print(f"Import World Bank — {len(COUNTRIES)} pays × {len(INDICATORS)} indicateurs")
    print(f"{'='*60}")
    
    try:
        for country_code, country_name in COUNTRIES.items():
            print(f"\n  {country_name} ({country_code})")
            
            for indicator_code, indicator_name in INDICATORS.items():
                data = fetch_wb(country_code, indicator_code)
                time.sleep(0.1)  # Rate limiting
                
                inserted = updated = 0
                for row in data:
                    existing = db.query(WorldBankMacro).filter(
                        WorldBankMacro.country_code == country_code,
                        WorldBankMacro.year == row['year'],
                        WorldBankMacro.indicator_code == indicator_code,
                    ).first()
                    
                    if existing:
                        existing.value = Decimal(str(row['value']))
                        updated += 1
                    else:
                        db.add(WorldBankMacro(
                            country_code=country_code,
                            country_name=country_name,
                            year=row['year'],
                            indicator_code=indicator_code,
                            indicator_name=indicator_name,
                            value=Decimal(str(row['value'])),
                        ))
                        inserted += 1
                
                if data:
                    print(f"    {indicator_code[:20]:<20} {len(data)} pts  (+{inserted} ~{updated})")
                
                total_inserted += inserted
                total_updated += updated
        
        db.commit()
        print(f"\n{'='*60}")
        print(f"  ✅ World Bank importé")
        print(f"     Insérés : {total_inserted}")
        print(f"     Mis à jour : {total_updated}")
        print(f"     Total : {total_inserted + total_updated} records")
        
    except Exception as e:
        db.rollback()
        print(f"  ❌ Erreur : {e}")
        raise
    finally:
        db.close()


if __name__ == '__main__':
    import_worldbank()
