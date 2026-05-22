import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { TOOLTIP_STYLE, GRID_STYLE, AXIS_STYLE } from '@/utils/chartColors';
import type { ProductionByMethod } from '@/types';

// Couleurs cohérentes avec le reste du dashboard
const METHOD_CONFIG: Record<string, { color: string; label: string; short: string }> = {
  conventional: { color: '#2C3E50', label: 'Conventionnel',     short: 'Conv.' },
  shale:        { color: '#C17F24', label: 'Schiste (tight)',   short: 'Shale' },
  oil_sands:    { color: '#8B4513', label: 'Sables bitumineux', short: 'Sables' },
  offshore:     { color: '#4A90A4', label: 'Offshore',          short: 'Offshore' },
  eor:          { color: '#6B8E6B', label: 'EOR (tertiaire)',   short: 'EOR' },
};

const COUNTRY_CONFIG: Record<string, { label: string; note: string }> = {
  USA: { label: 'USA', note: 'Révolution shale 2008-2020 : +8 mb/d en 15 ans' },
  CAN: { label: 'Canada', note: '96% de la production vient des sables bitumineux (Athabasca)' },
  SAU: { label: 'Arabie Saoudite', note: '100% conventionnel — réservoir Ghawar découvert en 1948' },
};

// Événements marquants par pays
const EVENTS: Record<string, Array<{ year: number; label: string; method: string }>> = {
  USA: [
    { year: 2008, label: 'Début révolution shale', method: 'shale' },
    { year: 2014, label: 'USA = 1er producteur mondial', method: 'shale' },
    { year: 2020, label: 'COVID — chute puis rebond', method: 'shale' },
  ],
  CAN: [
    { year: 2003, label: 'Reconnaissance réserves Athabasca', method: 'oil_sands' },
    { year: 2012, label: 'Expansion minière majeure', method: 'oil_sands' },
  ],
  SAU: [
    { year: 1970, label: 'Pic production Ghawar', method: 'conventional' },
    { year: 2016, label: 'Accord OPEC+ baisse production', method: 'conventional' },
  ],
};

interface Props {
  dataUSA: ProductionByMethod[];
  dataCAN: ProductionByMethod[];
  dataSAU: ProductionByMethod[];
  latestYear?: number;
}

// Construit un point "composition" pour une année donnée
function buildYearPoint(data: ProductionByMethod[], year: number) {
  const yearData = data.filter(d => d.year === year);
  const point: Record<string, number> = {};
  yearData.forEach(d => { point[d.method] = Number(d.production_value); });
  return point;
}

export default function MethodCompareChart({ dataUSA, dataCAN, dataSAU, latestYear = 2023 }: Props) {
  // Construction d'un graphique barre côte-à-côte : USA / CAN / SAU par méthode
  const comparisonData = useMemo(() => {
    const years = [2010, 2015, 2020, latestYear];
    return years.map(year => {
      const usa = buildYearPoint(dataUSA, year);
      const can = buildYearPoint(dataCAN, year);
      const sau = buildYearPoint(dataSAU, year);
      return { year, ...usa, ...can, ...sau };
    });
  }, [dataUSA, dataCAN, dataSAU, latestYear]);

  // Données pour l'année récente (composition par pays)
  const latestComposition = useMemo(() => {
    const countries = [
      { key: 'USA', data: dataUSA },
      { key: 'CAN', data: dataCAN },
      { key: 'SAU', data: dataSAU },
    ];
    return countries.map(({ key, data }) => {
      const point: any = { country: COUNTRY_CONFIG[key]?.label ?? key };
      const yearData = data.filter(d => d.year === latestYear);
      let total = 0;
      yearData.forEach(d => {
        const val = Number(d.production_value);
        point[d.method] = val;
        total += val;
      });
      point.total = total;
      return point;
    });
  }, [dataUSA, dataCAN, dataSAU, latestYear]);

  const methods = Object.keys(METHOD_CONFIG).filter(m =>
    latestComposition.some(c => c[m] > 0)
  );

  return (
    <div className="space-y-6">
      {/* ── Composition {latestYear} en barres empilées ─────────────── */}
      <div>
        <div className="text-sm font-bold text-oil-slate mb-1">
          Composition de la production — {latestYear}
        </div>
        <p className="text-xs text-oil-slate/50 mb-3">
          Chaque barre = un pays. Couleurs = méthodes d'extraction.
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={latestComposition} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
            <CartesianGrid {...GRID_STYLE} />
            <XAxis dataKey="country" {...AXIS_STYLE} />
            <YAxis {...AXIS_STYLE}
              label={{ value: 'mb/d', angle: -90, position: 'insideLeft', fill: '#2C3E50', fontSize: 11 }} />
            <Tooltip
              {...TOOLTIP_STYLE}
              formatter={(v: number, name: string) => [
                `${v.toFixed(2)} mb/d`,
                METHOD_CONFIG[name]?.label ?? name
              ]} />
            <Legend
              wrapperStyle={{ paddingTop: 12, fontSize: 11 }}
              formatter={v => METHOD_CONFIG[v]?.label ?? v} />
            {methods.map(m => (
              <Bar key={m} dataKey={m} stackId="a"
                fill={METHOD_CONFIG[m]?.color ?? '#8E7F6B'} name={m} radius={m === 'eor' ? [3,3,0,0] : [0,0,0,0]}>
                <LabelList dataKey={m}
                  content={({ x, y, width, height, value }: any) => {
                    if (!value || value < 0.3) return null;
                    return (
                      <text x={Number(x) + Number(width) / 2} y={Number(y) + Number(height) / 2 + 4}
                        fill="white" textAnchor="middle" fontSize={10} fontWeight="600">
                        {Number(value).toFixed(1)}
                      </text>
                    );
                  }} />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Notes par pays ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {Object.entries(COUNTRY_CONFIG).map(([code, conf]) => {
          const events = EVENTS[code] ?? [];
          return (
            <div key={code} className="bg-oil-sand-light rounded-lg p-3 border border-oil-sand-dark">
              <div className="font-bold text-sm text-oil-slate mb-1">{conf.label}</div>
              <p className="text-xs text-oil-slate/60 mb-2 leading-relaxed">{conf.note}</p>
              {events.length > 0 && (
                <div className="space-y-1">
                  {events.map((e, i) => (
                    <div key={i} className="flex gap-2 text-xs">
                      <span className="font-bold shrink-0"
                        style={{ color: METHOD_CONFIG[e.method]?.color ?? '#2C3E50' }}>
                        {e.year}
                      </span>
                      <span className="text-oil-slate/60">{e.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
