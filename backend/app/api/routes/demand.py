from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.schemas import (
    DemandProjectionResponse,
    PeakOilAnalysisResponse,
    ScenarioComparisonResponse
)
from app.services.demand_analyzer import (
    get_demand_projections,
    get_peak_oil_analysis,
    get_scenario_comparison,
    get_available_scenarios
)
from typing import List, Optional

router = APIRouter(prefix="/demand", tags=["Demand"])


@router.get("/projections", response_model=List[DemandProjectionResponse])
async def fetch_demand_projections(
    source_id: Optional[str] = Query(None, description="Filtrer par source (iea, eia, opec)"),
    scenario: Optional[str] = Query(None, description="Filtrer par scénario"),
    year_start: int = Query(2024, ge=2024, le=2100),
    year_end: int = Query(2050, ge=2024, le=2100),
    db: Session = Depends(get_db)
):
    """
    Récupère les projections de demande pétrolière
    
    - **source_id**: Filtrer par source (optionnel)
    - **scenario**: Filtrer par scénario (optionnel)
    - **year_start**: Année de début
    - **year_end**: Année de fin
    """
    return get_demand_projections(db, source_id, scenario, year_start, year_end)


@router.get("/peak-analysis", response_model=List[PeakOilAnalysisResponse])
async def fetch_peak_oil_analysis(db: Session = Depends(get_db)):
    """
    Récupère l'analyse des peaks de demande par source et scénario
    
    Indique pour chaque scénario :
    - Si un peak est détecté
    - L'année du peak
    - La valeur au peak
    - Le taux de déclin post-peak
    """
    return get_peak_oil_analysis(db)


@router.get("/comparison/{year}", response_model=ScenarioComparisonResponse)
async def fetch_scenario_comparison(
    year: int,
    db: Session = Depends(get_db)
):
    """
    Compare tous les scénarios pour une année donnée
    
    - **year**: Année à analyser
    
    Retourne la divergence entre scénarios et les flags associés
    """
    return get_scenario_comparison(db, year)


@router.get("/scenarios")
async def fetch_available_scenarios(db: Session = Depends(get_db)):
    """
    Liste tous les scénarios disponibles par source
    """
    return get_available_scenarios(db)
