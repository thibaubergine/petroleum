// Types pour données historiques et prix
export interface HistoricalProduction {
  country_code: string;
  country_name: string;
  year: number;
  production_value: number;
  source_id: string;
  unit: string;
  is_opec_member: boolean;
  notes?: string;
}

export interface ProductionAnalytics {
  country_code: string;
  metric_type: string; // 'cagr', 'peak_year', 'decline_rate_exponential', 'volatility'
  period_start?: number;
  period_end?: number;
  value: number;
  unit?: string;
  confidence?: number;
  meta_info?: {
    period?: string;
    start_value?: number;
    end_value?: number;
    peak_year?: number;
    years_since_peak?: number;
    peak_ratio?: number;
    description?: string;
  };
}

export interface OilPrice {
  date: string;
  benchmark: 'brent' | 'wti' | 'dubai';
  price_nominal: number;
  price_real_2023?: number;
  currency: string;
  unit: string;
  source?: string;
}

export interface CountryInfo {
  country_code: string;
  country_name: string;
  start_year: number;
  end_year: number;
  data_points: number;
  is_opec_member: boolean;
}

export interface OPECComparison {
  year: number;
  opec: number;
  non_opec: number;
  opec_share: number;
  non_opec_share: number;
}

export interface PriceComparison {
  date: string;
  brent?: number;
  wti?: number;
  dubai?: number;
}

export interface PriceStatistics {
  benchmark: string;
  period: string;
  nominal: {
    mean: number;
    median: number;
    min: number;
    max: number;
    std_dev: number;
  };
  real_2023?: {
    mean: number;
    median: number;
    min: number;
    max: number;
    std_dev: number;
  };
  data_points: number;
}
