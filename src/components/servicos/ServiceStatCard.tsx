import React, { useEffect, useState } from 'react';

interface ServiceStatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  variant: 'total' | 'active' | 'revenue';
}

const variantConfig = {
  total: {
    accent: '#3b82f6',
    accentLight: 'rgba(59, 130, 246, 0.1)'
  },
  active: {
    accent: '#10b981',
    accentLight: 'rgba(16, 185, 129, 0.1)'
  },
  revenue: {
    accent: '#f59e0b',
    accentLight: 'rgba(245, 158, 11, 0.1)'
  }
};

export const ServiceStatCard: React.FC<ServiceStatCardProps> = ({ label, value, icon, variant }) => {
  const [isDark, setIsDark] = useState(false);
  const config = variantConfig[variant];

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
        background: isDark ? 'rgba(38, 38, 38, 0.6)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)',
        borderRadius: '16px',
        padding: '24px',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = isDark ? '0 8px 24px rgba(0, 0, 0, 0.4)' : '0 8px 24px rgba(0, 0, 0, 0.1)';
        const border = e.currentTarget.querySelector('.stat-border') as HTMLElement;
        if (border) border.style.width = '4px';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        const border = e.currentTarget.querySelector('.stat-border') as HTMLElement;
        if (border) border.style.width = '0';
      }}
    >
      <div
        className="stat-border"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '0',
          background: config.accent,
          transition: 'width 0.3s ease'
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ fontSize: '13px', color: isDark ? '#a3a3a3' : '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </div>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: config.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: config.accent }}>
            {icon}
          </div>
        </div>
      </div>

      <div style={{ fontSize: '36px', fontWeight: 700, color: isDark ? '#ffffff' : '#111827' }}>
        {value}
      </div>
    </div>
  );
};
