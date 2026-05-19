from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class ProductionRangeResponse(BaseModel):
    """Réponse API pour un range de production"""
    country_code: str
    year: int
    low: float
    central: float
    high: float
    amplitude_percent: float
    sources_used: list[str]
    credibility_weighted: bool
    flags: list[str] = []
    
    model_config = {"from_attributes": True}


class SourceComparisonResponse(BaseModel):
    """Comparaison des valeurs par source"""
    source_id: str
    value: float
    unit: str
    credibility_score: float
    metric_type: str


class FlagResponse(BaseModel):
    """Détails d'un flag"""
    flag_type: str  # 'red', 'orange', 'blue', 'gray'
    flag_reason: str
    severity: int
    details: dict
    
    model_config = {"from_attributes": True}


class SourceCredibilityResponse(BaseModel):
    """Scoring de crédibilité d'une source"""
    source_id: str
    transparency_score: float
    verifiability_score: float
    bias_absence_score: float
    overall_score: float
    notes: Optional[str] = None
    
    model_config = {"from_attributes": True}


class CountryListResponse(BaseModel):
    """Liste des pays disponibles"""
    code: str
    name: str
    available_years: list[int]


class DemandProjectionResponse(BaseModel):
    """Projection de demande"""
    source_id: str
    scenario: str
    year: int
    demand_value: float
    unit: str
    
    model_config = {"from_attributes": True}


class PeakOilAnalysisResponse(BaseModel):
    """Analyse du peak oil par scénario"""
    source_id: str
    scenario: str
    peak_year: Optional[int]
    peak_value: Optional[float]
    has_peak: bool
    decline_rate: Optional[float]
    notes: Optional[str]
    
    model_config = {"from_attributes": True}


class ScenarioComparisonResponse(BaseModel):
    """Comparaison des scénarios pour une année donnée"""
    year: int
    scenarios: dict[str, float]  # scenario_name: demand_value
    amplitude_percent: float
    divergence_flags: list[str]


class ReserveResponse(BaseModel):
    """Réserves pétrolières d'un pays"""
    country_code: str
    country_name: str
    year: int
    source_id: str
    reserve_type: str
    proven_1p: Optional[float]
    probable_2p: Optional[float]
    possible_3p: Optional[float]
    is_audited: bool
    is_opec_member: bool
    unit: str
    notes: Optional[str]
    
    model_config = {"from_attributes": True}


class ReserveFlagResponse(BaseModel):
    """Flag d'anomalie sur les réserves"""
    country_code: str
    year: Optional[int]
    flag_type: str
    flag_reason: str
    severity: int
    details: Optional[dict]
    
    model_config = {"from_attributes": True}


class CountryReservesSummary(BaseModel):
    """Résumé des réserves d'un pays avec flags"""
    country_code: str
    country_name: str
    latest_year: int
    proven_1p: float
    is_opec_member: bool
    flags: list[ReserveFlagResponse]
    latitude: float
    longitude: float


class ProductionByMethodResponse(BaseModel):
    """Production par méthode d'extraction"""
    country_code: str
    year: int
    method: str
    production_value: float
    unit: str
    notes: Optional[str]
    
    model_config = {"from_attributes": True}


class EROEIResponse(BaseModel):
    """EROEI par méthode et année"""
    method: str
    year: int
    eroei_ratio: float
    unit: str
    source: Optional[str]
    notes: Optional[str]
    
    model_config = {"from_attributes": True}


class ReservesByTypeResponse(BaseModel):
    """Réserves agrégées par type"""
    reserve_type: str
    total_reserves: float
    percentage: float
    countries_count: int


class OilPriceResponse(BaseModel):
    """Prix du pétrole"""
    date: str
    benchmark: str
    price_nominal: float
    price_real_2023: Optional[float]
    currency: str
    unit: str
    source: Optional[str]
    
    model_config = {"from_attributes": True}


class HistoricalProductionResponse(BaseModel):
    """Production historique"""
    country_code: str
    country_name: str
    year: int
    production_value: float
    source_id: str
    unit: str
    is_opec_member: bool
    notes: Optional[str]
    
    model_config = {"from_attributes": True}


class ProductionAnalyticsResponse(BaseModel):
    """Métriques analytiques"""
    country_code: str
    metric_type: str
    period_start: Optional[int]
    period_end: Optional[int]
    value: float
    unit: Optional[str]
    confidence: Optional[float]
    meta_info: Optional[dict]  # Renamed from 'metadata'
    
    model_config = {"from_attributes": True}


class GeopoliticalEventResponse(BaseModel):
    """Événements géopolitiques"""
    country_code: str
    event_date: str
    event_type: str
    event_name: str
    impact_estimated: Optional[float]
    duration_days: Optional[int]
    severity: int
    description: Optional[str]
    sources: Optional[dict]
    
    model_config = {"from_attributes": True}

