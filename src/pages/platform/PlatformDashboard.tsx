import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useClientConfig } from '@/core/contexts/ClientConfigContext';
import DashboardTemplate from '@/core/layouts/DashboardTemplate';
import { StatCard } from "@/components/ui/stat-card";
import { NutritionCard } from "@/components/ui/nutrition-card";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  Bell,
  Activity,
  Apple
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import AIInsightsPanel from '@/components/platform/AIInsightsPanel';
import { InactiveClientsAlert } from '@/components/platform/InactiveClientsAlert';
import { UnconfirmedAppointmentsAlert } from '@/components/platform/UnconfirmedAppointmentsAlert';

interface DashboardStats {
  totalClients: number;
  appointmentsThisMonth: number;
  completedAppointments: number;
  revenue: number;
  attendanceRate: number;
}

interface UpcomingAppointment {
  name: string;
  time: string;
  type: string;
  status: string;
}

export default function PlatformDashboard() {
  const { clientId } = useParams<{ clientId: string }>();
  const { setClientId, clientConfig, loading: configLoading } = useClientConfig();
  const { tenantId, loading: tenantLoading } = useTenantId();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clientId && clientId.trim()) {
      setClientId(clientId);
    }
  }, [clientId, setClientId]);

  useEffect(() => {
    if (tenantId) fetchDashboardData();
  }, [tenantId]);

  const fetchDashboardData = async () => {
    try {
      // Buscar dados reais do banco
      const { data: clients } = await supabase
        .from('clients')
        .select('id')
        .eq('tenant_id', tenantId);

      const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('tenant_id', tenantId)
        .gte('datetime', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

      const { data: financialData } = await supabase
        .from('appointments')
        .select('value, payment_status')
        .eq('tenant_id', tenantId)
        .not('value', 'is', null);

      const totalReceived = financialData
        ?.filter(a => a.payment_status === 'paid')
        .reduce((sum, a) => sum + (Number(a.value) || 0), 0) || 0;

      const completedCount = appointments?.filter(a => a.status === 'realizado').length || 0;
      const totalCount = appointments?.length || 0;
      const attendanceRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      setStats({
        totalClients: clients?.length || 0,
        appointmentsThisMonth: totalCount,
        completedAppointments: completedCount,
        revenue: totalReceived,
        attendanceRate
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const isLoading = loading || configLoading || tenantLoading;

  if (isLoading) {
    return (
      <DashboardTemplate title="Dashboard">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="skeleton h-32 rounded-xl" />
            ))}
          </div>
        </div>
      </DashboardTemplate>
    );
  }

  if (!clientConfig) {
    return (
      <DashboardTemplate title="Dashboard">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Plataforma não encontrada</h1>
            <p className="text-muted-foreground">A plataforma solicitada não existe ou não está disponível.</p>
          </div>
        </div>
      </DashboardTemplate>
    );
  }

  const upcomingAppointments: UpcomingAppointment[] = [
    { name: "João Silva", time: "14:00", type: "Consulta de retorno", status: "Confirmado" },
    { name: "Maria Santos", time: "15:30", type: "Primeira consulta", status: "Pendente" },
    { name: "Pedro Costa", time: "17:00", type: "Avaliação mensal", status: "Confirmado" }
  ];

  return (
    <DashboardTemplate title="Dashboard">
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-8 border-2 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Bem-vindo de volta! 👋
              </h1>
              <p className="text-lg text-muted-foreground">
                Aqui está o resumo do seu consultório hoje
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Hoje</p>
              <p className="text-2xl font-bold">
                {new Date().toLocaleDateString('pt-BR', { 
                  day: '2-digit', 
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid - CORES CORRETAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total de Clientes"
            value={stats?.totalClients || 0}
            subtitle={`${Math.round((stats?.totalClients || 0) * 0.3)} ativos este mês`}
            icon={Users}
            variant="info"
          />
          <StatCard
            title="Consultas do Mês"
            value={stats?.appointmentsThisMonth || 0}
            subtitle={`${stats?.completedAppointments || 0} realizadas`}
            icon={Calendar}
            variant="success"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Receita do Mês"
            value={`R$ ${(stats?.revenue || 0).toFixed(0)}`}
            subtitle="R$ 150 pendentes"
            icon={DollarSign}
            variant="warning"
          />
          <StatCard
            title="Taxa de Comparecimento"
            value={`${stats?.attendanceRate || 0}%`}
            subtitle="em alta"
            icon={TrendingUp}
            variant="primary"
          />
        </div>

        {/* AI Insights Panel */}
        <AIInsightsPanel />

        {/* Alertas Inteligentes */}
        <div className="space-y-4">
          <UnconfirmedAppointmentsAlert />
          <InactiveClientsAlert />
        </div>

        {/* Cards de Ação */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Lembretes */}
          <NutritionCard
            title="Lembretes Pendentes"
            icon={Bell}
            iconColor="text-amber-600"
            variant="warning"
            action={<Badge variant="secondary" className="bg-amber-100 text-amber-800">3</Badge>}
          >
            <p className="text-sm text-muted-foreground mb-4">
              Você tem 3 lembretes para enviar hoje
            </p>
            <Button variant="outline" size="sm" className="w-full">
              <Clock className="w-4 h-4 mr-2" />
              Ver Lembretes
            </Button>
          </NutritionCard>

          {/* Pacientes Inativos */}
          <NutritionCard
            title="Pacientes Inativos"
            icon={AlertCircle}
            iconColor="text-red-600"
            variant="warning"
            action={<Badge variant="destructive">5</Badge>}
          >
            <p className="text-sm text-muted-foreground mb-4">
              5 pacientes sem consulta há mais de 30 dias
            </p>
            <Button variant="outline" size="sm" className="w-full">
              <Users className="w-4 h-4 mr-2" />
              Ver Lista
            </Button>
          </NutritionCard>

          {/* Planos Ativos */}
          <NutritionCard
            title="Planos Ativos"
            icon={Apple}
            iconColor="text-green-600"
            variant="success"
            action={<Badge className="bg-green-100 text-green-800">8</Badge>}
          >
            <p className="text-sm text-muted-foreground mb-4">
              8 clientes com plano alimentar ativo
            </p>
            <Button variant="outline" size="sm" className="w-full">
              <Activity className="w-4 h-4 mr-2" />
              Gerenciar Planos
            </Button>
          </NutritionCard>
        </div>

        {/* Próximas Consultas */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Próximas Consultas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingAppointments.map((apt, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-bold text-primary">{apt.name.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <div>
                      <p className="font-semibold">{apt.name}</p>
                      <p className="text-sm text-muted-foreground">{apt.time} • {apt.type}</p>
                    </div>
                  </div>
                  <Badge variant={apt.status === "Confirmado" ? "default" : "secondary"}>
                    {apt.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardTemplate>
  );
}
