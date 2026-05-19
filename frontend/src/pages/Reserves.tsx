import { useState } from 'react';
import { useReservesByType } from '@/hooks/useReserves';
import { useHistoricalReserves } from '@/hooks/useHistorical';
import HistoricalReservesChart from '@/components/charts/HistoricalReservesChart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { TOOLTIP_STYLE, GRID_STYLE, AXIS_STYLE } from '@/utils/chartColors';
import { ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

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

// Couleurs par type de réserve
const TYPE_COLORS: Record<string, string> = {
  conventional:  '#2C3E50',
  shale:         '#C17F24',
  oil_sands:     '#8B4513',
  extra_heavy:   '#B85450',
  offshore:      '#2E7D6B',
};

const TYPE_LABELS: Record<string, string> = {
  conventional: 'Conventionnel',
  shale:        'Schiste (tight)',
  oil_sands:    'Sables bitumineux',
  extra_heavy:  'Extra-lourd',
  offshore:     'Offshore',
};

// Données historiques réserves (1P prouvées) par type — évolution
const RESERVES_HISTORY = [
  { year: 1980, conventional: 680, shale: 0, oil_sands: 5, extra_heavy: 12, offshore: 25 },
  { year: 1985, conventional: 720, shale: 0, oil_sands: 20, extra_heavy: 18, offshore: 30 },
  { year: 1990, conventional: 900, shale: 0, oil_sands: 50, extra_heavy: 40, offshore: 38 },  // Inflation OPEC
  { year: 1995, conventional: 870, shale: 0, oil_sands: 80, extra_heavy: 80, offshore: 42 },
  { year: 2000, conventional: 820, shale: 2, oil_sands: 120, extra_heavy: 150, offshore: 48 },
  { year: 2005, conventional: 790, shale: 5, oil_sands: 150, extra_heavy: 200, offshore: 50 },
  { year: 2008, conventional: 760, shale: 15, oil_sands: 160, extra_heavy: 250, offshore: 52 }, // Révolution shale USA
  { year: 2010, conventional: 740, shale: 35, oil_sands: 164, extra_heavy: 280, offshore: 52 },
  { year: 2015, conventional: 720, shale: 55, oil_sands: 166, extra_heavy: 295, offshore: 53 },
  { year: 2020, conventional: 700, shale: 65, oil_sands: 167, extra_heavy: 300, offshore: 52 },
  { year: 2023, conventional: 685, shale: 69, oil_sands: 168, extra_heavy: 304, offshore: 52 },
];

// Données par pays avec 1P / qualité
const COUNTRY_RESERVES = [
  { country: 'Venezuela', code: 'VEN', proven1p: 304, crude: 20, extra_heavy: 280, other: 4, opec: true, flag: 'Rouge — 80%+ non récupérable en pratique' },
  { country: 'Arabie Saoudite', code: 'SAU', proven1p: 267, crude: 260, extra_heavy: 0, other: 7, opec: true, flag: null },
  { country: 'Canada', code: 'CAN', proven1p: 170, crude: 5, extra_heavy: 163, other: 2, opec: false, flag: 'Orange — inclut sables bitumineux (~96%)' },
  { country: 'Iran', code: 'IRN', proven1p: 208, crude: 195, extra_heavy: 5, other: 8, opec: true, flag: 'Orange — données auto-déclarées' },
  { country: 'Iraq', code: 'IRQ', proven1p: 145, crude: 140, extra_heavy: 0, other: 5, opec: true, flag: null },
  { country: 'Russie', code: 'RUS', proven1p: 107, crude: 100, extra_heavy: 0, other: 7, opec: false, flag: 'Orange — post-2022 incertain' },
  { country: 'Koweït', code: 'KWT', proven1p: 102, crude: 99, extra_heavy: 0, other: 3, opec: true, flag: 'Rouge — doc interne Petroleum Intelligence Weekly (1985) suggère 48 Gb réels' },
  { country: 'UAE', code: 'ARE', proven1p: 98, crude: 95, extra_heavy: 0, other: 3, opec: true, flag: null },
  { country: 'USA', code: 'USA', proven1p: 69, crude: 40, extra_heavy: 0, other: 29, opec: false, flag: null },
  { country: 'Libye', code: 'LBY', proven1p: 48, crude: 47, extra_heavy: 0, other: 1, opec: true, flag: 'Orange — production instable post-2011' },
  { country: 'Nigeria', code: 'NGA', proven1p: 37, crude: 35, extra_heavy: 0, other: 2, opec: true, flag: null },
  { country: 'Kazakhstan', code: 'KAZ', proven1p: 30, crude: 28, extra_heavy: 0, other: 2, opec: false, flag: null },
  { country: 'Qatar', code: 'QAT', proven1p: 25, crude: 25, extra_heavy: 0, other: 0, opec: true, flag: null },
  { country: 'Brésil', code: 'BRA', proven1p: 15, crude: 15, extra_heavy: 0, other: 0, opec: false, flag: null },
  { country: 'Algérie', code: 'DZA', proven1p: 12, crude: 11, extra_heavy: 0, other: 1, opec: true, flag: null },
];

export default function Reserves() {
  const [sortBy, setSortBy] = useState<'proven1p'|'crude'>('proven1p');
  const [showFlags, setShowFlags] = useState(true);

  const { data: byTypeData } = useReservesByType();
  const { data: historicalReservesData, isLoading: histResLoading } = useHistoricalReserves({ start_year: 1980, end_year: 2023 });

  const sorted = [...COUNTRY_RESERVES].sort((a, b) => b[sortBy] - a[sortBy]);

  return (
    <div className="min-h-screen bg-oil-sand-light">
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">

        {/* ── 1. INTRO ────────────────────────────────────────────── */}
        <Section title="Réserves pétrolières mondiales" subtitle="1P prouvées · par type · par qualité · évolution historique">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Total 1P mondial', val: '1 278 Gb', sub: 'milliards de barils prouvés', color: 'text-oil-slate' },
              { label: 'Conventionnel', val: '685 Gb', sub: '54% du total', color: 'text-oil-slate' },
              { label: 'Non-conventionnel', val: '593 Gb', sub: 'Schiste + sables + extra-lourd', color: 'text-oil-rust' },
              { label: 'R/P ratio mondial', val: '~50 ans', sub: 'aux niveaux actuels de production', color: 'text-oil-rust' },
            ].map(s => (
              <div key={s.label} className="bg-oil-sand-light rounded-lg p-3 border border-oil-sand-dark text-center">
                <div className="text-xs text-oil-slate/50 uppercase font-semibold mb-1">{s.label}</div>
                <div className={`text-2xl font-bold ${s.color}`}>{s.val}</div>
                <div className="text-xs text-oil-slate/50 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 leading-relaxed">
            <strong>Attention aux chiffres officiels.</strong> Les réserves 1P (prouvées) sont déclarées par les pays eux-mêmes et ne sont pas systématiquement auditées. 
            Le Venezuela déclare 304 Gb mais le taux de récupération réel de son pétrole extra-lourd est inférieur à 20%. 
            Le Koweït a probablement gonflé ses réserves de 50%+ dans les années 1980 selon des documents internes divulgués.
            L'OPEC utilise les quotas de production basés sur les réserves déclarées — créant une incitation directe à les surestimer.
          </div>
        </Section>

        {/* ── 2. ÉVOLUTION HISTORIQUE PAR TYPE ────────────────────── */}
        <Section title="Évolution des réserves 1980-2023" subtitle="L'arrivée du shale et des sables bitumineux a transformé le paysage">
          <div className="mb-4">
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={RESERVES_HISTORY} margin={{ top: 10, right: 20, left: 10, bottom: 30 }} barSize={20}>
                <CartesianGrid {...GRID_STYLE} />
                <XAxis dataKey="year" {...AXIS_STYLE} />
                <YAxis {...AXIS_STYLE}
                  label={{ value: 'Milliards de barils (Gb)', angle: -90, position: 'insideLeft', fill: '#2C3E50', fontSize: 11 }} />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v: number, name: string) => [`${v} Gb`, TYPE_LABELS[name] || name]} />
                <Legend wrapperStyle={{ paddingTop: 16, fontSize: 11 }}
                  formatter={v => TYPE_LABELS[v] || v} />
                {Object.keys(TYPE_COLORS).map(type => (
                  <Bar key={type} dataKey={type} stackId="a" fill={TYPE_COLORS[type]} name={type} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {[
              {
                period: '1986-1990 : "Inflation OPEC"',
                color: 'border-l-oil-rust',
                text: 'Les membres OPEC gonflent massivement leurs réserves déclarées (+50% en moyenne) car les quotas de production sont indexés aux réserves. Arabie Saoudite +52%, UAE +197%, Iraq +113%.',
              },
              {
                period: '2008-2015 : Révolution shale (USA)',
                color: 'border-l-amber-500',
                text: 'La fracturation hydraulique rend techniquement récupérables des ressources auparavant non-comptabilisées. Les réserves prouvées US passent de 20 Gb à 69 Gb en 7 ans.',
              },
              {
                period: '2000-2010 : Reconnaissance sables bitumineux',
                color: 'border-l-amber-700',
                text: 'Le Canada intègre progressivement les sables bitumineux de l\'Athabasca dans ses réserves prouvées, passant de ~5 Gb à 170 Gb — devenant la 3e réserve mondiale.',
              },
            ].map(e => (
              <div key={e.period} className={`border-l-4 ${e.color} bg-oil-sand-light rounded-r-lg p-3`}>
                <div className="font-bold text-oil-slate mb-1">{e.period}</div>
                <p className="text-oil-slate/70 leading-relaxed">{e.text}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── 2b. ÉVOLUTION PAR PAYS ──────────────────────────────── */}
        <Section title="Évolution des réserves par pays 1980-2023" subtitle="Sélection pays · Total 1P · Brut conventionnel · Non-conventionnel">
          {histResLoading ? (
            <div className="h-64 flex items-center justify-center text-oil-slate/50">Chargement...</div>
          ) : historicalReservesData && historicalReservesData.length > 0 ? (
            <HistoricalReservesChart data={historicalReservesData} />
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-oil-slate/50 gap-2">
              <AlertCircle size={24} className="text-oil-rust/50" />
              <p className="text-sm">Données non importées.</p>
              <code className="text-xs bg-oil-sand px-2 py-1 rounded">
                docker exec oil-backend python scripts/import_historical_reserves.py
              </code>
            </div>
          )}
        </Section>

        {/* ── 3. TABLEAU PAR PAYS ─────────────────────────────────── */}
        <Section title="Réserves par pays — brut vs qualités" subtitle="Dissociation conventionnel / extra-lourd / autres · Flags qualité données">
          <div className="flex items-center gap-4 mb-3">
            <div className="text-xs font-semibold text-oil-slate">Trier par :</div>
            <div className="flex gap-2">
              <button onClick={() => setSortBy('proven1p')}
                className={`px-3 py-1 rounded text-xs font-semibold border transition ${sortBy === 'proven1p' ? 'bg-oil-slate text-white border-oil-slate' : 'bg-white text-oil-slate border-oil-sand-dark'}`}>
                Total 1P
              </button>
              <button onClick={() => setSortBy('crude')}
                className={`px-3 py-1 rounded text-xs font-semibold border transition ${sortBy === 'crude' ? 'bg-oil-slate text-white border-oil-slate' : 'bg-white text-oil-slate border-oil-sand-dark'}`}>
                Brut conventionnel
              </button>
            </div>
            <label className="flex items-center gap-1.5 text-xs text-oil-slate cursor-pointer ml-auto">
              <input type="checkbox" checked={showFlags} onChange={e => setShowFlags(e.target.checked)} />
              Afficher les alertes
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b-2 border-oil-sand-dark">
                  <th className="text-left py-2 pr-3 text-oil-slate/60 font-semibold uppercase">Pays</th>
                  <th className="text-right py-2 pr-3 text-oil-slate/60 font-semibold uppercase">Total 1P (Gb)</th>
                  <th className="text-right py-2 pr-3 text-oil-slate/60 font-semibold uppercase">Brut conv.</th>
                  <th className="text-right py-2 pr-3 text-oil-slate/60 font-semibold uppercase">Extra-lourd</th>
                  <th className="text-right py-2 pr-3 text-oil-slate/60 font-semibold uppercase">Autres</th>
                  <th className="text-center py-2 pr-3 text-oil-slate/60 font-semibold uppercase">OPEC</th>
                  <th className="text-left py-2 text-oil-slate/60 font-semibold uppercase">Alerte</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(r => (
                  <tr key={r.code} className="border-b border-oil-sand-dark/40 hover:bg-oil-sand-light/50">
                    <td className="py-1.5 pr-3 font-semibold text-oil-slate">{r.country}</td>
                    <td className="py-1.5 pr-3 text-right font-bold font-mono text-oil-slate">{r.proven1p}</td>
                    <td className="py-1.5 pr-3 text-right font-mono text-oil-slate/80">{r.crude || '—'}</td>
                    <td className="py-1.5 pr-3 text-right font-mono">
                      {r.extra_heavy > 0
                        ? <span className="text-oil-rust font-semibold">{r.extra_heavy}</span>
                        : <span className="text-oil-slate/30">—</span>}
                    </td>
                    <td className="py-1.5 pr-3 text-right font-mono text-oil-slate/60">{r.other || '—'}</td>
                    <td className="py-1.5 pr-3 text-center">
                      {r.opec && <span className="text-xs font-bold text-oil-rust">OPEC</span>}
                    </td>
                    <td className="py-1.5 text-oil-slate/50">
                      {showFlags && r.flag && (
                        <div className="flex items-start gap-1">
                          <AlertCircle size={10} className="mt-0.5 shrink-0 text-oil-rust" />
                          <span className="text-oil-rust/80">{r.flag}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ── 4. 2P / 3P ──────────────────────────────────────────── */}
        <Section title="Réserves 2P et 3P — pourquoi si peu de données ?" subtitle="Probable · Possible · Ressources non prouvées" defaultOpen={false}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {[
              {
                name: '1P — Prouvées',
                def: 'Probabilité ≥90% de récupération dans les conditions économiques actuelles.',
                data: 'Publiées par EIA, IEA, OPEC. Données disponibles par pays.',
                color: 'border-green-500',
                est: '~1 278 Gb',
              },
              {
                name: '2P — Probables',
                def: 'Probabilité ≥50%. Inclut 1P + réserves probables dans champs existants.',
                data: 'Rarement publiées par les gouvernements. Rystad Energy, Wood Mackenzie (payants).',
                color: 'border-amber-500',
                est: '~1 700-2 000 Gb',
              },
              {
                name: '3P — Possibles',
                def: 'Probabilité ≥10%. Inclut ressources dans champs non encore développés.',
                data: 'Quasi inexistantes publiquement. Estimations spéculatives uniquement.',
                color: 'border-oil-rust',
                est: '~2 500-4 000 Gb',
              },
            ].map(r => (
              <div key={r.name} className={`border-l-4 ${r.color} bg-oil-sand-light rounded-r-lg p-4`}>
                <div className="font-bold text-oil-slate mb-1">{r.name}</div>
                <div className="text-lg font-bold text-oil-rust mb-2">{r.est}</div>
                <p className="text-xs text-oil-slate/70 mb-1.5"><strong>Définition :</strong> {r.def}</p>
                <p className="text-xs text-oil-slate/60"><strong>Données :</strong> {r.data}</p>
              </div>
            ))}
          </div>

          <div className="p-3 bg-oil-sand-light border border-oil-sand-dark rounded-lg text-xs text-oil-slate/70 leading-relaxed">
            <strong className="text-oil-slate">Pourquoi les 2P/3P sont-elles si peu publiées ?</strong> Les compagnies pétrolières coté
            en bourse sont soumises aux règles SEC (USA) ou SPE/PRMS (international) pour leurs déclarations de réserves 1P.
            Des règles strictes, vérifiables, avec risque légal en cas de fraude. Les réserves 2P et 3P
            n'ont pas cette contrainte légale — les chiffres varient énormément selon les hypothèses
            et les intérêts commerciaux. Les inclure sans nuance serait trompeur.
            Ce dashboard intégrera les estimations 2P/3P de Rystad Energy dès que les données seront accessibles.
          </div>
        </Section>

      </div>
    </div>
  );
}
