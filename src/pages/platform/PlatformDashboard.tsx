import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useClientConfig } from '@/core/contexts/ClientConfigContext';
import DashboardTemplate from '@/core/layouts/DashboardTemplate';
import AIInsightsPanel from '@/components/platform/AIInsightsPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
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

interface DashboardStats {
  totalClients: number;
  totalAppointments: number;
  appointmentsThisMonth: number;
  appointmentsToday: number;
}

interface UpcomingAppointment {
  id: string;
  datetime: string;
  type: string;
  status: string;
  clients: {
    name: string;
  } | null;
}

export default function PlatformDashboard() {
  const { clientId } = useParams<{ clientId: string }>();
  const { setClientId, clientConfig, loading: configLoading, error, clearError } = useClientConfig();
  const { tenantId, loading: tenantLoading } = useTenantId();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalAppointments: 0,
    appointmentsThisMonth: 0,
    appointmentsToday: 0
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clientId && clientId.trim()) {
      setClientId(clientId);
    }
  }, [clientId, setClientId]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!tenantId || tenantLoading) return;

      try {
        setLoading(true);

        // 1. Total de clientes
        const { count: clientCount } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenantId);

        // 2. Consultas deste mês
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count: monthAppointments } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
          .gte('datetime', startOfMonth.toISOString());

        // 3. Total de consultas
        const { count: totalAppointments } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenantId);

        // 4. Consultas de hoje
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const { count: todayAppointments } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
          .gte('datetime', startOfDay.toISOString())
          .lte('datetime', endOfDay.toISOString());

        // 5. Próximas consultas de hoje (TODAS as consultas de hoje, não só futuras)
        const { data: todayUpcoming, error: appointmentsError } = await supabase
          .from('appointments')
          .select(`
            id,
            datetime,
            type,
            status,
            clients (
              name
            )
          `)
          .eq('tenant_id', tenantId)
          .gte('datetime', startOfDay.toISOString())
          .lte('datetime', endOfDay.toISOString())
          .order('datetime', { ascending: true })
          .limit(10);

        console.log('Dashboard Debug:', {
          tenantId,
          startOfDay: startOfDay.toISOString(),
          endOfDay: endOfDay.toISOString(),
          todayUpcoming,
          appointmentsError
        });

        setStats({
          totalClients: clientCount || 0,
          totalAppointments: totalAppointments || 0,
          appointmentsThisMonth: monthAppointments || 0,
          appointmentsToday: todayAppointments || 0
        });

        setUpcomingAppointments(todayUpcoming || []);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [tenantId, tenantLoading]);

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

  const isLoading = loading || configLoading || tenantLoading;

  return (
    <DashboardTemplate title="Dashboard">
      {isLoading ? (
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
                  Hoje você tem <span className="font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">{stats.appointmentsToday}</span> consultas agendadas
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
              title="Total de Pacientes"
              value={stats.totalClients}
              icon={Users}
              color="blue"
            />
            <MetricCard
              title="Consultas Este Mês"
              value={stats.appointmentsThisMonth}
              icon={Calendar}
              color="green"
            />
            <MetricCard
              title="Consultas Hoje"
              value={stats.appointmentsToday}
              icon={Activity}
              color="orange"
            />
            <MetricCard
              title="Total de Consultas"
              value={stats.totalAppointments}
              icon={TrendingUp}
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
                {upcomingAppointments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Nenhuma consulta agendada para hoje</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-primary/20 hover:bg-gray-50/50 transition-all duration-200">
                        <div className="text-sm font-bold text-gray-600 w-16 bg-gray-100 rounded-lg py-2 text-center">
                          {new Date(appointment.datetime).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{appointment.clients?.name || 'Sem nome'}</div>
                          <div className="text-sm text-gray-500">{appointment.type}</div>
                        </div>
                        <Badge className={`border-0 rounded-lg px-3 py-1 ${
                          appointment.status === 'confirmado' 
                            ? 'bg-primary/10 text-primary hover:bg-primary/20' 
                            : 'bg-warning/10 text-warning hover:bg-warning/20'
                        }`}>
                          {appointment.status === 'confirmado' ? 'Confirmado' : 'Agendado'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
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