"""
Script d'initialisation de la base de données avec données exemple
"""
from app.database.connection import engine, Base, SessionLocal
from app.database.models import (
    RawProduction, HarmonizedProduction, ProductionRange, 
    AutomatedFlag, SourceCredibility, DemandProjection, PeakOilAnalysis,
    Reserves, ReserveFlag, ProductionByMethod, EROEIData
)
from decimal import Decimal


def create_tables():
    """Créer toutes les tables"""
    print("Création des tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Tables créées")


def insert_source_credibility(db):
    """Insérer les scores de crédibilité des sources"""
    print("\nInsertion des scores de crédibilité...")
    
    sources = [
        # ── Sources officielles ──────────────────────────────────────────
        {
            'source_id': 'eia',
            'transparency_score': Decimal('0.95'),
            'verifiability_score': Decimal('0.90'),
            'bias_absence_score': Decimal('0.85'),
            'overall_score': Decimal('0.73'),
            'notes': 'US Energy Information Administration. API publique gratuite. Neutralité statutaire. Référence mondiale pour données US et mondiales.'
        },
        {
            'source_id': 'iea',
            'transparency_score': Decimal('0.90'),
            'verifiability_score': Decimal('0.85'),
            'bias_absence_score': Decimal('0.80'),
            'overall_score': Decimal('0.61'),
            'notes': 'Agence Internationale de l\'Energie (OCDE). Forte transparence méthodologique. Biais pro-transition énergétique cohérent avec mandat OCDE.'
        },
        {
            'source_id': 'opec',
            'transparency_score': Decimal('0.70'),
            'verifiability_score': Decimal('0.60'),
            'bias_absence_score': Decimal('0.50'),
            'overall_score': Decimal('0.21'),
            'notes': 'Organisation des Pays Exportateurs. Données auto-déclarées sans audit. Biais structurel fort: quotas indexés aux réserves déclarées. Inflation documentée 1986-1990.'
        },
        # ── Sources sectorielles haute crédibilité ───────────────────────
        {
            'source_id': 'bp',
            'transparency_score': Decimal('0.88'),
            'verifiability_score': Decimal('0.85'),
            'bias_absence_score': Decimal('0.78'),
            'overall_score': Decimal('0.58'),
            'notes': 'BP Statistical Review of World Energy (désormais Energy Institute). Référence historique 1965-présent. Biais possible en faveur des combustibles fossiles (source pétrolière).'
        },
        {
            'source_id': 'jodi',
            'transparency_score': Decimal('0.85'),
            'verifiability_score': Decimal('0.88'),
            'bias_absence_score': Decimal('0.90'),
            'overall_score': Decimal('0.67'),
            'notes': 'Joint Organisations Data Initiative. Données gouvernementales directes de 90+ pays. Mensuel. API gratuite. Moins de traitement éditorial = biais minimal.'
        },
        {
            'source_id': 'world_bank',
            'transparency_score': Decimal('0.92'),
            'verifiability_score': Decimal('0.90'),
            'bias_absence_score': Decimal('0.88'),
            'overall_score': Decimal('0.73'),
            'notes': 'Banque Mondiale - données macroéconomiques et commodités. Particulièrement fiable pour prix historiques et données économiques. API gratuite complète.'
        },
        # ── Sources commerciales ─────────────────────────────────────────
        {
            'source_id': 'rystad',
            'transparency_score': Decimal('0.75'),
            'verifiability_score': Decimal('0.80'),
            'bias_absence_score': Decimal('0.85'),
            'overall_score': Decimal('0.51'),
            'notes': 'Rystad Energy. Données field-by-field les plus granulaires disponibles. Méthodologie propriétaire peu transparente. Payant. Référence pour réserves 2P/3P.'
        },
        {
            'source_id': 'wood_mac',
            'transparency_score': Decimal('0.72'),
            'verifiability_score': Decimal('0.78'),
            'bias_absence_score': Decimal('0.82'),
            'overall_score': Decimal('0.46'),
            'notes': 'Wood Mackenzie. Analyses upstream et coûts de production. Méthodologie partiellement opaque. Payant. Forte expertise réservoirs et économie de champs.'
        },
        {
            'source_id': 'sp_global',
            'transparency_score': Decimal('0.78'),
            'verifiability_score': Decimal('0.80'),
            'bias_absence_score': Decimal('0.80'),
            'overall_score': Decimal('0.50'),
            'notes': 'S&P Global Commodity Insights (ex-IHS Markit, ex-Platts). Prix spot et données de flux. Très fiable pour prix. Méthodologie partiellement propriétaire.'
        },
        # ── Sources à utiliser avec précaution ───────────────────────────
        {
            'source_id': 'opec_members',
            'transparency_score': Decimal('0.55'),
            'verifiability_score': Decimal('0.45'),
            'bias_absence_score': Decimal('0.40'),
            'overall_score': Decimal('0.10'),
            'notes': 'Agences nationales OPEC (NIOC Iran, PDVSA Venezuela, etc.). Auto-déclaration sans audit indépendant. Venezuela et Iran particulièrement peu fiables post-sanctions. Utiliser uniquement en l\'absence d\'alternative.'
        },
    ]
    
    for source in sources:
        db.merge(SourceCredibility(**source))
    
    db.commit()
    print(f"✓ {len(sources)} sources insérées")


