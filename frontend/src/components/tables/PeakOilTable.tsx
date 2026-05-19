import type { PeakOilAnalysis } from '@/types';

interface PeakOilTableProps {
  data: PeakOilAnalysis[];
}

export default function PeakOilTable({ data }: PeakOilTableProps) {
  const scenarioNames: Record<string, string> = {
    'stated_policies': 'Stated Policies',
    'net_zero': 'Net Zero 2050',
    'reference': 'Reference',
    'low_growth': 'Low Growth',
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-oil-slate">
        Analyse Peak Oil par Scénario
      </h3>

      <div className="overflow-hidden border-2 border-oil-steel rounded-xl shadow-sm bg-white">
        <table className="min-w-full divide-y-2 divide-oil-sand-dark">
          <thead className="bg-gradient-to-r from-oil-slate to-oil-copper">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-oil-sand uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-oil-sand uppercase tracking-wider">
                Scénario
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-oil-sand uppercase tracking-wider">
                Peak Détecté
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-oil-sand uppercase tracking-wider">
                Année Peak
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-oil-sand uppercase tracking-wider">
                Valeur Peak
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-oil-sand uppercase tracking-wider">
                Déclin Post-Peak
              </th>
            </tr>
          </thead>
          <tbody className="bg-gradient-to-b from-white/80 to-oil-sand/50 divide-y divide-oil-sand-dark">
            {data.map((peak, idx) => (
              <tr key={idx} className="hover:bg-oil-sand/50/70 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-oil-slate uppercase">
                  {peak.source_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-oil-slate">
                  {scenarioNames[peak.scenario] || peak.scenario}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {peak.has_peak ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#E94560]/20 text-oil-rust border border-oil-rust/40">
                      ⚠️ Oui
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-oil-sand/50 text-oil-blue border border-oil-sand-dark/40/40">
                      ➡️ Non
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-base font-semibold text-oil-slate">
                  {peak.peak_year || '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-base font-semibold text-oil-slate">
                  {peak.peak_value ? `${peak.peak_value.toFixed(1)} mb/d` : '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {peak.decline_rate ? (
                    <span className="text-oil-rust font-bold">
                      -{peak.decline_rate.toFixed(1)}% / an
                    </span>
                  ) : (
                    <span className="text-oil-slate/60">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notes */}
      <div className="bg-oil-slate/10 p-4 rounded-lg border border-oil-sand-dark/40/30">
        <p className="text-sm text-oil-slate">
          <strong>Note:</strong> Un peak détecté indique que la demande atteint un maximum puis décline. 
          L'absence de peak suggère une croissance continue ou une stabilisation haute.
        </p>
      </div>
    </div>
  );
}
