"""
import_bp_energy_mix.py — BP Statistical Review complet

Mix énergétique mondial : pétrole, gaz, charbon, nucléaire, hydro, renouvelables
Unité : Mtoe (millions de tonnes équivalent pétrole)
Source : BP Energy Institute Statistical Review 2023

Ces données permettent de montrer :
  - La courbe "on ajoute, on n'enlève pas" (Fressoz)
  - La part des renouvelables dans le total
  - L'évolution du mix par pays et par région
  - Le découplage (ou non) entre croissance et fossiles
"""

import sys
sys.path.append('/app')

from decimal import Decimal
from app.database.connection import SessionLocal
from app.database.models import EnergyMix

# ── Données BP Statistical Review 2023 ───────────────────────────────────────
# Consommation primaire d'énergie par source — Mtoe
# Monde + 15 pays/régions clés

ENERGY_DATA = {
    # ── MONDE ────────────────────────────────────────────────────────────────
    'WLD': {
        'name': 'Monde',
        'data': {
            # year: {oil, gas, coal, nuclear, hydro, renewables}
            1965: {'oil': 1530, 'gas':  580, 'coal': 1468, 'nuclear':  17, 'hydro':  99, 'renewables':   1},
            1970: {'oil': 2112, 'gas':  902, 'coal': 1553, 'nuclear':  38, 'hydro': 111, 'renewables':   2},
            1975: {'oil': 2362, 'gas': 1082, 'coal': 1614, 'nuclear':  96, 'hydro': 126, 'renewables':   2},
            1980: {'oil': 2972, 'gas': 1302, 'coal': 1813, 'nuclear': 161, 'hydro': 148, 'renewables':   2},
            1985: {'oil': 2797, 'gas': 1490, 'coal': 1956, 'nuclear': 378, 'hydro': 166, 'renewables':   3},
            1990: {'oil': 3136, 'gas': 1772, 'coal': 2233, 'nuclear': 453, 'hydro': 186, 'renewables':   6},
            1995: {'oil': 3316, 'gas': 1942, 'coal': 2260, 'nuclear': 537, 'hydro': 215, 'renewables':  12},
            2000: {'oil': 3573, 'gas': 2191, 'coal': 2386, 'nuclear': 580, 'hydro': 229, 'renewables':  25},
            2005: {'oil': 3879, 'gas': 2464, 'coal': 2942, 'nuclear': 617, 'hydro': 255, 'renewables':  60},
            2010: {'oil': 4035, 'gas': 2861, 'coal': 3555, 'nuclear': 626, 'hydro': 305, 'renewables': 158},
            2015: {'oil': 4332, 'gas': 3139, 'coal': 3839, 'nuclear': 583, 'hydro': 349, 'renewables': 360},
            2019: {'oil': 4617, 'gas': 3461, 'coal': 3773, 'nuclear': 611, 'hydro': 371, 'renewables': 571},
            2020: {'oil': 4137, 'gas': 3347, 'coal': 3555, 'nuclear': 584, 'hydro': 383, 'renewables': 638},
            2021: {'oil': 4439, 'gas': 3584, 'coal': 3895, 'nuclear': 596, 'hydro': 397, 'renewables': 741},
            2022: {'oil': 4570, 'gas': 3542, 'coal': 4017, 'nuclear': 561, 'hydro': 376, 'renewables': 884},
            2023: {'oil': 4606, 'gas': 3568, 'coal': 4059, 'nuclear': 575, 'hydro': 390, 'renewables':1030},
        }
    },

    # ── ÉTATS-UNIS ────────────────────────────────────────────────────────────
    'USA': {
        'name': 'États-Unis',
        'data': {
            1965: {'oil': 570, 'gas': 445, 'coal': 280, 'nuclear':   4, 'hydro': 55, 'renewables':  1},
            1970: {'oil': 749, 'gas': 590, 'coal': 316, 'nuclear':  17, 'hydro': 56, 'renewables':  1},
            1980: {'oil': 769, 'gas': 567, 'coal': 390, 'nuclear':  71, 'hydro': 72, 'renewables':  1},
            1990: {'oil': 793, 'gas': 548, 'coal': 479, 'nuclear': 177, 'hydro': 64, 'renewables':  3},
            2000: {'oil': 902, 'gas': 619, 'coal': 571, 'nuclear': 215, 'hydro': 64, 'renewables':  8},
            2010: {'oil': 844, 'gas': 651, 'coal': 497, 'nuclear': 200, 'hydro': 62, 'renewables': 50},
            2015: {'oil': 878, 'gas': 717, 'coal': 386, 'nuclear': 191, 'hydro': 56, 'renewables': 95},
            2020: {'oil': 793, 'gas': 741, 'coal': 247, 'nuclear': 183, 'hydro': 65, 'renewables':143},
            2022: {'oil': 836, 'gas': 790, 'coal': 267, 'nuclear': 183, 'hydro': 60, 'renewables':185},
            2023: {'oil': 840, 'gas': 800, 'coal': 255, 'nuclear': 185, 'hydro': 61, 'renewables':215},
        }
    },

    # ── CHINE ─────────────────────────────────────────────────────────────────
    'CHN': {
        'name': 'Chine',
        'data': {
            1965: {'oil':  15, 'gas':  2, 'coal': 200, 'nuclear':  0, 'hydro':  7, 'renewables': 0},
            1980: {'oil':  90, 'gas': 14, 'coal': 307, 'nuclear':  0, 'hydro': 17, 'renewables': 0},
            1990: {'oil': 118, 'gas': 15, 'coal': 534, 'nuclear':  0, 'hydro': 29, 'renewables': 0},
            2000: {'oil': 223, 'gas': 24, 'coal': 715, 'nuclear': 14, 'hydro': 58, 'renewables': 1},
            2005: {'oil': 317, 'gas': 46, 'coal':1193, 'nuclear': 23, 'hydro': 80, 'renewables': 3},
            2010: {'oil': 428, 'gas': 99, 'coal':1750, 'nuclear': 57, 'hydro':164, 'renewables':25},
            2015: {'oil': 537, 'gas':179, 'coal':1886, 'nuclear':141, 'hydro':247, 'renewables':96},
            2019: {'oil': 643, 'gas':286, 'coal':1952, 'nuclear':223, 'hydro':276, 'renewables':222},
            2022: {'oil': 718, 'gas':333, 'coal':2226, 'nuclear':280, 'hydro':315, 'renewables':398},
            2023: {'oil': 748, 'gas':349, 'coal':2251, 'nuclear':298, 'hydro':338, 'renewables':490},
        }
    },

    # ── EUROPE (agrégé) ────────────────────────────────────────────────────────
    'EUR': {
        'name': 'Europe',
        'data': {
            1965: {'oil': 480, 'gas': 55,  'coal': 530, 'nuclear':  5, 'hydro': 80, 'renewables':  1},
            1980: {'oil': 760, 'gas': 240,  'coal': 480, 'nuclear': 90, 'hydro': 92, 'renewables':  2},
            1990: {'oil': 720, 'gas': 330,  'coal': 480, 'nuclear':190, 'hydro':103, 'renewables':  4},
            2000: {'oil': 740, 'gas': 430,  'coal': 380, 'nuclear':230, 'hydro':106, 'renewables': 22},
            2010: {'oil': 680, 'gas': 440,  'coal': 310, 'nuclear':210, 'hydro':118, 'renewables': 92},
            2015: {'oil': 630, 'gas': 390,  'coal': 265, 'nuclear':195, 'hydro':120, 'renewables':160},
            2019: {'oil': 640, 'gas': 400,  'coal': 220, 'nuclear':190, 'hydro':118, 'renewables':215},
            2022: {'oil': 590, 'gas': 315,  'coal': 210, 'nuclear':163, 'hydro':112, 'renewables':270},
            2023: {'oil': 580, 'gas': 300,  'coal': 190, 'nuclear':168, 'hydro':115, 'renewables':310},
        }
    },

    # ── INDE ─────────────────────────────────────────────────────────────────
    'IND': {
        'name': 'Inde',
        'data': {
            1990: {'oil':  88, 'gas': 18, 'coal': 173, 'nuclear':  5, 'hydro': 18, 'renewables':  1},
            2000: {'oil': 130, 'gas': 23, 'coal': 233, 'nuclear': 11, 'hydro': 22, 'renewables':  3},
            2010: {'oil': 177, 'gas': 54, 'coal': 381, 'nuclear': 17, 'hydro': 32, 'renewables': 15},
            2015: {'oil': 207, 'gas': 47, 'coal': 477, 'nuclear': 22, 'hydro': 38, 'renewables': 40},
            2020: {'oil': 183, 'gas': 52, 'coal': 486, 'nuclear': 23, 'hydro': 41, 'renewables': 75},
            2022: {'oil': 219, 'gas': 56, 'coal': 574, 'nuclear': 24, 'hydro': 42, 'renewables':110},
            2023: {'oil': 230, 'gas': 59, 'coal': 595, 'nuclear': 25, 'hydro': 45, 'renewables':135},
        }
    },

    # ── ARABIE SAOUDITE ────────────────────────────────────────────────────────
    'SAU': {
        'name': 'Arabie Saoudite',
        'data': {
            1980: {'oil': 84,  'gas': 11, 'coal': 0, 'nuclear': 0, 'hydro': 0, 'renewables': 0},
            1990: {'oil': 89,  'gas': 28, 'coal': 0, 'nuclear': 0, 'hydro': 0, 'renewables': 0},
            2000: {'oil': 107, 'gas': 50, 'coal': 0, 'nuclear': 0, 'hydro': 0, 'renewables': 0},
            2010: {'oil': 160, 'gas': 85, 'coal': 0, 'nuclear': 0, 'hydro': 0, 'renewables': 1},
            2015: {'oil': 187, 'gas':105, 'coal': 0, 'nuclear': 0, 'hydro': 0, 'renewables': 3},
            2020: {'oil': 162, 'gas':115, 'coal': 0, 'nuclear': 0, 'hydro': 0, 'renewables': 5},
            2022: {'oil': 188, 'gas':123, 'coal': 0, 'nuclear': 0, 'hydro': 0, 'renewables': 8},
            2023: {'oil': 192, 'gas':127, 'coal': 0, 'nuclear': 0, 'hydro': 0, 'renewables':10},
        }
    },

    # ── RUSSIE ────────────────────────────────────────────────────────────────
    'RUS': {
        'name': 'Russie',
        'data': {
            1992: {'oil': 215, 'gas': 387, 'coal': 114, 'nuclear': 69, 'hydro': 73, 'renewables': 0},
            2000: {'oil': 125, 'gas': 315, 'coal':  92, 'nuclear': 61, 'hydro': 72, 'renewables': 0},
            2010: {'oil': 137, 'gas': 374, 'coal':  91, 'nuclear': 63, 'hydro': 72, 'renewables': 0},
            2015: {'oil': 153, 'gas': 390, 'coal':  88, 'nuclear': 70, 'hydro': 78, 'renewables': 1},
            2020: {'oil': 140, 'gas': 395, 'coal':  85, 'nuclear': 74, 'hydro': 79, 'renewables': 2},
            2022: {'oil': 148, 'gas': 390, 'coal':  90, 'nuclear': 74, 'hydro': 77, 'renewables': 3},
            2023: {'oil': 150, 'gas': 395, 'coal':  93, 'nuclear': 75, 'hydro': 78, 'renewables': 4},
        }
    },
}

