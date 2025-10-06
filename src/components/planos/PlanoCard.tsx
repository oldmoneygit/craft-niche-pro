import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Flame, Eye, Edit, Share2, Trash2, Copy } from 'lucide-react';

interface PlanoCardProps {
  clientName: string;
  clientInitials: string;
  objective: string;
  status: 'ativo' | 'pendente' | 'concluido';
  planTitle: string;
  startDate: string;
  duration?: number;
  calories: string;
  protein: string;
  fat: string;
  carbs: string;
  avatarColor?: string;
  onStatusChange?: (newStatus: 'ativo' | 'pendente' | 'concluido') => void;
  onView?: () => void;
  onEdit?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

const statusConfig = {
  ativo: {
    label: 'ATIVO',
    bgColor: '#10b981',
    bgColorDark: '#059669',
    borderColor: '#10b981',
    avatarBg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  },
  pendente: {
    label: 'PENDENTE',
    bgColor: '#f59e0b',
    bgColorDark: '#d97706',
    borderColor: '#f59e0b',
    avatarBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
  },
  concluido: {
    label: 'CONCLUÍDO',
    bgColor: '#6b7280',
    bgColorDark: '#4b5563',
    borderColor: '#6b7280',
    avatarBg: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
  }
};

export const PlanoCard: React.FC<PlanoCardProps> = ({
  clientName,
  clientInitials,
  objective,
  status,
  planTitle,
  startDate,
  duration,
  calories,
  protein,
  fat,
  carbs,
  avatarColor,
  onStatusChange,
  onView,
  onEdit,
  onShare,
  onDelete,
  onDuplicate
}) => {
  const [isDark, setIsDark] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
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

  const defaultAvatarColor = avatarColor || config.avatarBg;

  return (
    <div
      style={{
        background: isDark ? 'rgba(38, 38, 38, 0.6)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: `2px solid ${config.borderColor}`,
        borderRadius: '20px',
        padding: '24px',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'visible',
        boxShadow: isDark ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0, 0, 0, 0.08)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = isDark ? '0 12px 32px rgba(0, 0, 0, 0.4)' : '0 12px 32px rgba(0, 0, 0, 0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = isDark ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0, 0, 0, 0.08)';
      }}
    >

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ 
            width: '52px', 
            height: '52px', 
            borderRadius: '50%', 
            background: defaultAvatarColor, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'white', 
            fontWeight: 700, 
            fontSize: '18px',
            boxShadow: `0 4px 12px ${config.bgColor}40`
          }}>
            {clientInitials}
          </div>
          <div>
            <h3 style={{ fontSize: '19px', fontWeight: 700, color: isDark ? '#ffffff' : '#111827', marginBottom: '2px' }}>
              {clientName}
            </h3>
            <p style={{ fontSize: '13px', color: isDark ? '#a3a3a3' : '#6b7280' }}>
              Objetivo: {objective}
            </p>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => onStatusChange && setShowStatusMenu(!showStatusMenu)}
            style={{ 
              padding: '7px 16px', 
              borderRadius: '20px', 
              fontSize: '11px', 
              fontWeight: 700, 
              background: config.bgColor, 
              color: 'white', 
              textTransform: 'uppercase', 
              letterSpacing: '0.6px',
              border: 'none',
              cursor: onStatusChange ? 'pointer' : 'default',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (onStatusChange) {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = `0 4px 12px ${config.bgColor}60`;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {config.label}
          </button>
          {showStatusMenu && onStatusChange && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              background: isDark ? 'rgba(38, 38, 38, 0.98)' : 'rgba(255, 255, 255, 0.98)',
              borderRadius: '12px',
              padding: '8px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)',
              zIndex: 10,
              minWidth: '140px'
            }}>
              {(['ativo', 'pendente', 'concluido'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    onStatusChange(s);
                    setShowStatusMenu(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: status === s ? `${statusConfig[s].bgColor}20` : 'transparent',
                    color: status === s ? statusConfig[s].bgColor : (isDark ? '#a3a3a3' : '#6b7280'),
                    fontWeight: status === s ? 700 : 600,
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '4px'
                  }}
                  onMouseEnter={(e) => {
                    if (status !== s) {
                      e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (status !== s) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {statusConfig[s].label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '18px' }}>
        <div style={{ fontSize: '17px', fontWeight: 700, color: isDark ? '#ffffff' : '#111827', marginBottom: '14px' }}>
          {planTitle}
        </div>
        <div style={{ display: 'grid', gap: '8px' }}>
          {[
            { icon: Calendar, label: 'Criado em:', value: startDate, color: config.bgColor },
            ...(duration ? [{ icon: Clock, label: 'Duração:', value: `${duration} dias`, color: config.bgColor }] : []),
            { icon: Flame, label: 'Calorias/dia:', value: calories, color: config.bgColor }
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
              <Icon style={{ width: '18px', height: '18px', color: color, flexShrink: 0 }} />
              <span style={{ color: isDark ? '#9ca3af' : '#6b7280', fontWeight: 500 }}>{label}</span>
              <span style={{ fontWeight: 700, color: isDark ? '#ffffff' : '#111827', marginLeft: 'auto' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '12px', 
        marginBottom: '18px', 
        padding: '16px', 
        background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)', 
        borderRadius: '14px' 
      }}>
        {[
          { value: calories, label: 'CALORIAS', color: '#f59e0b' },
          { value: protein, label: 'PROTEÍNAS', color: '#3b82f6' },
          { value: fat, label: 'GORDURAS', color: '#ef4444' },
          { value: carbs, label: 'CARBOIDRATOS', color: '#10b981' }
        ].map(({ value, label, color }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 700, color: color, marginBottom: '4px', lineHeight: 1 }}>
              {value}
            </div>
            <div style={{ fontSize: '9px', color: isDark ? '#9ca3af' : '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', paddingTop: '18px', borderTop: isDark ? '1px solid rgba(64, 64, 64, 0.2)' : '1px solid rgba(229, 231, 235, 0.5)' }}>
        {[
          { icon: Eye, label: 'Ver', action: onView },
          { icon: Edit, label: 'Editar', action: onEdit },
          { icon: Share2, label: 'Enviar', action: onShare }
        ].map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            onClick={action}
            style={{
              padding: '11px 8px',
              borderRadius: '10px',
              border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.6)',
              background: 'transparent',
              color: isDark ? '#a3a3a3' : '#6b7280',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDark ? `${config.bgColor}15` : `${config.bgColor}10`;
              e.currentTarget.style.color = config.bgColor;
              e.currentTarget.style.borderColor = config.bgColor;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = isDark ? '#a3a3a3' : '#6b7280';
              e.currentTarget.style.borderColor = isDark ? 'rgba(64, 64, 64, 0.3)' : 'rgba(229, 231, 235, 0.6)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Icon style={{ width: '16px', height: '16px' }} />
            {label}
          </button>
        ))}
        {onDuplicate && (
          <button
            onClick={onDuplicate}
            style={{
              padding: '11px 8px',
              borderRadius: '10px',
              border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.6)',
              background: 'transparent',
              color: isDark ? '#a3a3a3' : '#6b7280',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDark ? '#3b82f615' : '#3b82f610';
              e.currentTarget.style.color = '#3b82f6';
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = isDark ? '#a3a3a3' : '#6b7280';
              e.currentTarget.style.borderColor = isDark ? 'rgba(64, 64, 64, 0.3)' : 'rgba(229, 231, 235, 0.6)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Copy style={{ width: '16px', height: '16px' }} />
            Duplicar
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            style={{
              padding: '11px 8px',
              borderRadius: '10px',
              border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.6)',
              background: 'transparent',
              color: isDark ? '#a3a3a3' : '#6b7280',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDark ? '#ef444415' : '#ef444410';
              e.currentTarget.style.color = '#ef4444';
              e.currentTarget.style.borderColor = '#ef4444';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = isDark ? '#a3a3a3' : '#6b7280';
              e.currentTarget.style.borderColor = isDark ? 'rgba(64, 64, 64, 0.3)' : 'rgba(229, 231, 235, 0.6)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Trash2 style={{ width: '16px', height: '16px' }} />
            Excluir
          </button>
        )}
      </div>
    </div>
  );
};
