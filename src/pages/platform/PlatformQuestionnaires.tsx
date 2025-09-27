import React from 'react';
import { useParams } from 'react-router-dom';
import { useClientConfig } from '@/core/contexts/ClientConfigContext';
import DashboardTemplate from '@/core/layouts/DashboardTemplate';
import QuestionnaireManager from '@/components/nutricionista/QuestionnaireManager';

export default function PlatformQuestionnaires() {
  const { clientId } = useParams<{ clientId: string }>();
  const { setClientId, clientConfig, loading, error, clearError } = useClientConfig();

  React.useEffect(() => {
    if (clientId && clientId.trim()) {
      console.log('PlatformQuestionnaires: Setting clientId:', clientId);
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
      ) : error ? (
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Erro ao carregar plataforma</h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button 
              onClick={() => { clearError(); if (clientId) setClientId(clientId); }} 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Tentar novamente
            </button>
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
        <QuestionnaireManager />
      )}
    </DashboardTemplate>
  );
}