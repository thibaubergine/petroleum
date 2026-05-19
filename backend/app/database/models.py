from sqlalchemy import Column, Integer, String, Numeric, DateTime, Date, Boolean, ARRAY, JSON, UniqueConstraint
from sqlalchemy.sql import func
from app.database.connection import Base


class RawProduction(Base):
    """Layer 1: Données brutes par source"""
    __tablename__ = "raw_production"
    
    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(String(50), nullable=False)
    country_code = Column(String(3), nullable=False)
    year = Column(Integer, nullable=False)
    value = Column(Numeric(12, 2))
    unit = Column(String(20))
    metric_type = Column(String(50))  # 'crude_only', 'all_liquids'
    fetched_at = Column(DateTime(timezone=True), server_default=func.now())
    source_metadata = Column(JSON)
    
    __table_args__ = (
        UniqueConstraint('source_id', 'country_code', 'year', 'metric_type', name='uq_raw_production'),
    )


class HarmonizedProduction(Base):
    """Layer 2: Données harmonisées"""
    __tablename__ = "harmonized_production"
    
    id = Column(Integer, primary_key=True, index=True)
    country_code = Column(String(3), nullable=False, index=True)
    year = Column(Integer, nullable=False, index=True)
    value = Column(Numeric(12, 2))
    unit = Column(String(20), default='mb/d')
    definition_id = Column(Integer)
    source_id = Column(String(50))
    harmonized_at = Column(DateTime(timezone=True), server_default=func.now())


class ProductionRange(Base):
    """Layer 3: Ranges analytiques (low/central/high)"""
    __tablename__ = "production_ranges"
    
    id = Column(Integer, primary_key=True, index=True)
    country_code = Column(String(3), nullable=False, index=True)
    year = Column(Integer, nullable=False, index=True)
    low = Column(Numeric(12, 2), nullable=False)
    central = Column(Numeric(12, 2), nullable=False)
    high = Column(Numeric(12, 2), nullable=False)
    amplitude_percent = Column(Numeric(5, 2))
    sources_used = Column(ARRAY(String))
    credibility_weighted = Column(Boolean, default=True)
    computed_at = Column(DateTime(timezone=True), server_default=func.now())
    
    __table_args__ = (
        UniqueConstraint('country_code', 'year', name='uq_production_range'),
    )


class AutomatedFlag(Base):
    """Système de flags automatiques"""
    __tablename__ = "automated_flags"
    
    id = Column(Integer, primary_key=True, index=True)
    country_code = Column(String(3), index=True)
    year = Column(Integer)
    flag_type = Column(String(20))  # 'red', 'orange', 'blue', 'gray'
    flag_reason = Column(String(100))
    severity = Column(Integer)
    details = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class SourceCredibility(Base):
    """Scoring de crédibilité des sources"""
    __tablename__ = "source_credibility"
    
    source_id = Column(String(50), primary_key=True)
    transparency_score = Column(Numeric(3, 2))  # 0.0 - 1.0
    verifiability_score = Column(Numeric(3, 2))
    bias_absence_score = Column(Numeric(3, 2))
    overall_score = Column(Numeric(3, 2))  # T × V × A
    notes = Column(String)
    updated_at = Column(DateTime(timezone=True), server_default=func.now())


class DemandProjection(Base):
    """Projections de demande pétrolière par source et scénario"""
    __tablename__ = "demand_projections"
    
    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(String(50), nullable=False)  # 'iea', 'eia', 'opec'
    scenario = Column(String(100), nullable=False)  # 'stated_policies', 'net_zero', 'reference', etc.
    year = Column(Integer, nullable=False, index=True)
    demand_value = Column(Numeric(12, 2), nullable=False)  # mb/d
    unit = Column(String(20), default='mb/d')
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    __table_args__ = (
        UniqueConstraint('source_id', 'scenario', 'year', name='uq_demand_projection'),
    )


