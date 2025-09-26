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
  const { clientConfig, loading } = useClientConfig();

  if (loading) {
    return (
      <BaseTemplate>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </BaseTemplate>
    );
  }

  if (!clientConfig) {
    return (
      <BaseTemplate>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Plataforma não encontrada</h1>
            <p className="text-muted-foreground">A plataforma solicitada não existe ou não está disponível.</p>
          </div>
        </div>
      </BaseTemplate>
    );
  }

  return (
    <BaseTemplate title={title}>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <PlatformSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4">
              <SidebarTrigger />
              <div className="ml-4">
                <h1 className="text-lg font-semibold">{clientConfig.branding.companyName}</h1>
              </div>
            </header>
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </BaseTemplate>
  );
}