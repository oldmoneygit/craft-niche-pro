import React, { useEffect, useState } from 'react';

interface ChartDataRow {
  month: string;
  value: number | string;
  subtitle: string;
  percentage: number;
}

interface ChartSectionProps {
  title: string;
  icon: React.ReactNode;
  totalValue: string;
  data: ChartDataRow[];
  variant: 'blue' | 'green' | 'purple' | 'red';
}

const variantColors = {
  blue: 'var(--secondary)',
  green: 'var(--primary)',
  purple: '#a855f7',
  red: 'var(--destructive)'
};

export const ChartSection: React.FC<ChartSectionProps> = ({ title, icon, totalValue, data, variant }) => {
  const [isDark, setIsDark] = useState(false);
  const color = variantColors[variant];

  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme') || 
                    document.body.getAttribute('data-theme') ||
                    (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
      setIsDark(theme === 'dark');
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-theme', 'class'] });

    return () => observer.disconnect();
  }, []);

  return (
    <div
      style={{
        background: isDark ? 'rgba(20, 20, 20, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '32px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `${color}26`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ color }}>
              {icon}
            </div>
          </div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: isDark ? 'var(--bg-white)' : '#111827' }}>
            {title}
          </h2>
        </div>
        <div style={{ fontSize: '24px', fontWeight: 700, color }}>
          {totalValue}
        </div>
      </div>

      <div>
        <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr auto', gap: '20px', padding: '12px 16px', borderBottom: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)', marginBottom: '8px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Período
          </div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Progresso
          </div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Valor
          </div>
        </div>

        {data.map((row, index) => (
          <div
            key={index}
            style={{
              display: 'grid',
              gridTemplateColumns: '100px 1fr auto',
              gap: '20px',
              padding: '10px 16px',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              alignItems: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 600, color: isDark ? 'rgba(255, 255, 255, 0.9)' : '#111827' }}>
              {row.month}
            </div>
            <div style={{ position: 'relative', height: '8px', background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: color, borderRadius: '4px', width: `${row.percentage}%`, transition: 'width 0.6s ease' }} />
            </div>
            <div style={{ textAlign: 'right', minWidth: '80px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: isDark ? 'var(--bg-white)' : '#111827' }}>
                {row.value}
              </div>
              <div style={{ fontSize: '11px', color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'var(--text-tertiary)', marginTop: '2px' }}>
                {row.subtitle}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
