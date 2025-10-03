export type VerticalType = 'nutrition' | 'fitness' | 'wellness' | 'mental';
export type PlatformStatus = 'active' | 'inactive' | 'maintenance';

export interface PlatformMetrics {
  professionals: number;
  clients: number;
  templates: number;
  monthly_revenue: number;
}

export interface Platform {
  id: string;
  name: string;
  slug: string;
  vertical: VerticalType;
  subtitle: string;
  status: PlatformStatus;
  created_at: string;
  metrics: PlatformMetrics;
  features: string[];
  logo_url?: string;
}

export interface VerticalConfig {
  value: VerticalType;
  label: string;
  color: string;
  icon: any;
}

export const VERTICAL_COLORS: Record<VerticalType, string> = {
  nutrition: '#10b981',
  fitness: '#f97316',
  wellness: '#06b6d4',
  mental: '#a855f7'
};
