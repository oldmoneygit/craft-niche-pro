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
    setClientId(actualClientId);
  }, [actualClientId, setClientId]);

  return (
    <DashboardTemplate title={title}>
      {children}
    </DashboardTemplate>
  );
}