import React from 'react';

export const AgendamentoForm: React.FC = () => {
  const inputStyle: React.CSSProperties = {
    padding: '12px 16px',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    fontFamily: 'inherit',
    width: '100%'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '8px',
            display: 'block'
          }}
        >
          Cliente *
        </label>
        <select style={inputStyle}>
          <option>Selecione um cliente</option>
          <option>Pamela Nascimento</option>
          <option>MARCÃO DA MASSA</option>
          <option>Jeferson de Lima</option>
        </select>
      </div>

      <div>
        <label
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '8px',
            display: 'block'
          }}
        >
          Tipo de Consulta *
        </label>
        <select style={inputStyle}>
          <option>Primeira Consulta</option>
          <option>Retorno</option>
          <option>Revisão de Plano</option>
          <option>Avaliação</option>
        </select>
      </div>

      <div>
        <label
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '8px',
            display: 'block'
          }}
        >
          Observações
        </label>
        <textarea
          style={{
            ...inputStyle,
            resize: 'vertical',
            minHeight: '80px'
          }}
          placeholder="Observações sobre a consulta..."
        />
      </div>

      <div>
        <label
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '8px',
            display: 'block'
          }}
        >
          Valor da Consulta
        </label>
        <input
          type="text"
          style={inputStyle}
          placeholder="R$ 0,00"
        />
      </div>

      <div>
        <label
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '8px',
            display: 'block'
          }}
        >
          Status do Pagamento
        </label>
        <select style={inputStyle}>
          <option>Pendente</option>
          <option>Pago</option>
          <option>Parcelado</option>
        </select>
      </div>
    </div>
  );
};
