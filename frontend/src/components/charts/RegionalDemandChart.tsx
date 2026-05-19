import { useMemo, useState } from 'react';
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TOOLTIP_STYLE, GRID_STYLE, AXIS_STYLE } from '@/utils/chartColors';

interface RegionalDataPoint {
  region_code: string;
  region_name: string;
  year: number;
  demand_value: number;
}

interface Props {
  data: RegionalDataPoint[];
  mode?: 'stacked' | 'lines';
}

const REGION_CONFIG: Record<string, { color: string; label: string; order: number }> = {
  north_america: { color: '#2C3E50', label: 'Amérique du Nord', order: 1 },
  europe:        { color: '#4A90A4', label: 'Europe',           order: 2 },
  former_ussr:   { color: '#7B5EA7', label: 'Ex-URSS',          order: 3 },
  china:         { color: '#B85450', label: 'Chine',            order: 4 },
  asia_pacific:  { color: '#C17F24', label: 'Asie-Pacifique',   order: 5 },
  middle_east:   { color: '#8B4513', label: 'Moyen-Orient',     order: 6 },
  latin_america: { color: '#2E7D6B', label: 'Amérique Latine',  order: 7 },
  africa:        { color: '#6B8E6B', label: 'Afrique',          order: 8 },
};

// Événements marquants avec impact sur la demande
const DEMAND_EVENTS = [
  { year: 1973, label: '1er choc pétrolier' },
  { year: 1979, label: 'Révolution iranienne' },
  { year: 1991, label: 'Effondrement URSS' },
  { year: 2008, label: 'Crise financière' },
  { year: 2020, label: 'COVID-19' },
];

