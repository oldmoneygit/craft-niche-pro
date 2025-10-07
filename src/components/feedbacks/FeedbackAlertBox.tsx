import React from 'react';
import { Send } from 'lucide-react';

interface FeedbackAlertBoxProps {
  pendingCount: number;
  onSendAll: () => void;
}

export const FeedbackAlertBox: React.FC<FeedbackAlertBoxProps> = ({ pendingCount, onSendAll }) => {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
        borderRadius: '16px',
        padding: '24px 32px',
        marginBottom: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 8px 24px rgba(16, 185, 129, 0.2)',
        gap: '24px',
        flexWrap: 'wrap'
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '6px' }}>
          {pendingCount} {pendingCount === 1 ? 'cliente precisa' : 'clientes precisam'} responder
        </div>
        <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)' }}>
          Envie o feedback semanal para todos de uma vez
        </div>
      </div>
      <button
        onClick={onSendAll}
        style={{
          padding: '12px 24px',
          borderRadius: '12px',
          border: 'none',
          background: 'white',
          color: 'var(--primary)',
          fontWeight: 600,
          fontSize: '14px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <Send style={{ width: '20px', height: '20px' }} />
        Enviar para {pendingCount}
      </button>
    </div>
  );
};
