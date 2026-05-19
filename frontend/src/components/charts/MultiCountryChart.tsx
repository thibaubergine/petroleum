import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { COUNTRY_COLORS, TOOLTIP_STYLE, GRID_STYLE, AXIS_STYLE } from '@/utils/chartColors';
import type { HistoricalProduction } from '@/types/historical';

export const REGIONS: Record<string, { label: string; countries: string[]; color: string }> = {
  'middle_east':   { label: 'Moyen-Orient',    countries: ['SAU','IRQ','IRN','ARE','KWT','QAT','OMN'], color: '#C17F24' },
  'north_america': { label: 'Amérique du Nord', countries: ['USA','CAN','MEX'],                         color: '#2C3E50' },
  'former_ussr':   { label: 'Ex-URSS',          countries: ['RUS','KAZ'],                               color: '#7B5EA7' },
  'africa':        { label: 'Afrique',           countries: ['NGA','LBY','DZA','AGO'],                   color: '#2E7D6B' },
  'latin_america': { label: 'Amérique Latine',   countries: ['BRA','VEN'],                               color: '#B85450' },
  'europe':        { label: 'Europe',            countries: ['NOR','GBR'],                               color: '#4A90A4' },
  'asia':          { label: 'Asie',              countries: ['CHN'],                                     color: '#8B4513' },
};

interface Props { data: HistoricalProduction[] }

// Mode : "countries" = une ligne par pays, "regions" = une ligne par région (cumul)
type Mode = 'countries' | 'regions';

