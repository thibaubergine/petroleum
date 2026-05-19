import { createContext, useContext, useState, useEffect, useRef } from 'react';

type Mode = 'short' | 'long';
const Ctx = createContext<{ mode: Mode; toggle: () => void }>({ mode: 'short', toggle: () => {} });

export function ReadingModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>('long');  // long par défaut
  return (
    <Ctx.Provider value={{ mode, toggle: () => setMode(m => m === 'short' ? 'long' : 'short') }}>
      {children}
    </Ctx.Provider>
  );
}

export const useReadingMode = () => useContext(Ctx);

// ── Sommaire dynamique ────────────────────────────────────────────────────────
interface TocItem { n: string; label: string; title: string; id: string }

export function TableOfContents({ chapters }: { chapters: TocItem[] }) {
  const [active, setActive] = useState(chapters[0]?.id ?? '');

  useEffect(() => {
    const handler = () => {
      for (const ch of [...chapters].reverse()) {
        const el = document.getElementById(ch.id);
        if (el && el.getBoundingClientRect().top < 200) {
          setActive(ch.id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [chapters]);

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-30 hidden xl:flex flex-col gap-0.5"
      style={{ maxHeight: '80vh', overflowY: 'auto' }}>
      {chapters.map(ch => {
        const isActive = active === ch.id;
        return (
          <button key={ch.id}
            onClick={() => document.getElementById(ch.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className={`flex items-center gap-2.5 text-left px-2 py-1 rounded-lg transition-all duration-200 ${
              isActive ? 'bg-white/8' : 'hover:bg-white/5'
            }`}>
            {/* Trait */}
            <div className={`shrink-0 w-0.5 rounded-full transition-all duration-300 ${
              isActive ? 'h-5 bg-amber-400' : 'h-3 bg-white/20'
            }`} />
            {/* Numéro */}
            <span className={`shrink-0 text-xs font-black tabular-nums transition-colors ${
              isActive ? 'text-amber-400' : 'text-white/25'
            }`} style={{ width: '1.2rem' }}>
              {ch.n}
            </span>
            {/* Titre toujours visible */}
            <span className={`text-xs leading-tight transition-colors whitespace-nowrap ${
              isActive ? 'text-white/90 font-semibold' : 'text-white/35 hover:text-white/60'
            }`} style={{ maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {ch.title}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── Anchor pour les chapitres ─────────────────────────────────────────────────
export function ChapterAnchor({ id }: { id: string }) {
  return <div id={id} className="relative -top-20 invisible h-0" />;
}

export function ReadingToggle() {
  const { mode, toggle } = useReadingMode();
  const [showExplain, setShowExplain] = useState(false);

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowExplain(v => !v)}
          className="text-white/20 hover:text-white/50 transition text-sm w-5 h-5 rounded-full border border-white/20 hover:border-white/40 flex items-center justify-center leading-none">
          ?
        </button>
        <button onClick={toggle}
          className={`flex items-center gap-2.5 backdrop-blur rounded-full px-4 py-2 transition-all border ${
            mode === 'long'
              ? 'bg-amber-500/20 border-amber-500/50 hover:bg-amber-500/25'
              : 'bg-white/10 border-white/20 hover:bg-white/15'
          }`}>
          <span className="text-xs text-white/50 uppercase tracking-wide">
            {mode === 'long' ? 'Manque de temps ?' : 'Lecture'}
          </span>
          <div className={`relative w-12 h-5 rounded-full transition-all ${mode === 'long' ? 'bg-amber-500' : 'bg-white/25'}`}>
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${mode === 'long' ? 'left-7' : 'left-0.5'}`} />
          </div>
          <span className={`text-xs font-bold transition-colors ${mode === 'long' ? 'text-amber-300' : 'text-white/50'}`}>
            {mode === 'short' ? 'Essentiel' : 'Complet'}
          </span>
        </button>
      </div>

      {showExplain && (
        <div className="absolute right-0 top-10 w-72 bg-[#1a1a2e] border border-white/20 rounded-xl p-4 z-50 shadow-2xl">
          <div className="text-xs text-white/40 uppercase tracking-widest mb-2">Deux façons de lire</div>
          <p className="text-sm text-white/70 leading-relaxed mb-3">
            Le pétrole est peut-être la chose la plus importante de notre histoire récente.
            Selon le temps que vous voulez lui consacrer, deux versions existent.
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex gap-2 items-start">
              <div className="w-2 h-2 rounded-full bg-white/30 mt-1 shrink-0" />
              <div>
                <span className="text-white font-bold">Essentiel</span>
                <span className="text-white/50"> — Les faits, les chiffres, les ruptures majeures. (~5-7 min par acte)</span>
              </div>
            </div>
            <div className="flex gap-2 items-start">
              <div className="w-2 h-2 rounded-full bg-amber-400 mt-1 shrink-0" />
              <div>
                <span className="text-amber-400 font-bold">Complet</span>
                <span className="text-white/50"> — Les anecdotes, les coulisses, les détails qui expliquent vraiment. (~10-11 min par acte)</span>
              </div>
            </div>
          </div>
          <button onClick={() => setShowExplain(false)}
            className="mt-3 text-xs text-white/20 hover:text-white/50 transition">
            Fermer ✕
          </button>
        </div>
      )}
    </div>
  );
}

// Sections visibles seulement en mode long
export function Long({ children }: { children: React.ReactNode }) {
  const { mode } = useReadingMode();
  return mode === 'long' ? <>{children}</> : null;
}