class PeakOilAnalysis(Base):
    """Analyse des peaks de demande par source et scénario"""
    __tablename__ = "peak_oil_analysis"
    
    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(String(50), nullable=False, index=True)
    scenario = Column(String(100), nullable=False)
    peak_year = Column(Integer)  # NULL si pas de peak détecté
    peak_value = Column(Numeric(12, 2))  # mb/d au peak
    has_peak = Column(Boolean, default=False)  # True si peak détecté
    decline_rate = Column(Numeric(5, 2))  # % par an après peak (si applicable)
    notes = Column(String)
    computed_at = Column(DateTime(timezone=True), server_default=func.now())
    
    __table_args__ = (
        UniqueConstraint('source_id', 'scenario', name='uq_peak_analysis'),
    )


class Reserves(Base):
    """Réserves pétrolières par pays et catégorie"""
    __tablename__ = "reserves"
    
    id = Column(Integer, primary_key=True, index=True)
    country_code = Column(String(3), nullable=False, index=True)  # ISO alpha-3
    country_name = Column(String(100), nullable=False)
    year = Column(Integer, nullable=False, index=True)
    source_id = Column(String(50), nullable=False)
    
    # Type de réserve
    reserve_type = Column(String(50), default='conventional')  # conventional, oil_sands, extra_heavy, shale, offshore
    
    # Catégories de réserves (en milliards de barils)
    proven_1p = Column(Numeric(12, 2))  # Réserves prouvées (1P)
    probable_2p = Column(Numeric(12, 2))  # Prouvées + Probables (2P)
    possible_3p = Column(Numeric(12, 2))  # Prouvées + Probables + Possibles (3P)
    
    # Métadonnées
    is_audited = Column(Boolean, default=False)  # Audit indépendant ?
    is_opec_member = Column(Boolean, default=False)
    unit = Column(String(20), default='billion_barrels')
    notes = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    __table_args__ = (
        UniqueConstraint('country_code', 'year', 'source_id', 'reserve_type', name='uq_reserve'),
    )


class ReserveFlag(Base):
    """Flags pour signaler les anomalies dans les réserves"""
    __tablename__ = "reserve_flags"
    
    id = Column(Integer, primary_key=True, index=True)
    country_code = Column(String(3), nullable=False, index=True)
    year = Column(Integer)  # NULL pour flags structurels
    flag_type = Column(String(20), nullable=False)  # red, orange, blue, purple
    flag_reason = Column(String(200), nullable=False)
    severity = Column(Integer, default=1)  # 1-5
    details = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ProductionByMethod(Base):
    """Production pétrolière par méthode d'extraction"""
    __tablename__ = "production_by_method"
    
    id = Column(Integer, primary_key=True, index=True)
    country_code = Column(String(3), nullable=False, index=True)
    year = Column(Integer, nullable=False, index=True)
    method = Column(String(50), nullable=False)  # conventional, oil_sands, shale, offshore, eor
    production_value = Column(Numeric(12, 2), nullable=False)  # mb/d
    unit = Column(String(20), default='mb/d')
    notes = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    __table_args__ = (
        UniqueConstraint('country_code', 'year', 'method', name='uq_production_method'),
    )


class EROEIData(Base):
    """Energy Return on Energy Invested - évolution par méthode"""
    __tablename__ = "eroei_data"
    
    id = Column(Integer, primary_key=True, index=True)
    method = Column(String(50), nullable=False, index=True)
    year = Column(Integer, nullable=False, index=True)
    eroei_ratio = Column(Numeric(6, 2), nullable=False)  # e.g., 30.0 = 30:1
    unit = Column(String(20), default='ratio')
    source = Column(String(100))
    notes = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    __table_args__ = (
        UniqueConstraint('method', 'year', name='uq_eroei'),
    )


class OilPrice(Base):
    """Prix du pétrole historique (Brent, WTI, Dubai)"""
    __tablename__ = "oil_prices"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    benchmark = Column(String(20), nullable=False)  # brent, wti, dubai
    price_nominal = Column(Numeric(10, 2), nullable=False)  # USD/barrel nominal
    price_real_2023 = Column(Numeric(10, 2))  # USD/barrel inflation-adjusted to 2023
    currency = Column(String(10), default='USD')
    unit = Column(String(20), default='usd_per_barrel')
    source = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    __table_args__ = (
        UniqueConstraint('date', 'benchmark', name='uq_price'),
    )


