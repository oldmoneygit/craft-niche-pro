import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Flame, Eye, Edit, Share2 } from 'lucide-react';

interface PlanoCardProps {
  clientName: string;
  clientInitials: string;
  objective: string;
  status: 'active' | 'pending' | 'expired';
  planTitle: string;
  createdDate: string;
  duration: string;
  calories: string;
  protein: string;
  fat: string;
  carbs: string;
  avatarColor?: string;
}

const statusConfig = {
  active: {
    label: 'Ativo',
    color: '#10b981',
    colorDark: '#059669'
  },
  pending: {
    label: 'Pendente',
    color: '#f59e0b',
    colorDark: '#d97706'
  },
  expired: {
    label: 'Expirado',
    color: '#6b7280',
    colorDark: '#4b5563'
  }
};

export const PlanoCard: React.FC<PlanoCardProps> = ({
  clientName,
  clientInitials,
  objective,
  status,
  planTitle,
  createdDate,
  duration,
  calories,
  protein,
  fat,
  carbs,
  avatarColor
}) => {
  const [isDark, setIsDark] = useState(false);
  const config = statusConfig[status];

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

  const defaultAvatarColor = avatarColor || `linear-gradient(135deg, ${config.color} 0%, ${config.colorDark} 100%)`;

  return (
    <div
      style={{
        background: isDark ? 'rgba(38, 38, 38, 0.6)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)',
        borderRadius: '16px',
        padding: '28px',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = isDark ? '0 12px 32px rgba(0, 0, 0, 0.4)' : '0 12px 32px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.borderColor = config.color;
        const border = e.currentTarget.querySelector('.plano-border') as HTMLElement;
        if (border) border.style.width = '4px';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = isDark ? 'rgba(64, 64, 64, 0.3)' : 'rgba(229, 231, 235, 0.8)';
        const border = e.currentTarget.querySelector('.plano-border') as HTMLElement;
        if (border) border.style.width = '0';
      }}
    >
      <div
        className="plano-border"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '0',
          background: config.color,
          transition: 'width 0.3s ease'
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: defaultAvatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '18px' }}>
            {clientInitials}
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: isDark ? '#ffffff' : '#111827', marginBottom: '4px' }}>
              {clientName}
            </h3>
            <p style={{ fontSize: '13px', color: isDark ? '#a3a3a3' : '#6b7280' }}>
              Objetivo: {objective}
            </p>
          </div>
        </div>
        <div style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, background: config.color, color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {config.label}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, color: isDark ? '#ffffff' : '#111827', marginBottom: '12px' }}>
          {planTitle}
        </div>
        <div style={{ display: 'grid', gap: '10px' }}>
          {[
            { icon: Calendar, label: 'Criado em:', value: createdDate },
            { icon: Clock, label: 'Duração:', value: duration },
            { icon: Flame, label: 'Calorias/dia:', value: calories }
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <Icon style={{ width: '18px', height: '18px', color: config.color }} />
              <span style={{ color: isDark ? '#a3a3a3' : '#6b7280' }}>{label}</span>
              <span style={{ fontWeight: 600, color: isDark ? '#ffffff' : '#111827', marginLeft: 'auto' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px', padding: '16px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '12px' }}>
        {[
          { value: protein, label: 'Proteínas' },
          { value: fat, label: 'Gorduras' },
          { value: carbs, label: 'Carboidratos' }
        ].map(({ value, label }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 700, color: isDark ? '#ffffff' : '#111827', marginBottom: '4px' }}>
              {value}
            </div>
            <div style={{ fontSize: '11px', color: isDark ? '#a3a3a3' : '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', paddingTop: '20px', borderTop: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)' }}>
        {[
          { icon: Eye, label: 'Ver' },
          { icon: Edit, label: 'Editar' },
          { icon: Share2, label: 'Enviar' }
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            style={{
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
              e.currentTarget.style.color = config.color;
              e.currentTarget.style.borderColor = config.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = isDark ? '#a3a3a3' : '#6b7280';
              e.currentTarget.style.borderColor = isDark ? 'rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)';
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
