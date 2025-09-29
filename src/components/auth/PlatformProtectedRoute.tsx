import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';

interface PlatformProtectedRouteProps {
  children: React.ReactNode;
}

export default function PlatformProtectedRoute({ children }: PlatformProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { clientId } = useParams();

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/platform/${clientId}/login`} replace />;
  }

  if (!profile || !profile.tenant_id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Acesso Negado</h2>
          <p className="text-muted-foreground">Seu perfil não está associado a nenhuma plataforma.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}