export default function RegionalDemandChart({ data, mode = 'stacked' }: Props) {
  const [chartMode, setChartMode] = useState<'stacked' | 'lines'>(mode);
  const [showEvents, setShowEvents] = useState(true);

  const { chartData, regions } = useMemo(() => {
    const byYear: Record<number, any> = {};
    const regionSet = new Set<string>();

    data.filter(d => d.region_code !== 'world').forEach(d => {
      regionSet.add(d.region_code);
      if (!byYear[d.year]) byYear[d.year] = { year: d.year };
      byYear[d.year][d.region_code] = d.demand_value;
    });

    const sortedRegions = [...regionSet].sort(
      (a, b) => (REGION_CONFIG[a]?.order ?? 99) - (REGION_CONFIG[b]?.order ?? 99)
    );

    return {
      chartData: Object.values(byYear).sort((a, b) => a.year - b.year),
      regions: sortedRegions,
    };
  }, [data]);

  const worldData = useMemo(() =>
    data.filter(d => d.region_code === 'world')
      .sort((a, b) => a.year - b.year)
      .map(d => ({ year: d.year, world: d.demand_value })),
  [data]);

  // Statistiques intéressantes
  const stats = useMemo(() => {
    if (!chartData.length) return null;
    const last = chartData[chartData.length - 1];
    const first = chartData[0];
    const chinaGrowth = last.china && first.china
      ? ((last.china - first.china) / first.china * 100).toFixed(0)
      : null;
    const europeChange = last.europe && first.europe
      ? ((last.europe - first.europe) / first.europe * 100).toFixed(0)
      : null;
    return { chinaGrowth, europeChange, lastYear: last.year };
  }, [chartData]);

  return (
    <div className="w-full">
      {/* Contrôles */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex gap-2">
          <button onClick={() => setChartMode('stacked')}
            className={`px-3 py-1.5 text-xs font-semibold rounded border transition ${
              chartMode === 'stacked'
                ? 'bg-oil-slate text-white border-oil-slate'
                : 'bg-white text-oil-slate border-oil-sand-dark'
            }`}>
            Empilé
          </button>
          <button onClick={() => setChartMode('lines')}
            className={`px-3 py-1.5 text-xs font-semibold rounded border transition ${
              chartMode === 'lines'
                ? 'bg-oil-slate text-white border-oil-slate'
                : 'bg-white text-oil-slate border-oil-sand-dark'
            }`}>
            Lignes
          </button>
        </div>
        <label className="flex items-center gap-1.5 text-xs text-oil-slate cursor-pointer">
          <input type="checkbox" checked={showEvents} onChange={e => setShowEvents(e.target.checked)} />
          Événements
        </label>

        {/* Stats rapides */}
        {stats && (
          <div className="ml-auto flex gap-4 text-xs text-oil-slate/60">
            {stats.chinaGrowth && (
              <span>Chine depuis 1965 : <strong className="text-oil-rust">+{stats.chinaGrowth}%</strong></span>
            )}
            {stats.europeChange && (
              <span>Europe depuis 1965 : <strong className={Number(stats.europeChange) > 0 ? 'text-oil-slate' : 'text-green-600'}>{Number(stats.europeChange) > 0 ? '+' : ''}{stats.europeChange}%</strong></span>
            )}
          </div>
        )}
      </div>

      {/* Graphique principal */}
      <ResponsiveContainer width="100%" height={420}>
        {chartMode === 'stacked' ? (
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 50 }}>
            <CartesianGrid {...GRID_STYLE} />
            <XAxis dataKey="year" {...AXIS_STYLE}
              label={{ value: 'Année', position: 'insideBottom', offset: -15, fill: '#2C3E50', fontSize: 12 }} />
            <YAxis {...AXIS_STYLE}
              label={{ value: 'mb/d', angle: -90, position: 'insideLeft', fill: '#2C3E50', fontSize: 12 }} />
            <Tooltip {...TOOLTIP_STYLE}
              formatter={(v: number, name: string) => [
                `${v.toFixed(1)} mb/d`,
                REGION_CONFIG[name]?.label ?? name
              ]} />
            <Legend wrapperStyle={{ paddingTop: 20, fontSize: 11 }}
              formatter={v => REGION_CONFIG[v]?.label ?? v} />
            {regions.map(r => (
              <Area key={r} type="monotone" dataKey={r}
                stackId="1"
                stroke={REGION_CONFIG[r]?.color ?? '#8E7F6B'}
                fill={REGION_CONFIG[r]?.color ?? '#8E7F6B'}
                fillOpacity={0.75}
                strokeWidth={1}
                name={r}
                connectNulls />
            ))}
          </AreaChart>
        ) : (
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 50 }}>
            <CartesianGrid {...GRID_STYLE} />
            <XAxis dataKey="year" {...AXIS_STYLE}
              label={{ value: 'Année', position: 'insideBottom', offset: -15, fill: '#2C3E50', fontSize: 12 }} />
            <YAxis {...AXIS_STYLE}
              label={{ value: 'mb/d', angle: -90, position: 'insideLeft', fill: '#2C3E50', fontSize: 12 }} />
            <Tooltip {...TOOLTIP_STYLE}
              formatter={(v: number, name: string) => [
                `${v.toFixed(1)} mb/d`,
                REGION_CONFIG[name]?.label ?? name
              ]} />
            <Legend wrapperStyle={{ paddingTop: 20, fontSize: 11 }}
              formatter={v => REGION_CONFIG[v]?.label ?? v} />
            {regions.map(r => (
              <Line key={r} type="monotone" dataKey={r}
                stroke={REGION_CONFIG[r]?.color ?? '#8E7F6B'}
                strokeWidth={2} dot={false} activeDot={{ r: 4 }}
                name={r} connectNulls />
            ))}
          </LineChart>
        )}
      </ResponsiveContainer>

      {/* Contexte événements */}
      {showEvents && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
          {DEMAND_EVENTS.map(e => (
            <div key={e.year} className="bg-oil-sand-light rounded p-2 border border-oil-sand-dark text-center">
              <div className="text-sm font-bold text-oil-rust">{e.year}</div>
              <div className="text-xs text-oil-slate/60 leading-tight">{e.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