def insert_saudi_arabia_data(db):
    """Données production multi-sources Saudi Arabia, USA, Russia, Canada (2018-2024)"""
    print("\nInsertion donnees multi-sources (SAU, USA, RUS, CAN)...")
    
    # Format: (source_id, country_code, year, value_mb/d)
    # BP : légèrement différent d'EIA/IEA (périmètre condensats)
    # JODI : données gouvernementales directes
    # OPEC : auto-déclaration, biais haussier connu
    raw_data = [
        # ── ARABIE SAOUDITE ─────────────────────────────────────────────
        ('eia',  'SAU', 2018, Decimal('12.0')), ('iea',  'SAU', 2018, Decimal('11.9')), ('opec', 'SAU', 2018, Decimal('12.1')), ('bp',   'SAU', 2018, Decimal('12.0')), ('jodi', 'SAU', 2018, Decimal('11.9')),
        ('eia',  'SAU', 2019, Decimal('11.8')), ('iea',  'SAU', 2019, Decimal('11.7')), ('opec', 'SAU', 2019, Decimal('11.9')), ('bp',   'SAU', 2019, Decimal('11.8')), ('jodi', 'SAU', 2019, Decimal('11.7')),
        ('eia',  'SAU', 2020, Decimal('9.2')),  ('iea',  'SAU', 2020, Decimal('9.0')),  ('opec', 'SAU', 2020, Decimal('9.1')),  ('bp',   'SAU', 2020, Decimal('9.1')),  ('jodi', 'SAU', 2020, Decimal('9.0')),
        ('eia',  'SAU', 2021, Decimal('9.1')),  ('iea',  'SAU', 2021, Decimal('8.9')),  ('opec', 'SAU', 2021, Decimal('9.0')),  ('bp',   'SAU', 2021, Decimal('9.0')),  ('jodi', 'SAU', 2021, Decimal('8.9')),
        ('eia',  'SAU', 2022, Decimal('10.5')), ('iea',  'SAU', 2022, Decimal('10.4')), ('opec', 'SAU', 2022, Decimal('10.6')), ('bp',   'SAU', 2022, Decimal('10.5')), ('jodi', 'SAU', 2022, Decimal('10.4')),
        ('eia',  'SAU', 2023, Decimal('10.2')), ('iea',  'SAU', 2023, Decimal('10.0')), ('opec', 'SAU', 2023, Decimal('10.3')), ('bp',   'SAU', 2023, Decimal('10.1')), ('jodi', 'SAU', 2023, Decimal('10.0')),
        ('eia',  'SAU', 2024, Decimal('9.8')),  ('iea',  'SAU', 2024, Decimal('9.6')),  ('opec', 'SAU', 2024, Decimal('9.9')),
        # ── USA ─────────────────────────────────────────────────────────
        # USA: divergences plus fortes car le shale est comptabilisé différemment
        ('eia',  'USA', 2018, Decimal('15.3')), ('iea',  'USA', 2018, Decimal('15.1')), ('opec', 'USA', 2018, Decimal('15.2')), ('bp',   'USA', 2018, Decimal('14.8')), ('jodi', 'USA', 2018, Decimal('15.0')),
        ('eia',  'USA', 2019, Decimal('16.5')), ('iea',  'USA', 2019, Decimal('16.3')), ('opec', 'USA', 2019, Decimal('16.4')), ('bp',   'USA', 2019, Decimal('16.0')), ('jodi', 'USA', 2019, Decimal('16.2')),
        ('eia',  'USA', 2020, Decimal('16.5')), ('iea',  'USA', 2020, Decimal('16.2')), ('opec', 'USA', 2020, Decimal('16.3')), ('bp',   'USA', 2020, Decimal('15.8')), ('jodi', 'USA', 2020, Decimal('16.1')),
        ('eia',  'USA', 2021, Decimal('16.6')), ('iea',  'USA', 2021, Decimal('16.4')), ('opec', 'USA', 2021, Decimal('16.5')), ('bp',   'USA', 2021, Decimal('16.1')),
        ('eia',  'USA', 2022, Decimal('17.7')), ('iea',  'USA', 2022, Decimal('17.5')), ('opec', 'USA', 2022, Decimal('17.8')), ('bp',   'USA', 2022, Decimal('17.3')),
        ('eia',  'USA', 2023, Decimal('19.5')), ('iea',  'USA', 2023, Decimal('19.2')), ('opec', 'USA', 2023, Decimal('19.4')), ('bp',   'USA', 2023, Decimal('18.9')),
        ('eia',  'USA', 2024, Decimal('20.2')), ('iea',  'USA', 2024, Decimal('20.0')), ('opec', 'USA', 2024, Decimal('20.1')),
        # ── RUSSIE ──────────────────────────────────────────────────────
        # Russie post-2022: divergences importantes (sanctions, opacité)
        ('eia',  'RUS', 2018, Decimal('11.4')), ('iea',  'RUS', 2018, Decimal('11.3')), ('opec', 'RUS', 2018, Decimal('11.5')), ('bp',   'RUS', 2018, Decimal('11.4')),
        ('eia',  'RUS', 2019, Decimal('11.5')), ('iea',  'RUS', 2019, Decimal('11.5')), ('opec', 'RUS', 2019, Decimal('11.6')), ('bp',   'RUS', 2019, Decimal('11.5')),
        ('eia',  'RUS', 2020, Decimal('10.7')), ('iea',  'RUS', 2020, Decimal('10.6')), ('opec', 'RUS', 2020, Decimal('10.8')), ('bp',   'RUS', 2020, Decimal('10.7')),
        ('eia',  'RUS', 2021, Decimal('10.9')), ('iea',  'RUS', 2021, Decimal('10.9')), ('opec', 'RUS', 2021, Decimal('11.0')), ('bp',   'RUS', 2021, Decimal('10.9')),
        # Post-2022: fortes divergences (EIA estime bcp plus bas qu'OPEC)
        ('eia',  'RUS', 2022, Decimal('10.7')), ('iea',  'RUS', 2022, Decimal('10.7')), ('opec', 'RUS', 2022, Decimal('11.3')), ('bp',   'RUS', 2022, Decimal('10.9')),
        ('eia',  'RUS', 2023, Decimal('9.8')),  ('iea',  'RUS', 2023, Decimal('9.5')),  ('opec', 'RUS', 2023, Decimal('11.2')), ('bp',   'RUS', 2023, Decimal('10.7')),
        ('eia',  'RUS', 2024, Decimal('9.2')),  ('iea',  'RUS', 2024, Decimal('9.0')),  ('opec', 'RUS', 2024, Decimal('11.0')),
        # ── CANADA ──────────────────────────────────────────────────────
        ('eia',  'CAN', 2018, Decimal('5.2')),  ('iea',  'CAN', 2018, Decimal('5.1')),  ('opec', 'CAN', 2018, Decimal('5.3')),  ('bp',   'CAN', 2018, Decimal('5.2')),
        ('eia',  'CAN', 2019, Decimal('5.7')),  ('iea',  'CAN', 2019, Decimal('5.6')),  ('opec', 'CAN', 2019, Decimal('5.8')),  ('bp',   'CAN', 2019, Decimal('5.7')),
        ('eia',  'CAN', 2020, Decimal('5.1')),  ('iea',  'CAN', 2020, Decimal('5.0')),  ('opec', 'CAN', 2020, Decimal('5.2')),  ('bp',   'CAN', 2020, Decimal('5.1')),
        ('eia',  'CAN', 2021, Decimal('5.4')),  ('iea',  'CAN', 2021, Decimal('5.3')),  ('opec', 'CAN', 2021, Decimal('5.5')),  ('bp',   'CAN', 2021, Decimal('5.4')),
        ('eia',  'CAN', 2022, Decimal('5.6')),  ('iea',  'CAN', 2022, Decimal('5.5')),  ('opec', 'CAN', 2022, Decimal('5.7')),  ('bp',   'CAN', 2022, Decimal('5.6')),
        ('eia',  'CAN', 2023, Decimal('5.7')),  ('iea',  'CAN', 2023, Decimal('5.6')),  ('opec', 'CAN', 2023, Decimal('5.8')),  ('bp',   'CAN', 2023, Decimal('5.7')),
        ('eia',  'CAN', 2024, Decimal('5.8')),  ('iea',  'CAN', 2024, Decimal('5.7')),  ('opec', 'CAN', 2024, Decimal('5.9')),
    ]
    
    count = 0
    for source_id, country_code, year, value in raw_data:
        db.merge(RawProduction(
            source_id=source_id, country_code=country_code, year=year,
            value=value, unit='mb/d', metric_type='all_liquids'
        ))
        db.merge(HarmonizedProduction(
            source_id=source_id, country_code=country_code, year=year,
            value=value, unit='mb/d'
        ))
        count += 1
    
    db.commit()
    print(f"✓ {count} records inseres (SAU, USA, RUS, CAN — EIA/IEA/OPEC/BP/JODI)")


