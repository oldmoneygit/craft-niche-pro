import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Users, 
  MessageCircle, 
  BarChart3, 
  Calendar,
  Bot,
  FileText,
  Utensils,
  Stethoscope,
  DollarSign,
  Settings
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useClientConfig } from '../contexts/ClientConfigContext';

export function PlatformSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { clientConfig, isModuleEnabled } = useClientConfig();
  
  if (!clientConfig) return null;

  const currentPath = location.pathname;
  const platformBasePath = `/platform/${clientConfig.id}`;

  const coreMenuItems = [
    {
      title: 'Dashboard',
      url: platformBasePath,
      icon: BarChart3,
      enabled: true,
    },
    {
      title: 'Clientes',
      url: `${platformBasePath}/clientes`,
      icon: Users,
      enabled: isModuleEnabled('clientManagement'),
    },
    {
      title: 'Comunicação',
      url: `${platformBasePath}/comunicacao`,
      icon: MessageCircle,
      enabled: isModuleEnabled('whatsappChat'),
    },
    {
      title: 'Agente IA',
      url: `${platformBasePath}/ai-agent`,
      icon: Bot,
      enabled: isModuleEnabled('aiAgent'),
    },
    {
      title: 'FAQ Bot',
      url: `${platformBasePath}/faq-bot`,
      icon: Bot,
      enabled: true, // FAQ Bot is always enabled
    },
    {
      title: 'Agendamentos',
      url: `${platformBasePath}/agendamentos`,
      icon: Calendar,
      enabled: isModuleEnabled('scheduling'),
    },
    {
      title: 'Relatórios',
      url: `${platformBasePath}/analytics`,
      icon: BarChart3,
      enabled: isModuleEnabled('analytics'),
    },
  ];

  const businessSpecificItems = [];
  
  if (clientConfig.businessType === 'nutritionist') {
    if (isModuleEnabled('questionnaires')) {
      businessSpecificItems.push({
        title: 'Questionários',
        url: `${platformBasePath}/questionnaires`,
        icon: FileText,
      });
    }
    if (isModuleEnabled('mealPlans')) {
      businessSpecificItems.push({
        title: 'Planos Alimentares',
        url: `${platformBasePath}/planos-alimentares`,
        icon: Utensils,
      });
    }
  }

  if (clientConfig.businessType === 'clinic') {
    if (isModuleEnabled('medicalRecords')) {
      businessSpecificItems.push({
        title: 'Prontuários',
        url: `${platformBasePath}/medical-records`,
        icon: Stethoscope,
      });
    }
  }

  const settingsItems = [
    {
      title: 'Financeiro',
      url: `${platformBasePath}/financial`,
      icon: DollarSign,
      enabled: true,
    },
    {
      title: 'Configurações',
      url: `${platformBasePath}/settings`,
      icon: Settings,
      enabled: true,
    },
  ];

  const isActive = (path: string) => {
    if (path === platformBasePath) {
      return currentPath === path;
    }
    return currentPath.startsWith(path);
  };

  const getNavClassName = (path: string) => {
    const active = isActive(path);
    return active 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium rounded-lg" 
      : "hover:bg-sidebar-accent/20 text-sidebar-foreground/80 hover:text-sidebar-foreground rounded-lg transition-all duration-200";
  };

  return (
    <Sidebar className={state === "collapsed" ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-sidebar text-sidebar-foreground border-r border-sidebar-border/30">
        {/* Brand Header - Cleaner design */}
        <div className="p-4 lg:p-6 border-b border-sidebar-border/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sidebar-accent/20 rounded-lg flex items-center justify-center text-sidebar-foreground font-bold text-lg border border-sidebar-accent/30">
              {clientConfig.branding.companyName.charAt(0)}
            </div>
            {state !== "collapsed" && (
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-lg text-sidebar-foreground truncate">
                  {clientConfig.branding.companyName}
                </h2>
                <p className="text-xs text-sidebar-foreground/70">Nutrição</p>
              </div>
            )}
          </div>
        </div>
        {/* Core Features */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 font-medium">Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {coreMenuItems.filter(item => item.enabled).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClassName(item.url)}>
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Business Specific Features */}
        {businessSpecificItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/70 font-medium">Específico do Negócio</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {businessSpecificItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavClassName(item.url)}>
                        <item.icon className="h-4 w-4" />
                        {state !== "collapsed" && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 font-medium">Configurações</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.filter(item => item.enabled).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClassName(item.url)}>
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}