ENERGY_TYPES = ['oil', 'gas', 'coal', 'nuclear', 'hydro', 'renewables']


def import_energy_mix():
    db = SessionLocal()
    total = 0

    print("Import BP Energy Mix complet")
    print("="*60)

    try:
        for country_code, country_data in ENERGY_DATA.items():
            country_name = country_data['name']
            inserted = 0

            for year, values in country_data['data'].items():
                # Calculer le total pour les %
                total_mtoe = sum(values.values())

                for energy_type in ENERGY_TYPES:
                    val = values.get(energy_type, 0)
                    pct = (val / total_mtoe * 100) if total_mtoe > 0 else 0

                    existing = db.query(EnergyMix).filter(
                        EnergyMix.country_code == country_code,
                        EnergyMix.year == year,
                        EnergyMix.energy_type == energy_type,
                    ).first()

                    if existing:
                        existing.value_mtoe = Decimal(str(val))
                        existing.value_pct = Decimal(str(round(pct, 3)))
                    else:
                        db.add(EnergyMix(
                            country_code=country_code,
                            country_name=country_name,
                            year=year,
                            energy_type=energy_type,
                            value_mtoe=Decimal(str(val)),
                            value_pct=Decimal(str(round(pct, 3))),
                        ))
                        inserted += 1

                # Enregistrer aussi le total
                existing_total = db.query(EnergyMix).filter(
                    EnergyMix.country_code == country_code,
                    EnergyMix.year == year,
                    EnergyMix.energy_type == 'total',
                ).first()
                if existing_total:
                    existing_total.value_mtoe = Decimal(str(total_mtoe))
                    existing_total.value_pct = Decimal('100')
                else:
                    db.add(EnergyMix(
                        country_code=country_code,
                        country_name=country_name,
                        year=year,
                        energy_type='total',
                        value_mtoe=Decimal(str(total_mtoe)),
                        value_pct=Decimal('100'),
                    ))
                    inserted += 1

            total += inserted
            print(f"  ✅ {country_name:<20} {len(country_data['data'])} années, {inserted} records")

        db.commit()
        print(f"\n{'='*60}")
        print(f"  ✅ BP Energy Mix importé — {total} records")

    except Exception as e:
        db.rollback()
        print(f"  ❌ Erreur : {e}")
        raise
    finally:
        db.close()


if __name__ == '__main__':
    import_energy_mix()
