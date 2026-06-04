import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ReadingModeProvider, ReadingToggle, Long, useReadingMode, TableOfContents, ChapterAnchor } from '@/context/ReadingMode';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, Legend, AreaChart, Area
} from 'recharts';
import { GRID_STYLE, AXIS_STYLE } from '@/utils/chartColors';

// ── Mix énergétique mondial ───────────────────────────────────────────────────
const ENERGY_MIX_STATIC = [
  { year:1965, oil:1530, gas:580,  coal:1468, nuclear:17,  hydro:99,  renewables:1   },
  { year:1970, oil:2112, gas:902,  coal:1553, nuclear:38,  hydro:111, renewables:2   },
  { year:1980, oil:2972, gas:1302, coal:1813, nuclear:161, hydro:148, renewables:2   },
  { year:1990, oil:3136, gas:1772, coal:2233, nuclear:453, hydro:186, renewables:6   },
  { year:2000, oil:3573, gas:2191, coal:2386, nuclear:580, hydro:229, renewables:25  },
  { year:2010, oil:4035, gas:2861, coal:3555, nuclear:626, hydro:305, renewables:158 },
  { year:2015, oil:4332, gas:3139, coal:3839, nuclear:583, hydro:349, renewables:360 },
  { year:2019, oil:4617, gas:3461, coal:3773, nuclear:611, hydro:371, renewables:571 },
  { year:2020, oil:4137, gas:3347, coal:3555, nuclear:584, hydro:383, renewables:638 },
  { year:2022, oil:4570, gas:3542, coal:4017, nuclear:561, hydro:376, renewables:884 },
  { year:2023, oil:4606, gas:3568, coal:4059, nuclear:575, hydro:390, renewables:1030},
];

