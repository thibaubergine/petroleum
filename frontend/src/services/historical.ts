import type {
  HistoricalProduction,
  OilPrice,
  CountryInfo,
} from '@/types/historical';

// Charge un fichier JSON statique depuis /public/data/
async function loadStatic<T>(file: string): Promise<T> {
  const res = await fetch(`/data/${file}`);
  if (!res.ok) throw new Error(`Failed to load ${file}`);
  return res.json();
}

// Cache en mémoire pour éviter les rechargements
const cache: Record<string, any> = {};
async function cached<T>(key: string, loader: () => Promise<T>): Promise<T> {
  if (!cache[key]) cache[key] = await loader();
  return cache[key];
}

export const historicalAPI = {
  getProduction: async (params?: {
    country_code?: string;
    start_year?: number;
    end_year?: number;
  }): Promise<HistoricalProduction[]> => {
    const data = await cached('production', () => loadStatic<HistoricalProduction[]>('production.json'));
    return data.filter((d: any) => {
      if (params?.country_code && d.country_code !== params.country_code) return false;
      if (params?.start_year && d.year < params.start_year) return false;
      if (params?.end_year && d.year > params.end_year) return false;
      return true;
    });
  },

  getCountries: async (): Promise<CountryInfo[]> => {
    const data = await cached('production', () => loadStatic<any[]>('production.json'));
    const seen = new Set<string>();
    return data
      .filter((d: any) => { if (seen.has(d.country_code)) return false; seen.add(d.country_code); return true; })
      .map((d: any) => ({
        country_code: d.country_code,
        country_name: d.country_name ?? d.country_code,
        code: d.country_code,
        name: d.country_name ?? d.country_code,
        start_year: 1965,
        end_year: 2024,
        data_points: 0,
        is_opec_member: false,
      }));
  },

  getAnalytics: async (_params?: { country_code?: string; metric_type?: string }): Promise<any[]> => {
    // Pas de fichier analytics séparé — retourner tableau vide
    return [];
  },

  compareCountries: async (params: { countries: string[]; start_year?: number; end_year?: number }): Promise<any[]> => {
    const data = await cached('production', () => loadStatic<any[]>('production.json'));
    return data.filter((d: any) => {
      if (!params.countries.includes(d.country_code)) return false;
      if (params.start_year && d.year < params.start_year) return false;
      if (params.end_year && d.year > params.end_year) return false;
      return true;
    });
  },

  getOPECComparison: async (_params?: { start_year?: number; end_year?: number }): Promise<any[]> => {
    return [];
  },
};

export const pricesAPI = {
  getPrices: async (params?: { benchmark?: string; start_date?: string; end_date?: string }): Promise<OilPrice[]> => {
    const data = await cached('prices', () => loadStatic<OilPrice[]>('prices.json'));
    return data.filter((d: any) => {
      if (params?.benchmark && d.benchmark !== params.benchmark) return false;
      if (params?.start_date && d.date < params.start_date) return false;
      if (params?.end_date && d.date > params.end_date) return false;
      return true;
    });
  },

  compareBenchmarks: async (_params?: any): Promise<any[]> => {
    const data = await cached('prices', () => loadStatic<any[]>('prices.json'));
    return data;
  },

  getStatistics: async (_params?: any): Promise<any> => {
    const data = await cached('prices', () => loadStatic<any[]>('prices.json'));
    if (!data.length) return {};
    const values = data.map((d: any) => d.nominal).filter(Boolean);
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a: number, b: number) => a + b, 0) / values.length,
      count: values.length,
    };
  },

  getEvents: async (): Promise<any[]> => {
    return cached('events', () => loadStatic<any[]>('events.json'));
  },
};
