import { useQuery } from '@tanstack/react-query';
import { productionAPI, metadataAPI } from '@/services/endpoints';

interface ProductionRangeParams {
  country: string;
  yearStart: number;
  yearEnd: number;
}

export function useProductionRanges(params: ProductionRangeParams) {
  return useQuery({
    queryKey: ['production-ranges', params],
    queryFn: () => productionAPI.getRanges(params.country, params.yearStart, params.yearEnd),
    staleTime: 5 * 60 * 1000, // Cache 5min
  });
}

export function useSourceComparison(country: string, year: number) {
  return useQuery({
    queryKey: ['source-comparison', country, year],
    queryFn: () => productionAPI.getComparison(country, year),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCountries() {
  return useQuery({
    queryKey: ['countries'],
    queryFn: metadataAPI.getCountries,
    staleTime: 60 * 60 * 1000, // Cache 1h (données stables)
  });
}

export function useSources() {
  return useQuery({
    queryKey: ['sources'],
    queryFn: metadataAPI.getSources,
    staleTime: 60 * 60 * 1000,
  });
}

export function useProductionByMethod(
  countryCode?: string,
  yearStart: number = 2000,
  yearEnd: number = 2024
) {
  return useQuery({
    queryKey: ['production-by-method', countryCode, yearStart, yearEnd],
    queryFn: () => productionAPI.getByMethod(countryCode, yearStart, yearEnd),
    staleTime: 5 * 60 * 1000,
  });
}

export function useEROEI(
  method?: string,
  yearStart: number = 1970,
  yearEnd: number = 2024
) {
  return useQuery({
    queryKey: ['production-eroei', method, yearStart, yearEnd],
    queryFn: () => productionAPI.getEROEI(method, yearStart, yearEnd),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAvailableMethods() {
  return useQuery({
    queryKey: ['production-methods'],
    queryFn: productionAPI.getMethods,
    staleTime: 60 * 60 * 1000, // Données stables
  });
}
