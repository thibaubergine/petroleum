"""
Import Oil Prices - Historical Data 1960-2024
Brent, WTI, Dubai benchmarks
Nominal + Real (2023-adjusted)
"""

import sys
sys.path.append('/app')

from sqlalchemy.orm import Session
from app.database.connection import SessionLocal
from app.database.models import OilPrice
from datetime import date

# Prix annuels moyens (USD/barrel)
# Source: World Bank Commodity Markets, BP Statistical Review, FRED
# Format: {year: {'brent': nominal, 'wti': nominal, 'dubai': nominal}}

HISTORICAL_PRICES = {
    # 1960s
    1960: {'brent': 1.80, 'wti': 2.88, 'dubai': 1.80},
    1965: {'brent': 1.80, 'wti': 2.86, 'dubai': 1.80},
    1970: {'brent': 1.80, 'wti': 3.18, 'dubai': 1.80},
    
    # 1970s - First Oil Shock
    1973: {'brent': 3.29, 'wti': 3.89, 'dubai': 3.29},
    1974: {'brent': 11.58, 'wti': 6.87, 'dubai': 11.58},
    1975: {'brent': 11.53, 'wti': 7.67, 'dubai': 11.53},
    1976: {'brent': 12.80, 'wti': 8.19, 'dubai': 12.80},
    1977: {'brent': 13.92, 'wti': 8.57, 'dubai': 13.92},
    1978: {'brent': 14.02, 'wti': 9.00, 'dubai': 14.02},
    
    # Iranian Revolution
    1979: {'brent': 31.61, 'wti': 12.64, 'dubai': 29.19},
    1980: {'brent': 36.83, 'wti': 21.59, 'dubai': 35.69},
    
    # 1980s
    1981: {'brent': 35.93, 'wti': 31.77, 'dubai': 34.50},
    1982: {'brent': 32.97, 'wti': 28.52, 'dubai': 31.80},
    1983: {'brent': 29.55, 'wti': 26.19, 'dubai': 28.78},
    1984: {'brent': 28.78, 'wti': 25.88, 'dubai': 28.06},
    1985: {'brent': 27.56, 'wti': 24.09, 'dubai': 27.53},
    
    # Counter-shock
    1986: {'brent': 14.43, 'wti': 12.51, 'dubai': 13.53},
    1987: {'brent': 18.44, 'wti': 15.40, 'dubai': 17.73},
    1988: {'brent': 14.92, 'wti': 12.58, 'dubai': 13.17},
    1989: {'brent': 18.23, 'wti': 15.86, 'dubai': 16.91},
    
    # 1990s
    1990: {'brent': 23.73, 'wti': 20.03, 'dubai': 22.26},
    1991: {'brent': 20.00, 'wti': 16.54, 'dubai': 18.62},
    1992: {'brent': 19.32, 'wti': 15.99, 'dubai': 18.04},
    1993: {'brent': 16.97, 'wti': 14.25, 'dubai': 15.47},
    1994: {'brent': 15.82, 'wti': 13.19, 'dubai': 14.74},
    1995: {'brent': 17.02, 'wti': 14.62, 'dubai': 16.10},
    1996: {'brent': 20.67, 'wti': 18.46, 'dubai': 19.32},
    1997: {'brent': 19.09, 'wti': 17.23, 'dubai': 18.23},
    1998: {'brent': 12.72, 'wti': 10.87, 'dubai': 12.21},
    1999: {'brent': 17.97, 'wti': 15.56, 'dubai': 17.25},
    
    # 2000s - Price boom
    2000: {'brent': 28.50, 'wti': 27.39, 'dubai': 26.20},
    2001: {'brent': 24.44, 'wti': 21.84, 'dubai': 22.81},
    2002: {'brent': 25.02, 'wti': 22.81, 'dubai': 24.36},
    2003: {'brent': 28.83, 'wti': 27.69, 'dubai': 26.78},
    2004: {'brent': 38.27, 'wti': 37.66, 'dubai': 33.64},
    2005: {'brent': 54.52, 'wti': 50.04, 'dubai': 49.35},
    2006: {'brent': 65.14, 'wti': 58.30, 'dubai': 61.50},
    2007: {'brent': 72.39, 'wti': 64.20, 'dubai': 68.19},
    
    # 2008 Peak
    2008: {'brent': 97.26, 'wti': 91.48, 'dubai': 94.34},
    2009: {'brent': 61.67, 'wti': 53.48, 'dubai': 61.74},
    
    # 2010s
    2010: {'brent': 79.50, 'wti': 71.21, 'dubai': 78.06},
    2011: {'brent': 111.26, 'wti': 87.04, 'dubai': 106.18},
    2012: {'brent': 111.67, 'wti': 88.00, 'dubai': 109.08},
    2013: {'brent': 108.66, 'wti': 91.17, 'dubai': 105.47},
    2014: {'brent': 98.95, 'wti': 85.60, 'dubai': 96.26},
    
    # Price Collapse
    2015: {'brent': 52.39, 'wti': 43.29, 'dubai': 51.23},
    2016: {'brent': 43.73, 'wti': 36.34, 'dubai': 41.19},
    2017: {'brent': 54.19, 'wti': 45.77, 'dubai': 53.13},
    2018: {'brent': 71.34, 'wti': 57.33, 'dubai': 69.51},
    2019: {'brent': 64.21, 'wti': 50.83, 'dubai': 63.43},
    
    # COVID Crash
    2020: {'brent': 43.21, 'wti': 37.22, 'dubai': 42.34},
    
    # Recovery
    2021: {'brent': 70.68, 'wti': 65.69, 'dubai': 69.17},
    2022: {'brent': 101.27, 'wti': 94.29, 'dubai': 99.02},
    2023: {'brent': 82.17, 'wti': 77.62, 'dubai': 80.36},
    2024: {'brent': 79.50, 'wti': 74.20, 'dubai': 78.10}  # Estimated average
}

