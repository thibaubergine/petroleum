"""
Routes API — World Bank Macro + BP Energy Mix
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional, List
from app.database.connection import get_db
from app.database.models import WorldBankMacro, EnergyMix

router = APIRouter()


# ── WORLD BANK ────────────────────────────────────────────────────────────────

@router.get("/macro/inflation")
def get_inflation(
    countries: str = Query('USA,SAU,RUS,NOR,NGA,VEN,DEU,FRA,CHN,IND'),
    year_from: int = Query(1970),
    year_to: int = Query(2024),
    db: Session = Depends(get_db)
):
    """Inflation annuelle par pays"""
    codes = [c.strip() for c in countries.split(',')]
    rows = db.query(WorldBankMacro).filter(
        WorldBankMacro.country_code.in_(codes),
        WorldBankMacro.indicator_code == 'FP.CPI.TOTL.ZG',
        WorldBankMacro.year.between(year_from, year_to)
    ).order_by(WorldBankMacro.country_code, WorldBankMacro.year).all()

    # Pivoter par année
    by_year: dict = {}
    for r in rows:
        y = r.year
        if y not in by_year:
            by_year[y] = {'year': y}
        by_year[y][r.country_code] = float(r.value) if r.value else None

    return sorted(by_year.values(), key=lambda x: x['year'])


@router.get("/macro/gdp-per-capita")
def get_gdp(
    countries: str = Query('USA,SAU,RUS,NOR,NGA,VEN,DEU,CHN,IND'),
    year_from: int = Query(1970),
    year_to: int = Query(2024),
    db: Session = Depends(get_db)
):
    """PIB par habitant USD"""
    codes = [c.strip() for c in countries.split(',')]
    rows = db.query(WorldBankMacro).filter(
        WorldBankMacro.country_code.in_(codes),
        WorldBankMacro.indicator_code == 'NY.GDP.PCAP.CD',
        WorldBankMacro.year.between(year_from, year_to)
    ).order_by(WorldBankMacro.country_code, WorldBankMacro.year).all()

    by_year: dict = {}
    for r in rows:
        y = r.year
        if y not in by_year:
            by_year[y] = {'year': y}
        by_year[y][r.country_code] = float(r.value) if r.value else None

    return sorted(by_year.values(), key=lambda x: x['year'])


@router.get("/macro/indicators/{country_code}")
def get_country_indicators(
    country_code: str,
    year_from: int = Query(1970),
    db: Session = Depends(get_db)
):
    """Tous les indicateurs pour un pays"""
    rows = db.query(WorldBankMacro).filter(
        WorldBankMacro.country_code == country_code.upper(),
        WorldBankMacro.year >= year_from
    ).order_by(WorldBankMacro.indicator_code, WorldBankMacro.year).all()

    by_indicator: dict = {}
    for r in rows:
        ind = r.indicator_code
        if ind not in by_indicator:
            by_indicator[ind] = {
                'indicator_code': ind,
                'indicator_name': r.indicator_name,
                'data': []
            }
        by_indicator[ind]['data'].append({
            'year': r.year,
            'value': float(r.value) if r.value else None
        })

    return list(by_indicator.values())


@router.get("/macro/oil-vs-inflation")
def get_oil_inflation_correlation(
    country: str = Query('USA'),
    db: Session = Depends(get_db)
):
    """Corrélation prix pétrole vs inflation pour un pays"""
    from app.database.models import OilPrice

    inflation = db.query(WorldBankMacro).filter(
        WorldBankMacro.country_code == country.upper(),
        WorldBankMacro.indicator_code == 'FP.CPI.TOTL.ZG',
        WorldBankMacro.year >= 1970
    ).order_by(WorldBankMacro.year).all()

    oil_prices = db.query(OilPrice).filter(
        OilPrice.price_type == 'brent',
        OilPrice.year >= 1970
    ).order_by(OilPrice.year).all()

    oil_by_year = {p.year: float(p.price) for p in oil_prices if p.price}
    result = []

    for r in inflation:
        if r.year in oil_by_year and r.value is not None:
            result.append({
                'year': r.year,
                'inflation': float(r.value),
                'oil_price': oil_by_year[r.year],
                'country': r.country_code,
            })

    return result


# ── BP ENERGY MIX ─────────────────────────────────────────────────────────────

@router.get("/energy-mix/world")
def get_world_energy_mix(
    year_from: int = Query(1965),
    year_to: int = Query(2024),
    db: Session = Depends(get_db)
):
    """Mix énergétique mondial par année"""
    rows = db.query(EnergyMix).filter(
        EnergyMix.country_code == 'WLD',
        EnergyMix.energy_type != 'total',
        EnergyMix.year.between(year_from, year_to)
    ).order_by(EnergyMix.year, EnergyMix.energy_type).all()

    by_year: dict = {}
    for r in rows:
        y = r.year
        if y not in by_year:
            by_year[y] = {'year': y}
        by_year[y][r.energy_type] = {
            'mtoe': float(r.value_mtoe) if r.value_mtoe else 0,
            'pct': float(r.value_pct) if r.value_pct else 0,
        }

    return sorted(by_year.values(), key=lambda x: x['year'])


@router.get("/energy-mix/country/{country_code}")
def get_country_energy_mix(
    country_code: str,
    year_from: int = Query(1965),
    db: Session = Depends(get_db)
):
    """Mix énergétique d'un pays"""
    rows = db.query(EnergyMix).filter(
        EnergyMix.country_code == country_code.upper(),
        EnergyMix.energy_type != 'total',
        EnergyMix.year >= year_from
    ).order_by(EnergyMix.year, EnergyMix.energy_type).all()

    by_year: dict = {}
    for r in rows:
        y = r.year
        if y not in by_year:
            by_year[y] = {'year': y}
        by_year[y][r.energy_type] = float(r.value_mtoe) if r.value_mtoe else 0

    return sorted(by_year.values(), key=lambda x: x['year'])


