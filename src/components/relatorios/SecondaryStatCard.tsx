import React, { useEffect, useState } from 'react';

interface SecondaryStatCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
  variant: 'green' | 'blue';
}

const variantConfig = {
  green: {
    iconBg: 'rgba(16, 185, 129, 0.15)',
    iconColor: '#10b981'
  },
  blue: {
    iconBg: 'rgba(59, 130, 246, 0.15)',
    iconColor: '#3b82f6'
  }
};

export const SecondaryStatCard: React.FC<SecondaryStatCardProps> = ({ title, value, subtitle, icon, variant }) => {
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
        background: isDark ? 'rgba(20, 20, 20, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)',
        borderRadius: '16px',
        padding: '28px',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = isDark 
          ? '0 8px 24px rgba(0, 0, 0, 0.4)' 
          : '0 8px 24px rgba(0, 0, 0, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: config.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: config.iconColor }}>
            {icon}
          </div>
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: isDark ? '#ffffff' : '#111827' }}>
          {title}
        </h3>
      </div>

      <div style={{ fontSize: '36px', fontWeight: 700, color: isDark ? '#ffffff' : '#111827', marginBottom: '6px' }}>
        {value}
      </div>

      <div style={{ fontSize: '13px', color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#6b7280' }}>
        {subtitle}
      </div>
    </div>
  );
};
