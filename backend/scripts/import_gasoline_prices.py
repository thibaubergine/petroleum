"""
Import prix à la pompe de référence — données statiques 2024
Sources : EU Commission Weekly Oil Bulletin + EIA + GlobalPetrolPrices.com
Unité : USD/litre
Mise à jour : novembre 2024
"""
import sys
sys.path.append('/app')

from datetime import date
from decimal import Decimal
from app.database.connection import SessionLocal
from app.database.models import GasolinePrices

# Prix novembre 2024 — USD/litre
# Source : EU Commission + EIA + GlobalPetrolPrices
PRICES = [
    # Europe
    ('NOR','Norvège',        'europe', 2.12, 1.94),
    ('CHE','Suisse',         'europe', 1.87, 1.72),
    ('NLD','Pays-Bas',       'europe', 2.05, 1.68),
    ('DNK','Danemark',       'europe', 1.98, 1.71),
    ('FIN','Finlande',       'europe', 1.76, 1.63),
    ('SWE','Suède',          'europe', 1.81, 1.70),
    ('DEU','Allemagne',      'europe', 1.78, 1.61),
    ('FRA','France',         'europe', 1.74, 1.62),
    ('BEL','Belgique',       'europe', 1.70, 1.65),
    ('GBR','Royaume-Uni',    'europe', 1.65, 1.59),
    ('ITA','Italie',         'europe', 1.72, 1.67),
    ('ESP','Espagne',        'europe', 1.52, 1.44),
    ('PRT','Portugal',       'europe', 1.68, 1.54),
    ('AUT','Autriche',       'europe', 1.59, 1.49),
    ('GRC','Grèce',          'europe', 1.81, 1.64),
    ('POL','Pologne',        'europe', 1.38, 1.37),
    ('CZE','Rép. Tchèque',   'europe', 1.49, 1.42),
    ('HUN','Hongrie',        'europe', 1.43, 1.51),
    ('ROU','Roumanie',       'europe', 1.41, 1.38),
    ('HRV','Croatie',        'europe', 1.54, 1.48),
    # Amérique du Nord
    ('USA','États-Unis',     'north_america', 0.96, 1.02),
    ('CAN','Canada',         'north_america', 1.28, 1.31),
    ('MEX','Mexique',        'north_america', 1.08, 1.11),
    # Moyen-Orient
    ('SAU','Arabie Saoudite','middle_east',   0.24, 0.16),
    ('ARE','Émirats Arabes', 'middle_east',   0.78, 0.72),
    ('IRN','Iran',           'middle_east',   0.04, 0.04),
    ('KWT','Koweït',         'middle_east',   0.35, 0.29),
    ('IRQ','Iraq',           'middle_east',   0.51, 0.45),
    # Asie
    ('CHN','Chine',          'asia',          1.15, 1.08),
    ('JPN','Japon',          'asia',          1.42, 1.35),
    ('IND','Inde',           'asia',          1.16, 0.98),
    ('KOR','Corée du Sud',   'asia',          1.62, 1.55),
    ('IDN','Indonésie',      'asia',          0.78, 0.65),
    ('THA','Thaïlande',      'asia',          1.14, 1.02),
    ('PAK','Pakistan',       'asia',          0.87, 0.82),
    # Amérique Latine
    ('BRA','Brésil',         'latin_america', 1.18, 1.04),
    ('ARG','Argentine',      'latin_america', 0.92, 0.88),
    ('CHL','Chili',          'latin_america', 1.28, 1.19),
    ('COL','Colombie',       'latin_america', 0.74, 0.71),
    ('VEN','Venezuela',      'latin_america', 0.02, 0.01),
    # Afrique
    ('ZAF','Afrique du Sud', 'africa',        1.08, 1.02),
    ('NGA','Nigeria',        'africa',        0.43, 0.39),
    ('EGY','Égypte',         'africa',        0.37, 0.32),
    ('MAR','Maroc',          'africa',        1.22, 1.14),
    ('DZA','Algérie',        'africa',        0.31, 0.22),
    # Russie / Ex-URSS
    ('RUS','Russie',         'former_ussr',   0.64, 0.72),
    ('KAZ','Kazakhstan',     'former_ussr',   0.54, 0.49),
    ('UKR','Ukraine',        'former_ussr',   1.18, 1.12),
    ('AZE','Azerbaïdjan',    'former_ussr',   0.61, 0.57),
]

REF_DATE = date(2024, 11, 1)

def import_gasoline_prices():
    db = SessionLocal()
    try:
        print(f"Import prix pompe de référence ({REF_DATE})...")
        count = 0
        for code, name, region, gasoline, diesel in PRICES:
            from sqlalchemy import and_
            existing = db.query(GasolinePrices).filter(
                GasolinePrices.country_code == code,
                GasolinePrices.date == REF_DATE,
            ).first()
            if existing:
                existing.gasoline_price_usd = Decimal(str(gasoline))
                existing.diesel_price_usd = Decimal(str(diesel))
            else:
                db.add(GasolinePrices(
                    date=REF_DATE,
                    country_code=code,
                    country_name=name,
                    region=region,
                    gasoline_price_usd=Decimal(str(gasoline)),
                    diesel_price_usd=Decimal(str(diesel)),
                    source='reference_2024',
                ))
            count += 1

        db.commit()
        print(f"✅ {count} pays importés — {len(set(r[2] for r in PRICES))} régions")
        print("   Source : EU Commission + EIA + GlobalPetrolPrices (nov. 2024)")

    except Exception as e:
        db.rollback()
        print(f"❌ Erreur : {e}")
        raise
    finally:
        db.close()

if __name__ == '__main__':
    import_gasoline_prices()
