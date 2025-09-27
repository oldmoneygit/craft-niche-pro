import React, { createContext, useContext, useState, useEffect } from 'react';
import { ClientConfig } from '../types/client';
import { getClientConfig } from '../config/clientRegistry';

interface ClientConfigContextType {
  clientConfig: ClientConfig | null;
  loading: boolean;
  error: string | null;
  setClientId: (clientId: string) => void;
  isModuleEnabled: (moduleName: keyof ClientConfig['modules']) => boolean;
  clearError: () => void;
}

const ClientConfigContext = createContext<ClientConfigContextType | undefined>(undefined);

export function ClientConfigProvider({ children }: { children: React.ReactNode }) {
  const [clientConfig, setClientConfig] = useState<ClientConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentClientId, setCurrentClientId] = useState<string | null>(null);

  const setClientId = (clientId: string) => {
    // Evita recarregar se já está carregando o mesmo cliente
    if (currentClientId === clientId && clientConfig) {
      return;
    }

    console.log('ClientConfigContext: Loading config for clientId:', clientId);
    setLoading(true);
    setError(null);
    setCurrentClientId(clientId);

    // Simula carregamento async - no futuro será uma chamada real ao backend
    const timeoutId = setTimeout(() => {
      try {
        const config = getClientConfig(clientId);
        
        if (config) {
          console.log('ClientConfigContext: Config loaded successfully:', config.name);
          setClientConfig(config);
          setError(null);
        } else {
          console.log('ClientConfigContext: No config found for clientId:', clientId);
          setError(`Configuração não encontrada para o cliente: ${clientId}`);
          setClientConfig(null);
        }
      } catch (err) {
        console.error('ClientConfigContext: Error loading config:', err);
        setError('Erro ao carregar configuração do cliente');
        setClientConfig(null);
      } finally {
        setLoading(false);
      }
    }, 100);

    // Cleanup timeout se o componente desmontar
    return () => clearTimeout(timeoutId);
  };

  const isModuleEnabled = (moduleName: keyof ClientConfig['modules']): boolean => {
    return clientConfig?.modules[moduleName] ?? false;
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <ClientConfigContext.Provider value={{
      clientConfig,
      loading,
      error,
      setClientId,
      isModuleEnabled,
      clearError,
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