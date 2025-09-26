import React from 'react';
import { useParams } from 'react-router-dom';
import { useClientConfig } from '@/core/contexts/ClientConfigContext';
import DashboardTemplate from '@/core/layouts/DashboardTemplate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, MessageCircle, Calendar, TrendingUp, DollarSign } from 'lucide-react';

export default function PlatformDashboard() {
  const { clientId } = useParams<{ clientId: string }>();
  const { setClientId, clientConfig, loading } = useClientConfig();

  React.useEffect(() => {
    console.log('PlatformDashboard - clientId:', clientId);
    if (clientId) {
      console.log('PlatformDashboard - setting clientId:', clientId);
      setClientId(clientId);
    }
  }, [clientId, setClientId]);

  console.log('PlatformDashboard - render state:', {
    loading,
    clientConfig: clientConfig?.id,
    clientId
  });

  return (
    <DashboardTemplate title="Dashboard">
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
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          </div>
          
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">245</div>
                <p className="text-xs text-muted-foreground">+12% desde o mês passado</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mensagens Hoje</CardTitle>
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89</div>
                <p className="text-xs text-muted-foreground">+5% desde ontem</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">32</div>
                <p className="text-xs text-muted-foreground">Para esta semana</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ 12.450</div>
                <p className="text-xs text-muted-foreground">+8% desde o mês passado</p>
              </CardContent>
            </Card>
          </div>

          {/* Business Specific Section */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Visão Geral do Negócio</CardTitle>
                <CardDescription>
                  Métricas principais do seu {clientConfig.businessType === 'nutritionist' ? 'consultório de nutrição' : 'negócio'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Taxa de Conversão</p>
                      <p className="text-xs text-muted-foreground">85% dos leads viram clientes</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Crescimento Mensal</p>
                      <p className="text-xs text-muted-foreground">+15% novos clientes</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Próximos Compromissos</CardTitle>
                <CardDescription>Agenda para hoje</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Consulta - Maria Silva</p>
                      <p className="text-xs text-muted-foreground">09:00 - 10:00</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Retorno - João Santos</p>
                      <p className="text-xs text-muted-foreground">14:00 - 15:00</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Avaliação - Ana Costa</p>
                      <p className="text-xs text-muted-foreground">16:00 - 17:00</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </DashboardTemplate>
  );
}