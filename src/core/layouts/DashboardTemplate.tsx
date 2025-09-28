import React from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useClientConfig } from '../contexts/ClientConfigContext';
import BaseTemplate from './BaseTemplate';
import { PlatformSidebar } from '../components/PlatformSidebar';

interface DashboardTemplateProps {
  children: React.ReactNode;
  title?: string;
}

export default function DashboardTemplate({ children, title }: DashboardTemplateProps) {
  const { clientConfig, loading, error } = useClientConfig();

  // Se ainda estiver carregando, não renderiza a sidebar
  if (loading) {
    return (
      <BaseTemplate title={title}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </BaseTemplate>
    );
  }

  return (
    <BaseTemplate title={title}>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          {clientConfig && <PlatformSidebar />}
          <div className="flex-1 flex flex-col min-w-0">
            <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-6 lg:px-8 shadow-sm">
              {clientConfig && <SidebarTrigger />}
              <div className="ml-4">
                <h1 className="text-lg font-semibold text-foreground">
                  {clientConfig?.branding.companyName || 'Plataforma'}
                </h1>
              </div>
            </header>
            <main className="flex-1 overflow-auto bg-gray-50/30">
              <div className="h-full w-full max-w-none">
                {children}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </BaseTemplate>
  );
}