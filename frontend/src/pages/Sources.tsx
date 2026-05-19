import { useState, useMemo } from 'react';
import { useSources } from '@/hooks/useProduction';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

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

function ScoreBar({ score, label }: { score: number; label: string }) {
  const color = score >= 0.7 ? 'bg-green-500' : score >= 0.5 ? 'bg-amber-500' : score >= 0.3 ? 'bg-orange-500' : 'bg-red-500';
  const textColor = score >= 0.7 ? 'text-green-700' : score >= 0.5 ? 'text-amber-700' : score >= 0.3 ? 'text-orange-700' : 'text-red-700';
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 text-xs text-oil-slate/50 text-right shrink-0">{label}</div>
      <div className="flex-1 h-2 bg-oil-sand rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${score * 100}%` }} />
      </div>
      <div className={`text-xs font-bold w-10 ${textColor}`}>{(score * 100).toFixed(0)}%</div>
    </div>
  );
}

const SOURCES_DETAIL = [
  // ── Officielles ────────────────────────────────────────────────────────────
  {
    id: 'eia', name: 'EIA', full: 'U.S. Energy Information Administration',
    type: 'official', badge: 'bg-green-100 text-green-800 border-green-300',
    scores: { transparency: 0.95, verifiability: 0.90, bias: 0.85, overall: 0.73 },
    created: '1977', coverage: 'Monde — focus USA',
    url: 'https://www.eia.gov', api: 'https://api.eia.gov',
    access: 'API gratuite — clé requise, 5000 req/h',
    frequency: 'Mensuel (délai 2 mois)',
    strengths: ['Données US les plus granulaires (field level)', 'API publique complète', 'Neutralité statutaire garantie par Congrès', 'Série longue 1960-présent'],
    weaknesses: ['Focus US — données internationales moins détaillées', 'Biais possible sur projections (mandat US)', 'Léger délai de publication'],
    bias: 'Minimal. L\'EIA est mandatée d\'être indépendante du Département de l\'Énergie. Historiquement prudente sur les transitions énergétiques.',
    bestFor: 'Production US shale, consommation sectorielle, prix spot, historique long terme',
    status: 'connected',
  },
  {
    id: 'iea', name: 'IEA', full: 'Agence Internationale de l\'Énergie',
    type: 'official', badge: 'bg-blue-100 text-blue-800 border-blue-300',
    scores: { transparency: 0.90, verifiability: 0.85, bias: 0.80, overall: 0.61 },
    created: '1974', coverage: 'OCDE + partenaires (90+ pays)',
    url: 'https://www.iea.org', api: 'https://api.iea.org',
    access: 'Partiel gratuit — accès complet payant',
    frequency: 'Mensuel (OMR) + Annuel (WEO)',
    strengths: ['Méthodologie la plus transparente', 'World Energy Outlook = référence mondiale', 'Très bonne couverture OCDE', 'Scénarios de transition énergétique détaillés'],
    weaknesses: ['Données pays hors OCDE moins fiables', 'Accès complet payant', 'Biais pro-transition cohérent mais mesurable', 'Révisions fréquentes'],
    bias: 'Modéré. L\'IEA est mandatée par les pays de l\'OCDE pour sécuriser l\'approvisionnement énergétique ET accélérer la transition. Net Zero 2050 est un scénario normatif, pas une prévision.',
    bestFor: 'Analyses de politique énergétique, demande mondiale, scénarios transition',
    status: 'connected',
  },
  {
    id: 'opec', name: 'OPEC', full: 'Organisation des Pays Exportateurs de Pétrole',
    type: 'caution', badge: 'bg-red-100 text-red-800 border-red-300',
    scores: { transparency: 0.70, verifiability: 0.60, bias: 0.50, overall: 0.21 },
    created: '1960', coverage: '12 pays membres',
    url: 'https://www.opec.org', api: null,
    access: 'Partiel gratuit — Monthly Oil Market Report public',
    frequency: 'Mensuel (MOMR) + Annuel (WOO)',
    strengths: ['Données déclarations membres en temps réel', 'Informations sur quotas et spare capacity', 'World Oil Outlook = vision des producteurs'],
    weaknesses: ['Auto-déclaration SANS audit externe', 'Manipulation documentée des réserves (1986-1990)', 'Biais structurel fort vers surestimation demande', 'Spare capacity impossible à vérifier'],
    bias: 'Fort. OPEC a un intérêt financier direct à surestimer la demande future (justifie investissements membres) et sous-estimer la vitesse de la transition énergétique. Utiliser comme contre-point, pas comme référence.',
    bestFor: 'Connaître la position politique des membres, quotas, spare capacity déclarée',
    status: 'connected',
  },
  // ── Sectorielles ───────────────────────────────────────────────────────────
  {
    id: 'bp', name: 'BP / Energy Institute', full: 'BP Statistical Review → Energy Institute Statistical Review',
    type: 'sector', badge: 'bg-amber-100 text-amber-800 border-amber-300',
    scores: { transparency: 0.88, verifiability: 0.85, bias: 0.78, overall: 0.58 },
    created: '1951', coverage: 'Monde — 70+ pays',
    url: 'https://www.energyinst.org/statistical-review', api: null,
    access: 'Excel/CSV gratuit — téléchargement annuel',
    frequency: 'Annuel (juin)',
    strengths: ['Série historique la plus longue (1965-2023)', 'Toutes les formes d\'énergie', 'Très utilisé comme référence comparative', 'Depuis 2023 : géré par Energy Institute (plus neutre)'],
    weaknesses: ['Publication annuelle uniquement', 'Biais pétrolier historique (produit par BP)', 'Peu de détail sub-national', 'Pas d\'API — téléchargement manuel'],
    bias: 'Modéré. Historiquement produit par BP (pétrolier), donc biais possible en faveur des combustibles fossiles. Depuis 2023, transféré à l\'Energy Institute ce qui améliore la neutralité.',
    bestFor: 'Historique long terme toutes énergies, comparaisons inter-pays, series back-tested',
    status: 'partial',
  },
  {
    id: 'jodi', name: 'JODI', full: 'Joint Organisations Data Initiative',
    type: 'official', badge: 'bg-teal-100 text-teal-800 border-teal-300',
    scores: { transparency: 0.85, verifiability: 0.88, bias: 0.90, overall: 0.67 },
    created: '2001', coverage: '90+ pays',
    url: 'https://www.jodidata.org', api: 'https://www.jodidata.org/api',
    access: 'API gratuite — inscription requise',
    frequency: 'Mensuel (délai 2-3 mois)',
    strengths: ['Données gouvernementales directes (moins de traitement éditorial)', 'Coopération IEA + EIA + OPEC + autres', 'Couverture 90+ pays', 'Pétrole ET gaz naturel'],
    weaknesses: ['Moins connu, moins documenté', 'Données parfois incomplètes pour certains pays', 'Interface moins ergonomique', 'Délai de publication variable'],
    bias: 'Très faible. Données gouvernementales directes compilées par un consortium d\'organisations. Aucun intérêt commercial dans le résultat.',
    bestFor: 'Validation croisée EIA/IEA, données récentes de pays non-OCDE, pétrole + gaz',
    status: 'planned',
  },
  // ── Commerciales ───────────────────────────────────────────────────────────
  {
    id: 'rystad', name: 'Rystad Energy', full: 'Rystad Energy ASA',
    type: 'commercial', badge: 'bg-purple-100 text-purple-800 border-purple-300',
    scores: { transparency: 0.75, verifiability: 0.80, bias: 0.85, overall: 0.51 },
    created: '2004', coverage: 'Champ par champ — monde entier',
    url: 'https://www.rystadenergy.com', api: null,
    access: 'Payant — abonnement ~500K$/an entreprise',
    frequency: 'Temps réel',
    strengths: ['Données field-by-field les plus granulaires disponibles', 'Réserves 2P/3P estimées indépendamment', 'Coûts marginaux par pays/méthode', 'Modèles de decline curve par puits'],
    weaknesses: ['Coût prohibitif pour accès complet', 'Méthodologie propriétaire peu publiée', 'Dépend de modèles internes non vérifiables', 'Biais possible vers clients pétroliers'],
    bias: 'Faible à modéré. Rystad est commercialement neutre (vend aux pétroliers ET aux investisseurs ESG). Mais méthodologie opaque, impossible à auditer.',
    bestFor: 'Réserves 2P/3P, coûts marginaux, analyse compétitivité de champs, M&A upstream',
    status: 'planned',
  },
  {
    id: 'wood_mac', name: 'Wood Mackenzie', full: 'Wood Mackenzie Ltd.',
    type: 'commercial', badge: 'bg-orange-100 text-orange-800 border-orange-300',
    scores: { transparency: 0.72, verifiability: 0.78, bias: 0.82, overall: 0.46 },
    created: '1973', coverage: 'Monde — upstream + aval',
    url: 'https://www.woodmac.com', api: null,
    access: 'Payant — abonnement modulaire',
    frequency: 'Mensuel / Temps réel selon module',
    strengths: ['Expertise réservoirs très reconnue', 'Couverture aval (raffinage, pétrochimie)', 'Analyses M&A et évaluation actifs', 'Scénarios macro-énergie'],
    weaknesses: ['Très coûteux', 'Méthodologie peu transparente', 'Données propriétaires difficiles à vérifier', 'Biais possible vers secteur oil & gas'],
    bias: 'Faible à modéré. Principal client : secteur oil & gas. Mais publie aussi pour institutionnels et fonds ESG, ce qui limite le biais.',
    bestFor: 'Évaluation actifs upstream, coûts de développement, analyses M&A, raffinage',
    status: 'planned',
  },
  {
    id: 'sp_global', name: 'S&P Global Commodity Insights', full: 'S&P Global Platts (rebrandé en 2022)',
    type: 'commercial', badge: 'bg-slate-100 text-slate-800 border-slate-300',
    scores: { transparency: 0.78, verifiability: 0.80, bias: 0.80, overall: 0.50 },
    created: '1909 (Platts)', coverage: 'Monde — marchés commodités',
    url: 'https://www.spglobal.com/commodityinsights', api: null,
    access: 'Payant — séries gratuites limitées disponibles',
    frequency: 'Temps réel (prix), mensuel (fondamentaux)',
    strengths: ['Prix Dated Brent = référence mondiale', 'Données de flux maritimes (Kpler)', 'Agrégats marché très réactifs', 'Couverture marchés dérivés'],
    weaknesses: ['Focus marchés financiers > physiques', 'Très coûteux pour accès complet', 'Moins bon sur données fondamentales long terme'],
    bias: 'Faible. S&P Global est une agence de notation/données avec des clients diversifiés (producteurs, traders, investisseurs). Conflit d\'intérêt limité.',
    bestFor: 'Prix spot et forward, flux commerciaux maritimes, spreads entre benchmarks',
    status: 'planned',
  },
];