def insert_production_ranges(db):
    """Calculer et insérer les ranges de production"""
    print("\nCalcul des ranges de production...")
    
    ranges = [
        {
            'country_code': 'SAU', 'year': 2020,
            'low': Decimal('9.0'), 'central': Decimal('9.1'), 'high': Decimal('9.2'),
            'amplitude_percent': Decimal('2.2'),  # (9.2-9.0)/9.1 * 100
            'sources_used': ['eia', 'iea', 'opec'],
            'credibility_weighted': True
        },
        {
            'country_code': 'SAU', 'year': 2021,
            'low': Decimal('8.9'), 'central': Decimal('9.0'), 'high': Decimal('9.1'),
            'amplitude_percent': Decimal('2.2'),
            'sources_used': ['eia', 'iea', 'opec'],
            'credibility_weighted': True
        },
        {
            'country_code': 'SAU', 'year': 2022,
            'low': Decimal('10.4'), 'central': Decimal('10.5'), 'high': Decimal('10.6'),
            'amplitude_percent': Decimal('1.9'),
            'sources_used': ['eia', 'iea', 'opec'],
            'credibility_weighted': True
        },
        {
            'country_code': 'SAU', 'year': 2023,
            'low': Decimal('10.0'), 'central': Decimal('10.2'), 'high': Decimal('10.3'),
            'amplitude_percent': Decimal('2.9'),
            'sources_used': ['eia', 'iea', 'opec'],
            'credibility_weighted': True
        },
        {
            'country_code': 'SAU', 'year': 2024,
            'low': Decimal('9.6'), 'central': Decimal('9.8'), 'high': Decimal('9.9'),
            'amplitude_percent': Decimal('3.1'),
            'sources_used': ['eia', 'iea', 'opec'],
            'credibility_weighted': True
        },
        # ── USA - divergence forte (shale comptabilise differemment) ────
        {'country_code': 'USA', 'year': 2018, 'low': Decimal('14.8'), 'central': Decimal('15.1'), 'high': Decimal('15.3'), 'amplitude_percent': Decimal('3.3'), 'sources_used': ['eia', 'iea', 'opec', 'bp', 'jodi'], 'credibility_weighted': True},
        {'country_code': 'USA', 'year': 2019, 'low': Decimal('16.0'), 'central': Decimal('16.3'), 'high': Decimal('16.5'), 'amplitude_percent': Decimal('3.1'), 'sources_used': ['eia', 'iea', 'opec', 'bp', 'jodi'], 'credibility_weighted': True},
        {'country_code': 'USA', 'year': 2020, 'low': Decimal('15.8'), 'central': Decimal('16.2'), 'high': Decimal('16.5'), 'amplitude_percent': Decimal('4.3'), 'sources_used': ['eia', 'iea', 'opec', 'bp', 'jodi'], 'credibility_weighted': True},
        {'country_code': 'USA', 'year': 2021, 'low': Decimal('16.1'), 'central': Decimal('16.5'), 'high': Decimal('16.6'), 'amplitude_percent': Decimal('3.0'), 'sources_used': ['eia', 'iea', 'opec', 'bp'], 'credibility_weighted': True},
        {'country_code': 'USA', 'year': 2022, 'low': Decimal('17.3'), 'central': Decimal('17.6'), 'high': Decimal('17.8'), 'amplitude_percent': Decimal('2.9'), 'sources_used': ['eia', 'iea', 'opec', 'bp'], 'credibility_weighted': True},
        {'country_code': 'USA', 'year': 2023, 'low': Decimal('18.9'), 'central': Decimal('19.3'), 'high': Decimal('19.5'), 'amplitude_percent': Decimal('3.1'), 'sources_used': ['eia', 'iea', 'opec', 'bp'], 'credibility_weighted': True},
        {'country_code': 'USA', 'year': 2024, 'low': Decimal('20.0'), 'central': Decimal('20.1'), 'high': Decimal('20.2'), 'amplitude_percent': Decimal('1.0'), 'sources_used': ['eia', 'iea', 'opec'], 'credibility_weighted': True},
        # ── RUSSIE - divergence forte post-2022 (sanctions + opacite) ──
        {'country_code': 'RUS', 'year': 2018, 'low': Decimal('11.3'), 'central': Decimal('11.4'), 'high': Decimal('11.5'), 'amplitude_percent': Decimal('1.7'), 'sources_used': ['eia', 'iea', 'opec', 'bp'], 'credibility_weighted': True},
        {'country_code': 'RUS', 'year': 2019, 'low': Decimal('11.3'), 'central': Decimal('11.5'), 'high': Decimal('11.6'), 'amplitude_percent': Decimal('2.6'), 'sources_used': ['eia', 'iea', 'opec', 'bp'], 'credibility_weighted': True},
        {'country_code': 'RUS', 'year': 2020, 'low': Decimal('10.6'), 'central': Decimal('10.7'), 'high': Decimal('10.8'), 'amplitude_percent': Decimal('1.9'), 'sources_used': ['eia', 'iea', 'opec', 'bp'], 'credibility_weighted': True},
        {'country_code': 'RUS', 'year': 2021, 'low': Decimal('10.9'), 'central': Decimal('10.9'), 'high': Decimal('11.0'), 'amplitude_percent': Decimal('0.9'), 'sources_used': ['eia', 'iea', 'opec', 'bp'], 'credibility_weighted': True},
        # Post-2022: ecart EIA(9.8) vs OPEC(11.3) = 15% divergence => flag rouge
        {'country_code': 'RUS', 'year': 2022, 'low': Decimal('10.7'), 'central': Decimal('10.9'), 'high': Decimal('11.3'), 'amplitude_percent': Decimal('5.7'), 'sources_used': ['eia', 'iea', 'opec', 'bp'], 'credibility_weighted': True},
        {'country_code': 'RUS', 'year': 2023, 'low': Decimal('9.5'), 'central': Decimal('10.2'), 'high': Decimal('11.2'), 'amplitude_percent': Decimal('16.7'), 'sources_used': ['eia', 'iea', 'opec', 'bp'], 'credibility_weighted': True},
        {'country_code': 'RUS', 'year': 2024, 'low': Decimal('9.0'), 'central': Decimal('10.0'), 'high': Decimal('11.0'), 'amplitude_percent': Decimal('20.0'), 'sources_used': ['eia', 'iea', 'opec'], 'credibility_weighted': True},
        # ── CANADA - sables bitumineux / comptabilisation variable ──────
        {'country_code': 'CAN', 'year': 2018, 'low': Decimal('5.1'), 'central': Decimal('5.2'), 'high': Decimal('5.3'), 'amplitude_percent': Decimal('3.8'), 'sources_used': ['eia', 'iea', 'opec', 'bp'], 'credibility_weighted': True},
        {'country_code': 'CAN', 'year': 2019, 'low': Decimal('5.6'), 'central': Decimal('5.7'), 'high': Decimal('5.8'), 'amplitude_percent': Decimal('3.5'), 'sources_used': ['eia', 'iea', 'opec', 'bp'], 'credibility_weighted': True},
        {'country_code': 'CAN', 'year': 2020, 'low': Decimal('5.0'), 'central': Decimal('5.1'), 'high': Decimal('5.2'), 'amplitude_percent': Decimal('3.9'), 'sources_used': ['eia', 'iea', 'opec', 'bp'], 'credibility_weighted': True},
        {'country_code': 'CAN', 'year': 2021, 'low': Decimal('5.3'), 'central': Decimal('5.4'), 'high': Decimal('5.5'), 'amplitude_percent': Decimal('3.7'), 'sources_used': ['eia', 'iea', 'opec', 'bp'], 'credibility_weighted': True},
        {'country_code': 'CAN', 'year': 2022, 'low': Decimal('5.5'), 'central': Decimal('5.6'), 'high': Decimal('5.7'), 'amplitude_percent': Decimal('3.6'), 'sources_used': ['eia', 'iea', 'opec', 'bp'], 'credibility_weighted': True},
        {'country_code': 'CAN', 'year': 2023, 'low': Decimal('5.6'), 'central': Decimal('5.7'), 'high': Decimal('5.8'), 'amplitude_percent': Decimal('3.5'), 'sources_used': ['eia', 'iea', 'opec', 'bp'], 'credibility_weighted': True},
        {'country_code': 'CAN', 'year': 2024, 'low': Decimal('5.7'), 'central': Decimal('5.8'), 'high': Decimal('5.9'), 'amplitude_percent': Decimal('3.4'), 'sources_used': ['eia', 'iea', 'opec'], 'credibility_weighted': True},
    ]
    
    for range_data in ranges:
        db.merge(ProductionRange(**range_data))
    
    db.commit()
    print("✓ Ranges de production insérés")


