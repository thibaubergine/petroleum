from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.schemas import (
    ProductionRangeResponse, SourceComparisonResponse,
    ProductionByMethodResponse, EROEIResponse
)
from app.services.data_aggregator import get_production_ranges, get_source_comparison
from app.services.production_analyzer import (
    get_production_by_method,
    get_eroei_evolution,
    get_available_methods
)
from typing import List, Optional

router = APIRouter(prefix="/production", tags=["Production"])


@router.get("/ranges/{country}", response_model=List[ProductionRangeResponse])
async def fetch_production_ranges(
    country: str,
    year_start: int = Query(2000, ge=1900, le=2030),
    year_end: int = Query(2024, ge=1900, le=2030),
    db: Session = Depends(get_db)
):
    """
    Récupère les ranges de production (low/central/high) pour un pays
    
    - **country**: Code pays ISO 3 lettres (ex: SAU, USA, RUS)
    - **year_start**: Année de début
    - **year_end**: Année de fin
    """
    if year_start > year_end:
        raise HTTPException(status_code=400, detail="year_start doit être <= year_end")
    
    results = get_production_ranges(db, country, year_start, year_end)
    
    if not results:
        raise HTTPException(
            status_code=404,
            detail=f"Aucune donnée trouvée pour {country} entre {year_start} et {year_end}"
        )
    
    return results


@router.get("/comparison/{country}/{year}", response_model=List[SourceComparisonResponse])
async def fetch_source_comparison(
    country: str,
    year: int,
    db: Session = Depends(get_db)
):
    """
    Compare les valeurs de toutes les sources pour un pays/année donné
    
    - **country**: Code pays ISO 3 lettres
    - **year**: Année
    """
    results = get_source_comparison(db, country, year)
    
    if not results:
        raise HTTPException(
            status_code=404,
            detail=f"Aucune donnée trouvée pour {country} en {year}"
        )
    
    return results


@router.get("/by-method", response_model=List[ProductionByMethodResponse])
async def fetch_production_by_method(
    country_code: Optional[str] = Query(None, description="Filtrer par pays (ISO 3)"),
    year_start: int = Query(2000, ge=1970, le=2100),
    year_end: int = Query(2024, ge=1970, le=2100),
    db: Session = Depends(get_db)
):
    """
    Récupère la production par méthode d'extraction
    
    Méthodes :
    - conventional: Pétrole conventionnel
    - oil_sands: Sables bitumineux
    - shale: Pétrole de schiste
    - offshore: Offshore
    - eor: Enhanced Oil Recovery
    """
    return get_production_by_method(db, country_code, year_start, year_end)


@router.get("/eroei", response_model=List[EROEIResponse])
async def fetch_eroei_evolution(
    method: Optional[str] = Query(None, description="Filtrer par méthode"),
    year_start: int = Query(1970, ge=1900, le=2100),
    year_end: int = Query(2024, ge=1900, le=2100),
    db: Session = Depends(get_db)
):
    """
    Récupère l'évolution de l'EROEI (Energy Return on Energy Invested)
    
    Le ratio mesure l'énergie produite / énergie nécessaire.
    Déclin continu depuis 1970 dû à l'épuisement des gisements faciles.
    """
    return get_eroei_evolution(db, method, year_start, year_end)


@router.get("/methods")
async def fetch_available_methods(db: Session = Depends(get_db)):
    """
    Liste toutes les méthodes de production disponibles
    """
    return get_available_methods(db)