class HistoricalProduction(Base):
    """Production historique étendue 1965-2024 (BP Statistical Review)"""
    __tablename__ = "historical_production"
    
    id = Column(Integer, primary_key=True, index=True)
    country_code = Column(String(3), nullable=False, index=True)
    country_name = Column(String(100), nullable=False)
    year = Column(Integer, nullable=False, index=True)
    production_value = Column(Numeric(12, 2), nullable=False)  # mb/d
    source_id = Column(String(50), nullable=False)  # bp_statistical, jodi, eia, etc.
    unit = Column(String(20), default='mb/d')
    is_opec_member = Column(Boolean, default=False)
    notes = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    __table_args__ = (
        UniqueConstraint('country_code', 'year', 'source_id', name='uq_hist_production'),
    )


class ProductionAnalytics(Base):
    """Métriques analytiques calculées par pays"""
    __tablename__ = "production_analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    country_code = Column(String(3), nullable=False, index=True)
    metric_type = Column(String(50), nullable=False)  # cagr, peak_year, decline_rate, etc.
    period_start = Column(Integer)
    period_end = Column(Integer)
    value = Column(Numeric(12, 4))
    unit = Column(String(50))
    confidence = Column(Numeric(5, 2))  # 0-100%
    meta_info = Column(JSON)  # Renamed from 'metadata' (SQLAlchemy reserved)
    calculated_at = Column(DateTime(timezone=True), server_default=func.now())
    
    __table_args__ = (
        UniqueConstraint('country_code', 'metric_type', 'period_start', 'period_end', name='uq_analytics'),
    )


class GeopoliticalEvent(Base):
    """Événements géopolitiques impactant production"""
    __tablename__ = "geopolitical_events"
    
    id = Column(Integer, primary_key=True, index=True)
    country_code = Column(String(3), nullable=False, index=True)
    event_date = Column(Date, nullable=False)
    event_type = Column(String(50), nullable=False)
    event_name = Column(String(200), nullable=False)
    impact_estimated = Column(Numeric(10, 2))
    duration_days = Column(Integer)
    severity = Column(Integer)
    description = Column(String)
    sources = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class RegionalDemand(Base):
    """Demande pétrolière par grande région mondiale - historique et projections"""
    __tablename__ = "regional_demand"

    id = Column(Integer, primary_key=True, index=True)
    region_code = Column(String(20), nullable=False, index=True)  # north_america, europe, china, etc.
    region_name = Column(String(100), nullable=False)
    year = Column(Integer, nullable=False, index=True)
    demand_value = Column(Numeric(12, 2), nullable=False)  # mb/d
    source_id = Column(String(50), nullable=False, default='bp_statistical')
    unit = Column(String(20), default='mb/d')
    notes = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint('region_code', 'year', 'source_id', name='uq_regional_demand'),
    )


class HistoricalReserves(Base):
    """Réserves prouvées historiques par pays 1980-2023"""
    __tablename__ = "historical_reserves"

    id = Column(Integer, primary_key=True, index=True)
    country_code = Column(String(3), nullable=False, index=True)
    country_name = Column(String(100), nullable=False)
    year = Column(Integer, nullable=False, index=True)
    proven_1p = Column(Numeric(12, 2))          # Réserves prouvées totales (Gb)
    crude_conventional = Column(Numeric(12, 2))  # Brut conventionnel uniquement (Gb)
    non_conventional = Column(Numeric(12, 2))    # Sables + schiste + extra-lourd (Gb)
    source_id = Column(String(50), nullable=False, default='bp_statistical')
    is_opec_member = Column(Boolean, default=False)
    notes = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint('country_code', 'year', 'source_id', name='uq_hist_reserves'),
    )


