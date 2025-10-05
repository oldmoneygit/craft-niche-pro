import { NavLink } from 'react-router-dom';
import { ChevronLeft, Moon, Sun } from 'lucide-react';
import { useSidebar } from '../../hooks/useSidebar';
import { useTheme } from '../../hooks/useTheme';
import './Sidebar.css';

// Componentes de ícones SVG customizados (exatos do artefato)
const HomeIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
  </svg>
);

const UsersIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
  </svg>
);

const UserPlusIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
  </svg>
);

const CalendarIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
  </svg>
);

const DocumentIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
  </svg>
);

const ClipboardIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
  </svg>
);

const BookIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
  </svg>
);

const StarIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
  </svg>
);

const BriefcaseIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
  </svg>
);

const ChatIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
  </svg>
);

const BellIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
  </svg>
);

const LightbulbIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
  </svg>
);

const BookOpenIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
  </svg>
);

const ChartIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
  </svg>
);

const DollarIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>
);

const SettingsIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
  </svg>
);

const ZapIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
  </svg>
);

interface NavItem {
  to: string;
  icon: () => JSX.Element;
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
      { to: '/', icon: HomeIcon, label: 'Dashboard' },
      { to: '/clientes', icon: UsersIcon, label: 'Clientes' },
      { to: '/leads', icon: UserPlusIcon, label: 'Leads', badge: 3 },
      { to: '/agendamentos', icon: CalendarIcon, label: 'Agendamentos', badge: 8 },
    ]
  },
  {
    title: 'ATENDIMENTO',
    items: [
      { to: '/planos', icon: DocumentIcon, label: 'Planos Alimentares' },
      { to: '/questionarios', icon: ClipboardIcon, label: 'Questionários' },
      { to: '/recordatorio', icon: BookIcon, label: 'Recordatório' },
      { to: '/feedbacks', icon: StarIcon, label: 'Feedbacks Semanais' },
      { to: '/servicos', icon: BriefcaseIcon, label: 'Serviços' },
    ]
  },
  {
    title: 'COMUNICAÇÃO',
    items: [
      { to: '/mensagens', icon: ChatIcon, label: 'Mensagens', badge: 12 },
      { to: '/lembretes', icon: BellIcon, label: 'Lembretes' },
    ]
  },
  {
    title: 'INTELIGÊNCIA',
    items: [
      { to: '/agente-ia', icon: LightbulbIcon, label: 'Agente IA' },
      { to: '/base-conhecimento', icon: BookOpenIcon, label: 'Base de Conhecimento' },
    ]
  },
  {
    title: 'GESTÃO',
    items: [
      { to: '/relatorios', icon: ChartIcon, label: 'Relatórios' },
      { to: '/financeiro', icon: DollarIcon, label: 'Financeiro' },
      { to: '/configuracoes', icon: SettingsIcon, label: 'Configurações' },
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
          <ZapIcon />
        </div>
        <div className="logo-text">
          <div className="logo-title">KorLab Nutri</div>
          <div className="logo-subtitle">NUTRIÇÃO</div>
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
                  <span className="nav-icon"><Icon /></span>
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
