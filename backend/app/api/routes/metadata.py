from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.schemas import SourceCredibilityResponse
from app.database.models import SourceCredibility
from app.services.data_aggregator import get_available_countries
from typing import List

router = APIRouter(prefix="/metadata", tags=["Metadata"])


@router.get("/countries")
async def fetch_countries(db: Session = Depends(get_db)):
    """
    Liste tous les pays avec leurs années disponibles
    """
    return get_available_countries(db)


@router.get("/sources", response_model=List[SourceCredibilityResponse])
async def fetch_sources(db: Session = Depends(get_db)):
    """
    Liste toutes les sources avec leurs scores de crédibilité
    """
    sources = db.query(SourceCredibility).all()
    return [
        SourceCredibilityResponse(
            source_id=s.source_id,
            transparency_score=float(s.transparency_score),
            verifiability_score=float(s.verifiability_score),
            bias_absence_score=float(s.bias_absence_score),
            overall_score=float(s.overall_score),
            notes=s.notes
        )
        for s in sources
    ]
