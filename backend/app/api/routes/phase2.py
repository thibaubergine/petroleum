"""
Routes API - Demande Regionale et Reserves Historiques
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
from app.database.connection import get_db
from app.database.models import RegionalDemand, HistoricalReserves

router = APIRouter()


# ─── DEMANDE REGIONALE ────────────────────────────────────────────────────────

@router.get("/demand/regional")
def get_regional_demand(
    start_year: int = Query(1965, description="Annee de debut"),
    end_year: int = Query(2023, description="Annee de fin"),
    region_code: Optional[str] = Query(None, description="Code region"),
    db: Session = Depends(get_db)
):
    """Retourne la demande par region sur la periode."""
    q = db.query(RegionalDemand).filter(
        RegionalDemand.year >= start_year,
        RegionalDemand.year <= end_year,
    )
    if region_code:
        q = q.filter(RegionalDemand.region_code == region_code)

    rows = q.order_by(RegionalDemand.year, RegionalDemand.region_code).all()

    return [
        {
            "region_code": r.region_code,
            "region_name": r.region_name,
            "year": r.year,
            "demand_value": float(r.demand_value),
            "unit": r.unit,
        }
        for r in rows
    ]


@router.get("/demand/regional/regions")
def get_region_list(db: Session = Depends(get_db)):
    """Liste des regions disponibles."""
    rows = db.query(
        RegionalDemand.region_code,
        RegionalDemand.region_name,
        func.min(RegionalDemand.year).label("start"),
        func.max(RegionalDemand.year).label("end"),
    ).group_by(RegionalDemand.region_code, RegionalDemand.region_name).all()

    return [
        {"region_code": r.region_code, "region_name": r.region_name,
         "start_year": r.start, "end_year": r.end}
        for r in rows
    ]


# ─── RESERVES HISTORIQUES ─────────────────────────────────────────────────────

@router.get("/reserves/historical")
def get_historical_reserves(
    country_code: Optional[str] = Query(None),
    start_year: int = Query(1980),
    end_year: int = Query(2023),
    db: Session = Depends(get_db)
):
    """Reserves historiques par pays (1P, conventionnel, non-conventionnel)."""
    q = db.query(HistoricalReserves).filter(
        HistoricalReserves.year >= start_year,
        HistoricalReserves.year <= end_year,
    )
    if country_code:
        q = q.filter(HistoricalReserves.country_code == country_code)

    rows = q.order_by(HistoricalReserves.year, HistoricalReserves.country_code).all()

    return [
        {
            "country_code": r.country_code,
            "country_name": r.country_name,
            "year": r.year,
            "proven_1p": float(r.proven_1p) if r.proven_1p else None,
            "crude_conventional": float(r.crude_conventional) if r.crude_conventional else None,
            "non_conventional": float(r.non_conventional) if r.non_conventional else None,
            "is_opec_member": r.is_opec_member,
        }
        for r in rows
    ]


@router.get("/reserves/historical/countries")
def get_reserves_countries(db: Session = Depends(get_db)):
    """Liste des pays avec historique de reserves."""
    rows = db.query(
        HistoricalReserves.country_code,
        HistoricalReserves.country_name,
        func.min(HistoricalReserves.year).label("start"),
        func.max(HistoricalReserves.year).label("end"),
        func.max(HistoricalReserves.proven_1p).label("max_1p"),
        HistoricalReserves.is_opec_member,
    ).group_by(
        HistoricalReserves.country_code,
        HistoricalReserves.country_name,
        HistoricalReserves.is_opec_member,
    ).order_by(func.max(HistoricalReserves.proven_1p).desc()).all()

    return [
        {
            "country_code": r.country_code,
            "country_name": r.country_name,
            "start_year": r.start,
            "end_year": r.end,
            "max_proven_1p": float(r.max_1p) if r.max_1p else 0,
            "is_opec_member": r.is_opec_member,
        }
        for r in rows
    ]
