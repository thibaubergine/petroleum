import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ReadingModeProvider, ReadingToggle, Long, useReadingMode, TableOfContents, ChapterAnchor } from '@/context/ReadingMode';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ComposedChart, Area, ReferenceLine, Legend
} from 'recharts';

// ── Composants narratifs ──────────────────────────────────────────────────────
function ChapterLabel({ n, label }: { n: string; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="text-xs font-black text-emerald-400/60 uppercase tracking-[0.3em]">{n}</div>
      <div className="flex-1 h-px bg-white/10" />
      <div className="text-xs text-white/30 uppercase tracking-[0.2em]">{label}</div>
    </div>
  );
}

function Anecdote({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-10 pl-6 border-l-2 border-emerald-500/40 bg-emerald-950/20 rounded-r-xl p-5">
      <div className="text-emerald-400/70 text-xs uppercase tracking-widest mb-2 font-bold">À noter</div>
      <div className="text-white/75 text-sm leading-relaxed italic">{children}</div>
    </div>
  );
}

function Chiffre({ val, unit, label, sub }: { val: string; unit?: string; label: string; sub?: string }) {
  return (
    <div className="text-center p-5">
      <div className="text-4xl font-black text-emerald-400">
        {val}<span className="text-2xl text-emerald-500/60 ml-1">{unit}</span>
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
      <cite className="text-sm text-emerald-400/70 not-italic">{source}</cite>
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

// ── Données projections ───────────────────────────────────────────────────────
const SCENARIOS = [
  { name: 'OPEC',       label: 'OPEC Reference',     peak: 'Aucun', val2050: 116, color: '#B85450', dash: false, credibility: 0.21 },
  { name: 'EIA-High',   label: 'EIA High Growth',    peak: 'Aucun', val2050: 120, color: '#D4813A', dash: true,  credibility: 0.73 },
  { name: 'EIA-Ref',    label: 'EIA Reference',      peak: '2045',  val2050: 110, color: '#C17F24', dash: false, credibility: 0.73 },
  { name: 'EIA-Low',    label: 'EIA Low Growth',     peak: '2035',  val2050: 100, color: '#A0522D', dash: true,  credibility: 0.73 },
  { name: 'IEA-STEPS',  label: 'IEA STEPS',          peak: '2030',  val2050: 85,  color: '#4A90A4', dash: false, credibility: 0.61 },
  { name: 'IEA-APS',    label: 'IEA APS',            peak: '2026',  val2050: 55,  color: '#2E7D6B', dash: true,  credibility: 0.61 },
  { name: 'IEA-NZE',    label: 'IEA Net Zero 2050',  peak: '2025',  val2050: 24,  color: '#1a7a4a', dash: false, credibility: 0.61 },
];

const startVal = 102;
const profiles: Record<string, (y: number) => number> = {
  'OPEC':      y => startVal + (y - 2026) * 0.55,
  'EIA-High':  y => startVal + (y - 2026) * 0.70,
  'EIA-Ref':   y => startVal + (y - 2026) * 0.25,
  'EIA-Low':   y => y <= 2035 ? startVal : Math.max(100, startVal - (y - 2035) * 1.0),
  'IEA-STEPS': y => y <= 2030 ? startVal + (y - 2026) * 0.3 : Math.max(85, startVal + 1.2 - (y - 2030) * 1.5),
  'IEA-APS':   y => y <= 2026 ? startVal : Math.max(55, startVal - (y - 2026) * 2.5),
  'IEA-NZE':   y => Math.max(24, startVal - (y - 2026) * 3.2),
};

const PROJ_DATA = Array.from({ length: 25 }, (_, i) => 2026 + i).map(y => {
  const pt: any = { year: y };
  SCENARIOS.forEach(s => { pt[s.name] = Math.max(18, Math.round(profiles[s.name](y) * 10) / 10); });
  pt._min = Math.min(...SCENARIOS.map(s => pt[s.name]));
  pt._max = Math.max(...SCENARIOS.map(s => pt[s.name]));
  return pt;
});

// ── Courbes de déclin post-peak ───────────────────────────────────────────────
const DECLINE_COUNTRIES = {
  NOR: { name: 'Norvège', peak: 2001, peakVal: 3.35, color: '#4A90A4', data: [
    [2001,3.35],[2003,3.0],[2005,2.7],[2008,2.25],[2010,2.14],[2013,1.84],[2016,1.99],[2019,1.74],[2023,1.90],
  ]},
  GBR: { name: 'Royaume-Uni', peak: 1999, peakVal: 2.91, color: '#B85450', data: [
    [1999,2.91],[2001,2.50],[2003,2.20],[2005,1.63],[2008,1.43],[2010,1.34],[2013,0.86],[2016,1.01],[2023,0.76],
  ]},
  VEN: { name: 'Venezuela', peak: 1998, peakVal: 3.15, color: '#C17F24', data: [
    [1998,3.15],[2000,3.1],[2006,2.8],[2010,2.47],[2015,2.37],[2018,1.48],[2020,0.48],[2023,0.76],
  ]},
};

// ── Widget réserves controversées ─────────────────────────────────────────────
function ReservesWidget() {
  const [selected, setSelected] = useState<string>('SAU');
  const controverses = [
    {
      code: 'VEN', name: 'Venezuela', reserves: '304 Gb', color: '#C17F24',
      probleme: "Réserves officielles = extra-lourd de l'Orénoque. Taux de récupération réel estimé à 15-20% seulement, contre 60% pour le brut conventionnel. La réserve 'prouvée' inclut du pétrole que la physique rend très difficile à extraire.",
      impact: 'Entre 60 et 250 Gb selon la méthode de comptage — fourchette de 4:1.',
    },
    {
      code: 'SAU', name: 'Arabie Saoudite', reserves: '267 Gb', color: '#B85450',
      probleme: "Chiffre quasi-inchangé depuis 1988 malgré 30 ans de production intense (~4 Gb/an extraits). Les réserves n'ont jamais été auditées par un tiers indépendant. Aramco est restée privée pendant des décennies pour éviter la transparence.",
      impact: 'Les réserves réelles pourraient être entre 150 et 267 Gb. Aucun moyen de le savoir sans audit indépendant.',
    },
    {
      code: 'IRQ', name: 'Iraq', reserves: '145 Gb', color: '#8B4513',
      probleme: "Augmentation soudaine de 47% en 1987-1988, sans nouvelle découverte. Coïncide exactement avec le changement de règles OPEC liant les quotas aux réserves déclarées. Iran, UAE, Koweït ont fait pareil la même année.",
      impact: "L'inflation des réserves OPEC des années 1980 est estimée entre 200 et 400 Gb de surestimation collective.",
    },
    {
      code: 'RUS', name: 'Russie', reserves: '~80 Gb', color: '#7B5EA7',
      probleme: "Depuis mars 2022, la Russie ne publie plus ses statistiques pétrolières mensuelles. Les données disponibles viennent d'estimations indirectes (tanker tracking, achats de partenaires). L'incertitude est maximale.",
      impact: 'EIA estime 9 mb/j, OPEC relaie 11 mb/j. Écart de 2 mb/j impossible à résoudre sans données primaires.',
    },
  ];
  const sel = controverses.find(x => x.code === selected) ?? controverses[0];

  return (
    <div className="my-10 rounded-2xl border border-emerald-700/30 bg-emerald-950/10 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10">
        <div className="text-xs text-emerald-400/60 uppercase tracking-widest mb-1">Données controversées</div>
        <div className="font-bold text-white">Réserves prouvées — ce que les chiffres cachent</div>
      </div>
      <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-2">
        {controverses.map(c => (
          <button key={c.code} onClick={() => setSelected(c.code)}
            className={`rounded-xl p-3 text-left transition border ${
              selected === c.code ? 'border-white/40 bg-white/12' : 'border-white/10 bg-white/5 hover:bg-white/8'
            }`}>
            <div className="text-xs text-white/50 mb-0.5 font-medium">{c.name}</div>
            <div className="text-xl font-black" style={{ color: c.color }}>{c.reserves}</div>
          </button>
        ))}
      </div>
      <div className="px-6 pb-6 border-t border-white/10 pt-4">
        <div className="flex items-baseline gap-3 mb-3">
          <div className="font-bold text-white text-lg">{sel.name}</div>
          <div className="text-sm font-bold" style={{ color: sel.color }}>{sel.reserves}</div>
        </div>
        <p className="text-sm text-white/65 leading-relaxed mb-3">{sel.probleme}</p>
        <div className="p-3 rounded-lg border text-sm" style={{ borderColor: sel.color + '40', backgroundColor: sel.color + '12' }}>
          <strong className="text-white/80">Impact sur les projections :</strong>{' '}
          <span style={{ color: sel.color }}>{sel.impact}</span>
        </div>
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
function FutureContent() {
  const { mode } = useReadingMode();
  const [visibleScenarios, setVisibleScenarios] = useState<Set<string>>(
    new Set(SCENARIOS.map(s => s.name))
  );
  const [declineCountry, setDeclineCountry] = useState<'NOR' | 'GBR' | 'VEN'>('NOR');

  const toggle = (name: string) => setVisibleScenarios(prev => {
    const nx = new Set(prev);
    nx.has(name) ? nx.delete(name) : nx.add(name);
    return nx;
  });

  const dc = DECLINE_COUNTRIES[declineCountry];
  const declineData = dc.data.map(([year, val]) => ({
    year,
    actual: val,
    exp: Math.round(dc.peakVal * Math.exp(-0.04 * (year - dc.peak)) * 100) / 100,
  }));

  const CHAPTERS = [
    { n: 'I',   label: 'Incertitude', title: 'Personne ne sait',        id: 'fch-unc' },
    { n: 'II',  label: 'Scénarios',   title: '7 projections',           id: 'fch-scen' },
    { n: 'II·b',label: 'Cycles',      title: 'Contraction & expansion', id: 'fch-cycle' },
    { n: 'III', label: 'Réserves',    title: 'Fiction politique',       id: 'fch-res' },
    { n: 'IV',  label: 'Double pic',  title: 'Demand vs Supply',        id: 'fch-peak' },
    { n: 'V',   label: 'Avant-goûts', title: 'Pays post-peak',         id: 'fch-dec' },
    { n: 'VI',  label: "L'après",    title: "Pas d'équivalent",       id: 'fch-aft' },
    { n: 'VII', label: 'Pétrodollar', title: 'La dimension financière', id: 'fch-petrodollar' },
    { n: 'VIII',label: 'Catastrophe', title: 'Le scénario qu\'on tait', id: 'fch-cata' },
  ];
  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <TableOfContents chapters={CHAPTERS} />

      {/* Toggle sticky */}
      <div className="sticky top-14 z-40 flex flex-wrap items-center justify-between px-4 md:px-8 py-2 gap-2 bg-[#0d0d0d]/90 backdrop-blur border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="text-emerald-400/60 text-xs uppercase tracking-widest font-bold">Acte III</span>
          <span className="text-white/20 text-xs">2026 → 2050</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/25 text-xs">{mode === 'short' ? '~5 min' : '~7 min'}</span>
          <ReadingToggle />
        </div>
      </div>

      {/* Hero */}
      <div className="relative px-8 py-28 overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 50% 80%, #0a2018 0%, #0d0d0d 60%)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-emerald-400/50 text-xs uppercase tracking-[0.3em] mb-6">Acte III · 2026 → 2050</div>
          <h1 className="text-6xl md:text-8xl font-black text-white leading-none mb-6" style={{ letterSpacing: '-0.02em' }}>
            Quand la<br />flamme<br /><span className="text-emerald-400">vacille</span>
          </h1>
          <p className="text-lg text-white/50 leading-relaxed max-w-xl">
            Personne ne sait exactement ce qui va se passer. Les projections les plus sérieuses
            du monde divergent d'un facteur 5 sur l'horizon 2050.
            C'est précisément pour ça que c'est fascinant.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-8 pb-32">

        <ChapterAnchor id="fch-unc" />
        {/* I — Personne ne sait */}
        <ChapterLabel n="I" label="L'incertitude fondamentale" />
        <H2>L'écart le plus honnête de toute l'économie mondiale</H2>

        <P>
          En 2050, la demande mondiale de pétrole sera comprise entre 24 et 120 millions
          de barils par jour. C'est la fourchette des projections officielles des organisations
          les plus sérieuses de la planète — IEA d'un côté, OPEC de l'autre.
          Un écart de 96 mb/j. Cinq fois la production actuelle des États-Unis.
          La majorité de ces projections sera radicalement fausse.
          Et personne ne sait laquelle aura raison.
        </P>

        <P>
          Ce n'est pas une défaillance intellectuelle — c'est la nature de la chose.
          La demande pétrolière de 2050 dépend de décisions politiques pas encore prises,
          de technologies pas encore déployées, de crises pas encore survenues,
          de guerres pas encore commencées. Prétendre prédire avec précision est
          intellectuellement malhonnête. Ce qui est utile, c'est de comprendre
          <em>pourquoi</em> les projections divergent autant — et ce que chacune révèle
          sur ceux qui la produisent.
        </P>

        <StatRow>
          <Chiffre val="24" unit="mb/j" label="IEA Net Zero 2050" sub="scénario normatif 1.5°C" />
          <Chiffre val="120" unit="mb/j" label="EIA High Growth" sub="croissance continue" />
          <Chiffre val="×5" label="écart entre extrêmes" sub="la fourchette d'honnêteté" />
          <Chiffre val="0" label="projection qui sera exacte" sub="sûrement aucune" />
        </StatRow>

        <Sep />

        <ChapterAnchor id="fch-scen" />
        {/* II — Graphique projections */}
        <ChapterLabel n="II" label="Les scénarios" />
        <H2>Sept projections — sept visions du monde</H2>

        <P>
          Chaque scénario n'est pas seulement une prévision technique.
          C'est un système de croyances sur l'humanité, la croissance, la politique
          et la technologie. L'OPEC croit que la demande croîtra indéfiniment —
          ce n'est pas neutre pour une organisation dont les revenus en dépendent.
          L'IEA Net Zero 2050 est un scénario <em>normatif</em> — il décrit ce qu'il
          faudrait faire pour rester sous 1.5°C, pas ce qui se passera probablement.
          La nuance est cruciale.
        </P>

        {/* Sélecteur */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {SCENARIOS.map(s => {
            const active = visibleScenarios.has(s.name);
            return (
              <button key={s.name} onClick={() => toggle(s.name)}
                className={`px-2.5 py-1 rounded text-xs font-semibold border transition ${
                  active ? 'text-white border-transparent' : 'bg-white/5 text-white/40 border-white/10'
                }`}
                style={active ? { backgroundColor: s.color, borderColor: s.color } : {}}>
                {s.label.split(' ').slice(0, 2).join(' ')}
              </button>
            );
          })}
        </div>

        <ChartBox title="Projections demande mondiale 2026–2050" subtitle="mb/j · Zone grisée = enveloppe d'incertitude · Cliquer sur un scénario pour l'isoler">
          <ResponsiveContainer width="100%" height={420}>
            <ComposedChart data={PROJ_DATA} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff12" />
              <XAxis dataKey="year" tick={{ fill: '#ffffff60', fontSize: 11 }} axisLine={{ stroke: '#ffffff20' }} tickLine={false}
                label={{ value: 'Année', position: 'insideBottom', offset: -15, fill: '#ffffff40', fontSize: 11 }} />
              <YAxis tick={{ fill: '#ffffff60', fontSize: 11 }} axisLine={false} tickLine={false} domain={[15, 130]}
                label={{ value: 'mb/j', angle: -90, position: 'insideLeft', fill: '#ffffff40', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #ffffff20', borderRadius: '8px', fontSize: 11 }}
                labelStyle={{ color: '#ffffff80' }}
                formatter={(v: number, n: string) => n.startsWith('_') ? [null, ''] as any : [`${v} mb/j`, SCENARIOS.find(s => s.name === n)?.label ?? n]} />
              <Legend wrapperStyle={{ paddingTop: 16, fontSize: 10 }}
                formatter={v => v.startsWith('_') ? null : (SCENARIOS.find(s => s.name === v)?.label ?? v)} />
              {/* Enveloppe */}
              <Area dataKey="_max" stroke="none" fill="#ffffff" fillOpacity={0.04} name="_max" legendType="none" />
              <Area dataKey="_min" stroke="none" fill="#0d1117" fillOpacity={1} name="_min" legendType="none" />
              {/* Ligne 102 actuel */}
              <ReferenceLine y={102} stroke="#ffffff" strokeDasharray="3 3" opacity={0.15}
                label={{ value: '102 mb/j (2026)', fill: '#ffffff30', fontSize: 9, position: 'right' }} />
              {SCENARIOS.map(s => visibleScenarios.has(s.name) ? (
                <Line key={s.name} type="monotone" dataKey={s.name}
                  stroke={s.color} strokeWidth={2.5}
                  strokeDasharray={s.dash ? '6 3' : undefined}
                  dot={false} activeDot={{ r: 4, fill: s.color }}
                  name={s.name} />
              ) : null)}
            </ComposedChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-4 mt-3 text-xs text-white/30">
            <span>— Trait plein : scénario principal</span>
            <span>- - Tirets : variante</span>
            <span>■ Zone grise : enveloppe d'incertitude totale</span>
          </div>
        </ChartBox>

        {/* Tableau des scénarios */}
        <div className="overflow-x-auto rounded-xl border border-white/10 my-8">
          <table className="w-full text-xs">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left px-4 py-3 text-white/40 font-semibold uppercase">Scénario</th>
                <th className="text-left px-4 py-3 text-white/40 font-semibold uppercase">Ce qu'il suppose</th>
                <th className="text-right px-4 py-3 text-white/40 font-semibold uppercase">Peak</th>
                <th className="text-right px-4 py-3 text-white/40 font-semibold uppercase">2050</th>
                <th className="text-right px-4 py-3 text-white/40 font-semibold uppercase">Crédibilité</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {SCENARIOS.map(s => (
                <tr key={s.name} className="hover:bg-white/5 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                      <span className="font-bold text-white">{s.label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/50 max-w-xs leading-relaxed">
                    {s.name === 'OPEC' && 'Croissance des émergents, transition lente, pétrole indispensable'}
                    {s.name === 'EIA-High' && 'Forte croissance mondiale, faible adoption VE, énergie abondante'}
                    {s.name === 'EIA-Ref' && 'Prolongation des tendances actuelles — le plus "neutre"'}
                    {s.name === 'EIA-Low' && 'Efficacité énergétique renforcée, électrification progressive'}
                    {s.name === 'IEA-STEPS' && 'Politiques actuellement annoncées maintenues — réaliste'}
                    {s.name === 'IEA-APS' && 'Tous les engagements net zéro nationaux respectés à temps'}
                    {s.name === 'IEA-NZE' && 'Normatif 1.5°C — ce qu\'il faudrait faire, pas ce qui arrivera'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {s.peak === 'Aucun'
                      ? <span className="text-emerald-400 font-bold">Aucun</span>
                      : <span className="text-red-400 font-bold">{s.peak}</span>}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-white">{s.val2050}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-bold px-2 py-0.5 rounded text-xs ${
                      s.credibility >= 0.6 ? 'bg-green-900/50 text-green-400' :
                      s.credibility >= 0.4 ? 'bg-amber-900/50 text-amber-400' : 'bg-red-900/50 text-red-400'
                    }`}>
                      T×V×A {(s.credibility * 100).toFixed(0)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Sep />

        {/* II·b — Cycles des prix */}
        <ChapterAnchor id="fch-cycle" />
        <ChapterLabel n="II·b" label="Mécanique" />
        <H2>Le cycle infernal : contraction, envolée, effondrement, répétition</H2>

        <P>
          Le marché pétrolier n'est pas stable — il est structurellement cyclique.
          Et la logique de ces cycles est contre-intuitive.
          Quand les prix sont hauts, tout le monde investit dans la production.
          Quelques années plus tard, l'offre explose, les prix s'effondrent.
          Quand les prix sont bas, personne n'investit. Quelques années plus tard,
          l'offre s'assèche, les prix remontent. Recommencez depuis le début.
        </P>

        {/* Graphique cycle */}
        <div className="my-8 rounded-2xl border border-white/10 overflow-hidden">
          <div className="px-5 py-3 border-b border-white/10 bg-white/5">
            <div className="text-sm font-bold text-white/80">Mécanique d'un cycle pétrolier</div>
            <div className="text-xs text-white/40 mt-0.5">Durée typique d'un cycle complet : 7-12 ans</div>
          </div>
          <div className="p-5 bg-[#0d1117]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
              {[
                {
                  phase: '① Prix élevés', color: '#B85450',
                  desc: 'Les producteurs investissent massivement. Les projets coûteux (shale, offshore profond) deviennent rentables. L\'emploi dans le secteur monte.',
                  duree: '2-4 ans',
                },
                {
                  phase: '② Surproduction', color: '#C17F24',
                  desc: 'L\'offre dépasse la demande. Les stocks s\'accumulent. Les premiers signes de faiblesse apparaissent mais les investissements continuent par inertie.',
                  duree: '1-2 ans',
                },
                {
                  phase: '③ Effondrement des prix', color: '#4A90A4',
                  desc: 'Les prix chutent brutalement. Les projets coûteux sont stoppés. Les faillites se multiplient dans le shale américain. Les États producteurs voient leurs budgets s\'effondrer.',
                  duree: '6-18 mois',
                },
                {
                  phase: '④ Sous-investissement', color: '#2E7D6B',
                  desc: 'Personne n\'investit. Les capacités de production futures diminuent. Les vieux puits se tarissent sans être remplacés. La pénurie se prépare en silence.',
                  duree: '2-5 ans',
                },
              ].map(p => (
                <div key={p.phase} className="rounded-lg border border-white/10 p-4"
                  style={{ borderLeftColor: p.color, borderLeftWidth: '3px' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold text-sm" style={{ color: p.color }}>{p.phase}</div>
                    <div className="text-xs text-white/30">{p.duree}</div>
                  </div>
                  <p className="text-xs text-white/55 leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>

            {/* Graphique illustratif */}
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={[
                  {t:'T0',prix:30,inv:20},{t:'T1',prix:45,inv:35},{t:'T2',prix:75,inv:70},
                  {t:'T3',prix:100,inv:90},{t:'T4',prix:110,inv:95},{t:'T5',prix:90,inv:80},
                  {t:'T6',prix:55,inv:50},{t:'T7',prix:40,inv:20},{t:'T8',prix:30,inv:10},
                  {t:'T9',prix:35,inv:8},{t:'T10',prix:50,inv:15},{t:'T11',prix:70,inv:40},
                  {t:'T12',prix:95,inv:75},{t:'T13',prix:105,inv:90},
                ]}
                margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="t" tick={{ fill: '#ffffff40', fontSize: 9 }} axisLine={{ stroke: '#ffffff15' }} tickLine={false} />
                <YAxis tick={{ fill: '#ffffff40', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #ffffff20', borderRadius: '6px', fontSize: 10 }}
                  formatter={(v: number, n: string) => [`${v}`, n === 'prix' ? 'Indice prix' : 'Indice investissement']} />
                <Legend wrapperStyle={{ fontSize: 10 }}
                  formatter={v => v === 'prix' ? 'Indice prix baril' : 'Indice investissement E&P'} />
                <Line type="monotone" dataKey="prix" stroke="#C17F24" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="inv" stroke="#4A90A4" strokeWidth={2} strokeDasharray="4 2" dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-white/25 text-center mt-2">L'investissement suit les prix avec 2-3 ans de décalage — source des cycles</p>
          </div>
        </div>

        <P>
          Ce décalage de 2 à 3 ans entre signal de prix et réponse de l'offre
          est la source structurelle de l'instabilité. Quand les prix remontent,
          il faut des années pour forger de nouveaux puits, construire des plateformes,
          former des ingénieurs. Quand ils s'effondrent, les projets déjà engagés
          continuent par inertie.
          Le marché pétrolier est condamné à une volatilité permanente.
          Ce n'est pas un dysfonctionnement — c'est son mode de fonctionnement normal.
        </P>

        <Long>
          <P>
            La transition énergétique ajoute une nouvelle dimension à ces cycles.
            Si la demande commence à baisser structurellement, les investissements
            dans la production chutent par anticipation.
            Mais si la demande baisse plus lentement que prévu —
            ce qui est le cas depuis 2015 — l'offre se raréfie, les prix remontent,
            et on se retrouve en pénurie dans un monde qui "décarbonise".
            C'est le scénario que plusieurs économistes appellent la "turbulence de transition" :
            ni assez de fossile, ni assez de renouvelable, et des prix qui font des yo-yo.
          </P>

          {/* Figures publiques en version longue */}
          <div className="my-8 space-y-3">
            <div className="text-xs text-white/30 uppercase tracking-widest mb-4">Ce que disent ceux qui se risquent à en parler</div>
            {[
              {
                nom: 'Daniel Yergin', titre: 'Vice-président S&P Global, auteur de The Prize',
                citation: 'Il n\'y a pas de pénurie de pétrole en vue — le problème est le coût, la géopolitique et le capital, pas le volume.',
                position: 'Haussier modéré — pic demand vers 2030, mais pas d\'effondrement brutal.',
                couleur: '#C17F24',
              },
              {
                nom: 'Fatih Birol', titre: 'Directeur général de l\'IEA',
                citation: 'Le pic de la demande de pétrole pour les transports est déjà derrière nous ou proche.',
                position: 'Optimiste transition — mais reconnaît que la réalité retarde souvent les scénarios officiels.',
                couleur: '#2E7D6B',
              },
              {
                nom: 'Amin Nasser', titre: 'PDG d\'Aramco (Arabie Saoudite)',
                citation: 'Le monde a besoin de plus de pétrole, pas moins. L\'abandon des fossiles est une fantaisie.',
                position: 'Évidemment — il vend du pétrole. Mais il a les données de production les plus précises du monde.',
                couleur: '#B85450',
              },
              {
                nom: 'Jeff Currie', titre: 'Ex-responsable recherche matières premières Goldman Sachs',
                citation: 'Le monde a besoin de plus d\'investissement dans les fossiles, pas moins — sinon le prochain choc pétrolier sera pire que tout ce qu\'on a connu.',
                position: 'Voix rare parmi les financiers à dire ce que beaucoup pensent tout bas. A quitté Goldman en 2023 pour Carlyle — qui investit massivement dans l\'énergie fossile.',
                couleur: '#C17F24',
              },
            ].map(f => (
              <div key={f.nom} className="rounded-xl border border-white/10 bg-white/3 p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="font-bold text-white text-sm">{f.nom}</div>
                    <div className="text-xs text-white/40">{f.titre}</div>
                  </div>
                  <div className="text-xs px-2 py-0.5 rounded-full border shrink-0"
                    style={{ borderColor: f.couleur + '50', color: f.couleur, backgroundColor: f.couleur + '15' }}>
                    Position
                  </div>
                </div>
                <blockquote className="text-sm text-white/65 italic leading-relaxed mb-2 border-l-2 pl-3"
                  style={{ borderColor: f.couleur + '60' }}>
                  "{f.citation}"
                </blockquote>
                <p className="text-xs text-white/35">{f.position}</p>
              </div>
            ))}
          </div>
        </Long>

        <Sep />

        <ChapterAnchor id="fch-res" />
        {/* III — Réserves politiques */}
        <ChapterLabel n="III" label="Les réserves politiques" />
        <H2>Les chiffres de réserves sont en partie une fiction politique</H2>

        <P>
          En 1986, l'OPEC change ses règles : les quotas de production de chaque membre
          seront désormais indexés à leurs réserves déclarées.
          Plus vous déclarez de réserves, plus vous pouvez produire — et donc gagner d'argent.
          Dans les deux années qui suivent, les réserves déclarées de l'Iran, de l'Iraq,
          du Koweït, des UAE et de l'Arabie Saoudite augmentent collectivement
          de 300 milliards de barils.
          Aucune découverte majeure ne justifie cette hausse soudaine.
          Aucun audit indépendant n't confirmée.
        </P>

        <P>
          Ce n'est pas une théorie conspirationniste — c'est documenté par les économistes
          pétroliers depuis les années 1990. Les réserves "prouvées" sont une catégorie
          à la fois technique et politique. Technique parce qu'elle dépend de la géologie.
          Politique parce qu'elle dépend de qui décide quels critères d'extractibilité
          sont "raisonnables" — et qui a intérêt à les définir largement.
        </P>

        <ReservesWidget />

        <Long>
          <P>
            La conséquence pour les projections est sérieuse : si les réserves mondiales
            prouvées sont significativement inférieures aux chiffres officiels,
            les scénarios "demande stable" ou "croissance continue" deviennent
            physiquement impossibles — non par manque de volonté, mais par manque
            de pétrole dans le sol. Le peak supply pourrait alors précéder le peak demand.
            Et contrairement à un pic de demande, un pic d'offre contraint
            est radicalement différent à gérer — les prix explosent, les pénuries apparaissent,
            les ordres politiques vacillent.
          </P>
          <Anecdote>
            En 2011, WikiLeaks a publié des câbles diplomatiques américains qui révèlent
            que le consul des États-Unis à Riyad avait rencontré un expert pétrolier
            saoudien de haut rang. Selon ce câble, l'expert estimait que les réserves
            saoudiennes étaient surestimées d'environ 40% — soit 100 milliards de barils
            de moins que les chiffres officiels. Aramco a démenti. Les chiffres officiels
            n'ont pas changé. Le câble existe toujours.
          </Anecdote>
        </Long>

        <Sep />

        <ChapterAnchor id="fch-peak" />
        {/* IV — Peak demand vs peak supply */}
        <ChapterLabel n="IV" label="Le double pic" />
        <H2>Peak demand ou peak supply — la distinction qui change tout</H2>

        <P>
          Il faut distinguer deux concepts que le débat public confond souvent.
          Le <strong className="text-white">peak demand</strong> — le pic de demande —
          c'est le moment où les consommateurs choisissent de vouloir moins de pétrole,
          parce qu'ils ont des alternatives moins chères ou parce que des politiques
          les y contraignent. La transition se fait en douceur, progressivement,
          les prix baissent au fur et à mesure que la demande recule.
        </P>

        <P>
          Le <strong className="text-white">peak supply</strong> — le pic d'offre —
          c'est quand les producteurs ne peuvent plus produire davantage,
          indépendamment de la demande. Les réservoirs se vident.
          Les nouveaux puits sont plus coûteux, moins productifs.
          L'EROEI chute. Dans ce scénario, les prix montent brutalement
          — non parce que la demande augmente, mais parce que l'offre s'effondre.
          C'est le scénario catastrophe que les économistes pétroliers les plus pessimistes
          anticipaient avant la révolution shale. Le shale a repoussé l'échéance
          — pas éliminé le problème.
        </P>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-10">
          {[
            {
              titre: 'Peak Demand', icon: '',
              color: 'border-green-700/40 bg-green-950/20',
              accentColor: 'text-green-400',
              points: [
                'Les alternatives deviennent moins chères que le pétrole',
                'Les politiques climatiques réduisent la demande',
                'Transition progressive, prix qui baissent',
                'Les pays producteurs s\'adaptent graduellement',
                'Scénario IEA APS / NZE — si les politiques tiennent',
              ],
              verdict: 'Gérable si anticipé',
            },
            {
              titre: 'Peak Supply', icon: '',
              color: 'border-red-700/40 bg-red-950/20',
              accentColor: 'text-red-400',
              points: [
                'Les réservoirs se vident plus vite que prévu',
                'Les nouveaux puits coûtent plus cher à produire',
                'L\'EROEI continue de chuter',
                'Les prix explosent malgré la demande stable',
                'Les pénuries physiques apparaissent',
              ],
              verdict: 'Potentiellement chaotique',
            },
          ].map(s => (
            <div key={s.titre} className={`rounded-2xl border p-5 ${s.color}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{s.icon}</span>
                <span className={`font-black text-lg ${s.accentColor}`}>{s.titre}</span>
              </div>
              <ul className="space-y-1.5 mb-4">
                {s.points.map((p, i) => (
                  <li key={i} className="text-sm text-white/60 flex gap-2">
                    <span className={`shrink-0 mt-0.5 ${s.accentColor}`}>→</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              <div className={`text-xs font-bold px-3 py-1.5 rounded-full inline-block ${s.color} border`}>
                {s.verdict}
              </div>
            </div>
          ))}
        </div>

        <Sep />

        <ChapterAnchor id="fch-dec" />
        {/* V — Courbes de déclin */}
        <ChapterLabel n="V" label="Les avant-goûts" />
        <H2>La Norvège, le Royaume-Uni, le Venezuela — les pays qui ont déjà vécu le peak</H2>

        <P>
          Certains pays n'ont pas à attendre 2050 pour connaître la vie après le peak pétrolier.
          Ils l'ont déjà vécu. La Norvège a atteint son maximum de production en 2001.
          Le Royaume-Uni en 1999. Le Venezuela dans les années 1970 et à nouveau en 1998.
          Leurs trajectoires post-peak sont très différentes — et très instructives
          sur ce qui attend les pays producteurs majeurs.
        </P>

        <div className="flex gap-2 mb-4">
          {(Object.entries(DECLINE_COUNTRIES) as any[]).map(([code, c]) => (
            <button key={code} onClick={() => setDeclineCountry(code as any)}
              className={`px-4 py-2 rounded-lg text-xs font-bold border transition ${
                declineCountry === code
                  ? 'text-white border-transparent'
                  : 'bg-white/5 text-white/50 border-white/10 hover:border-white/30'
              }`}
              style={declineCountry === code ? { backgroundColor: c.color, borderColor: c.color } : {}}>
              {c.name} (peak {c.peak})
            </button>
          ))}
        </div>

        <ChartBox
          title={`Courbe de déclin — ${dc.name}`}
          subtitle="Production réelle (mb/j) + modèle exponentiel -4%/an pour référence">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={declineData} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff12" />
              <XAxis dataKey="year" tick={{ fill: '#ffffff60', fontSize: 11 }} axisLine={{ stroke: '#ffffff20' }} tickLine={false}
                label={{ value: 'Année', position: 'insideBottom', offset: -15, fill: '#ffffff40', fontSize: 11 }} />
              <YAxis tick={{ fill: '#ffffff60', fontSize: 11 }} axisLine={false} tickLine={false}
                label={{ value: 'mb/j', angle: -90, position: 'insideLeft', fill: '#ffffff40', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #ffffff20', borderRadius: '8px', fontSize: 11 }}
                labelStyle={{ color: '#ffffff80' }}
                formatter={(v: number, n: string) => [`${v.toFixed(2)} mb/j`, n === 'actual' ? 'Production réelle' : 'Modèle exp. -4%/an']} />
              <Legend wrapperStyle={{ paddingTop: 16, fontSize: 11 }}
                formatter={v => v === 'actual' ? 'Production réelle' : 'Modèle -4%/an'} />
              <ReferenceLine x={dc.peak} stroke="#ffffff30" strokeDasharray="4 3"
                label={{ value: `Peak ${dc.peak}`, fill: '#ffffff40', fontSize: 9, position: 'top' }} />
              <Line type="monotone" dataKey="actual" stroke={dc.color} strokeWidth={3} dot={{ r: 4, fill: dc.color, strokeWidth: 0 }} name="actual" />
              <Line type="monotone" dataKey="exp" stroke="#ffffff30" strokeWidth={1.5} strokeDasharray="5 4" dot={false} name="exp" />
            </LineChart>
          </ResponsiveContainer>
        </ChartBox>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs my-6">
          {[
            { key: 'NOR', label: 'Norvège — Le modèle', text: 'Déclin ordonné. Le fonds souverain de 1 700 Mds$ amortit le choc. La production offshore reste rentable à des prix élevés. Pas de crise sociale. Mais le modèle n\'est pas reproductible — il suppose des institutions solides préexistantes.', color: '#4A90A4' },
            { key: 'GBR', label: 'Royaume-Uni — La désindustrialisation', text: 'Le peak de 1999 coïncide avec la fin de l\'ère Thatcher. La rente pétrolière de la mer du Nord avait subventionné la désindustrialisation des années 1980. Quand le pétrole baisse, il ne reste plus grand chose. Leçon : la rente peut masquer la décomposition économique.', color: '#B85450' },
            { key: 'VEN', label: 'Venezuela — L\'effondrement', text: 'Cas extrême. La nationalisation d\'Aramco chaviste, la corruption, les sanctions US, la chute des prix de 2014 — combinés, ils ont réduit la production à 15% du niveau de 1998. Le Venezuela est la réponse à la question : que se passe-t-il quand tout va mal en même temps ?', color: '#C17F24' },
          ].map(c => (
            <div key={c.key} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="font-bold mb-1.5" style={{ color: c.color }}>{c.label}</div>
              <p className="text-white/50 leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>

        <Long>
          <P>
            Ces trois exemples suggèrent une règle empirique : la qualité des institutions
            d'un pays au moment de son peak pétrolier prédit plus fidèlement son avenir
            que la taille de ses réserves. La Norvège avait des institutions solides.
            Le Venezuela en avait de faibles. C'est le même pétrole — des destins opposés.
          </P>
        </Long>

        <Sep />

        <ChapterAnchor id="fch-aft" />
        {/* VI — Le monde d'après */}
        <ChapterLabel n="VI" label="L'après" />
        <H2>Le monde d'après — ou comment on n'a pas encore trouvé l'équivalent</H2>

        <P>
          La question qu'on pose rarement dans le débat énergétique :
          existe-t-il une source d'énergie qui combine les propriétés du pétrole —
          densité énergétique, liquidité, transportabilité, polyvalence chimique —
          dans un package économiquement compétitif, physiquement disponible,
          et déployable à l'échelle mondiale en quelques décennies ?
        </P>

        <P>
          La réponse honnête est : pas encore. Chaque alternative résout une partie
          du problème mais crée de nouveaux.
          L'électricité est propre à l'usage mais dépend d'un réseau,
          d'une batterie, et d'une chaîne d'approvisionnement minière complexe.
          L'hydrogène est abondant en théorie mais difficile à stocker, à transporter,
          et coûteux à produire proprement (l'hydrogène vert représente moins de 1%
          de la production actuelle).
          Le nucléaire est dense et continu mais lent à déployer, coûteux, et politiquement
          difficile. Les biocarburants concurrencent l'alimentation pour les terres agricoles.
        </P>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-10 text-xs">
          {[
            { label: 'Électricité / batteries', pros: ['Propre à usage', 'Renouvelable si source verte', 'Coût en forte baisse'], cons: ['Ne remplace pas la pétrochimie', 'Dépend de minerais rares', 'Stockage longue durée non résolu', 'Réseau = infrastructure fragile'] },
            { label: 'Hydrogène', pros: ['Abondant en théorie', 'Haute densité énergétique', 'Peut remplacer gaz industriel'], cons: ['Stockage difficile (cryogénique ou comprimé)', 'H₂ vert < 1% du total en 2026', 'Rendement médiocre (30-40%)', 'Infrastructure inexistante'] },
            { label: 'Nucléaire', pros: ['Dense, continu, bas-carbone', 'Indépendant de la météo', 'Petit modèle (SMR) en développement'], cons: ['Coût et délai de construction', 'Déchets longue durée', 'Risque perçu élevé', 'Prolifération nucléaire'] },
            { label: 'Biocarburants', pros: ['Compatible avec moteurs existants', 'Carbone "cyclique" si bien géré', 'Décollage déjà en aviation'], cons: ['Concurrence alimentaire pour les terres', 'Rendement faible par hectare', 'Déforestation si non régulé', 'Volume insuffisant pour remplacer le tout'] },
          ].map(alt => (
            <div key={alt.label} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="font-bold text-white mb-3">{alt.label}</div>
              <div className="mb-2">
                <div className="text-emerald-400/70 uppercase tracking-wider text-xs mb-1">Pour</div>
                {alt.pros.map((p, i) => <div key={i} className="text-white/50 flex gap-1.5"><span className="text-emerald-500">+</span>{p}</div>)}
              </div>
              <div>
                <div className="text-red-400/70 uppercase tracking-wider text-xs mb-1">Contre</div>
                {alt.cons.map((c, i) => <div key={i} className="text-white/50 flex gap-1.5"><span className="text-red-500">−</span>{c}</div>)}
              </div>
            </div>
          ))}
        </div>

        <P>
          Aucune de ces technologies n'est fausse. Toutes sont prometteuses.
          Mais "prometteuses" n'est pas "déployées".
          Et le pétrole, lui, est là, maintenant, dans les tuyaux,
          à 102 millions de barils par jour.
          La transition prendra des décennies — non par mauvaise volonté,
          mais parce que remplacer une infrastructure de civilisation prend du temps.
          Beaucoup de temps.
        </P>

        <Long>
          <Anecdote>
            En 2021, l'IEA publie son rapport Net Zero 2050 en déclarant qu'il ne faut
            approuver aucun nouveau projet pétrolier ou gazier après cette date.
            Six mois plus tard, la même IEA publie un rapport d'urgence demandant
            à l'Arabie Saoudite d'augmenter sa production pour faire baisser les prix
            de l'énergie en Europe. Le pétrole qu'on condamne le matin est celui
            dont on réclame davantage le soir. Ce n'est pas de l'hypocrisie —
            c'est la tension structurelle d'une civilisation dépendante
            d'une ressource qu'elle sait devoir abandonner.
          </Anecdote>
        </Long>

        <Sep />

        {/* VII — PÉTRODOLLAR */}
        <ChapterAnchor id="fch-petrodollar" />
        <ChapterLabel n="VII" label="Finance mondiale" />
        <H2>Le pétrodollar — la dimension que personne ne mentionne</H2>

        <P>
          Depuis 1973, le pétrole mondial se facture en dollars américains.
          Ce n'est pas une loi de la nature — c'est un accord politique explicite
          entre Richard Nixon et le roi Faysal d'Arabie Saoudite.
          L'accord est simple : les États-Unis garantissent la sécurité du royaume,
          et l'Arabie Saoudite facture son pétrole en dollars et investit ses excédents
          en bons du Trésor américain.
          Tous les autres pays producteurs suivent rapidement.
        </P>

        <P>
          Les conséquences sont considérables et largement sous-estimées.
          Toute nation qui veut acheter du pétrole doit d'abord obtenir des dollars.
          La demande mondiale de pétrole crée donc mécaniquement une demande mondiale
          de dollars. Ce flux permanent soutient la valeur du dollar et permet
          aux États-Unis de s'endetter à des taux plus bas que n'importe quel autre pays —
          ce que Valéry Giscard d'Estaing avait appelé en 1965, avant même le pétrodollar,
          le "privilège exorbitant" de la monnaie de réserve mondiale.
        </P>

        {/* Schéma du circuit pétrodollar */}
        <div className="my-10 rounded-2xl border border-white/10 bg-white/3 overflow-hidden">
          <div className="px-5 py-3 border-b border-white/10 bg-white/5">
            <div className="text-sm font-bold text-white/80">Le circuit pétrodollar</div>
            <div className="text-xs text-white/40 mt-0.5">Fonctionnement depuis 1973</div>
          </div>
          <div className="p-6">
            <div className="flex flex-col gap-0">
              {[
                { from: 'Japon, Chine, Europe, Inde...', action: 'achètent des dollars pour payer leur pétrole', color: '#4A90A4', arrow: true },
                { from: 'Arabie Saoudite, OPEC', action: 'reçoivent des dollars, les investissent en bons du Trésor US', color: '#C17F24', arrow: true },
                { from: 'États-Unis', action: 'refinancent leur dette à faible coût grâce à cette demande structurelle', color: '#2E7D6B', arrow: true },
                { from: 'Armée américaine', action: 'protège les routes pétrolières — ce qui maintient la demande de dollars', color: '#B85450', arrow: false },
              ].map((s, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ backgroundColor: s.color }} />
                    {s.arrow && <div className="w-px flex-1 bg-white/10 my-0.5 min-h-6" />}
                  </div>
                  <div className="pb-4">
                    <span className="font-bold text-sm" style={{ color: s.color }}>{s.from} </span>
                    <span className="text-sm text-white/65">{s.action}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 p-3 bg-emerald-950/30 border border-emerald-700/30 rounded-lg text-xs text-emerald-300/80">
              La boucle est auto-entretenue — tant que le pétrole se facture en dollars.
            </div>
          </div>
        </div>

        <H2>Ce qui se passerait si le pétrodollar disparaissait</H2>

        <P>
          Les BRICS (Brésil, Russie, Inde, Chine, Afrique du Sud, et depuis 2024 plusieurs
          pays du Golfe) discutent activement de facturer les échanges pétroliers
          en yuan, en monnaie commune, ou en combinaison de monnaies nationales.
          La Russie a déjà basculé une partie de ses ventes vers le yuan après les sanctions
          de 2022. L'Arabie Saoudite a discrètement accepté des paiements en yuan de Chine.
        </P>

        <P>
          Si le pétrodollar s'érode significativement, les conséquences seraient massives :
          la demande structurelle de dollars baisserait, leur valeur avec,
          les taux d'intérêt américains monteraient, et la capacité des États-Unis
          à financer leur dette à coût réduit diminuerait.
          C'est pourquoi Washington surveille avec une extrême attention
          chaque discussion sur la "dédollarisation" — et pourquoi certains analystes
          voient dans les guerres du Moyen-Orient une dimension de défense du pétrodollar
          autant que d'accès aux réserves.
        </P>

        <StatRow>
          <Chiffre val="~$7T" label="échanges pétroliers annuels en dollars" sub="soit ~7% du PIB mondial" />
          <Chiffre val="1973" label="accord Nixon-Faysal" sub="naissance du pétrodollar" />
          <Chiffre val="25%" label="des réserves saoudiennes" sub="investies en bons du Trésor US" />
          <Chiffre val="2022" label="Russia/Chine" sub="premiers échanges en yuan significatifs" />
        </StatRow>

        <Long>
          <P>
            Le paradoxe ultime : si le pétrole décline, le pétrodollar décline avec lui.
            La domination financière américaine est donc liée à la durabilité
            de la demande pétrolière mondiale. Un monde qui consomme moins de pétrole
            est un monde dans lequel les États-Unis ont structurellement moins de pouvoir.
            Certains géopoliticiens pensent que c'est une raison non avouée
            du scepticisme américain historique face à la transition énergétique —
            même si les administrations Biden et Obama ont officiellement soutenu
            les renouvelables, les intérêts militaro-financiers profonds vont dans l'autre sens.
          </P>
          <Anecdote>
            En 2000, Saddam Hussein a annoncé qu'il facturerait le pétrole irakien
            en euros plutôt qu'en dollars. C'était la première rupture officielle
            avec le système pétrodollar depuis 1973.
            En 2003, les États-Unis envahissaient l'Irak.
            Après l'invasion, la facturation est immédiatement repassée en dollars.
            Coïncidence ou causalité — les historiens débattent encore.
          </Anecdote>
        </Long>

        <Sep />

        {/* VIII — SCÉNARIO CATASTROPHE */}
        <ChapterAnchor id="fch-cata" />
        <ChapterLabel n="VIII" label="Scénario extrême" />
        <H2>Le scénario que personne n'écrit officiellement</H2>

        <P>
          Les rapports officiels de l'IEA, de l'EIA et de l'OPEC présentent des scénarios
          ordonnés, progressifs, gérables. Aucun ne décrit ce qui se passe
          si plusieurs facteurs de risque se matérialisent simultanément.
          C'est le travail des think tanks militaires et des services de renseignement —
          dont les rapports sont rarement publics.
          Voici ce que les données disponibles permettent de construire.
        </P>

        {/* Timeline du scénario */}
        <div className="my-10 rounded-2xl border border-red-900/40 bg-red-950/10 overflow-hidden">
          <div className="px-5 py-3 border-b border-red-900/40 bg-red-950/20">
            <div className="text-sm font-bold text-red-300">Scénario de contraction rapide — horizon 2030-2040</div>
            <div className="text-xs text-red-400/60 mt-0.5">Basé sur les données de production disponibles · Hypothèse : peak supply avant peak demand</div>
          </div>
          <div className="p-5 space-y-4">
            {[
              {
                periode: '2026-2028', titre: 'Les signaux d\'alerte',
                contenu: 'La production des vieux gisements conventionnels décline plus vite que prévu. Les nouveaux projets offshore sont retardés par le sous-investissement post-2020. Le shale américain atteint ses limites géologiques dans le Permian. Le baril dépasse durablement 100$.',
                impact: 'Gérable — les économies ajustent, les alternatives accélèrent',
                color: '#C17F24',
                severity: 2,
              },
              {
                periode: '2028-2032', titre: 'La contrainte physique',
                contenu: 'L\'offre mondiale stagne puis décline de 1-2% par an. La demande, elle, continue de croître dans les pays émergents (Inde, Afrique, Asie du Sud-Est). Le baril atteint 150-200$. Le rationnement informel commence dans les pays les plus pauvres. L\'agriculture industrielle sous pression — les engrais azotés deviennent inaccessibles pour beaucoup.',
                impact: 'Tension — pénuries alimentaires localisées, instabilité politique dans les pays importateurs nets',
                color: '#B85450',
                severity: 3,
              },
              {
                periode: '2032-2038', titre: 'La cascade systémique',
                contenu: 'Les États producteurs déficitaires (Venezuela, Nigeria, Algérie) s\'effondrent économiquement. Des dizaines de millions de réfugiés. Les pays riches rationnent officiellement les carburants. Le transport aérien devient un luxe. Les chaînes d\'approvisionnement mondiales se fragmentent. Les plastiques médicaux entrent en pénurie dans les pays émergents.',
                impact: 'Crise majeure — récession mondiale prolongée, tensions militaires autour des ressources restantes',
                color: '#8B1A1A',
                severity: 4,
              },
              {
                periode: '2038+', titre: 'La bifurcation',
                contenu: 'Deux scénarios possibles. Soit la transition s\'est accélérée suffisamment pour compenser — les renouvelables, le nucléaire et l\'efficacité énergétique prennent le relais avant l\'effondrement total. Soit la contraction est trop rapide, le capital manque pour la transition, et on entre dans une contraction économique durable.',
                impact: 'Incertain — dépend des décisions prises dans les 10 prochaines années',
                color: '#4A90A4',
                severity: 2,
              },
            ].map((s, i) => (
              <div key={i} className="rounded-xl border border-white/10 overflow-hidden">
                <div className="px-4 py-2.5 flex items-center gap-3"
                  style={{ backgroundColor: s.color + '20', borderBottom: `1px solid ${s.color}25` }}>
                  <div className="text-xs font-black font-mono" style={{ color: s.color }}>{s.periode}</div>
                  <div className="font-bold text-white text-sm">{s.titre}</div>
                  <div className="ml-auto flex gap-0.5">
                    {[1,2,3,4].map(n => (
                      <div key={n} className="w-2 h-4 rounded-sm"
                        style={{ backgroundColor: n <= s.severity ? s.color : s.color + '25' }} />
                    ))}
                  </div>
                </div>
                <div className="p-4 space-y-2 text-sm">
                  <p className="text-white/65 leading-relaxed">{s.contenu}</p>
                  <div className="flex items-start gap-2 pt-1 text-xs">
                    <span className="text-white/30 uppercase tracking-wide shrink-0">Conséquences</span>
                    <span style={{ color: s.color }}>{s.impact}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <P>
          Ce scénario n'est pas inévitable. Il est plausible — et les probabilités
          qu'il se matérialise partiellement sont suffisamment élevées pour justifier
          qu'on le nomme clairement plutôt que de l'euphémiser.
          La différence entre une transition gérée et une contraction chaotique
          se joue dans les décisions d'investissement des 5 à 10 prochaines années.
          Pas dans 30 ans. Maintenant.
        </P>

        <H2>Ce que les militaires anticipent déjà</H2>

        <P>
          Le Pentagone classe le changement climatique et la raréfaction des ressources
          comme des "multiplicateurs de menace" depuis 2014.
          Le concept est précis : ces facteurs n'engendrent pas directement des conflits,
          mais ils amplifient les tensions existantes — économiques, ethniques,
          frontalières — jusqu'au point de rupture.
          Un rapport de 2019 de l'US Army War College modélisait explicitement
          le scénario d'un "effondrement des systèmes complexes interdépendants"
          dans lequel la raréfaction pétrolière joue un rôle central.
        </P>

        <P>
          Plusieurs armées européennes ont développé des plans de contingence
          pour des scénarios de pénurie énergétique sévère — hiérarchisation
          des usages (hôpitaux, alimentation, défense en priorité),
          réquisition de carburant, limitation des déplacements civils.
          Ces plans existent. Ils ne sont pas publiés parce que leur existence
          serait politiquement explosive — mais plusieurs gouvernements
          les ont confirmés officieusement à des journalistes d'investigation.
        </P>

        <Long>
          <P>
            Le cas le plus documenté est celui de l'Allemagne.
            Le Bundesministerium des Innern a publié en 2016 un "Konzeption Zivile
            Verteidigung" — une stratégie de défense civile qui incluait,
            pour la première fois depuis la Guerre Froide, des instructions aux ménages
            sur la constitution de réserves alimentaires et d'eau pour 10 jours.
            Le document ne mentionnait pas explicitement une pénurie pétrolière,
            mais les experts qui l'ont analysé n'ont eu aucun doute sur sa motivation principale.
          </P>
          <Anecdote>
            En 1973, pendant le premier choc pétrolier, les Pays-Bas ont interdit
            la circulation automobile le dimanche. Les autoroutes hollandaises
            se sont transformées en pistes cyclables et en zones de promenade.
            Des photos de familles pique-niquant sur l'A2 en novembre 1973
            circulent encore. Ce qui semblait impensable la semaine d'avant
            était devenu normal en 72 heures.
            La résilience humaine face aux contraintes énergétiques est plus grande
            qu'on ne le pense — à condition que la contrainte soit équitable et expliquée.
          </Anecdote>
        </Long>

        <Sep />

        {/* Conclusion */}
        <div className="py-8">
          <div className="text-emerald-400/50 text-xs uppercase tracking-widest mb-4">Épilogue</div>
          <H2>La flamme vacille — mais elle brûle encore</H2>

          <P>
            En 1850, on ne pouvait pas imaginer un monde sans baleines.
            Elles éclairaient les maisons, lubrifiaient les machines,
            alimentaient toute une civilisation industrielle naissante.
            Et puis Drake a foré son puits en Pennsylvanie — et en cinquante ans,
            l'industrie baleinière a disparu.
          </P>

          <P>
            Nous sommes peut-être dans une position similaire aujourd'hui —
            incapables d'imaginer un monde sans pétrole parce que nous vivons dedans.
            La différence : l'huile de baleine n'avait pas modifié le climat mondial.
            Elle n'était pas présente dans nos médicaments, nos textiles, nos routes.
            Elle n'alimentait pas l'agriculture de 8 milliards d'êtres humains.
            La substitution sera plus complexe, plus longue, et plus coûteuse.
          </P>

          <P>
            Ce qui est certain : le pétrole ne disparaîtra pas d'un coup.
            Il va décliner — probablement d'abord la demande dans les pays riches,
            puis progressivement ailleurs. Et pendant ce déclin, il y aura des crises,
            des chocs de prix, des tensions géopolitiques exacerbées,
            des États producteurs déstabilisés, et des populations qui découvriront
            que l'énergie bon marché n'était pas un droit naturel mais un heureux accident géologique.
          </P>

          <Quote
            text="We don't run out of oil. We just run out of cheap oil. And that changes everything."
            source="Daniel Yergin, The Prize (1991) — toujours vrai en 2026" />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { to: '/passe', label: 'Acte I', titre: 'Le Passé', sub: 'Des baleines au shale', color: 'border-amber-700/40 hover:border-amber-500/60 text-amber-400' },
              { to: '/present', label: 'Acte II', titre: "Aujourd'hui", sub: "L'empire invisible", color: 'border-blue-700/40 hover:border-blue-500/60 text-blue-400' },
              { to: '/dashboard', label: 'Dashboard', titre: 'Les données', sub: 'Tout vérifier par soi-même', color: 'border-white/20 hover:border-white/40 text-white/60' },
            ].map(l => (
              <Link key={l.to} to={l.to}
                className={`block rounded-2xl border p-5 transition-all ${l.color}`}>
                <div className={`text-xs uppercase tracking-widest mb-1 ${l.color.split(' ')[2]}`}>{l.label}</div>
                <div className="font-bold text-white">{l.titre}</div>
                <div className="text-xs text-white/40 mt-0.5">{l.sub}</div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function FutureStory() {
  return (
    <ReadingModeProvider>
      <FutureContent />
    </ReadingModeProvider>
  );
}

