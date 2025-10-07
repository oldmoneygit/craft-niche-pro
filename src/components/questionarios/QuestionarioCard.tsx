import React, { useEffect, useState } from 'react';
import { Eye, Edit, Share2, HelpCircle, Clock, FileText, TrendingUp } from 'lucide-react';

interface QuestionarioCardProps {
  title: string;
  description: string;
  category: 'anamnese' | 'habitos' | 'recordatorio' | 'satisfacao';
  isActive: boolean;
  questions: number;
  duration: number;
  responses: number;
  completion: number | null;
  onView?: () => void;
  onEdit?: () => void;
  onShare?: () => void;
}

const categoryConfig = {
  anamnese: {
    label: 'Anamnese',
    color: 'var(--secondary)',
    bg: 'var(--secondary-alpha)'
  },
  habitos: {
    label: 'Hábitos',
    color: 'var(--primary)',
    bg: 'var(--primary-alpha)'
  },
  recordatorio: {
    label: 'Recordatório',
    color: 'var(--warning)',
    bg: 'rgba(245, 158, 11, 0.1)'
  },
  satisfacao: {
    label: 'Satisfação',
    color: 'var(--accent)',
    bg: 'rgba(139, 92, 246, 0.1)'
  }
};

export const QuestionarioCard: React.FC<QuestionarioCardProps> = ({
  title,
  description,
  category,
  isActive,
  questions,
  duration,
  responses,
  completion,
  onView,
  onEdit,
  onShare
}) => {
  const config = categoryConfig[category];
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
        background: isDark 
          ? 'rgba(38, 38, 38, 0.6)' 
          : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: isDark 
          ? '1px solid rgba(64, 64, 64, 0.3)' 
          : '1px solid rgba(229, 231, 235, 0.8)',
        borderRadius: '16px',
        padding: '28px',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = isDark 
          ? '0 12px 32px rgba(0, 0, 0, 0.4)' 
          : '0 12px 32px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.borderColor = config.color;
        const border = e.currentTarget.querySelector('.category-border') as HTMLElement;
        if (border) border.style.width = '4px';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = isDark 
          ? 'rgba(64, 64, 64, 0.3)' 
          : 'rgba(229, 231, 235, 0.8)';
        const border = e.currentTarget.querySelector('.category-border') as HTMLElement;
        if (border) border.style.width = '0';
      }}
    >
      <div
        className="category-border"
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
        <span
          style={{
            padding: '6px 14px',
            borderRadius: '20px',
            background: config.bg,
            color: config.color,
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          {config.label}
        </span>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 600,
            background: isActive ? 'var(--primary-alpha)' : 'rgba(107, 114, 128, 0.1)',
            color: isActive ? 'var(--primary)' : 'var(--text-secondary)'
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
          {isActive ? 'Ativo' : 'Inativo'}
        </span>
      </div>

      <h3 style={{ fontSize: '20px', fontWeight: 700, color: isDark ? 'var(--bg-white)' : '#111827', marginBottom: '8px' }}>
        {title}
      </h3>
      <p style={{ fontSize: '14px', color: isDark ? 'var(--text-muted-light)' : 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
        {description}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>
        {[
          { icon: HelpCircle, value: questions, label: 'perguntas' },
          { icon: Clock, value: `~${duration} min`, label: '' },
          { icon: FileText, value: responses, label: 'respostas' },
          { icon: TrendingUp, value: completion !== null ? `${completion}%` : '-', label: 'conclusão' }
        ].map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: isDark ? 'var(--text-muted-light)' : 'var(--text-secondary)' }}>
            <item.icon style={{ width: '18px', height: '18px', color: config.color }} />
            <span style={{ fontWeight: 700, color: isDark ? 'var(--bg-white)' : '#111827' }}>{item.value}</span> {item.label}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', paddingTop: '20px', borderTop: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)' }}>
        {[
          { icon: Eye, label: 'Visualizar', action: onView },
          { icon: Edit, label: 'Editar', action: onEdit },
          { icon: Share2, label: 'Enviar', action: onShare }
        ].map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            onClick={(e) => { e.stopPropagation(); action?.(); }}
            style={{
              flex: 1,
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
              e.currentTarget.style.background = config.bg;
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
