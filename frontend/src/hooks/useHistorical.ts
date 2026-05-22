import { useQuery } from '@tanstack/react-query';
import { historicalAPI, pricesAPI } from '@/services/historical';

// Production historique
export const useHistoricalProduction = (params?: {
  country_code?: string;
  start_year?: number;
  end_year?: number;
}) => {
  return useQuery({
    queryKey: ['historical-production', params],
    queryFn: () => historicalAPI.getProduction(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Liste des pays
export const useHistoricalCountries = () => {
  return useQuery({
    queryKey: ['historical-countries'],
    queryFn: () => historicalAPI.getCountries(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Analytics
export const useProductionAnalytics = (params?: {
  country_code?: string;
  metric_type?: string;
}) => {
  return useQuery({
    queryKey: ['production-analytics', params],
    queryFn: () => historicalAPI.getAnalytics(params),
    staleTime: 5 * 60 * 1000,
  });
};

// Comparaison pays
export const useCountryComparison = (params: {
  countries: string[];
  start_year?: number;
  end_year?: number;
}) => {
  return useQuery({
    queryKey: ['country-comparison', params],
    queryFn: () => historicalAPI.compareCountries(params),
    enabled: params.countries.length > 0,
    staleTime: 5 * 60 * 1000,
  });
};

// OPEC vs Non-OPEC
export const useOPECComparison = (params?: {
  start_year?: number;
  end_year?: number;
}) => {
  return useQuery({
    queryKey: ['opec-comparison', params],
    queryFn: () => historicalAPI.getOPECComparison(params),
    staleTime: 5 * 60 * 1000,
  });
};

// Prix
export const useOilPrices = (params?: {
  benchmark?: 'brent' | 'wti' | 'dubai';
  start_date?: string;
  end_date?: string;
}) => {
  return useQuery({
    queryKey: ['oil-prices', params],
    queryFn: () => pricesAPI.getPrices(params),
    staleTime: 5 * 60 * 1000,
  });
};

// Comparaison benchmarks prix
export const usePriceComparison = (params?: {
  start_date?: string;
  end_date?: string;
  use_real?: boolean;
}) => {
  return useQuery({
    queryKey: ['price-comparison', params],
    queryFn: () => pricesAPI.compareBenchmarks(params),
    staleTime: 5 * 60 * 1000,
  });
};

// Statistiques prix
export const usePriceStatistics = (params?: {
  benchmark?: string;
  start_year?: number;
  end_year?: number;
}) => {
  return useQuery({
    queryKey: ['price-statistics', params],
    queryFn: () => pricesAPI.getStatistics(params),
    enabled: !!params?.benchmark,
    staleTime: 10 * 60 * 1000,
  });
};

// Événements prix
export const usePriceEvents = () => {
  return useQuery({
    queryKey: ['price-events'],
    queryFn: () => pricesAPI.getEvents(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// ─── Phase 2 hooks ────────────────────────────────────────────────────────────

export const useRegionalDemand = (params?: {
  start_year?: number;
  end_year?: number;
  region_code?: string;
}) => {
  return useQuery({
    queryKey: ['regional-demand', params],
    queryFn: async () => [],
    staleTime: 10 * 60 * 1000,
  });
};

export const useHistoricalReserves = (params?: {
  country_code?: string;
  start_year?: number;
  end_year?: number;
}) => {
  return useQuery({
    queryKey: ['historical-reserves', params],
    queryFn: async () => [],
    staleTime: 10 * 60 * 1000,
  });
};