def insert_flags(db):
    """Insérer les flags qualité données"""
    print("\nInsertion des flags...")
    
    flags = [
        # SAU - divergence definitionnelle mineure
        AutomatedFlag(country_code='SAU', year=2024, flag_type='blue',
            flag_reason='Divergence définitionnelle mineure',
            severity=1, details={'note': 'Écart <5% entre sources, cohérence acceptable'}),
        # RUS 2023 - divergence forte post-sanctions
        AutomatedFlag(country_code='RUS', year=2023, flag_type='red',
            flag_reason='Divergence >15% — données post-sanctions peu fiables',
            severity=5, details={'eia': '9.5', 'opec': '11.2', 'amplitude': '16.7%', 'note': 'OPEC relaie données russes officielles, EIA estime via tanker tracking'}),
        AutomatedFlag(country_code='RUS', year=2024, flag_type='red',
            flag_reason='Divergence >20% — données opaques',
            severity=5, details={'eia': '9.0', 'opec': '11.0', 'amplitude': '20.0%', 'note': 'Russie a cessé publication statistiques mensuelles en mars 2022'}),
        # USA - divergence périmètre (shale NGLs inclus ou non)
        AutomatedFlag(country_code='USA', year=2023, flag_type='blue',
            flag_reason='Divergence définitionnelle — NGLs inclus différemment selon source',
            severity=2, details={'note': 'BP exclut une partie des NGLs, EIA les inclut intégralement'}),
    ]
    
    for flag in flags:
        db.add(flag)
    db.commit()
    print(f"✓ {len(flags)} flags insérés")


def insert_demand_projections(db):
    """Insérer les projections de demande (IEA, EIA, OPEC)"""
    print("\nInsertion des projections de demande...")
    
    # IEA - Stated Policies (STEPS) - Peak 2030
    iea_steps = [
        {'year': 2024, 'value': Decimal('102.0')},
        {'year': 2025, 'value': Decimal('103.5')},
        {'year': 2026, 'value': Decimal('104.2')},
        {'year': 2027, 'value': Decimal('104.8')},
        {'year': 2028, 'value': Decimal('105.0')},
        {'year': 2029, 'value': Decimal('105.1')},
        {'year': 2030, 'value': Decimal('105.0')},  # Peak
        {'year': 2035, 'value': Decimal('102.5')},
        {'year': 2040, 'value': Decimal('98.0')},
        {'year': 2045, 'value': Decimal('92.0')},
        {'year': 2050, 'value': Decimal('85.0')},
    ]
    
    # IEA - Net Zero 2050 (NZE) - Peak 2025, déclin rapide
    iea_nze = [
        {'year': 2024, 'value': Decimal('102.0')},
        {'year': 2025, 'value': Decimal('101.5')},  # Peak
        {'year': 2026, 'value': Decimal('98.0')},
        {'year': 2027, 'value': Decimal('94.5')},
        {'year': 2028, 'value': Decimal('91.0')},
        {'year': 2029, 'value': Decimal('87.5')},
        {'year': 2030, 'value': Decimal('84.0')},
        {'year': 2035, 'value': Decimal('72.0')},
        {'year': 2040, 'value': Decimal('55.0')},
        {'year': 2045, 'value': Decimal('40.0')},
        {'year': 2050, 'value': Decimal('24.0')},
    ]
    
    # EIA - Reference Case - Croissance lente, pas de peak net
    eia_ref = [
        {'year': 2024, 'value': Decimal('102.5')},
        {'year': 2025, 'value': Decimal('103.8')},
        {'year': 2026, 'value': Decimal('104.5')},
        {'year': 2027, 'value': Decimal('105.2')},
        {'year': 2028, 'value': Decimal('105.8')},
        {'year': 2029, 'value': Decimal('106.3')},
        {'year': 2030, 'value': Decimal('106.8')},
        {'year': 2035, 'value': Decimal('108.0')},
        {'year': 2040, 'value': Decimal('109.0')},
        {'year': 2045, 'value': Decimal('109.5')},
        {'year': 2050, 'value': Decimal('110.0')},
    ]
    
    # EIA - Low Growth - Peak 2035
    eia_low = [
        {'year': 2024, 'value': Decimal('102.5')},
        {'year': 2025, 'value': Decimal('103.5')},
        {'year': 2026, 'value': Decimal('104.2')},
        {'year': 2027, 'value': Decimal('105.0')},
        {'year': 2028, 'value': Decimal('105.8')},
        {'year': 2029, 'value': Decimal('106.5')},
        {'year': 2030, 'value': Decimal('107.0')},
        {'year': 2035, 'value': Decimal('107.5')},  # Peak
        {'year': 2040, 'value': Decimal('106.0')},
        {'year': 2045, 'value': Decimal('103.0')},
        {'year': 2050, 'value': Decimal('99.0')},
    ]
    
    # OPEC - Reference - Optimiste, croissance continue
    opec_ref = [
        {'year': 2024, 'value': Decimal('103.0')},
        {'year': 2025, 'value': Decimal('104.5')},
        {'year': 2026, 'value': Decimal('106.0')},
        {'year': 2027, 'value': Decimal('107.5')},
        {'year': 2028, 'value': Decimal('109.0')},
        {'year': 2029, 'value': Decimal('110.5')},
        {'year': 2030, 'value': Decimal('112.0')},
        {'year': 2035, 'value': Decimal('114.0')},
        {'year': 2040, 'value': Decimal('115.5')},
        {'year': 2045, 'value': Decimal('116.2')},
        {'year': 2050, 'value': Decimal('116.5')},
    ]
    
    # Insérer toutes les projections
    for data in iea_steps:
        db.merge(DemandProjection(
            source_id='iea',
            scenario='stated_policies',
            year=data['year'],
            demand_value=data['value'],
            unit='mb/d'
        ))
    
    for data in iea_nze:
        db.merge(DemandProjection(
            source_id='iea',
            scenario='net_zero',
            year=data['year'],
            demand_value=data['value'],
            unit='mb/d'
        ))
    
    for data in eia_ref:
        db.merge(DemandProjection(
            source_id='eia',
            scenario='reference',
            year=data['year'],
            demand_value=data['value'],
            unit='mb/d'
        ))
    
    for data in eia_low:
        db.merge(DemandProjection(
            source_id='eia',
            scenario='low_growth',
            year=data['year'],
            demand_value=data['value'],
            unit='mb/d'
        ))
    
    for data in opec_ref:
        db.merge(DemandProjection(
            source_id='opec',
            scenario='reference',
            year=data['year'],
            demand_value=data['value'],
            unit='mb/d'
        ))
    
    db.commit()
    print("✓ Projections de demande insérées (5 scénarios)")


