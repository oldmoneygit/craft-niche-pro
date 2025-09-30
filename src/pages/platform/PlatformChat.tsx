import React from 'react';
import { useParams } from 'react-router-dom';
import { useClientConfig } from '@/core/contexts/ClientConfigContext';
import DashboardTemplate from '@/core/layouts/DashboardTemplate';

export default function PlatformChat() {
  const { clientId } = useParams<{ clientId: string }>();
  const { setClientId, clientConfig, loading } = useClientConfig();

  React.useEffect(() => {
    if (clientId && clientId.trim()) {
      setClientId(clientId);
    }
  }, [clientId, setClientId]);

  return (
    <DashboardTemplate title="Chat & WhatsApp">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      ) : !clientConfig ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Plataforma não encontrada</h1>
            <p className="text-muted-foreground">A plataforma solicitada não existe ou não está disponível.</p>
          </div>
        </div>
      ) : (
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Chat & WhatsApp - Em Desenvolvimento</h2>
          <p className="text-muted-foreground">Funcionalidade de chat será implementada na próxima fase.</p>
        </div>
      )}
    </DashboardTemplate>
  );
}
