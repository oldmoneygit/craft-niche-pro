import React, { useEffect, useState } from 'react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  variant: 'primary' | 'success' | 'warning' | 'purple';
}

const variantStyles = {
  primary: {
    accentColor: '#3b82f6',
    iconBgLight: 'rgba(219, 234, 254, 1)',
    iconBgDark: 'rgba(59, 130, 246, 0.15)'
  },
  success: {
    accentColor: '#10b981',
    iconBgLight: 'rgba(209, 250, 229, 1)',
    iconBgDark: 'rgba(16, 185, 129, 0.15)'
  },
  warning: {
    accentColor: '#f59e0b',
    iconBgLight: 'rgba(254, 243, 199, 1)',
    iconBgDark: 'rgba(245, 158, 11, 0.15)'
  },
  purple: {
    accentColor: '#8b5cf6',
    iconBgLight: 'rgba(237, 233, 254, 1)',
    iconBgDark: 'rgba(139, 92, 246, 0.15)'
  }
};

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, variant }) => {
  const config = variantStyles[variant] || variantStyles.primary;
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Verificar tema inicial
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme') || 
                    document.body.getAttribute('data-theme') ||
                    (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
      setIsDark(theme === 'dark');
    };

    checkTheme();

    // Observer para mudanças de tema
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-theme', 'class'] });

    return () => observer.disconnect();
  }, []);

  return (
    <div
      style={{
        background: isDark 
          ? 'rgba(38, 38, 38, 0.6)' 
          : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: isDark 
          ? '1px solid rgba(64, 64, 64, 0.3)' 
          : '1px solid rgba(229, 231, 235, 0.8)',
        borderRadius: '16px',
        padding: '24px',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = isDark 
          ? '0 8px 24px rgba(0, 0, 0, 0.4)' 
          : '0 8px 24px rgba(0, 0, 0, 0.1)';
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
          background: config.accentColor,
          transition: 'width 0.3s ease'
        }}
      />

      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: isDark ? config.iconBgDark : config.iconBgLight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}
      >
        <div style={{ color: config.accentColor, display: 'flex' }}>
          {icon}
        </div>
      </div>

      <div
        style={{
          fontSize: '36px',
          fontWeight: 700,
          color: isDark ? '#ffffff' : '#111827',
          marginBottom: '4px'
        }}
      >
        {value}
      </div>

      <div
        style={{
          fontSize: '14px',
          color: isDark ? '#a3a3a3' : '#6b7280',
          fontWeight: 500
        }}
      >
        {label}
      </div>
    </div>
  );
};
