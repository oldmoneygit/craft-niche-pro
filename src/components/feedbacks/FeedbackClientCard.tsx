import React, { useEffect, useState } from 'react';
import { Phone, Clock, Send } from 'lucide-react';

interface FeedbackClientCardProps {
  name: string;
  phone: string;
  daysPending: number;
  onSendFeedback: () => void;
}

export const FeedbackClientCard: React.FC<FeedbackClientCardProps> = ({
  name,
  phone,
  daysPending,
  onSendFeedback
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
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '24px',
        flexWrap: 'wrap'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = isDark 
          ? '0 12px 32px rgba(0, 0, 0, 0.4)' 
          : '0 12px 32px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.borderColor = '#f59e0b';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = isDark ? 'rgba(64, 64, 64, 0.3)' : 'rgba(229, 231, 235, 0.8)';
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '4px',
          background: '#f59e0b'
        }}
      />

      <div style={{ flex: 1, minWidth: '250px' }}>
        <div style={{ fontSize: '18px', fontWeight: 700, color: isDark ? '#ffffff' : '#111827', marginBottom: '8px' }}>
          {name}
        </div>
        <div style={{ fontSize: '14px', color: isDark ? '#a3a3a3' : '#6b7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Phone style={{ width: '16px', height: '16px' }} />
          {phone}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <span
          style={{
            padding: '8px 16px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap',
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#f59e0b'
          }}
        >
          <Clock style={{ width: '16px', height: '16px' }} />
          Pendente há {daysPending} dias
        </span>
        <button
          onClick={onSendFeedback}
          style={{
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            background: '#10b981',
            color: 'white',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#059669';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(16, 185, 129, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#10b981';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <Send style={{ width: '18px', height: '18px' }} />
          Enviar Feedback
        </button>
      </div>
    </div>
  );
};
