import { useState, useMemo } from 'react';
import { useProductionAnalytics, useHistoricalProduction } from '@/hooks/useHistorical';
import {
  ScatterChart, Scatter, LineChart, Line,
  XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, Cell
} from 'recharts';
import { GRID_STYLE, AXIS_STYLE, COUNTRY_COLORS } from '@/utils/chartColors';
import { ChevronDown, ChevronUp } from 'lucide-react';

function Section({ title, subtitle, children, defaultOpen = true }: {
  title: string; subtitle?: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl shadow-sm border border-oil-sand-dark">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-oil-sand-light/50 transition rounded-xl">
        <div>
          <h2 className="text-lg font-bold text-oil-slate">{title}</h2>
          {subtitle && <p className="text-xs text-oil-slate/50 mt-0.5">{subtitle}</p>}
        </div>
        {open ? <ChevronUp size={18} className="text-oil-slate/40" /> : <ChevronDown size={18} className="text-oil-slate/40" />}
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

// ── Données CAGR par pays × période ──────────────────────────────────────────
const PERIODS = ['1965-1980', '1980-2000', '2000-2010', '2010-2023'];
const PERIOD_YEARS: Record<string, [number, number]> = {
  '1965-1980': [1965, 1980],
  '1980-2000': [1980, 2000],
  '2000-2010': [2000, 2010],
  '2010-2023': [2010, 2023],
};

// Couleur CAGR : vert = forte croissance, rouge = déclin
function cagrColor(v: number): string {
  if (v >= 5)   return '#1a7a4a';
  if (v >= 2)   return '#2E7D6B';
  if (v >= 0)   return '#6BAE8C';
  if (v >= -2)  return '#D4813A';
  if (v >= -5)  return '#B85450';
  return '#8B1A1A';
}

function cagrBg(v: number): string {
  if (v >= 5)   return '#d4f5e5';
  if (v >= 2)   return '#e8f5ef';
  if (v >= 0)   return '#f0faf5';
  if (v >= -2)  return '#fef3e8';
  if (v >= -5)  return '#fde8e8';
  return '#f5d0d0';
}

// Données de déclin par pays (post-peak)
const DECLINE_DATA: Record<string, { peak_year: number; peak_val: number; rates: { year: number; val: number }[] }> = {
  NOR: { peak_year: 2001, peak_val: 3.35, rates: [
    { year: 2001, val: 3.35 }, { year: 2003, val: 3.0 }, { year: 2005, val: 2.7 },
    { year: 2008, val: 2.25 }, { year: 2010, val: 2.14 }, { year: 2013, val: 1.84 },
    { year: 2016, val: 1.99 }, { year: 2019, val: 1.74 }, { year: 2023, val: 1.90 },
  ]},
  GBR: { peak_year: 1999, peak_val: 2.91, rates: [
    { year: 1999, val: 2.91 }, { year: 2001, val: 2.50 }, { year: 2003, val: 2.20 },
    { year: 2005, val: 1.63 }, { year: 2008, val: 1.43 }, { year: 2010, val: 1.34 },
    { year: 2013, val: 0.86 }, { year: 2016, val: 1.01 }, { year: 2019, val: 1.09 },
    { year: 2023, val: 0.76 },
  ]},
  VEN: { peak_year: 1970, peak_val: 3.71, rates: [
    { year: 1970, val: 3.71 }, { year: 1980, val: 2.17 }, { year: 1990, val: 2.14 },
    { year: 1998, val: 3.15 }, { year: 2000, val: 3.15 }, { year: 2006, val: 2.8 },
    { year: 2010, val: 2.47 }, { year: 2015, val: 2.37 }, { year: 2018, val: 1.48 },
    { year: 2020, val: 0.48 }, { year: 2023, val: 0.76 },
  ]},
  MEX: { peak_year: 2004, peak_val: 3.38, rates: [
    { year: 2004, val: 3.38 }, { year: 2006, val: 3.26 }, { year: 2008, val: 2.79 },
    { year: 2010, val: 2.95 }, { year: 2013, val: 2.88 }, { year: 2016, val: 2.46 },
    { year: 2019, val: 1.88 }, { year: 2023, val: 1.92 },
  ]},
};

// Prix vs production pour scatter plot
const PRICE_PROD_DATA = [
  { year: 1970, price: 1.8,  world_prod: 46.4 }, { year: 1973, price: 3.3,  world_prod: 55 },
  { year: 1974, price: 11.6, world_prod: 54.5 }, { year: 1979, price: 31.6, world_prod: 62 },
  { year: 1980, price: 36.8, world_prod: 62.9 }, { year: 1986, price: 14.4, world_prod: 59.9 },
  { year: 1990, price: 23.7, world_prod: 66.6 }, { year: 1998, price: 12.7, world_prod: 73 },
  { year: 2000, price: 28.5, world_prod: 76.7 }, { year: 2005, price: 54.5, world_prod: 83.6 },
  { year: 2008, price: 97.3, world_prod: 85.5 }, { year: 2010, price: 79.5, world_prod: 87.9 },
  { year: 2012, price: 111.7, world_prod: 89.7 }, { year: 2014, price: 98.9, world_prod: 92 },
  { year: 2016, price: 43.7, world_prod: 96.5 }, { year: 2018, price: 71.3, world_prod: 99.8 },
  { year: 2020, price: 43.2, world_prod: 91.2 }, { year: 2022, price: 101.3, world_prod: 99.4 },
  { year: 2023, price: 82.2, world_prod: 101.8 },
];

const COUNTRY_NAMES: Record<string, string> = {
  USA:'États-Unis', SAU:'Arabie Saoudite', RUS:'Russie', CAN:'Canada',
  IRQ:'Iraq', IRN:'Iran', ARE:'UAE', BRA:'Brésil', KWT:'Koweït',
  NOR:'Norvège', VEN:'Venezuela', NGA:'Nigeria', GBR:'R.-Uni',
  KAZ:'Kazakhstan', CHN:'Chine', MEX:'Mexique', LBY:'Libye',
  DZA:'Algérie', AGO:'Angola', QAT:'Qatar', OMN:'Oman',
};

export default function Analytics() {
  const [selectedDeclineCountry, setSelectedDeclineCountry] = useState('NOR');
  const { data: analytics } = useProductionAnalytics({ metric_type: 'cagr' });
  const { data: histData } = useHistoricalProduction();

  // ── Construire la heatmap CAGR ───────────────────────────────────────────
  const cagrMatrix = useMemo(() => {
    if (!histData?.length) return null;

    const countries = [...new Set(histData.map(d => d.country_code))];

    return countries.map(code => {
      const countryData = histData
        .filter(d => d.country_code === code)
        .sort((a, b) => a.year - b.year);

      const row: { code: string; name: string; current: number; [key: string]: number | null | string } = { code, name: COUNTRY_NAMES[code] ?? code, current: 0 };

      const latestData = countryData[countryData.length - 1];
      row.current = latestData?.production_value ?? 0;
      PERIODS.forEach(period => {
        const [y1, y2] = PERIOD_YEARS[period];
        const v1 = countryData.find(d => d.year === y1)?.production_value;
        const v2 = countryData.find(d => d.year === y2)?.production_value;
        if (v1 && v2 && v1 > 0) {
          const years = y2 - y1;
          const cagr = (Math.pow(v2 / v1, 1 / years) - 1) * 100;
          row[period] = Math.round(cagr * 10) / 10;
        } else {
          row[period] = null;
        }
      });

      // CAGR total (première à dernière année disponible)
      const first = countryData[0];
      const last = countryData[countryData.length - 1];
      if (first && last && first.production_value > 0) {
        const years = last.year - first.year;
        row['total'] = Math.round((Math.pow(last.production_value / first.production_value, 1/years) - 1) * 100 * 10) / 10;
      }

      return {
        code,
        name: COUNTRY_NAMES[code] ?? code,
        current: last?.production_value ?? 0,
        ...row,
      };
    }).sort((a, b) => (b.current as number) - (a.current as number));
  }, [histData]);

  // Données déclin
  const declineCountry = DECLINE_DATA[selectedDeclineCountry];
  const declineChartData = declineCountry?.rates.map(r => ({
    year: r.year,
    actual: r.val,
    // Courbe exponentielle théorique
    exp: declineCountry.peak_val * Math.exp(-0.04 * (r.year - declineCountry.peak_year)),
  })) ?? [];

  return (
    <div className="min-h-screen bg-oil-sand-light">
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">

        {/* ── 1. CAGR HEATMAP ────────────────────────────────────────── */}
        <Section title="CAGR — Taux de croissance annuel composé" subtitle="Par pays × période · Vert = croissance · Rouge = déclin">
          <p className="text-xs text-oil-slate/60 mb-4 leading-relaxed">
            Le CAGR (Compound Annual Growth Rate) mesure la croissance annuelle moyenne sur une période.
            Chaque cellule = le CAGR de production d'un pays sur une décennie.
            <strong className="text-oil-slate"> Vert foncé</strong> = forte croissance.
            <strong className="text-oil-rust"> Rouge</strong> = déclin structurel.
          </p>

          {cagrMatrix && cagrMatrix.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b-2 border-oil-sand-dark">
                    <th className="text-left py-2 pr-3 font-semibold text-oil-slate/60 uppercase">Pays</th>
                    <th className="text-right py-2 px-2 font-semibold text-oil-slate/60 uppercase">2023 (mb/d)</th>
                    {PERIODS.map(p => (
                      <th key={p} className="text-center py-2 px-2 font-semibold text-oil-slate/60 uppercase w-24">{p}</th>
                    ))}
                    <th className="text-center py-2 px-2 font-semibold text-oil-slate/60 uppercase w-24">Global</th>
                  </tr>
                </thead>
                <tbody>
                  {cagrMatrix.map(row => (
                    <tr key={row.code} className="border-b border-oil-sand-dark/30 hover:bg-oil-sand-light/60">
                      <td className="py-2 pr-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: COUNTRY_COLORS[row.code] ?? '#8E7F6B' }} />
                          <span className="font-semibold text-oil-slate">{row.name}</span>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-oil-slate">
                        {row.current.toFixed(1)}
                      </td>
                      {PERIODS.map(p => {
                        const v = row[p] as number | null;
                        return (
                          <td key={p} className="py-1 px-1">
                            {v !== null ? (
                              <div className="rounded px-2 py-1 text-center font-mono font-bold"
                                style={{ backgroundColor: cagrBg(v), color: cagrColor(v) }}>
                                {v > 0 ? '+' : ''}{v.toFixed(1)}%
                              </div>
                            ) : (
                              <div className="text-center text-oil-slate/30">—</div>
                            )}
                          </td>
                        );
                      })}
                      {/* Global */}
                      {(() => {
                        const v = row['total'] as number | null;
                        return (
                          <td className="py-1 px-1">
                            {v !== null ? (
                              <div className="rounded px-2 py-1 text-center font-mono font-bold border"
                                style={{
                                  backgroundColor: cagrBg(v),
                                  color: cagrColor(v),
                                  borderColor: cagrColor(v) + '40'
                                }}>
                                {v > 0 ? '+' : ''}{v.toFixed(1)}%
                              </div>
                            ) : (
                              <div className="text-center text-oil-slate/30">—</div>
                            )}
                          </td>
                        );
                      })()}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Légende */}
              <div className="mt-3 flex items-center gap-4 text-xs text-oil-slate/60">
                <div className="flex items-center gap-1.5">
                  {[8, 3, 0, -3, -8].map(v => (
                    <div key={v} className="w-8 h-4 rounded text-center font-bold flex items-center justify-center"
                      style={{ backgroundColor: cagrBg(v), color: cagrColor(v), fontSize: 9 }}>
                      {v > 0 ? '+' : ''}{v}
                    </div>
                  ))}
                </div>
                <span>CAGR en %/an</span>
              </div>
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-oil-slate/50 text-sm">
              Données historiques requises — lancer full_init.py
            </div>
          )}
        </Section>

        {/* ── 2. COURBES DE DÉCLIN ───────────────────────────────────── */}
        <Section title="Courbes de déclin post-peak" subtitle="Norvège · R.-Uni · Venezuela · Mexique">
          <p className="text-xs text-oil-slate/60 mb-4 leading-relaxed">
            Après le pic de production, la plupart des pays suivent une courbe de déclin
            exponentiel ou hyperbolique. La forme de la courbe dépend de la géologie
            et des méthodes d'extraction. <strong>Ligne pointillée</strong> = modèle
            exponentiel théorique à -4%/an pour référence.
          </p>

          <div className="flex gap-2 mb-4">
            {Object.keys(DECLINE_DATA).map(code => (
              <button key={code}
                onClick={() => setSelectedDeclineCountry(code)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition ${
                  selectedDeclineCountry === code
                    ? 'bg-oil-slate text-white border-oil-slate'
                    : 'bg-white text-oil-slate border-oil-sand-dark hover:border-oil-slate'
                }`}>
                {COUNTRY_NAMES[code]} ({DECLINE_DATA[code].peak_year})
              </button>
            ))}
          </div>

          {declineCountry && (
            <>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={declineChartData} margin={{ top: 10, right: 30, left: 10, bottom: 30 }}>
                  <CartesianGrid {...GRID_STYLE} />
                  <XAxis dataKey="year" {...AXIS_STYLE}
                    label={{ value: 'Année', position: 'insideBottom', offset: -15, fill: '#2C3E50', fontSize: 12 }} />
                  <YAxis {...AXIS_STYLE}
                    label={{ value: 'mb/d', angle: -90, position: 'insideLeft', fill: '#2C3E50', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFAF4', border: '1px solid #D4C7B3', borderRadius: '8px', fontSize: 11 }}
                    formatter={(v: number, n: string) => [`${v.toFixed(2)} mb/d`, n === 'actual' ? 'Production réelle' : 'Modèle exp. -4%/an']} />
                  <Legend wrapperStyle={{ paddingTop: 16, fontSize: 11 }}
                    formatter={v => v === 'actual' ? 'Production réelle' : 'Modèle exponentiel (-4%/an)'} />
                  <ReferenceLine
                    x={declineCountry.peak_year}
                    stroke="#B85450" strokeDasharray="4 3" opacity={0.5}
                    label={{ value: `Peak ${declineCountry.peak_year}`, fill: '#B85450', fontSize: 10, position: 'top' }} />
                  <Line type="monotone" dataKey="actual" stroke={COUNTRY_COLORS[selectedDeclineCountry] ?? '#2C3E50'}
                    strokeWidth={3} dot={{ r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} name="actual" />
                  <Line type="monotone" dataKey="exp" stroke="#B85450"
                    strokeWidth={1.5} strokeDasharray="5 4" dot={false} name="exp" opacity={0.6} />
                </LineChart>
              </ResponsiveContainer>

              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {[
                  { label: 'Peak', val: `${declineCountry.peak_year}` },
                  { label: 'Max', val: `${declineCountry.peak_val.toFixed(2)} mb/d` },
                  {
                    label: 'Actuel',
                    val: `${(declineCountry.rates[declineCountry.rates.length - 1]?.val ?? 0).toFixed(2)} mb/d`
                  },
                  {
                    label: 'Perte totale',
                    val: (() => {
                      const last = declineCountry.rates[declineCountry.rates.length - 1]?.val ?? declineCountry.peak_val;
                      const pct = ((declineCountry.peak_val - last) / declineCountry.peak_val * 100).toFixed(0);
                      return `−${pct}%`;
                    })()
                  },
                ].map(s => (
                  <div key={s.label} className="bg-oil-sand-light rounded p-3 border border-oil-sand-dark text-center">
                    <div className="text-oil-slate/50 uppercase mb-1">{s.label}</div>
                    <div className="font-bold text-oil-slate text-base">{s.val}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Section>

        {/* ── 3. SCATTER PRIX ↔ PRODUCTION ──────────────────────────── */}
        <Section title="Prix vs Production mondiale — Corrélation historique" subtitle="Brent ($/b) × Production mondiale (mb/d) · 1970-2023">
          <p className="text-xs text-oil-slate/60 mb-4 leading-relaxed">
            Chaque point = une année. La couleur indique la décennie.
            La relation n'est <strong>pas linéaire</strong> — il y a des boucles et des ruptures
            liées aux chocs géopolitiques et aux cycles d'investissement.
          </p>

          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 10, right: 30, left: 10, bottom: 30 }}>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="world_prod" {...AXIS_STYLE} name="Production" type="number" domain={[40, 110]}
                label={{ value: 'Production mondiale (mb/d)', position: 'insideBottom', offset: -15, fill: '#2C3E50', fontSize: 12 }} />
              <YAxis dataKey="price" {...AXIS_STYLE} name="Prix Brent" type="number" domain={[0, 120]}
                label={{ value: 'Brent ($/b)', angle: -90, position: 'insideLeft', fill: '#2C3E50', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFAF4', border: '1px solid #D4C7B3', borderRadius: '8px', fontSize: 11 }}
                content={({ payload }) => {
                  if (!payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-[#FFFAF4] border border-[#D4C7B3] rounded-lg px-3 py-2 text-xs shadow">
                      <div className="font-bold text-[#2C3E50] mb-1">{d.year}</div>
                      <div className="text-[#8B4513]">Prix Brent : <strong>${d.price}</strong>/b</div>
                      <div className="text-[#2C3E50]">Production : <strong>{d.world_prod}</strong> mb/d</div>
                    </div>
                  );
                }} />
              <Scatter data={PRICE_PROD_DATA} name="Année">
                {PRICE_PROD_DATA.map(d => {
                  const decade = Math.floor(d.year / 10) * 10;
                  const col = decade <= 1970 ? '#8E7F6B' : decade <= 1980 ? '#C17F24' :
                    decade <= 1990 ? '#4A90A4' : decade <= 2000 ? '#2C3E50' :
                    decade <= 2010 ? '#B85450' : '#2E7D6B';
                  return (
                    <Cell key={d.year} fill={col} fillOpacity={0.85} />
                  );
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>

          {/* Légende décennies */}
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-oil-slate/60">
            {[
              { label: '1970s', color: '#8E7F6B' },
              { label: '1980s', color: '#C17F24' },
              { label: '1990s', color: '#4A90A4' },
              { label: '2000s', color: '#2C3E50' },
              { label: '2010s', color: '#B85450' },
              { label: '2020s', color: '#2E7D6B' },
            ].map(d => (
              <div key={d.label} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                <span>{d.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 p-3 bg-oil-sand-light border border-oil-sand-dark rounded-lg text-xs text-oil-slate/70 leading-relaxed">
            <strong className="text-oil-slate">Observations clés :</strong> Les années 2000-2014 (points sombres)
            montrent une boucle où prix et production augmentent ensemble — boom pétrolier.
            2015-2016 (rouge) : effondrement des prix malgré une production stable (excès offre OPEC/shale).
            2020 (vert) : COVID = chute prix + chute production simultanées.
          </div>
        </Section>

        {/* ── 4. OPEC vs NON-OPEC ────────────────────────────────────── */}
        <Section title="OPEC vs Non-OPEC — Parts de marché historiques" defaultOpen={false}>
          <OPECShare histData={histData ?? []} />
        </Section>

      </div>
    </div>
  );
}

// ── Sous-composant OPEC share ─────────────────────────────────────────────────
function OPECShare({ histData }: { histData: any[] }) {
  const chartData = useMemo(() => {
    const byYear: Record<number, { opec: number; nonOpec: number }> = {};
    histData.forEach(d => {
      if (!byYear[d.year]) byYear[d.year] = { opec: 0, nonOpec: 0 };
      if (d.is_opec_member) byYear[d.year].opec += d.production_value;
      else byYear[d.year].nonOpec += d.production_value;
    });
    return Object.entries(byYear)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([year, v]) => {
        const total = v.opec + v.nonOpec;
        return {
          year: Number(year),
          opec: Math.round(v.opec * 10) / 10,
          nonOpec: Math.round(v.nonOpec * 10) / 10,
          opecShare: total > 0 ? Math.round(v.opec / total * 100) : 0,
        };
      });
  }, [histData]);

  if (!chartData.length) return (
    <div className="h-32 flex items-center justify-center text-oil-slate/50 text-sm">
      Données historiques requises
    </div>
  );

  return (
    <ResponsiveContainer width="100%" height={340}>
      <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 40 }}>
        <CartesianGrid {...GRID_STYLE} />
        <XAxis dataKey="year" {...AXIS_STYLE}
          label={{ value: 'Année', position: 'insideBottom', offset: -15, fill: '#2C3E50', fontSize: 12 }} />
        <YAxis yAxisId="mb" {...AXIS_STYLE}
          label={{ value: 'mb/d', angle: -90, position: 'insideLeft', fill: '#2C3E50', fontSize: 12 }} />
        <YAxis yAxisId="pct" orientation="right" {...AXIS_STYLE} domain={[0, 100]}
          tickFormatter={v => `${v}%`}
          label={{ value: '% OPEC', angle: 90, position: 'insideRight', fill: '#B85450', fontSize: 11 }} />
        <Tooltip
          contentStyle={{ backgroundColor: '#FFFAF4', border: '1px solid #D4C7B3', borderRadius: '8px', fontSize: 11 }}
          formatter={(v: number, name: string) => {
            if (name === 'opecShare') return [`${v}%`, 'Part OPEC'];
            return [`${v.toFixed(1)} mb/d`, name === 'opec' ? 'OPEC' : 'Non-OPEC'];
          }} />
        <Legend wrapperStyle={{ paddingTop: 20, fontSize: 11 }}
          formatter={v => v === 'opec' ? 'OPEC (mb/d)' : v === 'nonOpec' ? 'Non-OPEC (mb/d)' : 'Part OPEC (%)'} />
        <Line yAxisId="mb" type="monotone" dataKey="opec" stroke="#B85450" strokeWidth={2.5} dot={false} name="opec" />
        <Line yAxisId="mb" type="monotone" dataKey="nonOpec" stroke="#2C3E50" strokeWidth={2.5} dot={false} name="nonOpec" />
        <Line yAxisId="pct" type="monotone" dataKey="opecShare" stroke="#C17F24" strokeWidth={1.5}
          strokeDasharray="5 3" dot={false} name="opecShare" />
      </LineChart>
    </ResponsiveContainer>
  );
}
