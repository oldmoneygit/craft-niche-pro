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
    <aside className="w-72 bg-zinc-900 border-r border-zinc-800 p-6 flex flex-col transition-colors duration-300 relative z-10">
      <div className="flex items-center gap-3 mb-10 pb-6 border-b border-zinc-800">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <span className="text-white font-black text-lg">K</span>
        </div>
        <div>
          <div className="text-zinc-50 font-bold text-lg">KorLab</div>
          <div className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">
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
              className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-zinc-800 text-zinc-50 border-l-2 border-indigo-500 pl-3.5'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300'
              }`}
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
