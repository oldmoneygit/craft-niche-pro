import React, { useEffect, useState } from 'react';
import { CreditCard } from 'lucide-react';

export const PaymentMethodsChart: React.FC = () => {
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

  const methods = [
    { label: '💳 PIX', value: 12870, percentage: 70 },
    { label: '💳 Cartão de Crédito', value: 3694, percentage: 20 },
    { label: '💵 Cartão de Débito', value: 1359, percentage: 7 },
    { label: '💵 Dinheiro', value: 547, percentage: 3 }
  ];

  return (
    <div style={{ background: isDark ? 'rgba(20, 20, 20, 0.9)' : '#1e293b', backdropFilter: 'blur(10px)', border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)', borderRadius: '16px', padding: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--primary-alpha-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CreditCard style={{ width: '18px', height: '18px', color: 'var(--primary)' }} />
        </div>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--bg-white)' }}>
          Formas de Pagamento
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {methods.map((method, index) => (
          <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
            <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)' }}>{method.label}</span>
            <div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--bg-white)' }}>
                R$ {method.value.toLocaleString('pt-BR')}
              </span>
              <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginLeft: '8px' }}>
                {method.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--primary-alpha)', borderRadius: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>TOTAL</span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary)' }}>R$ 18.470</span>
        </div>
      </div>
    </div>
  );
};
