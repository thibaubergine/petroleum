interface YearRangePickerProps {
  startYear: number;
  endYear: number;
  onStartChange: (year: number) => void;
  onEndChange: (year: number) => void;
}

export default function YearRangePicker({ 
  startYear, 
  endYear, 
  onStartChange, 
  onEndChange 
}: YearRangePickerProps) {
  const years = Array.from({ length: 31 }, (_, i) => 2000 + i); // 2000-2030

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-bold text-oil-slate uppercase tracking-wide">Période</label>
      <div className="flex items-center gap-3">
        <select
          value={startYear}
          onChange={(e) => onStartChange(Number(e.target.value))}
          className="px-4 py-2 border-2 border-oil-steel rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-oil-bronze focus:border-oil-sand-dark/40 font-medium text-oil-slate hover:border-oil-sand-dark/40 transition-colors"
        >
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        
        <span className="text-oil-blue font-bold text-lg">→</span>
        
        <select
          value={endYear}
          onChange={(e) => onEndChange(Number(e.target.value))}
          className="px-4 py-2 border-2 border-oil-steel rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-oil-bronze focus:border-oil-sand-dark/40 font-medium text-oil-slate hover:border-oil-sand-dark/40 transition-colors"
        >
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
