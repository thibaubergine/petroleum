"""
Routes API pour événements géopolitiques
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import GeopoliticalEvent
from app.database.schemas import GeopoliticalEventResponse
from typing import List, Optional
from datetime import datetime

router = APIRouter(prefix="/events", tags=["events"])


@router.get("/", response_model=List[GeopoliticalEventResponse])
def get_events(
    country_code: Optional[str] = Query(None),
    event_type: Optional[str] = Query(None, description="war, sanctions, discovery, accident, policy"),
    min_severity: Optional[int] = Query(None, description="1-5"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Récupérer événements géopolitiques
    
    Exemples:
    - /events?country_code=IRN
    - /events?event_type=sanctions
    - /events?min_severity=4
    - /events?start_date=2000-01-01&end_date=2024-01-01
    """
    query = db.query(GeopoliticalEvent)
    
    if country_code:
        query = query.filter(GeopoliticalEvent.country_code == country_code)
    
    if event_type:
        query = query.filter(GeopoliticalEvent.event_type == event_type)
    
    if min_severity:
        query = query.filter(GeopoliticalEvent.severity >= min_severity)
    
    if start_date:
        query = query.filter(GeopoliticalEvent.event_date >= datetime.strptime(start_date, "%Y-%m-%d").date())
    
    if end_date:
        query = query.filter(GeopoliticalEvent.event_date <= datetime.strptime(end_date, "%Y-%m-%d").date())
    
    results = query.order_by(GeopoliticalEvent.event_date.desc()).all()
    
    return [
        GeopoliticalEventResponse(
            country_code=r.country_code,
            event_date=str(r.event_date),
            event_type=r.event_type,
            event_name=r.event_name,
            impact_estimated=float(r.impact_estimated) if r.impact_estimated else None,
            duration_days=r.duration_days,
            severity=r.severity,
            description=r.description,
            sources=r.sources
        )
        for r in results
    ]


@router.get("/timeline", response_model=List[dict])
def get_timeline(
    start_year: int = Query(1970),
    end_year: int = Query(2024),
    db: Session = Depends(get_db)
):
    """
    Timeline d'événements pour visualisation
    
    Exemple: /events/timeline?start_year=2000
    """
    from sqlalchemy import extract
    
    results = db.query(GeopoliticalEvent).filter(
        extract('year', GeopoliticalEvent.event_date) >= start_year,
        extract('year', GeopoliticalEvent.event_date) <= end_year
    ).order_by(GeopoliticalEvent.event_date).all()
    
    return [
        {
            "date": str(r.event_date),
            "year": r.event_date.year,
            "country": r.country_code,
            "type": r.event_type,
            "name": r.event_name,
            "impact": float(r.impact_estimated) if r.impact_estimated else 0,
            "severity": r.severity,
            "description": r.description[:100] + "..." if r.description and len(r.description) > 100 else r.description
        }
        for r in results
    ]


@router.get("/by-type", response_model=List[dict])
def get_by_type(db: Session = Depends(get_db)):
    """
    Statistiques par type d'événement
    """
    from sqlalchemy import func
    
    results = db.query(
        GeopoliticalEvent.event_type,
        func.count(GeopoliticalEvent.id).label('count'),
        func.avg(GeopoliticalEvent.severity).label('avg_severity'),
        func.sum(GeopoliticalEvent.impact_estimated).label('total_impact')
    ).group_by(GeopoliticalEvent.event_type).all()
    
    return [
        {
            "event_type": r.event_type,
            "count": r.count,
            "avg_severity": round(float(r.avg_severity), 2) if r.avg_severity else 0,
            "total_impact": round(float(r.total_impact), 2) if r.total_impact else 0
        }
        for r in results
    ]


@router.get("/major-impacts", response_model=List[dict])
def get_major_impacts(
    min_impact: float = Query(1.0, description="Impact minimum en mb/d"),
    db: Session = Depends(get_db)
):
    """
    Événements à fort impact (> X mb/d)
    
    Exemple: /events/major-impacts?min_impact=2.0
    """
    results = db.query(GeopoliticalEvent).filter(
        GeopoliticalEvent.impact_estimated != None,
        func.abs(GeopoliticalEvent.impact_estimated) >= min_impact
    ).order_by(func.abs(GeopoliticalEvent.impact_estimated).desc()).all()
    
    from sqlalchemy import func
    
    return [
        {
            "date": str(r.event_date),
            "country": r.country_code,
            "event": r.event_name,
            "type": r.event_type,
            "impact_mbd": float(r.impact_estimated),
            "severity": r.severity,
            "duration_days": r.duration_days,
            "description": r.description
        }
        for r in results
    ]


@router.get("/sanctions", response_model=List[dict])
def get_sanctions_history(db: Session = Depends(get_db)):
    """
    Historique des sanctions pétrolières
    """
    results = db.query(GeopoliticalEvent).filter(
        GeopoliticalEvent.event_type == 'sanctions'
    ).order_by(GeopoliticalEvent.event_date).all()
    
    return [
        {
            "date": str(r.event_date),
            "country": r.country_code,
            "name": r.event_name,
            "impact_mbd": float(r.impact_estimated) if r.impact_estimated else 0,
            "duration_days": r.duration_days,
            "status": "ongoing" if r.duration_days is None else "ended",
            "description": r.description
        }
        for r in results
    ]


@router.get("/discoveries", response_model=List[dict])
def get_major_discoveries(db: Session = Depends(get_db)):
    """
    Découvertes majeures
    """
    results = db.query(GeopoliticalEvent).filter(
        GeopoliticalEvent.event_type == 'discovery'
    ).order_by(GeopoliticalEvent.event_date).all()
    
    return [
        {
            "date": str(r.event_date),
            "country": r.country_code,
            "field": r.event_name,
            "potential_impact_mbd": float(r.impact_estimated) if r.impact_estimated else 0,
            "description": r.description
        }
        for r in results
    ]


@router.get("/wars", response_model=List[dict])
def get_war_impacts(db: Session = Depends(get_db)):
    """
    Impact des guerres sur production
    """
    results = db.query(GeopoliticalEvent).filter(
        GeopoliticalEvent.event_type == 'war'
    ).order_by(GeopoliticalEvent.severity.desc()).all()
    
    return [
        {
            "date": str(r.event_date),
            "country": r.country_code,
            "conflict": r.event_name,
            "impact_mbd": float(r.impact_estimated) if r.impact_estimated else 0,
            "duration_days": r.duration_days,
            "severity": r.severity,
            "description": r.description
        }
        for r in results
    ]
