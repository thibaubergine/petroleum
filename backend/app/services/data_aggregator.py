from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.database.models import ProductionRange, AutomatedFlag, HarmonizedProduction, SourceCredibility
from app.database.schemas import ProductionRangeResponse, SourceComparisonResponse
from typing import List


def get_production_ranges(
    db: Session,
    country: str,
    year_start: int,
    year_end: int
) -> List[ProductionRangeResponse]:
    """
    Récupère les ranges de production pour un pays sur une période
    """
    ranges = db.query(ProductionRange).filter(
        and_(
            ProductionRange.country_code == country,
            ProductionRange.year >= year_start,
            ProductionRange.year <= year_end
        )
    ).order_by(ProductionRange.year).all()
    
    # Enrichir avec les flags
    results = []
    for range_obj in ranges:
        flags = db.query(AutomatedFlag).filter(
            and_(
                AutomatedFlag.country_code == country,
                AutomatedFlag.year == range_obj.year
            )
        ).all()
        
        flag_descriptions = [
            f"{flag.flag_type}: {flag.flag_reason}" 
            for flag in flags
        ]
        
        results.append(ProductionRangeResponse(
            country_code=range_obj.country_code,
            year=range_obj.year,
            low=float(range_obj.low),
            central=float(range_obj.central),
            high=float(range_obj.high),
            amplitude_percent=float(range_obj.amplitude_percent),
            sources_used=range_obj.sources_used or [],
            credibility_weighted=range_obj.credibility_weighted,
            flags=flag_descriptions
        ))
    
    return results


def get_source_comparison(
    db: Session,
    country: str,
    year: int
) -> List[SourceComparisonResponse]:
    """
    Compare les valeurs de toutes les sources pour un pays/année donné
    """
    # Récupérer les données harmonisées
    harmonized = db.query(HarmonizedProduction).filter(
        and_(
            HarmonizedProduction.country_code == country,
            HarmonizedProduction.year == year
        )
    ).all()
    
    # Récupérer les scores de crédibilité
    credibility_map = {}
    sources = db.query(SourceCredibility).all()
    for source in sources:
        credibility_map[source.source_id] = float(source.overall_score)
    
    # Construire la comparaison
    results = []
    for data in harmonized:
        results.append(SourceComparisonResponse(
            source_id=data.source_id,
            value=float(data.value),
            unit=data.unit,
            credibility_score=credibility_map.get(data.source_id, 0.5),
            metric_type="all_liquids"  # Simplifié pour le prototype
        ))
    
    return results


def get_available_countries(db: Session) -> List[dict]:
    """
    Liste des pays avec années disponibles
    """
    # Récupérer tous les pays uniques
    countries = db.query(ProductionRange.country_code).distinct().all()
    
    results = []
    country_names = {
        'SAU': 'Saudi Arabia',
        'USA': 'United States',
        'RUS': 'Russia',
        'IRQ': 'Iraq',
        'CAN': 'Canada'
    }
    
    for country_tuple in countries:
        country_code = country_tuple[0]
        
        # Récupérer les années disponibles
        years = db.query(ProductionRange.year).filter(
            ProductionRange.country_code == country_code
        ).distinct().order_by(ProductionRange.year).all()
        
        results.append({
            'code': country_code,
            'name': country_names.get(country_code, country_code),
            'available_years': [y[0] for y in years]
        })
    
    return results
