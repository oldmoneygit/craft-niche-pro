import React from 'react';
import { NavSection } from './NavSection';
import { NavItem } from './NavItem';
import { UserProfile } from './UserProfile';
import { useSidebar } from '@/hooks/useSidebar';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useAppointmentsBadge } from '@/hooks/useAppointmentsBadge';
import './styles.css';
import {
  Home,
  Users,
  UserPlus,
  Calendar,
  FileText,
  ClipboardList,
  BookOpen,
  Star,
  Briefcase,
  MessageSquare,
  Bell,
  Lightbulb,
  GraduationCap,
  BarChart3,
  DollarSign,
  Settings,
  ChevronLeft,
  Sun,
  Moon,
  Zap
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { isCollapsed, toggle } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const appointmentsCount = useAppointmentsBadge();

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* LOGO SECTION */}
      <div className="logo-section">
        <div className="logo-icon">
          <Zap className="w-6 h-6" />
        </div>
        <div className="logo-text">
          <div className="logo-title">NutriPro</div>
          <div className="logo-subtitle">Plataforma PAI</div>
        </div>
      </div>

      {/* NAVIGATION */}
      <div className="nav-container">
        {/* PRINCIPAL */}
        <NavSection title="Principal" collapsed={isCollapsed}>
          <NavItem 
            icon={Home} 
            label="Dashboard" 
            to="/platform/gabriel-gandin" 
            collapsed={isCollapsed}
          />
          <NavItem 
            icon={Users} 
            label="Clientes" 
            to="/platform/gabriel-gandin/clients" 
            collapsed={isCollapsed}
          />
          <NavItem 
            icon={UserPlus} 
            label="Leads" 
            to="/platform/gabriel-gandin/leads" 
            badge={3}
            collapsed={isCollapsed}
          />
          <NavItem 
            icon={Calendar} 
            label="Agendamentos" 
            to="/platform/gabriel-gandin/scheduling" 
            badge={appointmentsCount}
            collapsed={isCollapsed}
          />
        </NavSection>

        {/* ATENDIMENTO */}
        <NavSection title="Atendimento" collapsed={isCollapsed}>
          <NavItem 
            icon={FileText} 
            label="Planos Alimentares" 
            to="/platform/gabriel-gandin/meal-plans" 
            collapsed={isCollapsed}
          />
          <NavItem 
            icon={ClipboardList} 
            label="Questionários" 
            to="/platform/gabriel-gandin/questionnaires" 
            collapsed={isCollapsed}
          />
          <NavItem 
            icon={BookOpen} 
            label="Recordatório" 
            to="/platform/gabriel-gandin/food-records" 
            collapsed={isCollapsed}
          />
          <NavItem 
            icon={Star} 
            label="Feedbacks Semanais" 
            to="/platform/gabriel-gandin/weekly-feedbacks" 
            collapsed={isCollapsed}
          />
          <NavItem 
            icon={Briefcase} 
            label="Serviços" 
            to="/platform/gabriel-gandin/services" 
            collapsed={isCollapsed}
          />
        </NavSection>

        {/* COMUNICAÇÃO */}
        <NavSection title="Comunicação" collapsed={isCollapsed}>
          <NavItem 
            icon={MessageSquare} 
            label="Mensagens" 
            to="/platform/gabriel-gandin/communication" 
            badge={12}
            collapsed={isCollapsed}
          />
          <NavItem 
            icon={Bell} 
            label="Lembretes" 
            to="/platform/gabriel-gandin/reminder-settings" 
            collapsed={isCollapsed}
          />
        </NavSection>

        {/* INTELIGÊNCIA */}
        <NavSection title="Inteligência" collapsed={isCollapsed}>
          <NavItem 
            icon={Lightbulb} 
            label="Agente IA" 
            to="/platform/gabriel-gandin/ai-chat" 
            collapsed={isCollapsed}
          />
          <NavItem 
            icon={GraduationCap} 
            label="Base de Conhecimento" 
            to="/platform/gabriel-gandin/knowledge" 
            collapsed={isCollapsed}
          />
        </NavSection>

        {/* GESTÃO */}
        <NavSection title="Gestão" collapsed={isCollapsed}>
          <NavItem 
            icon={BarChart3} 
            label="Relatórios" 
            to="/platform/gabriel-gandin/reports" 
            collapsed={isCollapsed}
          />
          <NavItem 
            icon={DollarSign} 
            label="Financeiro" 
            to="/platform/gabriel-gandin/finances" 
            collapsed={isCollapsed}
          />
          <NavItem 
            icon={Settings} 
            label="Configurações" 
            to="/platform/gabriel-gandin/settings" 
            collapsed={isCollapsed}
          />
        </NavSection>
      </div>

      {/* BOTTOM SECTION */}
      <div className="sidebar-bottom">
        {/* THEME TOGGLE */}
        <button 
          className="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label="Alternar tema"
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
          <span className="theme-text">
            {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
          </span>
        </button>

        {/* COLLAPSE BUTTON */}
        <button 
          className="collapse-btn"
          onClick={toggle}
          aria-label={isCollapsed ? 'Expandir' : 'Recolher'}
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="collapse-text">
            {isCollapsed ? 'Expandir' : 'Recolher'}
          </span>
        </button>

        {/* USER PROFILE */}
        <UserProfile collapsed={isCollapsed} />
      </div>
    </aside>
  );
};
