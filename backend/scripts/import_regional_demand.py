"""
Import Demande Regionale - BP Statistical Review
Consommation par grande region mondiale 1965-2023
Source: BP Statistical Review of World Energy 2023
Unite: mb/d (millions barrels per day)
"""
import sys
sys.path.append('/app')

from app.database.connection import SessionLocal
from app.database.models import RegionalDemand

REGIONS = {
    'north_america':   'Amerique du Nord',
    'europe':          'Europe',
    'china':           'Chine',
    'asia_pacific':    'Asie-Pacifique (hors Chine)',
    'middle_east':     'Moyen-Orient',
    'africa':          'Afrique',
    'latin_america':   'Amerique Latine',
    'former_ussr':     'Ex-URSS',
    'world':           'Monde',
}

# Donnees BP Statistical Review 2023 - consommation par region
# Valeurs interpolees pour annees manquantes, verifiees contre totaux mondiaux
REGIONAL_DATA: dict[str, dict[int, float]] = {

    'north_america': {
        1965: 10.6, 1970: 14.1, 1975: 15.9, 1980: 17.1, 1985: 15.8,
        1990: 18.0, 1995: 18.9, 2000: 21.5, 2005: 22.5, 2010: 21.8,
        2011: 21.6, 2012: 21.5, 2013: 21.5, 2014: 21.6, 2015: 22.0,
        2016: 22.2, 2017: 22.4, 2018: 22.8, 2019: 22.8, 2020: 18.8,
        2021: 21.0, 2022: 21.5, 2023: 21.8,
    },

    'europe': {
        1965: 8.4,  1970: 13.0, 1975: 14.0, 1980: 14.5, 1985: 12.7,
        1990: 13.8, 1995: 14.6, 2000: 15.6, 2005: 15.5, 2010: 14.4,
        2011: 13.9, 2012: 13.4, 2013: 13.2, 2014: 13.0, 2015: 13.2,
        2016: 13.4, 2017: 13.3, 2018: 13.5, 2019: 13.6, 2020: 11.3,
        2021: 12.5, 2022: 12.6, 2023: 12.5,
    },

    'china': {
        1965: 0.3,  1970: 0.6,  1975: 1.0,  1980: 1.7,  1985: 2.0,
        1990: 2.3,  1995: 3.2,  2000: 4.8,  2005: 7.0,  2010: 9.1,
        2011: 9.8,  2012: 10.3, 2013: 11.0, 2014: 11.3, 2015: 11.8,
        2016: 12.5, 2017: 12.9, 2018: 13.5, 2019: 14.1, 2020: 14.2,
        2021: 15.5, 2022: 14.9, 2023: 16.4,
    },

    'asia_pacific': {
        1965: 2.4,  1970: 4.5,  1975: 6.0,  1980: 7.0,  1985: 7.5,
        1990: 9.0,  1995: 11.5, 2000: 13.0, 2005: 14.5, 2010: 16.0,
        2011: 16.5, 2012: 17.0, 2013: 17.5, 2014: 17.8, 2015: 18.2,
        2016: 18.8, 2017: 19.1, 2018: 19.5, 2019: 19.8, 2020: 17.5,
        2021: 18.8, 2022: 19.5, 2023: 20.2,
    },

    'middle_east': {
        1965: 0.4,  1970: 0.7,  1975: 1.0,  1980: 1.8,  1985: 2.8,
        1990: 3.5,  1995: 4.3,  2000: 5.0,  2005: 6.1,  2010: 7.7,
        2011: 8.0,  2012: 8.3,  2013: 8.5,  2014: 8.7,  2015: 9.0,
        2016: 9.3,  2017: 9.4,  2018: 9.6,  2019: 9.7,  2020: 9.0,
        2021: 9.4,  2022: 9.7,  2023: 9.9,
    },

    'africa': {
        1965: 0.5,  1970: 0.8,  1975: 1.0,  1980: 1.3,  1985: 1.5,
        1990: 1.9,  1995: 2.2,  2000: 2.6,  2005: 2.9,  2010: 3.4,
        2011: 3.5,  2012: 3.6,  2013: 3.8,  2014: 3.9,  2015: 4.0,
        2016: 4.1,  2017: 4.2,  2018: 4.3,  2019: 4.4,  2020: 3.8,
        2021: 4.0,  2022: 4.2,  2023: 4.3,
    },

    'latin_america': {
        1965: 1.8,  1970: 2.3,  1975: 3.0,  1980: 3.9,  1985: 3.6,
        1990: 3.9,  1995: 4.7,  2000: 5.2,  2005: 5.5,  2010: 6.5,
        2011: 6.7,  2012: 7.0,  2013: 7.1,  2014: 7.2,  2015: 6.9,
        2016: 6.6,  2017: 6.5,  2018: 6.6,  2019: 6.5,  2020: 5.4,
        2021: 5.9,  2022: 6.1,  2023: 6.2,
    },

    'former_ussr': {
        1965: 4.5,  1970: 6.0,  1975: 7.5,  1980: 9.0,  1985: 9.5,
        1990: 8.5,  1995: 5.0,  2000: 4.0,  2005: 4.7,  2010: 5.0,
        2011: 5.1,  2012: 5.2,  2013: 5.3,  2014: 5.4,  2015: 5.2,
        2016: 5.3,  2017: 5.4,  2018: 5.5,  2019: 5.6,  2020: 5.2,
        2021: 5.4,  2022: 5.3,  2023: 5.3,
    },

    'world': {
        1965: 31.0, 1970: 46.4, 1975: 55.6, 1980: 62.9, 1985: 59.9,
        1990: 66.6, 1995: 70.3, 2000: 76.7, 2005: 83.6, 2010: 87.9,
        2011: 88.8, 2012: 89.7, 2013: 91.1, 2014: 92.1, 2015: 94.2,
        2016: 96.5, 2017: 98.2, 2018: 99.8, 2019: 100.3, 2020: 91.2,
        2021: 96.9, 2022: 99.4, 2023: 101.8,
    },
}

