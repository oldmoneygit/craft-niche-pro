import React, { useState, useEffect } from 'react';
import { X, Send, Lightbulb } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  clientName: string;
  clientPhone: string;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ 
  isOpen, 
  clientName, 
  clientPhone, 
  onClose 
}) => {
  const [message, setMessage] = useState('');
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

  useEffect(() => {
    if (isOpen) {
      setMessage(`Olá! 😊

Como está sendo sua semana? 

Gostaria de saber como você está se sentindo com o plano alimentar e se tem alguma dúvida ou dificuldade.

Lembre-se:
• Manter hidratação adequada
• Respeitar os horários das refeições
• Registrar tudo no app

Qualquer coisa, estou aqui para ajudar!

Nutricionista [Seu Nome]`);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = () => {
    alert('Feedback enviado com sucesso! ✅');
    onClose();
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '12px',
    border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)',
    background: isDark ? 'rgba(20, 20, 20, 0.9)' : 'var(--bg-white)',
    backdropFilter: 'blur(10px)',
    color: isDark ? 'var(--bg-white)' : '#111827',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    resize: 'vertical',
    minHeight: '200px',
    fontFamily: 'inherit',
    lineHeight: 1.6
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        display: 'flex',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 1000,
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
    >
      <div
        style={{
          background: isDark ? 'rgba(38, 38, 38, 0.6)' : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)',
          borderRadius: '20px',
          padding: '32px',
          maxWidth: '700px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: isDark ? 'var(--bg-white)' : '#111827' }}>
            Enviar Feedback Semanal
          </h2>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: 'none',
              background: 'transparent',
              color: isDark ? 'var(--text-muted-light)' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--error-alpha)';
              e.currentTarget.style.color = 'var(--destructive)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = isDark ? 'var(--text-muted-light)' : 'var(--text-secondary)';
            }}
          >
            <X style={{ width: '24px', height: '24px' }} />
          </button>
        </div>

        <div
          style={{
            background: 'var(--primary-alpha)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px'
          }}
        >
          <div style={{ fontSize: '16px', fontWeight: 700, color: isDark ? 'var(--bg-white)' : '#111827', marginBottom: '4px' }}>
            {clientName}
          </div>
          <div style={{ fontSize: '13px', color: isDark ? 'var(--text-muted-light)' : 'var(--text-secondary)' }}>
            {clientPhone}
          </div>
        </div>

        <div
          style={{
            background: 'var(--secondary-alpha)',
            borderLeft: '3px solid var(--secondary)',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}
        >
          <p style={{ fontSize: '13px', color: isDark ? 'var(--text-muted-light)' : 'var(--text-secondary)', lineHeight: 1.6 }}>
            <Lightbulb style={{ width: '16px', height: '16px', display: 'inline', marginRight: '6px' }} />
            <strong style={{ color: isDark ? 'var(--bg-white)' : '#111827' }}>Dica:</strong> Personalize a mensagem com informações sobre a evolução do paciente, conquistas da semana e orientações específicas.
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: isDark ? 'var(--bg-white)' : '#111827', marginBottom: '8px' }}>
            Mensagem do Feedback
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.boxShadow = '0 0 0 3px var(--primary-alpha)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = isDark ? 'rgba(64, 64, 64, 0.3)' : 'rgba(229, 231, 235, 0.8)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px 24px',
              borderRadius: '12px',
              border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)',
              background: 'transparent',
              color: isDark ? 'var(--text-muted-light)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSend}
            style={{
              flex: 1,
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              background: 'var(--primary)',
              color: 'white',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--primary-dark)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(16, 185, 129, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--primary)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Send style={{ width: '18px', height: '18px' }} />
            Enviar via WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};
