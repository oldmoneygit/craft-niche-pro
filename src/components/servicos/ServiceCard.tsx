import React, { useEffect, useState } from 'react';
import { Clock, Calendar, Globe, Edit, Users } from 'lucide-react';

interface ServiceCardProps {
  title: string;
  description: string;
  duration: string;
  consultations: string;
  modality: string;
  price: string;
  period: string;
  variant: 'mensal' | 'trimestral' | 'semestral' | 'anual';
  isActive: boolean;
}

const variantConfig = {
  mensal: {
    color: 'var(--secondary)',
    colorDark: 'var(--secondary-dark)',
    label: 'Mensal'
  },
  trimestral: {
    color: 'var(--primary)',
    colorDark: 'var(--primary-dark)',
    label: 'Trimestral'
  },
  semestral: {
    color: '#a855f7',
    colorDark: '#9333ea',
    label: 'Semestral'
  },
  anual: {
    color: '#f97316',
    colorDark: '#ea580c',
    label: 'Anual'
  }
};

export const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  description,
  duration,
  consultations,
  modality,
  price,
  period,
  variant,
  isActive
}) => {
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
        padding: '28px',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = isDark ? '0 12px 32px rgba(0, 0, 0, 0.4)' : '0 12px 32px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.borderColor = config.color;
        const border = e.currentTarget.querySelector('.service-border') as HTMLElement;
        if (border) border.style.width = '4px';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = isDark ? 'rgba(64, 64, 64, 0.3)' : 'rgba(229, 231, 235, 0.8)';
        const border = e.currentTarget.querySelector('.service-border') as HTMLElement;
        if (border) border.style.width = '0';
      }}
    >
      <div
        className="service-border"
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
        <span style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, background: config.color, color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {config.label}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, background: isActive ? 'var(--primary-alpha)' : 'rgba(107, 114, 128, 0.1)', color: isActive ? 'var(--primary)' : 'var(--text-secondary)' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
          {isActive ? 'Ativo' : 'Inativo'}
        </span>
      </div>

      <h3 style={{ fontSize: '22px', fontWeight: 700, color: isDark ? 'var(--bg-white)' : '#111827', marginBottom: '8px' }}>
        {title}
      </h3>
      <p style={{ fontSize: '14px', color: isDark ? 'var(--text-muted-light)' : 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
        {description}
      </p>

      <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
        {[
          { icon: Clock, label: 'Duração', value: duration },
          { icon: Calendar, label: 'Consultas', value: consultations },
          { icon: Globe, label: 'Modalidade', value: modality }
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px' }}>
            <Icon style={{ width: '20px', height: '20px', color: config.color }} />
            <span style={{ color: isDark ? 'var(--text-muted-light)' : 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
            <span style={{ color: isDark ? 'var(--bg-white)' : '#111827', fontWeight: 600, marginLeft: 'auto' }}>{value}</span>
          </div>
        ))}
      </div>

      <div
        style={{
          background: `linear-gradient(135deg, ${config.color} 0%, ${config.colorDark} 100%)`,
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', top: '-50%', right: '-20%', width: '150px', height: '150px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '50%' }} />
        <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600, marginBottom: '6px' }}>
          Valor do Plano
        </div>
        <div style={{ fontSize: '32px', fontWeight: 700, color: 'white', position: 'relative', zIndex: 1 }}>
          {price}
        </div>
        <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', marginTop: '4px' }}>
          {period}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {[
          { icon: Edit, label: 'Editar' },
          { icon: Users, label: 'Clientes' }
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            style={{
              padding: '10px',
              borderRadius: '10px',
              border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)',
              background: 'transparent',
              color: isDark ? 'var(--text-muted-light)' : 'var(--text-secondary)',
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
              e.currentTarget.style.color = isDark ? 'var(--text-muted-light)' : 'var(--text-secondary)';
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
