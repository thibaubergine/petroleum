import { useState, useMemo } from 'react';
import { useProductionByMethod, useEROEI } from '@/hooks/useProduction';
import { useHistoricalProduction } from '@/hooks/useHistorical';
import TopProducersChart from '@/components/charts/TopProducersChart';
import MethodNormalizedChart from '@/components/charts/MethodNormalizedChart';import EROEILineChart from '@/components/charts/EROEILineChart';
import MultiCountryChart from '@/components/charts/MultiCountryChart';
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

// ── Scénarios dans l'ordre de sélection ──────────────────────────────────────

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

// ── Comparaison sources déplacée dans l'onglet Sources ───────────────────────

export default function Production() {
  const [methodCountry, setMethodCountry] = useState('USA');

  const { data: methodDataUSA } = useProductionByMethod('USA', 2010, 2024);
  const { data: methodDataCAN } = useProductionByMethod('CAN', 2010, 2024);
  const { data: methodDataSAU } = useProductionByMethod('SAU', 2010, 2024);
  const { data: eroeiData } = useEROEI(undefined, 1970, 2024);
  const { data: historicalData } = useHistoricalProduction();

  return (
    <div className="min-h-screen bg-oil-sand-light">
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">

        {/* ── 1. PRODUCTION HISTORIQUE ───────────────────────────────── */}
        <Section title="Production mondiale — Top 10 par décennie" subtitle="1975 · 1990 · 2010 · 2023 — Barres horizontales classées">
          {historicalData && historicalData.length > 0 ? (
            <TopProducersChart data={historicalData} />
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-oil-slate/50 gap-2">
              <AlertCircle size={24} className="text-oil-rust/50" />
              <p className="text-sm">Données historiques non importées</p>
              <code className="text-xs bg-oil-sand px-2 py-1 rounded">docker exec oil-backend python scripts/run_complete_import.py</code>
            </div>
          )}
        </Section>

        {/* ── 1b. PRODUCTION PAR PAYS — LIGNES ──────────────────────── */}
        <Section title="Évolution par pays 1965-2023" subtitle="Lignes multi-pays · Sélection par région ou pays" defaultOpen={false}>
          {historicalData && historicalData.length > 0 ? (
            <MultiCountryChart data={historicalData} />
          ) : (
            <div className="h-48 flex items-center justify-center text-oil-slate/50 text-sm">
              Données historiques non importées
            </div>
          )}
        </Section>

        {/* ── 2. MÉTHODES D'EXTRACTION ──────────────────────────────── */}
        <Section title="Méthodes d'extraction — tous les pétroles ne se valent pas" subtitle="Évolution temporelle · USA · Canada · Arabie Saoudite">

          {/* Cartes méthodes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
            {[
              { name: 'Pétrole conventionnel', api: '> 25° API', cout: '$5–25/b', badge: 'bg-green-100 text-green-800',
                desc: 'Pétrole liquide extrait par pression naturelle. Faible viscosité, facile à raffiner. Part mondiale en déclin : ~80% en 1970 → ~55% en 2024.' },
              { name: 'Pétrole de schiste', api: '35–45° API', cout: '$35–55/b', badge: 'bg-yellow-100 text-yellow-800',
                desc: 'Fracturation hydraulique (fracking). Révolution américaine 2008-2020 : +8 mb/d. Déclin rapide des puits (50-70%/an), nécessite forage continu.' },
              { name: 'Sables bitumineux', api: '< 10° API', cout: '$60–80/b', badge: 'bg-orange-100 text-orange-800',
                desc: 'Bitume extrait par mines ou injection vapeur (SAGD). 3× plus énergivore que le conventionnel. Alberta Canada = 96% de la production canadienne.' },
              { name: 'Offshore profond', api: '28–38° API', cout: '$40–70/b', badge: 'bg-blue-100 text-blue-800',
                desc: 'Forage en eaux >500m. Risques élevés, technologie complexe. Grandes découvertes : pre-sal brésilien, Angola, Golfe du Mexique.' },
              { name: 'EOR — Récupération améliorée', api: 'Variable', cout: '$25–50/b', badge: 'bg-purple-100 text-purple-800',
                desc: 'Injection CO₂/vapeur/polymères après production primaire. Récupère 10-20% supplémentaires. Utilisé massivement en Arabie Saoudite (Ghawar).' },
              { name: 'Extra-lourd', api: '10–20° API', cout: '$30–50/b + upgrade', badge: 'bg-red-100 text-red-800',
                desc: 'Très visqueux, nécessite diluant. Ceinture Orinoque Venezuela : 304 Gb estimés mais <20% récupérable en pratique.' },
            ].map(m => (
              <div key={m.name} className="bg-oil-sand-light rounded-lg p-3 border border-oil-sand-dark">
                <div className="flex items-start justify-between mb-1.5">
                  <div className="text-sm font-bold text-oil-slate leading-tight">{m.name}</div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ml-2 ${m.badge}`}>{m.api}</span>
                </div>
                <div className="text-xs text-oil-rust font-semibold mb-1.5">{m.cout}/baril</div>
                <p className="text-xs text-oil-slate/70 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-5">
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>Tous les pétroles ne se valent pas.</strong> 1 baril de bitume canadien = 3× plus d'énergie à produire qu'un baril conventionnel saoudien.
              Le pétrole lourd (API bas) produit plus de résidus et moins d'essence/diesel au raffinage.
              Les différentiels de prix (Brent–WTI, WTI–WCS) reflètent ces différences de qualité.
            </p>
          </div>

          {/* Graphique méthodes normalisé — sans données backend requises */}
          <div className="mt-5">
            <div className="text-sm font-bold text-oil-slate mb-1">
              Composition par méthode — % du total de production
            </div>
            <div className="flex gap-2 mb-4">
              {['USA','CAN','SAU'].map(c => (
                <button key={c}
                  onClick={() => setMethodCountry(c)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition ${
                    methodCountry === c
                      ? 'bg-oil-slate text-white border-oil-slate'
                      : 'bg-white text-oil-slate border-oil-sand-dark hover:border-oil-slate'
                  }`}>
                  {c === 'USA' ? 'États-Unis' : c === 'CAN' ? 'Canada' : 'Arabie Saoudite'}
                </button>
              ))}
            </div>
            <MethodNormalizedChart country={methodCountry} />
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {[
                { year: '2008–2020', title: 'Révolution shale USA', color: '#B85450', text: 'Le schiste passe de ~7% à ~70% de la production US en 12 ans. Révolution sans précédent dans l\'histoire pétrolière.' },
                { year: '2003–2020', title: 'Sables bitumineux Canada', color: '#8B4513', text: '80% de la production canadienne vient des sables bitumineux de l\'Athabasca (Alberta). L\'un des projets industriels les plus lourds au monde.' },
                { year: 'Constant', title: 'SAU : conventionnel + EOR', color: '#C17F24', text: '87% conventionnel (Ghawar, Safaniya) + 13% EOR (injection eau/vapeur). Pas besoin de non-conventionnel — les réservoirs sont encore productifs.' },
              ].map(a => (
                <div key={a.title} className="bg-oil-sand-light rounded-lg p-3 border border-oil-sand-dark">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: a.color }} />
                    <span className="font-bold text-oil-slate">{a.year}</span>
                  </div>
                  <div className="font-semibold text-oil-slate mb-1">{a.title}</div>
                  <p className="text-oil-slate/60 leading-relaxed">{a.text}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── 4. EROEI ──────────────────────────────────────────────── */}
        <Section title="EROEI — L'efficacité énergétique de l'extraction" subtitle="Energy Return On Energy Invested · Formule · Pertinence · Limites" defaultOpen={false}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <div className="bg-oil-sand-light rounded-lg p-4 border border-oil-sand-dark">
              <div className="text-xs font-bold text-oil-slate uppercase mb-3">Visualisation intuitive</div>
              <p className="text-xs text-oil-slate/70 leading-relaxed mb-3">
                Pour chaque baril d'énergie <em>dépensé</em>, combien en <em>récupère-t-on</em> ?
              </p>
              <div className="space-y-2">
                {[
                  { ratio: '35:1', label: 'Conventionnel 1970', color: 'bg-green-500', width: '100%' },
                  { ratio: '15:1', label: 'Conventionnel 2024', color: 'bg-green-400', width: '57%' },
                  { ratio: '9:1',  label: 'Offshore profond',  color: 'bg-amber-400', width: '34%' },
                  { ratio: '5:1',  label: 'Schiste USA',       color: 'bg-orange-400', width: '18%' },
                  { ratio: '3:1',  label: 'Sables bitumineux', color: 'bg-red-400',    width: '10%' },
                  { ratio: '<3:1', label: '⚠ Limite viabilité', color: 'bg-red-600',   width: '4%' },
                ].map(r => (
                  <div key={r.ratio} className="flex items-center gap-2">
                    <div className="w-11 text-xs font-bold text-oil-slate text-right shrink-0">{r.ratio}</div>
                    <div className="flex-1 h-3.5 bg-oil-sand rounded-full overflow-hidden">
                      <div className={`h-full ${r.color} rounded-full`} style={{ width: r.width }} />
                    </div>
                    <div className="text-xs shrink-0 max-w-32 leading-tight text-oil-slate/60">{r.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-oil-sand-light rounded-lg p-4 border border-oil-sand-dark">
              <div className="text-xs font-bold text-oil-slate uppercase mb-3">Définition & pertinence</div>
              <div className="font-mono text-center text-sm bg-white rounded p-2 mb-3 border border-oil-sand-dark">
                EROEI = E<sub>out</sub> / E<sub>in</sub>
              </div>
              <p className="text-xs text-oil-slate/70 leading-relaxed mb-3">
                E<sub>out</sub> = énergie contenue dans le pétrole produit.<br />
                E<sub>in</sub> = énergie totale (exploration → forage → extraction → transport → raffinage).
              </p>
              <div className="text-xs font-semibold text-green-700 mb-1">Pourquoi c'est important</div>
              <ul className="text-xs text-oil-slate/70 space-y-1">
                <li>→ Mesure la qualité réelle d'une ressource</li>
                <li>→ Prédit la hausse structurelle des prix</li>
                <li>→ Compare pétrole, gaz, renouvelables, nucléaire</li>
              </ul>
            </div>
            <div className="bg-oil-sand-light rounded-lg p-4 border border-oil-sand-dark">
              <div className="text-xs font-bold text-oil-slate uppercase mb-3">Limites</div>
              <ul className="text-xs text-oil-slate/70 space-y-2">
                <li className="flex gap-2"><span className="text-oil-rust shrink-0">!</span> Aucun standard méthodologique universel</li>
                <li className="flex gap-2"><span className="text-oil-rust shrink-0">!</span> Périmètre variable (gate-to-gate vs well-to-wheel = facteur ×3)</li>
                <li className="flex gap-2"><span className="text-oil-rust shrink-0">!</span> N'intègre pas les externalités (CO₂, eau)</li>
                <li className="flex gap-2"><span className="text-oil-rust shrink-0">!</span> Données souvent auto-déclarées</li>
                <li className="flex gap-2"><span className="text-amber-600 shrink-0">~</span> Études rares — points décennaux uniquement</li>
              </ul>
            </div>
          </div>
          {eroeiData && eroeiData.length > 0 && <EROEILineChart data={eroeiData} />}
        </Section>

      </div>
    </div>
  );
}
