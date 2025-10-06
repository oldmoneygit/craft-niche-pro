import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ClientStatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant: 'total' | 'new' | 'active' | 'inactive';
}

const variantColors = {
  total: '#3b82f6',
  new: '#10b981',
  active: '#f59e0b',
  inactive: '#ef4444',
};

export function ClientStatCard({ title, value, icon: Icon, variant }: ClientStatCardProps) {
  const color = variantColors[variant];

  return (
    <div className={`stat-card ${variant}`}>
      <div className="stat-content">
        <h3>{title}</h3>
        <div className="value">{value}</div>
      </div>
      <div className="stat-icon">
        <Icon size={24} />
      </div>
    </div>
  );
}
