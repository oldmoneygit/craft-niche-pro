import React from 'react';

interface MainStatCardProps {
  label: string;
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
  variant: 'blue' | 'green' | 'purple' | 'orange';
}

const variantStyles = {
  blue: {
    colorStart: '#3b82f6',
    colorEnd: '#2563eb'
  },
  green: {
    colorStart: '#10b981',
    colorEnd: '#059669'
  },
  purple: {
    colorStart: '#a855f7',
    colorEnd: '#9333ea'
  },
  orange: {
    colorStart: '#f97316',
    colorEnd: '#ea580c'
  }
};

export const MainStatCard: React.FC<MainStatCardProps> = ({ label, value, subtitle, icon, variant }) => {
  const colors = variantStyles[variant];

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${colors.colorStart} 0%, ${colors.colorEnd} 100%)`,
        borderRadius: '16px',
        padding: '28px',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        cursor: 'default'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '200px',
          height: '200px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%'
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: '14px', color: 'white', fontWeight: 600 }}>
          {label}
        </div>
        <div style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: 'white' }}>
            {icon}
          </div>
        </div>
      </div>

      <div style={{ fontSize: '42px', fontWeight: 700, color: 'white', marginBottom: '6px', position: 'relative', zIndex: 1 }}>
        {value}
      </div>

      <div style={{ fontSize: '13px', color: 'white', opacity: 0.95, position: 'relative', zIndex: 1 }}>
        {subtitle}
      </div>
    </div>
  );
};
