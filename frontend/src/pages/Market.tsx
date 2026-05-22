import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine, Scatter, ScatterChart
} from 'recharts';
import { GRID_STYLE, AXIS_STYLE } from '@/utils/chartColors';
import { ChevronDown, ChevronUp, AlertCircle, RefreshCw } from 'lucide-react';

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

// ── Couleurs par type événement ───────────────────────────────────────────────
const EVENT_TYPE_CONFIG: Record<string, { color: string; label: string; icon: string }> = {
  geopolitical: { color: '#B85450', label: 'Géopolitique',   icon: '🌍' },
  conflict:     { color: '#8B1A1A', label: 'Conflit',        icon: '⚔️' },
  sanctions:    { color: '#C17F24', label: 'Sanctions',      icon: '🚫' },
  supply:       { color: '#2C3E50', label: 'Offre',          icon: '🛢️' },
  demand:       { color: '#4A90A4', label: 'Demande',        icon: '📈' },
  price:        { color: '#8B4513', label: 'Prix',           icon: '💲' },
  policy:       { color: '#6B8E6B', label: 'Politique',      icon: '🏛️' },
  discovery:    { color: '#2E7D6B', label: 'Découverte',     icon: '🔍' },
};

const IMPACT_CONFIG: Record<string, { color: string; bg: string }> = {
  high:   { color: '#B85450', bg: '#fde8e8' },
  medium: { color: '#C17F24', bg: '#fef3e8' },
  low:    { color: '#6B8E6B', bg: '#e8f5ef' },
};

const DIRECTION_ICON: Record<string, string> = {
  bullish: '↑', bearish: '↓', neutral: '→'
};
const DIRECTION_COLOR: Record<string, string> = {
  bullish: 'text-oil-rust', bearish: 'text-blue-600', neutral: 'text-oil-slate/50'
};

// ── Hooks API ─────────────────────────────────────────────────────────────────
function useLatestSnapshot() {
  return useQuery({
    queryKey: ['market-latest'],
    queryFn: () => fetch('/data/market_latest.json').then(r => r.json()),
    staleTime: 60 * 60 * 1000,
    retry: false,
  });
}

function usePriceHistory(weeks = 26) {
  return useQuery({
    queryKey: ['market-price-history', weeks],
    queryFn: () => fetch('/data/market_price_history.json').then(r => r.json()).then(d => d.slice(-weeks)),
    staleTime: 60 * 60 * 1000,
    retry: false,
  });
}

function useEventsTimeline(weeks = 26) {
  return useQuery({
    queryKey: ['market-events-timeline', weeks],
    queryFn: () => fetch('/data/events.json').then(r => r.json()).then(evs => { const byWeek: Record<string, any[]> = {}; evs.forEach((e: any) => { const wk = e.event_date?.slice(0,7) || 'unknown'; if (!byWeek[wk]) byWeek[wk] = []; byWeek[wk].push({date: e.event_date, title: e.title, type: e.event_type, region: e.region, impact: e.impact, direction: e.impact_direction, price_impact: e.estimated_price_impact}); }); return Object.entries(byWeek).map(([week, events]) => ({week, events})); }),
    staleTime: 60 * 60 * 1000,
    retry: false,
  });
}

function useAllEvents(weeks = 26) {
  return useQuery({
    queryKey: ['market-events', weeks],
    queryFn: () => fetch('/data/events.json').then(r => r.json()),
    staleTime: 60 * 60 * 1000,
    retry: false,
  });
}

// ── Composant principal ───────────────────────────────────────────────────────
function useGasolineLatest() {
  return useQuery({
    queryKey: ['gasoline-latest'],
    queryFn: (): Promise<any[]> => Promise.resolve([]),
    staleTime: 60 * 60 * 1000,
    retry: false,
  });
}

const REGION_ORDER = ['europe','north_america','middle_east','asia','latin_america','africa','former_ussr'];
const REGION_LABELS: Record<string, string> = {
  europe: 'Europe', north_america: 'Amérique du Nord',
  middle_east: 'Moyen-Orient', asia: 'Asie',
  latin_america: 'Amérique Latine', africa: 'Afrique',
  former_ussr: 'Ex-URSS / Russie',
};