function EnergyMixChart() {
  const [view, setView] = useState<'stack'|'fossil'>('fossil');

  const { data: apiData } = useQuery({
    queryKey: ['energy-mix-world'],
    queryFn: () => api.get('/energy-mix/world').then(r => r.data),
    staleTime: 86400000, retry: false,
  });

  const chartData = useMemo(() => {
    if (apiData?.length) {
      return apiData.map((d: any) => ({
        year: d.year,
        oil: d.oil?.mtoe ?? 0, gas: d.gas?.mtoe ?? 0, coal: d.coal?.mtoe ?? 0,
        nuclear: d.nuclear?.mtoe ?? 0, hydro: d.hydro?.mtoe ?? 0, renewables: d.renewables?.mtoe ?? 0,
      }));
    }
    return ENERGY_MIX_STATIC;
  }, [apiData]);

  const fossilData = chartData.map((d: any) => ({
    year: d.year,
    fossil: Math.round(d.oil + d.gas + d.coal),
    clean: Math.round(d.nuclear + d.hydro + d.renewables),
    renewables_only: Math.round(d.renewables),
  }));

  return (
    <div className="mt-10">
      <div className="text-xs text-blue-400/50 uppercase tracking-widest mb-2">Source : BP Statistical Review</div>
      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 bg-white/5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="font-bold text-white text-sm">Mix énergétique mondial 1965-2023</div>
            <div className="text-xs text-white/40 mt-0.5">Mtoe — On ajoute, on n'enlève pas</div>
          </div>
          <div className="flex gap-1 p-0.5 bg-white/8 rounded-lg border border-white/10">
            {[{k:'fossil',l:'Fossile vs Propre'},{k:'stack',l:'Par source'}].map(v => (
              <button key={v.k} onClick={() => setView(v.k as any)}
                className={`px-3 py-1 rounded text-xs font-semibold transition ${view===v.k ? 'bg-white/15 text-white' : 'text-white/40'}`}>
                {v.l}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4 bg-[#0d1117]">
          {view === 'fossil' ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={fossilData} margin={{ top:10, right:20, left:10, bottom:20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="year" tick={{ fill:'#ffffff60', fontSize:10 }} axisLine={{ stroke:'#ffffff20' }} tickLine={false} />
                <YAxis tick={{ fill:'#ffffff60', fontSize:10 }} axisLine={false} tickLine={false}
                  label={{ value:'Mtoe', angle:-90, position:'insideLeft', fill:'#ffffff40', fontSize:9 }} />
                <Tooltip contentStyle={{ backgroundColor:'#0d1117', border:'1px solid #ffffff20', borderRadius:'8px', fontSize:11 }}
                  labelStyle={{ color:'#ffffff80' }} />
                <Legend wrapperStyle={{ paddingTop:10, fontSize:11 }} />
                <Line type="monotone" dataKey="fossil" stroke="#B85450" strokeWidth={3} dot={false} name="Fossiles (pétrole+gaz+charbon)" />
                <Line type="monotone" dataKey="clean"  stroke="#2E7D6B" strokeWidth={2.5} dot={false} name="Propre (nucl.+hydro+renouv.)" />
                <Line type="monotone" dataKey="renewables_only" stroke="#1a7a4a" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="Renouvelables seuls" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ top:10, right:20, left:10, bottom:20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="year" tick={{ fill:'#ffffff60', fontSize:10 }} axisLine={{ stroke:'#ffffff20' }} tickLine={false} />
                <YAxis tick={{ fill:'#ffffff60', fontSize:10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor:'#0d1117', border:'1px solid #ffffff20', borderRadius:'8px', fontSize:10 }}
                  labelStyle={{ color:'#ffffff80' }} />
                <Legend wrapperStyle={{ paddingTop:10, fontSize:10 }} />
                <Area type="monotone" dataKey="coal"       stackId="1" stroke="#2C3E50" fill="#2C3E50" fillOpacity={0.85} name="Charbon" />
                <Area type="monotone" dataKey="oil"        stackId="1" stroke="#C17F24" fill="#C17F24" fillOpacity={0.85} name="Pétrole" />
                <Area type="monotone" dataKey="gas"        stackId="1" stroke="#4A90A4" fill="#4A90A4" fillOpacity={0.85} name="Gaz" />
                <Area type="monotone" dataKey="nuclear"    stackId="1" stroke="#7B5EA7" fill="#7B5EA7" fillOpacity={0.85} name="Nucléaire" />
                <Area type="monotone" dataKey="hydro"      stackId="1" stroke="#2E7D6B" fill="#2E7D6B" fillOpacity={0.85} name="Hydraulique" />
                <Area type="monotone" dataKey="renewables" stackId="1" stroke="#1a7a4a" fill="#1a7a4a" fillOpacity={0.9}  name="Renouvelables" />
              </AreaChart>
            </ResponsiveContainer>
          )}
          <p className="text-xs text-white/30 text-center mt-2">
            {view === 'fossil'
              ? 'Les fossiles (rouge) n\'ont jamais baissé en valeur absolue — les renouvelables (vert) s\'ajoutent par-dessus'
              : 'Chaque source s\'empile sur les précédentes — aucune n\'a été remplacée depuis 1965'}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Composants narratifs ──────────────────────────────────────────────────────
function ChapterLabel({ n, label }: { n: string; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="text-xs font-black text-blue-400/60 uppercase tracking-[0.3em]">{n}</div>
      <div className="flex-1 h-px bg-white/10" />
      <div className="text-xs text-white/30 uppercase tracking-[0.2em]">{label}</div>
    </div>
  );
}

function Anecdote({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-10 pl-6 border-l-2 border-blue-500/40 bg-blue-950/20 rounded-r-xl p-5">
      <div className="text-blue-400/70 text-xs uppercase tracking-widest mb-2 font-bold">À noter</div>
      <div className="text-white/75 text-sm leading-relaxed italic">{children}</div>
    </div>
  );
}

function Chiffre({ val, unit, label, sub }: { val: string; unit?: string; label: string; sub?: string }) {
  return (
    <div className="text-center p-5">
      <div className="text-4xl font-black text-blue-400">
        {val}<span className="text-2xl text-blue-500/60 ml-1">{unit}</span>
      </div>
      <div className="text-xs text-white/50 font-semibold mt-1">{label}</div>
      {sub && <div className="text-xs text-white/30 mt-0.5">{sub}</div>}
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
  return <p className="text-white/70 leading-loose text-base mb-5">{children}</p>;
}

function Quote({ text, source }: { text: string; source: string }) {
  return (
    <blockquote className="my-10 px-8 py-6 bg-white/5 rounded-2xl border border-white/10">
      <p className="text-xl text-white/80 italic leading-relaxed mb-3">"{text}"</p>
      <cite className="text-sm text-blue-400/70 not-italic">{source}</cite>
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
      <div className="p-4 md:p-6 bg-[#0d1117] rounded-b-2xl">{children}</div>
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

// ── Graphique CO₂ vs Production ───────────────────────────────────────────────
const CO2_DATA = [
  { year: 1965, ppm: 320, prod: 31 }, { year: 1970, ppm: 325, prod: 46 },
  { year: 1975, ppm: 331, prod: 56 }, { year: 1980, ppm: 338, prod: 63 },
  { year: 1985, ppm: 346, prod: 60 }, { year: 1990, ppm: 354, prod: 67 },
  { year: 1995, ppm: 360, prod: 70 }, { year: 2000, ppm: 369, prod: 77 },
  { year: 2005, ppm: 379, prod: 84 }, { year: 2010, ppm: 389, prod: 88 },
  { year: 2015, ppm: 400, prod: 94 }, { year: 2020, ppm: 413, prod: 91 },
  { year: 2024, ppm: 422, prod: 102 }, { year: 2026, ppm: 425, prod: 103 },
];

// ── Graphique Resource Curse ──────────────────────────────────────────────────
const RESOURCE_DATA = [
  { country: 'Norvège', reserves: 8, hdi: 0.961, label: 'Modèle' },
  { country: 'Canada', reserves: 170, hdi: 0.929, label: 'Modèle' },
  { country: 'EAU', reserves: 98, hdi: 0.911, label: 'Diversifié' },
  { country: 'Arabie S.', reserves: 267, hdi: 0.875, label: 'Rentier' },
  { country: 'Irak', reserves: 145, hdi: 0.686, label: 'Fragile' },
  { country: 'Nigeria', reserves: 37, hdi: 0.535, label: 'Malédiction' },
  { country: 'Venezuela', reserves: 304, hdi: 0.691, label: 'Effondrement' },
  { country: 'Angola', reserves: 8, hdi: 0.586, label: 'Malédiction' },
  { country: 'Libye', reserves: 48, hdi: 0.718, label: 'Fragile' },
];

const HDI_COLORS: Record<string, string> = {
  'Modèle': '#2E7D6B', 'Diversifié': '#4A90A4', 'Rentier': '#C17F24',
  'Fragile': '#E8943A', 'Malédiction': '#B85450', 'Effondrement': '#8B1A1A',
};

// ── Prix pompe comparatif ─────────────────────────────────────────────────────
const PUMP_COMPARISON = [
  { country: 'Norvège', price: 2.12, note: 'Producteur — taxe fort malgré tout' },
  { country: 'Pays-Bas', price: 2.05, note: 'Petit producteur, taxes élevées' },
  { country: 'Allemagne', price: 1.78, note: 'Zéro pétrole, fort impact prix' },
  { country: 'France', price: 1.74, note: 'Nucléaire mais dépend du pétrole pour transport' },
  { country: 'USA', price: 0.96, note: 'Grand producteur + taxes faibles' },
  { country: 'Arabie S.', price: 0.24, note: 'Subvention massive — choix politique' },
  { country: 'Iran', price: 0.04, note: 'Subvention totale — prix politique' },
  { country: 'Venezuela', price: 0.02, note: 'Quasi-gratuit — économie effondrée' },
];

// ── Ormuz widget ──────────────────────────────────────────────────────────────
function OrmuzWidget() {
  return (
    <div className="my-10 rounded-2xl border border-blue-700/40 bg-blue-950/30 overflow-hidden">
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-blue-400/60 uppercase tracking-widest mb-1">Point de passage stratégique</div>
          <div className="font-bold text-white text-lg">Détroit d'Ormuz</div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-blue-400">20%</div>
          <div className="text-xs text-white/40">du pétrole mondial</div>
        </div>
      </div>
      <div className="px-6 pb-4 text-sm text-white/60 leading-relaxed">
        Un détroit de <strong className="text-white">33 km</strong> de large entre l'Iran et Oman.
        Chaque jour, <strong className="text-white">~21 millions de barils</strong> y transitent.
        C'est la jugulaire de l'économie mondiale.
      </div>
      <div className="px-6 pb-5 grid grid-cols-2 md:grid-cols-3 gap-3 text-xs border-t border-blue-700/30 pt-4">
        {[
          { pays: 'Japon', pct: '~90%', dep: 'de ses importations' },
          { pays: 'Corée du Sud', pct: '~75%', dep: 'de ses importations' },
          { pays: 'Inde', pct: '~60%', dep: 'de ses importations' },
          { pays: 'Chine', pct: '~40%', dep: 'de ses importations' },
          { pays: 'Europe', pct: '~20%', dep: 'de ses importations' },
          { pays: 'USA', pct: '~10%', dep: '(producteur, moins dépendant)' },
        ].map((d: any) => (
          <div key={d.pays} className="bg-white/5 rounded-lg p-3">
            <div className="font-bold text-white">{d.pays}</div>
            <div className="text-blue-400 font-black text-lg">{d.pct}</div>
            <div className="text-white/40">{d.dep}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
function PresentContent() {
  const { mode } = useReadingMode();

  // Données marché en temps réel si disponibles
  const { data: marketData } = useQuery({
    queryKey: ['market-latest-present'],
    queryFn: () => api.get('/market/latest').then(r => r.data),
    staleTime: 3600000,
    retry: false,
  });

  const { data: gasolineData } = useQuery({
    queryKey: ['gasoline-latest-present'],
    queryFn: () => api.get('/market/gasoline/latest-by-country').then(r => r.data),
    staleTime: 3600000,
    retry: false,
  });

  const brent = marketData?.brent_price ?? 82;
  const brentChange = marketData?.brent_change_1w;

  const CHAPTERS = [
    { n: 'I',   label: 'Climat',        title: 'CO₂ sans détour',           id: 'pch-co2' },
    { n: 'II',  label: 'Géopolitique',  title: 'Les États rentiers',         id: 'pch-geo' },
    { n: 'III', label: 'Malédiction',   title: 'Resource curse',             id: 'pch-curse' },
    { n: 'IV',  label: 'Dubai',         title: 'Dubai & NEOM',               id: 'pch-dubai' },
    { n: 'V',   label: 'Ormuz',         title: '33 km stratégiques',         id: 'pch-ormuz' },
    { n: 'VI',  label: 'Prix pompe',    title: 'Pourquoi 2€ ou 0.02$',      id: 'pch-prix' },
    { n: 'VI·b', label: 'Économie',    title: 'Coût par méthode',           id: 'pch-meth' },
    { n: 'VII', label: 'Transition',    title: 'Pétrole dans tout',          id: 'pch-trans' },
  ];
  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <TableOfContents chapters={CHAPTERS} />

      {/* Toggle sticky */}
      <div className="sticky top-14 z-40 flex flex-wrap items-center justify-between px-4 md:px-8 py-2 gap-2 bg-[#0d0d0d]/90 backdrop-blur border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="text-blue-400/60 text-xs uppercase tracking-widest font-bold">Acte II</span>
          <span className="text-white/20 text-xs">2026</span>
          {brent && (
            <span className="text-xs px-2 py-0.5 bg-white/5 rounded-full text-white/40">
              Brent ${Number(brent).toFixed(1)}/b
              {brentChange && (
                <span className={Number(brentChange) >= 0 ? 'text-red-400 ml-1' : 'text-blue-400 ml-1'}>
                  {Number(brentChange) > 0 ? '↑' : '↓'}{Math.abs(Number(brentChange)).toFixed(1)}%
                </span>
              )}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/25 text-xs">{mode === 'short' ? '~7 min' : '~10 min'}</span>
          <ReadingToggle />
        </div>
      </div>

      {/* Hero */}
      <div className="relative px-8 py-28 overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 80% 30%, #0a1628 0%, #0d0d0d 60%)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-blue-400/50 text-xs uppercase tracking-[0.3em] mb-6">Acte II · 2026</div>
          <h1 className="text-6xl md:text-8xl font-black text-white leading-none mb-6" style={{ letterSpacing: '-0.02em' }}>
            L'empire<br /><span className="text-blue-400">invisible</span>
          </h1>
          <p className="text-lg text-white/50 leading-relaxed max-w-xl">
            Ce que le pétrole fait au climat, aux puissances mondiales, aux prix à votre pompe,
            et à l'architecture de villes entières construites sur du sable. Et quelques chiffres
            qui donnent à réfléchir.
          </p>
          {brent && (
            <div className="mt-8 inline-flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10">
              <span className="text-xs text-white/30">Brent aujourd'hui</span>
              <span className="text-white font-bold">${Number(brent).toFixed(2)}/b</span>
              {brentChange && (
                <span className={`text-xs font-bold ${Number(brentChange) >= 0 ? 'text-red-400' : 'text-blue-400'}`}>
                  {Number(brentChange) > 0 ? '+' : ''}{Number(brentChange).toFixed(1)}% cette semaine
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-8 pb-32">

        {/* ── Intro : le pétrole est partout ── */}
        <div className="my-10 p-6 bg-white/5 rounded-2xl border border-white/10">
          <div className="text-xs text-white/30 uppercase tracking-widest mb-4 font-bold">Avant tout</div>
          <p className="text-white/70 text-sm leading-relaxed mb-4">
            On parle du pétrole comme d'un carburant. C'est réducteur.
            <strong className="text-white"> 10% du pétrole mondial ne brûle jamais</strong> — il devient de la matière :
            plastiques, engrais, médicaments, textiles. Le reste alimente le transport, l'industrie, le chauffage.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-center">
            {[
              { val: '~50%', label: 'carburants transport', sub: 'voitures, avions, bateaux' },
              { val: '~16%', label: 'pétrochimie & plastiques', sub: 'matières, emballages' },
              { val: '~10%', label: 'agriculture', sub: 'engrais, machines, films' },
              { val: '~60%', label: 'textiles mondiaux', sub: 'polyester, nylon, acrylique' },
            ].map(s => (
              <div key={s.label} className="bg-white/5 rounded-xl p-3">
                <div className="text-2xl font-black text-blue-400 mb-0.5">{s.val}</div>
                <div className="text-white/60 font-semibold">{s.label}</div>
                <div className="text-white/30 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
          <p className="text-white/40 text-xs mt-4 leading-relaxed">
            Supprimer le pétrole de la civilisation industrielle, c'est retirer le béton d'un immeuble déjà construit.
            Les chapitres suivants explorent ce que cela implique — pour le climat, la géopolitique, et votre pompe à essence.
          </p>
        </div>

        {/* ── Intro : le pétrole est partout ── */}
        <div className="my-10 p-6 bg-white/5 rounded-2xl border border-white/10">
          <div className="text-xs text-white/30 uppercase tracking-widest mb-4 font-bold">Avant tout</div>
          <p className="text-white/70 text-sm leading-relaxed mb-4">
            On parle du pétrole comme d&apos;un carburant. C&apos;est réducteur.
            <strong className="text-white"> 10% du pétrole mondial ne brûle jamais</strong> — il devient de la matière :
            plastiques, engrais, médicaments, textiles. Le reste alimente le transport, l&apos;industrie, le chauffage.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-center">
            {[
              { val: '~50%', label: 'carburants transport', sub: 'voitures, avions, bateaux' },
              { val: '~16%', label: 'pétrochimie & plastiques', sub: 'matières, emballages' },
              { val: '~10%', label: 'agriculture', sub: 'engrais, machines, films' },
              { val: '~60%', label: 'textiles mondiaux', sub: 'polyester, nylon, acrylique' },
            ].map(s => (
              <div key={s.label} className="bg-white/5 rounded-xl p-3">
                <div className="text-2xl font-black text-blue-400 mb-0.5">{s.val}</div>
                <div className="text-white/60 font-semibold">{s.label}</div>
                <div className="text-white/30 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
          <p className="text-white/40 text-xs mt-4 leading-relaxed">
            Supprimer le pétrole de la civilisation industrielle, c&apos;est retirer le béton d&apos;un immeuble déjà construit.
            Les chapitres suivants explorent ce que cela implique — pour le climat, la géopolitique, et votre pompe à essence.
          </p>
        </div>

        <ChapterAnchor id="pch-co2" />
        {/* I — CO₂ */
        <ChapterLabel n="I" label="Climat" />
        <H2>Ce que le pétrole fait à l'atmosphère — sans détour</H2>

        <P>
          Brûler un baril de pétrole de 159 litres produit environ 430 kg de CO₂.
          L'humanité brûle 102 millions de barils par jour en 2026.
          Ça fait 44 millions de tonnes de CO₂ par jour, uniquement pour le pétrole.
          Ajoutez le charbon et le gaz, et vous obtenez environ 37 milliards de tonnes par an.
        </P>

        <P>
          La concentration de CO₂ dans l'atmosphère était de 280 ppm avant l'ère industrielle.
          Elle est de 425 ppm en 2026. La corrélation avec la production pétrolière
          n'est pas une coïncidence — c'est une équation physique.
          Ce que les scientifiques débattent, c'est la vitesse et l'amplitude des effets,
          pas leur existence.
        </P>

        <ChartBox
          title="CO₂ atmosphérique vs Production pétrolière mondiale 1965-2026"
          subtitle="Deux courbes qui montent ensemble — corrélation ≠ causalité, mais ici c'est les deux">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={CO2_DATA} margin={{ top: 10, right: 40, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
              <XAxis dataKey="year" tick={{ fill: '#ffffff60', fontSize: 11 }} axisLine={{ stroke: '#ffffff20' }} tickLine={false} />
              <YAxis yAxisId="co2" tick={{ fill: '#ffffff60', fontSize: 10 }} axisLine={false} tickLine={false} domain={[310, 435]}
                label={{ value: 'CO₂ (ppm)', angle: -90, position: 'insideLeft', fill: '#ffffff40', fontSize: 10 }} />
              <YAxis yAxisId="prod" orientation="right" tick={{ fill: '#ffffff60', fontSize: 10 }} axisLine={false} tickLine={false}
                label={{ value: 'Prod. (mb/j)', angle: 90, position: 'insideRight', fill: '#ffffff40', fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #ffffff20', borderRadius: '8px', fontSize: 11 }}
                labelStyle={{ color: '#ffffff80' }}
                formatter={(v: number, n: string) => [n === 'ppm' ? `${v} ppm` : `${v} mb/j`, n === 'ppm' ? 'CO₂ atmosphérique' : 'Production mondiale']} />
              <Line yAxisId="co2" type="monotone" dataKey="ppm" stroke="#B85450" strokeWidth={2.5} dot={false} name="ppm" />
              <Line yAxisId="prod" type="monotone" dataKey="prod" stroke="#4A90A4" strokeWidth={2} dot={false} name="prod" />
            </LineChart>
          </ResponsiveContainer>
        </ChartBox>

        <StatRow>
          <Chiffre val="425" unit="ppm" label="CO₂ en 2026" sub="vs 280 préindustriel" />
          <Chiffre val="+1.2°C" label="réchauffement mesuré" sub="vs 1850-1900" />
          <Chiffre val="37Gt" label="CO₂/an toutes énergies" sub="record 2024" />
          <Chiffre val="33%" label="du CO₂ mondial" sub="dû au seul pétrole" />
        </StatRow>

        <Long>
          <P>
            Ce que les scientifiques du GIEC disent avec prudence, les assureurs le calculent
            avec brutalité : les catastrophes climatiques ont coûté 280 milliards de dollars
            en 2023. Swiss Re, le plus grand réassureur mondial, a modélisé une réduction
            du PIB mondial de 10-18% d'ici 2050 dans un scénario de réchauffement à +2°C.
            Le secteur financier est en train de prendre le changement climatique au sérieux —
            pas par conviction écologique, mais parce que les pertes sont quantifiables.
          </P>
          <Anecdote>
            En 2023, ExxonMobil a poursuivi en justice un fonds d'actionnaires qui demandait
            des rapports sur les risques climatiques. Parallèlement, la même ExxonMobil publiait
            ses propres projections internes — qui prévoyaient un réchauffement de 2°C d'ici 2050
            si rien ne changeait. Ces documents avaient été rédigés dès les années 1970.
            Le fossé entre ce que les pétroliers savaient et ce qu'ils disaient publiquement
            fait l'objet d'une enquête du Congrès américain depuis 2021.
          </Anecdote>
        </Long>

        <Sep />

        <ChapterAnchor id="pch-geo" />
        {/* II — Géopolitique */}
        <ChapterLabel n="II" label="Géopolitique" />
        <H2>Pourquoi l'Arabie Saoudite n'est pas une démocratie</H2>

        <P>
          La question semble provocatrice. La réponse, elle, est économique.
          Les pays producteurs de pétrole qui n'ont pas à taxer leurs citoyens
          n'ont pas besoin de leur rendre de comptes. C'est le "pacte rentier" :
          l'État distribue la rente pétrolière sous forme de subventions,
          d'emplois publics, de services gratuits. En échange, le peuple
          ne réclame pas de représentation politique.
        </P>

        <P>
          Ce modèle a un nom en économie politique : l'État rentier.
          L'Arabie Saoudite, les Émirats, le Koweït, le Qatar en sont les exemples
          les plus purs. Ni impôts sur le revenu, ni TVA (ou très faible),
          essence quasi-gratuite, éducation et santé publiques. Le troc fonctionne.
          Jusqu'à ce que les réserves baissent.
        </P>

        <Quote
          text="No taxation without representation. Pas d'impôt, pas de représentation non plus."
          source="Reformulation du paradoxe rentier, politologue Hazem Beblawi, 1987" />

        <Long>
          <P>
            La Norvège offre un contre-exemple fascinant. Même pétrole abondant,
            même rente considérable — mais démocratie préexistante, institutions solides,
            tradition de compromis social. La Norvège a créé en 1990 un fonds souverain
            investi à l'étranger pour ne pas "hollandiser" son économie.
            Ce fonds vaut aujourd'hui 1 700 milliards de dollars — le plus grand du monde.
            Il appartient à chaque Norvégien, à raison d'environ 300 000€ par habitant.
          </P>
          <Anecdote>
            Le "syndrome hollandais" tire son nom d'un phénomène observé aux Pays-Bas
            dans les années 1960 : la découverte de gaz naturel dans la mer du Nord
            avait fait monter la valeur du florin, rendant les exportations néerlandaises
            non compétitives, et avait tué une partie de l'industrie manufacturière.
            Trop de ressources naturelles peut détruire le reste de l'économie.
            Les économistes appellent ça la "malédiction des ressources".
          </Anecdote>
        </Long>

        <Sep />

        <ChapterAnchor id="pch-curse" />
        {/* III — Resource curse */}
        <ChapterLabel n="III" label="La malédiction" />
        <H2>Le Nigeria est plus pauvre que la Norvège malgré 37 milliards de barils</H2>

        <P>
          Le Nigeria est le premier producteur de pétrole d'Afrique.
          Il possède 37 milliards de barils de réserves prouvées.
          Depuis l'indépendance en 1960, il a gagné plus de 600 milliards de dollars
          grâce aux exportations pétrolières.
          Son IDH (indice de développement humain) est de 0,535 en 2026.
          Celui de la Norvège : 0,961.
        </P>

        <P>
          Ce paradoxe a un nom : la "resource curse" — la malédiction des ressources.
          Les pays riches en matières premières ont statistiquement tendance
          à avoir une croissance plus lente, plus d'inégalités, plus de conflits armés
          et moins de démocratie que des pays comparables sans ressources.
          Ce n'est pas inéluctable — mais c'est la norme statistique.
        </P>

        <ChartBox
          title="Réserves pétrolières vs Développement humain"
          subtitle="Les grandes réserves ne garantissent pas le développement — loin de là">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={RESOURCE_DATA.sort((a, b) => b.hdi - a.hdi)}
              layout="vertical" margin={{ top: 5, right: 60, left: 90, bottom: 5 }} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
              <XAxis type="number" domain={[0, 1]} tick={{ fill: '#ffffff60', fontSize: 10 }} axisLine={{ stroke: '#ffffff20' }} tickLine={false}
                tickFormatter={v => v.toFixed(1)} />
              <YAxis type="category" dataKey="country" tick={{ fill: '#ffffff70', fontSize: 11 }} axisLine={false} tickLine={false} width={85} />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #ffffff20', borderRadius: '8px', fontSize: 11 }}
                labelStyle={{ color: '#ffffff80' }}
                formatter={(v: number, _n: string, p: any) => [
                  `IDH ${v.toFixed(3)} · ${p.payload.label}`,
                  `Réserves: ${p.payload.reserves} Gb`
                ]} />
              <Bar dataKey="hdi" radius={[0, 4, 4, 0]}>
                {RESOURCE_DATA.sort((a, b) => b.hdi - a.hdi).map((d: any) => (
                  <Cell key={d.country} fill={HDI_COLORS[d.label] ?? '#8E7F6B'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-3 text-xs">
            {Object.entries(HDI_COLORS).map(([k, c]) => (
              <div key={k} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                <span className="text-white/40">{k}</span>
              </div>
            ))}
          </div>
        </ChartBox>

        <Long>
          <P>
            La corrélation n'est pas mécanique. Trois facteurs amplifient la malédiction :
            la volatilité des prix (les budgets publics deviennent imprévisibles),
            la corruption facilitée par des flux d'argent opaques, et la désindustrialisation
            (pourquoi développer une industrie quand le pétrole rapporte autant ?).
            Le Venezuela est l'exemple le plus spectaculaire : pays le plus riche
            d'Amérique latine dans les années 1970, il produit aujourd'hui moins
            que le quart de son maximum historique. L'effondrement est économique,
            institutionnel et physique — les puits ne sont plus entretenus.
          </P>
        </Long>

        <Sep />

        <ChapterAnchor id="pch-dubai" />
        {/* IV — Dubai */}
        <ChapterLabel n="IV" label="Transformation & Hubris" />
        <H2>Dubaï : construire une civilisation en 50 ans avec du pétrole et de la volonté</H2>

        <P>
          En 1960, Dubaï est un village de pêcheurs et de marchands de perles.
          Population : 40 000 personnes. Pas de routes goudronnées, pas d'eau courante,
          pas d'électricité fiable. Sheikh Rashid comprend que les réserves pétrolières
          sont limitées — et que si les Émirats veulent exister après le pétrole,
          ils doivent construire quelque chose d'autre maintenant, avec l'argent du pétrole.
        </P>

        <P>
          En 2026, Dubaï compte 3,5 millions d'habitants. L'aéroport parmi les plus fréquentés
          du monde. La tour la plus haute de l'histoire humaine (828 mètres).
          Un secteur touristique, financier et logistique qui représente
          95% du PIB de l'émirat — contre 1% de pétrole. Le pari a fonctionné. En apparence.
        </P>

        <StatRow>
          <Chiffre val="40K" label="habitants en 1960" sub="village de pêcheurs" />
          <Chiffre val="3.5M" label="habitants en 2026" sub="×87 en 65 ans" />
          <Chiffre val="828m" label="Burj Khalifa" sub="plus haute tour du monde" />
          <Chiffre val="50°C" label="été à Dubaï" sub="sans clim, inhabitable" />
        </StatRow>

        <P>
          Mais gratter le vernis révèle une absurdité écologique monumentale.
          Dubaï est une ville dans l'un des environnements les plus hostiles à la vie humaine
          sur Terre. Il ne pleut que 90 mm par an — dix fois moins que Paris.
          L'eau potable vient presque entièrement du dessalement de l'eau de mer.
          Le dessalement consomme une énergie colossale — environ 25 kWh par mètre cube,
          soit trois fois plus qu'un traitement d'eau classique.
          Cette énergie vient du pétrole et du gaz. Une ville construite avec du pétrole,
          maintenue en vie par du pétrole, dont la survie dépend du pétrole.
          Appelez ça une boucle fermée, ou appelez ça un piège.
        </P>

        <Anecdote>
          88% de la population de Dubaï est constituée d'expatriés,
          dont la grande majorité d'ouvriers immigrants d'Asie du Sud.
          Les travailleurs qui ont construit le Burj Khalifa vivaient à 12 dans un dortoir,
          travaillaient en pleine chaleur (50°C), et avaient leurs passeports confisqués —
          pratique officiellement illégale mais très répandue.
          Le miracle économique est aussi une histoire de main-d'œuvre captive.
          Quand le soleil tape à 50 degrés et que les chantiers s'arrêtent,
          c'est bien le pétrole qui climatise les dortoirs.
        </Anecdote>

        <Long>
          <P>
            L'Arabie Saoudite a voulu faire mieux — ou plutôt plus grand, plus fou.
            NEOM est un projet de "ville du futur" dans le désert de Tabuk :
            500 milliards de dollars d'investissement prévu, une ville linéaire de 170 km
            (The Line), des montagnes skiables en plein désert (Trojena),
            une île flottante en mer Rouge (Sindalah).
            Annoncé en fanfare en 2017 par Mohammed bin Salman.
          </P>
          <P>
            En 2026, NEOM est en grande partie un désastre silencieux.
            The Line a été réduite de 170 km à quelques kilomètres de prototype.
            Des milliers d'ouvriers ont été déplacés de force — des membres de la tribu Howeitat
            ont été expulsés de leurs terres, certains tués lors de la résistance selon des
            témoignages compilés par des ONG.
            Les investisseurs étrangers se sont retirés discrètement.
            Le projet illustre parfaitement la tentation des États rentiers :
            croire que la rente pétrolière peut réécrire les lois de la physique,
            de la géographie et de l'économie.
            Elle ne le peut pas.
          </P>
        </Long>

        <Sep />

        <ChapterAnchor id="pch-ormuz" />
        {/* V — Ormuz */}
        <ChapterLabel n="V" label="Vulnérabilité" />
        <H2>33 kilomètres — et le monde retient son souffle</H2>

        <div className="mb-6 px-4 py-3 bg-red-950/40 border border-red-700/50 rounded-xl text-xs text-red-300 leading-relaxed">
          <strong className="text-red-400">Situation au 10 mai 2026 (date de rédaction) :</strong>{' '}
          Le détroit d'Ormuz est actuellement soumis à des restrictions de navigation
          importantes dans le contexte des tensions entre l'Iran et les États-Unis.
          La situation géopolitique dans le détroit évolue rapidement — les informations
          ci-dessous reflètent la situation à la date de publication.
          Consultez l'onglet <Link to="/dashboard/market" className="underline hover:text-red-200">Marché</Link>{' '}
          pour les données les plus récentes.
        </div>

        <P>
          Le détroit d'Ormuz, entre Iran et Oman, mesure 33 km dans sa partie
          la plus étroite. Les pétroliers naviguent dans deux couloirs de 3 km.
          Chaque jour, environ 21 millions de barils y transitent en temps normal —
          20% de la consommation mondiale, 30% du pétrole maritime mondial.
        </P>

        <P>
          La menace de fermeture — ou de restriction — d'Ormuz est l'une des plus
          anciennes et des plus efficaces de la diplomatie iranienne.
          L'Iran ne peut pas facilement attaquer les États-Unis directement.
          Mais il peut menacer le robinet d'où sort le pétrole du Golfe.
          Et quand ce robinet se ferme, même partiellement, le prix du baril
          s'envole dans les heures qui suivent.
        </P>

        <OrmuzWidget />

        <P>
          C'est précisément pour cette raison que la 5e flotte américaine stationne
          à Bahreïn depuis 1995. 20 000 militaires, plusieurs porte-avions en rotation,
          des frégates et destroyers qui patrouillent en permanence.
          Pas pour la démocratie bahreïnie — Bahreïn est une monarchie absolue
          qui a écrasé dans le sang les manifestations du Printemps arabe en 2011
          avec l'aide de l'Arabie Saoudite.
          Pour les 33 kilomètres.
        </P>

        <Long>
          <P>
            Il existe d'autres goulots d'étranglement pétroliers, moins médiatisés :
            le détroit de Malacca (15% du commerce mondial, entre Malaisie et Indonésie),
            Bab-el-Mandeb (7%, entre Yémen et Djibouti — perturbé par les Houthis depuis 2023),
            le canal de Suez (10%). Ces points de fragilité sont la carte maîtresse
            des acteurs qui n'ont pas les moyens d'une guerre conventionnelle.
            Les Houthis, groupe armé yéménite avec un budget infiniment inférieur
            à celui de l'US Navy, ont perturbé 15% du commerce maritime mondial
            avec quelques drones et missiles à partir de 2023.
            La géographie physique du pétrole mondial est une invitation permanente
            au chantage géopolitique.
          </P>
        </Long>

        <Sep />

        <ChapterAnchor id="pch-prix" />
        {/* VI — Prix à la pompe */}
        <ChapterLabel n="VI" label="Vous et le pétrole" />
        <H2>Pourquoi le litre coûte 2€ en Norvège et 0.02$ au Venezuela</H2>

        <P>
          Le prix à la pompe n'est pas le prix du pétrole. C'est le prix du pétrole
          plus les taxes, plus les coûts de raffinage, plus les coûts de distribution,
          plus les marges des distributeurs, moins les subventions gouvernementales.
          Dans certains pays, la subvention est tellement massive
          qu'elle efface presque entièrement le coût réel.
        </P>

        {gasolineData && gasolineData.length > 0 ? (
          <ChartBox
            title="Prix de l'essence par pays — USD/litre"
            subtitle="Du Venezuela à la Norvège — un écart de 1:100">
            <div className="space-y-2">
              {PUMP_COMPARISON.map((d: any) => {
                const real = gasolineData.find((g: any) =>
                  g.country_name?.toLowerCase().includes(d.country.toLowerCase()) ||
                  (d.country === 'Arabie S.' && g.country_code === 'SAU') ||
                  (d.country === 'USA' && g.country_code === 'USA')
                );
                const price = real?.gasoline_usd ?? d.price;
                const pct = (price / 2.12) * 100;
                return (
                  <div key={d.country} className="flex items-center gap-3">
                    <div className="w-24 text-xs font-bold text-white/70 text-right shrink-0">{d.country}</div>
                    <div className="flex-1 h-6 bg-white/10 rounded overflow-hidden">
                      <div className="h-full bg-oil-slate rounded flex items-center justify-end pr-2"
                        style={{ width: `${Math.max(pct, 2)}%` }}>
                        <span className="text-white text-xs font-bold">${price.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="text-xs text-white/70/40 w-48 shrink-0 hidden md:block">{d.note}</div>
                  </div>
                );
              })}
            </div>
          </ChartBox>
        ) : (
          <ChartBox title="Prix de l'essence par pays — USD/litre">
            <div className="space-y-2">
              {PUMP_COMPARISON.map((d: any) => {
                const pct = (d.price / 2.12) * 100;
                return (
                  <div key={d.country} className="flex items-center gap-3">
                    <div className="w-24 text-xs font-bold text-white/70 text-right shrink-0">{d.country}</div>
                    <div className="flex-1 h-6 bg-white/10 rounded overflow-hidden">
                      <div className="h-full bg-blue-600/80 rounded flex items-center justify-end pr-2"
                        style={{ width: `${Math.max(pct, 2)}%` }}>
                        <span className="text-white text-xs font-bold">${d.price.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="text-xs text-white/30 w-48 shrink-0 hidden md:block">{d.note}</div>
                  </div>
                );
              })}
            </div>
          </ChartBox>
        )}

        <Anecdote>
          L'Iran subventionne tellement le carburant que les contrebandiers iraniens
          remplissent leurs camions d'essence à 0.04$/litre pour la revendre au Pakistan
          et en Afghanistan à des prix cinq fois supérieurs.
          Le gouvernement iranien perd environ 25 milliards de dollars par an
          en subventions énergétiques.
          En 2019, quand il a tenté de réduire ces subventions,
          des émeutes ont éclaté dans tout le pays.
          Le pétrole bon marché est devenu un droit social.
        </Anecdote>

        <Long>
          <P>
            La France présente un cas intéressant. Elle est presque dépourvue de pétrole —
            mais 15% de son budget vient des taxes sur les carburants.
            En 2018, Emmanuel Macron augmente la taxe carbone sur les carburants.
            Le mouvement des Gilets Jaunes est né la semaine suivante.
            En trois mois de manifestations, le gouvernement recule.
            La leçon : le prix de l'essence est un thermomètre politique.
            Quand il monte trop, les gouvernements tombent.
            C'est vrai en France, en Iran, au Pakistan, en Équateur.
            Le pétrole est entré dans les fondements du contrat social.
          </P>
        </Long>

        <Sep />

        <Sep />

        {/* VII — Pétrole partout */}
        <ChapterAnchor id="pch-meth" />
        {/* VI.5 — Méthodes d'extraction et coûts */}
        <ChapterLabel n="VI·b" label="Économie" />
        <H2>Ce que coûte vraiment un baril selon comment on le sort du sol</H2>

        <P>
          Tous les barils ne se valent pas. Un baril saoudien extrait d'un puits
          conventionnel en plein désert coûte environ 3-5$ à produire.
          Un baril de schiste américain au Texas coûte 35-50$.
          Un baril issu des sables bitumineux canadiens : 60-80$.
          Cette différence de coût explique tout — la géopolitique du Golfe,
          la révolution shale, la dépendance aux prix élevés de certains pays,
          et pourquoi l'Arabie Saoudite peut se permettre d'ouvrir les vannes
          quand elle veut assassiner ses concurrents.
        </P>

        {/* Graphique coût de production */}
        <div className="my-8 rounded-2xl border border-white/10 overflow-hidden">
          <div className="px-5 py-3 border-b border-white/10 bg-white/5">
            <div className="text-sm font-bold text-white/80">Coût de production estimé par méthode et région ($/b)</div>
            <div className="text-xs text-white/40 mt-0.5">Coût cash — hors amortissements et taxes · Sources : IEA, Rystad 2024</div>
          </div>
          <div className="p-5 bg-[#0d1117] space-y-2.5">
            {[
              { label: 'Arabie Saoudite (conv.)', val: 4,   max: 80, color: '#2E7D6B', note: 'Le moins cher du monde' },
              { label: 'Iraq (conv.)',              val: 7,   max: 80, color: '#2E7D6B', note: 'Gisements géants post-guerre' },
              { label: 'Iran (conv.)',              val: 9,   max: 80, color: '#2E7D6B', note: 'Malgré les sanctions' },
              { label: 'Russie (conv.)',            val: 14,  max: 80, color: '#4A90A4', note: 'En hausse post-2022' },
              { label: 'Mer du Nord (offshore)',    val: 22,  max: 80, color: '#4A90A4', note: 'Vieux gisements en déclin' },
              { label: 'Shale USA (Permian)',       val: 38,  max: 80, color: '#C17F24', note: 'Le moins cher du shale' },
              { label: 'Shale USA (autres)',        val: 52,  max: 80, color: '#C17F24', note: 'Eagle Ford, Bakken' },
              { label: 'Offshore profond Brésil',  val: 44,  max: 80, color: '#8B4513', note: 'Pré-sel, 2000m+' },
              { label: 'Sables bitumineux Canada', val: 72,  max: 80, color: '#B85450', note: 'Le plus coûteux en énergie' },
              { label: 'Seuil de rentabilité',     val: 60,  max: 80, color: '#ffffff', note: '≈ prix minimal pour équilibrer budgets saoudiens', isRef: true },
            ].filter((d: any) => !d.isRef).map((d: any) => (
              <div key={d.label} className="flex items-center gap-3">
                <div className="w-44 text-sm text-white/70 text-right shrink-0 leading-tight font-medium">{d.label}</div>
                <div className="flex-1 h-7 bg-white/5 rounded-lg overflow-hidden relative">
                  <div className="h-full rounded-lg flex items-center transition-all"
                    style={{ width: `${(d.val / d.max) * 100}%`, backgroundColor: d.color + 'cc' }}>
                    <span className="text-white text-sm font-black ml-2">${d.val}</span>
                  </div>
                  {/* Ligne seuil rentabilité à 60$ */}
                  <div className="absolute top-0 bottom-0 w-px bg-red-400/50" style={{ left: `${(60/d.max)*100}%` }} />
                </div>
                <div className="text-xs text-white/25 w-40 shrink-0 hidden lg:block">{d.note}</div>
              </div>
            ))}
            <div className="flex items-center gap-3 mt-1">
              <div className="w-44" />
              <div className="flex-1 flex items-center gap-1 text-xs text-red-400/70">
                <div className="w-px h-3 bg-red-400/50 ml-1" style={{ marginLeft: `${(60/80)*100}%` }} />
                <span className="ml-1">← $60/b seuil budget saoudien</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 cartes méthodes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-8">
          {[
            {
              name: 'Conventionnel',
              color: '#2E7D6B',
              cost: '3–15 $/b',
              eroei: '20–35:1',
              desc: 'Pétrole sous pression naturelle, remonte seul ou par pompe. C\'est la méthode de Drake, de Spindletop, de l\'Arabie Saoudite. Coût minimal, EROEI excellent. Les gisements faciles s\'épuisent progressivement.',
              icon: '',
            },
            {
              name: 'Offshore profond',
              color: '#4A90A4',
              cost: '20–50 $/b',
              eroei: '8–15:1',
              desc: 'Forages à 1 000-3 000 m de profondeur. Plateformes de plusieurs milliards. Deepwater Horizon (BP, 2010) a déversé 800 000 tonnes de pétrole dans le Golfe du Mexique. La frontière de la rentabilité.',
              icon: '',
            },
            {
              name: 'Schiste (Shale)',
              color: '#C17F24',
              cost: '35–65 $/b',
              eroei: '4–8:1',
              desc: 'Fracturation hydraulique + forage horizontal. Révolution américaine post-2005. Chaque puits perd 60-80% de sa production en un an — il faut forer en permanence pour maintenir le niveau.',
              icon: '',
            },
            {
              name: 'Sables bitumineux',
              color: '#B85450',
              cost: '60–80 $/b',
              eroei: '3–5:1',
              desc: 'Extraction à ciel ouvert au Canada. Pelles de 800 tonnes, camions de 400 tonnes. Émissions carbone 2 à 4× supérieures au conventionnel. Viable seulement quand le baril dépasse 60-70$.',
              icon: '',
            },
          ].map(m => (
            <div key={m.name} className="rounded-xl border border-white/10 bg-white/3 overflow-hidden">
              <div className="px-4 py-3 flex items-center gap-3 border-b border-white/8"
                style={{ background: m.color + '18' }}>
                <span className="text-xl">{m.icon}</span>
                <div className="flex-1">
                  <div className="font-bold text-white text-sm">{m.name}</div>
                  <div className="flex gap-3 text-xs mt-0.5">
                    <span style={{ color: m.color }}>Coût : {m.cost}</span>
                    <span className="text-white/30">EROEI {m.eroei}</span>
                  </div>
                </div>
              </div>
              <p className="px-4 py-3 text-sm text-white/65 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>

        <P>
          L'écart de coût entre un baril saoudien et un baril canadien est de ×20.
          Cet écart est ce qui rend la géopolitique pétrolière si violente —
          et ce qui explique pourquoi l'Arabie Saoudite peut augmenter sa production
          pour faire baisser les prix mondiaux et ruiner ses concurrents américains,
          puis refermer le robinet quand elle veut remonter les prix.
          C'est une guerre économique menée en barils.
        </P>

        <Sep />

        <ChapterAnchor id="pch-trans" />
        {/* VII — Le pétrole est partout */}
        <ChapterLabel n="VII" label="L'indispensable absolu" />
        <H2>Le pétrole est partout — y compris dans la transition qui est censée le remplacer</H2>

        <P>
          Des historiens des techniques ont documenté un paradoxe inconfortable :
          l'humanité n'a jamais vraiment remplacé une source d'énergie par une autre —
          elle les a accumulées. Le bois n'a pas disparu avec le charbon.
          Le charbon n'a pas disparu avec le pétrole. La consommation mondiale d'énergie
          fossile a <em>augmenté</em> depuis l'accord de Paris en 2015.
          Pas par manque de volonté, mais parce que la demande croît plus vite
          que le déploiement des alternatives.
        </P>

        <P>
          Mais il y a plus profond encore. L'industrie qui fabrique les équipements
          de la "transition verte" est elle-même massivement dépendante du pétrole.
          Il n'existe pas une seule grande mine au monde alimentée à l'énergie renouvelable.
          Les camions de 300 tonnes qui extraient le lithium en Australie,
          le cobalt en RDC, le nickel en Indonésie — tous roulent au diesel.
          Les porte-conteneurs qui transportent panneaux solaires et éoliennes
          de Chine vers l'Europe brûlent du fioul lourd, parmi les carburants
          les plus polluants qui existent.
          Les hauts fourneaux qui produisent l'acier des mâts d'éoliennes
          fonctionnent au coke pétrolier et au charbon.
          La transition verte est, pour l'instant, une industrie fossile
          qui fabrique des équipements non-fossiles.
        </P>

        <P>
          Le résultat est vertigineux. 10% du pétrole mondial ne brûle jamais —
          il devient de la matière. Et cette matière est présente dans tout.
        </P>

        <div className="my-8 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          {[
            { item: 'Médecine & hôpitaux', detail: 'Seringues, poches IV, gants chirurgicaux, tubes, emballages stériles — sans plastique pétrolier, la médecine moderne s\'arrête' },
            { item: 'Agriculture', detail: 'Engrais azotés (Haber-Bosch = gaz + pétrole), tracteurs diesel, pesticides, films plastiques de serre, irrigation — 50% de l\'alimentation mondiale en dépend' },
            { item: 'Mines de lithium/cobalt', detail: 'Camions diesel 300t, explosifs, génératrices — 0 grande mine au monde alimentée en renouvelable' },
            { item: 'Porte-conteneurs', detail: 'Fioul lourd (le plus polluant). Transportent panneaux solaires, éoliennes, batteries vers l\'Europe' },
            { item: 'Plastiques', detail: 'Packaging alimentaire, jouets, électronique, meubles, voitures, avions — 400 Mt/an, 95% dérivés du pétrole' },
            { item: 'Vêtements', detail: 'Polyester (60% du marché mondial), nylon, acrylique, élasthanne — tous dérivés du naphta pétrolier' },
            { item: 'Routes & construction', detail: 'Bitume = résidu de raffinage. Chaque kilomètre d\'autoroute, chaque piste d\'aéroport' },
            { item: 'Cosmétiques & hygiène', detail: 'Paraffine, vaseline, glycérine, conservateurs, emballages — votre crème hydratante vient du pétrole' },
            { item: 'Data centers / IA', detail: 'Climatisation HFC, câbles, générateurs diesel de secours. L\'IA générative consomme comme une ville moyenne' },
          ].map(p => (
            <div key={p.item} className="bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="text-white font-semibold text-xs mb-0.5">{p.item}</div>
              <div className="text-white/40 text-xs">{p.detail}</div>
            </div>
          ))}
        </div>

        <P>
          Même dans un monde où toutes les voitures seraient électriques demain matin,
          nous aurions encore besoin de pétrole. Beaucoup de pétrole.
          Pour la médecine, pour l'agriculture, pour les vêtements, pour les routes.
          Supprimer le pétrole de la civilisation industrielle, c'est retirer
          le béton d'un immeuble déjà construit — pas impossible en théorie,
          catastrophique en pratique.
        </P>

        <Long>
          <P>
            Si on croit que les renouvelables vont simplement remplacer le pétrole
            à volume égal et en douceur, on sous-estime massivement la quantité
            qui sera encore consommée pendant les 20-30 ans de substitution partielle.
            Le risque n'est pas l'après-pétrole. Le risque est le <em>pendant</em> —
            la période d'ambiguïté où les alternatives ne sont pas encore là
            et où le pétrole se raréfie ou se politise.
          </P>
          <Anecdote>
            Une voiture électrique produit en moyenne 60-70% moins de CO₂ sur son cycle de vie
            qu'une thermique en Europe — c'est un gain réel.
            Mais sa batterie nécessite du lithium extrait en Australie par des camions diesel,
            du cobalt congolais transporté par porte-conteneurs au fioul lourd,
            du nickel indonésien traité dans des usines au charbon.
            La chaîne fossile de la transition verte est longue, invisible,
            et rarement comptabilisée dans les bilans carbone officiels.
          </Anecdote>
        </Long>

        <Sep />

        {/* Conclusion */}
        <div className="py-8">
          <div className="text-blue-400/50 text-xs uppercase tracking-widest mb-4">Bilan</div>
          <H2>L'empire invisible : quatre tensions qui vont définir les années à venir</H2>

          <div className="space-y-4 mb-10">
            {[
              {
                n: '1',
                titre: 'La surconsommation structurelle',
                texte: 'La consommation mondiale de pétrole bat des records en 2026. Non pas malgré la transition, mais en partie à cause de la croissance industrielle qu\'elle nécessite. On ajoute, on n\'enlève pas.',
                color: 'border-blue-500/50 bg-blue-950/20',
              },
              {
                n: '2',
                titre: 'La gronde populaire sur les prix',
                texte: 'Chaque fois que le baril dépasse 100$, des gouvernements vacillent. Les Gilets Jaunes français (2018), les émeutes en Iran (2019), en Équateur (2019), au Kazakhstan (2022). Le prix à la pompe est le thermomètre politique le plus sensible qui existe. Et ce thermomètre monte.',
                color: 'border-amber-500/50 bg-amber-950/20',
              },
              {
                n: '3',
                titre: 'La stabilité politique sous tension',
                texte: 'Ormuz est partiellement bloqué en ce moment même. La Russie utilise le gaz et le pétrole comme arme de guerre depuis 2022. L\'Arabie Saoudite manipule ses quotas OPEC en fonction de ses relations avec Washington. L\'énergie est redevenue ce qu\'elle a toujours été : une arme.',
                color: 'border-red-500/50 bg-red-950/20',
              },
              {
                n: '4',
                titre: 'Le paradoxe des États rentiers',
                texte: 'Les pays qui ont le plus de pétrole sont souvent ceux qui ont le moins diversifié leur économie. Quand les réserves baissent — ou quand le monde consomme moins — ces États font face à une crise existentielle. Le modèle NEOM est la réponse paniquée à ce problème.',
                color: 'border-emerald-500/50 bg-emerald-950/20',
              },
            ].map(t => (
              <div key={t.n} className={`rounded-xl border p-5 ${t.color}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-black text-white/60">{t.n}</div>
                  <div className="font-bold text-white text-sm">{t.titre}</div>
                </div>
                <p className="text-white/60 text-sm leading-relaxed">{t.texte}</p>
              </div>
            ))}
          </div>

          <P>
            Le CO₂ qui monte, les émirats qui ne votent pas, les goulots d'étranglement maritimes,
            les prix qui font tomber les gouvernements, les batteries électriques transportées
            au fioul lourd — tous ces fils remontent au même endroit.
            Le CO₂ qui monte, les émirats qui ne votent pas, les goulots d'étranglement maritimes, les prix qui font tomber les gouvernements, les batteries électriques transportées au fioul lourd — tous ces fils remontent au même endroit. L'empire est invisible parce qu'il est partout.
          </P>

          {/* Graphique mix énergétique mondial */}
          <EnergyMixChart />

          <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6
            p-6 bg-white/5 rounded-2xl border border-white/10">
            <div>
              <div className="text-white/40 text-sm mb-1">Acte suivant</div>
              <div className="text-white font-bold text-xl">Le Futur — Quand la flamme vacille</div>
              <div className="text-white/40 text-xs mt-0.5">
                Scénarios contradictoires, peaks, réserves politiques, le monde d'après
              </div>
            </div>
            <Link to="/futur"
              className="shrink-0 px-6 py-3 bg-emerald-900/50 border border-emerald-700/50
                hover:bg-emerald-900/70 text-emerald-300 font-bold rounded-xl transition-all text-sm">
              Lire l'Acte III →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function PresentStory() {
  return (
    <ReadingModeProvider>
      <PresentContent />
    </ReadingModeProvider>
  );
}