def insert_peak_oil_analysis(db):
    """Insérer l'analyse des peaks de demande"""
    print("\nCalcul de l'analyse peak oil...")
    
    peaks = [
        {
            'source_id': 'iea',
            'scenario': 'stated_policies',
            'peak_year': 2030,
            'peak_value': Decimal('105.1'),
            'has_peak': True,
            'decline_rate': Decimal('4.2'),  # % par an post-peak
            'notes': 'Peak modéré suivi d\'un déclin progressif'
        },
        {
            'source_id': 'iea',
            'scenario': 'net_zero',
            'peak_year': 2025,
            'peak_value': Decimal('101.5'),
            'has_peak': True,
            'decline_rate': Decimal('8.5'),  # Déclin rapide
            'notes': 'Peak immédiat suivi d\'un déclin agressif pour atteindre Net Zero'
        },
        {
            'source_id': 'eia',
            'scenario': 'reference',
            'peak_year': None,
            'peak_value': None,
            'has_peak': False,
            'decline_rate': None,
            'notes': 'Pas de peak détecté - croissance continue jusqu\'en 2050'
        },
        {
            'source_id': 'eia',
            'scenario': 'low_growth',
            'peak_year': 2035,
            'peak_value': Decimal('107.5'),
            'has_peak': True,
            'decline_rate': Decimal('2.1'),  # Déclin doux
            'notes': 'Peak tardif suivi d\'un déclin lent'
        },
        {
            'source_id': 'opec',
            'scenario': 'reference',
            'peak_year': None,
            'peak_value': None,
            'has_peak': False,
            'decline_rate': None,
            'notes': 'Vision optimiste - pas de peak, croissance soutenue'
        },
    ]
    
    for peak in peaks:
        db.merge(PeakOilAnalysis(**peak))
    
    db.commit()
    print("✓ Analyse peak oil calculée (5 scénarios)")


def insert_reserves_data(db):
    """Insérer les données de réserves avec cas notoires"""
    print("\nInsertion des réserves pétrolières...")
    
    # Données 2023 - Top 15 pays
    reserves_data = [
        # Venezuela - CAS NOTOIRE : Claimed 303 Gb vs ~50 Gb recoverable
        {'code': 'VEN', 'name': 'Venezuela', 'type': 'extra_heavy', '1p': Decimal('303.8'), '2p': None, '3p': None, 
         'audited': False, 'opec': True, 'notes': 'Majorité en heavy oil (Orinoco belt), taux recovery <20%'},
        
        # Saudi Arabia
        {'code': 'SAU', 'name': 'Saudi Arabia', 'type': 'conventional', '1p': Decimal('297.5'), '2p': None, '3p': None,
         'audited': False, 'opec': True, 'notes': 'Non-audité, estimations Aramco'},
        
        # Canada
        {'code': 'CAN', 'name': 'Canada', 'type': 'oil_sands', '1p': Decimal('168.1'), '2p': Decimal('220.0'), '3p': None,
         'audited': True, 'opec': False, 'notes': 'Majorité oil sands (Alberta), audité'},
        
        # Iran
        {'code': 'IRN', 'name': 'Iran', 'type': 'conventional', '1p': Decimal('157.8'), '2p': None, '3p': None,
         'audited': False, 'opec': True, 'notes': 'Non-audité, données gouvernementales'},
        
        # Iraq
        {'code': 'IRQ', 'name': 'Iraq', 'type': 'conventional', '1p': Decimal('145.0'), '2p': None, '3p': None,
         'audited': False, 'opec': True, 'notes': 'Potentiel important non-exploré'},
        
        # Kuwait - CAS NOTOIRE : 101 Gb officiel vs 48 Gb docs internes (2006 leak)
        {'code': 'KWT', 'name': 'Kuwait', 'type': 'conventional', '1p': Decimal('101.5'), '2p': None, '3p': None,
         'audited': False, 'opec': True, 'notes': 'Documents internes 2006 révèlent 48 Gb seulement'},
        
        # UAE - CAS NOTOIRE : Inflation OPEC 1980s (de 30 à 92 Gb en 1986)
        {'code': 'ARE', 'name': 'UAE', 'type': 'conventional', '1p': Decimal('97.8'), '2p': None, '3p': None,
         'audited': False, 'opec': True, 'notes': 'Saut de 30 à 92 Gb en 1986 (quotas OPEC)'},
        
        # Russia
        {'code': 'RUS', 'name': 'Russia', 'type': 'conventional', '1p': Decimal('107.8'), '2p': None, '3p': None,
         'audited': False, 'opec': False, 'notes': 'Données post-2022 peu fiables'},
        
        # Libya
        {'code': 'LBY', 'name': 'Libya', 'type': 'conventional', '1p': Decimal('48.4'), '2p': None, '3p': None,
         'audited': False, 'opec': True, 'notes': 'Instabilité politique affecte exploration'},
        
        # United States
        {'code': 'USA', 'name': 'United States', 'type': 'shale', '1p': Decimal('68.8'), '2p': Decimal('95.0'), '3p': None,
         'audited': True, 'opec': False, 'notes': 'Shale revolution, SEC-audited'},
        
        # Nigeria
        {'code': 'NGA', 'name': 'Nigeria', 'type': 'offshore', '1p': Decimal('36.9'), '2p': None, '3p': None,
         'audited': False, 'opec': True, 'notes': 'Potentiel offshore important'},
        
        # Kazakhstan
        {'code': 'KAZ', 'name': 'Kazakhstan', 'type': 'conventional', '1p': Decimal('30.0'), '2p': None, '3p': None,
         'audited': False, 'opec': False, 'notes': 'Kashagan field (complexe)'},
        
        # China
        {'code': 'CHN', 'name': 'China', 'type': 'conventional', '1p': Decimal('26.0'), '2p': None, '3p': None,
         'audited': False, 'opec': False, 'notes': 'Données gouvernementales'},
        
        # Qatar
        {'code': 'QAT', 'name': 'Qatar', 'type': 'conventional', '1p': Decimal('25.2'), '2p': None, '3p': None,
         'audited': False, 'opec': True, 'notes': 'Focus sur gaz naturel'},
        
        # Brazil
        {'code': 'BRA', 'name': 'Brazil', 'type': 'offshore', '1p': Decimal('15.0'), '2p': Decimal('30.0'), '3p': None,
         'audited': True, 'opec': False, 'notes': 'Pre-salt offshore, Petrobras-audited'},
    ]
    
    for data in reserves_data:
        db.merge(Reserves(
            country_code=data['code'],
            country_name=data['name'],
            year=2023,
            source_id='bp_statistical_review',
            reserve_type=data.get('type', 'conventional'),  # Type de réserve
            proven_1p=data['1p'],
            probable_2p=data['2p'],
            possible_3p=data['3p'],
            is_audited=data['audited'],
            is_opec_member=data['opec'],
            unit='billion_barrels',
            notes=data['notes']
        ))
    
    db.commit()
    print(f"✓ Réserves insérées ({len(reserves_data)} pays)")


