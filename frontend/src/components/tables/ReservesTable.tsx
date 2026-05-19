import type { Reserve, ReserveFlag } from '@/types';

interface ReservesTableProps {
  data: Reserve[];
  flags: ReserveFlag[];
}

export default function ReservesTable({ data, flags }: ReservesTableProps) {
  // Créer une map des flags par pays
  const flagsByCountry = flags.reduce((acc, flag) => {
    if (!acc[flag.country_code]) {
      acc[flag.country_code] = [];
    }
    acc[flag.country_code].push(flag);
    return acc;
  }, {} as Record<string, ReserveFlag[]>);

  // Couleur du badge selon type de flag
  const getFlagColor = (type: string) => {
    const colors = {
      red: 'bg-[#E94560]/20 text-oil-rust border-oil-rust/40',
      orange: 'bg-oil-sand/50 text-oil-blue border-oil-sand-dark/40/40',
      blue: 'bg-blue-500/20 text-blue-700 border-blue-500/40',
      purple: 'bg-purple-500/20 text-purple-700 border-purple-500/40',
    };
    return colors[type as keyof typeof colors] || colors.orange;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-oil-slate">
        Détails par Pays
      </h3>

      <div className="overflow-hidden border-2 border-oil-steel rounded-xl shadow-sm bg-white">
        <table className="min-w-full divide-y-2 divide-oil-sand-dark">
          <thead className="bg-gradient-to-r from-oil-slate to-oil-copper">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-oil-sand uppercase tracking-wider">
                Pays
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-oil-sand uppercase tracking-wider">
                Réserves 1P
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-oil-sand uppercase tracking-wider">
                2P / 3P
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-oil-sand uppercase tracking-wider">
                OPEC
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-oil-sand uppercase tracking-wider">
                Audité
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-oil-sand uppercase tracking-wider">
                Flags
              </th>
            </tr>
          </thead>
          <tbody className="bg-gradient-to-b from-white/80 to-oil-sand/50 divide-y divide-oil-sand-dark">
            {data.map((reserve) => {
              const countryFlags = flagsByCountry[reserve.country_code] || [];
              const criticalFlags = countryFlags.filter(f => f.flag_type === 'red' || f.flag_type === 'purple');
              
              return (
                <tr key={`${reserve.country_code}-${reserve.year}`} className="hover:bg-oil-sand/50/70 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-bold text-oil-slate">
                        {reserve.country_name}
                      </div>
                      <div className="text-xs text-oil-slate/60">
                        {reserve.country_code}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-base font-bold text-oil-slate">
                      {reserve.proven_1p ? `${reserve.proven_1p.toFixed(1)} Gb` : '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-oil-slate/60">
                    {reserve.probable_2p ? `${reserve.probable_2p.toFixed(1)} Gb` : '—'} / {reserve.possible_3p ? `${reserve.possible_3p.toFixed(1)} Gb` : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {reserve.is_opec_member ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-oil-sand text-oil-slate border border-oil-sand-dark/40">
                        ✓ Oui
                      </span>
                    ) : (
                      <span className="text-oil-slate/60 text-xs">Non</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {reserve.is_audited ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-300">
                        ✓ Oui
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-oil-sand/50 text-oil-blue border border-oil-sand-dark/40/40">
                        ✗ Non
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {countryFlags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {countryFlags.map((flag, idx) => (
                          <span
                            key={idx}
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold border ${getFlagColor(flag.flag_type)}`}
                            title={flag.flag_reason}
                          >
                            {flag.flag_type === 'red' && '🔴'}
                            {flag.flag_type === 'orange' && '🟠'}
                            {flag.flag_type === 'blue' && '🔵'}
                            {flag.flag_type === 'purple' && '🟣'}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-oil-slate/60 text-xs">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Note sur les catégories */}
      <div className="bg-oil-slate/10 p-4 rounded-lg border border-oil-sand-dark/40/30">
        <p className="text-sm text-oil-slate">
          <strong>Catégories :</strong> 1P (Prouvées), 2P (Prouvées + Probables), 3P (Prouvées + Probables + Possibles). 
          Un audit indépendant garantit une meilleure fiabilité des chiffres.
        </p>
      </div>
    </div>
  );
}
