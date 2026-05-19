import { useQuery } from '@tanstack/react-query';
import { demandAPI } from '@/services/endpoints';

export function useDemandProjections(
  sourceId?: string,
  scenario?: string,
  yearStart: number = 2024,
  yearEnd: number = 2050
) {
  return useQuery({
    queryKey: ['demand-projections', sourceId, scenario, yearStart, yearEnd],
    queryFn: () => demandAPI.getProjections(sourceId, scenario, yearStart, yearEnd),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePeakOilAnalysis() {
  return useQuery({
    queryKey: ['peak-oil-analysis'],
    queryFn: demandAPI.getPeakAnalysis,
    staleTime: 60 * 60 * 1000, // Cache 1h (données stables)
  });
}

export function useScenarioComparison(year: number) {
  return useQuery({
    queryKey: ['scenario-comparison', year],
    queryFn: () => demandAPI.getScenarioComparison(year),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAvailableScenarios() {
  return useQuery({
    queryKey: ['available-scenarios'],
    queryFn: demandAPI.getScenarios,
    staleTime: 60 * 60 * 1000,
  });
}
