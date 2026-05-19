import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { PRICE_COLORS, TOOLTIP_STYLE, GRID_STYLE, AXIS_STYLE } from '@/utils/chartColors';
import type { PriceComparison } from '@/types/historical';

interface Props {
  data: PriceComparison[];
  useRealPrices?: boolean;
  showEvents?: boolean;
}

const EVENTS = [
  { year: 1973, label: '1er choc',    color: '#B85450' },
  { year: 1979, label: 'Iran',        color: '#B85450' },
  { year: 1986, label: 'Contre-choc', color: '#8B4513' },
  { year: 2008, label: 'Pic',         color: '#B85450' },
  { year: 2020, label: 'COVID',       color: '#8E7F6B' },
  { year: 2022, label: 'Ukraine',     color: '#B85450' },
];

export default function OilPricesChart({ data, useRealPrices = false, showEvents = true }: Props) {

  const chartData = useMemo(() =>
    data.map(item => ({
      year: parseInt(item.date.substring(0, 4)),
      brent: item.brent ?? null,
      wti:   item.wti   ?? null,
      dubai: item.dubai ?? null,
    })).sort((a, b) => a.year - b.year),
  [data]);

  const brentVals = chartData.map(d => d.brent).filter(Boolean) as number[];
  const stats = brentVals.length
    ? { max: Math.max(...brentVals), min: Math.min(...brentVals), avg: brentVals.reduce((a,b)=>a+b,0)/brentVals.length }
    : null;

  return (
    <div className="w-full">
      {stats && (
        <div className="mb-4 grid grid-cols-3 gap-3">
          {[
            { label: 'Max Brent',  value: stats.max, color: 'text-oil-rust' },
            { label: 'Moyenne',    value: stats.avg, color: 'text-oil-blue' },
            { label: 'Min Brent',  value: stats.min, color: 'text-oil-slate' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-lg border border-oil-sand-dark p-3 text-center shadow-sm">
              <div className="text-xs text-oil-steel uppercase font-semibold mb-1">{s.label}</div>
              <div className={`text-xl font-bold ${s.color}`}>${s.value.toFixed(2)}</div>
            </div>
          ))}
        </div>
      )}

      <ResponsiveContainer width="100%" height={460}>
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 50 }}>
          <CartesianGrid {...GRID_STYLE} />
          <XAxis dataKey="year" {...AXIS_STYLE}
            label={{ value: 'Annee', position: 'insideBottom', offset: -15, fill: '#2C3E50', fontSize: 12 }} />
          <YAxis {...AXIS_STYLE}
            label={{ value: useRealPrices ? 'USD 2023/baril' : 'USD/baril', angle: -90, position: 'insideLeft', fill: '#2C3E50', fontSize: 11 }} />
          <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [`$${v.toFixed(2)}`]} />
          <Legend wrapperStyle={{ paddingTop: 24 }} iconType="line"
            formatter={(v) => <span style={{ color: '#2C3E50', fontSize: 12, textTransform: 'uppercase' }}>{v}</span>} />

          {showEvents && EVENTS.map(e => (
            <ReferenceLine key={e.year} x={e.year} stroke={e.color} strokeDasharray="4 3" opacity={0.5}
              label={{ value: e.label, fill: e.color, fontSize: 9, position: 'top' }} />
          ))}

          <Line type="monotone" dataKey="brent" stroke={PRICE_COLORS.brent} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} name="Brent" />
          <Line type="monotone" dataKey="wti"   stroke={PRICE_COLORS.wti}   strokeWidth={2}   dot={false} activeDot={{ r: 5 }} name="WTI" />
          <Line type="monotone" dataKey="dubai" stroke={PRICE_COLORS.dubai} strokeWidth={2}   dot={false} activeDot={{ r: 5 }} name="Dubai" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
