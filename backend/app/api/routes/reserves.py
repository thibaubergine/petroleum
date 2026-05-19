from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.schemas import (
    ReserveResponse,
    ReserveFlagResponse,
    CountryReservesSummary,
    ReservesByTypeResponse
)
from app.services.reserves_analyzer import (
    get_all_reserves,
    get_reserve_flags,
    get_world_map_data,
    get_top_countries,
    get_reserves_by_type
)
from typing import List, Optional

router = APIRouter(prefix="/reserves", tags=["Reserves"])


@router.get("/all", response_model=List[ReserveResponse])
async def fetch_all_reserves(
    year: Optional[int] = Query(None, description="Filtrer par année"),
    country_code: Optional[str] = Query(None, description="Filtrer par pays (ISO alpha-3)"),
    db: Session = Depends(get_db)
):
    """
    Récupère toutes les réserves avec filtres optionnels
    
    - **year**: Année (optionnel)
    - **country_code**: Code pays ISO alpha-3 (optionnel)
    """
    return get_all_reserves(db, year, country_code)


@router.get("/flags", response_model=List[ReserveFlagResponse])
async def fetch_reserve_flags(
    country_code: Optional[str] = Query(None, description="Filtrer par pays"),
    db: Session = Depends(get_db)
):
    """
    Récupère les flags d'anomalie sur les réserves
    
    Types de flags :
    - **red**: Manipulation avérée (OPEC 1980s)
    - **orange**: Non-audité, source unique
    - **blue**: Divergence définitionnelle (1P vs 2P)
    - **purple**: Écart claimed vs recoverable
    """
    return get_reserve_flags(db, country_code)


@router.get("/map", response_model=List[CountryReservesSummary])
async def fetch_world_map_data(
    year: int = Query(2023, description="Année des données"),
    db: Session = Depends(get_db)
):
    """
    Récupère les données pour la carte du monde
    
    Retourne pour chaque pays :
    - Réserves prouvées (1P)
    - Statut OPEC
    - Flags associés
    - Coordonnées géographiques
    """
    return get_world_map_data(db, year)


@router.get("/top", response_model=List[ReserveResponse])
async def fetch_top_countries(
    year: int = Query(2023, ge=1980, le=2050),
    limit: int = Query(15, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Récupère le top N des pays par réserves prouvées
    
    - **year**: Année des données
    - **limit**: Nombre de pays à retourner
    """
    return get_top_countries(db, year, limit)


@router.get("/by-type", response_model=List[ReservesByTypeResponse])
async def fetch_reserves_by_type(
    year: int = Query(2023, ge=1980, le=2050),
    db: Session = Depends(get_db)
):
    """
    Agrège les réserves par type d'hydrocarbure
    
    Types :
    - conventional: Pétrole conventionnel (API >25°)
    - oil_sands: Sables bitumineux (API <10°)
    - extra_heavy: Pétrole extra-lourd (API 10-20°)
    - shale: Pétrole de schiste
    - offshore: Offshore (deep/ultra-deep)
    """
    return get_reserves_by_type(db, year)
