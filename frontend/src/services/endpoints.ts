// Toutes les données sont statiques — plus de backend requis
import type {
  ProductionByMethod, EROEI, AvailableMethods,
  DemandProjection, PeakOilAnalysis, ScenarioComparison,
  Reserve, ReserveFlag, CountryReservesSummary, ReservesByType,
  Country, SourceCredibility,
  ProductionRange, SourceComparison,
} from '@/types';

const cache: Record<string, any> = {};
async function load<T>(file: string): Promise<T> {
  if (!cache[file]) {
    const res = await fetch(`/data/${file}`);
    cache[file] = res.ok ? await res.json() : [];
  }
  return cache[file];
}

export const productionAPI = {
  getRanges: async (_country: string, _y1: number, _y2: number): Promise<ProductionRange[]> => [],
  getComparison: async (_country: string, _year: number): Promise<SourceComparison[]> => [],
  getByMethod: async (): Promise<ProductionByMethod[]> => [],
  getEROEI: async (): Promise<EROEI[]> => [],
  getMethods: async (): Promise<AvailableMethods> => ({ methods: [], countries: [] }),
};

export const demandAPI = {
  getProjections: async (): Promise<DemandProjection[]> => [],
  getPeakAnalysis: async (): Promise<PeakOilAnalysis[]> => [],
  getScenarioComparison: async (_year: number): Promise<ScenarioComparison> => ({} as ScenarioComparison),
  getScenarios: async (): Promise<Record<string, string[]>> => ({}),
};

export const reservesAPI = {
  getAll: async (): Promise<Reserve[]> => [],
  getFlags: async (): Promise<ReserveFlag[]> => [],
  getMapData: async (): Promise<CountryReservesSummary[]> => [],
  getTop: async (): Promise<Reserve[]> => [],
  getByType: async (): Promise<ReservesByType[]> => [],
};

export const metadataAPI = {
  getCountries: async (): Promise<Country[]> => {
    const prod = await load<any[]>('production.json');
    const seen = new Set<string>();
    return prod
      .filter((d: any) => { if (seen.has(d.country_code)) return false; seen.add(d.country_code); return true; })
      .map((d: any) => ({ code: d.country_code, name: d.country_name ?? d.country_code }));
  },
  getSources: async (): Promise<SourceCredibility[]> => [],
};
