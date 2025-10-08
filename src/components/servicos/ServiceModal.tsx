import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({ isOpen, onClose }) => {
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

  if (!isOpen) return null;

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)',
    background: isDark ? 'rgba(20, 20, 20, 0.9)' : '#ffffff',
    backdropFilter: 'blur(10px)',
    color: isDark ? '#ffffff' : '#111827',
    fontSize: '14px',
    transition: 'all 0.3s ease'
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
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: isDark ? '#ffffff' : '#111827' }}>
            Novo Serviço
          </h2>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: 'none',
              background: 'transparent',
              color: isDark ? '#a3a3a3' : '#6b7280',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.color = '#ef4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = isDark ? '#a3a3a3' : '#6b7280';
            }}
          >
            <X style={{ width: '24px', height: '24px' }} />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); alert('Serviço criado!'); onClose(); }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: isDark ? '#ffffff' : '#111827', marginBottom: '8px' }}>
              Nome do Serviço
            </label>
            <input
              type="text"
              placeholder="Ex: Acompanhamento Mensal"
              style={inputStyle}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#10b981';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = isDark ? 'rgba(64, 64, 64, 0.3)' : 'rgba(229, 231, 235, 0.8)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: isDark ? '#ffffff' : '#111827', marginBottom: '8px' }}>
              Descrição
            </label>
            <textarea
              placeholder="Descreva o que está incluído neste serviço..."
              style={{ ...inputStyle, resize: 'vertical', minHeight: '100px' }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#10b981';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = isDark ? 'rgba(64, 64, 64, 0.3)' : 'rgba(229, 231, 235, 0.8)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: isDark ? '#ffffff' : '#111827', marginBottom: '8px' }}>
                Duração
              </label>
              <select style={inputStyle}>
                <option>Selecione o período</option>
                <option>Mensal (30 dias)</option>
                <option>Trimestral (90 dias)</option>
                <option>Semestral (180 dias)</option>
                <option>Anual (365 dias)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: isDark ? '#ffffff' : '#111827', marginBottom: '8px' }}>
                Modalidade
              </label>
              <select style={inputStyle}>
                <option>Selecione a modalidade</option>
                <option>Online</option>
                <option>Presencial</option>
                <option>Híbrido</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: isDark ? '#ffffff' : '#111827', marginBottom: '8px' }}>
                Número de Consultas
              </label>
              <input type="number" placeholder="Ex: 4" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: isDark ? '#ffffff' : '#111827', marginBottom: '8px' }}>
                Valor (R$)
              </label>
              <input type="text" placeholder="Ex: 297,00" style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px 24px',
                borderRadius: '12px',
                border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)',
                background: 'transparent',
                color: isDark ? '#a3a3a3' : '#6b7280',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                background: '#10b981',
                color: 'white',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
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
              Criar Serviço
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
