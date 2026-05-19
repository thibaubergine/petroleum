from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from app.database.models import ProductionByMethod, EROEIData
from app.database.schemas import ProductionByMethodResponse, EROEIResponse
from typing import List, Optional


def get_production_by_method(
    db: Session,
    country_code: Optional[str] = None,
    year_start: int = 2000,
    year_end: int = 2024
) -> List[ProductionByMethodResponse]:
    """
    Récupère la production par méthode d'extraction
    """
    query = db.query(ProductionByMethod).filter(
        and_(
            ProductionByMethod.year >= year_start,
            ProductionByMethod.year <= year_end
        )
    )
    
    if country_code:
        query = query.filter(ProductionByMethod.country_code == country_code)
    
    productions = query.order_by(ProductionByMethod.year, ProductionByMethod.method).all()
    
    return [
        ProductionByMethodResponse(
            country_code=p.country_code,
            year=p.year,
            method=p.method,
            production_value=float(p.production_value),
            unit=p.unit,
            notes=p.notes
        )
        for p in productions
    ]


def get_eroei_evolution(
    db: Session,
    method: Optional[str] = None,
    year_start: int = 1970,
    year_end: int = 2024
) -> List[EROEIResponse]:
    """
    Récupère l'évolution de l'EROEI par méthode
    """
    query = db.query(EROEIData).filter(
        and_(
            EROEIData.year >= year_start,
            EROEIData.year <= year_end
        )
    )
    
    if method:
        query = query.filter(EROEIData.method == method)
    
    eroei_data = query.order_by(EROEIData.year, EROEIData.method).all()
    
    return [
        EROEIResponse(
            method=e.method,
            year=e.year,
            eroei_ratio=float(e.eroei_ratio),
            unit=e.unit,
            source=e.source,
            notes=e.notes
        )
        for e in eroei_data
    ]


def get_available_methods(db: Session) -> dict:
    """
    Liste toutes les méthodes de production disponibles
    """
    methods = db.query(ProductionByMethod.method).distinct().all()
    
    return {
        'methods': [m[0] for m in methods]
    }
