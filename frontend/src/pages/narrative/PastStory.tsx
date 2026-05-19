import { Link } from 'react-router-dom';
import { ReadingModeProvider, ReadingToggle, Long, useReadingMode, TableOfContents, ChapterAnchor } from '@/context/ReadingMode';
import { useHistoricalProduction } from '@/hooks/useHistorical';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useEROEI } from '@/hooks/useProduction';
import { useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell, Legend, AreaChart, Area
} from 'recharts';

// ── Palettes cohérentes ──────────────────────────────────────────────────────
const CTRY_COLORS: Record<string, string> = {
  USA:'#4A90A4', SAU:'#C17F24', RUS:'#B85450', CAN:'#2E7D6B',
  IRQ:'#8B4513', IRN:'#A0522D', ARE:'#C8A96E', BRA:'#7B5EA7',
  KWT:'#8E7F6B', NOR:'#3D7AB5', VEN:'#9B4B3A', NGA:'#5B7B3A',
  GBR:'#4A6A8A', KAZ:'#8A7A5A', CHN:'#D4A84B', MEX:'#6B7B3A',
};

const CTRY_NAMES: Record<string, string> = {
  USA:'États-Unis', SAU:'Arabie Saoudite', RUS:'Russie', CAN:'Canada',
  IRQ:'Iraq', IRN:'Iran', ARE:'UAE', BRA:'Brésil',
  KWT:'Koweït', NOR:'Norvège', VEN:'Venezuela', NGA:'Nigeria',
  GBR:'R.-Uni', KAZ:'Kazakhstan', CHN:'Chine', MEX:'Mexique',
};

const DECADES_D = [
  { year: 1975, label: 'Post 1er choc' },
  { year: 1990, label: 'Fin guerre froide' },
  { year: 2010, label: 'Révolution shale' },
  { year: 2023, label: 'Situation actuelle' },
];

