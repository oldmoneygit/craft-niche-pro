import React, { useState } from 'react';
import { X } from 'lucide-react';
import { AgendamentoCalendar } from './AgendamentoCalendar';
import { AgendamentoForm } from './AgendamentoForm';
import { AgendamentoAISuggestion } from './AgendamentoAISuggestion';

interface AgendamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AgendamentoModal: React.FC<AgendamentoModalProps> = ({ isOpen, onClose }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('10:00');

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Detectar tema atual
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  return (
    <div
      style={{
        display: 'flex',
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 1000,
        padding: '24px',
        overflowY: 'auto',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={handleOverlayClick}
    >
      <div
        style={{
          background: isDark 
            ? 'rgba(38, 38, 38, 0.6)' 
            : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: isDark 
            ? '1px solid #404040' 
            : '1px solid #e5e5e5',
          borderRadius: '16px',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: isDark 
            ? '0 24px 48px rgba(0, 0, 0, 0.3)' 
            : '0 24px 48px rgba(0, 0, 0, 0.08)'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px',
            borderBottom: isDark 
              ? '1px solid #404040' 
              : '1px solid #e5e5e5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: isDark ? '#fafafa' : '#171717'
            }}
          >
            Novo Agendamento
          </h2>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: isDark ? '#171717' : '#ffffff',
              border: isDark 
                ? '1px solid #404040' 
                : '1px solid #e5e5e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ef4444';
              e.currentTarget.style.borderColor = '#ef4444';
              const svg = e.currentTarget.querySelector('svg');
              if (svg) (svg as SVGElement).style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDark ? '#171717' : '#ffffff';
              e.currentTarget.style.borderColor = isDark ? '#404040' : '#e5e5e5';
              const svg = e.currentTarget.querySelector('svg');
              if (svg) (svg as SVGElement).style.color = isDark ? '#d4d4d4' : '#404040';
            }}
          >
            <X style={{ 
              width: '20px', 
              height: '20px', 
              color: isDark ? '#d4d4d4' : '#404040' 
            }} />
          </button>
        </div>

        {/* AI Suggestion */}
        <AgendamentoAISuggestion />

        {/* Body */}
        <div
          style={{
            padding: '24px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px'
          }}
        >
          <AgendamentoCalendar
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onDateChange={setSelectedDate}
            onTimeChange={setSelectedTime}
          />
          <AgendamentoForm />
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '24px',
            borderTop: isDark 
              ? '1px solid #404040' 
              : '1px solid #e5e5e5',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px'
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              background: isDark ? '#171717' : '#ffffff',
              border: isDark 
                ? '1px solid #404040' 
                : '1px solid #e5e5e5',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 600,
              color: isDark ? '#d4d4d4' : '#404040',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDark ? '#262626' : '#fafafa';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDark ? '#171717' : '#ffffff';
            }}
          >
            Cancelar
          </button>
          <button
            style={{
              padding: '12px 24px',
              background: '#10b981',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 600,
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#059669';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#10b981';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Criar Agendamento
          </button>
        </div>
      </div>
    </div>
  );
};
