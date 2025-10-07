import React from 'react';

export const AgendamentoForm: React.FC = () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  const inputStyle: React.CSSProperties = {
    padding: '12px 16px',
    border: isDark ? '1px solid var(--border-dark)' : '1px solid var(--border)',
    borderRadius: '10px',
    background: isDark ? 'var(--text-primary)' : 'var(--bg-white)',
    color: isDark ? 'var(--text-primary-light)' : 'var(--text-primary)',
    fontSize: '14px',
    fontFamily: 'inherit',
    width: '100%'
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 600,
    color: isDark ? 'var(--text-primary-light)' : 'var(--text-primary)',
    marginBottom: '8px',
    display: 'block'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label style={labelStyle}>Cliente *</label>
        <select style={inputStyle}>
          <option>Selecione um cliente</option>
          <option>Pamela Nascimento</option>
          <option>MARCÃO DA MASSA</option>
          <option>Jeferson de Lima</option>
        </select>
      </div>

      <div>
        <label style={labelStyle}>Tipo de Consulta *</label>
        <select style={inputStyle}>
          <option>Primeira Consulta</option>
          <option>Retorno</option>
          <option>Revisão de Plano</option>
          <option>Avaliação</option>
        </select>
      </div>

      <div>
        <label style={labelStyle}>Observações</label>
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
        <label style={labelStyle}>Valor da Consulta</label>
        <input
          type="text"
          style={inputStyle}
          placeholder="R$ 0,00"
        />
      </div>

      <div>
        <label style={labelStyle}>Status do Pagamento</label>
        <select style={inputStyle}>
          <option>Pendente</option>
          <option>Pago</option>
          <option>Parcelado</option>
        </select>
      </div>
    </div>
  );
};
