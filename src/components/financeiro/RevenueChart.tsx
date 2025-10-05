import React, { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';

interface MonthData {
  month: string;
  value: number;
  percentage: number;
}

export const RevenueChart: React.FC = () => {
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

  const months: MonthData[] = [
    { month: 'out/25', value: 4158, percentage: 85 },
    { month: 'set/25', value: 4752, percentage: 100 },
    { month: 'ago/25', value: 2970, percentage: 65 },
    { month: 'jul/25', value: 3267, percentage: 70 },
    { month: 'jun/25', value: 2376, percentage: 50 },
    { month: 'mai/25', value: 947, percentage: 25 }
  ];

  return (
    <div style={{ background: isDark ? 'rgba(20, 20, 20, 0.9)' : '#1e293b', backdropFilter: 'blur(10px)', border: isDark ? '1px solid rgba(64, 64, 64, 0.3)' : '1px solid rgba(229, 231, 235, 0.8)', borderRadius: '16px', padding: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp style={{ width: '18px', height: '18px', color: '#10b981' }} />
          </div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
            Receita nos Últimos 6 Meses
          </h2>
        </div>
        <div style={{ fontSize: '20px', fontWeight: 700, color: '#10b981' }}>
          R$ 18.470
        </div>
      </div>

      <div>
        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: '16px', padding: '12px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', marginBottom: '8px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mês</div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Progresso</div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Receita</div>
        </div>

        {months.map((data, index) => (
          <div key={index} style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: '16px', padding: '10px 16px', borderRadius: '8px', transition: 'all 0.2s ease', alignItems: 'center' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)' }}>
              {data.month}
            </div>
            <div style={{ position: 'relative', height: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#10b981', borderRadius: '4px', width: `${data.percentage}%`, transition: 'width 0.6s ease' }} />
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', textAlign: 'right', minWidth: '100px' }}>
              R$ {data.value.toLocaleString('pt-BR')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
