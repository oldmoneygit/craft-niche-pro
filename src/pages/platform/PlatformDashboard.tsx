import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useClientConfig } from '@/core/contexts/ClientConfigContext';
import DashboardTemplate from '@/core/layouts/DashboardTemplate';
import AIInsightsPanel from '@/components/platform/AIInsightsPanel';
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
      blue: "bg-gradient-to-br from-metric-blue to-metric-blue/90",
      green: "bg-gradient-to-br from-metric-green to-metric-green/90", 
      orange: "bg-gradient-to-br from-metric-orange to-metric-orange/90",
      purple: "bg-gradient-to-br from-metric-purple to-metric-purple/90"
    };

    return (
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-2xl">
        <CardContent className="p-0">
          <div className={`${colorClasses[color]} text-white p-6 relative`}>
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-white/20 -translate-y-10 translate-x-10"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-white/10 translate-y-8 -translate-x-8"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <Icon className="h-8 w-8 text-white/90" />
                {trend && (
                  <span className="text-sm bg-white/20 px-3 py-1 rounded-full font-medium backdrop-blur-sm">
                    {trend}
                  </span>
                )}
              </div>
              <div className="text-sm font-medium text-white/90 mb-2">{title}</div>
              <div className="text-3xl font-bold text-white">{value}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

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
        <div className="flex-1 space-y-6 p-6 lg:p-8">
          {/* Welcome Header - Clean and modern */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 lg:p-8 text-white rounded-2xl relative overflow-hidden shadow-lg border border-slate-700/50">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-white/20 -translate-y-10 translate-x-10"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-white/10 translate-y-8 -translate-x-8"></div>
            </div>
            
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold mb-3 text-white">
                  Bem-vindo, {clientConfig?.branding.companyName.split(' ')[0]}! 👋
                </h1>
                <p className="text-gray-300 text-base lg:text-lg leading-relaxed">
                  Hoje você tem <span className="font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">8</span> consultas agendadas e <span className="font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">3</span> novos questionários respondidos
                </p>
              </div>
              <div className="text-left lg:text-right bg-slate-800/50 rounded-2xl p-4 backdrop-blur-sm border border-slate-600/30 w-full lg:w-auto">
                <div className="text-sm text-gray-400 mb-2 font-medium">Hoje</div>
                <div className="text-xl lg:text-2xl font-bold text-white">{new Date().toLocaleDateString('pt-BR')}</div>
              </div>
            </div>
          </div>

          {/* Metrics Grid - Responsive and well-spaced */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
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

          {/* AI Insights Panel */}
          <AIInsightsPanel />

          {/* Main Content Grid - Clean layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Consultas de Hoje - Modern card design */}
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 pb-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-gray-900">Consultas de Hoje</CardTitle>
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/5 rounded-xl">
                    Ver agenda completa
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-primary/20 hover:bg-gray-50/50 transition-all duration-200">
                    <div className="text-sm font-bold text-gray-600 w-16 bg-gray-100 rounded-lg py-2 text-center">09:00</div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Ana Silva</div>
                      <div className="text-sm text-gray-500">Consulta</div>
                    </div>
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0 rounded-lg px-3 py-1">
                      Confirmado
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-primary/20 hover:bg-gray-50/50 transition-all duration-200">
                    <div className="text-sm font-bold text-gray-600 w-16 bg-gray-100 rounded-lg py-2 text-center">10:00</div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">João Santos</div>
                      <div className="text-sm text-gray-500">Retorno</div>
                    </div>
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0 rounded-lg px-3 py-1">
                      Confirmado
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-warning/20 hover:bg-warning/5 transition-all duration-200">
                    <div className="text-sm font-bold text-gray-600 w-16 bg-gray-100 rounded-lg py-2 text-center">11:00</div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Maria Costa</div>
                      <div className="text-sm text-gray-500">Avaliação</div>
                    </div>
                    <Badge className="bg-warning/10 text-warning hover:bg-warning/20 border-0 rounded-lg px-3 py-1">
                      Pendente
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Atividades Recentes - Modern card design */}
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 pb-6">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  Atividades Recentes
                  <TrendingUp className="h-5 w-5 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-5">
                  <div className="flex items-center gap-4 group hover:bg-gray-50/50 p-3 rounded-xl transition-all duration-200">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Utensils className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-1">Ana Silva</div>
                      <div className="text-sm text-gray-600 mb-1">Novo plano alimentar criado</div>
                      <div className="text-xs text-gray-400">5 min atrás</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group hover:bg-gray-50/50 p-3 rounded-xl transition-all duration-200">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-1">João Santos</div>
                      <div className="text-sm text-gray-600 mb-1">Questionário respondido</div>
                      <div className="text-xs text-gray-400">12 min atrás</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group hover:bg-gray-50/50 p-3 rounded-xl transition-all duration-200">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                      <Calendar className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-1">Maria Costa</div>
                      <div className="text-sm text-gray-600 mb-1">Consulta agendada para amanhã</div>
                      <div className="text-xs text-gray-400">25 min atrás</div>
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