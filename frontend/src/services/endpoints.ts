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
  getRanges: async (_c: string, _y1: number, _y2: number): Promise<ProductionRange[]> => [],
  getComparison: async (_c: string, _y: number): Promise<SourceComparison[]> => [],
  getByMethod: async (_c?: string, _y1?: number, _y2?: number): Promise<ProductionByMethod[]> => [],
  getEROEI: async (_m?: string, _y1?: number, _y2?: number): Promise<EROEI[]> => [],
  getMethods: async (): Promise<AvailableMethods> => ({ methods: [] }),
};

export const demandAPI = {
  getProjections: async (_s?: string, _sc?: string, _y1?: number, _y2?: number): Promise<DemandProjection[]> => [],
  getPeakAnalysis: async (): Promise<PeakOilAnalysis[]> => [],
  getScenarioComparison: async (_y: number): Promise<ScenarioComparison> => ({} as ScenarioComparison),
  getScenarios: async (): Promise<Record<string, string[]>> => ({}),
};

export const reservesAPI = {
  getAll: async (_y?: number, _c?: string): Promise<Reserve[]> => [],
  getFlags: async (_c?: string): Promise<ReserveFlag[]> => [],
  getMapData: async (_y?: number): Promise<CountryReservesSummary[]> => [],
  getTop: async (_y?: number, _l?: number): Promise<Reserve[]> => [],
  getByType: async (_y?: number): Promise<ReservesByType[]> => [],
};

export const metadataAPI = {
  getCountries: async (): Promise<Country[]> => {
    const prod = await load<any[]>('production.json');
    const seen = new Set<string>();
    return prod
      .filter((d: any) => { if (seen.has(d.country_code)) return false; seen.add(d.country_code); return true; })
      .map((d: any) => ({
        code: d.country_code,
        name: d.country_name ?? d.country_code,
        available_years: [],
      }));
  },
  getSources: async (): Promise<SourceCredibility[]> => [],
};
