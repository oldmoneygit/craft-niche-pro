import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardStatCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  variant: 'today' | 'month' | 'pending' | 'inactive';
}

export const DashboardStatCard: React.FC<DashboardStatCardProps> = ({
  label,
  value,
  change,
  changeType,
  icon: Icon,
  variant
}) => {
  return (
    <div className={`stat-card ${variant}`}>
      <div className="stat-header">
        <div className="stat-label">{label}</div>
        <div className="stat-icon">
          <Icon size={24} />
        </div>
      </div>
      <div className="stat-value">{value}</div>
      <div className={`stat-change ${changeType || ''}`}>
        {changeType === 'positive' && (
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        )}
        {change}
      </div>
    </div>
  );
};
