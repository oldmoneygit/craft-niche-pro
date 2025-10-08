import React, { useEffect, useState } from 'react';
import { Calendar, CheckCircle, MessageSquare, Clock, Gift, Droplets, Edit, Send } from 'lucide-react';

interface LembreteCardProps {
  type: 'consulta' | 'confirmacao' | 'feedback' | 'retorno' | 'aniversario' | 'hidratacao';
  title: string;
  subtitle: string;
  timing: string;
  message: string;
  variables: string[];
  isActive: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onTest: () => void;
}

const typeConfig = {
  consulta: {
    icon: Calendar,
    color: '#3b82f6',
    colorLight: 'rgba(59, 130, 246, 0.1)'
  },
  confirmacao: {
    icon: CheckCircle,
    color: '#10b981',
    colorLight: 'rgba(16, 185, 129, 0.1)'
  },
  feedback: {
    icon: MessageSquare,
    color: '#a855f7',
    colorLight: 'rgba(168, 85, 247, 0.1)'
  },
  retorno: {
    icon: Clock,
    color: '#f59e0b',
    colorLight: 'rgba(245, 158, 11, 0.1)'
  },
  aniversario: {
    icon: Gift,
    color: '#ec4899',
    colorLight: 'rgba(236, 72, 153, 0.1)'
  },
  hidratacao: {
    icon: Droplets,
    color: '#06b6d4',
    colorLight: 'rgba(6, 182, 212, 0.1)'
  }
};

export const LembreteCard: React.FC<LembreteCardProps> = ({
  type,
  title,
  subtitle,
  timing,
  message,
  variables,
  isActive,
  onToggle,
  onEdit,
  onTest
}) => {
  const [isDark, setIsDark] = useState(false);
  const config = typeConfig[type];
  const Icon = config.icon;

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
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = isDark ? '0 8px 24px rgba(0, 0, 0, 0.4)' : '0 8px 24px rgba(0, 0, 0, 0.1)';
        const border = e.currentTarget.querySelector('.lembrete-border') as HTMLElement;
        if (border) border.style.width = '4px';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        const border = e.currentTarget.querySelector('.lembrete-border') as HTMLElement;
        if (border) border.style.width = '0';
      }}
    >
      <div
        className="lembrete-border"
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
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: config.colorLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon style={{ width: '24px', height: '24px', color: config.color }} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: isDark ? '#ffffff' : '#111827', marginBottom: '4px' }}>
              {title}
            </h3>
            <p style={{ fontSize: '13px', color: isDark ? '#a3a3a3' : '#6b7280' }}>
              {subtitle}
            </p>
          </div>
        </div>
        
        <div
          onClick={onToggle}
          style={{
            position: 'relative',
            width: '52px',
            height: '28px',
            background: isActive ? config.color : (isDark ? 'rgba(64, 64, 64, 0.3)' : 'rgba(229, 231, 235, 0.8)'),
            borderRadius: '14px',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          <div style={{
            position: 'absolute',
            width: '22px',
            height: '22px',
            background: 'white',
            borderRadius: '50%',
            top: '3px',
            left: isActive ? '27px' : '3px',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
          }} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', padding: '12px 16px', background: `${config.color}0D`, borderRadius: '10px', borderLeft: `3px solid ${config.color}` }}>
        <Clock style={{ width: '20px', height: '20px', color: config.color }} />
        <span style={{ fontSize: '14px', color: isDark ? '#ffffff' : '#111827', fontWeight: 600 }}>
          {timing}
        </span>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: isDark ? '#a3a3a3' : '#6b7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Mensagem Atual
        </div>
        <div style={{ background: isDark ? 'rgba(20, 20, 20, 0.9)' : '#ffffff', border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)', borderRadius: '12px', padding: '16px', fontSize: '14px', lineHeight: 1.6, color: isDark ? '#ffffff' : '#111827', minHeight: '100px', maxHeight: '150px', overflowY: 'auto', whiteSpace: 'pre-line' }}>
          {message}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
          {variables.map((variable) => (
            <span key={variable} style={{ padding: '4px 10px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '6px', fontSize: '11px', fontWeight: 600, color: '#10b981', fontFamily: 'monospace' }}>
              {variable}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={onEdit}
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
            e.currentTarget.style.color = config.color;
            e.currentTarget.style.borderColor = config.color;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = isDark ? '#a3a3a3' : '#6b7280';
            e.currentTarget.style.borderColor = isDark ? 'rgba(64, 64, 64, 0.3)' : 'rgba(229, 231, 235, 0.8)';
          }}
        >
          <Edit style={{ width: '16px', height: '16px' }} />
          Editar
        </button>

        <button
          onClick={onTest}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '10px',
            border: 'none',
            background: config.color,
            color: 'white',
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
            e.currentTarget.style.opacity = '0.9';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <Send style={{ width: '16px', height: '16px' }} />
          Testar
        </button>
      </div>
    </div>
  );
};
