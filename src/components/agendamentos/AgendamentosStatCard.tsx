import React from 'react';
import './AgendamentosStatCard.css';

interface AgendamentosStatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  variant: 'total' | 'today' | 'confirmed' | 'completed';
}

const variantStyles = {
  total: {
    accentColor: '#3b82f6',
    accentLight: 'rgba(59, 130, 246, 0.1)'
  },
  today: {
    accentColor: '#f59e0b',
    accentLight: 'rgba(245, 158, 11, 0.1)'
  },
  confirmed: {
    accentColor: '#10b981',
    accentLight: 'rgba(16, 185, 129, 0.1)'
  },
  completed: {
    accentColor: '#8b5cf6',
    accentLight: 'rgba(139, 92, 246, 0.1)'
  }
};

export const AgendamentosStatCard: React.FC<AgendamentosStatCardProps> = ({
  label,
  value,
  icon,
  variant
}) => {
  const { accentColor, accentLight } = variantStyles[variant];

  return (
    <div
      className="agendamentos-stat-card"
      style={{
        background: 'var(--bg-card)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 2px 12px var(--shadow)',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 24px var(--shadow)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 12px var(--shadow)';
      }}
    >
      {/* Borda lateral colorida que aparece no hover */}
      <div
        style={{
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '3px',
          background: accentColor,
          opacity: 0,
          transition: 'opacity 0.3s ease'
        }}
        className="agendamentos-stat-border"
      />

      {/* Header: Label + Ícone */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '16px'
        }}
      >
        <div
          style={{
            fontSize: '13px',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontWeight: 600
          }}
        >
          {label}
        </div>

        <div
          style={{
            width: '36px',
            height: '36px',
            minWidth: '36px',
            minHeight: '36px',
            borderRadius: '8px',
            background: accentLight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <div style={{ color: accentColor, display: 'flex' }}>
            {icon}
          </div>
        </div>
      </div>

      {/* Valor */}
      <div
        style={{
          fontSize: '32px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1
        }}
      >
        {value}
      </div>
    </div>
  );
};
