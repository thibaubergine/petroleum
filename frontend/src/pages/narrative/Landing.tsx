import { Link } from 'react-router-dom';
import { useHistoricalProduction } from '@/hooks/useHistorical';
import { useMemo } from 'react';

// ── Chiffres clés calculés depuis les données réelles ──────────────────────
function useKeyFigures() {
  const { data } = useHistoricalProduction();
  return useMemo(() => {
    if (!data?.length) return { worldProd2023: 101.8, countriesCount: 20, peakYear: 2023 };
    const p2023 = data.filter(d => d.year === 2023).reduce((s, d) => s + d.production_value, 0);
    const countries = new Set(data.map(d => d.country_code)).size;
    return { worldProd2023: Math.round(p2023 * 10) / 10, countriesCount: countries, peakYear: 2023 };
  }, [data]);
}

export default function Landing() {
  const figures = useKeyFigures();

  return (
    <div className="bg-oil-slate min-h-screen">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ minHeight: '90vh' }}>
        {/* Fond principal */}
        <div className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 30% 50%, #3D2B1F 0%, #1a1a2e 50%, #0d0d0d 100%)'
          }} />

        {/* Flaque d'essence — coin bas gauche, SVG irisé */}
        <div className="absolute bottom-0 left-0 pointer-events-none select-none"
          style={{ width: '480px', height: '280px', transform: 'translate(-80px, 80px)' }}>
          <svg viewBox="0 0 480 280" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%' }}>
            <defs>
              {/* Gradient irisé principal */}
              <radialGradient id="flaque-iris" cx="45%" cy="50%" r="55%">
                <stop offset="0%"   stopColor="#9B59B6" stopOpacity="0.35" />
                <stop offset="18%"  stopColor="#3498DB" stopOpacity="0.28" />
                <stop offset="35%"  stopColor="#1ABC9C" stopOpacity="0.22" />
                <stop offset="52%"  stopColor="#C17F24" stopOpacity="0.30" />
                <stop offset="70%"  stopColor="#B85450" stopOpacity="0.20" />
                <stop offset="85%"  stopColor="#9B59B6" stopOpacity="0.15" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>
              {/* Reflet brillant */}
              <radialGradient id="flaque-shine" cx="40%" cy="45%" r="30%">
                <stop offset="0%"   stopColor="white" stopOpacity="0.12" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>
              {/* Bord foncé de la flaque */}
              <radialGradient id="flaque-dark" cx="50%" cy="50%" r="50%">
                <stop offset="60%"  stopColor="#0a0a0a" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#0a0a0a" stopOpacity="0" />
              </radialGradient>
              <filter id="blur-flaque">
                <feGaussianBlur stdDeviation="8" />
              </filter>
            </defs>
            {/* Corps sombre de la flaque */}
            <ellipse cx="220" cy="160" rx="200" ry="90"
              fill="url(#flaque-dark)" filter="url(#blur-flaque)" />
            {/* Couleurs irisées */}
            <ellipse cx="215" cy="155" rx="195" ry="85"
              fill="url(#flaque-iris)" filter="url(#blur-flaque)" />
            {/* Reflet central */}
            <ellipse cx="200" cy="145" rx="120" ry="50"
              fill="url(#flaque-shine)" filter="url(#blur-flaque)" />
          </svg>
        </div>

        {/* Grille de fond */}
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(193,127,36,0.4) 1px, transparent 0)', backgroundSize: '48px 48px' }} />

        <div className="relative max-w-5xl mx-auto px-8 flex flex-col justify-center" style={{ minHeight: '90vh' }}>
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-px bg-oil-ocre/60" />
            <span className="text-oil-ocre/80 text-xs uppercase tracking-[0.25em] font-semibold">
              une matière noire
            </span>
          </div>

          {/* Titre */}
          <h1 className="text-7xl md:text-9xl font-black text-white leading-none mb-6"
            style={{ fontVariant: 'small-caps', letterSpacing: '-0.02em' }}>
            Pétrole
          </h1>

          <p className="text-xl md:text-2xl text-white/50 font-light italic mb-10 max-w-2xl leading-relaxed">
            Le feu souterrain — une énergie prométhéenne
          </p>

          {/* Texte intro */}
          <p className="text-base text-white/70 leading-loose max-w-2xl mb-14">
            Prométhée offrit aux hommes le feu des dieux — et paya ce don de sa liberté pour l'éternité.
            Il est de bon ton de faire une analogie pompeuse avec une référence mythologique ou biblique,
            celle-ci me semble idéale. Le pétrole est l'exact équivalent moderne : énergie souterraine
            et primordiale, il a alimenté deux siècles de technologies et de croissance exponentielle.
            Mais toute énergie prométhéenne porte sa malédiction — l'expansion qu'elle rend possible
            creuse simultanément les conditions de son propre épuisement.
          </p>

          {/* Chiffres clés */}
          <div className="flex flex-wrap gap-8 mb-14">
            {[
              { val: `${figures.worldProd2023}`, unit: 'mb/j', label: 'production mondiale 2023' },
              { val: '160', unit: 'ans', label: 'd\'histoire industrielle' },
              { val: '50%', unit: '', label: 'de l\'énergie mondiale en 2024' },
              { val: '8×', unit: '', label: 'croissance démographique depuis 1850' },
            ].map(f => (
              <div key={f.label} className="border-l-2 border-oil-ocre/50 pl-4">
                <div className="text-3xl font-black text-white">
                  {f.val}<span className="text-oil-ocre text-xl ml-1">{f.unit}</span>
                </div>
                <div className="text-xs text-white/40 uppercase tracking-wide mt-0.5">{f.label}</div>
              </div>
            ))}
          </div>

          {/* Scroll indicator */}
          <div className="flex items-center gap-2 text-white/30 text-xs">
            <div className="w-6 h-10 rounded-full border border-white/20 flex items-start justify-center pt-1.5">
              <div className="w-1 h-2 bg-white/40 rounded-full animate-bounce" />
            </div>
            <span>Choisissez un acte</span>
          </div>
        </div>
      </div>

      {/* ── 3 PORTES D'ENTRÉE ────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-b from-oil-slate to-[#0d0d0d] py-24 px-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-white/30 text-sm uppercase tracking-[0.2em] mb-16">
            Trois actes — une seule matière
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                to: '/passe',
                acte: 'Acte I',
                titre: 'Le Passé',
                sous: 'Du blanc de baleine au shale',
                desc: 'Comment une huile noire et malodorante a sauvé les baleines, alimenté deux guerres mondiales, et construit la civilisation thermo-industrielle en 150 ans.',
                duree8: '~7 min · Les grandes ruptures',
                duree30: '~11 min · L\'histoire complète',
                couleur: '#C17F24',
                bg: 'from-amber-950/60 to-stone-950/80',
                border: 'border-amber-700/40',
                hover: 'hover:border-amber-500/60',
                accentText: 'text-amber-400',
                tag: '1850 → 2026',
              },
              {
                to: '/present',
                acte: 'Acte II',
                titre: "Aujourd'hui",
                sous: "L'empire invisible",
                desc: 'Ce que le pétrole fait au climat, aux puissances mondiales, aux prix à la pompe et à votre quotidien. Et pourquoi on construit des villes entières dans le désert.',
                duree8: '~7 min · Les faits essentiels',
                duree30: '~10 min · L\'analyse complète',
                couleur: '#4A90A4',
                bg: 'from-blue-950/60 to-slate-950/80',
                border: 'border-blue-700/40',
                hover: 'hover:border-blue-500/60',
                accentText: 'text-blue-400',
                tag: '2026',
              },
              {
                to: '/futur',
                acte: 'Acte III',
                titre: 'Le Futur',
                sous: 'Quand la flamme vacille',
                desc: 'Personne ne sait vraiment ce qui va se passer — et c\'est précisément pour ça que c\'est fascinant. Peak demand, réserves politiques, scénarios contradictoires.',
                duree8: '~8 min · Les grandes tendances',
                duree30: '~11 min · Tous les scénarios',
                couleur: '#2E7D6B',
                bg: 'from-emerald-950/60 to-stone-950/80',
                border: 'border-emerald-700/40',
                hover: 'hover:border-emerald-500/60',
                accentText: 'text-emerald-400',
                tag: '2026 → 2050',
              },
            ].map(s => (
              <Link key={s.to} to={s.to}
                className={`group relative rounded-2xl border ${s.border} ${s.hover} bg-gradient-to-b ${s.bg} p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl block`}>

                {/* Tag période */}
                <div className={`text-xs font-bold uppercase tracking-widest ${s.accentText} mb-4`}>
                  {s.acte} · {s.tag}
                </div>

                {/* Titre */}
                <h2 className="text-3xl font-black text-white mb-1">{s.titre}</h2>
                <p className={`text-sm italic ${s.accentText} mb-5`}>{s.sous}</p>

                {/* Description */}
                <p className="text-sm text-white/60 leading-relaxed mb-8">{s.desc}</p>

                {/* Durées de lecture */}
                <div className="border-t border-white/10 pt-5 flex items-center justify-between">
                  <div className="text-xs text-white/30 space-y-1">
                    <div>⏱ Essentiel — {s.duree8}</div>
                    <div>⏱ Complet — {s.duree30}</div>
                  </div>
                  <div className={`w-10 h-10 rounded-full border ${s.border} flex items-center justify-center text-lg group-hover:scale-110 transition-transform`}
                    style={{ color: s.couleur }}>
                    →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── LIEN DASHBOARD ───────────────────────────────────────────────── */}
      <div className="bg-[#0d0d0d] py-14 px-8 text-center border-t border-white/5">
        <p className="text-white/40 text-sm mb-6">
          Vous préférez les données brutes aux récits ?
        </p>
        <div className="flex flex-col items-center gap-3">
          <Link to="/dashboard"
            className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-white/10 border border-white/35 text-white font-semibold hover:bg-white/18 hover:border-white/55 transition-all text-sm shadow-lg">
            Dashboard analytique
            <span className="text-xs text-white/50 font-normal border-l border-white/20 pl-3">Production · Prix · Réserves · Analytics</span>
          </Link>
          <Link to="/dashboard/sources"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-white/20 text-white/60 text-sm hover:text-white hover:border-white/40 transition-all">
            Sources &amp; Méthodologie
            <span className="text-xs text-white/35 font-normal">T×V×A · Biais documentés · Données controversées</span>
          </Link>
        </div>
        <p className="text-white/15 text-xs mt-8 max-w-lg mx-auto leading-relaxed">
          Petroleum est un projet indépendant. Les données proviennent de sources publiques
          (BP Statistical Review, EIA, IEA, OPEC) et sont présentées sans parti pris.
          Les incertitudes sont documentées.
        </p>
      </div>

    </div>
  );
}
