"""
Script de validation complète — tests API + base de données
Usage: docker exec oil-backend python scripts/validate_system.py
"""
import sys
sys.path.append('/app')

import json
from urllib.request import urlopen
from urllib.error import URLError, HTTPError
from sqlalchemy import func
from app.database.connection import SessionLocal
from app.database.models import (
    HistoricalProduction, OilPrice, ProductionAnalytics,
    Reserves, DemandProjection, ProductionByMethod, EROEIData,
    RegionalDemand, HistoricalReserves, SourceCredibility
)

BASE = "http://localhost:8000"

def check(label, count, minimum):
    status = "✅" if count >= minimum else "⚠️ "
    print(f"  {status} {label:<40} {count:>6} / {minimum} min")
    return count >= minimum

def api(endpoint, label):
    try:
        with urlopen(f"{BASE}{endpoint}", timeout=5) as r:
            data = json.loads(r.read())
            n = len(data) if isinstance(data, list) else 1
            print(f"  ✅ {label:<45} {n} résultats")
            return True
    except HTTPError as e:
        print(f"  ❌ {label:<45} HTTP {e.code}")
        return False
    except Exception as e:
        print(f"  ❌ {label:<45} {str(e)[:50]}")
        return False

def main():
    print("\n" + "█" * 70)
    print("  VALIDATION SYSTÈME — OIL DASHBOARD")
    print("█" * 70)

    db = SessionLocal()
    results = []

    # ── 1. BASE DE DONNÉES ──────────────────────────────────────────────────
    print("\n[1/3] TABLES BASE DE DONNÉES\n")
    results += [
        check("Production historique",   db.query(func.count(HistoricalProduction.id)).scalar(),  600),
        check("Prix historiques",         db.query(func.count(OilPrice.id)).scalar(),              150),
        check("Analytics",                db.query(func.count(ProductionAnalytics.id)).scalar(),   150),
        check("Demande régionale",        db.query(func.count(RegionalDemand.id)).scalar(),        150),
        check("Réserves historiques",     db.query(func.count(HistoricalReserves.id)).scalar(),     80),
        check("Projections demande",      db.query(func.count(DemandProjection.id)).scalar(),       50),
        check("Réserves 2023",            db.query(func.count(Reserves.id)).scalar(),              10),
        check("Méthodes extraction",      db.query(func.count(ProductionByMethod.id)).scalar(),    10),
        check("EROEI",                    db.query(func.count(EROEIData.id)).scalar(),             10),
        check("Sources crédibilité",      db.query(func.count(SourceCredibility.source_id)).scalar(), 8),
    ]

    # Quelques stats utiles
    peaks = db.query(ProductionAnalytics).filter(ProductionAnalytics.metric_type == 'peak_year').all()
    if peaks:
        print(f"\n  📌 Peaks détectés ({len(peaks)} pays) :")
        for p in sorted(peaks, key=lambda x: x.value or 0, reverse=True)[:5]:
            print(f"     {p.country_code}: {int(p.value or 0)} (confiance {p.confidence}%)")

    countries = db.query(HistoricalProduction.country_code).distinct().count()
    years = db.query(func.min(HistoricalProduction.year), func.max(HistoricalProduction.year)).first()
    if countries:
        print(f"\n  📍 Couverture historique : {countries} pays | {years[0]}-{years[1]}")

    db.close()

    # ── 2. ENDPOINTS API ────────────────────────────────────────────────────
    print("\n[2/3] ENDPOINTS API\n")
    results += [
        api("/api/historical/production?country_code=USA", "Production USA"),
        api("/api/historical/countries",                   "Liste pays historiques"),
        api("/api/historical/analytics?metric_type=peak_year", "Analytics peak"),
        api("/api/historical/opec-vs-non-opec?start_year=2000", "OPEC vs Non-OPEC"),
        api("/api/prices?benchmark=brent",                 "Prix Brent"),
        api("/api/prices/comparison",                      "Comparaison prix"),
        api("/api/demand/projections",                     "Projections demande"),
        api("/api/demand/peak-analysis",                   "Peak oil"),
        api("/api/demand/regional",                        "Demande régionale"),
        api("/api/reserves/all",                           "Réserves"),
        api("/api/reserves/historical",                    "Réserves historiques"),
        api("/api/production/eroei",                       "EROEI"),
        api("/api/metadata/sources",                       "Sources crédibilité"),
    ]

    # ── 3. RÉSUMÉ ───────────────────────────────────────────────────────────
    passed = sum(results)
    total = len(results)
    pct = (passed / total * 100) if total else 0

    print(f"\n[3/3] RÉSUMÉ\n")
    print(f"  {'─'*50}")
    print(f"  Tests passés : {passed}/{total} ({pct:.0f}%)")
    print(f"  {'─'*50}\n")

    if passed == total:
        print("  ✅ SYSTÈME 100% OPÉRATIONNEL\n")
    elif passed >= total * 0.8:
        print("  ⚠️  SYSTÈME PARTIEL (>80%) — Dashboard fonctionnel\n")
    else:
        print("  ❌ SYSTÈME DÉGRADÉ — Relancer full_init.py\n")
        print("     docker exec oil-backend python full_init.py\n")

    print("█" * 70 + "\n")
    return 0 if passed == total else 1

if __name__ == "__main__":
    exit(main())