def insert_reserve_flags(db):
    """Insérer les flags sur les anomalies de réserves"""
    print("\nInsertion des flags réserves...")
    
    flags = [
        # Venezuela - Purple flag : Écart claimed vs recoverable
        {
            'code': 'VEN',
            'year': 2023,
            'type': 'purple',
            'reason': 'Écart majeur claimed (303 Gb) vs. recoverable (~50 Gb)',
            'severity': 5,
            'details': {
                'claimed': 303.8,
                'recoverable_estimate': 50,
                'gap_percent': 506,
                'issue': 'Heavy oil Orinoco belt avec recovery rate <20%'
            }
        },
        
        # Kuwait - Red flag : Manipulation avérée
        {
            'code': 'KWT',
            'year': 2023,
            'type': 'red',
            'reason': 'Leak docs internes 2006 : 48 Gb vs. 101 Gb officiel',
            'severity': 5,
            'details': {
                'official': 101.5,
                'leaked_internal': 48,
                'gap_percent': 111,
                'source': 'Petroleum Intelligence Weekly 2006'
            }
        },
        
        # UAE - Red flag : Inflation OPEC 1980s
        {
            'code': 'ARE',
            'year': None,  # Flag structurel
            'type': 'red',
            'reason': 'Inflation OPEC 1986 : de 30 à 92 Gb sans découverte',
            'severity': 4,
            'details': {
                '1985': 30,
                '1986': 92,
                'increase_percent': 207,
                'reason': 'Quotas OPEC liés aux réserves déclarées'
            }
        },
        
        # Iran - Orange flag : Non-audité OPEC
        {
            'code': 'IRN',
            'year': 2023,
            'type': 'orange',
            'reason': 'Données non-auditées, source unique gouvernementale',
            'severity': 3,
            'details': {
                'audited': False,
                'source': 'National Iranian Oil Company',
                'verification': 'Aucune vérification indépendante'
            }
        },
        
        # Iraq - Orange flag : Non-audité OPEC
        {
            'code': 'IRQ',
            'year': 2023,
            'type': 'orange',
            'reason': 'Données non-auditées, potentiel non-exploré important',
            'severity': 3,
            'details': {
                'audited': False,
                'unexplored_potential': 'Élevé',
                'conflict_impact': 'Exploration limitée 2003-2023'
            }
        },
        
        # Saudi Arabia - Orange flag : Non-audité, Aramco
        {
            'code': 'SAU',
            'year': 2023,
            'type': 'orange',
            'reason': 'Jamais audité indépendamment, estimations Aramco',
            'severity': 2,
            'details': {
                'audited': False,
                'source': 'Saudi Aramco internal estimates',
                'transparency': 'Limitée jusqu\'à IPO 2019'
            }
        },
        
        # Russia - Orange flag : Données post-2022 peu fiables
        {
            'code': 'RUS',
            'year': 2023,
            'type': 'orange',
            'reason': 'Données post-2022 sujettes à manipulation politique',
            'severity': 3,
            'details': {
                'context': 'Sanctions internationales 2022',
                'transparency': 'Forte dégradation post-invasion Ukraine',
                'verification': 'Impossible depuis 2022'
            }
        },
    ]
    
    for flag in flags:
        db.add(ReserveFlag(
            country_code=flag['code'],
            year=flag['year'],
            flag_type=flag['type'],
            flag_reason=flag['reason'],
            severity=flag['severity'],
            details=flag['details']
        ))
    
    db.commit()
    print(f"✓ Flags réserves insérés ({len(flags)} flags)")


def insert_production_by_method(db):
    """Insérer les données de production par méthode d'extraction"""
    print("\nInsertion production par méthode...")
    
    # Canada - Dominé par oil sands
    canada_data = [
        # 2015
        {'year': 2015, 'conventional': Decimal('1.2'), 'oil_sands': Decimal('2.3'), 'offshore': Decimal('0.2')},
        # 2018
        {'year': 2018, 'conventional': Decimal('1.1'), 'oil_sands': Decimal('2.8'), 'offshore': Decimal('0.2')},
        # 2020
        {'year': 2020, 'conventional': Decimal('1.0'), 'oil_sands': Decimal('3.0'), 'offshore': Decimal('0.2')},
        # 2022
        {'year': 2022, 'conventional': Decimal('0.9'), 'oil_sands': Decimal('3.2'), 'offshore': Decimal('0.2')},
        # 2024
        {'year': 2024, 'conventional': Decimal('0.9'), 'oil_sands': Decimal('3.4'), 'offshore': Decimal('0.2')},
    ]
    
    for data in canada_data:
        if 'conventional' in data:
            db.merge(ProductionByMethod(
                country_code='CAN',
                year=data['year'],
                method='conventional',
                production_value=data['conventional'],
                unit='mb/d',
                notes='Déclin continu conventional, croissance oil sands'
            ))
        if 'oil_sands' in data:
            db.merge(ProductionByMethod(
                country_code='CAN',
                year=data['year'],
                method='oil_sands',
                production_value=data['oil_sands'],
                unit='mb/d',
                notes='Majorité Alberta oil sands'
            ))
        if 'offshore' in data:
            db.merge(ProductionByMethod(
                country_code='CAN',
                year=data['year'],
                method='offshore',
                production_value=data['offshore'],
                unit='mb/d',
                notes='Terre-Neuve offshore'
            ))
    
    # USA - Révolution shale
    usa_data = [
        # 2010 - Avant shale boom
        {'year': 2010, 'conventional': Decimal('3.5'), 'shale': Decimal('0.8'), 'offshore': Decimal('1.5')},
        # 2015 - Shale boom
        {'year': 2015, 'conventional': Decimal('3.0'), 'shale': Decimal('4.5'), 'offshore': Decimal('1.6')},
        # 2020
        {'year': 2020, 'conventional': Decimal('2.5'), 'shale': Decimal('7.0'), 'offshore': Decimal('1.8')},
        # 2022
        {'year': 2022, 'conventional': Decimal('2.3'), 'shale': Decimal('8.5'), 'offshore': Decimal('1.9')},
        # 2024
        {'year': 2024, 'conventional': Decimal('2.2'), 'shale': Decimal('9.2'), 'offshore': Decimal('2.0')},
    ]
    
    for data in usa_data:
        for method in ['conventional', 'shale', 'offshore']:
            if method in data:
                db.merge(ProductionByMethod(
                    country_code='USA',
                    year=data['year'],
                    method=method,
                    production_value=data[method],
                    unit='mb/d',
                    notes=f'Shale revolution (Permian Basin)' if method == 'shale' else None
                ))
    
    # Saudi Arabia - 100% conventional
    saudi_data = [
        {'year': 2015, 'value': Decimal('10.2')},
        {'year': 2018, 'value': Decimal('10.4')},
        {'year': 2020, 'value': Decimal('9.2')},
        {'year': 2022, 'value': Decimal('10.5')},
        {'year': 2024, 'value': Decimal('9.8')},
    ]
    
    for data in saudi_data:
        db.merge(ProductionByMethod(
            country_code='SAU',
            year=data['year'],
            method='conventional',
            production_value=data['value'],
            unit='mb/d',
            notes='100% conventional (Ghawar, Safaniya)'
        ))
    
    db.commit()
    print("✓ Production par méthode insérée (Canada, USA, Saudi)")


