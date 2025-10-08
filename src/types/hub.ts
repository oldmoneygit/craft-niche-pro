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

export interface VerticalStyleConfig {
  color: string;
  bgStart: string;
  bgEnd: string;
  borderColor: string;
}

export const VERTICAL_STYLES: Record<VerticalType, VerticalStyleConfig> = {
  nutrition: {
    color: '#10b981',
    bgStart: '#18181b',
    bgEnd: '#1a2e1e',
    borderColor: '#22543d'
  },
  fitness: {
    color: '#f97316',
    bgStart: '#18181b',
    bgEnd: '#2d1810',
    borderColor: '#7c2d12'
  },
  wellness: {
    color: '#06b6d4',
    bgStart: '#18181b',
    bgEnd: '#0e2730',
    borderColor: '#164e63'
  },
  mental: {
    color: '#a855f7',
    bgStart: '#18181b',
    bgEnd: '#2d1b40',
    borderColor: '#6b21a8'
  }
};

export const VERTICAL_STYLES_LIGHT: Record<VerticalType, Omit<VerticalStyleConfig, 'color'>> = {
  nutrition: {
    bgStart: '#f0fdf4',
    bgEnd: '#dcfce7',
    borderColor: '#bbf7d0'
  },
  fitness: {
    bgStart: '#fff7ed',
    bgEnd: '#ffedd5',
    borderColor: '#fed7aa'
  },
  wellness: {
    bgStart: '#ecfeff',
    bgEnd: '#cffafe',
    borderColor: '#a5f3fc'
  },
  mental: {
    bgStart: '#faf5ff',
    bgEnd: '#f3e8ff',
    borderColor: '#e9d5ff'
  }
};