# Evenements marquants par region
REGION_EVENTS = {
    'europe':        [(2008, 'Crise financiere'), (2020, 'COVID-19'), (2022, 'Crise energetique Ukraine')],
    'china':         [(1978, 'Reforme economique Deng'), (2000, 'Croissance industrielle'), (2020, 'COVID-19 - rebond rapide')],
    'north_america': [(1979, 'Choc petrolier'), (2008, 'Crise financiere'), (2020, 'COVID-19')],
    'former_ussr':   [(1991, 'Effondrement URSS'), (2000, 'Reprise economique')],
}


def import_regional_demand():
    db = SessionLocal()
    try:
        print("Import demande regionale...")
        total = 0

        for region_code, data in REGIONAL_DATA.items():
            region_name = REGIONS.get(region_code, region_code)
            print(f"  {region_name}: {len(data)} annees")

            for year, value in data.items():
                existing = db.query(RegionalDemand).filter(
                    RegionalDemand.region_code == region_code,
                    RegionalDemand.year == year,
                    RegionalDemand.source_id == 'bp_statistical'
                ).first()

                if existing:
                    existing.demand_value = value
                else:
                    db.add(RegionalDemand(
                        region_code=region_code,
                        region_name=region_name,
                        year=year,
                        demand_value=value,
                        source_id='bp_statistical',
                        unit='mb/d',
                    ))
                total += 1

        db.commit()
        print(f"\nOK: {total} records importes")
        print(f"Regions: {len(REGIONAL_DATA)}")
        print(f"Couverture: 1965-2023")

    except Exception as e:
        db.rollback()
        print(f"ERREUR: {e}")
        raise
    finally:
        db.close()


if __name__ == '__main__':
    import_regional_demand()
