import React, { createContext, useContext, useState, useEffect } from 'react';
import { ClientConfig } from '../types/client';
import { getClientConfig } from '../config/clientRegistry';

interface ClientConfigContextType {
  clientConfig: ClientConfig | null;
  loading: boolean;
  setClientId: (clientId: string) => void;
  isModuleEnabled: (moduleName: keyof ClientConfig['modules']) => boolean;
}

const ClientConfigContext = createContext<ClientConfigContextType | undefined>(undefined);

export function ClientConfigProvider({ children }: { children: React.ReactNode }) {
  const [clientConfig, setClientConfig] = useState<ClientConfig | null>(null);
  const [loading, setLoading] = useState(false);

  const setClientId = (clientId: string) => {
    console.log('ClientConfigContext - setClientId called with:', clientId);
    setLoading(true);
    // Simula carregamento async - no futuro será uma chamada real ao backend
    setTimeout(() => {
      console.log('ClientConfigContext - getting config for:', clientId);
      const config = getClientConfig(clientId);
      console.log('ClientConfigContext - config found:', config);
      setClientConfig(config);
      setLoading(false);
    }, 100);
  };

  const isModuleEnabled = (moduleName: keyof ClientConfig['modules']): boolean => {
    return clientConfig?.modules[moduleName] ?? false;
  };

  return (
    <ClientConfigContext.Provider value={{
      clientConfig,
      loading,
      setClientId,
      isModuleEnabled,
    }}>
      {children}
    </ClientConfigContext.Provider>
  );
}

export function useClientConfig() {
  const context = useContext(ClientConfigContext);
  if (context === undefined) {
    throw new Error('useClientConfig must be used within a ClientConfigProvider');
  }
  return context;
}