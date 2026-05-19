import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { COUNTRY_COLORS, TOOLTIP_STYLE, GRID_STYLE, AXIS_STYLE } from '@/utils/chartColors';

interface ReservesPoint {
  country_code: string;
  country_name: string;
  year: number;
  proven_1p: number | null;
  crude_conventional: number | null;
  non_conventional: number | null;
  is_opec_member: boolean;
}

interface Props {
  data: ReservesPoint[];
}

// Événements marquants sur les réserves
const RESERVES_EVENTS = [
  { year: 1987, label: 'Inflation OPEC\n(SAU, UAE, IRQ)', color: '#B85450' },
  { year: 2003, label: 'Sables bitumineux\nCanada reconnus', color: '#C17F24' },
  { year: 2010, label: 'Révolution shale\nUSA', color: '#2E7D6B' },
];

export default function HistoricalReservesChart({ data }: Props) {
  const [metric, setMetric] = useState<'proven_1p' | 'crude_conventional' | 'non_conventional'>('proven_1p');
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['SAU', 'VEN', 'CAN', 'IRN', 'IRQ', 'USA']);

  const countries = useMemo(() =>
    [...new Set(data.map(d => d.country_code))].sort(),
  [data]);

  const getName = (code: string) =>
    data.find(d => d.country_code === code)?.country_name ?? code;

  const chartData = useMemo(() => {
    const byYear: Record<number, any> = {};
    data.forEach(d => {
      if (!selectedCountries.includes(d.country_code)) return;
      if (!byYear[d.year]) byYear[d.year] = { year: d.year };
      byYear[d.year][d.country_code] = d[metric];
    });
    return Object.values(byYear).sort((a, b) => a.year - b.year);
  }, [data, selectedCountries, metric]);

  const METRIC_LABELS = {
    proven_1p: 'Réserves 1P totales (Gb)',
    crude_conventional: 'Brut conventionnel uniquement (Gb)',
    non_conventional: 'Non-conventionnel (sables + schiste + extra-lourd) (Gb)',
  };

  const toggle = (code: string) => {
    setSelectedCountries(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  return (
    <div className="w-full">
      {/* Contrôles */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex flex-wrap gap-2">
          {Object.entries(METRIC_LABELS).map(([key, label]) => (
            <button key={key} onClick={() => setMetric(key as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded border transition ${
                metric === key
                  ? 'bg-oil-slate text-white border-oil-slate'
                  : 'bg-white text-oil-slate border-oil-sand-dark'
              }`}>
              {key === 'proven_1p' ? 'Total 1P' : key === 'crude_conventional' ? 'Brut conv.' : 'Non-conv.'}
            </button>
          ))}
          <span className="text-xs text-oil-slate/50 self-center ml-2">{METRIC_LABELS[metric]}</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {countries.map(code => (
            <button key={code} onClick={() => toggle(code)}
              className={`px-2.5 py-1 rounded text-xs font-semibold border transition ${
                selectedCountries.includes(code)
                  ? 'text-white border-transparent'
                  : 'bg-white text-oil-slate/50 border-oil-sand-dark hover:text-oil-slate'
              }`}
              style={selectedCountries.includes(code) ? {
                backgroundColor: COUNTRY_COLORS[code] ?? '#8E7F6B',
                borderColor: COUNTRY_COLORS[code] ?? '#8E7F6B',
              } : {}}>
              {code}
            </button>
          ))}
        </div>
      </div>

      {/* Graphique */}
      <ResponsiveContainer width="100%" height={420}>
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 50 }}>
          <CartesianGrid {...GRID_STYLE} />
          <XAxis dataKey="year" {...AXIS_STYLE}
            label={{ value: 'Année', position: 'insideBottom', offset: -15, fill: '#2C3E50', fontSize: 12 }} />
          <YAxis {...AXIS_STYLE}
            label={{ value: 'Milliards barils (Gb)', angle: -90, position: 'insideLeft', fill: '#2C3E50', fontSize: 11 }} />
          <Tooltip {...TOOLTIP_STYLE}
            formatter={(v: number, name: string) => [`${v?.toFixed(0) ?? '—'} Gb`, getName(name)]} />
          <Legend wrapperStyle={{ paddingTop: 20, fontSize: 11 }}
            formatter={v => <span style={{ color: '#2C3E50' }}>{getName(v)}</span>} />
          {selectedCountries.map(code => (
            <Line key={code} type="monotone" dataKey={code}
              stroke={COUNTRY_COLORS[code] ?? '#8E7F6B'}
              strokeWidth={2} dot={{ r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5 }} name={code} connectNulls />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Annotations événements */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        {RESERVES_EVENTS.map(e => (
          <div key={e.year} className="flex items-start gap-2 bg-oil-sand-light rounded p-3 border border-oil-sand-dark">
            <div className="text-sm font-bold shrink-0" style={{ color: e.color }}>{e.year}</div>
            <div className="text-xs text-oil-slate/70 leading-snug whitespace-pre-line">{e.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
