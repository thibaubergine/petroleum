"""
Routes API pour production historique et analytics
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import HistoricalProduction, ProductionAnalytics
from app.database.schemas import HistoricalProductionResponse, ProductionAnalyticsResponse
from typing import List, Optional

router = APIRouter(prefix="/historical", tags=["historical"])


@router.get("/production", response_model=List[HistoricalProductionResponse])
def get_historical_production(
    country_code: Optional[str] = Query(None, description="Code pays (ex: USA, SAU)"),
    start_year: Optional[int] = Query(None, description="Année de début"),
    end_year: Optional[int] = Query(None, description="Année de fin"),
    db: Session = Depends(get_db)
):
    """
    Récupérer production historique 1965-2024
    
    Exemples:
    - /historical/production?country_code=USA
    - /historical/production?country_code=SAU&start_year=2000&end_year=2024
    - /historical/production?start_year=1970&end_year=1980
    """
    query = db.query(HistoricalProduction)
    
    if country_code:
        query = query.filter(HistoricalProduction.country_code == country_code)
    
    if start_year:
        query = query.filter(HistoricalProduction.year >= start_year)
    
    if end_year:
        query = query.filter(HistoricalProduction.year <= end_year)
    
    results = query.order_by(HistoricalProduction.year).all()
    
    return [
        HistoricalProductionResponse(
            country_code=r.country_code,
            country_name=r.country_name,
            year=r.year,
            production_value=float(r.production_value),
            source_id=r.source_id,
            unit=r.unit,
            is_opec_member=r.is_opec_member,
            notes=r.notes
        )
        for r in results
    ]


@router.get("/countries", response_model=List[dict])
def get_available_countries(db: Session = Depends(get_db)):
    """
    Liste des pays disponibles avec période de couverture
    """
    from sqlalchemy import func
    
    results = db.query(
        HistoricalProduction.country_code,
        HistoricalProduction.country_name,
        func.min(HistoricalProduction.year).label('start_year'),
        func.max(HistoricalProduction.year).label('end_year'),
        func.count(HistoricalProduction.year).label('data_points'),
        HistoricalProduction.is_opec_member
    ).group_by(
        HistoricalProduction.country_code,
        HistoricalProduction.country_name,
        HistoricalProduction.is_opec_member
    ).order_by(HistoricalProduction.country_code).all()
    
    return [
        {
            "country_code": r.country_code,
            "country_name": r.country_name,
            "start_year": r.start_year,
            "end_year": r.end_year,
            "data_points": r.data_points,
            "is_opec_member": r.is_opec_member
        }
        for r in results
    ]


@router.get("/analytics", response_model=List[ProductionAnalyticsResponse])
def get_analytics(
    country_code: Optional[str] = Query(None),
    metric_type: Optional[str] = Query(None, description="cagr, peak_year, decline_rate"),
    db: Session = Depends(get_db)
):
    """
    Récupérer métriques analytiques calculées
    
    Exemples:
    - /historical/analytics?country_code=USA
    - /historical/analytics?metric_type=peak_year
    - /historical/analytics?country_code=NOR&metric_type=decline_rate
    """
    query = db.query(ProductionAnalytics)
    
    if country_code:
        query = query.filter(ProductionAnalytics.country_code == country_code)
    
    if metric_type:
        query = query.filter(ProductionAnalytics.metric_type == metric_type)
    
    results = query.all()
    
    return [
        ProductionAnalyticsResponse(
            country_code=r.country_code,
            metric_type=r.metric_type,
            period_start=r.period_start,
            period_end=r.period_end,
            value=float(r.value),
            unit=r.unit,
            confidence=float(r.confidence) if r.confidence else None,
            meta_info=r.meta_info
        )
        for r in results
    ]


@router.get("/comparison", response_model=List[dict])
def compare_countries(
    countries: str = Query(..., description="Codes pays séparés par virgule (ex: USA,SAU,RUS)"),
    start_year: int = Query(2000),
    end_year: int = Query(2024),
    db: Session = Depends(get_db)
):
    """
    Comparer production de plusieurs pays
    
    Exemple: /historical/comparison?countries=USA,SAU,RUS&start_year=2000
    """
    country_list = [c.strip() for c in countries.split(',')]
    
    results = db.query(HistoricalProduction).filter(
        HistoricalProduction.country_code.in_(country_list),
        HistoricalProduction.year >= start_year,
        HistoricalProduction.year <= end_year
    ).order_by(HistoricalProduction.year, HistoricalProduction.country_code).all()
    
    # Organiser par année
    data_by_year = {}
    for r in results:
        if r.year not in data_by_year:
            data_by_year[r.year] = {"year": r.year}
        data_by_year[r.year][r.country_code] = float(r.production_value)
    
    return list(data_by_year.values())


@router.get("/opec-vs-non-opec", response_model=List[dict])
def opec_vs_non_opec(
    start_year: int = Query(1980),
    end_year: int = Query(2024),
    db: Session = Depends(get_db)
):
    """
    Comparer production OPEC vs non-OPEC
    
    Exemple: /historical/opec-vs-non-opec?start_year=1980
    """
    from sqlalchemy import func
    
    results = db.query(
        HistoricalProduction.year,
        HistoricalProduction.is_opec_member,
        func.sum(HistoricalProduction.production_value).label('total_production')
    ).filter(
        HistoricalProduction.year >= start_year,
        HistoricalProduction.year <= end_year
    ).group_by(
        HistoricalProduction.year,
        HistoricalProduction.is_opec_member
    ).order_by(HistoricalProduction.year).all()
    
    # Organiser par année
    data_by_year = {}
    for r in results:
        if r.year not in data_by_year:
            data_by_year[r.year] = {"year": r.year, "opec": 0, "non_opec": 0}
        
        if r.is_opec_member:
            data_by_year[r.year]["opec"] = float(r.total_production)
        else:
            data_by_year[r.year]["non_opec"] = float(r.total_production)
    
    # Calculer parts de marché
    result_list = []
    for year_data in data_by_year.values():
        total = year_data["opec"] + year_data["non_opec"]
        year_data["opec_share"] = round((year_data["opec"] / total * 100), 2) if total > 0 else 0
        year_data["non_opec_share"] = round((year_data["non_opec"] / total * 100), 2) if total > 0 else 0
        result_list.append(year_data)
    
    return result_list
