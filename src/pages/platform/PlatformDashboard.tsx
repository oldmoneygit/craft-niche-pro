import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useClientConfig } from '@/core/contexts/ClientConfigContext';
import DashboardTemplate from '@/core/layouts/DashboardTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Apple,
  MessageSquare,
  FileText,
  BarChart3,
  Plus,
  Bell,
  Activity,
  ClipboardList,
  Heart,
  Bot,
  Utensils
} from 'lucide-react';
import { mockNutriData } from '@/lib/mockDataNutricionista';

export default function PlatformDashboard() {
  const { clientId } = useParams<{ clientId: string }>();
  const { setClientId, clientConfig, loading, error, clearError } = useClientConfig();
  const { dashboardMetrics, recentActivity } = mockNutriData;

  React.useEffect(() => {
    if (clientId && clientId.trim()) {
      setClientId(clientId);
    }
  }, [clientId, setClientId]);

  const MetricCard = ({ title, value, icon: Icon, trend, color = "blue" }: any) => {
    const colorClasses = {
      blue: "bg-metric-blue text-white",
      green: "bg-metric-green text-white", 
      orange: "bg-metric-orange text-white",
      purple: "bg-metric-purple text-white"
    };

    return (
      <Card className="metric-card hover:shadow-md transition-shadow overflow-hidden">
        <CardContent className="p-0">
          <div className={`${colorClasses[color]} p-4`}>
            <div className="flex items-center justify-between mb-2">
              <Icon className="h-8 w-8 text-white/90" />
              {trend && (
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-medium">
                  +{trend}
                </span>
              )}
            </div>
            <div className="text-sm font-medium text-white/90 mb-1">{title}</div>
            <div className="text-2xl font-bold text-white">{value}</div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const QuickActionButton = ({ icon: Icon, label, onClick, bgColor, hoverColor, textColor }: any) => (
    <Button 
      onClick={onClick} 
      className={`h-20 flex-col gap-2 ${bgColor} ${hoverColor} ${textColor} border-0 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105`}
    >
      <Icon className="h-6 w-6" />
      <span className="text-xs font-medium whitespace-nowrap">{label}</span>
    </Button>
  );

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
        <div className="flex-1 space-y-6">
          {/* Welcome Header */}
          <div className="bg-primary p-6 text-white rounded-2xl mx-6 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  Bem-vindo, {clientConfig?.branding.companyName.split(' ')[0]}! 👋
                </h1>
                <p className="text-primary-foreground/80">
                  Hoje você tem {dashboardMetrics.consultationsToday} consultas agendadas e {dashboardMetrics.pendingTasks} novos questionários respondidos
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-primary-foreground/80">Hoje</div>
                <div className="text-lg font-semibold">{new Date().toLocaleDateString('pt-BR')}</div>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-6">
            <MetricCard
              title="Pacientes Ativos"
              value="127"
              icon={Users}
              trend="+8%"
              color="blue"
            />
            <MetricCard
              title="Receita Mensal"
              value="R$ 28.500"
              icon={DollarSign}
              trend="+12%"
              color="green"
            />
            <MetricCard
              title="Consultas Hoje"
              value="8"
              icon={Calendar}
              trend="+2"
              color="orange"
            />
            <MetricCard
              title="Taxa de Adesão"
              value="89%"
              icon={TrendingUp}
              trend="+5%"
              color="purple"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6">

            {/* Consultas de Hoje */}
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg font-semibold">Consultas de Hoje</CardTitle>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                  Ver agenda completa
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 rounded-lg border">
                    <div className="text-sm font-medium text-muted-foreground w-16">09:00</div>
                    <div className="flex-1">
                      <div className="font-medium">Ana Silva</div>
                      <div className="text-sm text-muted-foreground">Consulta</div>
                    </div>
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                      Confirmado
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 p-3 rounded-lg border">
                    <div className="text-sm font-medium text-muted-foreground w-16">10:00</div>
                    <div className="flex-1">
                      <div className="font-medium">João Santos</div>
                      <div className="text-sm text-muted-foreground">Retorno</div>
                    </div>
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                      Confirmado
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 p-3 rounded-lg border">
                    <div className="text-sm font-medium text-muted-foreground w-16">11:00</div>
                    <div className="flex-1">
                      <div className="font-medium">Maria Costa</div>
                      <div className="text-sm text-muted-foreground">Avaliação</div>
                    </div>
                    <Badge variant="outline" className="border-warning text-warning">
                      Pendente
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Atividades Recentes */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  Atividades Recentes
                  <TrendingUp className="h-5 w-5 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Utensils className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">Ana Silva</div>
                      <div className="text-xs text-muted-foreground">Novo plano alimentar criado</div>
                      <div className="text-xs text-muted-foreground">5 min atrás</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">João Santos</div>
                      <div className="text-xs text-muted-foreground">Questionário respondido</div>
                      <div className="text-xs text-muted-foreground">12 min atrás</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">Maria Costa</div>
                      <div className="text-xs text-muted-foreground">Consulta agendada para amanhã</div>
                      <div className="text-xs text-muted-foreground">25 min atrás</div>
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