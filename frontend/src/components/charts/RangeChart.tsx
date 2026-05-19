import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart } from 'recharts';
import type { ProductionRange } from '@/types';

interface RangeChartProps {
  data: ProductionRange[];
}

export default function RangeChart({ data }: RangeChartProps) {
  // Transformer les données pour Recharts
  const chartData = data.map(item => ({
    year: item.year,
    low: item.low,
    central: item.central,
    high: item.high,
    range: [item.low, item.high],
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#D4C7B3" />
        <XAxis 
          dataKey="year" 
          stroke="#8B6F47"
          style={{ fontSize: '14px', fontWeight: '500' }}
        />
        <YAxis 
          stroke="#8B6F47"
          style={{ fontSize: '14px', fontWeight: '500' }}
          label={{ value: 'Production (mb/d)', angle: -90, position: 'insideLeft', style: { fill: '#8B4513', fontWeight: '600' } }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#FFFAF4', 
            border: '1px solid #D4C7B3',
            borderRadius: '12px',
            padding: '12px',
            boxShadow: '0 4px 6px rgba(217, 118, 66, 0.2)'
          }}
          labelStyle={{ color: '#2C3E50', fontWeight: '700' }}
          formatter={(value: number) => [value.toFixed(2) + ' mb/d', '']}
        />
        <Legend 
          wrapperStyle={{ paddingTop: '20px', fontWeight: '500' }}
        />
        
        {/* Bande de range (low à high) */}
        <Area
          type="monotone"
          dataKey="high"
          stroke="none"
          fill="#A67C52"
          fillOpacity={0.3}
          name="Range haute"
        />
        <Area
          type="monotone"
          dataKey="low"
          stroke="none"
          fill="#ffffff"
          fillOpacity={1}
          name="Range basse"
        />
        
        {/* Ligne centrale */}
        <Line
          type="monotone"
          dataKey="central"
          stroke="#B85450"
          strokeWidth={4}
          dot={{ fill: '#B85450', r: 6, strokeWidth: 2, stroke: '#ffffff' }}
          name="Valeur centrale"
        />
        
        {/* Lignes de range */}
        <Line
          type="monotone"
          dataKey="low"
          stroke="#A67C52"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
          name="Borne basse"
        />
        <Line
          type="monotone"
          dataKey="high"
          stroke="#A67C52"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
          name="Borne haute"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
