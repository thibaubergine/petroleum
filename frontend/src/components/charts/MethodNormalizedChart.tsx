/**
 * Évolution des méthodes — Barres 100% normalisées
 * Une barre par année, chaque couleur = un type de production
 * Montre clairement le glissement conventionnel → non-conventionnel
 */
import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList
} from 'recharts';
import { GRID_STYLE, AXIS_STYLE } from '@/utils/chartColors';

const METHOD_CONFIG = {
  conventional: { color: '#2C3E50', label: 'Conventionnel' },
  shale:        { color: '#B85450', label: 'Schiste (tight oil)' },
  oil_sands:    { color: '#8B4513', label: 'Sables bitumineux' },
  offshore:     { color: '#4A90A4', label: 'Offshore' },
  eor:          { color: '#6B8E6B', label: 'EOR' },
};

// Données USA hardcodées sur 1965-2024 pour montrer l'évolution longue
const USA_LONG_DATA = [
  { year: 1965, conventional: 92, shale: 0, offshore: 8,  oil_sands: 0, eor: 0 },
  { year: 1970, conventional: 89, shale: 0, offshore: 9,  oil_sands: 0, eor: 2 },
  { year: 1975, conventional: 86, shale: 0, offshore: 10, oil_sands: 0, eor: 4 },
  { year: 1980, conventional: 83, shale: 0, offshore: 11, oil_sands: 0, eor: 6 },
  { year: 1985, conventional: 80, shale: 1, offshore: 13, oil_sands: 0, eor: 6 },
  { year: 1990, conventional: 76, shale: 2, offshore: 16, oil_sands: 0, eor: 6 },
  { year: 1995, conventional: 72, shale: 3, offshore: 19, oil_sands: 0, eor: 6 },
  { year: 2000, conventional: 68, shale: 4, offshore: 22, oil_sands: 0, eor: 6 },
  { year: 2005, conventional: 62, shale: 7, offshore: 25, oil_sands: 0, eor: 6 },
  { year: 2010, conventional: 48, shale: 27, offshore: 20, oil_sands: 0, eor: 5 },
  { year: 2015, conventional: 32, shale: 55, offshore: 10, oil_sands: 0, eor: 3 },
  { year: 2018, conventional: 24, shale: 62, offshore: 11, oil_sands: 0, eor: 3 },
  { year: 2020, conventional: 20, shale: 64, offshore: 13, oil_sands: 0, eor: 3 },
  { year: 2022, conventional: 18, shale: 67, offshore: 12, oil_sands: 0, eor: 3 },
  { year: 2024, conventional: 17, shale: 70, offshore: 11, oil_sands: 0, eor: 2 },
];

const CAN_LONG_DATA = [
  { year: 1965, conventional: 95, shale: 0, oil_sands: 2,  offshore: 3, eor: 0 },
  { year: 1975, conventional: 88, shale: 0, oil_sands: 8,  offshore: 4, eor: 0 },
  { year: 1985, conventional: 82, shale: 0, oil_sands: 14, offshore: 4, eor: 0 },
  { year: 1995, conventional: 74, shale: 0, oil_sands: 22, offshore: 4, eor: 0 },
  { year: 2000, conventional: 52, shale: 0, oil_sands: 44, offshore: 4, eor: 0 },
  { year: 2005, conventional: 38, shale: 0, oil_sands: 58, offshore: 4, eor: 0 },
  { year: 2010, conventional: 28, shale: 0, oil_sands: 68, offshore: 4, eor: 0 },
  { year: 2015, conventional: 22, shale: 0, oil_sands: 74, offshore: 4, eor: 0 },
  { year: 2020, conventional: 18, shale: 0, oil_sands: 78, offshore: 4, eor: 0 },
  { year: 2024, conventional: 16, shale: 0, oil_sands: 80, offshore: 4, eor: 0 },
];

const SAUDI_LONG_DATA = [
  { year: 1965, conventional: 98, shale: 0, oil_sands: 0, offshore: 0, eor: 2 },
  { year: 1980, conventional: 96, shale: 0, oil_sands: 0, offshore: 0, eor: 4 },
  { year: 2000, conventional: 92, shale: 0, oil_sands: 0, offshore: 0, eor: 8 },
  { year: 2010, conventional: 90, shale: 0, oil_sands: 0, offshore: 0, eor: 10 },
  { year: 2020, conventional: 88, shale: 0, oil_sands: 0, offshore: 0, eor: 12 },
  { year: 2024, conventional: 87, shale: 0, oil_sands: 0, offshore: 0, eor: 13 },
];

const COUNTRY_DATA: Record<string, typeof USA_LONG_DATA> = {
  USA: USA_LONG_DATA,
  CAN: CAN_LONG_DATA,
  SAU: SAUDI_LONG_DATA,
};

const COUNTRY_LABELS: Record<string, string> = {
  USA: 'États-Unis — Révolution shale',
  CAN: 'Canada — Montée des sables bitumineux',
  SAU: 'Arabie Saoudite — Conventionnel dominant + EOR',
};

interface Props { country?: string }

export default function MethodNormalizedChart({ country = 'USA' }: Props) {
  const data = COUNTRY_DATA[country] ?? USA_LONG_DATA;
  const methods = Object.keys(METHOD_CONFIG).filter(m =>
    data.some(d => (d as any)[m] > 0)
  );

  return (
    <div className="w-full">
      <div className="text-xs text-oil-slate/60 mb-3 leading-relaxed">
        Composition en % — chaque couleur = une méthode. Montre clairement le glissement
        du conventionnel vers les méthodes alternatives au fil des décennies.
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 20 }} barSize={28}>
          <CartesianGrid {...GRID_STYLE} vertical={false} />
          <XAxis dataKey="year" {...AXIS_STYLE}
            label={{ value: 'Année', position: 'insideBottom', offset: -10, fill: '#2C3E50', fontSize: 11 }} />
          <YAxis {...AXIS_STYLE} domain={[0, 100]}
            label={{ value: '%', angle: -90, position: 'insideLeft', fill: '#2C3E50', fontSize: 11 }}
            tickFormatter={v => `${v}%`} />
          <Tooltip
            contentStyle={{ backgroundColor: '#FFFAF4', border: '1px solid #D4C7B3', borderRadius: '8px', fontSize: 11 }}
            formatter={(v: number, name: string) => [`${v}%`, METHOD_CONFIG[name as keyof typeof METHOD_CONFIG]?.label ?? name]} />
          <Legend wrapperStyle={{ paddingTop: 12, fontSize: 11 }}
            formatter={v => METHOD_CONFIG[v as keyof typeof METHOD_CONFIG]?.label ?? v} />
          {methods.map(m => (
            <Bar key={m} dataKey={m} stackId="a"
              fill={METHOD_CONFIG[m as keyof typeof METHOD_CONFIG].color}
              name={m} radius={m === methods[methods.length-1] ? [3,3,0,0] : [0,0,0,0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
