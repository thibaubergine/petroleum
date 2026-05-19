import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { COUNTRY_COLORS, TOOLTIP_STYLE, GRID_STYLE, AXIS_STYLE } from '@/utils/chartColors';
import type { HistoricalProduction } from '@/types/historical';

interface Props {
  data: HistoricalProduction[];
  selectedCountries: string[];
  showPeaks?: boolean;
}

export default function HistoricalTimeline({ data, selectedCountries, showPeaks = false }: Props) {

  const chartData = useMemo(() => {
    const byYear: Record<number, any> = {};
    data.forEach(r => {
      if (!selectedCountries.includes(r.country_code)) return;
      if (!byYear[r.year]) byYear[r.year] = { year: r.year };
      byYear[r.year][r.country_code] = r.production_value;
    });
    return Object.values(byYear).sort((a, b) => a.year - b.year);
  }, [data, selectedCountries]);

  const peaks = useMemo(() => {
    if (!showPeaks) return {};
    const result: Record<string, { year: number; value: number }> = {};
    selectedCountries.forEach(code => {
      const rows = data.filter(d => d.country_code === code);
      if (!rows.length) return;
      const peak = rows.reduce((m, c) => c.production_value > m.production_value ? c : m);
      result[code] = { year: peak.year, value: peak.production_value };
    });
    return result;
  }, [data, selectedCountries, showPeaks]);

  const getName = (code: string) =>
    data.find(d => d.country_code === code)?.country_name ?? code;

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={480}>
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 50 }}>
          <CartesianGrid {...GRID_STYLE} />
          <XAxis dataKey="year" {...AXIS_STYLE}
            label={{ value: 'Annee', position: 'insideBottom', offset: -15, fill: '#2C3E50', fontSize: 12 }} />
          <YAxis {...AXIS_STYLE}
            label={{ value: 'mb/d', angle: -90, position: 'insideLeft', fill: '#2C3E50', fontSize: 12 }} />
          <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [`${v.toFixed(2)} mb/d`]} />
          <Legend wrapperStyle={{ paddingTop: 24 }} iconType="line"
            formatter={(v) => <span style={{ color: '#2C3E50', fontSize: 12 }}>{getName(v)}</span>} />
          {selectedCountries.map(code => (
            <Line key={code} type="monotone" dataKey={code}
              stroke={COUNTRY_COLORS[code] ?? '#8E7F6B'} strokeWidth={2}
              dot={false} activeDot={{ r: 5 }} name={code} />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {showPeaks && Object.keys(peaks).length > 0 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(peaks).map(([code, pk]) => (
            <div key={code} className="bg-white rounded-lg border border-oil-sand-dark p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COUNTRY_COLORS[code] ?? '#8E7F6B' }} />
                <span className="text-xs font-bold text-oil-slate">{getName(code)}</span>
              </div>
              <div className="text-lg font-bold text-oil-rust">{pk.value.toFixed(1)} mb/d</div>
              <div className="text-xs text-oil-steel">Peak: {pk.year}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
