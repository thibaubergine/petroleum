import { useState } from 'react';
import type { CountryReservesSummary } from '@/types';

interface WorldMapProps {
  data: CountryReservesSummary[];
  onCountryClick?: (country: CountryReservesSummary) => void;
}

export default function WorldMap({ data, onCountryClick }: WorldMapProps) {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  console.log('WorldMap render - data:', data?.length || 0, 'countries');

  // Convertir lat/lng en coordonnées SVG
  const projectToSVG = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * 1000;
    const y = ((90 - lat) / 180) * 500;
    return { x, y };
  };

  // Déterminer la couleur du marqueur selon les réserves
  const getMarkerColor = (reserves: number) => {
    if (reserves > 200) return '#B85450';
    if (reserves > 100) return '#A67C52';
    if (reserves > 50) return '#A67C52';
    if (reserves > 20) return '#8B6F47';
    return '#2C3E50';
  };

  // Déterminer la taille du marqueur
  const getMarkerSize = (reserves: number) => {
    if (reserves > 200) return 16;
    if (reserves > 100) return 13;
    if (reserves > 50) return 10;
    if (reserves > 20) return 7;
    return 5;
  };

  // Nombre de flags critiques
  const getCriticalFlagsCount = (country: CountryReservesSummary) => {
    return country.flags.filter(f => f.flag_type === 'red' || f.flag_type === 'purple').length;
  };

  return (
    <div className="relative w-full rounded-xl border-4 border-oil-rust overflow-hidden" style={{ minHeight: '600px', backgroundColor: '#F5F0E8' }}>
      <div className="absolute top-0 left-0 p-4 bg-oil-slate text-white font-bold z-50">
        CARTE MONDIALE - {data?.length || 0} pays
      </div>
      
      <svg viewBox="0 0 1000 500" className="w-full" style={{ height: '500px', display: 'block' }}>
        {/* Fond océan */}
        <rect width="1000" height="500" fill="#D4E4F0" />
        
        {/* Image de carte du monde en arrière-plan */}
        <image 
          href="https://upload.wikimedia.org/wikipedia/commons/8/83/Equirectangular_projection_SW.jpg"
          x="0" 
          y="0" 
          width="1000" 
          height="500"
          opacity="0.15"
          preserveAspectRatio="xMidYMid slice"
        />
        
        {/* Grille géographique par-dessus */}
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#8B6F47" strokeWidth="0.5" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width="1000" height="500" fill="url(#grid)" />

        {/* Lignes géographiques principales */}
        <line x1="0" y1="250" x2="1000" y2="250" stroke="#2C3E50" strokeWidth="2" opacity="0.4" strokeDasharray="5,5" />
        <text x="10" y="245" fontSize="11" fill="#2C3E50" fontWeight="600" opacity="0.7">Équateur</text>
        
        <line x1="0" y1="155" x2="1000" y2="155" stroke="#8B6F47" strokeWidth="1" opacity="0.2" strokeDasharray="3,3" />
        <text x="10" y="150" fontSize="9" fill="#8B6F47" opacity="0.6">Tropique Cancer</text>
        
        <line x1="0" y1="345" x2="1000" y2="345" stroke="#8B6F47" strokeWidth="1" opacity="0.2" strokeDasharray="3,3" />
        <text x="10" y="340" fontSize="9" fill="#8B6F47" opacity="0.6">Tropique Capricorne</text>

        {data && data.map((country) => {
          const pos = projectToSVG(country.latitude, country.longitude);
          const size = getMarkerSize(country.proven_1p);
          const color = getMarkerColor(country.proven_1p);
          const isHovered = hoveredCountry === country.country_code;
          const criticalFlags = getCriticalFlagsCount(country);

          return (
            <g
              key={country.country_code}
              onMouseEnter={() => setHoveredCountry(country.country_code)}
              onMouseLeave={() => setHoveredCountry(null)}
              onClick={() => onCountryClick?.(country)}
              className="cursor-pointer"
            >
              <circle
                cx={pos.x}
                cy={pos.y}
                r={size}
                fill={color}
                stroke="white"
                strokeWidth={isHovered ? 3 : 2}
                opacity={0.9}
              />
              <text x={pos.x} y={pos.y - size - 5} fontSize="10" fill="#2C3E50" textAnchor="middle" fontWeight="600">
                {country.country_code}
              </text>
              {country.is_opec_member && (
                <circle cx={pos.x} cy={pos.y} r={size + 3} fill="none" stroke="#A67C52" strokeWidth="2" opacity="0.6" />
              )}
              {isHovered && (
                <g>
                  <rect x={pos.x + size + 5} y={pos.y - 30} width="150" height="60" fill="white" stroke="#A67C52" strokeWidth="2" rx="8" />
                  <text x={pos.x + size + 12} y={pos.y - 10} fontSize="12" fontWeight="700" fill="#2C3E50">{country.country_name}</text>
                  <text x={pos.x + size + 12} y={pos.y + 5} fontSize="11" fill="#8B6F47">{country.proven_1p.toFixed(1)} Gb</text>
                  {criticalFlags > 0 && (
                    <text x={pos.x + size + 12} y={pos.y + 20} fontSize="10" fill="#B85450" fontWeight="600">
                      ⚠ {criticalFlags} flag{criticalFlags > 1 ? 's' : ''}
                    </text>
                  )}
                </g>
              )}
            </g>
          );
        })}
      </svg>

      <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg border border-oil-rust/20 shadow-lg">
        <h4 className="text-xs font-bold text-oil-slate mb-2 uppercase">Légende</h4>
        <div className="space-y-1 text-xs text-oil-slate">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#B85450]" />
            <span>&gt;200 Gb</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#A67C52]" />
            <span>100-200 Gb</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#8B6F47]" />
            <span>20-100 Gb</span>
          </div>
        </div>
      </div>
    </div>
  );
}