function TopProducersDark({ data }: { data: any[] }) {
  const [yr, setYr] = useState(2023);

  const topData = useMemo(() => {
    const byCountry: Record<string, number> = {};
    data.filter(d => d.year === yr).forEach(d => {
      byCountry[d.country_code] = (byCountry[d.country_code] ?? 0) + d.production_value;
    });
    return Object.entries(byCountry)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([code, value], i) => ({ code, value, rank: i + 1 }));
  }, [data, yr]);

  const maxVal = Math.max(...topData.map(d => d.value), 1);

  const prevTop = useMemo(() => {
    const prevYr = DECADES_D[Math.max(0, DECADES_D.findIndex(d => d.year === yr) - 1)].year;
    const byCountry: Record<string, number> = {};
    data.filter(d => d.year === prevYr).forEach(d => {
      byCountry[d.country_code] = (byCountry[d.country_code] ?? 0) + d.production_value;
    });
    const sorted = Object.entries(byCountry).sort(([, a], [, b]) => b - a);
    return Object.fromEntries(sorted.map(([code], i) => [code, i + 1]));
  }, [data, yr]);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-5">
        {DECADES_D.map(d => (
          <button key={d.year} onClick={() => setYr(d.year)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
              yr === d.year ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'text-white/40 border-white/15 hover:border-white/30 hover:text-white/60'
            }`}>
            {d.year} <span className="font-normal opacity-70 ml-1">{d.label}</span>
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {topData.map(({ code, value, rank }) => {
          const pct = (value / maxVal) * 100;
          const color = CTRY_COLORS[code] ?? '#8E7F6B';
          const prevRank = prevTop[code];
          const chg = prevRank ? prevRank - rank : null;
          return (
            <div key={code} className="flex items-center gap-2.5">
              <div className="w-4 text-xs font-black text-white/25 text-right shrink-0">{rank}</div>
              <div className="w-7 text-center shrink-0 text-xs font-bold">
                {chg !== null && chg !== 0 && (
                  <span className={chg > 0 ? 'text-emerald-400' : 'text-red-400'}>
                    {chg > 0 ? `↑${chg}` : `↓${Math.abs(chg)}`}
                  </span>
                )}
              </div>
              <div className="w-28 text-xs font-semibold text-white/70 text-right shrink-0 leading-tight">
                {CTRY_NAMES[code] ?? code}
              </div>
              <div className="flex-1 h-7 bg-white/5 rounded-lg overflow-hidden">
                <div className="h-full rounded-lg flex items-center transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: color + 'dd' }}>
                  <span className="ml-2 text-white text-xs font-bold whitespace-nowrap">
                    {value.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="w-8 text-xs text-white/25 font-mono shrink-0">{code}</div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10 text-xs text-white/50 leading-relaxed">
        {yr === 1975 && "L'URSS et l'Arabie Saoudite dominent. Les USA amorcent leur déclin conventionnel."}
        {yr === 1990 && "La Russie (ex-URSS) au sommet. Venezuela et Iran dans le top 5. Aucun non-conventionnel visible."}
        {yr === 2010 && "Le shale commence. USA en remontée. Canada (sables bitumineux) entre dans le top 5."}
        {yr === 2023 && "Domination écrasante des USA (+19 mb/j). Le Venezuela a disparu du top 10."}
      </div>
    </div>
  );
}

// Données statiques méthode normalisée USA
const METHOD_DATA = [
  { y:1965, conv:100, shale:0, offshore:0 },
  { y:1970, conv:95,  shale:0, offshore:5 },
  { y:1980, conv:85,  shale:0, offshore:15 },
  { y:1990, conv:75,  shale:1, offshore:24 },
  { y:2000, conv:65,  shale:2, offshore:33 },
  { y:2005, conv:58,  shale:5, offshore:37 },
  { y:2010, conv:42,  shale:22, offshore:36 },
  { y:2015, conv:28,  shale:48, offshore:24 },
  { y:2020, conv:22,  shale:54, offshore:24 },
  { y:2024, conv:20,  shale:62, offshore:18 },
];

function MethodDark() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={METHOD_DATA} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
        <XAxis dataKey="y" tick={{ fill: '#ffffff60', fontSize: 10 }} axisLine={{ stroke: '#ffffff20' }} tickLine={false} />
        <YAxis tick={{ fill: '#ffffff60', fontSize: 10 }} axisLine={false} tickLine={false}
          tickFormatter={v => `${v}%`} domain={[0, 100]} />
        <Tooltip contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #ffffff20', borderRadius: '8px', fontSize: 11 }}
          labelStyle={{ color: '#ffffff80' }}
          formatter={(v: number, n: string) => [`${v}%`, n === 'conv' ? 'Conventionnel' : n === 'shale' ? 'Schiste (shale)' : 'Offshore']} />
        <Legend wrapperStyle={{ paddingTop: 12, fontSize: 10 }}
          formatter={v => v === 'conv' ? 'Conventionnel' : v === 'shale' ? 'Schiste (shale)' : 'Offshore'} />
        <Area type="monotone" dataKey="conv"    stackId="1" stroke="#2E7D6B" fill="#2E7D6B" fillOpacity={0.7} />
        <Area type="monotone" dataKey="offshore" stackId="1" stroke="#4A90A4" fill="#4A90A4" fillOpacity={0.7} />
        <Area type="monotone" dataKey="shale"   stackId="1" stroke="#C17F24" fill="#C17F24" fillOpacity={0.85} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// EROEI par méthode
const EROEI_DATA = [
  { y:1970, conv:35, offshore:null, shale:null, sables:null },
  { y:1975, conv:30, offshore:20, shale:null, sables:null },
  { y:1980, conv:28, offshore:18, shale:null, sables:4 },
  { y:1985, conv:25, offshore:16, shale:null, sables:4 },
  { y:1990, conv:22, offshore:14, shale:null, sables:3.5 },
  { y:2000, conv:20, offshore:12, shale:null, sables:3.5 },
  { y:2005, conv:18, offshore:10, shale:8, sables:3 },
  { y:2010, conv:16, offshore:9,  shale:6, sables:3 },
  { y:2015, conv:14, offshore:8,  shale:5, sables:3 },
  { y:2020, conv:13, offshore:8,  shale:5, sables:3 },
  { y:2024, conv:12, offshore:7,  shale:5, sables:3 },
];

function EROEIDark() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={EROEI_DATA} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
        <XAxis dataKey="y" tick={{ fill: '#ffffff60', fontSize: 10 }} axisLine={{ stroke: '#ffffff20' }} tickLine={false} />
        <YAxis tick={{ fill: '#ffffff60', fontSize: 10 }} axisLine={false} tickLine={false}
          label={{ value: 'Ratio EROEI', angle: -90, position: 'insideLeft', fill: '#ffffff40', fontSize: 10 }} />
        <Tooltip contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #ffffff20', borderRadius: '8px', fontSize: 11 }}
          labelStyle={{ color: '#ffffff80' }}
          formatter={(v: number, n: string) => [`${v}:1`, n === 'conv' ? 'Conventionnel' : n === 'offshore' ? 'Offshore' : n === 'shale' ? 'Shale' : 'Sables bitumineux']} />
        <Legend wrapperStyle={{ paddingTop: 12, fontSize: 10 }}
          formatter={v => v === 'conv' ? 'Conventionnel' : v === 'offshore' ? 'Offshore' : v === 'shale' ? 'Shale' : 'Sables bitumineux'} />
        <ReferenceLine y={8} stroke="#B85450" strokeDasharray="4 3" opacity={0.4}
          label={{ value: 'Seuil critique (~8)', fill: '#B85450', fontSize: 9, position: 'right' }} />
        <Line type="monotone" dataKey="conv"    stroke="#2E7D6B" strokeWidth={2.5} dot={false} connectNulls />
        <Line type="monotone" dataKey="offshore" stroke="#4A90A4" strokeWidth={2} dot={false} connectNulls />
        <Line type="monotone" dataKey="shale"   stroke="#C17F24" strokeWidth={2} dot={false} connectNulls />
        <Line type="monotone" dataKey="sables"  stroke="#B85450" strokeWidth={2} strokeDasharray="4 2" dot={false} connectNulls />
      </LineChart>
    </ResponsiveContainer>
  );
}

function ChapterLabel({ n, label }: { n: string; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="text-xs font-black text-amber-500/60 uppercase tracking-[0.3em]">{n}</div>
      <div className="flex-1 h-px bg-white/10" />
      <div className="text-xs text-white/30 uppercase tracking-[0.2em]">{label}</div>
    </div>
  );
}

function Anecdote({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-10 pl-6 border-l-2 border-amber-500/40 bg-amber-950/20 rounded-r-xl p-5">
      <div className="text-amber-400/70 text-xs uppercase tracking-widest mb-2 font-bold">Anecdote</div>
      <div className="text-white/75 text-sm leading-relaxed italic">{children}</div>
    </div>
  );
}

function Stat({ val, unit, label }: { val: string; unit?: string; label: string }) {
  return (
    <div className="text-center p-5">
      <div className="text-4xl font-black text-amber-400">
        {val}<span className="text-2xl text-amber-500/60 ml-1">{unit}</span>
      </div>
      <div className="text-xs text-white/40 uppercase tracking-wide mt-1">{label}</div>
    </div>
  );
}

function StatRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-white/5 rounded-2xl my-10 divide-x divide-white/10">
      {children}
    </div>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-5">{children}</h2>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-white/70 leading-relaxed text-base mb-7" style={{lineHeight:"1.9"}}>{children}</p>;
}

function Quote({ text, source }: { text: string; source: string }) {
  return (
    <blockquote className="my-10 px-8 py-6 bg-white/5 rounded-2xl border border-white/10">
      <p className="text-xl text-white/80 italic leading-relaxed mb-3">"{text}"</p>
      <cite className="text-sm text-amber-400/70 not-italic">{source}</cite>
    </blockquote>
  );
}

function ChartBox({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="my-12 rounded-2xl border border-white/10 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10 bg-white/5">
        <div className="text-sm font-bold text-white/80">{title}</div>
        {subtitle && <div className="text-xs text-white/40 mt-0.5">{subtitle}</div>}
      </div>
      <div className="p-4 md:p-6 bg-[#0d1117]">{children}</div>
    </div>
  );
}

function Sep() {
  return (
    <div className="flex items-center gap-4 my-14">
      <div className="flex-1 h-px bg-white/10" />
      <div className="text-white/20 text-sm">◆</div>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  );
}

// ── Graphique prix Brent avec événements géopolitiques ────────────────────────
const PRICE_EVENTS = [
  { year: 1973, label: '1er choc', color: '#B85450' },
  { year: 1979, label: 'Iran', color: '#B85450' },
  { year: 1986, label: 'Contre-choc', color: '#4A90A4' },
  { year: 1990, label: 'Golfe', color: '#C17F24' },
  { year: 1998, label: 'Crise Asie', color: '#4A90A4' },
  { year: 2003, label: 'Irak', color: '#8B4513' },
  { year: 2008, label: 'Pic/Crise', color: '#B85450' },
  { year: 2011, label: 'Libye', color: '#7B5EA7' },
  { year: 2014, label: 'Chute', color: '#4A90A4' },
  { year: 2020, label: 'COVID', color: '#2E7D6B' },
  { year: 2022, label: 'Ukraine', color: '#B85450' },
];

const PRICE_DATA_LONG = [
  {y:1970,p:1.8},{y:1971,p:2.2},{y:1972,p:2.5},{y:1973,p:3.3},{y:1974,p:11.6},
  {y:1975,p:11.5},{y:1976,p:12.8},{y:1977,p:13.9},{y:1978,p:14.0},{y:1979,p:31.6},
  {y:1980,p:36.8},{y:1981,p:35.9},{y:1982,p:33.6},{y:1983,p:29.5},{y:1984,p:28.8},
  {y:1985,p:27.6},{y:1986,p:14.4},{y:1987,p:18.4},{y:1988,p:14.9},{y:1989,p:18.2},
  {y:1990,p:23.7},{y:1991,p:20.0},{y:1992,p:19.3},{y:1993,p:17.0},{y:1994,p:15.8},
  {y:1995,p:17.0},{y:1996,p:20.7},{y:1997,p:19.1},{y:1998,p:12.7},{y:1999,p:17.8},
  {y:2000,p:28.5},{y:2001,p:24.4},{y:2002,p:25.0},{y:2003,p:28.8},{y:2004,p:38.3},
  {y:2005,p:54.5},{y:2006,p:65.1},{y:2007,p:72.7},{y:2008,p:97.3},{y:2009,p:61.9},
  {y:2010,p:79.5},{y:2011,p:111.3},{y:2012,p:111.7},{y:2013,p:108.7},{y:2014,p:98.9},
  {y:2015,p:52.4},{y:2016,p:43.7},{y:2017,p:54.2},{y:2018,p:71.3},{y:2019,p:64.4},
  {y:2020,p:43.2},{y:2021,p:70.9},{y:2022,p:101.3},{y:2023,p:82.5},{y:2024,p:80.1},
  {y:2025,p:74.0},{y:2026,p:88.0},
];

function PriceWithEventsChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={PRICE_DATA_LONG} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
        <XAxis dataKey="y" tick={{ fill: '#ffffff60', fontSize: 10 }} axisLine={{ stroke: '#ffffff20' }} tickLine={false} />
        <YAxis tick={{ fill: '#ffffff60', fontSize: 10 }} axisLine={false} tickLine={false}
          label={{ value: '$/b', angle: -90, position: 'insideLeft', fill: '#ffffff40', fontSize: 10 }} />
        <Tooltip contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #ffffff20', borderRadius: '8px', fontSize: 11 }}
          labelStyle={{ color: '#ffffff80' }}
          formatter={(v: number) => [`$${v}/b`, 'Brent']} />
        {PRICE_EVENTS.map(e => (
          <ReferenceLine key={e.year} x={e.year} stroke={e.color} strokeWidth={1.5} opacity={0.7}
            label={{ value: e.label, position: 'top', fill: e.color, fontSize: 8 }} />
        ))}
        <Line type="monotone" dataKey="p" stroke="#C17F24" strokeWidth={2.5} dot={false}
          activeDot={{ r: 4, fill: '#C17F24' }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── Multi-pays dark ──────────────────────────────────────────────────────────
const DEFAULT_COUNTRIES = ['USA','SAU','RUS','CAN','NOR','GBR','VEN'];

function MultiCountryDark({ data }: { data: any[] }) {
  const [selected, setSelected] = useState(new Set(DEFAULT_COUNTRIES));

  const allCountries = useMemo(() =>
    [...new Set(data.map(d => d.country_code))].sort(), [data]);

  const chartData = useMemo(() => {
    const byYear: Record<number, Record<string, number>> = {};
    data.forEach(d => {
      if (!byYear[d.year]) byYear[d.year] = {};
      byYear[d.year][d.country_code] = (byYear[d.year][d.country_code] ?? 0) + d.production_value;
    });
    return Object.entries(byYear).sort(([a],[b]) => Number(a)-Number(b))
      .map(([year, vals]) => ({ year: Number(year), ...vals }));
  }, [data]);

  const toggle = (code: string) => setSelected(prev => {
    const nx = new Set(prev);
    nx.has(code) ? nx.delete(code) : nx.add(code);
    return nx;
  });

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {allCountries.map(code => {
          const active = selected.has(code);
          const color = CTRY_COLORS[code] ?? '#8E7F6B';
          return (
            <button key={code} onClick={() => toggle(code)}
              className="px-2 py-0.5 rounded text-xs font-bold border transition"
              style={active
                ? { backgroundColor: color + '33', borderColor: color + '88', color }
                : { backgroundColor: 'transparent', borderColor: '#ffffff15', color: '#ffffff30' }}>
              {code}
            </button>
          );
        })}
      </div>
      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis dataKey="year" type="number" scale="linear" domain={['dataMin','dataMax']}
            tick={{ fill: '#ffffff60', fontSize: 10 }} axisLine={{ stroke: '#ffffff20' }} tickLine={false} />
          <YAxis tick={{ fill: '#ffffff60', fontSize: 10 }} axisLine={false} tickLine={false}
            label={{ value: 'mb/j', angle: -90, position: 'insideLeft', fill: '#ffffff40', fontSize: 10 }} />
          <Tooltip contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #ffffff20', borderRadius: '8px', fontSize: 10 }}
            labelStyle={{ color: '#ffffff80' }}
            formatter={(v: number, n: string) => [`${Number(v).toFixed(2)} mb/j`, CTRY_NAMES[n] ?? n]} />
          <Legend wrapperStyle={{ paddingTop: 12, fontSize: 10 }}
            formatter={v => CTRY_NAMES[v] ?? v} />
          {[...selected].map(code => (
            <Line key={code} type="monotone" dataKey={code}
              stroke={CTRY_COLORS[code] ?? '#8E7F6B'} strokeWidth={2}
              dot={false} activeDot={{ r: 3 }} connectNulls name={code} />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <p className="text-xs text-white/30 text-center mt-2">Cliquer sur un code pays pour l'ajouter ou retirer du graphique</p>
    </div>
  );
}

// ── Prix récent depuis l'onglet Marché ───────────────────────────────────────
function RecentPriceFromMarket() {
  const { data: priceHistory } = useQuery({
    queryKey: ['market-price-history-past', 52],
    queryFn: () => api.get('/market/price-history?weeks=52').then(r => r.data),
    staleTime: 3600000,
    retry: false,
  });

  if (!priceHistory?.length) return null;

  return (
    <div className="mt-8">
      <div className="text-xs text-amber-500/50 uppercase tracking-widest mb-2">Données temps réel</div>
      <ChartBox
        title="Prix Brent — 12 derniers mois (données hebdomadaires)"
        subtitle="Source : pipeline marché · Mise à jour automatique chaque lundi">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={priceHistory} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="week" tick={{ fill: '#ffffff50', fontSize: 9 }} axisLine={{ stroke: '#ffffff15' }} tickLine={false}
              tickFormatter={(v: string) => v?.slice(5) ?? ''} />
            <YAxis tick={{ fill: '#ffffff50', fontSize: 9 }} axisLine={false} tickLine={false}
              label={{ value: '$/b', angle: -90, position: 'insideLeft', fill: '#ffffff30', fontSize: 9 }} />
            <Tooltip contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #ffffff20', borderRadius: '8px', fontSize: 11 }}
              labelStyle={{ color: '#ffffff70' }}
              formatter={(v: number, n: string) => [`$${Number(v).toFixed(2)}/b`, n === 'brent' ? 'Brent' : 'WTI']} />
            <Legend wrapperStyle={{ paddingTop: 10, fontSize: 10 }} />
            <Line type="monotone" dataKey="brent" stroke="#C17F24" strokeWidth={2.5} dot={false} name="brent" />
            <Line type="monotone" dataKey="wti" stroke="#4A90A4" strokeWidth={1.5} dot={false} name="wti" strokeDasharray="3 2" />
          </LineChart>
        </ResponsiveContainer>
      </ChartBox>
    </div>
  );
}

function PastContent() {
  const { mode } = useReadingMode();
  const { data: histData } = useHistoricalProduction();
  const { data: eroeiData } = useEROEI(undefined, 1970, 2024);

  const CHAPTERS = [
    { n: '0', label: '-300M ans', title: 'Origines géologiques', id: 'ch-geo' },
    { n: 'I', label: '1840', title: 'Les baleines', id: 'ch-baleines' },
    { n: 'II', label: '1859', title: 'Le premier puits', id: 'ch-drake' },
    { n: 'III', label: '1870', title: 'Rockefeller', id: 'ch-rock' },
    { n: 'IV', label: '1901', title: 'Spindletop & Ford T', id: 'ch-ford' },
    { n: 'V', label: '1939', title: 'La guerre à l\'essence', id: 'ch-guerre' },
    { n: 'VI', label: '1950', title: 'L\'âge d\'or', id: 'ch-or' },
    { n: 'VII', label: '1973', title: 'Les chocs pétroliers', id: 'ch-chocs' },
    { n: 'VIII', label: '1990', title: 'Guerres du pétrole', id: 'ch-wars' },
    { n: 'IX', label: '1980', title: 'La révolution shale', id: 'ch-shale' },
  ];

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <TableOfContents chapters={CHAPTERS} />

      {/* Toggle sticky */}
      <div className="sticky top-14 z-40 flex items-center justify-between px-8 py-3 bg-[#0d0d0d]/90 backdrop-blur border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="text-amber-500/60 text-xs uppercase tracking-widest font-bold">Acte I</span>
          <span className="text-white/20 text-xs">1850 → 2024</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/25 text-xs">{mode === 'short' ? '~7 min' : '~11 min'} de lecture</span>
          <ReadingToggle />
        </div>
      </div>

      {/* Hero */}
      <div className="relative px-8 py-28 overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 20% 50%, #3D2010 0%, #0d0d0d 70%)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-amber-500/50 text-xs uppercase tracking-[0.3em] mb-6">Acte I · 1850 → 2024</div>
          <h1 className="text-6xl md:text-8xl font-black text-white leading-none mb-6" style={{ letterSpacing: '-0.02em' }}>
            Du blanc<br />de baleine<br /><span className="text-amber-400">au shale</span>
          </h1>
          <p className="text-lg text-white/50 leading-relaxed max-w-xl">
            Comment une huile noire et malodorante a sauvé les baleines, alimenté deux guerres mondiales,
            et bâti la civilisation moderne en cent cinquante ans.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-8 pb-32 space-y-0">

        <ChapterAnchor id="ch-geo" />
        {/* 0 — ORIGINES GÉOLOGIQUES */}
        <ChapterLabel n="0" label="-300 millions d'années" />
        <H2>D'abord, comprendre ce qu'est vraiment le pétrole</H2>

        <P>
          Avant Drake, avant Rockefeller, avant les guerres — il y a la géologie.
          Le pétrole n'est pas une ressource minérale. C'est de la vie morte,
          comprimée, cuite pendant des millions d'années. Plus précisément :
          des milliards de micro-organismes marins — algues, bactéries, plancton —
          qui vivaient dans des mers anciennes, mouraient, coulaient au fond,
          et s'accumulaient en couches épaisses de matière organique.
        </P>

        <P>
          Sous le poids des sédiments qui s'accumulent au-dessus pendant des millions d'années,
          la température monte. Entre 60 et 150°C, un phénomène chimique se produit :
          la matière organique se transforme en hydrocarbures — pétrole et gaz naturel.
          Ce processus s'appelle la <em>catagenèse</em>. Il faut entre 10 et 100 millions
          d'années pour qu'il se produise. Autrement dit : le pétrole qu'on brûle aujourd'hui
          vient d'organismes qui vivaient quand les dinosaures n'existaient pas encore.
        </P>

        {/* Schéma simplifié bassin sédimentaire */}
        <ChartBox
          title="Formation d'un gisement pétrolier — schéma simplifié"
          subtitle="De la vie marine à l'hydrocarbure : 50-300 millions d'années">
          <div className="py-4 space-y-3 text-xs">
            {[
              { depth: '0-500m',     label: 'Zone diagénétique',    color: '#8B6F47', desc: 'Sédiments récents, matière organique préservée. Température < 60°C. Aucune transformation.' },
              { depth: '1-3 km',     label: 'Fenêtre à pétrole',    color: '#C17F24', desc: '60-150°C — La catagenèse produit du pétrole. C\'est la zone idéale. Pression et chaleur transforment la kérogène en hydrocarbures liquides.' },
              { depth: '3-5 km',     label: 'Fenêtre à gaz',        color: '#4A90A4', desc: '150-200°C — Trop chaud pour le pétrole liquide. Seul le gaz naturel (méthane) survit à ces températures.' },
              { depth: '> 5 km',     label: 'Zone métamorphique',   color: '#2C3E50', desc: '> 200°C — Tout est détruit. Plus aucun hydrocarbure ne peut survivre. La roche mère devient du graphite.' },
            ].map(z => (
              <div key={z.depth} className="flex gap-3 items-start">
                <div className="w-16 text-right text-white/40 font-mono shrink-0 pt-0.5">{z.depth}</div>
                <div className="w-2 shrink-0 self-stretch flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: z.color }} />
                  <div className="w-px flex-1 bg-white/10" />
                </div>
                <div className="flex-1 pb-1">
                  <div className="font-bold mb-0.5" style={{ color: z.color }}>{z.label}</div>
                  <div className="text-white/50 leading-relaxed">{z.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </ChartBox>

        <H2>Pourquoi le Moyen-Orient et pas la France</H2>

        <P>
          Le pétrole ne se forme pas n'importe où. Il faut une conjonction rare
          de quatre conditions simultanées — ce que les géologues appellent un
          "système pétrolier" :
        </P>

        <div className="my-8 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {[
            { n: '1', label: 'Roche mère', color: '#C17F24', desc: 'Sédiment riche en matière organique — argile marine, calcaire. Mer de Téthys il y a 100M d\'années pour le Moyen-Orient.' },
            { n: '2', label: 'Enfouissement', color: '#8B4513', desc: 'Il faut que la roche mère soit enfouie assez profondément et assez longtemps pour atteindre la température de catagenèse.' },
            { n: '3', label: 'Roche réservoir', color: '#4A90A4', desc: 'Le pétrole formé migre vers le haut. Il faut une roche poreuse et perméable (grès, calcaire fissuré) pour l\'accueillir.' },
            { n: '4', label: 'Piège géologique', color: '#2E7D6B', desc: 'Un anticlinal, une faille, un dôme de sel — une structure qui empêche le pétrole de continuer à migrer vers la surface.' },
          ].map(c => (
            <div key={c.n} className="bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black mb-2"
                style={{ backgroundColor: c.color + '40', color: c.color }}>
                {c.n}
              </div>
              <div className="font-bold text-white mb-1">{c.label}</div>
              <div className="text-white/50 leading-relaxed">{c.desc}</div>
            </div>
          ))}
        </div>

        <P>
          La mer de Téthys — l'ancêtre de la Méditerranée — couvrait il y a 100 millions d'années
          une bande de territoire qui va aujourd'hui de l'Iran à l'Irak en passant par l'Arabie
          Saoudite. Mer chaude, peu profonde, extraordinairement productive en plancton.
          Conditions idéales pour accumuler d'immenses quantités de matière organique.
          Puis les plaques tectoniques ont bougé, enfouissant ces sédiments à la profondeur
          parfaite — ni trop, ni pas assez. Et par-dessus, des évaporites (sel et anhydrite)
          ont formé des pièges imperméables parfaits. C'est une loterie géologique.
          Le Moyen-Orient a gagné le jackpot.
        </P>

        <P>
          La France a du charbon (forêts carbonifères enfouies), mais presque pas de pétrole
          (bassin sédimentaire insuffisant, absence de pièges adéquats).
          L'Écosse a du pétrole en mer du Nord (bassin sédimentaire mésozoïque très riche).
          L'Afrique subsaharienne en a sur ses marges côtières (rifting de l'Atlantique).
          Chaque gisement est une histoire géologique unique — et irremplaçable.
        </P>

        <H2>Quand il n'y en aura plus — c'est pour toujours</H2>

        <P>
          Le pétrole est une ressource non-renouvelable dans tout sens pratique du terme.
          Il se forme à l'échelle des temps géologiques — des dizaines de millions d'années.
          L'humanité en consomme l'équivalent de plusieurs millions d'années de formation
          chaque année.
          Ce que nous brûlons en une journée — 102 millions de barils — a pris
          environ un million d'années à se former.
          Autrement dit : nous consommons le capital géologique de la Terre
          à une vitesse environ un million de fois supérieure à la vitesse de sa formation.
        </P>

        <P>
          Quand un gisement sera épuisé, il ne se reconstituera pas.
          Pas dans dix ans. Pas dans cent ans. Pas dans un million d'années.
          Pour les gisements actuels, la géologie a travaillé pendant la période Jurassique —
          quand les premiers dinosaures marchaient sur Terre.
          Brûler ce capital en deux siècles est peut-être l'acte le plus irréversible
          que l'humanité ait jamais accompli.
        </P>

        <div className="my-8 p-5 bg-white/5 rounded-2xl border border-white/10">
          <div className="grid grid-cols-3 gap-4 text-center text-xs">
            {[
              { val: '300M', unit: 'ans', label: 'Pour former le pétrole actuel', color: '#C17F24' },
              { val: '200', unit: 'ans', label: 'Pour le consommer entièrement', color: '#B85450' },
              { val: '×1.5M', label: 'Ratio formation / consommation', color: '#2E7D6B' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-3xl font-black mb-0.5" style={{ color: s.color }}>
                  {s.val}<span className="text-lg text-white/40 ml-0.5">{s.unit}</span>
                </div>
                <div className="text-white/40">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <Long>
          <P>
            Une nuance importante : les "réserves prouvées" ne représentent pas
            tout le pétrole existant dans le sous-sol — seulement ce qui est
            techniquement et économiquement extractible aujourd'hui.
            Quand le prix du baril monte, certains gisements autrefois trop coûteux
            deviennent exploitables. Le shale américain en est l'exemple parfait —
            il existait depuis des décennies, mais est devenu viable seulement
            quand les prix l'ont permis et quand la technologie a progressé.
            Mais même en tenant compte de tout le pétrole "non conventionnel",
            la conclusion reste la même : c'est fini quand c'est fini.
          </P>
          <Anecdote>
            Le seul endroit sur Terre où du "nouveau" pétrole biogénique se forme
            activement est Titan, la lune de Saturne — où des lacs d'hydrocarbures
            se constituent à partir de réactions atmosphériques. Sur Terre, certaines
            bactéries produisent des hydrocarbures, mais à des échelles
            infiniment trop faibles pour constituer une ressource.
            Des scientifiques soviétiques ont développé dans les années 1950
            une théorie dite "abiotique" — le pétrole se formerait dans le manteau
            terrestre sans matière organique. Elle est rejetée par la quasi-totalité
            de la communauté géologique mondiale. Le pétrole vient de la vie.
            Point final.
          </Anecdote>
        </Long>

        <Sep />

        <ChapterAnchor id="ch-baleines" />
        {/* I — Les baleines */}
        <ChapterLabel n="I" label="1840-1860" />
        <H2>Les baleines étaient le pétrole du XIXe siècle</H2>
        <P>
          En 1850, les maisons de Boston et de Londres s'éclairent à l'huile de baleine.
          Les machines industrielles se lubrifient à la graisse de cétacé. La mode impose des corsets en fanons.
          La baleine franche de l'Atlantique Nord est en voie d'extinction — et l'industrie baleinière
          américaine emploie 70 000 personnes avec une flotte de 700 navires.
        </P>
        <P>
          La demande est telle que les baleines disparaissent des mers proches. Les baleiniers partent
          de plus en plus loin — Pacifique, Antarctique. Un voyage dure trois ans.
          Le prix de l'huile monte. La solution viendra du sol, pas de la mer.
        </P>
        <Anecdote>
          En 1851, Herman Melville publie <em>Moby Dick</em>. C'est le portrait d'une industrie à son apogée,
          juste avant qu'elle disparaisse. Melville ne pouvait pas savoir qu'un puits en Pennsylvanie allait,
          huit ans plus tard, rendre son monde obsolète. Les baleines n'ont pas été sauvées par l'écologie.
          Elles ont été sauvées par la géologie.
        </Anecdote>

        <Long>
          <P>
            Le problème n'est pas seulement la raréfaction. C'est aussi la qualité de l'huile qui décline —
            on chasse maintenant des espèces moins grasses, moins productives. Le rendement chute.
            Les armateurs cherchent désespérément une alternative. Certains expérimentent avec le charbon,
            le gaz de ville. Mais rien ne rivalise avec la fluidité et le pouvoir éclairant de l'huile de baleine.
            La pression économique est immense — et c'est elle qui va financer les premières explorations pétrolières.
          </P>
        </Long>

        <Sep />

        <ChapterAnchor id="ch-drake" />
        {/* II — Drake */}
        <ChapterLabel n="II" label="1859" />
        <H2>Le 27 août 1859, tout change</H2>
        <P>
          Edwin Drake n'est pas géologue. Pas ingénieur. Il est conducteur de train à la retraite,
          engagé pour forer le sol à la recherche de pétrole en Pennsylvanie.
          Ses voisins l'appellent "Drake le fou".
        </P>
        <P>
          Le 27 août 1859, à Titusville, le forage atteint 21 mètres. Du pétrole remonte.
          Drake regarde le liquide noir remplir une baignoire de bois.
          Le monde vient de changer — mais personne ne le sait encore.
        </P>
        <StatRow>
          <Stat val="21" unit="m" label="profondeur du 1er puits" />
          <Stat val="1859" label="Titusville, Pennsylvanie" />
          <Stat val="$2" unit="/b" label="prix initial" />
          <Stat val="$0.10" unit="/b" label="prix 6 mois plus tard" />
        </StatRow>
        <Anecdote>
          Le prix du baril s'effondre de 2$ à 10 cents en six mois — victime de son propre succès.
          Tout le monde fore. La région se transforme en chaos pétrolier. Les baleiniers commencent
          à reconvertir leurs navires. L'industrie de la baleine ne s'en remettra jamais.
          Les baleines, elles, soufflent de soulagement. Littéralement.
        </Anecdote>

        <Sep />

        <ChapterAnchor id="ch-rock" />
        {/* III — Rockefeller */}
        <ChapterLabel n="III" label="1870-1911" />
        <H2>John D. Rockefeller invente le capitalisme moderne</H2>
        <P>
          En 1870, Rockefeller a 31 ans et contrôle 4% du raffinage américain.
          En 1879, il en contrôle 90%. Il n'a pas découvert de pétrole —
          il a compris que le vrai pouvoir n'était pas dans le sol, mais dans les tuyaux.
        </P>
        <P>
          Standard Oil construit les pipelines. Négocie des tarifs secrets avec les chemins de fer.
          Rachète ou écrase les concurrents. En 1882, Rockefeller invente le "trust".
          Le gouvernement américain mettra 30 ans à comprendre comment le démanteler.
        </P>
        <Quote
          text="La croissance des grandes entreprises est simplement la survie des plus aptes."
          source="John D. Rockefeller, vers 1900" />
        <Long>
          <P>
            Le démantèlement de Standard Oil en 1911 produit un résultat inattendu :
            Rockefeller, forcé de recevoir les actions de 34 nouvelles sociétés, devient encore plus riche.
            Parmi ces héritières : Standard Oil of New Jersey (futur ExxonMobil), Standard Oil of California
            (futur Chevron). La valeur combinée de ces sociétés dépasse aujourd'hui 1 000 milliards de dollars.
          </P>
          <Anecdote>
            À sa mort en 1937, Rockefeller était l'homme le plus riche de l'histoire américaine.
            Sa fortune équivalait à 1,5% du PIB américain — soit, proportionnellement,
            environ 340 milliards de dollars aujourd'hui. Il a donné la moitié à des œuvres de charité.
            Sa fortune huilée tache encore le monde académique : l'université de Chicago,
            les musées, les centres de recherche médicale.
          </Anecdote>
        </Long>

        <Sep />

        <ChapterAnchor id="ch-ford" />
        {/* IV */}
        <ChapterLabel n="IV" label="1901-1945" />
        <H2>Spindletop et la voiture pour tous</H2>
        <P>
          Le 10 janvier 1901, à Beaumont, Texas, le puits Lucas No. 1 produit un geyser
          de pétrole de 30 mètres pendant 9 jours. Spindletop produit plus de pétrole en un jour
          que tous les autres puits du monde réunis. Le Texas entre dans l'histoire.
        </P>
        <P>
          Sept ans plus tard, Henry Ford lance la Model T. En 1908, une voiture coûte
          deux ans de salaire ouvrier. En 1925, grâce à la production en série et au pétrole
          bon marché, trois mois. L'Amérique se construit autour de l'automobile.
          Un mode de vie entier émerge d'un puits dans le sol.
        </P>
        <StatRow>
          <Stat val="100K" unit="b/j" label="Spindletop 1901" />
          <Stat val="15M" label="Ford T produites" />
          <Stat val="1913" label="1re chaîne de montage" />
          <Stat val="$260" label="Ford T en 1925" />
        </StatRow>
        <Long>
          <P>
            Churchill comprend l'enjeu militaire dès 1911. Premier Lord de l'Amirauté,
            il convertit la flotte britannique du charbon au pétrole. Contre l'avis de tous.
            Le charbon est britannique, abondant, sûr. Le pétrole est étranger.
            Mais il donne aux navires 30% de vitesse supplémentaire. Churchill gagne.
            L'Angleterre acquiert une participation dans l'Anglo-Persian Oil Company — futur BP.
          </P>
          <Anecdote>
            Cette décision façonne le Moyen-Orient moderne. L'Anglo-Persian contrôle le pétrole iranien.
            Quand l'Iran nationalisera ses ressources en 1951, les Britanniques et les Américains
            organiseront un coup d'État pour renverser le premier ministre Mossadegh.
            La géopolitique pétrolière du XXe siècle commence là, dans un bureau londonien en 1911.
          </Anecdote>
        </Long>

        <Sep />

        <ChapterAnchor id="ch-guerre" />
        {/* V — La guerre */}
        <ChapterLabel n="V" label="1939-1945" />
        <H2>La Seconde Guerre mondiale a été gagnée à l'essence</H2>
        <P>
          En juin 1941, Hitler envahit l'Union Soviétique. L'objectif réel n'est pas Moscou —
          c'est Bakou, la grande ville pétrolière au bord de la Caspienne.
          L'Allemagne n'a presque pas de pétrole. Le plan : prendre celui des Soviétiques,
          puis des Iraniens, puis des Irakiens.
        </P>
        <P>
          La bataille de Stalingrad bloque la route. Pendant ce temps, les États-Unis —
          60% du pétrole mondial en 1945 — ravitaillent les Alliés.
          Chaque char Sherman, chaque bombardier B-17 carburent au Texas et en Oklahoma.
        </P>
        <Quote
          text="Mes soldats ne combattent pas — mon essence combat."
          source="Général Patton, 1944" />
        <Long>
          <P>
            Le Japon fait le même calcul à Pearl Harbor. 80% du pétrole japonais vient des États-Unis.
            Roosevelt décrète un embargo. Le Japon attaque Pearl Harbor pour neutraliser la flotte
            américaine et conquérir les Indes néerlandaises (actuelle Indonésie) pour leurs puits.
            La flotte de porte-avions américaine est absente ce dimanche matin.
            Les États-Unis entrent en guerre.
          </P>
        </Long>

        <Sep />

        <ChapterAnchor id="ch-or" />
        {/* VI */}
        <ChapterLabel n="VI" label="1950-1973" />
        <H2>L'âge d'or : quand le pétrole coulait à 2$ le baril</H2>
        <P>
          Les années 1950-1970 sont l'âge d'or. Pétrole abondant, bon marché, et sa combustion
          semble sans coût. Les voitures américaines sont des baleines d'acier — 5 mètres, 8L/100.
          La pétrochimie invente le plastique, les engrais, le nylon. La population mondiale double.
        </P>
        <P>
          C'est aussi l'époque où l'OPEC se structure. En 1960, cinq pays créent l'organisation
          à Bagdad pour récupérer le contrôle de leurs ressources face aux "Sept Sœurs",
          les grandes compagnies occidentales qui fixaient seules les prix.
        </P>

        {histData && histData.length > 0 && (
          <ChartBox
            title="Top 10 producteurs mondiaux — évolution par décennie"
            subtitle="Sélectionner une année · flèches = variation de rang">
            <TopProducersDark data={histData} />
          </ChartBox>
        )}

        <Long>
          <Anecdote>
            Le terme "Sept Sœurs" est inventé en 1952 par Enrico Mattei, industriel italien,
            pour désigner les sept compagnies qui contrôlaient 85% des réserves mondiales.
            Mattei voulait que l'Italie ait son propre accès au pétrole arabe.
            Il mourut dans un accident d'avion suspect en 1962. Certains pensent que la CIA
            ou les Sœurs elles-mêmes n'y sont pas étrangères.
          </Anecdote>
        </Long>

        <Sep />

        <ChapterAnchor id="ch-chocs" />
        {/* VII */}
        <ChapterLabel n="VII" label="1973-1980" />
        <H2>Le réveil brutal : les chocs pétroliers</H2>
        <P>
          Le 6 octobre 1973, Égypte et Syrie attaquent Israël. Les États-Unis soutiennent Israël.
          L'OPEC décrète un embargo. En trois mois, le baril passe de 3$ à 12$.
          Les automobilistes américains font la queue aux stations-service.
        </P>
        <P>
          Pour la première fois, l'Occident comprend sa vulnérabilité.
          La France accélère le nucléaire. Le Danemark invente l'éolienne moderne.
          Des programmes d'isolation thermique se lancent partout.
          Tout cela parce que des émirs arabes ont fermé un robinet.
        </P>
        <StatRow>
          <Stat val="×4" label="hausse prix baril 1973" />
          <Stat val="3→12" unit="$/b" label="en 3 mois" />
          <Stat val="-2.5%" label="croissance mondiale 1974" />
          <Stat val="×3" label="2e choc 1979, révolution iranienne" />
        </StatRow>
        <Long>
          <Anecdote>
            La Ford Pinto, lancée en 1971, était la réponse américaine à la concurrence japonaise.
            Ford avait calculé que rappeler la voiture pour corriger un défaut du réservoir
            d'essence coûterait plus cher que payer les compensations aux victimes d'accidents.
            Cette analyse coût-bénéfice cynique, rendue publique en 1977, reste l'un des scandales
            industriels les plus célèbres de l'histoire américaine.
            Le pétrole bon marché avait rendu les ingénieurs négligents sur la sécurité.
          </Anecdote>
        </Long>

        <Sep />

        <ChapterAnchor id="ch-wars" />
        {/* IX */}
        <ChapterLabel n="VIII" label="1990-2026" />
        <H2>Les guerres récentes sont des guerres du pétrole — avec d'autres noms</H2>

        <P>
          Depuis 1990, la quasi-totalité des conflits armés majeurs impliquant
          des puissances occidentales se sont déroulés dans ou autour des régions
          pétrolières. Ce n'est pas une coïncidence. C'est une équation géopolitique
          que les dirigeants refusent d'énoncer publiquement mais que leurs états-majors
          planifient explicitement.
        </P>

        <div className="my-8 space-y-3">
          {[
            {
              guerre: 'Guerre du Golfe — 1990-1991',
              petrole: 'Irak envahit le Koweït — 10% des réserves mondiales changent de mains',
              reponse: 'Coalition de 34 pays menée par les USA. Libération du Koweït en 6 semaines.',
              dit: '"Protéger la souveraineté du Koweït"',
              vrai: 'Protéger 10% des réserves mondiales prouvées et maintenir l\'accès au Golfe.',
              color: '#C17F24',
            },
            {
              guerre: 'Invasion d\'Afghanistan — 2001-2021',
              petrole: 'Pipeline TAPI (Turkménistan-Afghanistan-Pakistan-Inde) : 33 Gm³/an de gaz planifié',
              reponse: '20 ans d\'occupation, 2 400 soldats américains tués, 2 000 milliards dépensés.',
              dit: '"Éliminer Al-Qaïda et les Talibans"',
              vrai: 'Sécuriser un corridor énergétique stratégique en Asie centrale. Les Talibans ont repris le pouvoir 3 semaines après le départ.',
              color: '#8B4513',
            },
            {
              guerre: 'Invasion d\'Irak — 2003-2011',
              petrole: '115 milliards de barils de réserves prouvées — 3e réserve mondiale',
              reponse: 'Coalition USA-UK. 4 500 soldats américains tués. 500 000 civils irakiens morts (estimations ONU).',
              dit: '"Armes de destruction massive" (inexistantes)',
              vrai: 'Accès aux réserves irakiennes. ExxonMobil, BP et Shell ont signé des contrats d\'exploitation dans les 3 ans suivant l\'invasion.',
              color: '#B85450',
            },
            {
              guerre: 'Printemps arabe / Libye — 2011',
              petrole: '48 milliards de barils + pétrole léger de haute qualité, coût d\'extraction parmi les plus bas au monde',
              reponse: 'Intervention OTAN. Kadhafi tué. Chaos durable.',
              dit: '"Protéger les civils" (résolution ONU 1973)',
              vrai: 'La France et l\'Italie avaient des contrats pétroliers massifs. Total et ENI ont maintenu leurs accès post-intervention.',
              color: '#7B5EA7',
            },
            {
              guerre: 'Guerre en Ukraine — 2022-présent',
              petrole: 'Russie = 2e exportateur mondial de pétrole, 1er de gaz naturel vers l\'Europe',
              reponse: 'Sanctions occidentales massives. Réorientation des flux énergétiques européens. Prix du gaz ×10 en Europe en 2022.',
              dit: '"Défense de la démocratie ukrainienne"',
              vrai: 'Réelle — mais aussi fin de la dépendance européenne au gaz russe, déjà planifiée depuis 2014 (Nord Stream sabotage inclus).',
              color: '#4A90A4',
            },
          ].map(g => (
            <div key={g.guerre} className="rounded-xl border border-white/10 overflow-hidden">
              <div className="px-4 py-3 flex items-center justify-between"
                style={{ backgroundColor: g.color + '20', borderBottom: `1px solid ${g.color}30` }}>
                <div className="font-bold text-white text-sm">{g.guerre}</div>
                <div className="text-xs font-mono" style={{ color: g.color }}>{g.petrole.split('—')[0].trim()}</div>
              </div>
              <div className="px-4 py-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <div className="text-white/40 uppercase tracking-widest text-xs mb-1 font-bold">Enjeu pétrolier</div>
                  <div className="text-white/75 leading-relaxed">{g.petrole}</div>
                </div>
                <div>
                  <div className="text-white/40 uppercase tracking-widest text-xs mb-1 font-bold">Ce qu'on a dit</div>
                  <div className="text-white/75 italic">"{g.dit}"</div>
                </div>
                <div>
                  <div className="text-white/40 uppercase tracking-widest text-xs mb-1 font-bold">Ce qui s'est passé</div>
                  <div className="text-white/75 leading-relaxed">{g.vrai}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <P>
          Aucune de ces guerres n'est <em>uniquement</em> une guerre du pétrole.
          Les causes sont toujours multiples — idéologie, géopolitique, histoire,
          sécurité nationale. Mais dans chaque cas, l'analyse des intérêts économiques
          concrets révèle que le pétrole et le gaz figurent parmi les premières
          motivations réelles, même quand elles ne sont pas avouées.
          Alan Greenspan, ancien président de la Fed américaine, l'a dit avec une franchise
          inhabituelle dans ses mémoires en 2007 :
        </P>

        <Quote
          text="Je suis attristé que ce soit politiquement inconvenant d'admettre ce que tout le monde sait : la guerre en Irak est en grande partie pour le pétrole."
          source="Alan Greenspan, The Age of Turbulence (2007)" />

        {/* Graphique prix vs événements géopolitiques */}
        <ChartBox
          title="Prix du Brent 1970-2026 — les guerres laissent des traces"
          subtitle="Chaque pic de prix correspond à une crise géopolitique pétrolière">
          <PriceWithEventsChart />
        </ChartBox>

        <Long>
          <P>
            Le paradoxe ultime : les armées qui font ces guerres consomment
            elles-mêmes d'énormes quantités de pétrole.
            L'armée américaine est le plus grand consommateur institutionnel
            de pétrole au monde — environ 350 000 barils par jour en temps de paix,
            jusqu'à 750 000 en opération.
            On fait la guerre pour le pétrole en brûlant du pétrole.
            Un char Abrams consomme environ 400 litres aux 100 km.
            Un porte-avions nucléaire a besoin de 3 millions de litres d'aviation
            par semaine pour ses avions embarqués.
            La guerre pétrolière est la guerre la plus énergivore qui soit.
          </P>
          <Anecdote>
            En 2003, le général américain John Abizaid a déclaré après l'invasion de l'Irak :
            "Bien sûr que c'est pour le pétrole. Nous nous battons pour maintenir
            un mode de vie." Sa déclaration a été rapidement démentie par le Pentagone.
            Mais elle circulait déjà dans la presse internationale.
            Les soldats, eux, savent souvent pour quoi ils se battent.
            Ce sont les communiqués officiels qui ne le disent pas.
          </Anecdote>
        </Long>

        <Sep />

        <ChapterAnchor id="ch-shale" />
        {/* X */}
        <ChapterLabel n="IX" label="1980-2020" />
        <H2>La révolution silencieuse : tous les pétroles ne se valent pas</H2>
        <P>
          Pendant que les prix fluctuent, la technologie progresse.
          Le pétrole facile — le conventionnel — se raréfie.
          On va chercher plus profond, plus loin : offshore profond, sables bitumineux canadiens,
          et finalement le grand saut : la fracturation hydraulique américaine.
        </P>
        <P>
          Le "shale" est connu depuis les années 1970 mais trop cher à extraire.
          La combinaison forage horizontal + fracturation le rend viable après 2005.
          Résultat stupéfiant : les États-Unis, dont la production déclinait depuis 1970,
          redeviennent en 2018 le premier producteur mondial. Personne ne l'avait prévu.
        </P>

        <ChartBox
          title="Composition de la production par méthode — USA 1965-2024"
          subtitle="Le schiste passe de 0% à ~65% en 15 ans">
          <MethodDark />
        </ChartBox>

        <Long>
          <P>
            Le revers : chaque nouveau type de pétrole est plus énergivore.
            L'EROEI — rapport énergie produite / énergie investie — chute.
            Conventionnel années 1970 : 35:1. Shale américain : 5-8:1.
            Sables bitumineux : 3:1. À 1:1, on dépense autant qu'on produit.
            Les sables restent rentables si le prix du baril est suffisamment élevé —
            mais la rentabilité énergétique de la civilisation, elle, décline.
          </P>

            <ChartBox
              title="EROEI par méthode d'extraction 1970-2024"
              subtitle="Plus le ratio baisse, plus il faut d'énergie pour produire un baril">
              <EROEIDark />
            </ChartBox>

          <Anecdote>
            En 2014, le baril s'effondre de 110$ à 45$ en six mois.
            L'Arabie Saoudite refuse de baisser sa production — elle veut tuer le shale américain,
            dont les coûts sont plus élevés. Pari perdu : les producteurs américains améliorent
            leur efficacité, réduisent leurs coûts, tiennent bon.
            En 2018, les États-Unis produisent plus que l'Arabie Saoudite pour la première fois
            depuis 1973. La géopolitique du pétrole ne sera plus jamais la même.
          </Anecdote>
        </Long>

        <Sep />

        {/* Conclusion */}
        <div className="py-8">
          <div className="text-amber-500/50 text-xs uppercase tracking-widest mb-4">Bilan</div>
          <H2>165 ans — et le monde est méconnaissable</H2>
          <P>
            De Drake à Spindletop, des Trente Glorieuses aux chocs pétroliers, du conventionnel au shale :
            le pétrole a tout modifié. La démographie mondiale (×8 depuis 1850), la géographie des villes,
            les rapports de force entre nations, et la durée de vie humaine elle-même —
            les engrais chimiques issus du pétrole permettent de nourrir 4 milliards de personnes
            supplémentaires.
          </P>
          <P>
            On pourrait appeler notre époque "l'ère anthropocène". On pourrait aussi l'appeler
            "l'ère pétrocène". Car tout ce qui définit notre monde matériel — plastiques, engrais,
            kérosène, routes, vêtements synthétiques, médicaments — remonte, d'une façon ou d'une autre,
            à un liquide noir extrait du sol.
          </P>

          <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6
            p-6 bg-white/5 rounded-2xl border border-white/10">
            <div>
              <div className="text-white/40 text-sm mb-1">Acte suivant</div>
              <div className="text-white font-bold text-xl">Aujourd'hui — L'empire invisible</div>
              <div className="text-white/40 text-xs mt-0.5">
                CO₂, géopolitique, Dubaï dans le désert, prix à la pompe
              </div>
            </div>
            <Link to="/present"
              className="shrink-0 px-6 py-3 bg-blue-900/50 border border-blue-700/50
                hover:bg-blue-900/70 text-blue-300 font-bold rounded-xl transition-all text-sm">
              Lire l'Acte II →
            </Link>
          </div>

          {/* Graphique évolution production par pays */}
          {histData && histData.length > 0 && (
            <div className="mt-10">
              <div className="text-xs text-amber-500/50 uppercase tracking-widest mb-2">Explorer les données</div>
              <ChartBox
                title="Évolution de la production par pays 1965-2023"
                subtitle="Données BP Statistical Review · Sélectionner les pays à comparer">
                <MultiCountryDark data={histData} />
              </ChartBox>
            </div>
          )}

          {/* Prix Brent récent depuis l'onglet Marché */}
          <RecentPriceFromMarket />
        </div>

      </div>
    </div>
  );
}

export default function PastStory() {
  return (
    <ReadingModeProvider>
      <PastContent />
    </ReadingModeProvider>
  );
}
