"""
full_init.py — Script maître d'initialisation complète
Remplace init_db.py + run_complete_import.py + imports régionaux/réserves

Ordre d'exécution :
  1. Création des tables
  2. Données de base (init_db)
  3. Production historique BP (scripts/import_bp_historical.py)
  4. Prix historiques (scripts/import_oil_prices.py)
  5. Analytics (scripts/calculate_analytics.py)
  6. Demande régionale (scripts/import_regional_demand.py)
  7. Réserves historiques (scripts/import_historical_reserves.py)
  8. Rapport final

Usage :
  docker exec oil-backend python full_init.py [--reset]

  --reset : supprime toutes les données avant de réinitialiser
            (utile pour repartir de zéro)
"""

import sys
import time
import traceback
sys.path.append('/app')

from app.database.connection import engine, Base, SessionLocal
from app.database.models import (
    RawProduction, HarmonizedProduction, ProductionRange,
    AutomatedFlag, SourceCredibility, DemandProjection, PeakOilAnalysis,
    Reserves, ReserveFlag, ProductionByMethod, EROEIData,
    HistoricalProduction, OilPrice, ProductionAnalytics,
    GeopoliticalEvent, RegionalDemand, HistoricalReserves,
    EnergyMix, WorldBankMacro,
)
from decimal import Decimal

RESET = '--reset' in sys.argv

# ─────────────────────────────────────────────────────────────────────────────

def header(title: str):
    print(f"\n{'='*70}")
    print(f"  {title}")
    print(f"{'='*70}\n")

def ok(msg: str):
    print(f"  ✅ {msg}")

def warn(msg: str):
    print(f"  ⚠️  {msg}")

def err(msg: str):
    print(f"  ❌ {msg}")

def step(n: int, total: int, name: str):
    print(f"\n[{n}/{total}] {name}...")

# ─────────────────────────────────────────────────────────────────────────────
# ÉTAPE 1 — Création / reset des tables
# ─────────────────────────────────────────────────────────────────────────────

def create_tables():
    header("ÉTAPE 1 — Tables base de données")
    if RESET:
        warn("Mode --reset : suppression des tables existantes")
        Base.metadata.drop_all(bind=engine)
        ok("Tables supprimées")
    Base.metadata.create_all(bind=engine)
    ok("Tables créées (ou vérifiées)")

# ─────────────────────────────────────────────────────────────────────────────
# ÉTAPE 2 — Données de base (init_db)
# ─────────────────────────────────────────────────────────────────────────────

def run_init_db():
    header("ÉTAPE 2 — Données de base")
    try:
        import init_db
        db = SessionLocal()
        try:
            init_db.insert_source_credibility(db)
            init_db.insert_saudi_arabia_data(db)
            init_db.insert_production_ranges(db)
            init_db.insert_flags(db)
            init_db.insert_demand_projections(db)
            init_db.insert_peak_oil_analysis(db)
            init_db.insert_reserves_data(db)
            init_db.insert_reserve_flags(db)
            init_db.insert_production_by_method(db)
            init_db.insert_eroei_data(db)
            ok("Sources (10 sources T×V×A)")
            ok("Production ranges SAU, USA, RUS, CAN")
            ok("Demande projections (8 scénarios)")
            ok("Réserves de base (15 pays)")
            ok("Méthodes extraction (USA, CAN, SAU)")
            ok("EROEI (4 méthodes 1970-2024)")
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()
    except Exception as e:
        err(f"Données de base : {e}")
        traceback.print_exc()
        raise

# ─────────────────────────────────────────────────────────────────────────────
# ÉTAPE 3 — Production historique BP Statistical Review
# ─────────────────────────────────────────────────────────────────────────────

def run_import_bp():
    header("ÉTAPE 3 — Production historique BP (1965-2023)")
    try:
        sys.path.insert(0, '/app/scripts')
        import import_bp_historical
        import_bp_historical.import_bp_data()
        db = SessionLocal()
        count = db.query(HistoricalProduction).count()
        db.close()
        ok(f"Production historique : {count} records")
    except Exception as e:
        err(f"Production historique : {e}")
        traceback.print_exc()
        # Non bloquant — on continue
        warn("Étape ignorée — les autres imports continuent")

# ─────────────────────────────────────────────────────────────────────────────
# ÉTAPE 4 — Prix historiques
# ─────────────────────────────────────────────────────────────────────────────

def run_import_prices():
    header("ÉTAPE 4 — Prix historiques (1960-2024)")
    try:
        import import_oil_prices
        import_oil_prices.import_oil_prices()
        db = SessionLocal()
        count = db.query(OilPrice).count()
        db.close()
        ok(f"Prix historiques : {count} records (Brent/WTI/Dubai)")
    except Exception as e:
        err(f"Prix historiques : {e}")
        traceback.print_exc()
        warn("Étape ignorée")

# ─────────────────────────────────────────────────────────────────────────────
# ÉTAPE 5 — Analytics
# ─────────────────────────────────────────────────────────────────────────────

