import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, UserPlus, Calendar, 
  Utensils, ClipboardList, Apple, MessageSquare,
  Package, MessageCircle, Bell, Lightbulb, BookOpen,
  BarChart3, DollarSign, Settings, ChevronLeft,
  Moon, Sun, Zap
} from 'lucide-react';
import { useSidebar } from '../../hooks/useSidebar';
import { useTheme } from '../../hooks/useTheme';
import './Sidebar.css';

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'PRINCIPAL',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/clientes', icon: Users, label: 'Clientes' },
      { to: '/leads', icon: UserPlus, label: 'Leads', badge: 3 },
      { to: '/agendamentos', icon: Calendar, label: 'Agendamentos', badge: 8 },
    ]
  },
  {
    title: 'ATENDIMENTO',
    items: [
      { to: '/planos', icon: Utensils, label: 'Planos Alimentares' },
      { to: '/questionarios', icon: ClipboardList, label: 'Questionários' },
      { to: '/recordatorio', icon: Apple, label: 'Recordatório' },
      { to: '/feedbacks', icon: MessageSquare, label: 'Feedbacks Semanais' },
      { to: '/servicos', icon: Package, label: 'Serviços' },
    ]
  },
  {
    title: 'COMUNICAÇÃO',
    items: [
      { to: '/mensagens', icon: MessageCircle, label: 'Mensagens', badge: 12 },
      { to: '/lembretes', icon: Bell, label: 'Lembretes' },
    ]
  },
  {
    title: 'INTELIGÊNCIA',
    items: [
      { to: '/agente-ia', icon: Lightbulb, label: 'Agente IA' },
      { to: '/base-conhecimento', icon: BookOpen, label: 'Base de Conhecimento' },
    ]
  },
  {
    title: 'GESTÃO',
    items: [
      { to: '/relatorios', icon: BarChart3, label: 'Relatórios' },
      { to: '/financeiro', icon: DollarSign, label: 'Financeiro' },
      { to: '/configuracoes', icon: Settings, label: 'Configurações' },
    ]
  }
];

export function Sidebar() {
  const { isCollapsed, toggle } = useSidebar();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Logo Section */}
      <div className="logo-section">
        <div className="logo-icon">
          <Zap size={24} />
        </div>
        <div className="logo-text">
          <div className="logo-title">NutriPro</div>
          <div className="logo-subtitle">Plataforma PAI</div>
        </div>
      </div>

      {/* Navigation */}
      <div className="sidebar-nav">
        {NAV_SECTIONS.map((section, sectionIndex) => (
          <div key={section.title} className="nav-section">
            <div className="nav-section-title">{section.title}</div>
            {section.items.map((item, itemIndex) => {
              const Icon = item.icon;
              const delay = (sectionIndex * 5 + itemIndex) * 0.05;
              
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  data-tooltip={item.label}
                  style={{ animationDelay: `${delay}s` }}
                >
                  <Icon className="nav-icon" size={20} />
                  <span className="nav-label">{item.label}</span>
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="sidebar-bottom">
        {/* Theme Toggle */}
        <button onClick={toggleTheme} className="theme-toggle">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          <span className="theme-text">
            {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
          </span>
        </button>

        {/* Collapse Button */}
        <button onClick={toggle} className="collapse-btn">
          <ChevronLeft size={18} />
          <span className="collapse-text">
            {isCollapsed ? 'Expandir' : 'Recolher'}
          </span>
        </button>

        {/* User Profile */}
        <div className="user-profile">
          <div className="user-avatar">DN</div>
          <div className="user-info">
            <div className="user-name">Dra. Nutricionista</div>
            <div className="user-role">CRN-3 12345</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
