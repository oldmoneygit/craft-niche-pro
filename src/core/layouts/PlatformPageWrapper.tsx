import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useClientConfig } from '../contexts/ClientConfigContext';
import DashboardTemplate from './DashboardTemplate';

interface PlatformPageWrapperProps {
  children: React.ReactNode;
  title?: string;
}

export default function PlatformPageWrapper({ children, title }: PlatformPageWrapperProps) {
  const { clientId } = useParams<{ clientId: string }>();
  const { setClientId } = useClientConfig();
  
  // Use gabriel-gandin as fallback if clientId is invalid
  const actualClientId = clientId && clientId !== ':clientId' ? clientId : 'gabriel-gandin';
  
  // Initialize the client config context
  useEffect(() => {
    // Apenas chama setClientId se o ID for válido (não é UUID de tenant)
    if (actualClientId && !actualClientId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      setClientId(actualClientId);
    }
  }, [actualClientId, setClientId]);

  return (
    <DashboardTemplate title={title}>
      {children}
    </DashboardTemplate>
  );
}