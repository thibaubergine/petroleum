from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.database.models import DemandProjection, PeakOilAnalysis
from app.database.schemas import (
    DemandProjectionResponse, 
    PeakOilAnalysisResponse,
    ScenarioComparisonResponse
)
from typing import List


def get_demand_projections(
    db: Session,
    source_id: str = None,
    scenario: str = None,
    year_start: int = 2024,
    year_end: int = 2050
) -> List[DemandProjectionResponse]:
    """
    Récupère les projections de demande avec filtres optionnels
    """
    query = db.query(DemandProjection).filter(
        and_(
            DemandProjection.year >= year_start,
            DemandProjection.year <= year_end
        )
    )
    
    if source_id:
        query = query.filter(DemandProjection.source_id == source_id)
    
    if scenario:
        query = query.filter(DemandProjection.scenario == scenario)
    
    projections = query.order_by(DemandProjection.year).all()
    
    return [
        DemandProjectionResponse(
            source_id=p.source_id,
            scenario=p.scenario,
            year=p.year,
            demand_value=float(p.demand_value),
            unit=p.unit
        )
        for p in projections
    ]


def get_peak_oil_analysis(db: Session) -> List[PeakOilAnalysisResponse]:
    """
    Récupère toutes les analyses de peak oil
    """
    peaks = db.query(PeakOilAnalysis).all()
    
    return [
        PeakOilAnalysisResponse(
            source_id=p.source_id,
            scenario=p.scenario,
            peak_year=p.peak_year,
            peak_value=float(p.peak_value) if p.peak_value else None,
            has_peak=p.has_peak,
            decline_rate=float(p.decline_rate) if p.decline_rate else None,
            notes=p.notes
        )
        for p in peaks
    ]


def get_scenario_comparison(
    db: Session,
    year: int
) -> ScenarioComparisonResponse:
    """
    Compare tous les scénarios pour une année donnée
    """
    projections = db.query(DemandProjection).filter(
        DemandProjection.year == year
    ).all()
    
    # Construire le dictionnaire scenario -> valeur
    scenarios_data = {}
    for p in projections:
        key = f"{p.source_id}_{p.scenario}"
        scenarios_data[key] = float(p.demand_value)
    
    # Calculer l'amplitude
    if scenarios_data:
        values = list(scenarios_data.values())
        min_val = min(values)
        max_val = max(values)
        avg_val = sum(values) / len(values)
        amplitude = ((max_val - min_val) / avg_val * 100) if avg_val > 0 else 0
    else:
        amplitude = 0
    
    # Déterminer les flags
    flags = []
    if amplitude > 20:
        flags.append("red: Divergence majeure >20%")
    elif amplitude > 10:
        flags.append("orange: Divergence significative >10%")
    
    return ScenarioComparisonResponse(
        year=year,
        scenarios=scenarios_data,
        amplitude_percent=round(amplitude, 1),
        divergence_flags=flags
    )


def get_available_scenarios(db: Session) -> dict:
    """
    Liste tous les scénarios disponibles par source
    """
    projections = db.query(
        DemandProjection.source_id,
        DemandProjection.scenario
    ).distinct().all()
    
    scenarios_by_source = {}
    for source_id, scenario in projections:
        if source_id not in scenarios_by_source:
            scenarios_by_source[source_id] = []
        if scenario not in scenarios_by_source[source_id]:
            scenarios_by_source[source_id].append(scenario)
    
    return scenarios_by_source
