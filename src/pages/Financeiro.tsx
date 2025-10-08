import React, { useEffect, useState } from 'react';
import { Upload, Download, Plus, Filter, MoreVertical } from 'lucide-react';
import { FinanceStatCard } from '@/components/financeiro/FinanceStatCard';
import { RevenueChart } from '@/components/financeiro/RevenueChart';
import { PaymentMethodsChart } from '@/components/financeiro/PaymentMethodsChart';

export default function Financeiro() {
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

  const transactions = [
    { client: 'Ana Carolina Lima', initials: 'AC', service: 'Consulta Nutricional', date: '05/10/2025', value: 'R$ 297,00', method: 'PIX', status: 'paid', color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
    { client: 'Marcão da Massa', initials: 'MM', service: 'Plano Trimestral', date: '03/10/2025', value: 'R$ 797,00', method: 'Crédito', status: 'paid', color: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
    { client: 'Pamela Nascimento', initials: 'PN', service: 'Consulta Nutricional', date: '28/09/2025', value: 'R$ 297,00', method: 'PIX', status: 'pending', color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
    { client: 'João Ricardo', initials: 'JR', service: 'Avaliação Antropométrica', date: '25/09/2025', value: 'R$ 150,00', method: 'Débito', status: 'paid', color: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)' },
    { client: 'Maria Silva', initials: 'MS', service: 'Consulta Nutricional', date: '20/09/2025', value: 'R$ 297,00', method: 'Dinheiro', status: 'paid', color: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' },
    { client: 'Carlos Barros', initials: 'CB', service: 'Retorno Nutricional', date: '15/09/2025', value: 'R$ 150,00', method: 'PIX', status: 'overdue', color: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' }
  ];

  const statusConfig = {
    paid: { label: 'Pago', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    pending: { label: 'Pendente', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    overdue: { label: 'Atrasado', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' }
  };

  const selectStyle: React.CSSProperties = {
    padding: '12px 16px',
    borderRadius: '12px',
    border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)',
    background: isDark ? 'rgba(38, 38, 38, 0.6)' : 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    color: isDark ? '#ffffff' : '#111827',
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer'
  };

  return (
    <div style={{ padding: '24px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', gap: '24px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>
              Gestão Financeira
            </h1>
            <p style={{ fontSize: '15px', opacity: 0.7 }}>
              Controle completo de pagamentos e receitas
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button style={{ padding: '12px 20px', borderRadius: '12px', border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)', background: isDark ? 'rgba(38, 38, 38, 0.6)' : 'rgba(255, 255, 255, 0.9)', color: isDark ? '#ffffff' : '#111827', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Upload style={{ width: '20px', height: '20px' }} />
              Importar Excel
            </button>
            <button style={{ padding: '12px 20px', borderRadius: '12px', border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)', background: isDark ? 'rgba(38, 38, 38, 0.6)' : 'rgba(255, 255, 255, 0.9)', color: isDark ? '#ffffff' : '#111827', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Download style={{ width: '20px', height: '20px' }} />
              Exportar Excel
            </button>
            <button style={{ padding: '12px 20px', borderRadius: '12px', border: 'none', background: '#10b981', color: 'white', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus style={{ width: '20px', height: '20px' }} />
              Nova Transação
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
          <select style={selectStyle}>
            <option>Últimos 6 meses</option>
            <option>Último mês</option>
            <option>Últimos 3 meses</option>
            <option>Último ano</option>
            <option>Todo período</option>
          </select>
          <select style={selectStyle}>
            <option>Todos os status</option>
            <option>Pagos</option>
            <option>Pendentes</option>
            <option>Atrasados</option>
          </select>
          <select style={selectStyle}>
            <option>Todas as formas</option>
            <option>PIX</option>
            <option>Cartão de Crédito</option>
            <option>Cartão de Débito</option>
            <option>Dinheiro</option>
          </select>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <FinanceStatCard type="received" label="Recebido" value="R$ 18.470" subtitle="23 consultas pagas" />
          <FinanceStatCard type="pending" label="A Receber" value="R$ 3.564" subtitle="4 consultas pendentes" />
          <FinanceStatCard type="overdue" label="Atrasados" value="R$ 891" subtitle="1 consulta atrasada" />
          <FinanceStatCard type="average" label="Ticket Médio" value="R$ 297" subtitle="por consulta" />
          <FinanceStatCard type="rate" label="Taxa de Pagamento" value="85%" subtitle="consultas pagas em dia" />
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
          <RevenueChart />
          <PaymentMethodsChart />
        </div>

        {/* Transactions */}
        <div style={{ background: isDark ? 'rgba(38, 38, 38, 0.6)' : 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)', borderRadius: '16px', padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: isDark ? '#ffffff' : '#111827' }}>
              Transações Recentes
            </h2>
            <button style={{ padding: '12px 20px', borderRadius: '12px', border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)', background: isDark ? 'rgba(20, 20, 20, 0.9)' : '#ffffff', color: isDark ? '#ffffff' : '#111827', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter style={{ width: '18px', height: '18px' }} />
              Filtros
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: isDark ? '2px solid rgba(64, 64, 64, 0.3)' : '2px solid rgba(229, 231, 235, 0.8)' }}>
                {['Cliente', 'Serviço', 'Data', 'Valor', 'Forma', 'Status', ''].map((header) => (
                  <th key={header} style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: isDark ? '#a3a3a3' : '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr key={index} style={{ borderBottom: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)', transition: 'all 0.2s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '16px 12px', fontSize: '14px', color: isDark ? '#ffffff' : '#111827' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: transaction.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '12px' }}>
                        {transaction.initials}
                      </div>
                      {transaction.client}
                    </div>
                  </td>
                  <td style={{ padding: '16px 12px', fontSize: '14px', color: isDark ? '#ffffff' : '#111827' }}>{transaction.service}</td>
                  <td style={{ padding: '16px 12px', fontSize: '14px', color: isDark ? '#ffffff' : '#111827' }}>{transaction.date}</td>
                  <td style={{ padding: '16px 12px', fontSize: '14px', fontWeight: 700, color: isDark ? '#ffffff' : '#111827' }}>{transaction.value}</td>
                  <td style={{ padding: '16px 12px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                      {transaction.method}
                    </span>
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', background: statusConfig[transaction.status as keyof typeof statusConfig].bg, color: statusConfig[transaction.status as keyof typeof statusConfig].color }}>
                      {statusConfig[transaction.status as keyof typeof statusConfig].label}
                    </span>
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <button style={{ width: '32px', height: '32px', borderRadius: '8px', border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)', background: 'transparent', color: isDark ? '#a3a3a3' : '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MoreVertical style={{ width: '16px', height: '16px' }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
