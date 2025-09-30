import React from 'react';
import { useParams } from 'react-router-dom';
import { useClientConfig } from '@/core/contexts/ClientConfigContext';
import DashboardTemplate from '@/core/layouts/DashboardTemplate';

export default function PlatformQuestionnaires() {
  const { clientId } = useParams<{ clientId: string }>();
  const { setClientId, clientConfig, loading } = useClientConfig();

  React.useEffect(() => {
    if (clientId && clientId.trim()) {
      setClientId(clientId);
    }
  }, [clientId, setClientId]);

  return (
    <DashboardTemplate title="Questionários">
      {loading ? (
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando configurações...</p>
          </div>
        </div>
      ) : !clientConfig ? (
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Plataforma não encontrada</h1>
            <p className="text-muted-foreground">A plataforma solicitada não existe ou não está disponível.</p>
          </div>
        </div>
      ) : (
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Questionários - Em Desenvolvimento</h2>
          <p className="text-muted-foreground">Sistema de questionários será implementado na próxima fase.</p>
        </div>
      )}
    </DashboardTemplate>
  );
}