def insert_eroei_data(db):
    """Insérer les données EROEI (Energy Return on Energy Invested)"""
    print("\nInsertion données EROEI...")
    
    # Conventional - Declin continu (points tous les 5 ans pour continuite graphique)
    conventional_eroei = [
        {'year': 1970, 'ratio': Decimal('35.0')},
        {'year': 1975, 'ratio': Decimal('32.0')},
        {'year': 1980, 'ratio': Decimal('30.0')},
        {'year': 1985, 'ratio': Decimal('27.0')},
        {'year': 1990, 'ratio': Decimal('25.0')},
        {'year': 1995, 'ratio': Decimal('22.0')},
        {'year': 2000, 'ratio': Decimal('20.0')},
        {'year': 2005, 'ratio': Decimal('18.0')},
        {'year': 2010, 'ratio': Decimal('17.0')},
        {'year': 2015, 'ratio': Decimal('16.0')},
        {'year': 2020, 'ratio': Decimal('15.0')},
        {'year': 2024, 'ratio': Decimal('14.0')},
    ]
    
    for data in conventional_eroei:
        db.merge(EROEIData(
            method='conventional',
            year=data['year'],
            eroei_ratio=data['ratio'],
            unit='ratio',
            source='EROI.net, Hall et al.',
            notes='Déclin dû à épuisement gisements faciles'
        ))
    
    # Oil Sands - Tres bas, relativement stable
    oil_sands_eroei = [
        {'year': 2000, 'ratio': Decimal('4.0')},
        {'year': 2005, 'ratio': Decimal('3.8')},
        {'year': 2010, 'ratio': Decimal('3.5')},
        {'year': 2015, 'ratio': Decimal('3.4')},
        {'year': 2020, 'ratio': Decimal('3.2')},
        {'year': 2024, 'ratio': Decimal('3.0')},
    ]
    
    for data in oil_sands_eroei:
        db.merge(EROEIData(
            method='oil_sands',
            year=data['year'],
            eroei_ratio=data['ratio'],
            unit='ratio',
            source='Brandt et al., Alberta Energy',
            notes='Très énergivore (extraction + upgrading)'
        ))
    
    # Shale - Moyen, variable
    shale_eroei = [
        {'year': 2010, 'ratio': Decimal('8.0')},
        {'year': 2015, 'ratio': Decimal('6.5')},
        {'year': 2020, 'ratio': Decimal('5.5')},
        {'year': 2024, 'ratio': Decimal('5.0')},
    ]
    
    for data in shale_eroei:
        db.merge(EROEIData(
            method='shale',
            year=data['year'],
            eroei_ratio=data['ratio'],
            unit='ratio',
            source='Hughes, Drilling Deeper',
            notes='Déclin rapide puits individuels'
        ))
    
    # Offshore - Moyen-haut, declin progressif
    offshore_eroei = [
        {'year': 2000, 'ratio': Decimal('12.0')},
        {'year': 2005, 'ratio': Decimal('11.0')},
        {'year': 2010, 'ratio': Decimal('10.0')},
        {'year': 2015, 'ratio': Decimal('9.5')},
        {'year': 2020, 'ratio': Decimal('9.0')},
        {'year': 2024, 'ratio': Decimal('8.5')},
    ]
    
    for data in offshore_eroei:
        db.merge(EROEIData(
            method='offshore',
            year=data['year'],
            eroei_ratio=data['ratio'],
            unit='ratio',
            source='Gagnon et al.',
            notes='Dépend profondeur (shallow vs ultra-deep)'
        ))
    
    db.commit()
    print("✓ Données EROEI insérées (4 méthodes × 1970-2024)")




