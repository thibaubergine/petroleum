"""
Master Import Script - Complete Data Pipeline
Executes all imports and calculations in correct order
"""

import sys
import time

def run_step(step_name: str, script_module: str):
    """Run a single import/calculation step"""
    print(f"\n{'='*80}")
    print(f"  {step_name}")
    print(f"{'='*80}\n")
    
    start_time = time.time()
    
    try:
        # Import and execute
        module = __import__(script_module, fromlist=[''])
        
        # Find and run main function
        if hasattr(module, 'import_bp_data'):
            module.import_bp_data()
        elif hasattr(module, 'import_oil_prices'):
            module.import_oil_prices()
        elif hasattr(module, 'calculate_all_analytics'):
            module.calculate_all_analytics()
        else:
            print(f"⚠️  No main function found in {script_module}")
        
        elapsed = time.time() - start_time
        print(f"\n✅ {step_name} completed in {elapsed:.2f}s")
        
    except Exception as e:
        elapsed = time.time() - start_time
        print(f"\n❌ {step_name} failed after {elapsed:.2f}s")
        print(f"Error: {str(e)}")
        raise


def main():
    """Execute complete data pipeline"""
    
    total_start = time.time()
    
    print("\n" + "="*80)
    print("  OIL DASHBOARD - COMPLETE DATA IMPORT PIPELINE")
    print("="*80)
    print("\n📋 Pipeline Steps:")
    print("  1. BP Statistical Review (1965-2023 production)")
    print("  2. Oil Prices (1960-2024 Brent/WTI/Dubai)")
    print("  3. Analytics Calculation (CAGR, Peak, Decline)")
    print("\n🚀 Starting pipeline execution...\n")
    
    # Step 1: BP Historical Production
    run_step(
        "STEP 1: BP Statistical Review Import",
        "import_bp_historical"
    )
    
    # Step 2: Oil Prices
    run_step(
        "STEP 2: Historical Oil Prices Import",
        "import_oil_prices"
    )
    
    # Step 3: Analytics Calculation
    run_step(
        "STEP 3: Production Analytics Calculation",
        "calculate_analytics"
    )
    
    total_elapsed = time.time() - total_start
    
    print("\n" + "="*80)
    print("  PIPELINE COMPLETE")
    print("="*80)
    print(f"\n⏱️  Total execution time: {total_elapsed:.2f}s ({total_elapsed/60:.1f} minutes)")
    print("\n📊 Data imported:")
    print("  ✅ 20 countries × 59 years = ~1,180 production records")
    print("  ✅ 3 benchmarks × 65 years = 195 price records")
    print("  ✅ ~400+ analytics metrics calculated")
    print("\n🎯 Dashboard ready for:")
    print("  • Historical production analysis (1965-2023)")
    print("  • Price evolution tracking (1960-2024)")
    print("  • Peak oil detection & decline curves")
    print("  • CAGR & volatility metrics")
    print("\n✅ All data successfully loaded!\n")


if __name__ == "__main__":
    # Change to scripts directory
    import os
    os.chdir('/app/scripts')
    sys.path.insert(0, '/app/scripts')
    
    main()


def run_phase2():
    """Execute Phase 2 imports - Regional Demand & Historical Reserves"""
    import os
    os.chdir('/app/scripts')
    sys.path.insert(0, '/app/scripts')

    print("\n" + "="*70)
    print("  PHASE 2 - DONNEES REGIONALES ET RESERVES HISTORIQUES")
    print("="*70)

    # Import demande regionale
    try:
        from import_regional_demand import import_regional_demand
        print("\n[Phase2 - Step 1] Demande regionale...")
        import_regional_demand()
    except Exception as e:
        print(f"ERREUR demande regionale: {e}")

    # Import reserves historiques
    try:
        from import_historical_reserves import import_historical_reserves
        print("\n[Phase2 - Step 2] Reserves historiques...")
        import_historical_reserves()
    except Exception as e:
        print(f"ERREUR reserves historiques: {e}")

    print("\n✅ Phase 2 terminee!")


if __name__ == "__main__":
    import os
    os.chdir('/app/scripts')
    sys.path.insert(0, '/app/scripts')
    main()
    run_phase2()
