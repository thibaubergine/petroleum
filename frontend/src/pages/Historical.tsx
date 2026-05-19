import { useState, useMemo } from 'react';
import { Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { 
  useHistoricalProduction, 
  useHistoricalCountries,
  useProductionAnalytics
} from '@/hooks/useHistorical';
import HistoricalTimeline from '@/components/charts/HistoricalTimeline';

export default function Historical() {
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['USA', 'SAU', 'RUS']);
  const [yearRange, setYearRange] = useState<[number, number]>([1980, 2023]);
  const [showPeaks, setShowPeaks] = useState(true);

  // Fetch data
  const { data: countries, isLoading: countriesLoading } = useHistoricalCountries();
  const { data: production, isLoading: productionLoading } = useHistoricalProduction({
    start_year: yearRange[0],
    end_year: yearRange[1]
  });
  const { data: analytics, isLoading: analyticsLoading } = useProductionAnalytics({
    metric_type: 'peak_year'
  });

  // Données filtrées pour pays sélectionnés
  const filteredProduction = useMemo(() => {
    if (!production) return [];
    return production.filter(p => selectedCountries.includes(p.country_code));
  }, [production, selectedCountries]);

  // Grouper pays par OPEC/Non-OPEC
  const countriesByGroup = useMemo(() => {
    if (!countries) return { opec: [], nonOpec: [] };
    
    return {
      opec: countries.filter(c => c.is_opec_member).sort((a, b) => a.country_name.localeCompare(b.country_name)),
      nonOpec: countries.filter(c => !c.is_opec_member).sort((a, b) => a.country_name.localeCompare(b.country_name))
    };
  }, [countries]);

  const toggleCountry = (code: string) => {
    setSelectedCountries(prev => 
      prev.includes(code) 
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  const selectAll = (group: 'opec' | 'nonOpec' | 'all') => {
    if (group === 'all') {
      setSelectedCountries(countries?.map(c => c.country_code) || []);
    } else if (group === 'opec') {
      setSelectedCountries(countriesByGroup.opec.map(c => c.country_code));
    } else {
      setSelectedCountries(countriesByGroup.nonOpec.map(c => c.country_code));
    }
  };

  if (countriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-oil-slate/60">Chargement des données historiques...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-oil-sand-light p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-oil-slate via-oil-blue to-oil-green bg-clip-text text-transparent mb-2">
          Production Historique
        </h1>
        <p className="text-oil-slate/60 flex items-center gap-2">
          <Calendar size={16} />
          Analyse de la production pétrolière mondiale 1965-2023
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
                  min="1965"
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
                  max="2023"
                  value={yearRange[1]}
                  onChange={(e) => setYearRange([yearRange[0], parseInt(e.target.value)])}
                  className="w-full"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-sm text-oil-slate cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPeaks}
                    onChange={(e) => setShowPeaks(e.target.checked)}
                    className="w-4 h-4"
                  />
                  Afficher les pics
                </label>
              </div>
            </div>
          </div>

          {/* Sélection pays */}
          <div className="bg-white p-6 rounded-xl border border-oil-rust/20 shadow-md">
            <h3 className="text-lg font-bold text-oil-slate mb-4">
              Pays ({selectedCountries.length} sélectionnés)
            </h3>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => selectAll('all')}
                className="flex-1 px-3 py-1.5 bg-oil-slate text-white rounded text-xs font-semibold hover:bg-[#E94560] transition"
              >
                Tous
              </button>
              <button
                onClick={() => selectAll('opec')}
                className="flex-1 px-3 py-1.5 bg-oil-sand-light text-white rounded text-xs font-semibold hover:bg-oil-slate transition"
              >
                OPEC
              </button>
              <button
                onClick={() => selectAll('nonOpec')}
                className="flex-1 px-3 py-1.5 bg-[#A0A8B8] text-white rounded text-xs font-semibold hover:bg-oil-slate transition"
              >
                Non-OPEC
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {/* OPEC */}
              <div>
                <div className="text-xs font-bold text-oil-rust uppercase mb-2">OPEC</div>
                <div className="space-y-1">
                  {countriesByGroup.opec.map(country => (
                    <label
                      key={country.country_code}
                      className="flex items-center gap-2 text-sm text-oil-slate cursor-pointer hover:bg-oil-sand p-1 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCountries.includes(country.country_code)}
                        onChange={() => toggleCountry(country.country_code)}
                        className="w-4 h-4"
                      />
                      <span>{country.country_name}</span>
                      <span className="text-xs text-oil-slate/60 ml-auto">
                        {country.start_year}-{country.end_year}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Non-OPEC */}
              <div>
                <div className="text-xs font-bold text-oil-slate uppercase mb-2">Non-OPEC</div>
                <div className="space-y-1">
                  {countriesByGroup.nonOpec.map(country => (
                    <label
                      key={country.country_code}
                      className="flex items-center gap-2 text-sm text-oil-slate cursor-pointer hover:bg-oil-sand p-1 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCountries.includes(country.country_code)}
                        onChange={() => toggleCountry(country.country_code)}
                        className="w-4 h-4"
                      />
                      <span>{country.country_name}</span>
                      <span className="text-xs text-oil-slate/60 ml-auto">
                        {country.start_year}-{country.end_year}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Timeline Chart */}
          <div className="bg-white p-8 rounded-xl border border-oil-rust/20 shadow-md">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-oil-slate mb-2">
                Évolution de la Production
              </h2>
              <p className="text-sm text-oil-slate/60">
                Production pétrolière en millions de barils par jour (mb/d)
              </p>
            </div>

            {productionLoading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-oil-slate/60">Chargement des données...</div>
              </div>
            ) : filteredProduction.length === 0 ? (
              <div className="flex items-center justify-center h-96">
                <div className="flex items-center gap-2 text-oil-slate/60">
                  <AlertCircle size={20} />
                  <span>Aucune donnée pour la sélection actuelle</span>
                </div>
              </div>
            ) : (
              <HistoricalTimeline
                data={filteredProduction}
                selectedCountries={selectedCountries}
                showPeaks={showPeaks}
              />
            )}
          </div>

          {/* Analytics Summary */}
          {analytics && analytics.length > 0 && (
            <div className="bg-white p-8 rounded-xl border border-oil-rust/20 shadow-md">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-oil-slate mb-2 flex items-center gap-2">
                  <TrendingUp size={24} />
                  Détection des Pics
                </h2>
                <p className="text-sm text-oil-slate/60">
                  Année de production maximale par pays avec niveau de confiance
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {analytics
                  .filter(a => selectedCountries.includes(a.country_code))
                  .sort((a, b) => (b.value - a.value))
                  .map(analytic => (
                    <div
                      key={analytic.country_code}
                      className="bg-white p-4 rounded-lg border-2 border-oil-steel"
                    >
                      <div className="text-xs font-bold text-oil-slate/60 uppercase mb-1">
                        {analytic.country_code}
                      </div>
                      <div className="text-2xl font-bold text-oil-rust mb-1">
                        {Math.round(analytic.value)}
                      </div>
                      <div className="text-xs text-oil-slate">
                        Confiance: {analytic.confidence}%
                      </div>
                      {analytic.meta_info?.years_since_peak !== undefined && (
                        <div className="text-xs text-oil-slate/60 mt-1">
                          Il y a {analytic.meta_info.years_since_peak} ans
                        </div>
                      )}
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
