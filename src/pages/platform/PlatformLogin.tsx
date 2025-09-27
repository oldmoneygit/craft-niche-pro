import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClientConfig } from '@/core/contexts/ClientConfigContext';
import BaseTemplate from '@/core/layouts/BaseTemplate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';

export default function PlatformLogin() {
  const { clientId } = useParams<{ clientId: string }>();
  const { setClientId, clientConfig, loading, error, clearError } = useClientConfig();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  React.useEffect(() => {
    if (clientId && clientId.trim()) {
      setClientId(clientId);
    }
  }, [clientId, setClientId]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - no futuro será integrado com backend/Supabase
    navigate(`/platform/${clientId}`);
  };

  if (loading) {
    return (
      <BaseTemplate>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando plataforma...</p>
          </div>
        </div>
      </BaseTemplate>
    );
  }

  if (error || !clientConfig) {
    return (
      <BaseTemplate>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {error ? 'Erro ao carregar plataforma' : 'Plataforma não encontrada'}
            </h1>
            <p className="text-muted-foreground mb-4">
              {error || 'A plataforma solicitada não existe ou não está disponível.'}
            </p>
            {error && (
              <Button onClick={() => { clearError(); if (clientId) setClientId(clientId); }}>
                Tentar novamente
              </Button>
            )}
          </div>
        </div>
      </BaseTemplate>
    );
  }

  return (
    <BaseTemplate title="Login">
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4">
              {clientConfig.branding.logoUrl ? (
                <img 
                  src={clientConfig.branding.logoUrl} 
                  alt={clientConfig.branding.companyName}
                  className="h-12 w-auto"
                />
              ) : (
                <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl">
                  {clientConfig.branding.companyName.charAt(0)}
                </div>
              )}
            </div>
            <CardTitle className="text-2xl font-bold">
              {clientConfig.branding.companyName}
            </CardTitle>
            <CardDescription>
              Entre com suas credenciais para acessar a plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={credentials.email}
                  onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full">
                Entrar
              </Button>
            </form>
            <div className="mt-4 text-center">
              <a href="#" className="text-sm text-primary hover:underline">
                Esqueceu sua senha?
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </BaseTemplate>
  );
}