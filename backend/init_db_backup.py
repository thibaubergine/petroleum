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
        {
            'source_id': 'eia',
            'transparency_score': Decimal('0.95'),
            'verifiability_score': Decimal('0.90'),
            'bias_absence_score': Decimal('0.85'),
            'overall_score': Decimal('0.73'),  # 0.95 × 0.90 × 0.85
            'notes': 'US Energy Information Administration - haute transparence'
        },
        {
            'source_id': 'iea',
            'transparency_score': Decimal('0.90'),
            'verifiability_score': Decimal('0.85'),
            'bias_absence_score': Decimal('0.80'),
            'overall_score': Decimal('0.61'),  # 0.90 × 0.85 × 0.80
            'notes': 'International Energy Agency - standard OCDE'
        },
        {
            'source_id': 'opec',
            'transparency_score': Decimal('0.70'),
            'verifiability_score': Decimal('0.60'),
            'bias_absence_score': Decimal('0.50'),
            'overall_score': Decimal('0.21'),  # 0.70 × 0.60 × 0.50
            'notes': 'OPEC - biais structurel lié aux quotas'
        }
    ]
    
    for source in sources:
        db.merge(SourceCredibility(**source))
    
    db.commit()
    print("✓ 3 sources insérées")


def insert_saudi_arabia_data(db):
    """Insérer les données exemple pour l'Arabie Saoudite (2020-2024)"""
    print("\nInsertion des données Saudi Arabia...")
    
    # Données brutes par source (simplifié)
    raw_data = [
        # 2020
        {'source_id': 'eia', 'country_code': 'SAU', 'year': 2020, 'value': Decimal('9.2')},
        {'source_id': 'iea', 'country_code': 'SAU', 'year': 2020, 'value': Decimal('9.0')},
        {'source_id': 'opec', 'country_code': 'SAU', 'year': 2020, 'value': Decimal('9.1')},
        # 2021
        {'source_id': 'eia', 'country_code': 'SAU', 'year': 2021, 'value': Decimal('9.1')},
        {'source_id': 'iea', 'country_code': 'SAU', 'year': 2021, 'value': Decimal('8.9')},
        {'source_id': 'opec', 'country_code': 'SAU', 'year': 2021, 'value': Decimal('9.0')},
        # 2022
        {'source_id': 'eia', 'country_code': 'SAU', 'year': 2022, 'value': Decimal('10.5')},
        {'source_id': 'iea', 'country_code': 'SAU', 'year': 2022, 'value': Decimal('10.4')},
        {'source_id': 'opec', 'country_code': 'SAU', 'year': 2022, 'value': Decimal('10.6')},
        # 2023
        {'source_id': 'eia', 'country_code': 'SAU', 'year': 2023, 'value': Decimal('10.2')},
        {'source_id': 'iea', 'country_code': 'SAU', 'year': 2023, 'value': Decimal('10.0')},
        {'source_id': 'opec', 'country_code': 'SAU', 'year': 2023, 'value': Decimal('10.3')},
        # 2024
        {'source_id': 'eia', 'country_code': 'SAU', 'year': 2024, 'value': Decimal('9.8')},
        {'source_id': 'iea', 'country_code': 'SAU', 'year': 2024, 'value': Decimal('9.6')},
        {'source_id': 'opec', 'country_code': 'SAU', 'year': 2024, 'value': Decimal('9.9')},
    ]
    
    for data in raw_data:
        db.merge(RawProduction(
            **data,
            unit='mb/d',
            metric_type='all_liquids'
        ))
    
    # Données harmonisées (identiques pour cet exemple)
    for data in raw_data:
        db.merge(HarmonizedProduction(**data, unit='mb/d'))
    
    db.commit()
    print("✓ Données brutes et harmonisées insérées")


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
    ]
    
    for range_data in ranges:
        db.merge(ProductionRange(**range_data))
    
    db.commit()
    print("✓ Ranges de production insérés")


def insert_flags(db):
    """Insérer quelques flags exemple"""
    print("\nInsertion des flags...")
    
    # Aucun flag critique pour Saudi Arabia (données cohérentes)
    # Mais on peut ajouter un flag bleu pour divergence définitionnelle mineure
    flag = AutomatedFlag(
        country_code='SAU',
        year=2024,
        flag_type='blue',
        flag_reason='Divergence définitionnelle mineure',
        severity=1,
        details={'note': 'Écart <5% entre sources, cohérence acceptable'}
    )
    db.add(flag)
    db.commit()
    print("✓ Flags insérés")


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
    
    # Conventional - Déclin continu
    conventional_eroei = [
        {'year': 1970, 'ratio': Decimal('35.0')},
        {'year': 1980, 'ratio': Decimal('30.0')},
        {'year': 1990, 'ratio': Decimal('25.0')},
        {'year': 2000, 'ratio': Decimal('20.0')},
        {'year': 2010, 'ratio': Decimal('17.0')},
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
    
    # Oil Sands - Très bas, stable
    oil_sands_eroei = [
        {'year': 2000, 'ratio': Decimal('4.0')},
        {'year': 2010, 'ratio': Decimal('3.5')},
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
    
    # Offshore - Moyen-haut, stable
    offshore_eroei = [
        {'year': 2000, 'ratio': Decimal('12.0')},
        {'year': 2010, 'ratio': Decimal('10.0')},
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
        
        print("\n" + "=" * 60)
        print("✓ INITIALISATION TERMINÉE AVEC SUCCÈS")
        print("=" * 60)
        print("\nDonnées disponibles:")
        print("\n📊 MODULE PRODUCTION:")
        print("- Pays: Saudi Arabia (SAU)")
        print("- Période: 2020-2024")
        print("- Sources: EIA, IEA, OPEC")
        print("- Ranges calculés avec scoring de crédibilité")
        print("- Par méthode: Canada, USA, Saudi (2010-2024)")
        print("- EROEI: 4 méthodes (1970-2024)")
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
        
    except Exception as e:
        print(f"\n✗ Erreur: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()
