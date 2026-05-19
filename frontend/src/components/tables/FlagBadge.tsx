interface FlagBadgeProps {
  flag: string;
}

export default function FlagBadge({ flag }: FlagBadgeProps) {
  // Extraire le type de flag (red, orange, blue, gray)
  const type = flag.split(':')[0].toLowerCase();
  const message = flag.split(':')[1]?.trim() || flag;

  const colorMap: Record<string, string> = {
    red: 'bg-[#E94560]/20 text-oil-rust border-oil-rust/40',
    orange: 'bg-oil-sand/50 text-oil-blue border-oil-sand-dark/40/40',
    blue: 'bg-oil-sand/50 text-oil-blue border-oil-sand-dark/40/40',
    gray: 'bg-[#A0A8B8]/20 text-oil-slate/60 border-oil-copper/40',
  };

  const iconMap: Record<string, string> = {
    red: '⚠️',
    orange: '⚡',
    blue: '✨',
    gray: '📊',
  };

  const colorClass = colorMap[type] || colorMap.gray;
  const icon = iconMap[type] || iconMap.gray;

  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border-2 ${colorClass} shadow-sm`}>
      <span className="text-base">{icon}</span>
      <span>{message}</span>
    </span>
  );
}
