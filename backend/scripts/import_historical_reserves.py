"""
Import Reserves Historiques - BP Statistical Review
Reserves prouvees (1P) par pays 1980-2023
Dissociation conventionnel / non-conventionnel
Source: BP Statistical Review 2023 + estimations Rystad
Unite: Milliards de barils (Gb)
"""
import sys
sys.path.append('/app')

from app.database.connection import SessionLocal
from app.database.models import HistoricalReserves

# Donnees: {country_code: {year: {proven_1p, crude_conventional, non_conventional}}}
# proven_1p = crude_conventional + non_conventional (approximativement)
RESERVES_DATA = {
    'SAU': {
        'name': 'Arabie Saoudite', 'opec': True,
        'data': {
            1980: (168, 168, 0),  1985: (170, 170, 0),  1987: (260, 260, 0),  # Inflation OPEC
            1990: (261, 261, 0),  1995: (265, 265, 0),  2000: (263, 263, 0),
            2005: (265, 265, 0),  2010: (265, 265, 0),  2015: (266, 266, 0),
            2020: (268, 268, 0),  2023: (267, 267, 0),
        }
    },
    'VEN': {
        'name': 'Venezuela', 'opec': True,
        'data': {
            1980: (19, 19, 0),   1985: (55, 15, 40),   1989: (100, 15, 85),  # Integration Orenoque
            1990: (101, 18, 83), 1995: (65, 18, 47),   2000: (77, 18, 59),
            2005: (79, 18, 61),  2007: (172, 18, 154), 2010: (297, 20, 277), # Reclassification Orenoque
            2015: (300, 20, 280), 2020: (303, 20, 283), 2023: (304, 20, 284),
        }
    },
    'CAN': {
        'name': 'Canada', 'opec': False,
        'data': {
            1980: (7, 7, 0),    1985: (8, 7, 1),    1990: (9, 6, 3),
            1995: (9, 6, 3),    2000: (11, 5, 6),   2003: (180, 5, 175),  # Integration sables bitumineux Alberta
            2005: (179, 5, 174), 2010: (175, 5, 170), 2015: (172, 5, 167),
            2020: (168, 5, 163), 2023: (170, 5, 165),
        }
    },
    'IRN': {
        'name': 'Iran', 'opec': True,
        'data': {
            1980: (57, 57, 0),   1985: (59, 59, 0),   1987: (93, 93, 0),  # Inflation OPEC
            1990: (93, 93, 0),   1995: (93, 93, 0),   2000: (97, 97, 0),
            2005: (138, 138, 0), 2010: (151, 151, 0), 2015: (158, 158, 0),
            2020: (208, 205, 3), 2023: (208, 205, 3),
        }
    },
    'IRQ': {
        'name': 'Iraq', 'opec': True,
        'data': {
            1980: (31, 31, 0),   1985: (65, 65, 0),   1988: (100, 100, 0),  # Inflation OPEC
            1990: (100, 100, 0), 1995: (100, 100, 0), 2000: (115, 115, 0),
            2005: (115, 115, 0), 2010: (143, 143, 0), 2015: (143, 143, 0),
            2020: (145, 145, 0), 2023: (145, 145, 0),
        }
    },
    'KWT': {
        'name': 'Koweit', 'opec': True,
        'data': {
            1980: (68, 68, 0),   1985: (90, 90, 0),   1985: (92, 92, 0),
            1988: (97, 97, 0),   1990: (97, 97, 0),   1995: (97, 97, 0),
            2000: (97, 97, 0),   2005: (102, 102, 0), 2010: (102, 102, 0),
            2015: (102, 102, 0), 2020: (102, 102, 0), 2023: (102, 102, 0),
        }
    },
    'ARE': {
        'name': 'Emirats Arabes Unis', 'opec': True,
        'data': {
            1980: (31, 31, 0),   1985: (33, 33, 0),   1988: (98, 98, 0),  # Inflation OPEC massive (+197%)
            1990: (98, 98, 0),   1995: (98, 98, 0),   2000: (98, 98, 0),
            2005: (98, 98, 0),   2010: (98, 98, 0),   2015: (98, 98, 0),
            2020: (98, 98, 0),   2023: (98, 98, 0),
        }
    },
    'RUS': {
        'name': 'Russie', 'opec': False,
        'data': {
            1992: (52, 52, 0),   1995: (49, 49, 0),   2000: (59, 59, 0),
            2005: (80, 80, 0),   2010: (89, 89, 0),   2015: (103, 103, 0),
            2020: (107, 107, 0), 2022: (107, 107, 0), 2023: (80, 80, 0),  # Post-sanctions
        }
    },
    'USA': {
        'name': 'United States', 'opec': False,
        'data': {
            1980: (30, 30, 0),   1985: (27, 27, 0),   1990: (25, 25, 0),
            1995: (22, 22, 0),   2000: (21, 21, 0),   2005: (22, 20, 2),
            2008: (28, 23, 5),   2010: (35, 25, 10),  # Revolution shale
            2012: (45, 28, 17),  2014: (55, 32, 23),
            2015: (55, 30, 25),  2018: (62, 38, 24),
            2020: (68, 39, 29),  2023: (69, 40, 29),
        }
    },
    'LBY': {
        'name': 'Libye', 'opec': True,
        'data': {
            1980: (22, 22, 0),   1985: (22, 22, 0),   1990: (23, 23, 0),
            1995: (30, 30, 0),   2000: (36, 36, 0),   2005: (43, 43, 0),
            2010: (47, 47, 0),   2015: (48, 48, 0),   2020: (48, 48, 0),
            2023: (48, 48, 0),
        }
    },
    'NGA': {
        'name': 'Nigeria', 'opec': True,
        'data': {
            1980: (17, 17, 0),   1985: (16, 16, 0),   1990: (18, 18, 0),
            1995: (21, 21, 0),   2000: (29, 29, 0),   2005: (36, 36, 0),
            2010: (37, 37, 0),   2015: (37, 37, 0),   2020: (37, 37, 0),
            2023: (37, 37, 0),
        }
    },
    'KAZ': {
        'name': 'Kazakhstan', 'opec': False,
        'data': {
            1993: (6, 6, 0),    1995: (6, 6, 0),    2000: (8, 8, 0),
            2005: (26, 26, 0),  2010: (30, 30, 0),  2015: (30, 30, 0),
            2020: (30, 30, 0),  2023: (30, 30, 0),
        }
    },
    'QAT': {
        'name': 'Qatar', 'opec': True,
        'data': {
            1980: (4, 4, 0),    1985: (4, 4, 0),    1990: (4, 4, 0),
            1995: (8, 8, 0),    2000: (15, 15, 0),  2005: (27, 27, 0),
            2010: (25, 25, 0),  2015: (25, 25, 0),  2020: (25, 25, 0),
            2023: (25, 25, 0),
        }
    },
    'BRA': {
        'name': 'Bresil', 'opec': False,
        'data': {
            1980: (2, 2, 0),    1985: (3, 3, 0),    1990: (4, 4, 0),
            1995: (7, 7, 0),    2000: (9, 9, 0),    2005: (12, 12, 0),
            2007: (15, 14, 1),  2010: (15, 14, 1),  # Decouverte pre-sal Santos
            2015: (16, 15, 1),  2020: (15, 14, 1),  2023: (15, 14, 1),
        }
    },
    'NOR': {
        'name': 'Norvege', 'opec': False,
        'data': {
            1980: (7, 7, 0),    1985: (11, 11, 0),  1990: (12, 12, 0),
            1995: (12, 12, 0),  2000: (10, 10, 0),  2005: (8, 8, 0),
            2010: (7, 7, 0),    2015: (7, 7, 0),    2020: (8, 8, 0),
            2023: (8, 8, 0),
        }
    },
}