@router.get("/energy-mix/renewables-share")
def get_renewables_share(
    countries: str = Query('WLD,USA,CHN,EUR,IND,DEU'),
    db: Session = Depends(get_db)
):
    """Part des renouvelables dans le mix de chaque pays/région"""
    codes = [c.strip() for c in countries.split(',')]

    rows = db.query(EnergyMix).filter(
        EnergyMix.country_code.in_(codes),
        EnergyMix.energy_type.in_(['renewables', 'total']),
        EnergyMix.year >= 1990
    ).order_by(EnergyMix.country_code, EnergyMix.year).all()

    # Calculer la part renouvelables/total par pays/année
    data: dict = {}
    for r in rows:
        key = (r.country_code, r.year)
        if key not in data:
            data[key] = {'renewables': 0, 'total': 0, 'country': r.country_code, 'year': r.year, 'name': r.country_name}
        if r.energy_type == 'renewables':
            data[key]['renewables'] = float(r.value_mtoe) if r.value_mtoe else 0
        elif r.energy_type == 'total':
            data[key]['total'] = float(r.value_mtoe) if r.value_mtoe else 0

    result: dict = {}
    for (country, year), d in data.items():
        if country not in result:
            result[country] = {'country': country, 'name': d['name'], 'data': []}
        if d['total'] > 0:
            result[country]['data'].append({
                'year': year,
                'pct': round(d['renewables'] / d['total'] * 100, 2),
                'mtoe': d['renewables'],
            })

    for v in result.values():
        v['data'].sort(key=lambda x: x['year'])

    return list(result.values())


@router.get("/energy-mix/fossils-vs-clean")
def get_fossils_vs_clean(db: Session = Depends(get_db)):
    """
    Fossiles vs propre mondial — démonstration 'on ajoute, on n'enlève pas'
    """
    rows = db.query(EnergyMix).filter(
        EnergyMix.country_code == 'WLD',
        EnergyMix.year >= 1965
    ).order_by(EnergyMix.year, EnergyMix.energy_type).all()

    by_year: dict = {}
    for r in rows:
        y = r.year
        if y not in by_year:
            by_year[y] = {'year': y, 'fossil': 0, 'clean': 0, 'total': 0}
        val = float(r.value_mtoe) if r.value_mtoe else 0
        if r.energy_type in ('oil', 'gas', 'coal'):
            by_year[y]['fossil'] += val
        elif r.energy_type in ('nuclear', 'hydro', 'renewables'):
            by_year[y]['clean'] += val
        if r.energy_type == 'total':
            by_year[y]['total'] = val

    result = []
    for d in sorted(by_year.values(), key=lambda x: x['year']):
        if d['total'] > 0:
            d['fossil_pct'] = round(d['fossil'] / d['total'] * 100, 1)
            d['clean_pct'] = round(d['clean'] / d['total'] * 100, 1)
        result.append(d)

    return result
