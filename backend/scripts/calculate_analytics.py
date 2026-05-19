"""
Calculate Production Analytics
- CAGR (Compound Annual Growth Rate)
- Peak Year Detection
- Decline Rates (Exponential, Hyperbolic, Harmonic)
- Volatility Metrics
"""

import sys
sys.path.append('/app')

from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.connection import SessionLocal
from app.database.models import HistoricalProduction, ProductionAnalytics
import math
from typing import List, Dict, Optional, Tuple


def calculate_cagr(start_value: float, end_value: float, years: int) -> float:
    """
    Calculate Compound Annual Growth Rate
    CAGR = (End Value / Start Value) ^ (1 / Years) - 1
    """
    if start_value <= 0 or end_value <= 0 or years <= 0:
        return 0.0
    
    cagr = (math.pow(end_value / start_value, 1 / years) - 1) * 100
    return round(cagr, 2)


def detect_peak(production_data: List[Tuple[int, float]]) -> Dict:
    """
    Detect peak production year and value
    Returns: {year, value, confidence}
    """
    if not production_data or len(production_data) < 3:
        return {'year': None, 'value': None, 'confidence': 0}
    
    # Sort by year
    sorted_data = sorted(production_data, key=lambda x: x[0])
    
    # Find maximum
    peak_year, peak_value = max(sorted_data, key=lambda x: x[1])
    
    # Confidence based on:
    # - Distance from last year (lower = less confident)
    # - Magnitude of peak vs average
    last_year = sorted_data[-1][0]
    years_since_peak = last_year - peak_year
    
    avg_production = sum(v for _, v in sorted_data) / len(sorted_data)
    peak_ratio = peak_value / avg_production if avg_production > 0 else 1.0
    
    # Confidence calculation
    if years_since_peak == 0:
        confidence = 30  # Peak is current year - uncertain
    elif years_since_peak <= 3:
        confidence = 50  # Recent peak - moderate confidence
    elif years_since_peak <= 10:
        confidence = 75  # Medium-term peak - good confidence
    else:
        confidence = 90  # Long-term peak - high confidence
    
    # Adjust for peak magnitude
    if peak_ratio > 1.5:
        confidence = min(100, confidence + 10)  # Clear peak
    elif peak_ratio < 1.1:
        confidence = max(0, confidence - 20)  # Weak peak
    
    return {
        'year': peak_year,
        'value': round(peak_value, 2),
        'confidence': confidence,
        'years_since_peak': years_since_peak,
        'peak_ratio': round(peak_ratio, 2)
    }


def calculate_decline_rate(production_data: List[Tuple[int, float]], 
                          peak_year: int,
                          decline_type: str = 'exponential') -> Optional[float]:
    """
    Calculate decline rate after peak
    
    Types:
    - exponential: q(t) = q0 * exp(-D*t)
    - hyperbolic: q(t) = q0 / (1 + b*D*t)^(1/b)
    - harmonic: q(t) = q0 / (1 + D*t)
    """
    if not production_data or not peak_year:
        return None
    
    # Get post-peak data
    post_peak = [(y, v) for y, v in production_data if y > peak_year]
    
    if len(post_peak) < 2:
        return None
    
    # Simple exponential decline approximation
    # D ≈ -ln(q_last / q_peak) / years
    peak_value = next((v for y, v in production_data if y == peak_year), None)
    last_year, last_value = post_peak[-1]
    
    if not peak_value or peak_value <= 0 or last_value <= 0:
        return None
    
    years = last_year - peak_year
    
    if decline_type == 'exponential':
        # D = -ln(q/q0) / t
        decline_rate = -math.log(last_value / peak_value) / years * 100
        return round(decline_rate, 2)
    
    return None


def calculate_volatility(production_data: List[Tuple[int, float]]) -> float:
    """
    Calculate volatility (standard deviation of year-to-year changes)
    """
    if len(production_data) < 2:
        return 0.0
    
    sorted_data = sorted(production_data, key=lambda x: x[0])
    
    # Calculate year-to-year percentage changes
    changes = []
    for i in range(1, len(sorted_data)):
        prev_value = sorted_data[i-1][1]
        curr_value = sorted_data[i][1]
        
        if prev_value > 0:
            pct_change = ((curr_value - prev_value) / prev_value) * 100
            changes.append(pct_change)
    
    if not changes:
        return 0.0
    
    # Standard deviation
    mean = sum(changes) / len(changes)
    variance = sum((x - mean) ** 2 for x in changes) / len(changes)
    std_dev = math.sqrt(variance)
    
    return round(std_dev, 2)


