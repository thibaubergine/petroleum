"""
Routes API pour prix du pétrole historique
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import OilPrice
from app.database.schemas import OilPriceResponse
from typing import List, Optional
from datetime import datetime

router = APIRouter(prefix="/prices", tags=["prices"])


@router.get("/", response_model=List[OilPriceResponse])
def get_oil_prices(
    benchmark: Optional[str] = Query(None, description="brent, wti, ou dubai"),
    start_date: Optional[str] = Query(None, description="Date début (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="Date fin (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    """
    Récupérer prix historiques du pétrole
    
    Exemples:
    - /prices?benchmark=brent
    - /prices?start_date=2000-01-01&end_date=2024-01-01
    - /prices?benchmark=wti&start_date=2020-01-01
    """
    query = db.query(OilPrice)
    
    if benchmark:
        query = query.filter(OilPrice.benchmark == benchmark.lower())
    
    if start_date:
        query = query.filter(OilPrice.date >= datetime.strptime(start_date, "%Y-%m-%d").date())
    
    if end_date:
        query = query.filter(OilPrice.date <= datetime.strptime(end_date, "%Y-%m-%d").date())
    
    results = query.order_by(OilPrice.date).all()
    
    return [
        OilPriceResponse(
            date=str(r.date),
            benchmark=r.benchmark,
            price_nominal=float(r.price_nominal),
            price_real_2023=float(r.price_real_2023) if r.price_real_2023 else None,
            currency=r.currency,
            unit=r.unit,
            source=r.source
        )
        for r in results
    ]


@router.get("/comparison", response_model=List[dict])
def compare_benchmarks(
    start_date: str = Query("2000-01-01"),
    end_date: str = Query("2024-01-01"),
    use_real: bool = Query(False, description="Utiliser prix réels ajustés inflation"),
    db: Session = Depends(get_db)
):
    """
    Comparer les trois benchmarks (Brent, WTI, Dubai)
    
    Exemple: /prices/comparison?start_date=2010-01-01&use_real=true
    """
    results = db.query(OilPrice).filter(
        OilPrice.date >= datetime.strptime(start_date, "%Y-%m-%d").date(),
        OilPrice.date <= datetime.strptime(end_date, "%Y-%m-%d").date()
    ).order_by(OilPrice.date).all()
    
    # Organiser par date
    data_by_date = {}
    for r in results:
        date_str = str(r.date)
        if date_str not in data_by_date:
            data_by_date[date_str] = {"date": date_str}
        
        price_value = float(r.price_real_2023 if use_real and r.price_real_2023 else r.price_nominal)
        data_by_date[date_str][r.benchmark] = price_value
    
    return list(data_by_date.values())


@router.get("/events", response_model=List[dict])
def get_price_events(db: Session = Depends(get_db)):
    """
    Événements prix clés (pics, crashs)
    """
    events = [
        {"year": 1973, "event": "Premier choc pétrolier", "price_usd": 11.58, "real_2023": 70.0},
        {"year": 1980, "event": "Deuxième choc (Iran)", "price_usd": 36.83, "real_2023": 135.0},
        {"year": 1986, "event": "Contre-choc (effondrement)", "price_usd": 14.43, "real_2023": 38.0},
        {"year": 1998, "event": "Crise asiatique (min)", "price_usd": 12.72, "real_2023": 22.0},
        {"year": 2008, "event": "Pic historique", "price_usd": 97.26, "real_2023": 135.0},
        {"year": 2016, "event": "Crash shale/OPEC", "price_usd": 43.73, "real_2023": 52.0},
        {"year": 2020, "event": "COVID crash", "price_usd": 43.21, "real_2023": 47.0},
        {"year": 2022, "event": "Guerre Ukraine", "price_usd": 101.24, "real_2023": 105.0},
    ]
    return events


@router.get("/statistics", response_model=dict)
def get_price_statistics(
    benchmark: str = Query("brent"),
    start_year: int = Query(1970),
    end_year: int = Query(2024),
    db: Session = Depends(get_db)
):
    """
    Statistiques prix (moyenne, min, max, volatilité)
    
    Exemple: /prices/statistics?benchmark=brent&start_year=2000
    """
    from sqlalchemy import func
    from datetime import datetime
    
    results = db.query(OilPrice).filter(
        OilPrice.benchmark == benchmark,
        func.extract('year', OilPrice.date) >= start_year,
        func.extract('year', OilPrice.date) <= end_year
    ).all()
    
    if not results:
        return {"error": "Pas de données pour cette période"}
    
    prices = [float(r.price_nominal) for r in results]
    real_prices = [float(r.price_real_2023) for r in results if r.price_real_2023]
    
    import statistics
    
    return {
        "benchmark": benchmark,
        "period": f"{start_year}-{end_year}",
        "nominal": {
            "mean": round(statistics.mean(prices), 2),
            "median": round(statistics.median(prices), 2),
            "min": round(min(prices), 2),
            "max": round(max(prices), 2),
            "std_dev": round(statistics.stdev(prices), 2) if len(prices) > 1 else 0
        },
        "real_2023": {
            "mean": round(statistics.mean(real_prices), 2),
            "median": round(statistics.median(real_prices), 2),
            "min": round(min(real_prices), 2),
            "max": round(max(real_prices), 2),
            "std_dev": round(statistics.stdev(real_prices), 2) if len(real_prices) > 1 else 0
        } if real_prices else None,
        "data_points": len(prices)
    }


@router.get("/inflation-impact", response_model=List[dict])
def get_inflation_impact(
    start_year: int = Query(1970),
    end_year: int = Query(2024),
    db: Session = Depends(get_db)
):
    """
    Comparer prix nominaux vs réels (impact inflation)
    
    Exemple: /prices/inflation-impact?start_year=1980
    """
    from sqlalchemy import func, extract
    
    results = db.query(
        extract('year', OilPrice.date).label('year'),
        OilPrice.benchmark,
        func.avg(OilPrice.price_nominal).label('avg_nominal'),
        func.avg(OilPrice.price_real_2023).label('avg_real')
    ).filter(
        extract('year', OilPrice.date) >= start_year,
        extract('year', OilPrice.date) <= end_year
    ).group_by(
        'year',
        OilPrice.benchmark
    ).order_by('year').all()
    
    # Organiser par année
    data_by_year = {}
    for r in results:
        year = int(r.year)
        if year not in data_by_year:
            data_by_year[year] = {"year": year}
        
        data_by_year[year][f"{r.benchmark}_nominal"] = round(float(r.avg_nominal), 2)
        if r.avg_real:
            data_by_year[year][f"{r.benchmark}_real"] = round(float(r.avg_real), 2)
            # Calcul de l'érosion
            erosion = ((float(r.avg_nominal) - float(r.avg_real)) / float(r.avg_real) * 100) if r.avg_real else 0
            data_by_year[year][f"{r.benchmark}_erosion_pct"] = round(erosion, 1)
    
    return list(data_by_year.values())
