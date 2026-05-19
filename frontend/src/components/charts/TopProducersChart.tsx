/**
 * Top Producteurs par Décennie — Barres Horizontales
 * Montre l'évolution du classement sur 4 périodes clés
 * Vision claire : émergence USA shale, chute URSS/Russie, montée Canada
 */
import { useMemo, useState } from 'react';
import type { HistoricalProduction } from '@/types/historical';

const COUNTRY_NAMES: Record<string, string> = {
  USA:'États-Unis', SAU:'Arabie Saoudite', RUS:'Russie / URSS',
  IRQ:'Iraq', IRN:'Iran', ARE:'UAE', CAN:'Canada',
  KWT:'Koweït', BRA:'Brésil', NOR:'Norvège', VEN:'Venezuela',
  NGA:'Nigeria', GBR:'R.-Uni', KAZ:'Kazakhstan',
  CHN:'Chine', MEX:'Mexique', LBY:'Libye', DZA:'Algérie',
  AGO:'Angola', QAT:'Qatar', OMN:'Oman',
};

// Couleurs cohérentes par pays — toujours les mêmes
const COUNTRY_COLORS: Record<string, string> = {
  USA:'#2C3E50', SAU:'#C17F24', RUS:'#B85450', CAN:'#2E7D6B',
  IRQ:'#8B4513', IRN:'#A0522D', ARE:'#C8A96E', BRA:'#4A90A4',
  KWT:'#8E7F6B', NOR:'#3D7AB5', VEN:'#9B4B3A', NGA:'#5B7B3A',
  GBR:'#4A6A8A', KAZ:'#8A7A5A', CHN:'#D4A84B', MEX:'#6B7B3A',
  LBY:'#C4965A', DZA:'#7B6B4A', AGO:'#8A5A3A', QAT:'#C4A43A', OMN:'#A47A4A',
};

const DECADES = [
  { year: 1975, label: '1975 — Après 1er choc pétrolier' },
  { year: 1990, label: '1990 — Fin guerre froide' },
  { year: 2010, label: '2010 — Début révolution shale' },
  { year: 2023, label: '2023 — Situation actuelle' },
];

interface Props { data: HistoricalProduction[] }

export default function TopProducersChart({ data }: Props) {
  const [selectedDecade, setSelectedDecade] = useState(2023);

  // Top 10 pour l'année sélectionnée
  const topData = useMemo(() => {
    const yearData = data.filter(d => d.year === selectedDecade);
    const aggregated = yearData.reduce((acc, d) => {
      acc[d.country_code] = (acc[d.country_code] || 0) + d.production_value;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(aggregated)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([code, value], i) => ({ code, value, rank: i + 1 }));
  }, [data, selectedDecade]);

  const maxVal = topData[0]?.value ?? 1;

  // Données de changement de rang vs décennie précédente
  const prevDecade = DECADES[DECADES.findIndex(d => d.year === selectedDecade) - 1];
  const prevTop = useMemo(() => {
    if (!prevDecade) return {};
    const yearData = data.filter(d => d.year === prevDecade.year);
    const aggregated = yearData.reduce((acc, d) => {
      acc[d.country_code] = (acc[d.country_code] || 0) + d.production_value;
      return acc;
    }, {} as Record<string, number>);
    const sorted = Object.entries(aggregated).sort(([, a], [, b]) => b - a);
    return Object.fromEntries(sorted.map(([code], i) => [code, i + 1]));
  }, [data, prevDecade]);

  if (!data.length) return null;

  return (
    <div className="w-full">
      {/* Sélecteur décennie */}
      <div className="flex flex-wrap gap-2 mb-5">
        {DECADES.map(d => (
          <button key={d.year} onClick={() => setSelectedDecade(d.year)}
            className={`px-4 py-2 rounded-lg text-xs font-bold border transition ${
              selectedDecade === d.year
                ? 'bg-oil-slate text-white border-oil-slate shadow-md'
                : 'bg-white text-oil-slate border-oil-sand-dark hover:border-oil-slate'
            }`}>
            <div>{d.year}</div>
            <div className={`text-xs font-normal mt-0.5 ${selectedDecade === d.year ? 'text-white/70' : 'text-oil-slate/50'}`}>
              {d.label.split('—')[1].trim()}
            </div>
          </button>
        ))}
      </div>

      {/* Barres horizontales */}
      <div className="space-y-2.5">
        {topData.map(({ code, value, rank }) => {
          const pct = (value / maxVal) * 100;
          const color = COUNTRY_COLORS[code] ?? '#8E7F6B';
          const name = COUNTRY_NAMES[code] ?? code;
          const prevRank = prevTop[code];
          const rankChange = prevRank ? prevRank - rank : null;

          return (
            <div key={code} className="flex items-center gap-3">
              {/* Rang */}
              <div className="w-5 text-xs font-black text-oil-slate/40 text-right shrink-0">
                {rank}
              </div>

              {/* Flag changement de rang */}
              <div className="w-8 text-center shrink-0">
                {rankChange !== null && rankChange !== 0 && (
                  <span className={`text-xs font-bold ${rankChange > 0 ? 'text-green-600' : 'text-oil-rust'}`}>
                    {rankChange > 0 ? `↑${rankChange}` : `↓${Math.abs(rankChange)}`}
                  </span>
                )}
                {rankChange === 0 && <span className="text-xs text-oil-slate/20">—</span>}
                {rankChange === null && <span className="text-xs text-oil-slate/20">•</span>}
              </div>

              {/* Nom pays */}
              <div className="w-32 text-xs font-semibold text-oil-slate text-right shrink-0 leading-tight">
                {name}
              </div>

              {/* Barre */}
              <div className="flex-1 relative h-8 bg-oil-sand rounded-lg overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-lg flex items-center transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: color }}>
                  <span className="ml-2 text-white text-xs font-bold whitespace-nowrap">
                    {value.toFixed(1)} mb/d
                  </span>
                </div>
              </div>

              {/* Code pays */}
              <div className="w-10 text-xs text-oil-slate/40 font-mono shrink-0">{code}</div>
            </div>
          );
        })}
      </div>

      {/* Note contextuelle par décennie */}
      <div className="mt-4 p-3 bg-oil-sand-light rounded-lg border border-oil-sand-dark text-xs text-oil-slate/70 leading-relaxed">
        {selectedDecade === 1975 && '1975 — L\'URSS et l\'Arabie Saoudite dominent la production mondiale post-choc pétrolier. Les USA amorcent leur déclin de production conventionnelle.'}
        {selectedDecade === 1990 && '1990 — Fin de la guerre froide. La Russie (ex-URSS) maintient sa suprématie. Venezuela et Iran restent dans le top 10. Aucun acteur non-conventionnel visible.'}
        {selectedDecade === 2010 && '2010 — Les USA commencent leur ascension grâce au shale mais ne dominent pas encore. La Russie et l\'Arabie Saoudite sont au coude à coude. Le Canada (sables bitumineux) entre dans le top 5.'}
        {selectedDecade === 2023 && '2023 — Domination écrasante des USA (+19 mb/d) grâce à la révolution shale. Arabie Saoudite et Russie derrière. Canada dans le top 4. Venezuela a disparu du top 10.'}
      </div>
    </div>
  );
}
