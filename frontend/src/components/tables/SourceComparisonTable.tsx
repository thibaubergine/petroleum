import type { SourceComparison } from '@/types';

interface Props {
  data: SourceComparison[];
  year: number;
}

// Métadonnées sources enrichies
const SOURCE_META: Record<string, {
  label: string;
  type: 'official' | 'sector' | 'commercial' | 'caution';
  color: string;
  badge: string;
  access: string;
  freq: string;
}> = {
  eia:          { label: 'EIA',         type: 'official',    color: 'bg-green-100 text-green-800 border-green-300',  badge: 'Officiel',    access: 'API gratuite',   freq: 'Mensuel'   },
  iea:          { label: 'IEA',         type: 'official',    color: 'bg-blue-100 text-blue-800 border-blue-300',     badge: 'Officiel',    access: 'Partiel libre',  freq: 'Annuel'    },
  opec:         { label: 'OPEC',        type: 'caution',     color: 'bg-red-100 text-red-800 border-red-300',        badge: 'Précaution',  access: 'Partiel libre',  freq: 'Mensuel'   },
  bp:           { label: 'BP/EI',       type: 'sector',      color: 'bg-amber-100 text-amber-800 border-amber-300',  badge: 'Sectoriel',   access: 'Excel public',   freq: 'Annuel'    },
  jodi:         { label: 'JODI',        type: 'official',    color: 'bg-teal-100 text-teal-800 border-teal-300',     badge: 'Officiel',    access: 'API gratuite',   freq: 'Mensuel'   },
  world_bank:   { label: 'World Bank',  type: 'official',    color: 'bg-indigo-100 text-indigo-800 border-indigo-300', badge: 'Officiel',  access: 'API gratuite',   freq: 'Annuel'    },
  rystad:       { label: 'Rystad',      type: 'commercial',  color: 'bg-purple-100 text-purple-800 border-purple-300', badge: 'Commercial',access: 'Payant',         freq: 'Temps réel' },
  wood_mac:     { label: 'Wood Mac',    type: 'commercial',  color: 'bg-orange-100 text-orange-800 border-orange-300', badge: 'Commercial',access: 'Payant',         freq: 'Mensuel'   },
  sp_global:    { label: 'S&P Global',  type: 'commercial',  color: 'bg-slate-100 text-slate-800 border-slate-300',  badge: 'Commercial',  access: 'Payant',         freq: 'Temps réel' },
  opec_members: { label: 'Agences nat.', type: 'caution',    color: 'bg-red-50 text-red-700 border-red-200',         badge: 'Précaution',  access: 'Variable',       freq: 'Variable'  },
};

function credibilityColor(score: number) {
  if (score >= 0.6) return { bar: 'bg-green-500', text: 'text-green-700' };
  if (score >= 0.4) return { bar: 'bg-amber-500', text: 'text-amber-700' };
  if (score >= 0.2) return { bar: 'bg-orange-500', text: 'text-orange-700' };
  return { bar: 'bg-red-500', text: 'text-red-700' };
}

function deviationColor(pct: number) {
  const abs = Math.abs(pct);
  if (abs < 2) return 'text-oil-slate/50';
  if (abs < 5) return pct > 0 ? 'text-amber-600' : 'text-blue-600';
  return pct > 0 ? 'text-oil-rust font-bold' : 'text-blue-700 font-bold';
}

