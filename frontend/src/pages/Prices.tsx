import { useState } from 'react';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { usePriceComparison, usePriceStatistics, usePriceEvents } from '@/hooks/useHistorical';
import OilPricesChart from '@/components/charts/OilPricesChart';

export default function Prices() {
  const [yearRange, setYearRange] = useState<[number, number]>([1970, 2024]);
  const [useRealPrices, setUseRealPrices] = useState(false);
  const [showEvents, setShowEvents] = useState(true);

  // Fetch data
  const { data: priceData, isLoading: pricesLoading } = usePriceComparison({
    start_date: `${yearRange[0]}-01-01`,
    end_date: `${yearRange[1]}-12-31`,
    use_real: useRealPrices
  });

  const { data: statistics } = usePriceStatistics({
    benchmark: 'brent',
    start_year: yearRange[0],
    end_year: yearRange[1]
  });

  const { data: events } = usePriceEvents();

  return (
    <div className="min-h-screen bg-oil-sand-light p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-oil-slate via-oil-blue to-oil-green bg-clip-text text-transparent mb-2">
          Prix du Pétrole
        </h1>
        <p className="text-oil-slate/60 flex items-center gap-2">
          <DollarSign size={16} />
          Évolution historique des benchmarks mondiaux 1960-2024
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Controls */}
        <div className="lg:col-span-1 space-y-4">
          {/* Période */}
          <div className="bg-white p-6 rounded-xl border border-oil-rust/20 shadow-md">
            <h3 className="text-lg font-bold text-oil-slate mb-4 flex items-center gap-2">
              <Calendar size={18} />
              Période
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-oil-slate/60 font-semibold uppercase mb-1 block">
                  Début: {yearRange[0]}
                </label>
                <input
                  type="range"
                  min="1960"
                  max={yearRange[1]}
                  value={yearRange[0]}
                  onChange={(e) => setYearRange([parseInt(e.target.value), yearRange[1]])}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-xs text-oil-slate/60 font-semibold uppercase mb-1 block">
                  Fin: {yearRange[1]}
                </label>
                <input
                  type="range"
                  min={yearRange[0]}
                  max="2024"
                  value={yearRange[1]}
                  onChange={(e) => setYearRange([yearRange[0], parseInt(e.target.value)])}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Options d'affichage */}
          <div className="bg-white p-6 rounded-xl border border-oil-rust/20 shadow-md">
            <h3 className="text-lg font-bold text-oil-slate mb-4">Options</h3>
            
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm text-oil-slate cursor-pointer">
                <input
                  type="checkbox"
                  checked={useRealPrices}
                  onChange={(e) => setUseRealPrices(e.target.checked)}
                  className="w-4 h-4"
                />
                <div>
                  <div className="font-semibold">Prix Réels</div>
                  <div className="text-xs text-oil-slate/60">Ajustés inflation (2023)</div>
                </div>
              </label>

              <label className="flex items-center gap-2 text-sm text-oil-slate cursor-pointer">
                <input
                  type="checkbox"
                  checked={showEvents}
                  onChange={(e) => setShowEvents(e.target.checked)}
                  className="w-4 h-4"
                />
                <div>
                  <div className="font-semibold">Événements</div>
                  <div className="text-xs text-oil-slate/60">Marqueurs historiques</div>
                </div>
              </label>
            </div>
          </div>

          {/* Statistiques Brent */}
          {statistics && (
            <div className="bg-white p-6 rounded-xl border border-oil-rust/20 shadow-md">
              <h3 className="text-lg font-bold text-oil-slate mb-4 flex items-center gap-2">
                <TrendingUp size={18} />
                Stats Brent
              </h3>
              
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-oil-slate/60 uppercase font-semibold mb-1">Maximum</div>
                  <div className="text-2xl font-bold text-oil-rust">
                    ${statistics.nominal.max.toFixed(2)}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-oil-slate/60 uppercase font-semibold mb-1">Moyenne</div>
                  <div className="text-2xl font-bold text-oil-blue">
                    ${statistics.nominal.mean.toFixed(2)}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-oil-slate/60 uppercase font-semibold mb-1">Minimum</div>
                  <div className="text-2xl font-bold text-oil-slate">
                    ${statistics.nominal.min.toFixed(2)}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-oil-slate/60 uppercase font-semibold mb-1">Volatilité</div>
                  <div className="text-xl font-bold text-oil-slate/60">
                    ±${statistics.nominal.std_dev.toFixed(2)}
                  </div>
                </div>

                {useRealPrices && statistics.real_2023 && (
                  <div className="pt-3 border-t border-oil-steel">
                    <div className="text-xs text-oil-rust font-bold mb-2">PRIX RÉELS (2023$)</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-oil-slate/60">Max:</span>
                        <span className="font-bold">${statistics.real_2023.max.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-oil-slate/60">Moyenne:</span>
                        <span className="font-bold">${statistics.real_2023.mean.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-oil-slate/60">Min:</span>
                        <span className="font-bold">${statistics.real_2023.min.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Price Chart */}
          <div className="bg-white p-8 rounded-xl border border-oil-rust/20 shadow-md">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-oil-slate mb-2">
                Évolution des Prix
              </h2>
              <p className="text-sm text-oil-slate/60">
                Benchmarks Brent (Mer du Nord), WTI (Texas), Dubai (Moyen-Orient)
                {useRealPrices && ' • Prix ajustés inflation (dollars 2023)'}
              </p>
            </div>

            {pricesLoading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-oil-slate/60">Chargement des données...</div>
              </div>
            ) : !priceData || priceData.length === 0 ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-oil-slate/60">Aucune donnée disponible</div>
              </div>
            ) : (
              <OilPricesChart
                data={priceData}
                useRealPrices={useRealPrices}
                showEvents={showEvents}
              />
            )}
          </div>

          {/* Événements clés */}
          {events && events.length > 0 && (
            <div className="bg-white p-8 rounded-xl border border-oil-rust/20 shadow-md">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-oil-slate mb-2">
                  Événements Clés
                </h2>
                <p className="text-sm text-oil-slate/60">
                  Moments marquants de l'histoire du prix du pétrole
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map((event, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-4 rounded-lg border-2 border-oil-steel"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-lg font-bold text-oil-rust">
                        {event.year}
                      </div>
                      <div className="text-sm font-semibold text-oil-blue">
                        ${event.price_usd}
                      </div>
                    </div>
                    <div className="text-sm text-oil-slate font-semibold mb-1">
                      {event.event}
                    </div>
                    <div className="text-xs text-oil-slate/60">
                      Équivalent 2023: ${event.real_2023.toFixed(0)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
