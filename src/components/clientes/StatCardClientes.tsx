import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  variant: 'total' | 'new' | 'active' | 'inactive';
}

export function StatCardClientes({ title, value, icon: Icon, variant }: StatCardProps) {
  const variantColors = {
    total: '#3b82f6',    // azul
    new: '#10b981',      // verde
    active: '#f59e0b',   // laranja
    inactive: '#ef4444'  // vermelho
  };

  const color = variantColors[variant];

  return (
    <div 
      className="p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg flex items-center justify-between"
      style={{
        background: 'var(--bg-sidebar)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderColor: 'var(--border)',
        boxShadow: '0 4px 16px var(--shadow)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.boxShadow = '0 6px 24px var(--shadow)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = '0 4px 16px var(--shadow)';
      }}
    >
      {/* Conteúdo */}
      <div>
        <h3 
          className="text-xs font-semibold uppercase tracking-wider mb-2"
          style={{ color }}
        >
          {title}
        </h3>
        <div 
          className="text-[32px] font-bold leading-none"
          style={{ color: 'var(--text-primary)' }}
        >
          {value}
        </div>
      </div>

      {/* Ícone */}
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: color }}
      >
        <Icon className="w-6 h-6 text-white" strokeWidth={2} />
      </div>
    </div>
  );
}