export default function SourceComparisonTable({ data, year }: Props) {
  if (!data || data.length === 0) return null;

  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const amplitude = ((max - min) / avg * 100);

  // Pondération crédibilité
  const totalScore = data.reduce((s, d) => s + d.credibility_score, 0);
  const weightedAvg = data.reduce((s, d) => s + d.value * d.credibility_score, 0) / totalScore;

  return (
    <div className="space-y-3">
      {/* En-tête avec métriques clés */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { label: 'Min', val: `${min.toFixed(2)} mb/d`, sub: data.find(d => d.value === min)?.source_id?.toUpperCase(), color: 'text-blue-600' },
          { label: 'Max', val: `${max.toFixed(2)} mb/d`, sub: data.find(d => d.value === max)?.source_id?.toUpperCase(), color: 'text-oil-rust' },
          { label: 'Amplitude', val: `${amplitude.toFixed(1)}%`, sub: amplitude > 10 ? '⚠ Divergence forte' : amplitude > 5 ? '△ Modérée' : '✓ Faible', color: amplitude > 10 ? 'text-oil-rust' : amplitude > 5 ? 'text-amber-600' : 'text-green-600' },
          { label: 'Moy. pondérée', val: `${weightedAvg.toFixed(2)} mb/d`, sub: 'Par crédibilité', color: 'text-oil-slate' },
        ].map(s => (
          <div key={s.label} className="bg-oil-sand-light rounded-lg p-2.5 border border-oil-sand-dark text-center">
            <div className="text-xs text-oil-slate/50 uppercase font-semibold">{s.label}</div>
            <div className={`text-base font-bold ${s.color}`}>{s.val}</div>
            <div className="text-xs text-oil-slate/40">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Tableau principal */}
      <div className="overflow-x-auto rounded-lg border border-oil-sand-dark">
        <table className="w-full text-xs">
          <thead className="bg-oil-slate text-oil-sand">
            <tr>
              <th className="text-left px-3 py-2.5 font-semibold uppercase tracking-wide">Source</th>
              <th className="text-left px-3 py-2.5 font-semibold uppercase tracking-wide">Type</th>
              <th className="text-right px-3 py-2.5 font-semibold uppercase tracking-wide">Valeur {year}</th>
              <th className="text-left px-3 py-2.5 font-semibold uppercase tracking-wide w-28">Crédibilité T×V×A</th>
              <th className="text-right px-3 py-2.5 font-semibold uppercase tracking-wide">Écart moy.</th>
              <th className="text-center px-3 py-2.5 font-semibold uppercase tracking-wide">Accès</th>
              <th className="text-center px-3 py-2.5 font-semibold uppercase tracking-wide">Fréq.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-oil-sand-dark bg-white">
            {data
              .sort((a, b) => b.credibility_score - a.credibility_score)
              .map(source => {
                const meta = SOURCE_META[source.source_id] ?? {
                  label: source.source_id.toUpperCase(),
                  type: 'official' as const,
                  color: 'bg-gray-100 text-gray-700 border-gray-300',
                  badge: 'Source',
                  access: '—',
                  freq: '—',
                };
                const deviation = ((source.value - avg) / avg * 100);
                const cred = credibilityColor(source.credibility_score);

                return (
                  <tr key={source.source_id} className="hover:bg-oil-sand-light/50 transition-colors">
                    {/* Source */}
                    <td className="px-3 py-2.5">
                      <span className="font-bold text-oil-slate">{meta.label}</span>
                    </td>

                    {/* Badge type */}
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${meta.color}`}>
                        {meta.badge}
                      </span>
                    </td>

                    {/* Valeur */}
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-oil-slate">
                      {source.value.toFixed(2)}
                      <span className="text-oil-slate/40 font-normal ml-1">{source.unit}</span>
                    </td>

                    {/* Crédibilité avec barre */}
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-oil-sand rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${cred.bar}`}
                            style={{ width: `${source.credibility_score * 100}%` }}
                          />
                        </div>
                        <span className={`font-mono font-bold text-xs ${cred.text}`}>
                          {(source.credibility_score * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>

                    {/* Écart */}
                    <td className={`px-3 py-2.5 text-right font-mono text-xs ${deviationColor(deviation)}`}>
                      {deviation >= 0 ? '+' : ''}{deviation.toFixed(1)}%
                    </td>

                    {/* Accès */}
                    <td className="px-3 py-2.5 text-center text-oil-slate/60">{meta.access}</td>

                    {/* Fréquence */}
                    <td className="px-3 py-2.5 text-center text-oil-slate/60">{meta.freq}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Barre visuelle comparative */}
      <div className="space-y-1.5">
        <div className="text-xs font-semibold text-oil-slate uppercase tracking-wide">
          Valeurs comparées {year}
        </div>
        {data
          .sort((a, b) => b.value - a.value)
          .map(source => {
            const meta = SOURCE_META[source.source_id];
            const pct = (source.value / max) * 100;
            return (
              <div key={source.source_id} className="flex items-center gap-3">
                <div className="w-16 text-xs font-semibold text-oil-slate/70 text-right">
                  {meta?.label ?? source.source_id.toUpperCase()}
                </div>
                <div className="flex-1 h-5 bg-oil-sand rounded-full overflow-hidden">
                  <div
                    className="h-full bg-oil-slate rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${pct}%` }}
                  >
                    <span className="text-white text-xs font-bold">{source.value.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        <div className="text-xs text-oil-slate/40 mt-1">
          Ligne rouge = moyenne pondérée par crédibilité ({weightedAvg.toFixed(2)} mb/d)
        </div>
      </div>

      {/* Note si divergence forte */}
      {amplitude > 10 && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
          <strong>Divergence significative ({amplitude.toFixed(1)}%)</strong> — Écart entre sources supérieur à 10%.
          Les données de {year} doivent être interprétées avec précaution.
          La valeur pondérée par crédibilité ({weightedAvg.toFixed(2)} mb/d) est plus fiable que la moyenne simple.
        </div>
      )}
    </div>
  );
}
