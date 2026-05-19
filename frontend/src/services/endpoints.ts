import { api } from './api';
import type { 
  ProductionRange, SourceComparison, SourceCredibility, Country, 
  DemandProjection, PeakOilAnalysis, ScenarioComparison,
  Reserve, ReserveFlag, CountryReservesSummary,
  ProductionByMethod, EROEI, ReservesByType, AvailableMethods
} from '@/types';

export const productionAPI = {
  getRanges: async (country: string, yearStart: number, yearEnd: number): Promise<ProductionRange[]> => {
    const { data } = await api.get(`/production/ranges/${country}`, {
      params: { year_start: yearStart, year_end: yearEnd }
    });
    return data;
  },

  getComparison: async (country: string, year: number): Promise<SourceComparison[]> => {
    const { data } = await api.get(`/production/comparison/${country}/${year}`);
    return data;
  },

  getByMethod: async (
    countryCode?: string,
    yearStart: number = 2000,
    yearEnd: number = 2024
  ): Promise<ProductionByMethod[]> => {
    const { data } = await api.get('/production/by-method', {
      params: { country_code: countryCode, year_start: yearStart, year_end: yearEnd }
    });
    return data;
  },

  getEROEI: async (
    method?: string,
    yearStart: number = 1970,
    yearEnd: number = 2024
  ): Promise<EROEI[]> => {
    const { data } = await api.get('/production/eroei', {
      params: { method, year_start: yearStart, year_end: yearEnd }
    });
    return data;
  },

  getMethods: async (): Promise<AvailableMethods> => {
    const { data } = await api.get('/production/methods');
    return data;
  },
};

export const demandAPI = {
  getProjections: async (
    sourceId?: string,
    scenario?: string,
    yearStart: number = 2024,
    yearEnd: number = 2050
  ): Promise<DemandProjection[]> => {
    const { data } = await api.get('/demand/projections', {
      params: { source_id: sourceId, scenario, year_start: yearStart, year_end: yearEnd }
    });
    return data;
  },

  getPeakAnalysis: async (): Promise<PeakOilAnalysis[]> => {
    const { data } = await api.get('/demand/peak-analysis');
    return data;
  },

  getScenarioComparison: async (year: number): Promise<ScenarioComparison> => {
    const { data } = await api.get(`/demand/comparison/${year}`);
    return data;
  },

  getScenarios: async (): Promise<Record<string, string[]>> => {
    const { data } = await api.get('/demand/scenarios');
    return data;
  },
};

export const reservesAPI = {
  getAll: async (year?: number, countryCode?: string): Promise<Reserve[]> => {
    const { data } = await api.get('/reserves/all', {
      params: { year, country_code: countryCode }
    });
    return data;
  },

  getFlags: async (countryCode?: string): Promise<ReserveFlag[]> => {
    const { data } = await api.get('/reserves/flags', {
      params: { country_code: countryCode }
    });
    return data;
  },

  getMapData: async (year: number = 2023): Promise<CountryReservesSummary[]> => {
    const { data } = await api.get('/reserves/map', {
      params: { year }
    });
    return data;
  },

  getTop: async (year: number = 2023, limit: number = 15): Promise<Reserve[]> => {
    const { data } = await api.get('/reserves/top', {
      params: { year, limit }
    });
    return data;
  },

  getByType: async (year: number = 2023): Promise<ReservesByType[]> => {
    const { data } = await api.get('/reserves/by-type', {
      params: { year }
    });
    return data;
  },
};

export const metadataAPI = {
  getCountries: async (): Promise<Country[]> => {
    const { data } = await api.get('/metadata/countries');
    return data;
  },

  getSources: async (): Promise<SourceCredibility[]> => {
    const { data } = await api.get('/metadata/sources');
    return data;
  },
};
