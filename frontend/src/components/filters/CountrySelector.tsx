import { useCountries } from '@/hooks/useProduction';

interface CountrySelectorProps {
  value: string;
  onChange: (country: string) => void;
}

export default function CountrySelector({ value, onChange }: CountrySelectorProps) {
  const { data: countries, isLoading } = useCountries();

  if (isLoading) {
    return (
      <select className="px-4 py-2 border-2 border-oil-steel rounded-lg bg-white font-medium" disabled>
        <option>Chargement...</option>
      </select>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-bold text-oil-slate uppercase tracking-wide">Pays</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-2 border-2 border-oil-steel rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-oil-bronze focus:border-oil-sand-dark/40 cursor-pointer font-medium text-oil-slate hover:border-oil-sand-dark/40 transition-colors"
      >
        {countries?.map((country) => (
          <option key={country.code} value={country.code}>
            {country.name}
          </option>
        ))}
      </select>
    </div>
  );
}