def import_historical_reserves():
    db = SessionLocal()
    try:
        print("Import reserves historiques 1980-2023...")
        total = 0

        for code, country in RESERVES_DATA.items():
            print(f"  {country['name']} ({code}): {len(country['data'])} annees")

            for year, (proven, crude, non_conv) in country['data'].items():
                existing = db.query(HistoricalReserves).filter(
                    HistoricalReserves.country_code == code,
                    HistoricalReserves.year == year,
                    HistoricalReserves.source_id == 'bp_statistical'
                ).first()

                if existing:
                    existing.proven_1p = proven
                    existing.crude_conventional = crude
                    existing.non_conventional = non_conv
                else:
                    db.add(HistoricalReserves(
                        country_code=code,
                        country_name=country['name'],
                        year=year,
                        proven_1p=proven,
                        crude_conventional=crude,
                        non_conventional=non_conv,
                        source_id='bp_statistical',
                        is_opec_member=country['opec'],
                    ))
                total += 1

        db.commit()
        print(f"\nOK: {total} records importes")
        print(f"Pays: {len(RESERVES_DATA)}")

    except Exception as e:
        db.rollback()
        print(f"ERREUR: {e}")
        raise
    finally:
        db.close()


if __name__ == '__main__':
    import_historical_reserves()
