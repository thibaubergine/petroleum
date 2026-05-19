import { useQuery } from '@tanstack/react-query';
import { reservesAPI } from '@/services/endpoints';

export function useAllReserves(year?: number, countryCode?: string) {
  return useQuery({
    queryKey: ['reserves-all', year, countryCode],
    queryFn: () => reservesAPI.getAll(year, countryCode),
    staleTime: 60 * 60 * 1000, // Cache 1h (données stables)
  });
}

export function useReserveFlags(countryCode?: string) {
  return useQuery({
    queryKey: ['reserve-flags', countryCode],
    queryFn: () => reservesAPI.getFlags(countryCode),
    staleTime: 60 * 60 * 1000,
  });
}

export function useWorldMapData(year: number = 2023) {
  return useQuery({
    queryKey: ['world-map-data', year],
    queryFn: () => reservesAPI.getMapData(year),
    staleTime: 60 * 60 * 1000,
  });
}

export function useTopCountries(year: number = 2023, limit: number = 15) {
  return useQuery({
    queryKey: ['top-countries', year, limit],
    queryFn: () => reservesAPI.getTop(year, limit),
    staleTime: 60 * 60 * 1000,
  });
}

export function useReservesByType(year: number = 2023) {
  return useQuery({
    queryKey: ['reserves-by-type', year],
    queryFn: () => reservesAPI.getByType(year),
    staleTime: 60 * 60 * 1000, // Données stables
  });
}
