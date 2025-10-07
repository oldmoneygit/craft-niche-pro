import { LucideIcon } from 'lucide-react';

interface DashboardStatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  variant: 'today' | 'month' | 'pending' | 'inactive';
  description?: string;
  trend?: 'positive' | 'negative' | 'neutral';
  onClick?: () => void;
}

export function DashboardStatCard({
  label,
  value,
  icon: Icon,
  variant,
  description,
  trend = 'neutral',
  onClick
}: DashboardStatCardProps) {
  const variantColors = {
    today: 'var(--secondary)',
    month: 'var(--primary)',
    pending: 'var(--warning)',
    inactive: 'var(--destructive)'
  };

  const accentColor = variantColors[variant];

  return (
    <div
      className="relative overflow-hidden rounded-[20px] p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
      style={{
        background: 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 24px var(--shadow)',
        cursor: onClick ? 'pointer' : 'default'
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = accentColor;
        e.currentTarget.style.boxShadow = '0 8px 32px var(--shadow)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = '0 4px 24px var(--shadow)';
      }}
    >
      {/* Barra superior colorida */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: `linear-gradient(90deg, ${accentColor} 0%, transparent 100%)`
        }}
      />

      {/* HEADER: Label (esquerda) + Ícone (direita) */}
      <div className="flex justify-between items-start mb-4">
        {/* Label */}
        <div
          className="text-[13px] font-semibold uppercase tracking-wider leading-tight"
          style={{ color: 'var(--text-muted)' }}
        >
          {label}
        </div>

        {/* Ícone */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)`
          }}
        >
          <Icon className="w-6 h-6 text-white" strokeWidth={2} />
        </div>
      </div>

      {/* VALOR - Grande e destacado */}
      <div
        className="text-[36px] font-bold leading-none mb-2"
        style={{ color: 'var(--text-primary)' }}
      >
        {value}
      </div>

      {/* DESCRIÇÃO - Abaixo do valor */}
      {description && (
        <div
          className="text-[13px] font-semibold flex items-center gap-1"
          style={{
            color: trend === 'positive' ? 'var(--primary)' :
                   trend === 'negative' ? 'var(--destructive)' :
                   variant === 'today' ? accentColor :
                   variant === 'pending' ? accentColor :
                   'var(--bg-white)'
          }}
        >
          {trend === 'positive' && (
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          )}
          <span className="leading-tight">{description}</span>
        </div>
      )}
    </div>
  );
}
