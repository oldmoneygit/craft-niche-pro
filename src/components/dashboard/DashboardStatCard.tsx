import { LucideIcon } from 'lucide-react';

interface DashboardStatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  variant: 'today' | 'month' | 'pending' | 'inactive';
  description?: string;
  trend?: 'positive' | 'negative' | 'neutral';
}

export function DashboardStatCard({
  label,
  value,
  icon: Icon,
  variant,
  description,
  trend = 'neutral'
}: DashboardStatCardProps) {
  const variantColors = {
    today: '#3b82f6',      // azul (--info)
    month: '#10b981',      // verde (--primary)
    pending: '#f59e0b',    // laranja (--warning)
    inactive: '#ef4444'    // vermelho (--error)
  };

  const accentColor = variantColors[variant];

  return (
    <div
      className="stat-card relative overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        background: 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 24px var(--shadow)',
        borderRadius: '20px',
        padding: '28px'
      }}
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
        className="absolute top-0 left-0 right-0"
        style={{
          height: '4px',
          background: `linear-gradient(90deg, ${accentColor} 0%, transparent 100%)`
        }}
      />

      {/* Header: Label à esquerda + Ícone à direita */}
      <div className="flex justify-between items-start" style={{ marginBottom: '16px' }}>
        <div
          style={{ 
            fontSize: '13px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: 'var(--text-muted)'
          }}
        >
          {label}
        </div>

        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)`
          }}
        >
          <Icon style={{ width: '24px', height: '24px', color: 'white', strokeWidth: 2 }} />
        </div>
      </div>

      {/* Valor grande */}
      <div
        style={{ 
          fontSize: '36px',
          fontWeight: 700,
          lineHeight: 1,
          marginBottom: '8px',
          color: 'var(--text-primary)'
        }}
      >
        {value}
      </div>

      {/* Descrição/Mudança */}
      {description && (
        <div
          style={{
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: trend === 'positive' ? '#10b981' :
                   trend === 'negative' ? '#ef4444' :
                   'var(--text-secondary)'
          }}
        >
          {trend === 'positive' && (
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          )}
          {description}
        </div>
      )}
    </div>
  );
}