def calculate_analytics_for_country(db: Session, country_code: str):
    """Calculate all analytics for a single country"""
    
    # Fetch all historical production
    records = db.query(
        HistoricalProduction.year,
        HistoricalProduction.production_value
    ).filter(
        HistoricalProduction.country_code == country_code,
        HistoricalProduction.source_id == 'bp_statistical_2023'
    ).order_by(HistoricalProduction.year).all()
    
    if not records:
        return
    
    production_data = [(r.year, float(r.production_value)) for r in records]
    
    print(f"  📊 {country_code}: {len(production_data)} years of data")
    
    # 1. CAGR for different periods
    periods = [
        (1965, 1980, '1965_1980'),
        (1980, 2000, '1980_2000'),
        (2000, 2010, '2000_2010'),
        (2010, 2023, '2010_2023'),
        (1965, 2023, 'full_period')
    ]
    
    for start_year, end_year, period_name in periods:
        start_val = next((v for y, v in production_data if y == start_year), None)
        end_val = next((v for y, v in production_data if y == end_year), None)
        
        if start_val and end_val:
            years = end_year - start_year
            cagr = calculate_cagr(start_val, end_val, years)
            
            # Save CAGR
            existing = db.query(ProductionAnalytics).filter(
                ProductionAnalytics.country_code == country_code,
                ProductionAnalytics.metric_type == 'cagr',
                ProductionAnalytics.period_start == start_year,
                ProductionAnalytics.period_end == end_year
            ).first()
            
            if existing:
                existing.value = cagr
            else:
                db.add(ProductionAnalytics(
                    country_code=country_code,
                    metric_type='cagr',
                    period_start=start_year,
                    period_end=end_year,
                    value=cagr,
                    unit='percent_per_year',
                    confidence=90,
                    meta_info={'period': period_name, 'start_value': start_val, 'end_value': end_val}
                ))
    
    # 2. Peak Detection
    peak_info = detect_peak(production_data)
    
    if peak_info['year']:
        existing = db.query(ProductionAnalytics).filter(
            ProductionAnalytics.country_code == country_code,
            ProductionAnalytics.metric_type == 'peak_year'
        ).first()
        
        if existing:
            existing.value = peak_info['year']
            existing.confidence = peak_info['confidence']
            existing.meta_info = peak_info
        else:
            db.add(ProductionAnalytics(
                country_code=country_code,
                metric_type='peak_year',
                value=peak_info['year'],
                unit='year',
                confidence=peak_info['confidence'],
                meta_info=peak_info
            ))
        
        # 3. Decline Rate (if peaked)
        if peak_info['years_since_peak'] >= 3:
            decline_rate = calculate_decline_rate(production_data, peak_info['year'])
            
            if decline_rate:
                existing = db.query(ProductionAnalytics).filter(
                    ProductionAnalytics.country_code == country_code,
                    ProductionAnalytics.metric_type == 'decline_rate_exponential'
                ).first()
                
                if existing:
                    existing.value = decline_rate
                else:
                    db.add(ProductionAnalytics(
                        country_code=country_code,
                        metric_type='decline_rate_exponential',
                        period_start=peak_info['year'],
                        value=decline_rate,
                        unit='percent_per_year',
                        confidence=70,
                        meta_info={'peak_year': peak_info['year'], 'type': 'exponential'}
                    ))
    
    # 4. Volatility
    volatility = calculate_volatility(production_data)
    
    existing = db.query(ProductionAnalytics).filter(
        ProductionAnalytics.country_code == country_code,
        ProductionAnalytics.metric_type == 'volatility'
    ).first()
    
    if existing:
        existing.value = volatility
    else:
        db.add(ProductionAnalytics(
            country_code=country_code,
            metric_type='volatility',
            value=volatility,
            unit='percent_std_dev',
            confidence=85,
            meta_info={'description': 'Year-to-year production volatility'}
        ))


def calculate_all_analytics():
    """Calculate analytics for all countries"""
    db = SessionLocal()
    
    try:
        print("🔄 Calculating production analytics...")
        
        # Get all countries
        countries = db.query(
            HistoricalProduction.country_code,
            HistoricalProduction.country_name
        ).distinct().all()
        
        print(f"📊 Processing {len(countries)} countries")
        
        for country in countries:
            country_code = country.country_code
            country_name = country.country_name
            
            print(f"\n  🌍 {country_name} ({country_code})")
            calculate_analytics_for_country(db, country_code)
        
        db.commit()
        
        print(f"\n✅ Analytics calculated successfully!")
        
        # Summary
        total_metrics = db.query(func.count(ProductionAnalytics.id)).scalar()
        print(f"📈 Total metrics calculated: {total_metrics}")
        
        # Show some examples
        print("\n📌 Example Analytics:")
        
        # USA peak
        usa_peak = db.query(ProductionAnalytics).filter(
            ProductionAnalytics.country_code == 'USA',
            ProductionAnalytics.metric_type == 'peak_year'
        ).first()
        
        if usa_peak:
            print(f"  USA Peak: {int(usa_peak.value)} (confidence: {usa_peak.confidence}%)")
        
        # Saudi CAGR
        sau_cagr = db.query(ProductionAnalytics).filter(
            ProductionAnalytics.country_code == 'SAU',
            ProductionAnalytics.metric_type == 'cagr',
            ProductionAnalytics.period_start == 2010
        ).first()
        
        if sau_cagr:
            print(f"  Saudi Arabia CAGR 2010-2023: {sau_cagr.value:.2f}%/year")
        
        # Norway decline
        nor_decline = db.query(ProductionAnalytics).filter(
            ProductionAnalytics.country_code == 'NOR',
            ProductionAnalytics.metric_type == 'decline_rate_exponential'
        ).first()
        
        if nor_decline:
            print(f"  Norway Decline Rate: {nor_decline.value:.2f}%/year")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {str(e)}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    calculate_all_analytics()
