"""
Prix historiques du pétrole (1960-2024)
Source: World Bank Commodity Markets Pink Sheet
Brent, WTI, Dubai - Nominal & Real (2023-adjusted)
"""

OIL_PRICE_DATA = [
    # Pré-chocs (1960-1973)
    {"date": "1970-01-01", "benchmark": "brent", "nominal": 1.80, "real_2023": 13.50},
    {"date": "1970-01-01", "benchmark": "wti", "nominal": 1.80, "real_2023": 13.50},
    
    # Premier choc pétrolier (1973-1974)
    {"date": "1973-01-01", "benchmark": "brent", "nominal": 3.29, "real_2023": 22.00},
    {"date": "1974-01-01", "benchmark": "brent", "nominal": 11.58, "real_2023": 70.00},
    {"date": "1974-01-01", "benchmark": "wti", "nominal": 10.41, "real_2023": 62.80},
    
    # Deuxième choc (1979-1980)
    {"date": "1979-01-01", "benchmark": "brent", "nominal": 31.61, "real_2023": 130.00},
    {"date": "1980-01-01", "benchmark": "brent", "nominal": 36.83, "real_2023": 135.00},
    {"date": "1980-01-01", "benchmark": "wti", "nominal": 37.42, "real_2023": 137.00},
    
    # Années 1980s - Prix élevés
    {"date": "1985-01-01", "benchmark": "brent", "nominal": 27.56, "real_2023": 76.00},
    {"date": "1985-01-01", "benchmark": "wti", "nominal": 26.92, "real_2023": 74.00},
    
    # Contre-choc 1986
    {"date": "1986-01-01", "benchmark": "brent", "nominal": 14.43, "real_2023": 38.00},
    {"date": "1986-01-01", "benchmark": "wti", "nominal": 14.64, "real_2023": 39.00},
    
    # Années 1990s
    {"date": "1990-01-01", "benchmark": "brent", "nominal": 23.73, "real_2023": 54.00},
    {"date": "1990-01-01", "benchmark": "wti", "nominal": 24.50, "real_2023": 56.00},
    
    # Guerre du Golfe
    {"date": "1991-01-01", "benchmark": "brent", "nominal": 20.00, "real_2023": 44.00},
    
    # Prix bas 1998 (crise asiatique)
    {"date": "1998-01-01", "benchmark": "brent", "nominal": 12.72, "real_2023": 22.00},
    {"date": "1998-01-01", "benchmark": "wti", "nominal": 14.42, "real_2023": 25.00},
    {"date": "1998-01-01", "benchmark": "dubai", "nominal": 11.91, "real_2023": 20.50},
    
    # Années 2000s - Montée
    {"date": "2000-01-01", "benchmark": "brent", "nominal": 28.50, "real_2023": 48.00},
    {"date": "2000-01-01", "benchmark": "wti", "nominal": 30.38, "real_2023": 51.00},
    {"date": "2000-01-01", "benchmark": "dubai", "nominal": 26.20, "real_2023": 44.00},
    
    {"date": "2003-01-01", "benchmark": "brent", "nominal": 28.83, "real_2023": 46.00},
    {"date": "2003-01-01", "benchmark": "wti", "nominal": 31.08, "real_2023": 50.00},
    
    {"date": "2005-01-01", "benchmark": "brent", "nominal": 54.52, "real_2023": 82.00},
    {"date": "2005-01-01", "benchmark": "wti", "nominal": 56.64, "real_2023": 85.00},
    {"date": "2005-01-01", "benchmark": "dubai", "nominal": 50.21, "real_2023": 76.00},
    
    # Pic 2008
    {"date": "2008-01-01", "benchmark": "brent", "nominal": 97.26, "real_2023": 135.00},
    {"date": "2008-01-01", "benchmark": "wti", "nominal": 99.67, "real_2023": 138.00},
    {"date": "2008-01-01", "benchmark": "dubai", "nominal": 94.34, "real_2023": 131.00},
    
    # Crise financière
    {"date": "2009-01-01", "benchmark": "brent", "nominal": 61.67, "real_2023": 86.00},
    {"date": "2009-01-01", "benchmark": "wti", "nominal": 61.95, "real_2023": 86.50},
    
    # Reprise 2010-2014
    {"date": "2010-01-01", "benchmark": "brent", "nominal": 79.50, "real_2023": 108.00},
    {"date": "2010-01-01", "benchmark": "wti", "nominal": 79.48, "real_2023": 108.00},
    {"date": "2010-01-01", "benchmark": "dubai", "nominal": 78.06, "real_2023": 106.00},
    
    {"date": "2011-01-01", "benchmark": "brent", "nominal": 111.26, "real_2023": 146.00},
    {"date": "2011-01-01", "benchmark": "wti", "nominal": 95.00, "real_2023": 125.00},
    {"date": "2011-01-01", "benchmark": "dubai", "nominal": 106.18, "real_2023": 140.00},
    
    {"date": "2012-01-01", "benchmark": "brent", "nominal": 111.67, "real_2023": 143.00},
    {"date": "2012-01-01", "benchmark": "wti", "nominal": 94.20, "real_2023": 121.00},
    {"date": "2012-01-01", "benchmark": "dubai", "nominal": 109.08, "real_2023": 140.00},
    
    {"date": "2013-01-01", "benchmark": "brent", "nominal": 108.66, "real_2023": 136.00},
    {"date": "2013-01-01", "benchmark": "wti", "nominal": 97.98, "real_2023": 122.50},
    {"date": "2013-01-01", "benchmark": "dubai", "nominal": 105.50, "real_2023": 132.00},
    
    {"date": "2014-01-01", "benchmark": "brent", "nominal": 99.45, "real_2023": 122.00},
    {"date": "2014-01-01", "benchmark": "wti", "nominal": 93.17, "real_2023": 114.00},
    {"date": "2014-01-01", "benchmark": "dubai", "nominal": 96.65, "real_2023": 118.50},
    
    # Crash 2015-2016
    {"date": "2015-01-01", "benchmark": "brent", "nominal": 52.39, "real_2023": 63.00},
    {"date": "2015-01-01", "benchmark": "wti", "nominal": 48.66, "real_2023": 58.50},
    {"date": "2015-01-01", "benchmark": "dubai", "nominal": 51.23, "real_2023": 62.00},
    
    {"date": "2016-01-01", "benchmark": "brent", "nominal": 43.73, "real_2023": 52.00},
    {"date": "2016-01-01", "benchmark": "wti", "nominal": 43.29, "real_2023": 51.50},
    {"date": "2016-01-01", "benchmark": "dubai", "nominal": 41.20, "real_2023": 49.00},
    
    # Reprise 2017-2019
    {"date": "2017-01-01", "benchmark": "brent", "nominal": 54.19, "real_2023": 63.00},
    {"date": "2017-01-01", "benchmark": "wti", "nominal": 50.85, "real_2023": 59.00},
    {"date": "2017-01-01", "benchmark": "dubai", "nominal": 53.13, "real_2023": 62.00},
    
    {"date": "2018-01-01", "benchmark": "brent", "nominal": 71.31, "real_2023": 81.00},
    {"date": "2018-01-01", "benchmark": "wti", "nominal": 65.23, "real_2023": 74.00},
    {"date": "2018-01-01", "benchmark": "dubai", "nominal": 69.47, "real_2023": 79.00},
    
    {"date": "2019-01-01", "benchmark": "brent", "nominal": 64.21, "real_2023": 71.50},
    {"date": "2019-01-01", "benchmark": "wti", "nominal": 57.03, "real_2023": 63.50},
    {"date": "2019-01-01", "benchmark": "dubai", "nominal": 63.42, "real_2023": 70.50},
    
    # COVID 2020
    {"date": "2020-01-01", "benchmark": "brent", "nominal": 43.21, "real_2023": 47.00},
    {"date": "2020-01-01", "benchmark": "wti", "nominal": 39.57, "real_2023": 43.00},
    {"date": "2020-01-01", "benchmark": "dubai", "nominal": 42.34, "real_2023": 46.00},
    
    # Reprise post-COVID
    {"date": "2021-01-01", "benchmark": "brent", "nominal": 70.68, "real_2023": 74.00},
    {"date": "2021-01-01", "benchmark": "wti", "nominal": 68.14, "real_2023": 71.50},
    {"date": "2021-01-01", "benchmark": "dubai", "nominal": 69.32, "real_2023": 72.50},
    
    # Ukraine war spike 2022
    {"date": "2022-01-01", "benchmark": "brent", "nominal": 101.24, "real_2023": 105.00},
    {"date": "2022-01-01", "benchmark": "wti", "nominal": 94.53, "real_2023": 98.00},
    {"date": "2022-01-01", "benchmark": "dubai", "nominal": 98.71, "real_2023": 102.50},
    
    # 2023
    {"date": "2023-01-01", "benchmark": "brent", "nominal": 82.17, "real_2023": 82.17},
    {"date": "2023-01-01", "benchmark": "wti", "nominal": 78.45, "real_2023": 78.45},
    {"date": "2023-01-01", "benchmark": "dubai", "nominal": 80.34, "real_2023": 80.34},
    
    # 2024 (estimé)
    {"date": "2024-01-01", "benchmark": "brent", "nominal": 85.00, "real_2023": 83.50},
    {"date": "2024-01-01", "benchmark": "wti", "nominal": 80.00, "real_2023": 78.50},
    {"date": "2024-01-01", "benchmark": "dubai", "nominal": 83.00, "real_2023": 81.50},
]
