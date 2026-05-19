import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TOOLTIP_STYLE, GRID_STYLE, AXIS_STYLE } from '@/utils/chartColors';
import type { EROEI } from '@/types';

interface Props { data: EROEI[] }

const METHOD_CONFIG = {
  conventional: { color: '#2C3E50', label: 'Conventionnel', width: 2.5 },
  offshore:     { color: '#4A90A4', label: 'Offshore',      width: 2 },
  shale:        { color: '#C17F24', label: 'Schiste (shale)', width: 2 },
  oil_sands:    { color: '#B85450', label: 'Sables bitumineux', width: 2 },
};

export default function EROEILineChart({ data }: Props) {
  // Grouper par année
  const chartData = data.reduce((acc, item) => {
    const existing = acc.find(d => d.year === item.year);
    if (existing) {
      existing[item.method] = Number(item.eroei_ratio);
    } else {
      acc.push({ year: item.year, [item.method]: Number(item.eroei_ratio) });
    }
    return acc;
  }, [] as any[]).sort((a, b) => a.year - b.year);

  const methods = [...new Set(data.map(d => d.method))];

  const conv1970 = chartData.find(d => d.year === 1970)?.conventional ?? 35;
  const conv2024 = chartData[chartData.length - 1]?.conventional ?? 14;
  const decline = ((conv1970 - conv2024) / conv1970 * 100).toFixed(0);

  return (
    <div className="space-y-4">
      {/* Graphique */}
      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 40 }}>
          <CartesianGrid {...GRID_STYLE} />
          <XAxis dataKey="year" {...AXIS_STYLE}
            label={{ value: 'Année', position: 'insideBottom', offset: -15, fill: '#2C3E50', fontSize: 12 }} />
          <YAxis {...AXIS_STYLE} domain={[0, 40]}
            label={{ value: 'EROEI (ratio)', angle: -90, position: 'insideLeft', fill: '#2C3E50', fontSize: 11 }} />
          <Tooltip {...TOOLTIP_STYLE}
            formatter={(v: number, name: string) => [
              `${v.toFixed(1)}:1`,
              METHOD_CONFIG[name as keyof typeof METHOD_CONFIG]?.label ?? name
            ]} />
          <Legend wrapperStyle={{ paddingTop: 20, fontSize: 11 }}
            formatter={v => METHOD_CONFIG[v as keyof typeof METHOD_CONFIG]?.label ?? v} />

          {/* Zones de référence */}
          <ReferenceLine y={10} stroke="#2C3E50" strokeDasharray="4 4" opacity={0.3}
            label={{ value: '10:1 — seuil rentabilité élevée', fill: '#2C3E50', fontSize: 9, position: 'right' }} />
          <ReferenceLine y={5} stroke="#B85450" strokeDasharray="5 5" opacity={0.6}
            label={{ value: '5:1 — seuil critique', fill: '#B85450', fontSize: 9, position: 'right' }} />
          <ReferenceLine y={3} stroke="#B85450" strokeOpacity={0.4}
            label={{ value: '3:1 — limite viabilité', fill: '#B85450', fontSize: 9, position: 'right' }} />

          {methods.map(m => {
            const cfg = METHOD_CONFIG[m as keyof typeof METHOD_CONFIG];
            return (
              <Line key={m} type="monotone" dataKey={m}
                stroke={cfg?.color ?? '#8E7F6B'} strokeWidth={cfg?.width ?? 2}
                dot={{ r: 3, strokeWidth: 0, fill: cfg?.color ?? '#8E7F6B' }}
                activeDot={{ r: 5 }} name={m} connectNulls />
            );
          })}
        </LineChart>
      </ResponsiveContainer>

      {/* Note sur les données */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 leading-relaxed">
        <strong>Note sur les données :</strong> Les points de données sont décennaux (tous les 5-10 ans) car les études EROEI sont coûteuses
        et rares. Les courbes affichent des lignes droites entre mesures — la réalité est certainement plus variable.
        Shale : données depuis 2010 seulement (technologie récente). Offshore et sables bitumineux : depuis 2000.
        Conventionnel : depuis 1970 (études Hall et al. pionnières).
      </div>

      {/* Alerte déclin + lecture */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-3 bg-oil-rust/5 border border-oil-rust/20 rounded-lg">
          <div className="font-bold text-oil-rust text-sm mb-1.5">
            Déclin conventionnel : -{decline}% depuis 1970
          </div>
          <p className="text-xs text-oil-slate/70 leading-relaxed">
            Le pétrole conventionnel est passé de {conv1970}:1 à {conv2024}:1 en 54 ans.
            Chaque baril produit aujourd'hui coûte 2,5× plus d'énergie qu'en 1970.
            C'est pourquoi les prix du pétrole ont une tendance structurelle haussière,
            indépendamment de la géopolitique.
          </p>
        </div>
        <div className="bg-oil-sand-light rounded-lg p-3 border border-oil-sand-dark">
          <div className="font-bold text-oil-slate text-xs uppercase mb-2">Comment lire ce graphique</div>
          <div className="space-y-1 text-xs text-oil-slate/70">
            <div><strong>35:1 conventionnel (1970)</strong> = 1 baril investi → 35 récupérés</div>
            <div><strong>14:1 conventionnel (2024)</strong> = 1 baril investi → 14 récupérés</div>
            <div><strong>3:1 sables bitumineux</strong> = 1 baril investi → 3 récupérés</div>
            <div className="pt-1 text-oil-rust/70">En dessous de 3:1, on approche du break-even énergétique</div>
          </div>
        </div>
      </div>
    </div>
  );
}

