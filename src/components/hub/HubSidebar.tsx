import React from 'react';
import { Chrome as Home, Building2, Users, ChartBar as BarChart3, Settings } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/hub/dashboard' },
  { icon: Building2, label: 'Plataformas', path: '/hub/platforms' },
  { icon: Users, label: 'Clientes', path: '/hub/clients' },
  { icon: BarChart3, label: 'Análises', path: '/hub/analytics' },
  { icon: Settings, label: 'Configurações', path: '/hub/settings' },
];

export function HubSidebar() {
  const location = useLocation();

  return (
    <aside
      className="w-72 border-r p-6 flex flex-col transition-colors duration-300 relative z-10"
      style={{
        backgroundColor: 'var(--hub-bg-secondary)',
        borderColor: 'var(--hub-border-primary)',
      }}
    >
      <div
        className="flex items-center gap-3 mb-10 pb-6 border-b"
        style={{ borderColor: 'var(--hub-border-primary)' }}
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <span className="text-white font-black text-lg">K</span>
        </div>
        <div>
          <div className="font-bold text-lg" style={{ color: 'var(--hub-text-primary)' }}>KorLab</div>
          <div className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--hub-text-muted)' }}>
            Hub Platform
          </div>
        </div>
      </div>

      <nav className="flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-4 py-3 mb-1 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-80"
              style={{
                backgroundColor: isActive ? 'var(--hub-bg-tertiary)' : 'transparent',
                color: isActive ? 'var(--hub-text-primary)' : 'var(--hub-text-tertiary)',
                borderLeft: isActive ? '2px solid #6366f1' : 'none',
                paddingLeft: isActive ? '14px' : '16px',
              }}
            >
              <Icon size={20} className={isActive ? 'opacity-100' : 'opacity-70'} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