function priceColor(price: number): string {
  if (price <= 0.10) return 'bg-red-200 text-red-900';   // subventionné (Venezuela, Iran)
  if (price <= 0.50) return 'bg-amber-100 text-amber-900'; // très bas (Golfe)
  if (price <= 1.00) return 'bg-yellow-50 text-yellow-800'; // bas (USA, émergents)
  if (price <= 1.40) return 'bg-green-50 text-green-800';   // moyen
  if (price <= 1.80) return 'bg-blue-50 text-blue-800';     // élevé (Europe)
  return 'bg-purple-50 text-purple-800';                    // très élevé (Norvège, CH)
}

function GasolineWorldMap() {
  const { data: prices, isLoading } = useGasolineLatest();
  const [metric, setMetric] = useState<'gasoline' | 'diesel'>('gasoline');

  const byRegion = useMemo(() => {
    if (!prices?.length) return {};
    const grouped: Record<string, any[]> = {};
    prices.forEach((p: any) => {
      const r = p.region ?? 'other';
      if (!grouped[r]) grouped[r] = [];
      grouped[r].push(p);
    });
    Object.keys(grouped).forEach(r => {
      grouped[r].sort((a: any, b: any) =>
        (b[metric === 'gasoline' ? 'gasoline_usd' : 'diesel_usd'] ?? 0) -
        (a[metric === 'gasoline' ? 'gasoline_usd' : 'diesel_usd'] ?? 0)
      );
    });
    return grouped;
  }, [prices, metric]);

  if (isLoading) return <div className="h-32 flex items-center justify-center text-oil-slate/50">Chargement...</div>;

  if (!prices?.length) return (
    <div className="h-32 flex flex-col items-center justify-center text-oil-slate/50 gap-2">
      <p className="text-sm">Données non importées</p>
      <code className="text-xs bg-oil-sand px-2 py-1 rounded">
        docker exec "oil-backend" python scripts/import_gasoline_prices.py
      </code>
    </div>
  );

  const allPrices = prices.map((p: any) => p[metric === 'gasoline' ? 'gasoline_usd' : 'diesel_usd']).filter(Boolean);
  const maxPrice = Math.max(...allPrices);

  return (
    <div>
      {/* Toggle */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex gap-1 p-1 bg-oil-sand rounded-lg border border-oil-sand-dark">
          {(['gasoline','diesel'] as const).map(m => (
            <button key={m} onClick={() => setMetric(m)}
              className={`px-4 py-1.5 rounded text-xs font-bold transition ${
                metric === m ? 'bg-oil-slate text-white' : 'text-oil-slate/60 hover:text-oil-slate'
              }`}>
              {m === 'gasoline' ? 'Essence' : 'Diesel'}
            </button>
          ))}
        </div>
        <span className="text-xs text-oil-slate/50">
          USD/litre · Source : EU Commission + EIA ·{' '}
          {prices?.length > 0
            ? <span className="font-semibold text-oil-slate/70">Données du {new Date(prices[0].date).toLocaleDateString('fr-FR', {day:'numeric',month:'long',year:'numeric'})}</span>
            : 'Données de référence'}
        </span>
      </div>

      {/* Grille par région */}
      <div className="space-y-5">
        {REGION_ORDER.filter(r => byRegion[r]?.length).map(region => (
          <div key={region}>
            <div className="text-xs font-bold text-oil-slate uppercase tracking-wide mb-2">
              {REGION_LABELS[region]}
            </div>
            <div className="flex flex-wrap gap-2">
              {byRegion[region].map((p: any) => {
                const val = p[metric === 'gasoline' ? 'gasoline_usd' : 'diesel_usd'];
                const barW = val && maxPrice ? (val / maxPrice) * 100 : 0;
                return (
                  <div key={p.country_code}
                    className={`rounded-lg border border-oil-sand-dark px-3 py-2 min-w-32 ${priceColor(val ?? 0)}`}>
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <span className="text-xs font-bold">{p.country_name}</span>
                      <span className="text-sm font-black">
                        {val ? `$${val.toFixed(3)}` : '—'}
                      </span>
                    </div>
                    {/* Mini barre */}
                    <div className="h-1 bg-black/10 rounded-full overflow-hidden">
                      <div className="h-full bg-current opacity-40 rounded-full"
                        style={{ width: `${barW}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Légende */}
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {[
          { label: '≤ $0.10 — Subventionné', cls: 'bg-red-200 text-red-900' },
          { label: '≤ $0.50 — Très bas', cls: 'bg-amber-100 text-amber-900' },
          { label: '≤ $1.00 — Bas', cls: 'bg-yellow-50 text-yellow-800' },
          { label: '≤ $1.40 — Moyen', cls: 'bg-green-50 text-green-800' },
          { label: '≤ $1.80 — Élevé', cls: 'bg-blue-50 text-blue-800' },
          { label: '> $1.80 — Très élevé', cls: 'bg-purple-50 text-purple-800' },
        ].map(l => (
          <span key={l.label} className={`px-2 py-1 rounded border border-current/20 ${l.cls}`}>
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Market() {
  const [priceWeeks, setPriceWeeks] = useState(26);
  const [eventFilter, setEventFilter] = useState<string | null>(null);

  const { data: latest, isLoading: latestLoading, error: latestError, refetch } = useLatestSnapshot();
  const { data: priceHistory } = usePriceHistory(priceWeeks);
  const { data: timeline } = useEventsTimeline(priceWeeks);
  const { data: allEvents } = useAllEvents(priceWeeks);

  // Fusionner prix + événements pour overlay sur graphique
  const chartDataWithEvents = useMemo(() => {
    if (!priceHistory) return [];
    const eventsByWeek: Record<string, any[]> = {};
    (timeline ?? []).forEach((wk: any) => {
      const high = wk.events?.filter((e: any) => e.impact === 'high') ?? [];
      if (high.length) eventsByWeek[wk.week] = high;
    });
    return priceHistory.map((pt: any) => ({
      ...pt,
      hasEvent: !!eventsByWeek[pt.week],
      eventCount: eventsByWeek[pt.week]?.length ?? 0,
    }));
  }, [priceHistory, timeline]);

  const noData = !latestLoading && (latestError || !latest || latest?.error);

  return (
    <div className="min-h-screen bg-oil-sand-light">
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">

        {/* ── BANNER si pas de données ───────────────────────────────── */}
        {noData && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="w-full">
                <div className="font-bold text-amber-800 mb-1">
                  Aucune donnée marché disponible
                </div>
                <p className="text-xs text-amber-700 mb-3 leading-relaxed">
                  Les tables de données marché doivent être initialisées, puis le pipeline exécuté.
                </p>
                <div className="space-y-2 text-xs font-mono bg-white rounded p-3 border border-amber-200">
                  <div className="text-amber-600 font-bold"># Étape 1 — Créer les tables</div>
                  <div className="text-gray-700">docker exec "oil-backend" python full_init.py</div>
                  <div className="text-amber-600 font-bold mt-2"># Étape 2 — Importer prix pompe de référence</div>
                  <div className="text-gray-700">docker exec "oil-backend" python -c "
import sys; sys.path.append('/app')
from datetime import date
from decimal import Decimal
from app.database.connection import SessionLocal
from app.database.models import GasolinePrices
PRICES = [('NOR','Norvège','europe',2.12,1.94),('DEU','Allemagne','europe',1.78,1.61),('FRA','France','europe',1.74,1.62),('GBR','R.-Uni','europe',1.65,1.59),('ESP','Espagne','europe',1.52,1.44),('USA','États-Unis','north_america',0.96,1.02),('SAU','Arabie Saoudite','middle_east',0.24,0.16),('IRN','Iran','middle_east',0.04,0.04),('CHN','Chine','asia',1.15,1.08),('JPN','Japon','asia',1.42,1.35),('BRA','Brésil','latin_america',1.18,1.04),('NGA','Nigeria','africa',0.43,0.39),('RUS','Russie','former_ussr',0.64,0.72)]
db=SessionLocal()
[db.add(GasolinePrices(date=date(2024,11,1),country_code=c,country_name=n,region=r,gasoline_price_usd=Decimal(str(g)),diesel_price_usd=Decimal(str(d)),source='ref')) for c,n,r,g,d in PRICES]
db.commit();print('OK')"</div>
                  <div className="text-amber-600 font-bold mt-2"># Étape 3 — Pipeline marché (prix + événements)</div>
                  <div className="text-gray-700">docker exec "oil-backend" python scripts/weekly_market_update.py</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SNAPSHOT DERNIÈRE SEMAINE ──────────────────────────────── */}
        <Section title="Situation cette semaine" subtitle={latest?.week_start ? `Semaine du ${latest.week_start}` : 'En attente de données'}>
          {latestLoading ? (
            <div className="h-20 flex items-center justify-center text-oil-slate/50">Chargement...</div>
          ) : latest && !latest.error ? (
            <>
              {/* Prix bruts */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  {
                    label: 'Brent', val: latest.brent_price,
                    change: latest.brent_change_1w, unit: '$/b',
                    color: '#B85450'
                  },
                  {
                    label: 'WTI', val: latest.wti_price,
                    change: null, unit: '$/b',
                    color: '#C17F24'
                  },
                  {
                    label: 'Essence EU', val: latest.gasoline_eu_avg,
                    change: null, unit: 'USD/L',
                    color: '#4A90A4'
                  },
                  {
                    label: 'Essence USA', val: latest.gasoline_usa,
                    change: null, unit: 'USD/L',
                    color: '#2C3E50'
                  },
                ].map(s => (
                  <div key={s.label} className="bg-oil-sand-light rounded-xl p-4 border border-oil-sand-dark text-center">
                    <div className="text-xs text-oil-slate/50 uppercase font-semibold mb-1">{s.label}</div>
                    <div className="text-2xl font-black" style={{ color: s.color }}>
                      {s.val ? `${Number(s.val).toFixed(2)}` : '—'}
                    </div>
                    <div className="text-xs text-oil-slate/40">{s.unit}</div>
                    {s.change !== null && s.change !== undefined && (
                      <div className={`text-xs font-bold mt-1 ${Number(s.change) > 0 ? 'text-oil-rust' : 'text-blue-600'}`}>
                        {Number(s.change) > 0 ? '↑' : '↓'} {Math.abs(Number(s.change)).toFixed(1)}% / sem.
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Indicateurs macro */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'Baltic Dry Index', val: latest.baltic_dry_index, unit: '' },
                  { label: 'USD Index', val: latest.usd_index, unit: '' },
                  {
                    label: 'Détroit d\'Ormuz',
                    val: latest.macro_indicators?.ormuz_status,
                    unit: '',
                    isText: true
                  },
                ].map(s => (
                  <div key={s.label} className="bg-oil-sand-light rounded-lg p-3 border border-oil-sand-dark text-center">
                    <div className="text-xs text-oil-slate/50 uppercase font-semibold mb-1">{s.label}</div>
                    {s.isText ? (
                      <div className={`text-sm font-bold ${
                        s.val === 'critical' ? 'text-red-700' :
                        s.val === 'elevated' ? 'text-orange-600' :
                        s.val === 'blocked' ? 'text-red-900' : 'text-green-700'
                      }`}>
                        {s.val === 'normal' ? '✅ Normal' :
                         s.val === 'elevated' ? '⚠️ Tensions' :
                         s.val === 'critical' ? '🚨 Critique' :
                         s.val === 'blocked' ? '🔴 Bloqué' : s.val ?? '—'}
                      </div>
                    ) : (
                      <div className="text-lg font-bold text-oil-slate">
                        {s.val ? Number(s.val).toFixed(1) : '—'}
                        {s.unit && <span className="text-xs text-oil-slate/40 ml-1">{s.unit}</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Résumé IA */}
              {latest.ai_summary && (
                <div className="p-4 bg-oil-sand-light border border-oil-sand-dark rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-xs font-bold text-oil-slate uppercase">Analyse de la semaine</div>
                    <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      latest.macro_indicators?.market_sentiment === 'bullish' ? 'bg-red-100 text-oil-rust' :
                      latest.macro_indicators?.market_sentiment === 'bearish' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {latest.macro_indicators?.market_sentiment === 'bullish' ? '📈 Haussier' :
                       latest.macro_indicators?.market_sentiment === 'bearish' ? '📉 Baissier' : '➡️ Neutre'}
                    </div>
                  </div>
                  <p className="text-xs text-oil-slate/70 leading-relaxed">{latest.ai_summary}</p>
                  {latest.macro_indicators?.key_risk && (
                    <div className="mt-2 text-xs text-oil-rust">
                      <strong>Risque principal :</strong> {latest.macro_indicators.key_risk}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="h-20 flex items-center justify-center text-oil-slate/40 text-sm">
              Données non disponibles — lancer le pipeline
            </div>
          )}
        </Section>

        {/* ── GRAPHIQUE PRIX + ÉVÉNEMENTS ───────────────────────────── */}
        <Section title="Évolution des prix dans le temps" subtitle="Brent/WTI hebdomadaire · Points = événements high impact">

          {/* Sélecteur période */}
          <div className="flex gap-2 mb-4">
            {[{ w: 12, l: '3 mois' }, { w: 26, l: '6 mois' }, { w: 52, l: '1 an' }].map(p => (
              <button key={p.w} onClick={() => setPriceWeeks(p.w)}
                className={`px-3 py-1.5 rounded text-xs font-bold border transition ${
                  priceWeeks === p.w
                    ? 'bg-oil-slate text-white border-oil-slate'
                    : 'bg-white text-oil-slate border-oil-sand-dark hover:border-oil-slate'
                }`}>
                {p.l}
              </button>
            ))}
          </div>

          {!priceHistory || priceHistory.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-oil-slate/40 text-sm">
              Données non disponibles
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={360}>
                <LineChart data={chartDataWithEvents} margin={{ top: 10, right: 30, left: 10, bottom: 30 }}>
                  <CartesianGrid {...GRID_STYLE} />
                  <XAxis dataKey="week" {...AXIS_STYLE}
                    tickFormatter={v => v?.slice(5) ?? ''} // MM-DD
                    label={{ value: 'Semaine', position: 'insideBottom', offset: -15, fill: '#2C3E50', fontSize: 12 }} />
                  <YAxis {...AXIS_STYLE}
                    label={{ value: '$/b', angle: -90, position: 'insideLeft', fill: '#2C3E50', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFAF4', border: '1px solid #D4C7B3', borderRadius: '8px', fontSize: 11 }}
                    formatter={(v: number, n: string) => {
                      if (n === 'eventCount') return null as any;
                      return [`$${Number(v).toFixed(2)}/b`, n];
                    }}
                    labelFormatter={w => `Semaine du ${w}`} />
                  <Legend wrapperStyle={{ paddingTop: 16, fontSize: 11 }} />
                  <Line type="monotone" dataKey="brent" stroke="#B85450" strokeWidth={2.5}
                    dot={false} activeDot={{ r: 4 }} name="Brent" />
                  <Line type="monotone" dataKey="wti" stroke="#C17F24" strokeWidth={2}
                    dot={false} activeDot={{ r: 4 }} name="WTI" />
                </LineChart>
              </ResponsiveContainer>

              {/* Légende événements */}
              {(timeline ?? []).length > 0 && (
                <div className="mt-2 text-xs text-oil-slate/50 text-center">
                  ● = semaine avec événement high impact (voir timeline ci-dessous)
                </div>
              )}
            </>
          )}
        </Section>

        {/* ── TIMELINE ÉVÉNEMENTS ───────────────────────────────────── */}
        <Section title="Timeline des événements" subtitle="Extraits automatiquement des flux d'actualités — classés par impact">

          {/* Filtres type */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            <button onClick={() => setEventFilter(null)}
              className={`px-2.5 py-1 rounded text-xs font-semibold border transition ${
                eventFilter === null ? 'bg-oil-slate text-white border-oil-slate' : 'bg-white text-oil-slate border-oil-sand-dark'
              }`}>
              Tous
            </button>
            {Object.entries(EVENT_TYPE_CONFIG).map(([key, cfg]) => (
              <button key={key} onClick={() => setEventFilter(eventFilter === key ? null : key)}
                className={`px-2.5 py-1 rounded text-xs font-semibold border transition ${
                  eventFilter === key ? 'text-white border-transparent' : 'bg-white text-oil-slate border-oil-sand-dark'
                }`}
                style={eventFilter === key ? { backgroundColor: cfg.color, borderColor: cfg.color } : {}}>
                {cfg.icon} {cfg.label}
              </button>
            ))}
          </div>

          {!allEvents || allEvents.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-oil-slate/40 text-sm">
              Aucun événement disponible
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {allEvents
                .filter((e: any) => !eventFilter || e.event_type === eventFilter)
                .slice(0, 50)
                .map((event: any, i: number) => {
                  const typeCfg = EVENT_TYPE_CONFIG[event.event_type] ?? { color: '#8E7F6B', label: event.event_type, icon: '•' };
                  const impactCfg = IMPACT_CONFIG[event.impact] ?? IMPACT_CONFIG.medium;
                  return (
                    <div key={i} className="flex gap-3 p-3 rounded-lg border border-oil-sand-dark hover:border-oil-slate/30 transition">
                      {/* Indicateur impact + type */}
                      <div className="flex flex-col items-center gap-1 shrink-0 w-8">
                        <div className="w-2 h-2 rounded-full mt-1" style={{ backgroundColor: impactCfg.color }} />
                        <div className="text-base leading-none">{typeCfg.icon}</div>
                      </div>
                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-0.5">
                          <div className="text-xs font-bold text-oil-slate leading-tight">{event.title}</div>
                          <div className={`text-xs font-bold shrink-0 ${DIRECTION_COLOR[event.impact_direction] ?? ''}`}>
                            {DIRECTION_ICON[event.impact_direction] ?? ''}
                            {event.estimated_price_impact !== 0 && ` $${Math.abs(event.estimated_price_impact).toFixed(1)}`}
                          </div>
                        </div>
                        {event.summary && (
                          <p className="text-xs text-oil-slate/60 leading-relaxed mb-1">{event.summary}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-oil-slate/40">
                          <span>{event.event_date}</span>
                          <span
                            className="px-1.5 py-0.5 rounded-full text-xs font-semibold"
                            style={{ backgroundColor: impactCfg.bg, color: impactCfg.color }}>
                            {event.impact}
                          </span>
                          <span style={{ color: typeCfg.color }} className="font-semibold">{typeCfg.label}</span>
                          {event.region && <span>{event.region}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </Section>

        {/* ── PRIX À LA POMPE MONDIAL ────────────────────────────────── */}
        <Section title="Prix à la pompe — vue mondiale" subtitle="USD/litre · 47 pays · EU Commission + EIA">
          <GasolineWorldMap />
        </Section>

        {/* ── SETUP INFO ────────────────────────────────────────────── */}
        <Section title="Configuration du pipeline" subtitle="Variables d'environnement · Planification · Coûts" defaultOpen={false}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-oil-sand-light rounded-lg p-4 border border-oil-sand-dark">
              <div className="font-bold text-oil-slate mb-2">Variables d'environnement</div>
              <div className="space-y-2 font-mono">
                <div>
                  <div className="text-oil-slate/50 mb-0.5">FRED_API_KEY</div>
                  <div className="text-oil-slate">Gratuit — fred.stlouisfed.org/docs/api/api_key.html</div>
                </div>
                <div>
                  <div className="text-oil-slate/50 mb-0.5">ANTHROPIC_API_KEY</div>
                  <div className="text-oil-slate">console.anthropic.com — ~$0.50-2 / pipeline</div>
                </div>
              </div>
              <div className="mt-3 text-oil-slate/60 leading-relaxed">
                Ajouter dans docker-compose.yml section <code>environment</code> du service backend.
              </div>
            </div>
            <div className="bg-oil-sand-light rounded-lg p-4 border border-oil-sand-dark">
              <div className="font-bold text-oil-slate mb-2">Planification Windows</div>
              <div className="space-y-1 text-oil-slate/70 leading-relaxed">
                <p>Le script <code>petroleum-weekly-update.ps1</code> est inclus dans le dashboard.</p>
                <p className="mt-2">Installation en admin :</p>
                <code className="block bg-white rounded p-2 mt-1 text-oil-slate border border-oil-sand-dark leading-loose">
                  # Copier les commandes depuis<br />
                  # petroleum-weekly-update.ps1<br />
                  # (section INSTALLATION en bas du fichier)
                </code>
                <p className="mt-2">→ Exécution automatique chaque lundi 8h00</p>
              </div>
            </div>
          </div>
        </Section>

      </div>
    </div>
  );
}