def run_analytics():
    header("ÉTAPE 5 — Calcul analytics (CAGR, peak, déclin, volatilité)")
    try:
        import calculate_analytics
        calculate_analytics.calculate_all_analytics()
        db = SessionLocal()
        count = db.query(ProductionAnalytics).count()
        db.close()
        ok(f"Analytics calculées : {count} métriques")
    except Exception as e:
        err(f"Analytics : {e}")
        traceback.print_exc()
        warn("Étape ignorée")

# ─────────────────────────────────────────────────────────────────────────────
# ÉTAPE 6 — Demande régionale
# ─────────────────────────────────────────────────────────────────────────────

def run_regional_demand():
    header("ÉTAPE 6 — Demande régionale (1965-2023)")
    try:
        import import_regional_demand
        import_regional_demand.import_regional_demand()
        db = SessionLocal()
        count = db.query(RegionalDemand).count()
        db.close()
        ok(f"Demande régionale : {count} records (8 régions)")
    except Exception as e:
        err(f"Demande régionale : {e}")
        traceback.print_exc()
        warn("Étape ignorée")

# ─────────────────────────────────────────────────────────────────────────────
# ÉTAPE 7 — Réserves historiques
# ─────────────────────────────────────────────────────────────────────────────

def run_historical_reserves():
    header("ÉTAPE 7 — Réserves historiques 1P (1980-2023)")
    try:
        import import_historical_reserves
        import_historical_reserves.import_historical_reserves()
        db = SessionLocal()
        count = db.query(HistoricalReserves).count()
        db.close()
        ok(f"Réserves historiques : {count} records (15 pays)")
    except Exception as e:
        err(f"Réserves historiques : {e}")
        traceback.print_exc()
        warn("Étape ignorée")

# ─────────────────────────────────────────────────────────────────────────────
# ÉTAPE 8 — Rapport final
# ─────────────────────────────────────────────────────────────────────────────

def run_energy_mix():
    header("ÉTAPE 8 — BP Energy Mix complet")
    try:
        from import_bp_energy_mix import import_energy_mix
        import_energy_mix()
        ok("BP Energy Mix importé")
    except Exception as e:
        fail(f"BP Energy Mix: {e}")


def run_worldbank():
    header("ÉTAPE 9 — World Bank Macro (requiert internet)")
    try:
        from import_worldbank import import_worldbank
        import_worldbank()
        ok("World Bank importé")
    except Exception as e:
        fail(f"World Bank: {e} (normal si pas d'internet)")


def final_report():
    header("RAPPORT FINAL")
    db = SessionLocal()
    try:
        from sqlalchemy import func

        tables = [
            ("Production historique",   HistoricalProduction, 600),
            ("Prix historiques",         OilPrice,            150),
            ("Analytics",                ProductionAnalytics,  200),
            ("Demande régionale",        RegionalDemand,      150),
            ("Réserves historiques",     HistoricalReserves,    80),
            ("Production par méthode",   ProductionByMethod,    10),
            ("EROEI",                    EROEIData,             10),
            ("Projections demande",      DemandProjection,      50),
            ("Réserves 2023",            Reserves,              10),
            ("Sources crédibilité",      SourceCredibility,      8),
            ("BP Energy Mix",            EnergyMix,             50),
            ("World Bank Macro",         WorldBankMacro,       100),
        ]

        all_ok = True
        total = 0
        for label, model, min_expected in tables:
            count = db.query(func.count(model.id)).scalar()
            total += count
            status = "✅" if count >= min_expected else "⚠️ "
            if count < min_expected:
                all_ok = False
            print(f"  {status} {label:<30} {count:>6} records")

        print(f"\n  {'─'*50}")
        print(f"  {'TOTAL':<30} {total:>6} records\n")

        if all_ok:
            print("  ✅ SYSTÈME OPÉRATIONNEL — Tous les seuils atteints")
        else:
            print("  ⚠️  SYSTÈME PARTIEL — Certaines données manquantes")
            print("     Le dashboard fonctionnera avec les données disponibles")

    finally:
        db.close()

# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────

def main():
    start = time.time()

    print("\n" + "█" * 70)
    print("  OIL DASHBOARD — INITIALISATION COMPLÈTE")
    if RESET:
        print("  MODE : RESET COMPLET (toutes les données seront recréées)")
    print("█" * 70)

    # Changer le répertoire pour les imports relatifs
    import os
    os.chdir('/app/scripts')
    sys.path.insert(0, '/app/scripts')
    sys.path.insert(0, '/app')

    # Pipeline
    create_tables()          # 1 — Obligatoire
    run_init_db()            # 2 — Obligatoire
    run_import_bp()          # 3 — Production historique
    run_import_prices()      # 4 — Prix
    run_analytics()          # 5 — Analytics (dépend de 3)
    run_regional_demand()    # 6 — Demande régionale
    run_historical_reserves()# 7 — Réserves historiques
    run_energy_mix()         # 8 — BP mix énergétique complet
    run_worldbank()          # 9 — World Bank macro (nécessite internet)

    # Rapport
    final_report()

    elapsed = time.time() - start
    print(f"\n  ⏱  Durée totale : {elapsed:.1f}s ({elapsed/60:.1f} min)")
    print("█" * 70 + "\n")


if __name__ == "__main__":
    main()
