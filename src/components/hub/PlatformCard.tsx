import React from 'react';

export type PlatformVertical = 'nutrition' | 'fitness' | 'wellness' | 'mental';

interface Metric {
  label: string;
  value: string | number;
}

interface PlatformCardProps {
  vertical: PlatformVertical;
  title: string;
  subtitle: string;
  badge: string;
  metrics: Metric[];
}

const verticalConfig = {
  nutrition: {
    color: '#10b981',
    darkBgStart: '#18181b', darkBgEnd: '#1a3d2e', darkBorder: '#2d5a45',
    lightBgStart: '#f0fdf4', lightBgEnd: '#dcfce7', lightBorder: '#bbf7d0',
  },
  fitness: {
    color: '#f97316',
    darkBgStart: '#18181b', darkBgEnd: '#3d2010', darkBorder: '#9c3d12',
    lightBgStart: '#fff7ed', lightBgEnd: '#ffedd5', lightBorder: '#fed7aa',
  },
  wellness: {
    color: '#06b6d4',
    darkBgStart: '#18181b', darkBgEnd: '#0e3d4a', darkBorder: '#1e6b7d',
    lightBgStart: '#ecfeff', lightBgEnd: '#cffafe', lightBorder: '#a5f3fc',
  },
  mental: {
    color: '#a855f7',
    darkBgStart: '#18181b', darkBgEnd: '#3d1b50', darkBorder: '#7b21a8',
    lightBgStart: '#faf5ff', lightBgEnd: '#f3e8ff', lightBorder: '#e9d5ff',
  },
};

export function PlatformCard({ vertical, title, subtitle, badge, metrics }: PlatformCardProps) {
  const config = verticalConfig[vertical];

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
      style={{
        background: `linear-gradient(135deg, ${config.darkBgStart} 0%, ${config.darkBgEnd} 100%)`,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: config.darkBorder,
      }}
    >
      <div
        className="absolute top-0 right-0 w-48 h-48 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"
        style={{ background: config.color, opacity: 0.08 }}
      />

      <div className="relative z-10 flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-zinc-50 mb-1">{title}</h3>
          <p className="text-sm text-zinc-400 font-medium">{subtitle}</p>
        </div>
        <span
          className="px-3 py-1 rounded-full text-xs font-semibold text-white"
          style={{ background: config.color }}
        >
          {badge}
        </span>
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-white/5 rounded-lg p-4 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-opacity-20"
            style={{ borderColor: config.color, borderOpacity: 0.1 }}
          >
            <p className="text-xs text-zinc-400 font-medium mb-1">{metric.label}</p>
            <p className="text-2xl font-bold text-zinc-50">{metric.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
