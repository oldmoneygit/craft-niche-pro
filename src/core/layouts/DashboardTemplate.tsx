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

  return (
    <BaseTemplate title={title}>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          {clientConfig && <PlatformSidebar />}
          <div className="flex-1 flex flex-col">
            <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4">
              <SidebarTrigger />
              <div className="ml-4">
                <h1 className="text-lg font-semibold">
                  {clientConfig?.branding.companyName || 'Carregando...'}
                </h1>
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