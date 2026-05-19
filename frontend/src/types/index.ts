export interface ProductionRange {
  country_code: string;
  year: number;
  low: number;
  central: number;
  high: number;
  amplitude_percent: number;
  sources_used: string[];
  credibility_weighted: boolean;
  flags: string[];
}

export interface SourceComparison {
  source_id: string;
  value: number;
  unit: string;
  credibility_score: number;
  metric_type: string;
}

export interface SourceCredibility {
  source_id: string;
  transparency_score: number;
  verifiability_score: number;
  bias_absence_score: number;
  overall_score: number;
  notes?: string;
}

export interface Country {
  code: string;
  name: string;
  available_years: number[];
}

export interface DemandProjection {
  source_id: string;
  scenario: string;
  year: number;
  demand_value: number;
  unit: string;
}

export interface PeakOilAnalysis {
  source_id: string;
  scenario: string;
  peak_year: number | null;
  peak_value: number | null;
  has_peak: boolean;
  decline_rate: number | null;
  notes: string | null;
}

export interface ScenarioComparison {
  year: number;
  scenarios: Record<string, number>;
  amplitude_percent: number;
  divergence_flags: string[];
}

export interface Reserve {
  country_code: string;
  country_name: string;
  year: number;
  source_id: string;
  reserve_type: string;
  proven_1p: number | null;
  probable_2p: number | null;
  possible_3p: number | null;
  is_audited: boolean;
  is_opec_member: boolean;
  unit: string;
  notes: string | null;
}

export interface ReserveFlag {
  country_code: string;
  year: number | null;
  flag_type: string; // 'red' | 'orange' | 'blue' | 'purple'
  flag_reason: string;
  severity: number;
  details: Record<string, any> | null;
}

export interface CountryReservesSummary {
  country_code: string;
  country_name: string;
  latest_year: number;
  proven_1p: number;
  is_opec_member: boolean;
  flags: ReserveFlag[];
  latitude: number;
  longitude: number;
}

export interface ProductionByMethod {
  country_code: string;
  year: number;
  method: string;
  production_value: number;
  unit: string;
  notes: string | null;
}

export interface EROEI {
  method: string;
  year: number;
  eroei_ratio: number;
  unit: string;
  source: string | null;
  notes: string | null;
}

export interface ReservesByType {
  reserve_type: string;
  total_reserves: number;
  percentage: number;
  countries_count: number;
}

export interface AvailableMethods {
  methods: string[];
}

// Export all historical types
export type {
  HistoricalProduction,
  ProductionAnalytics,
  OilPrice,
  CountryInfo,
  OPECComparison,
  PriceComparison,
  PriceStatistics
} from './historical';
