import { api } from './api';
import type {
  HistoricalProduction,
  ProductionAnalytics,
  OilPrice,
  CountryInfo,
  OPECComparison,
  PriceComparison,
  PriceStatistics
} from '@/types/historical';

export const historicalAPI = {
  // Production historique
  getProduction: async (params?: {
    country_code?: string;
    start_year?: number;
    end_year?: number;
  }): Promise<HistoricalProduction[]> => {
    const queryParams = new URLSearchParams();
    if (params?.country_code) queryParams.append('country_code', params.country_code);
    if (params?.start_year) queryParams.append('start_year', params.start_year.toString());
    if (params?.end_year) queryParams.append('end_year', params.end_year.toString());
    
    const url = `/historical/production${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await api.get(url);
    return response.data;
  },

  // Liste des pays
  getCountries: async (): Promise<CountryInfo[]> => {
    const response = await api.get('/historical/countries');
    return response.data;
  },

  // Analytics
  getAnalytics: async (params?: {
    country_code?: string;
    metric_type?: string;
  }): Promise<ProductionAnalytics[]> => {
    const queryParams = new URLSearchParams();
    if (params?.country_code) queryParams.append('country_code', params.country_code);
    if (params?.metric_type) queryParams.append('metric_type', params.metric_type);
    
    const url = `/historical/analytics${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await api.get(url);
    return response.data;
  },

  // Comparaison multi-pays
  compareCountries: async (params: {
    countries: string[];
    start_year?: number;
    end_year?: number;
  }): Promise<any[]> => {
    const queryParams = new URLSearchParams();
    queryParams.append('countries', params.countries.join(','));
    if (params.start_year) queryParams.append('start_year', params.start_year.toString());
    if (params.end_year) queryParams.append('end_year', params.end_year.toString());
    
    const response = await api.get(`/historical/comparison?${queryParams}`);
    return response.data;
  },

  // OPEC vs Non-OPEC
  getOPECComparison: async (params?: {
    start_year?: number;
    end_year?: number;
  }): Promise<OPECComparison[]> => {
    const queryParams = new URLSearchParams();
    if (params?.start_year) queryParams.append('start_year', params.start_year.toString());
    if (params?.end_year) queryParams.append('end_year', params.end_year.toString());
    
    const url = `/historical/opec-vs-non-opec${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await api.get(url);
    return response.data;
  }
};

export const pricesAPI = {
  // Prix historiques
  getPrices: async (params?: {
    benchmark?: 'brent' | 'wti' | 'dubai';
    start_date?: string;
    end_date?: string;
  }): Promise<OilPrice[]> => {
    const queryParams = new URLSearchParams();
    if (params?.benchmark) queryParams.append('benchmark', params.benchmark);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    
    const url = `/prices${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await api.get(url);
    return response.data;
  },

  // Comparaison benchmarks
  compareBenchmarks: async (params?: {
    start_date?: string;
    end_date?: string;
    use_real?: boolean;
  }): Promise<PriceComparison[]> => {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.use_real !== undefined) queryParams.append('use_real', params.use_real.toString());
    
    const response = await api.get(`/prices/comparison?${queryParams}`);
    return response.data;
  },

  // Statistiques prix
  getStatistics: async (params?: {
    benchmark?: string;
    start_year?: number;
    end_year?: number;
  }): Promise<PriceStatistics> => {
    const queryParams = new URLSearchParams();
    if (params?.benchmark) queryParams.append('benchmark', params.benchmark);
    if (params?.start_year) queryParams.append('start_year', params.start_year.toString());
    if (params?.end_year) queryParams.append('end_year', params.end_year.toString());
    
    const response = await api.get(`/prices/statistics?${queryParams}`);
    return response.data;
  },

  // Événements prix clés
  getEvents: async (): Promise<any[]> => {
    const response = await api.get('/prices/events');
    return response.data;
  }
};
