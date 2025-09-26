import React from 'react';
import { useClientConfig } from '../contexts/ClientConfigContext';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

interface BaseTemplateProps {
  children: React.ReactNode;
  title?: string;
}

export default function BaseTemplate({ children, title }: BaseTemplateProps) {
  const { clientConfig } = useClientConfig();

  // Aplica tema customizado se disponível
  React.useEffect(() => {
    if (clientConfig?.theme) {
      const root = document.documentElement;
      root.style.setProperty('--primary', clientConfig.theme.primaryColor);
      root.style.setProperty('--secondary', clientConfig.theme.secondaryColor);
      root.style.setProperty('--accent', clientConfig.theme.accentColor);
    }
  }, [clientConfig]);

  // Atualiza título da página
  React.useEffect(() => {
    if (title && clientConfig) {
      document.title = `${title} - ${clientConfig.branding.companyName}`;
    }
  }, [title, clientConfig]);

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <Sonner />
      {children}
    </div>
  );
}