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
  const { setClientId, clientConfig, loading } = useClientConfig();
  const { dashboardMetrics, recentActivity } = mockNutriData;

  React.useEffect(() => {
    if (clientId) {
      setClientId(clientId);
    }
  }, [clientId, setClientId]);

  const MetricCard = ({ title, value, icon: Icon, trend, color = "primary" }: any) => (
    <Card className="metric-card hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</CardTitle>
        <Icon className={`h-5 w-5 text-${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-xl lg:text-2xl font-bold text-foreground whitespace-nowrap">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-1">
            <span className="text-success font-medium">+{trend}%</span> vs mês anterior
          </p>
        )}
      </CardContent>
    </Card>
  );

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
        <div className="flex-1 space-y-8 p-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <MetricCard
              title="Pacientes Ativos"
              value={dashboardMetrics.patientsActive}
              icon={Users}
              trend={8}
              color="primary"
            />
            <MetricCard
              title="Consultas Hoje"
              value={dashboardMetrics.consultationsToday}
              icon={Calendar}
              color="info"
            />
            <MetricCard
              title="Próximas Consultas"
              value={`${dashboardMetrics.nextWeekConsultations}`}
              icon={Activity}
              color="warning"
            />
            <MetricCard
              title="Faturamento Mensal"
              value={`R$ ${dashboardMetrics.monthlyRevenue.toLocaleString()}`}
              icon={DollarSign}
              trend={12}
              color="success"
            />
            <MetricCard
              title="Taxa de Renovação"
              value={`${dashboardMetrics.renovationRate}%`}
              icon={TrendingUp}
              trend={5}
              color="primary"
            />
          </div>

          {/* Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-orange-700 flex items-center gap-2 text-base">
                  <Bell className="h-5 w-5" />
                  Planos a Vencer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-800">{dashboardMetrics.plansExpiring}</div>
                <p className="text-sm text-orange-600">Próximos 7 dias</p>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-red-700 flex items-center gap-2 text-base">
                  <Users className="h-5 w-5" />
                  Pacientes Inativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-800">{dashboardMetrics.inactivePatients}</div>
                <p className="text-sm text-red-600">Há mais de 30 dias</p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-blue-700 flex items-center gap-2 text-base">
                  <FileText className="h-5 w-5" />
                  Tarefas Pendentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-800">{dashboardMetrics.pendingTasks}</div>
                <p className="text-sm text-blue-600">Planos para revisar</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <QuickActionButton
                  icon={Plus}
                  label="Nova Consulta"
                  onClick={() => window.location.href = `/platform/${clientId}/scheduling`}
                  bgColor="bg-green-500"
                  hoverColor="hover:bg-green-600"
                  textColor="text-white"
                />
                <QuickActionButton
                  icon={MessageSquare}
                  label="Enviar Mensagem"
                  onClick={() => window.location.href = `/platform/${clientId}/chat`}
                  bgColor="bg-blue-500"
                  hoverColor="hover:bg-blue-600"
                  textColor="text-white"
                />
                <QuickActionButton
                  icon={Utensils}
                  label="Criar Plano"
                  onClick={() => window.location.href = `/platform/${clientId}/meal-plans`}
                  bgColor="bg-orange-500"
                  hoverColor="hover:bg-orange-600"
                  textColor="text-white"
                />
                <QuickActionButton
                  icon={DollarSign}
                  label="Registrar Pagamento"
                  onClick={() => window.location.href = `/platform/${clientId}/financial`}
                  bgColor="bg-purple-500"
                  hoverColor="hover:bg-purple-600"
                  textColor="text-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Heart className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-relaxed">{activity.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardTemplate>
  );
}