import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Link, useLocation, NavLink } from 'react-router-dom';
import { useEffect } from 'react';
import { ReadingModeProvider } from './context/ReadingMode';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// Pages narratives
import Landing from './pages/narrative/Landing';
import PastStory from './pages/narrative/PastStory';
import PresentStory from './pages/narrative/PresentStory';
import FutureStory from './pages/narrative/FutureStory';

// Pages dashboard
import Production from './pages/Production';
import Demand from './pages/Demand';
import Reserves from './pages/Reserves';
import Historical from './pages/Historical';
import Prices from './pages/Prices';
import Sources from './pages/Sources';
import Analytics from './pages/Analytics';
import Market from './pages/Market';

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});

// ── Layout narratif (landing + 3 histoires) ──────────────────────────────────
function NarrativeNav() {
  const loc = useLocation();
  const isDashboard = loc.pathname.startsWith('/dashboard');

  return (
    <nav className="sticky top-0 z-50 bg-oil-slate/95 backdrop-blur-sm border-b border-white/10 shadow-xl">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
        {/* Logo */}
        <Link to="/" className="text-white font-black text-xl tracking-tight hover:text-oil-sand transition"
          style={{ fontVariant: 'small-caps' }}>
          Petroleum
        </Link>

        {/* Nav histoires */}
        <div className="flex items-center gap-1">
          {[
            { to: '/passe',      label: 'Le Passé',    color: 'hover:text-amber-300' },
            { to: '/present',    label: "Aujourd'hui",  color: 'hover:text-blue-300' },
            { to: '/futur',      label: 'Le Futur',    color: 'hover:text-green-300' },
          ].map(({ to, label, color }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-semibold rounded transition-all ${color} ${
                  isActive ? 'text-white bg-white/15' : 'text-white/60'
                }`}>
              {label}
            </NavLink>
          ))}

          {/* Séparateur */}
          <div className="w-px h-5 bg-white/20 mx-2" />

          {/* Lien dashboard */}
          <NavLink to="/dashboard"
            className={({ isActive }) =>
              `px-3 py-1.5 text-xs font-bold rounded border transition-all ${
                isActive || isDashboard
                  ? 'border-oil-sand/60 text-oil-sand bg-white/10'
                  : 'border-white/20 text-white/40 hover:text-white/70 hover:border-white/40'
              }`}>
            Dashboard →
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

// ── Layout dashboard ──────────────────────────────────────────────────────────
function DashboardNav() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const tabs = [
    { path: '/dashboard',            label: 'Production' },
    { path: '/dashboard/demand',     label: 'Demande'    },
    { path: '/dashboard/reserves',   label: 'Reserves'   },
    { path: '/dashboard/historical', label: 'Historique' },
    { path: '/dashboard/prices',     label: 'Prix'       },
    { path: '/dashboard/market',     label: 'Marché'     },
    { path: '/dashboard/analytics',  label: 'Analytics'  },
    { path: '/dashboard/sources',    label: 'Sources'    },
  ];
  return (
    <div className="bg-oil-slate border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 flex items-center gap-4">
        <Link to="/" className="text-white/40 hover:text-white/80 text-xs py-3 transition shrink-0">
          ← Récits
        </Link>
        <div className="w-px h-5 bg-white/20" />
        <div className="flex overflow-x-auto">
          {tabs.map(({ path, label }) => (
            <Link key={path} to={path}
              className={`px-5 py-3.5 font-bold text-xs uppercase tracking-widest whitespace-nowrap transition-all border-b-2 ${
                isActive(path)
                  ? 'text-oil-sand border-oil-sand'
                  : 'text-white/50 border-transparent hover:text-white/80'
              }`}>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-oil-sand-light">
      {/* Header avec image */}
      <div className="relative overflow-hidden" style={{ height: '200px' }}>
        <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/header-bg.png)', backgroundPosition: 'center 40%' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-oil-slate/70 via-oil-slate/60 to-oil-slate/85" />
        <div className="relative h-full flex flex-col justify-center px-8">
          <div className="flex items-baseline gap-3">
            <h1 className="text-3xl font-black text-white tracking-tight"
              style={{ fontVariant: 'small-caps' }}>
              Petroleum
            </h1>
            <span className="text-white/30 text-sm font-light italic hidden md:block">
              Le feu souterrain — une énergie prométhéenne
            </span>
          </div>
          <p className="text-xs text-white/40 mt-1">Dashboard analytique</p>
        </div>
      </div>
      <DashboardNav />
      {children}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* ── Pages narratives ── */}
          <Route path="/" element={<><NarrativeNav /><Landing /></>} />
          <Route path="/passe"   element={<><NarrativeNav /><PastStory /></>} />
          <Route path="/present" element={<><NarrativeNav /><PresentStory /></>} />
          <Route path="/futur"   element={<><NarrativeNav /><FutureStory /></>} />

          {/* ── Dashboard ── */}
          <Route path="/dashboard" element={<DashboardLayout><Production /></DashboardLayout>} />
          <Route path="/dashboard/demand"     element={<DashboardLayout><Demand /></DashboardLayout>} />
          <Route path="/dashboard/reserves"   element={<DashboardLayout><Reserves /></DashboardLayout>} />
          <Route path="/dashboard/historical" element={<DashboardLayout><Historical /></DashboardLayout>} />
          <Route path="/dashboard/prices"     element={<DashboardLayout><Prices /></DashboardLayout>} />
          <Route path="/dashboard/market"     element={<DashboardLayout><Market /></DashboardLayout>} />
          <Route path="/dashboard/analytics"  element={<DashboardLayout><Analytics /></DashboardLayout>} />
          <Route path="/dashboard/sources"    element={<DashboardLayout><Sources /></DashboardLayout>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
