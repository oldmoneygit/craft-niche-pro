import React, { useState } from 'react';
import { X } from 'lucide-react';

interface QuestionarioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuestionarioModal: React.FC<QuestionarioModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    duration: ''
  });

  if (!isOpen) return null;

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    onClose();
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)',
    background: isDark ? 'rgba(20, 20, 20, 0.9)' : 'var(--bg-white)',
    backdropFilter: 'blur(10px)',
    color: isDark ? 'var(--bg-white)' : '#111827',
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
          background: isDark ? 'rgba(26, 26, 26, 0.7)' : 'rgba(255, 255, 255, 0.9)',
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
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: isDark ? 'var(--bg-white)' : '#111827' }}>
            Novo Questionário
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

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: isDark ? 'var(--bg-white)' : '#111827', marginBottom: '8px' }}>
              Título do Questionário
            </label>
            <input
              type="text"
              placeholder="Ex: Anamnese Nutricional"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: isDark ? 'var(--bg-white)' : '#111827', marginBottom: '8px' }}>
              Categoria
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              style={inputStyle}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.boxShadow = '0 0 0 3px var(--primary-alpha)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = isDark ? 'rgba(64, 64, 64, 0.3)' : 'rgba(229, 231, 235, 0.8)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <option>Selecione uma categoria</option>
              <option>Anamnese</option>
              <option>Hábitos Alimentares</option>
              <option>Recordatório</option>
              <option>Satisfação</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: isDark ? 'var(--bg-white)' : '#111827', marginBottom: '8px' }}>
              Descrição
            </label>
            <textarea
              placeholder="Descreva o objetivo deste questionário..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{
                ...inputStyle,
                resize: 'vertical',
                minHeight: '100px'
              }}
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

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: isDark ? 'var(--bg-white)' : '#111827', marginBottom: '8px' }}>
              Tempo Estimado (minutos)
            </label>
            <input
              type="number"
              placeholder="Ex: 15"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
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
              type="button"
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
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDark ? 'rgba(32, 32, 32, 0.8)' : 'rgba(255, 255, 255, 0.95)';
                e.currentTarget.style.borderColor = isDark ? 'var(--text-muted-light)' : 'var(--text-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = isDark ? 'rgba(64, 64, 64, 0.3)' : 'rgba(229, 231, 235, 0.8)';
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
                background: 'var(--primary)',
                color: 'white',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
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
              Criar Questionário
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