class MarketEvent(Base):
    """Événements géopolitiques/marché extraits automatiquement des news"""
    __tablename__ = "market_events"

    id = Column(Integer, primary_key=True, index=True)
    event_date = Column(Date, nullable=False, index=True)
    week_start = Column(Date, nullable=False, index=True)  # Lundi de la semaine
    title = Column(String(500), nullable=False)
    summary = Column(String(2000))
    event_type = Column(String(50))   # geopolitical, supply, demand, price, sanctions, conflict
    region = Column(String(100))      # Middle East, Europe, Global, etc.
    impact = Column(String(20))       # high, medium, low
    impact_direction = Column(String(10))  # bullish, bearish, neutral
    estimated_price_impact = Column(Numeric(6, 2))  # en $/baril estimé
    sources = Column(JSON)            # liste URLs sources
    raw_articles = Column(JSON)       # titres articles sources
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class MarketSnapshot(Base):
    """Snapshot hebdomadaire des prix et indicateurs macro"""
    __tablename__ = "market_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    week_start = Column(Date, nullable=False, unique=True, index=True)
    # Prix brut
    brent_price = Column(Numeric(8, 2))
    wti_price = Column(Numeric(8, 2))
    brent_change_1w = Column(Numeric(6, 2))   # variation % sur 1 semaine
    brent_change_1m = Column(Numeric(6, 2))   # variation % sur 1 mois
    # Prix pompe (USD/litre)
    gasoline_usa = Column(Numeric(6, 3))
    gasoline_eu_avg = Column(Numeric(6, 3))
    diesel_eu_avg = Column(Numeric(6, 3))
    # Macro
    baltic_dry_index = Column(Numeric(8, 1))
    usd_index = Column(Numeric(8, 2))
    # Indicateurs régionaux
    regional_prices = Column(JSON)    # {region: {gasoline, diesel, change}}
    macro_indicators = Column(JSON)   # {inflation_us, inflation_eu, etc.}
    # Résumé IA
    ai_summary = Column(String(3000))
    ai_key_events = Column(JSON)      # liste événements clés
    sources_fetched = Column(JSON)    # flux RSS utilisés
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class GasolinePrices(Base):
    """Prix à la pompe par pays/région — historique"""
    __tablename__ = "gasoline_prices"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    country_code = Column(String(3), nullable=False, index=True)
    country_name = Column(String(100))
    region = Column(String(50))       # europe, north_america, asia, etc.
    gasoline_price_usd = Column(Numeric(6, 3))   # USD/litre
    diesel_price_usd = Column(Numeric(6, 3))
    gasoline_local = Column(Numeric(8, 3))        # monnaie locale
    local_currency = Column(String(3))
    source = Column(String(50))       # eu_commission, eia, etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint('date', 'country_code', 'source', name='uq_gasoline'),
    )


class WorldBankMacro(Base):
    """Indicateurs macroéconomiques World Bank — inflation, PIB, IDH"""
    __tablename__ = "worldbank_macro"

    id = Column(Integer, primary_key=True, index=True)
    country_code = Column(String(3), nullable=False, index=True)
    country_name = Column(String(100))
    year = Column(Integer, nullable=False, index=True)
    indicator_code = Column(String(50), nullable=False, index=True)
    # NY.GDP.PCAP.CD, FP.CPI.TOTL.ZG, EG.USE.PCAP.KG.OE, etc.
    indicator_name = Column(String(200))
    value = Column(Numeric(20, 4))
    source = Column(String(50), default='world_bank')
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint('country_code', 'year', 'indicator_code', name='uq_worldbank'),
    )


class EnergyMix(Base):
    """Mix énergétique complet BP — pétrole, gaz, charbon, nucléaire, renouvelables"""
    __tablename__ = "energy_mix"

    id = Column(Integer, primary_key=True, index=True)
    country_code = Column(String(3), nullable=False, index=True)
    country_name = Column(String(100))
    year = Column(Integer, nullable=False, index=True)
    energy_type = Column(String(30), nullable=False, index=True)
    # oil, gas, coal, nuclear, hydro, renewables, total
    value_mtoe = Column(Numeric(10, 3))   # millions de tonnes équivalent pétrole
    value_pct = Column(Numeric(6, 3))     # % du mix total
    source = Column(String(50), default='bp_statistical')
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint('country_code', 'year', 'energy_type', 'source', name='uq_energy_mix'),
    )
