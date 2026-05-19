import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import type { ReservesByType } from '@/types';

interface ReservesTypesPieChartProps {
  data: ReservesByType[];
}

export default function ReservesTypesPieChart({ data }: ReservesTypesPieChartProps) {
  // Couleurs par type de réserve
  const typeColors: Record<string, string> = {
    conventional: '#C17F24',     // Bronze
    oil_sands: '#8B4513',        // Cuivre
    extra_heavy: '#B85450',      // Rust
    shale: '#556B2F',            // Olive
    offshore: '#5B7C99',         // Bleu gris
  };

  // Noms lisibles en français
  const typeNames: Record<string, string> = {
    conventional: 'Conventional',
    oil_sands: 'Oil Sands',
    extra_heavy: 'Extra Heavy',
    shale: 'Shale',
    offshore: 'Offshore',
  };

  // Préparer les données pour le pie chart
  const chartData = data.map(item => ({
    name: typeNames[item.reserve_type] || item.reserve_type,
    value: item.total_reserves,
    percentage: item.percentage,
    countries: item.countries_count,
    type: item.reserve_type,
  }));

  // Calculer le total
  const total = data.reduce((sum, item) => sum + item.total_reserves, 0);

  // Custom label pour afficher les pourcentages
  const renderLabel = (entry: any) => {
    return `${entry.percentage.toFixed(1)}%`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-bold text-oil-slate mb-4">
        Répartition des Réserves par Type (2023)
      </h3>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Graphique */}
        <div className="flex-1">
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderLabel}
                outerRadius={120}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={typeColors[entry.type] || '#8B4513'} 
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#F5F0E8', 
                  border: '1px solid #A67C52',
                  borderRadius: '4px'
                }}
                formatter={(value: number, name: string, props: any) => [
                  `${value.toFixed(1)} Gb (${props.payload.percentage.toFixed(1)}%)`,
                  name
                ]}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry: any) => 
                  `${value} (${entry.payload.countries} pays)`
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Tableau détaillé */}
        <div className="flex-1">
          <div className="bg-white rounded-lg p-4 border border-oil-steel">
            <h4 className="font-semibold text-oil-slate mb-3">Détails par Type</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-oil-steel">
                  <th className="text-left py-2 text-oil-slate">Type</th>
                  <th className="text-right py-2 text-oil-slate">Gb</th>
                  <th className="text-right py-2 text-oil-slate">%</th>
                  <th className="text-right py-2 text-oil-slate">Pays</th>
                </tr>
              </thead>
              <tbody>
                {chartData
                  .sort((a, b) => b.value - a.value)
                  .map((item, idx) => (
                    <tr key={idx} className="border-b border-oil-steel/50">
                      <td className="py-2 flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: typeColors[item.type] }}
                        />
                        <span className="text-oil-slate">{item.name}</span>
                      </td>
                      <td className="text-right text-oil-slate font-mono">
                        {item.value.toFixed(1)}
                      </td>
                      <td className="text-right text-oil-slate/60 font-semibold">
                        {item.percentage.toFixed(1)}%
                      </td>
                      <td className="text-right text-oil-slate">
                        {item.countries}
                      </td>
                    </tr>
                  ))}
                <tr className="font-bold border-t-2 border-oil-sand-dark/40">
                  <td className="py-2 text-oil-slate">Total</td>
                  <td className="text-right text-oil-slate font-mono">
                    {total.toFixed(1)}
                  </td>
                  <td className="text-right text-oil-blue">100%</td>
                  <td className="text-right text-oil-slate">
                    {data.reduce((sum, item) => sum + item.countries_count, 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Note */}
          <div className="mt-4 text-xs text-oil-slate bg-oil-sand/50-light p-3 rounded">
            <p className="font-semibold mb-1">Note :</p>
            <p>
              Les réserves <strong>Extra Heavy</strong> (Venezuela) ont un taux de récupération &lt;20% 
              en raison de la forte viscosité. Les valeurs affichées sont les réserves <strong>déclarées</strong>, 
              pas nécessairement récupérables économiquement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
