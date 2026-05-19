import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ProductionByMethod } from '@/types';

interface MethodStackedChartProps {
  data: ProductionByMethod[];
  countryName?: string;
}

export default function MethodStackedChart({ data, countryName }: MethodStackedChartProps) {
  // Transformer les données pour Recharts
  // Grouper par année, puis créer un objet avec toutes les méthodes
  const chartData = data.reduce((acc, item) => {
    const existing = acc.find(d => d.year === item.year);
    if (existing) {
      existing[item.method] = item.production_value;
    } else {
      acc.push({
        year: item.year,
        [item.method]: item.production_value,
      });
    }
    return acc;
  }, [] as any[]);

  // Trier par année
  chartData.sort((a, b) => a.year - b.year);

  // Couleurs de la nouvelle palette
  const methodColors: Record<string, string> = {
    conventional: '#C17F24',     // Bronze
    oil_sands: '#8B4513',        // Cuivre
    shale: '#B85450',            // Rust
    offshore: '#556B2F',         // Olive
    eor: '#5B7C99',              // Bleu gris
  };

  // Noms lisibles
  const methodNames: Record<string, string> = {
    conventional: 'Conventional',
    oil_sands: 'Oil Sands',
    shale: 'Shale',
    offshore: 'Offshore',
    eor: 'EOR',
  };

  // Extraire les méthodes présentes dans les données
  const methods = Array.from(new Set(data.map(d => d.method)));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-bold text-oil-slate mb-4">
        {countryName ? `Production par Méthode - ${countryName}` : 'Production par Méthode d\'Extraction'}
      </h3>
      
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#D4C7B3" />
          <XAxis 
            dataKey="year" 
            stroke="#2C3E50"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#2C3E50"
            style={{ fontSize: '12px' }}
            label={{ value: 'mb/d', angle: -90, position: 'insideLeft', fill: '#2C3E50' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#F5F0E8', 
              border: '1px solid #A67C52',
              borderRadius: '4px'
            }}
            formatter={(value: number) => `${value.toFixed(2)} mb/d`}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => methodNames[value] || value}
          />
          
          {methods.map(method => (
            <Area
              key={method}
              type="monotone"
              dataKey={method}
              stackId="1"
              stroke={methodColors[method] || '#8B4513'}
              fill={methodColors[method] || '#8B4513'}
              fillOpacity={0.7}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 text-sm text-oil-slate">
        <p className="font-semibold">Légende des méthodes :</p>
        <ul className="mt-2 space-y-1 text-xs">
          <li><strong>Conventional</strong> : Pétrole onshore traditionnel</li>
          <li><strong>Oil Sands</strong> : Sables bitumineux (Canada Alberta)</li>
          <li><strong>Shale</strong> : Pétrole de schiste par fracturation (USA Permian)</li>
          <li><strong>Offshore</strong> : Extraction en mer (deep/ultra-deep)</li>
          <li><strong>EOR</strong> : Enhanced Oil Recovery (récupération assistée)</li>
        </ul>
      </div>
    </div>
  );
}
