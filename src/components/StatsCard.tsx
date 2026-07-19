interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  variant?: 'default' | 'success' | 'danger' | 'warning';
}

export default function StatsCard({ title, value, subtitle, icon, variant = 'default' }: StatsCardProps) {
  const variantStyles = {
    default: 'bg-white border-slate-200',
    success: 'bg-emerald-50 border-emerald-200',
    danger: 'bg-red-50 border-red-200',
    warning: 'bg-amber-50 border-amber-200',
  };

  const iconStyles = {
    default: 'bg-primary-100 text-primary-600',
    success: 'bg-emerald-100 text-emerald-600',
    danger: 'bg-red-100 text-red-600',
    warning: 'bg-amber-100 text-amber-600',
  };

  return (
    <div className={`rounded-2xl border p-6 shadow-sm ${variantStyles[variant]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconStyles[variant]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
