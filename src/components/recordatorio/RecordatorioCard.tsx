import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Flame, Shield, Droplets, Eye, Download, MessageSquare } from 'lucide-react';

interface RecordatorioCardProps {
  clientName: string;
  clientInitials: string;
  clientPlan: string;
  date: string;
  meals: number;
  calories: string;
  protein: string;
  water: string;
  avatarColor?: string;
}

export const RecordatorioCard: React.FC<RecordatorioCardProps> = ({
  clientName,
  clientInitials,
  clientPlan,
  date,
  meals,
  calories,
  protein,
  water,
  avatarColor = 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
}) => {
  const [isDark, setIsDark] = useState(false);

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
        const border = e.currentTarget.querySelector('.record-border') as HTMLElement;
        if (border) border.style.width = '4px';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        const border = e.currentTarget.querySelector('.record-border') as HTMLElement;
        if (border) border.style.width = '0';
      }}
    >
      <div
        className="record-border"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '0',
          background: '#10b981',
          transition: 'width 0.3s ease'
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '18px' }}>
            {clientInitials}
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: isDark ? '#ffffff' : '#111827', marginBottom: '4px' }}>
              {clientName}
            </h3>
            <p style={{ fontSize: '13px', color: isDark ? '#a3a3a3' : '#6b7280' }}>
              {clientPlan}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', fontSize: '13px', fontWeight: 600 }}>
          <Calendar style={{ width: '16px', height: '16px' }} />
          {date}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        {[
          { icon: Clock, label: 'Refeições', value: `${meals} registradas`, bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' },
          { icon: Flame, label: 'Calorias', value: calories, bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' },
          { icon: Shield, label: 'Proteínas', value: protein, bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' },
          { icon: Droplets, label: 'Hidratação', value: water, bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }
        ].map(({ icon: Icon, label, value, bg, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon style={{ width: '18px', height: '18px', color }} />
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '11px', color: isDark ? '#a3a3a3' : '#6b7280', marginBottom: '2px' }}>
                {label}
              </span>
              <strong style={{ fontSize: '16px', color: isDark ? '#ffffff' : '#111827' }}>
                {value}
              </strong>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', paddingTop: '20px', borderTop: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)' }}>
        {[
          { icon: Eye, label: 'Ver Detalhes' },
          { icon: Download, label: 'Exportar PDF' },
          { icon: MessageSquare, label: 'Comentar' }
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '10px',
              border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)',
              background: 'transparent',
              color: isDark ? '#a3a3a3' : '#6b7280',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)';
              e.currentTarget.style.color = '#10b981';
              e.currentTarget.style.borderColor = '#10b981';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = isDark ? '#a3a3a3' : '#6b7280';
              e.currentTarget.style.borderColor = isDark ? 'rgba(64, 64, 64, 0.3)' : 'rgba(229, 231, 235, 0.8)';
            }}
          >
            <Icon style={{ width: '16px', height: '16px' }} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};
