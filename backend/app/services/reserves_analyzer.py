from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from app.database.models import Reserves, ReserveFlag
from app.database.schemas import (
    ReserveResponse,
    ReserveFlagResponse,
    CountryReservesSummary
)
from typing import List, Optional


# Coordonnées géographiques des pays (centroids approximatifs)
COUNTRY_COORDINATES = {
    'VEN': {'lat': 6.42, 'lng': -66.59, 'name': 'Venezuela'},
    'SAU': {'lat': 23.89, 'lng': 45.08, 'name': 'Saudi Arabia'},
    'CAN': {'lat': 56.13, 'lng': -106.35, 'name': 'Canada'},
    'IRN': {'lat': 32.43, 'lng': 53.69, 'name': 'Iran'},
    'IRQ': {'lat': 33.22, 'lng': 43.68, 'name': 'Iraq'},
    'KWT': {'lat': 29.31, 'lng': 47.48, 'name': 'Kuwait'},
    'ARE': {'lat': 23.42, 'lng': 53.85, 'name': 'UAE'},
    'RUS': {'lat': 61.52, 'lng': 105.32, 'name': 'Russia'},
    'LBY': {'lat': 26.34, 'lng': 17.23, 'name': 'Libya'},
    'USA': {'lat': 37.09, 'lng': -95.71, 'name': 'United States'},
    'NGA': {'lat': 9.08, 'lng': 8.68, 'name': 'Nigeria'},
    'KAZ': {'lat': 48.02, 'lng': 66.92, 'name': 'Kazakhstan'},
    'CHN': {'lat': 35.86, 'lng': 104.20, 'name': 'China'},
    'QAT': {'lat': 25.35, 'lng': 51.18, 'name': 'Qatar'},
    'BRA': {'lat': -14.24, 'lng': -51.93, 'name': 'Brazil'},
}


def get_all_reserves(
    db: Session,
    year: Optional[int] = None,
    country_code: Optional[str] = None
) -> List[ReserveResponse]:
    """
    Récupère les réserves avec filtres optionnels
    """
    query = db.query(Reserves)
    
    if year:
        query = query.filter(Reserves.year == year)
    
    if country_code:
        query = query.filter(Reserves.country_code == country_code)
    
    reserves = query.order_by(desc(Reserves.proven_1p)).all()
    
    return [
        ReserveResponse(
            country_code=r.country_code,
            country_name=r.country_name,
            year=r.year,
            source_id=r.source_id,
            reserve_type=r.reserve_type or 'conventional',
            proven_1p=float(r.proven_1p) if r.proven_1p else None,
            probable_2p=float(r.probable_2p) if r.probable_2p else None,
            possible_3p=float(r.possible_3p) if r.possible_3p else None,
            is_audited=r.is_audited,
            is_opec_member=r.is_opec_member,
            unit=r.unit,
            notes=r.notes
        )
        for r in reserves
    ]


def get_reserve_flags(
    db: Session,
    country_code: Optional[str] = None
) -> List[ReserveFlagResponse]:
    """
    Récupère les flags sur les réserves
    """
    query = db.query(ReserveFlag)
    
    if country_code:
        query = query.filter(ReserveFlag.country_code == country_code)
    
    flags = query.order_by(desc(ReserveFlag.severity)).all()
    
    return [
        ReserveFlagResponse(
            country_code=f.country_code,
            year=f.year,
            flag_type=f.flag_type,
            flag_reason=f.flag_reason,
            severity=f.severity,
            details=f.details
        )
        for f in flags
    ]


def get_world_map_data(db: Session, year: int = 2023) -> List[CountryReservesSummary]:
    """
    Récupère les données pour la carte du monde
    Retourne les dernières réserves + flags pour chaque pays
    """
    # Récupérer les dernières réserves par pays
    subquery = (
        db.query(
            Reserves.country_code,
            Reserves.country_name,
            Reserves.year,
            Reserves.proven_1p,
            Reserves.is_opec_member
        )
        .filter(Reserves.year == year)
        .subquery()
    )
    
    reserves = db.query(subquery).all()
    
    result = []
    for r in reserves:
        # Récupérer les flags pour ce pays
        flags = db.query(ReserveFlag).filter(
            ReserveFlag.country_code == r.country_code
        ).all()
        
        flag_responses = [
            ReserveFlagResponse(
                country_code=f.country_code,
                year=f.year,
                flag_type=f.flag_type,
                flag_reason=f.flag_reason,
                severity=f.severity,
                details=f.details
            )
            for f in flags
        ]
        
        # Récupérer les coordonnées
        coords = COUNTRY_COORDINATES.get(r.country_code, {'lat': 0, 'lng': 0, 'name': r.country_name})
        
        result.append(CountryReservesSummary(
            country_code=r.country_code,
            country_name=r.country_name,
            latest_year=r.year,
            proven_1p=float(r.proven_1p) if r.proven_1p else 0,
            is_opec_member=r.is_opec_member,
            flags=flag_responses,
            latitude=coords['lat'],
            longitude=coords['lng']
        ))
    
    # Trier par réserves décroissantes
    result.sort(key=lambda x: x.proven_1p, reverse=True)
    
    return result


def get_top_countries(db: Session, year: int = 2023, limit: int = 15) -> List[ReserveResponse]:
    """
    Récupère le top N des pays par réserves prouvées
    """
    reserves = db.query(Reserves).filter(
        Reserves.year == year
    ).order_by(desc(Reserves.proven_1p)).limit(limit).all()
    
    return [
        ReserveResponse(
            country_code=r.country_code,
            country_name=r.country_name,
            year=r.year,
            source_id=r.source_id,
            reserve_type=r.reserve_type,
            proven_1p=float(r.proven_1p) if r.proven_1p else None,
            probable_2p=float(r.probable_2p) if r.probable_2p else None,
            possible_3p=float(r.possible_3p) if r.possible_3p else None,
            is_audited=r.is_audited,
            is_opec_member=r.is_opec_member,
            unit=r.unit,
            notes=r.notes
        )
        for r in reserves
    ]


def get_reserves_by_type(db: Session, year: int = 2023) -> List[dict]:
    """
    Agrège les réserves par type d'hydrocarbure
    """
    from sqlalchemy import func
    
    # Agréger par type
    results = db.query(
        Reserves.reserve_type,
        func.sum(Reserves.proven_1p).label('total_reserves'),
        func.count(Reserves.country_code).label('countries_count')
    ).filter(
        Reserves.year == year
    ).group_by(
        Reserves.reserve_type
    ).all()
    
    # Calculer le total global
    total_global = sum(r.total_reserves for r in results if r.total_reserves)
    
    # Construire la réponse
    return [
        {
            'reserve_type': r.reserve_type,
            'total_reserves': float(r.total_reserves) if r.total_reserves else 0,
            'percentage': (float(r.total_reserves) / total_global * 100) if total_global > 0 else 0,
            'countries_count': r.countries_count
        }
        for r in results
    ]