export default function MultiCountryChart({ data }: Props) {
  const [mode, setMode] = useState<Mode>('countries');
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['USA','SAU','RUS']);
  const [selectedRegions, setSelectedRegions] = useState<string[]>(Object.keys(REGIONS));

  const availableCodes = useMemo(() => [...new Set(data.map(d => d.country_code))], [data]);
  const getName = (code: string) => data.find(d => d.country_code === code)?.country_name ?? code;

  // ── Mode pays ────────────────────────────────────────────────────────────
  const selectAllCountries = () => setSelectedCountries(availableCodes);
  const clearCountries = () => setSelectedCountries([]);

  const selectRegionCountries = (regionKey: string) => {
    const regionCodes = REGIONS[regionKey].countries.filter(c => availableCodes.includes(c));
    setSelectedCountries(regionCodes);
  };

  const toggleCountry = (code: string) => {
    setSelectedCountries(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const toggleRegion = (regionKey: string) => {
    setSelectedRegions(prev =>
      prev.includes(regionKey) ? prev.filter(r => r !== regionKey) : [...prev, regionKey]
    );
  };

  // ── Données mode pays ────────────────────────────────────────────────────
  const countryChartData = useMemo(() => {
    const byYear: Record<number, any> = {};
    data.forEach(r => {
      if (!selectedCountries.includes(r.country_code)) return;
      if (!byYear[r.year]) byYear[r.year] = { year: r.year };
      byYear[r.year][r.country_code] = r.production_value;
    });
    return Object.values(byYear).sort((a, b) => a.year - b.year);
  }, [data, selectedCountries]);

  // ── Données mode régions (cumul) ─────────────────────────────────────────
  const regionChartData = useMemo(() => {
    const byYear: Record<number, any> = {};
    Object.entries(REGIONS).forEach(([regionKey, region]) => {
      if (!selectedRegions.includes(regionKey)) return;
      const regionCodes = region.countries.filter(c => availableCodes.includes(c));
      data.forEach(r => {
        if (!regionCodes.includes(r.country_code)) return;
        if (!byYear[r.year]) byYear[r.year] = { year: r.year };
        byYear[r.year][regionKey] = (byYear[r.year][regionKey] || 0) + r.production_value;
      });
    });
    return Object.values(byYear).sort((a, b) => a.year - b.year);
  }, [data, selectedRegions, availableCodes]);

  const chartData = mode === 'regions' ? regionChartData : countryChartData;

  // Événements historiques pour annotations
  const HISTORICAL_DROPS = [
    { year: 1990, label: 'Guerre du Golfe\n(Kuwait quasi-zéro)', color: '#B85450' },
    { year: 2011, label: 'Printemps arabe\n(Libye effondrement)', color: '#B85450' },
    { year: 2020, label: 'COVID + Venezuela\n(chutes brutales)', color: '#C17F24' },
  ];

  return (
    <div className="w-full">
      {/* Sélecteur mode */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex gap-1 p-1 bg-oil-sand rounded-lg border border-oil-sand-dark">
          <button onClick={() => setMode('countries')}
            className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${
              mode === 'countries'
                ? 'bg-oil-slate text-white shadow-sm'
                : 'text-oil-slate/60 hover:text-oil-slate'
            }`}>
            Par pays
          </button>
          <button onClick={() => setMode('regions')}
            className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${
              mode === 'regions'
                ? 'bg-oil-slate text-white shadow-sm'
                : 'text-oil-slate/60 hover:text-oil-slate'
            }`}>
            Par région (cumulé)
          </button>
        </div>

        {mode === 'countries' && (
          <div className="flex gap-1.5 ml-auto">
            <button onClick={selectAllCountries}
              className="px-2.5 py-1 text-xs border border-oil-sand-dark rounded bg-white text-oil-slate hover:bg-oil-sand transition">
              Tout
            </button>
            <button onClick={clearCountries}
              className="px-2.5 py-1 text-xs border border-oil-sand-dark rounded bg-white text-oil-slate hover:bg-oil-sand transition">
              Effacer
            </button>
          </div>
        )}
      </div>

      {/* Sélecteurs par mode */}
      {mode === 'countries' ? (
        <div className="mb-4 space-y-2.5">
          {/* Raccourcis régions → sélection pays */}
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs text-oil-slate/50 self-center">Région →</span>
            {Object.entries(REGIONS).map(([key, r]) => {
              const count = r.countries.filter(c => availableCodes.includes(c)).length;
              if (!count) return null;
              return (
                <button key={key} onClick={() => selectRegionCountries(key)}
                  className="px-2.5 py-1 rounded text-xs font-semibold border border-oil-sand-dark bg-white text-oil-slate hover:border-oil-slate transition">
                  {r.label} ({count})
                </button>
              );
            })}
          </div>
          {/* Boutons pays individuels */}
          <div className="flex flex-wrap gap-1.5">
            {availableCodes.sort().map(code => (
              <button key={code} onClick={() => toggleCountry(code)}
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
      ) : (
        <div className="mb-4 flex flex-wrap gap-1.5">
          <button onClick={() => setSelectedRegions(Object.keys(REGIONS))}
            className="px-2.5 py-1 text-xs border border-oil-sand-dark rounded bg-white text-oil-slate hover:bg-oil-sand transition">
            Toutes
          </button>
          {Object.entries(REGIONS).map(([key, r]) => {
            const active = selectedRegions.includes(key);
            return (
              <button key={key} onClick={() => toggleRegion(key)}
                className={`px-3 py-1 rounded text-xs font-semibold border transition ${
                  active ? 'text-white border-transparent' : 'bg-white text-oil-slate/50 border-oil-sand-dark hover:text-oil-slate'
                }`}
                style={active ? { backgroundColor: r.color, borderColor: r.color } : {}}>
                {r.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Graphique */}
      {chartData.length === 0 || (mode === 'countries' ? selectedCountries.length === 0 : selectedRegions.length === 0) ? (
        <div className="h-80 flex items-center justify-center text-oil-slate/50 text-sm">
          Sélectionne au moins un {mode === 'countries' ? 'pays' : 'région'}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={440}>
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 50 }}>
            <CartesianGrid {...GRID_STYLE} />
            <XAxis
              dataKey="year"
              type="number"
              scale="linear"
              domain={['dataMin', 'dataMax']}
              {...AXIS_STYLE}
              label={{ value: 'Année', position: 'insideBottom', offset: -15, fill: '#2C3E50', fontSize: 12 }}
            />
            <YAxis {...AXIS_STYLE}
              label={{ value: 'mb/d', angle: -90, position: 'insideLeft', fill: '#2C3E50', fontSize: 12 }} />
            <Tooltip
              {...TOOLTIP_STYLE}
              formatter={(v: number, name: string) => [
                `${v.toFixed(2)} mb/d`,
                mode === 'regions' ? (REGIONS[name]?.label ?? name) : getName(name)
              ]} />
            <Legend wrapperStyle={{ paddingTop: 24, fontSize: 11 }}
              formatter={v => mode === 'regions' ? (REGIONS[v]?.label ?? v) : getName(v)} />

            {/* Marqueurs événements historiques */}
            {mode === 'countries' && HISTORICAL_DROPS.map(e => (
              <ReferenceLine key={e.year} x={e.year} stroke={e.color}
                strokeDasharray="3 3" opacity={0.4}
                label={{ value: e.year.toString(), fill: e.color, fontSize: 9, position: 'top' }} />
            ))}

            {mode === 'countries'
              ? selectedCountries.map(code => (
                  <Line key={code} type="monotone" dataKey={code}
                    stroke={COUNTRY_COLORS[code] ?? '#8E7F6B'} strokeWidth={2}
                    dot={false} activeDot={{ r: 4 }} name={code} connectNulls />
                ))
              : selectedRegions.map(regionKey => (
                  <Line key={regionKey} type="monotone" dataKey={regionKey}
                    stroke={REGIONS[regionKey]?.color ?? '#8E7F6B'} strokeWidth={2.5}
                    dot={false} activeDot={{ r: 5 }} name={regionKey} connectNulls />
                ))
            }
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Note sur les drops réels */}
      {mode === 'countries' && (
        <div className="mt-3 p-3 bg-oil-sand-light border border-oil-sand-dark rounded-lg text-xs text-oil-slate/60 leading-relaxed">
          <strong className="text-oil-slate">Baisses légitimes détectées dans les données :</strong>
          {' '}Koweït 1990 (0.18 mb/d) → occupation irakienne · Irak 1995 (0.56 mb/d) → sanctions ONU ·
          Libye 2011 (0.48 mb/d) → guerre civile · Venezuela 2020 (0.48 mb/d) → effondrement économique.
          Ces chiffres sont corrects — ce ne sont pas des erreurs.
        </div>
      )}

      {mode === 'regions' && (
        <p className="text-xs text-oil-slate/40 mt-2 text-center">
          Note : Ex-URSS et Europe démarrent après 1965 (données indisponibles avant).
          Les valeurs sont la somme des pays disponibles pour chaque région.
        </p>
      )}
    </div>
  );
}
