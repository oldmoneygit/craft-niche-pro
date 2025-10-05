import React from 'react';
import { CheckCircle, Clock, AlertTriangle, DollarSign, TrendingUp } from 'lucide-react';

interface FinanceStatCardProps {
  type: 'received' | 'pending' | 'overdue' | 'average' | 'rate';
  label: string;
  value: string;
  subtitle: string;
}

const typeConfig = {
  received: {
    icon: CheckCircle,
    color: '#10b981',
    colorDark: '#059669'
  },
  pending: {
    icon: Clock,
    color: '#f59e0b',
    colorDark: '#d97706'
  },
  overdue: {
    icon: AlertTriangle,
    color: '#ef4444',
    colorDark: '#dc2626'
  },
  average: {
    icon: DollarSign,
    color: '#3b82f6',
    colorDark: '#2563eb'
  },
  rate: {
    icon: TrendingUp,
    color: '#a855f7',
    colorDark: '#9333ea'
  }
};

export const FinanceStatCard: React.FC<FinanceStatCardProps> = ({ type, label, value, subtitle }) => {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${config.color} 0%, ${config.colorDark} 100%)`,
        borderRadius: '16px',
        padding: '28px',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        cursor: 'default'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
      }}
    >
      <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '200px', height: '200px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '50%' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: '14px', color: 'white', fontWeight: 600, marginBottom: '8px' }}>
          {label}
        </div>
        <div style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon style={{ width: '28px', height: '28px', color: 'white' }} />
        </div>
      </div>

      <div style={{ fontSize: '36px', fontWeight: 700, color: 'white', marginBottom: '6px', position: 'relative', zIndex: 1 }}>
        {value}
      </div>

      <div style={{ fontSize: '13px', color: 'white', opacity: 0.95, position: 'relative', zIndex: 1 }}>
        {subtitle}
      </div>
    </div>
  );
};
