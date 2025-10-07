import React from 'react';
import { Lightbulb } from 'lucide-react';

export const AgendamentoAISuggestion: React.FC = () => {
  return (
    <div
      style={{
        margin: '24px',
        padding: '16px 20px',
        background: 'linear-gradient(135deg, var(--primary-alpha) 0%, rgba(5, 150, 105, 0.05) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <Lightbulb style={{ width: '20px', height: '20px', color: 'white' }} />
      </div>
      <div>
        <h4
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--primary)',
            marginBottom: '4px'
          }}
        >
          Sugestão da IA
        </h4>
        <p
          style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            lineHeight: 1.6
          }}
        >
          Seu horário mais próximo disponível é <strong>dia 10 às 13h30</strong>.{' '}
          <a
            href="#appointments"
            style={{
              color: 'var(--primary)',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            Verifique suas consultas agendadas aqui
          </a>
          .
        </p>
      </div>
    </div>
  );
};
