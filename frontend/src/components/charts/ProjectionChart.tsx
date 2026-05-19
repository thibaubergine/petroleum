import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TOOLTIP_STYLE, GRID_STYLE, AXIS_STYLE } from '@/utils/chartColors';

// Couleurs différenciées pour chaque scénario
const SCENARIO_PALETTE: Record<string, { color: string; dash?: string; width?: number }> = {
  'IEA Stated Policies': { color: '#2C3E50', width: 2.5 },
  'IEA Net Zero':        { color: '#2E7D6B', dash: '6 3', width: 2 },
  'EIA Reference':       { color: '#C17F24', width: 2.5 },
  'EIA Low Growth':      { color: '#D4813A', dash: '4 4', width: 2 },
  'OPEC Reference':      { color: '#B85450', width: 2.5 },
  // Scénarios additionnels
  'Shell Sky 1.5':       { color: '#4A90A4', dash: '8 3', width: 1.5 },
  'IEA APS':             { color: '#7B5EA7', dash: '5 3', width: 2 },
  'BP Net Zero':         { color: '#5D8A52', dash: '6 2', width: 1.5 },
};

const SCENARIO_ORDER = [
  'OPEC Reference','EIA Reference','EIA Low Growth','IEA Stated Policies','IEA APS','IEA Net Zero','Shell Sky 1.5','BP Net Zero',
];

interface Props { data: any[] }

export default function ProjectionChart({ data }: Props) {
  const { chartData, scenarios } = useMemo(() => {
    const byYear: Record<number, any> = {};
    const scenarioSet = new Set<string>();

    data.forEach(d => {
      const key = `${d.source_id} ${d.scenario}`.trim();
      const label = d.scenario || d.source_id;
      scenarioSet.add(label);
      if (!byYear[d.year]) byYear[d.year] = { year: d.year };
      byYear[d.year][label] = d.demand_value;
    });

    const sortedScenarios = [...scenarioSet].sort((a, b) => {
      const ia = SCENARIO_ORDER.indexOf(a), ib = SCENARIO_ORDER.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });

    return {
      chartData: Object.values(byYear).sort((a, b) => a.year - b.year),
      scenarios: sortedScenarios,
    };
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height={440}>
      <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 50 }}>
        <CartesianGrid {...GRID_STYLE} />
        <XAxis dataKey="year" {...AXIS_STYLE}
          label={{ value: 'Année', position: 'insideBottom', offset: -15, fill: '#2C3E50', fontSize: 12 }} />
        <YAxis {...AXIS_STYLE} domain={[60, 130]}
          label={{ value: 'mb/d', angle: -90, position: 'insideLeft', fill: '#2C3E50', fontSize: 12 }} />
        <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [`${v.toFixed(1)} mb/d`]} />
        <Legend wrapperStyle={{ paddingTop: 24, fontSize: 11 }} />
        <ReferenceLine y={100} stroke="#2C3E50" strokeDasharray="3 3" opacity={0.3}
          label={{ value: '100 mb/d', fill: '#2C3E50', fontSize: 9, position: 'right' }} />
        {scenarios.map(s => {
          const style = SCENARIO_PALETTE[s] ?? { color: '#8E7F6B', width: 1.5 };
          return (
            <Line key={s} type="monotone" dataKey={s}
              stroke={style.color} strokeWidth={style.width ?? 2}
              strokeDasharray={style.dash} dot={false}
              activeDot={{ r: 4 }} connectNulls name={s} />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
}
