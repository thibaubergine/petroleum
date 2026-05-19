"""
Routes API — Marché : snapshots, événements, prix pompe
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional, List
from datetime import date, timedelta
from app.database.connection import get_db
from app.database.models import MarketEvent, MarketSnapshot, GasolinePrices

router = APIRouter()


# ─── SNAPSHOTS ────────────────────────────────────────────────────────────────

@router.get("/market/snapshots")
def get_snapshots(
    limit: int = Query(52, description="Nombre de semaines"),
    db: Session = Depends(get_db)
):
    """Historique des snapshots hebdomadaires"""
    snapshots = db.query(MarketSnapshot)\
        .order_by(desc(MarketSnapshot.week_start))\
        .limit(limit).all()

    return [
        {
            "week_start": str(s.week_start),
            "brent_price": float(s.brent_price) if s.brent_price else None,
            "wti_price": float(s.wti_price) if s.wti_price else None,
            "brent_change_1w": float(s.brent_change_1w) if s.brent_change_1w else None,
            "gasoline_usa": float(s.gasoline_usa) if s.gasoline_usa else None,
            "gasoline_eu_avg": float(s.gasoline_eu_avg) if s.gasoline_eu_avg else None,
            "baltic_dry_index": float(s.baltic_dry_index) if s.baltic_dry_index else None,
            "usd_index": float(s.usd_index) if s.usd_index else None,
            "regional_prices": s.regional_prices or {},
            "macro_indicators": s.macro_indicators or {},
            "ai_summary": s.ai_summary,
            "ai_key_events": s.ai_key_events or [],
        }
        for s in snapshots
    ]


@router.get("/market/latest")
def get_latest_snapshot(db: Session = Depends(get_db)):
    """Dernier snapshot disponible"""
    s = db.query(MarketSnapshot)\
        .order_by(desc(MarketSnapshot.week_start))\
        .first()

    if not s:
        return {"error": "Aucun snapshot disponible — lancer weekly_market_update.py"}

    return {
        "week_start": str(s.week_start),
        "brent_price": float(s.brent_price) if s.brent_price else None,
        "wti_price": float(s.wti_price) if s.wti_price else None,
        "brent_change_1w": float(s.brent_change_1w) if s.brent_change_1w else None,
        "gasoline_usa": float(s.gasoline_usa) if s.gasoline_usa else None,
        "gasoline_eu_avg": float(s.gasoline_eu_avg) if s.gasoline_eu_avg else None,
        "baltic_dry_index": float(s.baltic_dry_index) if s.baltic_dry_index else None,
        "usd_index": float(s.usd_index) if s.usd_index else None,
        "regional_prices": s.regional_prices or {},
        "macro_indicators": s.macro_indicators or {},
        "ai_summary": s.ai_summary,
        "ai_key_events": s.ai_key_events or [],
        "sources_fetched": s.sources_fetched or [],
        "created_at": s.created_at.isoformat() if s.created_at else None,
    }


@router.get("/market/price-history")
def get_price_history(
    weeks: int = Query(26, description="Nombre de semaines"),
    db: Session = Depends(get_db)
):
    """Historique des prix Brent/WTI sur N semaines pour graphique"""
    snapshots = db.query(MarketSnapshot)\
        .filter(MarketSnapshot.brent_price.isnot(None))\
        .order_by(MarketSnapshot.week_start)\
        .limit(weeks).all()

    return [
        {
            "week": str(s.week_start),
            "brent": float(s.brent_price) if s.brent_price else None,
            "wti": float(s.wti_price) if s.wti_price else None,
            "change_1w": float(s.brent_change_1w) if s.brent_change_1w else None,
            "bdi": float(s.baltic_dry_index) if s.baltic_dry_index else None,
        }
        for s in snapshots
    ]


# ─── ÉVÉNEMENTS ───────────────────────────────────────────────────────────────

@router.get("/market/events")
def get_events(
    limit: int = Query(50),
    event_type: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    impact: Optional[str] = Query(None),
    since_weeks: int = Query(12),
    db: Session = Depends(get_db)
):
    """Événements marché avec filtres"""
    since = date.today() - timedelta(weeks=since_weeks)

    q = db.query(MarketEvent)\
        .filter(MarketEvent.event_date >= since)

    if event_type:
        q = q.filter(MarketEvent.event_type == event_type)
    if region:
        q = q.filter(MarketEvent.region == region)
    if impact:
        q = q.filter(MarketEvent.impact == impact)

    events = q.order_by(desc(MarketEvent.event_date)).limit(limit).all()

    return [
        {
            "id": e.id,
            "event_date": str(e.event_date),
            "week_start": str(e.week_start),
            "title": e.title,
            "summary": e.summary,
            "event_type": e.event_type,
            "region": e.region,
            "impact": e.impact,
            "impact_direction": e.impact_direction,
            "estimated_price_impact": float(e.estimated_price_impact) if e.estimated_price_impact else 0,
            "sources": e.sources or [],
        }
        for e in events
    ]


@router.get("/market/events/timeline")
def get_events_timeline(
    weeks: int = Query(26),
    db: Session = Depends(get_db)
):
    """Événements groupés par semaine pour timeline"""
    since = date.today() - timedelta(weeks=weeks)

    events = db.query(MarketEvent)\
        .filter(MarketEvent.event_date >= since)\
        .order_by(MarketEvent.week_start, MarketEvent.event_date)\
        .all()

    # Grouper par semaine
    by_week: dict = {}
    for e in events:
        wk = str(e.week_start)
        if wk not in by_week:
            by_week[wk] = []
        by_week[wk].append({
            "date": str(e.event_date),
            "title": e.title,
            "type": e.event_type,
            "region": e.region,
            "impact": e.impact,
            "direction": e.impact_direction,
            "price_impact": float(e.estimated_price_impact) if e.estimated_price_impact else 0,
        })

    return [{"week": wk, "events": evs} for wk, evs in sorted(by_week.items())]


# ─── PRIX POMPE ───────────────────────────────────────────────────────────────

@router.get("/market/gasoline")
def get_gasoline_prices(
    region: Optional[str] = Query(None),
    limit_weeks: int = Query(26),
    db: Session = Depends(get_db)
):
    """Prix à la pompe par pays/région"""
    since = date.today() - timedelta(weeks=limit_weeks)

    q = db.query(GasolinePrices)\
        .filter(GasolinePrices.date >= since)

    if region:
        q = q.filter(GasolinePrices.region == region)

    rows = q.order_by(desc(GasolinePrices.date)).limit(200).all()

    return [
        {
            "date": str(r.date),
            "country_code": r.country_code,
            "country_name": r.country_name,
            "region": r.region,
            "gasoline_usd": float(r.gasoline_price_usd) if r.gasoline_price_usd else None,
            "diesel_usd": float(r.diesel_price_usd) if r.diesel_price_usd else None,
        }
        for r in rows
    ]


@router.get("/market/gasoline/latest-by-country")
def get_gasoline_latest(db: Session = Depends(get_db)):
    """Dernier prix pompe disponible par pays"""
    # Subquery pour date max par pays
    subq = db.query(
        GasolinePrices.country_code,
        func.max(GasolinePrices.date).label('max_date')
    ).group_by(GasolinePrices.country_code).subquery()

    rows = db.query(GasolinePrices).join(
        subq,
        (GasolinePrices.country_code == subq.c.country_code) &
        (GasolinePrices.date == subq.c.max_date)
    ).all()

    return [
        {
            "country_code": r.country_code,
            "country_name": r.country_name,
            "region": r.region,
            "date": str(r.date),
            "gasoline_usd": float(r.gasoline_price_usd) if r.gasoline_price_usd else None,
            "diesel_usd": float(r.diesel_price_usd) if r.diesel_price_usd else None,
        }
        for r in rows
    ]