# Inflation adjustments to 2023 dollars
# CPI-based inflation factors (1960 = 1.00, 2023 = 9.25)
INFLATION_FACTORS = {
    1960: 0.108, 1965: 0.114, 1970: 0.135, 1973: 0.156, 1974: 0.174,
    1975: 0.190, 1976: 0.201, 1977: 0.214, 1978: 0.230, 1979: 0.257,
    1980: 0.291, 1981: 0.321, 1982: 0.341, 1983: 0.352, 1984: 0.367,
    1985: 0.378, 1986: 0.384, 1987: 0.397, 1988: 0.413, 1989: 0.432,
    1990: 0.456, 1991: 0.475, 1992: 0.488, 1993: 0.502, 1994: 0.515,
    1995: 0.529, 1996: 0.545, 1997: 0.557, 1998: 0.565, 1999: 0.578,
    2000: 0.596, 2001: 0.612, 2002: 0.623, 2003: 0.637, 2004: 0.655,
    2005: 0.676, 2006: 0.697, 2007: 0.717, 2008: 0.745, 2009: 0.743,
    2010: 0.760, 2011: 0.784, 2012: 0.803, 2013: 0.817, 2014: 0.833,
    2015: 0.834, 2016: 0.845, 2017: 0.862, 2018: 0.883, 2019: 0.900,
    2020: 0.913, 2021: 0.946, 2022: 1.014, 2023: 1.000, 2024: 0.970
}


def calculate_real_price(nominal_price: float, year: int) -> float:
    """Convert nominal price to 2023 dollars"""
    if year not in INFLATION_FACTORS:
        return nominal_price
    
    # Real price = Nominal / Inflation factor
    real_price = nominal_price / INFLATION_FACTORS[year]
    return round(real_price, 2)


def import_oil_prices():
    """Import historical oil prices"""
    db = SessionLocal()
    
    try:
        print("🔄 Importing historical oil prices...")
        print(f"📊 Years: {min(HISTORICAL_PRICES.keys())}-{max(HISTORICAL_PRICES.keys())}")
        print(f"📈 Benchmarks: Brent, WTI, Dubai")
        
        total_records = 0
        
        for year, prices in HISTORICAL_PRICES.items():
            year_date = date(year, 12, 31)  # End of year
            
            for benchmark, nominal_price in prices.items():
                real_price = calculate_real_price(nominal_price, year)
                
                # Check if exists
                existing = db.query(OilPrice).filter(
                    OilPrice.date == year_date,
                    OilPrice.benchmark == benchmark
                ).first()
                
                if existing:
                    # Update
                    existing.price_nominal = nominal_price
                    existing.price_real_2023 = real_price
                else:
                    # Insert
                    record = OilPrice(
                        date=year_date,
                        benchmark=benchmark,
                        price_nominal=nominal_price,
                        price_real_2023=real_price,
                        currency='USD',
                        unit='usd_per_barrel',
                        source='world_bank_bp_fred'
                    )
                    db.add(record)
                
                total_records += 1
        
        db.commit()
        
        print(f"\n✅ Successfully imported {total_records} price records")
        print(f"📅 Coverage: {min(HISTORICAL_PRICES.keys())}-{max(HISTORICAL_PRICES.keys())} ({len(HISTORICAL_PRICES)} years)")
        print(f"💰 Benchmarks: Brent, WTI, Dubai")
        
        # Key historical moments
        print("\n📌 Key Historical Prices:")
        print(f"  1973 (Pre-Shock): ${HISTORICAL_PRICES[1973]['brent']:.2f}")
        print(f"  1980 (Peak): ${HISTORICAL_PRICES[1980]['brent']:.2f} (${calculate_real_price(HISTORICAL_PRICES[1980]['brent'], 1980):.2f} in 2023$)")
        print(f"  1986 (Counter-shock): ${HISTORICAL_PRICES[1986]['brent']:.2f}")
        print(f"  2008 (Peak): ${HISTORICAL_PRICES[2008]['brent']:.2f} (${calculate_real_price(HISTORICAL_PRICES[2008]['brent'], 2008):.2f} in 2023$)")
        print(f"  2020 (COVID): ${HISTORICAL_PRICES[2020]['brent']:.2f}")
        print(f"  2023 (Current): ${HISTORICAL_PRICES[2023]['brent']:.2f}")
        
        # Highest real price
        highest_real = max(
            (year, calculate_real_price(prices['brent'], year))
            for year, prices in HISTORICAL_PRICES.items()
        )
        print(f"\n🔝 Highest Real Price: {highest_real[0]} (${highest_real[1]:.2f} in 2023$)")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {str(e)}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    import_oil_prices()
