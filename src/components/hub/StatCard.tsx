import React from 'react';
import { Video as LucideIcon } from 'lucide-react';

export type StatCardVariant = 'revenue' | 'clients' | 'modules' | 'growth';

interface StatCardProps {
  variant: StatCardVariant;
  label: string;
  value: string | number;
  change?: {
    value: string;
    positive: boolean;
  };
  icon: typeof LucideIcon;
}

const variantColors = {
  revenue: { color: '#10b981', light: 'rgba(16, 185, 129, 0.1)' },
  clients: { color: '#3b82f6', light: 'rgba(59, 130, 246, 0.1)' },
  modules: { color: '#f59e0b', light: 'rgba(245, 158, 11, 0.1)' },
  growth: { color: '#8b5cf6', light: 'rgba(139, 92, 246, 0.1)' },
};

export function StatCard({ variant, label, value, change, icon: Icon }: StatCardProps) {
  const colors = variantColors[variant];

  return (
    <div
      className="group relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
      style={{
        backgroundColor: 'var(--bg-sidebar)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--border)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 group-hover:w-1.5"
        style={{ background: colors.color }}
      />

      <div className="flex items-start justify-between mb-4">
        <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--hub-text-muted)' }}>
          {label}
        </p>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
          style={{ background: colors.light }}
        >
          <Icon size={20} style={{ color: colors.color }} />
        </div>
      </div>

      <div className="text-3xl font-bold mb-2" style={{ color: 'var(--hub-text-primary)' }}>{value}</div>

      {change && (
        <div className={`flex items-center gap-1 text-sm font-semibold ${
          change.positive ? 'text-green-500' : 'text-red-500'
        }`}>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d={change.positive ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"}
            />
          </svg>
          {change.value}
        </div>
      )}
    </div>
  );
}