const TYPE_LABELS = {
  official: 'Officielle',
  sector: 'Sectorielle',
  commercial: 'Commerciale',
  caution: 'Précaution',
};

const STATUS_CONFIG = {
  connected: { label: '✅ Intégrée', color: 'bg-green-100 text-green-800 border-green-300' },
  partial: { label: '⚡ Partielle', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  planned: { label: '🔄 Prévue', color: 'bg-slate-100 text-slate-800 border-slate-300' },
};

// ── Comparaison production par source ────────────────────────────────────────
const COMPARISON_DATA = [
  { country:'USA',  name:'États-Unis',      EIA:19.5, IEA:19.2, OPEC:19.4, BP:18.9, flag:'blue' },
  { country:'SAU',  name:'Arabie Saoudite', EIA:10.2, IEA:10.0, OPEC:10.3, BP:10.1, flag: null },
  { country:'RUS',  name:'Russie',          EIA:9.8,  IEA:9.5,  OPEC:11.2, BP:10.7, flag:'red'  },
  { country:'CAN',  name:'Canada',          EIA:5.7,  IEA:5.6,  OPEC:5.8,  BP:5.7,  flag:'blue' },
  { country:'IRQ',  name:'Iraq',            EIA:4.6,  IEA:4.5,  OPEC:4.7,  BP:4.5,  flag: null },
  { country:'IRN',  name:'Iran',            EIA:3.2,  IEA:3.1,  OPEC:4.0,  BP:3.5,  flag:'red'  },
  { country:'ARE',  name:'UAE',             EIA:3.9,  IEA:3.9,  OPEC:4.0,  BP:3.9,  flag: null },
  { country:'BRA',  name:'Brésil',          EIA:3.4,  IEA:3.3,  OPEC:3.4,  BP:3.4,  flag: null },
  { country:'KWT',  name:'Koweït',          EIA:2.8,  IEA:2.7,  OPEC:2.9,  BP:2.8,  flag: null },
  { country:'NOR',  name:'Norvège',         EIA:1.9,  IEA:1.8,  OPEC:1.9,  BP:1.9,  flag: null },
];

const SRC_COLORS: Record<string, string> = {
  EIA: '#2C3E50', IEA: '#4A90A4', OPEC: '#B85450', BP: '#C17F24'
};

function SourceProductionComparison() {
  const compData = useMemo(() => COMPARISON_DATA.map(d => {
    const vals = [d.EIA, d.IEA, d.OPEC, d.BP];
    const avg = vals.reduce((a, b) => a + b) / vals.length;
    const max = Math.max(...vals);
    const min = Math.min(...vals);
    return { ...d, avg, ecartAbs: max - min, ecartPct: (max - min) / avg * 100 };
  }), []);

  const maxEcart = Math.max(...compData.map(d => d.ecartPct));

  return (
    <div className="space-y-4">
      <p className="text-xs text-oil-slate/60 leading-relaxed">
        Pour chaque pays, 4 barres représentent la valeur déclarée par chaque source.
        L'écart entre barres = divergence. <strong className="text-oil-rust">Rouge</strong> = divergence politique (Russie, Iran — sanctions).
      </p>

      <div className="overflow-x-auto rounded-lg border border-oil-sand-dark">
        <table className="w-full text-xs">
          <thead className="bg-oil-sand-light border-b border-oil-sand-dark">
            <tr>
              <th className="text-left py-2.5 px-3 font-semibold text-oil-slate/60 uppercase">Pays</th>
              <th className="text-left py-2.5 px-3 font-semibold text-oil-slate/60 uppercase" colSpan={4}>Valeur par source (mb/d)</th>
              <th className="text-right py-2.5 px-3 font-semibold text-oil-slate/60 uppercase">Écart</th>
              <th className="text-right py-2.5 px-3 font-semibold text-oil-slate/60 uppercase">%</th>
              <th className="text-left py-2.5 px-3 font-semibold text-oil-slate/60 uppercase">Alerte</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-oil-sand-dark/40 bg-white">
            {compData.map(d => {
              const maxAll = Math.max(d.EIA, d.IEA, d.OPEC, d.BP);
              const pctColor = d.ecartPct > 10 ? 'text-oil-rust font-bold' : d.ecartPct > 5 ? 'text-amber-600 font-semibold' : 'text-green-700';
              return (
                <tr key={d.country} className="hover:bg-oil-sand-light/40">
                  <td className="py-3 px-3 font-bold text-oil-slate w-36">
                    {d.name}
                    <div className="text-xs text-oil-slate/40 font-normal">{d.country}</div>
                  </td>
                  <td className="py-2 px-3" colSpan={4}>
                    <div className="space-y-1.5">
                      {(['EIA','IEA','OPEC','BP'] as const).map(src => {
                        const val = d[src];
                        const pct = (val / maxAll) * 100;
                        const isOutlier = (src === 'OPEC') && d.ecartPct > 8;
                        return (
                          <div key={src} className="flex items-center gap-2">
                            <div className="w-8 text-xs font-bold text-oil-slate/50 text-right shrink-0">{src}</div>
                            <div className="flex-1 h-5 bg-oil-sand rounded overflow-hidden">
                              <div className="h-full rounded flex items-center" style={{ width: `${pct}%`, backgroundColor: isOutlier ? '#B85450' : SRC_COLORS[src] }}>
                                <span className="text-white text-xs font-bold ml-2 whitespace-nowrap">{val.toFixed(1)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </td>
                  <td className={`py-3 px-3 text-right font-mono font-bold ${d.ecartPct > 10 ? 'text-oil-rust' : 'text-oil-slate'}`}>
                    {d.ecartAbs.toFixed(2)}
                  </td>
                  <td className={`py-3 px-3 text-right font-mono ${pctColor}`}>{d.ecartPct.toFixed(1)}%</td>
                  <td className="py-3 px-3">
                    {d.flag === 'red' && <span className="text-oil-rust font-semibold">⚠ Politique</span>}
                    {d.flag === 'blue' && <span className="text-blue-600">◈ Définitionnel</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Amplitude synthèse */}
      <div>
        <div className="text-xs font-bold text-oil-slate uppercase mb-2">Amplitude des écarts</div>
        <div className="space-y-1.5">
          {[...compData].sort((a, b) => b.ecartPct - a.ecartPct).map(d => {
            const w = (d.ecartPct / maxEcart) * 100;
            const col = d.ecartPct > 10 ? 'bg-oil-rust' : d.ecartPct > 5 ? 'bg-amber-500' : 'bg-green-500';
            return (
              <div key={d.country} className="flex items-center gap-2 text-xs">
                <div className="w-28 text-right text-oil-slate/60 shrink-0">{d.name}</div>
                <div className="flex-1 h-4 bg-oil-sand rounded overflow-hidden">
                  <div className={`h-full ${col} rounded flex items-center justify-end pr-1`}
                    style={{ width: `${Math.max(w, 2)}%` }}>
                    <span className="text-white font-bold" style={{ fontSize: 9 }}>{d.ecartPct.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 leading-relaxed">
        <strong>Russie et Iran</strong> : divergences &gt;10% dues aux sanctions. EIA/IEA estiment via tanker tracking —
        OPEC relaie les chiffres officiels.
      </div>
    </div>
  );
}

export default function Sources() {
  const { data: sourcesData } = useSources();
  const [expanded, setExpanded] = useState<string | null>('eia');

  return (
    <div className="min-h-screen bg-oil-sand-light">
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">

        {/* Intro */}
        <Section title="Méthodologie des sources" subtitle="Comprendre avant d'interpréter — score T×V×A, biais structurels, périmètre">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {[
              {
                letter: 'T', name: 'Transparence', color: 'text-blue-600 border-blue-300 bg-blue-50',
                desc: 'Les hypothèses et la méthodologie sont-elles publiées ? Peut-on reproduire les calculs ?',
              },
              {
                letter: 'V', name: 'Vérifiabilité', color: 'text-green-700 border-green-300 bg-green-50',
                desc: 'Les données peuvent-elles être auditées par un tiers indépendant ? Existe-t-il une source primaire vérifiable ?',
              },
              {
                letter: 'A', name: 'Absence de biais', color: 'text-amber-700 border-amber-300 bg-amber-50',
                desc: 'Le producteur a-t-il un intérêt financier ou politique dans le résultat ? Ses revenus dépendent-ils des conclusions ?',
              },
            ].map(c => (
              <div key={c.letter} className={`border rounded-xl p-4 ${c.color}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center font-black text-xl" style={{ borderColor: 'currentColor' }}>
                    {c.letter}
                  </div>
                  <div className="font-bold text-base">{c.name}</div>
                </div>
                <p className="text-xs leading-relaxed opacity-80">{c.desc}</p>
              </div>
            ))}
          </div>
          <div className="bg-oil-sand-light rounded-lg p-3 border border-oil-sand-dark text-xs text-oil-slate/70 leading-relaxed">
            <strong className="text-oil-slate">Score global = T × V × A.</strong> Un score parfait (1.0) n'existe pas.
            La multiplication amplifie les faiblesses : une source avec T=0.95, V=0.90, A=0.50 obtient 0.43 — la mauvaise absence de biais
            tire tout le score vers le bas. Un score &gt;0.60 indique une source primaire fiable.
            Entre 0.40 et 0.60 : utiliser avec context. En dessous de 0.30 : précaution forte.
          </div>
        </Section>

        {/* Tableau comparatif */}
        <Section title="Vue d'ensemble comparative" subtitle="8 sources — de la plus à la moins fiable">
          <div className="overflow-x-auto rounded-lg border border-oil-sand-dark">
            <table className="w-full text-xs">
              <thead className="bg-oil-slate text-oil-sand">
                <tr>
                  <th className="text-left px-3 py-2.5 font-semibold uppercase tracking-wide">Source</th>
                  <th className="text-left px-3 py-2.5 font-semibold uppercase tracking-wide">Type</th>
                  <th className="text-center px-3 py-2.5 font-semibold uppercase tracking-wide">T</th>
                  <th className="text-center px-3 py-2.5 font-semibold uppercase tracking-wide">V</th>
                  <th className="text-center px-3 py-2.5 font-semibold uppercase tracking-wide">A</th>
                  <th className="text-left px-3 py-2.5 font-semibold uppercase tracking-wide w-32">Score T×V×A</th>
                  <th className="text-center px-3 py-2.5 font-semibold uppercase tracking-wide">Accès</th>
                  <th className="text-center px-3 py-2.5 font-semibold uppercase tracking-wide">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-oil-sand-dark bg-white">
                {SOURCES_DETAIL
                  .sort((a, b) => b.scores.overall - a.scores.overall)
                  .map(s => {
                    const overall = s.scores.overall;
                    const barColor = overall >= 0.6 ? 'bg-green-500' : overall >= 0.4 ? 'bg-amber-500' : 'bg-red-500';
                    const textColor = overall >= 0.6 ? 'text-green-700' : overall >= 0.4 ? 'text-amber-700' : 'text-red-700';
                    const status = STATUS_CONFIG[s.status as keyof typeof STATUS_CONFIG];
                    return (
                      <tr key={s.id}
                        className="hover:bg-oil-sand-light/50 cursor-pointer transition-colors"
                        onClick={() => setExpanded(expanded === s.id ? null : s.id)}>
                        <td className="px-3 py-2.5 font-bold text-oil-slate">{s.name}</td>
                        <td className="px-3 py-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${s.badge}`}>
                            {TYPE_LABELS[s.type as keyof typeof TYPE_LABELS]}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center font-mono text-oil-slate">{(s.scores.transparency*100).toFixed(0)}%</td>
                        <td className="px-3 py-2.5 text-center font-mono text-oil-slate">{(s.scores.verifiability*100).toFixed(0)}%</td>
                        <td className="px-3 py-2.5 text-center font-mono text-oil-slate">{(s.scores.bias*100).toFixed(0)}%</td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-oil-sand rounded-full overflow-hidden">
                              <div className={`h-full ${barColor} rounded-full`} style={{ width: `${overall * 100}%` }} />
                            </div>
                            <span className={`font-bold font-mono text-xs ${textColor}`}>{(overall*100).toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-center text-oil-slate/60">{s.access.split('—')[0].trim()}</td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-oil-slate/40 mt-2">Cliquer sur une ligne pour voir le détail complet</p>
        </Section>

        {/* Fiches détaillées */}
        <Section title="Fiches sources détaillées" subtitle="Cliquer pour déplier — forces, faiblesses, biais, accès">
          <div className="space-y-3">
            {SOURCES_DETAIL.map(s => {
              const isOpen = expanded === s.id;
              return (
                <div key={s.id} className="border border-oil-sand-dark rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpanded(isOpen ? null : s.id)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-oil-sand-light/50 transition text-left">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${s.badge}`}>
                        {s.name}
                      </span>
                      <span className="text-sm text-oil-slate/60">{s.full}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${STATUS_CONFIG[s.status as keyof typeof STATUS_CONFIG].color}`}>
                        {STATUS_CONFIG[s.status as keyof typeof STATUS_CONFIG].label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-oil-slate/50">{(s.scores.overall*100).toFixed(0)}%</span>
                      {isOpen ? <ChevronUp size={16} className="text-oil-slate/40" /> : <ChevronDown size={16} className="text-oil-slate/40" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 border-t border-oil-sand-dark bg-oil-sand-light/30">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {/* Scores */}
                        <div className="space-y-2">
                          <div className="text-xs font-bold text-oil-slate uppercase mb-2">Score T×V×A</div>
                          <ScoreBar score={s.scores.transparency} label="Transparence" />
                          <ScoreBar score={s.scores.verifiability} label="Vérifiabilité" />
                          <ScoreBar score={s.scores.bias} label="Abs. biais" />
                          <div className="border-t border-oil-sand-dark pt-2 mt-2">
                            <ScoreBar score={s.scores.overall} label="Global" />
                          </div>
                        </div>

                        {/* Infos pratiques */}
                        <div className="text-xs space-y-2">
                          <div className="text-xs font-bold text-oil-slate uppercase mb-2">Informations pratiques</div>
                          <div><span className="font-semibold text-oil-slate/60">Créé :</span> <span className="text-oil-slate">{s.created}</span></div>
                          <div><span className="font-semibold text-oil-slate/60">Couverture :</span> <span className="text-oil-slate">{s.coverage}</span></div>
                          <div><span className="font-semibold text-oil-slate/60">Fréquence :</span> <span className="text-oil-slate">{s.frequency}</span></div>
                          <div><span className="font-semibold text-oil-slate/60">Accès :</span> <span className="text-oil-slate">{s.access}</span></div>
                          {s.url && (
                            <div>
                              <a href={s.url} target="_blank" rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                <ExternalLink size={11} /> {s.url}
                              </a>
                            </div>
                          )}
                          {s.api && (
                            <div>
                              <a href={s.api} target="_blank" rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                <ExternalLink size={11} /> API: {s.api}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Forces / Faiblesses / Biais */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                          <div className="text-xs font-bold text-green-800 uppercase mb-2">Forces</div>
                          <ul className="space-y-1">
                            {s.strengths.map((st, i) => (
                              <li key={i} className="text-xs text-green-700 flex gap-1.5">
                                <span className="shrink-0 mt-0.5">+</span><span>{st}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                          <div className="text-xs font-bold text-amber-800 uppercase mb-2">Faiblesses</div>
                          <ul className="space-y-1">
                            {s.weaknesses.map((w, i) => (
                              <li key={i} className="text-xs text-amber-700 flex gap-1.5">
                                <span className="shrink-0 mt-0.5">−</span><span>{w}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className={`rounded-lg p-3 border ${
                          s.type === 'caution' ? 'bg-red-50 border-red-200' :
                          s.scores.bias < 0.5 ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'
                        }`}>
                          <div className={`text-xs font-bold uppercase mb-2 ${
                            s.type === 'caution' ? 'text-red-800' :
                            s.scores.bias < 0.5 ? 'text-orange-800' : 'text-blue-800'
                          }`}>Biais documenté</div>
                          <p className={`text-xs leading-relaxed ${
                            s.type === 'caution' ? 'text-red-700' :
                            s.scores.bias < 0.5 ? 'text-orange-700' : 'text-blue-700'
                          }`}>{s.bias}</p>
                        </div>
                      </div>

                      <div className="mt-3 p-2.5 bg-white rounded border border-oil-sand-dark">
                        <span className="text-xs font-bold text-oil-slate">Meilleur usage : </span>
                        <span className="text-xs text-oil-slate/70">{s.bestFor}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Section>

        {/* ── COMPARAISON SOURCES — PRODUCTION ──────────────────────── */}
        <Section title="Divergences entre sources — 10 plus gros producteurs (2023)" subtitle="EIA · IEA · OPEC · BP · Écart absolu et relatif">
          <SourceProductionComparison />
        </Section>

        {/* Feuille de route */}
        <Section title="Feuille de route d'intégration" defaultOpen={false}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-oil-slate/70">
            {[
              { phase: 'Phase 1 — Intégrées', sources: ['EIA (production, prix)', 'IEA (projections demande)', 'OPEC (projections demande)', 'BP Statistical Review (historique 1965-2023)'], color: 'border-green-400 bg-green-50' },
              { phase: 'Phase 2 — En cours', sources: ['JODI (production mensuelle 90+ pays)', 'World Bank (prix historiques, macroéco)', 'BP complet (toutes énergies)'], color: 'border-amber-400 bg-amber-50' },
              { phase: 'Phase 3 — Prévues', sources: ['Rystad (réserves 2P/3P, coûts)', 'Wood Mackenzie (actifs upstream)', 'S&P Global (prix spot, flux maritimes)', 'JODI Gaz (gaz naturel)'], color: 'border-slate-300 bg-slate-50' },
            ].map(p => (
              <div key={p.phase} className={`rounded-xl border-2 ${p.color} p-4`}>
                <div className="font-bold text-oil-slate mb-2">{p.phase}</div>
                <ul className="space-y-1">
                  {p.sources.map((s, i) => (
                    <li key={i} className="flex gap-1.5 text-oil-slate/70">
                      <span className="shrink-0">→</span><span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

      </div>
    </div>
  );
}