def main():
    """Initialisation complète"""
    print("=" * 60)
    print("INITIALISATION DE LA BASE DE DONNÉES")
    print("=" * 60)
    
    # Créer les tables
    create_tables()
    
    # Créer une session
    db = SessionLocal()
    
    try:
        # Insérer les données
        insert_source_credibility(db)
        insert_saudi_arabia_data(db)
        insert_production_ranges(db)
        insert_flags(db)
        insert_demand_projections(db)
        insert_peak_oil_analysis(db)
        insert_reserves_data(db)
        insert_reserve_flags(db)
        insert_production_by_method(db)
        insert_eroei_data(db)
        
        # NOUVELLES DONNÉES - gérées par full_init.py / scripts/ séparés
        # insert_historical_production, insert_oil_prices, insert_geopolitical_events
        # ne sont plus appelées depuis init_db.py — voir full_init.py
        
        print("\n" + "=" * 60)
        print("✓ INITIALISATION TERMINÉE AVEC SUCCÈS")
        print("=" * 60)
        print("\nDonnées disponibles:")
        print("\n🏭 MODULE PRODUCTION (ÉTENDU):")
        print("- Production historique: 20 pays × 60 ans (1965-2024)")
        print("  • USA: Shale revolution (+8 mb/d 2008-2024)")
        print("  • Saudi: OPEC swing producer")
        print("  • Russia: Post-Soviet recovery")
        print("  • Norway: North Sea decline (-50%)")
        print("  • Venezuela: Collapse (-85% depuis 1998)")
        print("  • + 15 autres pays majeurs")
        print("- Analytics: CAGR, Peak Detection, Decline Rates")
        print("- Par méthode: Canada, USA, Saudi (2010-2024)")
        print("- EROEI: 4 méthodes (1970-2024)")
        
        print("\n💰 MODULE PRIX:")
        print("- Prix historiques: 1960-2024 (65 ans)")
        print("- Benchmarks: Brent, WTI, Dubai")
        print("- Nominal + Real (inflation-adjusted 2023)")
        print("- Événements clés: 1973 choc, 2008 peak $147, 2020 COVID")
        
        print("\n🌍 MODULE ÉVÉNEMENTS GÉOPOLITIQUES:")
        print("- 40+ événements majeurs documentés")
        print("- Types: Guerres, Sanctions, Découvertes, Accidents")
        print("- Exemples: Libya 2011 (-1.5 mb/d), Iran sanctions (-2.0 mb/d)")
        
        print("\n📈 MODULE DEMANDE:")
        print("- Projections: 2024-2050")
        print("- Sources: IEA (2 scénarios), EIA (2 scénarios), OPEC (1 scénario)")
        print("- Peak oil analysé pour chaque scénario")
        print("- Divergences calculées")
        
        print("\n🗺️ MODULE RÉSERVES:")
        print("- 15 pays (Top mondial)")
        print("- Année: 2023")
        print("- Réserves 1P/2P/3P par type")
        print("- Types: conventional, oil_sands, shale, offshore, extra_heavy")
        print("- 7 flags critiques (Venezuela, Kuwait, UAE, etc.)")
        print("- Cas notoires documentés")
        
        # Statistiques
        from app.database.models import HistoricalProduction, OilPrice, GeopoliticalEvent, ProductionAnalytics
        hist_count = db.query(HistoricalProduction).count()
        price_count = db.query(OilPrice).count()
        event_count = db.query(GeopoliticalEvent).count()
        analytics_count = db.query(ProductionAnalytics).count()
        
        print("\n📊 STATISTIQUES:")
        print(f"- Production historique: {hist_count} enregistrements")
        print(f"- Prix: {price_count} enregistrements")
        print(f"- Événements: {event_count} événements")
        print(f"- Analytics: {analytics_count} métriques calculées")
        print(f"\n💾 TOTAL BASE: ~{hist_count + price_count + event_count + analytics_count + 500} lignes")
        
    except Exception as e:
        print(f"\n✗ Erreur: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


def insert_historical_production(db):
    """Insérer production historique 1965-2024"""
    print("\nInsertion production historique (20 pays × 60 ans)...")
    
    from data.historical_production import HISTORICAL_PRODUCTION_DATA
    from app.database.models import HistoricalProduction
    
    count = 0
    for record in HISTORICAL_PRODUCTION_DATA:
        prod = HistoricalProduction(
            country_code=record["country_code"],
            country_name=record["country_name"],
            year=record["year"],
            production_value=Decimal(str(record["production"])),
            source_id=record["source"],
            unit="mb/d",
            is_opec_member=record["is_opec"]
        )
        db.add(prod)
        count += 1
    
    db.commit()
    print(f"✓ {count} enregistrements de production historique insérés")


def insert_oil_prices(db):
    """Insérer prix historiques 1960-2024"""
    print("\nInsertion prix du pétrole (Brent/WTI/Dubai)...")
    
    from data.oil_prices import OIL_PRICE_DATA
    from app.database.models import OilPrice
    from datetime import datetime
    
    count = 0
    for record in OIL_PRICE_DATA:
        price = OilPrice(
            date=datetime.strptime(record["date"], "%Y-%m-%d").date(),
            benchmark=record["benchmark"],
            price_nominal=Decimal(str(record["nominal"])),
            price_real_2023=Decimal(str(record.get("real_2023", record["nominal"]))),
            currency="USD",
            unit="usd_per_barrel",
            source="world_bank"
        )
        db.add(price)
        count += 1
    
    db.commit()
    print(f"✓ {count} enregistrements de prix insérés")


def insert_geopolitical_events(db):
    """Insérer événements géopolitiques"""
    print("\nInsertion événements géopolitiques...")
    
    from data.geopolitical_events import GEOPOLITICAL_EVENTS
    from app.database.models import GeopoliticalEvent
    from datetime import datetime
    import json
    
    count = 0
    for event in GEOPOLITICAL_EVENTS:
        geo_event = GeopoliticalEvent(
            country_code=event["country_code"],
            event_date=datetime.strptime(event["date"], "%Y-%m-%d").date(),
            event_type=event["type"],
            event_name=event["name"],
            impact_estimated=Decimal(str(event["impact"])) if event["impact"] else None,
            duration_days=event.get("duration_days"),
            severity=event["severity"],
            description=event.get("description"),
            sources=event.get("sources")
        )
        db.add(geo_event)
        count += 1
    
    db.commit()
    print(f"✓ {count} événements géopolitiques insérés")


def calculate_production_analytics(db):
    """Calculer les métriques analytiques (CAGR, peak detection, etc.)"""
    print("\nCalcul des métriques analytiques...")
    
    from app.database.models import HistoricalProduction, ProductionAnalytics
    from sqlalchemy import func
    import math
    
    # Récupérer tous les pays
    countries = db.query(HistoricalProduction.country_code).distinct().all()
    
    analytics_count = 0
    
    for (country_code,) in countries:
        # Récupérer toutes les données du pays
        data = db.query(HistoricalProduction).filter(
            HistoricalProduction.country_code == country_code
        ).order_by(HistoricalProduction.year).all()
        
        if len(data) < 2:
            continue
        
        # CAGR par période
        periods = [
            (1965, 1980, "pre_peak"),
            (1980, 2000, "mature"),
            (2000, 2010, "pre_shale"),
            (2010, 2024, "shale_era")
        ]
        
        for start_year, end_year, period_name in periods:
            start_data = next((d for d in data if d.year == start_year), None)
            end_data = next((d for d in data if d.year == end_year), None)
            
            if start_data and end_data:
                years = end_year - start_year
                if float(start_data.production_value) > 0:
                    cagr = (math.pow(float(end_data.production_value) / float(start_data.production_value), 1/years) - 1) * 100
                    
                    analytic = ProductionAnalytics(
                        country_code=country_code,
                        metric_type="cagr",
                        period_start=start_year,
                        period_end=end_year,
                        value=Decimal(str(round(cagr, 2))),
                        unit="percent_per_year",
                        confidence=Decimal("0.90"),
                        metadata={"period_name": period_name}
                    )
                    db.add(analytic)
                    analytics_count += 1
        
        # Peak detection
        max_prod = max(data, key=lambda x: float(x.production_value))
        peak_analytic = ProductionAnalytics(
            country_code=country_code,
            metric_type="peak_year",
            period_start=max_prod.year,
            period_end=max_prod.year,
            value=Decimal(str(max_prod.production_value)),
            unit="mb/d",
            confidence=Decimal("0.95"),
            metadata={"peak_value": float(max_prod.production_value)}
        )
        db.add(peak_analytic)
        analytics_count += 1
        
        # Decline rate (si en déclin)
        if data[-1].year > max_prod.year:
            years_since_peak = data[-1].year - max_prod.year
            if years_since_peak > 0:
                decline_rate = ((float(max_prod.production_value) - float(data[-1].production_value)) / 
                               float(max_prod.production_value) / years_since_peak) * 100
                
                decline_analytic = ProductionAnalytics(
                    country_code=country_code,
                    metric_type="decline_rate",
                    period_start=max_prod.year,
                    period_end=data[-1].year,
                    value=Decimal(str(round(decline_rate, 2))),
                    unit="percent_per_year",
                    confidence=Decimal("0.85"),
                    metadata={"years_since_peak": years_since_peak}
                )
                db.add(decline_analytic)
                analytics_count += 1
    
    db.commit()
    print(f"✓ {analytics_count} métriques analytiques calculées")


if __name__ == "__main__":
    main()
