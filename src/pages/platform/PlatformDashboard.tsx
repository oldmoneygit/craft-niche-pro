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
import { useReminders } from '@/hooks/useReminders';
import { toast } from '@/hooks/use-toast';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
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
  Utensils,
  Clock,
  Send,
  ChevronDown,
  ChevronUp
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

interface NextAppointment {
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
  const { pendingReminders, sendReminder } = useReminders();
  const [remindersExpanded, setRemindersExpanded] = useState(false);
  
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalAppointments: 0,
    appointmentsThisMonth: 0,
    appointmentsToday: 0
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointment[]>([]);
  const [nextAppointments, setNextAppointments] = useState<NextAppointment[]>([]);
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

        // 4. Consultas de hoje (timezone de São Paulo)
        const timeZone = 'America/Sao_Paulo';
        const now = toZonedTime(new Date(), timeZone);
        const startOfDay = fromZonedTime(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0), timeZone);
        const endOfDay = fromZonedTime(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999), timeZone);

        const { count: todayCount } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
          .gte('datetime', startOfDay.toISOString())
          .lte('datetime', endOfDay.toISOString());

        // 5. Consultas de hoje (do início ao fim do dia)
        const { data: todayAppointments, error: appointmentsError } = await supabase
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
          .order('datetime', { ascending: true });

        console.log('Dashboard Debug:', {
          tenantId,
          now: now.toISOString(),
          startOfDay: startOfDay.toISOString(),
          endOfDay: endOfDay.toISOString(),
          todayCount: todayCount || 0,
          appointmentsToday: todayAppointments?.length || 0,
          appointmentsError,
          appointments: todayAppointments
        });

        // 6. Próximas consultas (após hoje, próximos 7 dias)
        const { data: nextAppointmentsData, error: nextAppointmentsError } = await supabase
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
          .gt('datetime', endOfDay.toISOString())
          .order('datetime', { ascending: true })
          .limit(5);

        console.log('Next Appointments Debug:', {
          nextAppointmentsData,
          nextAppointmentsError
        });

        setStats({
          totalClients: clientCount || 0,
          totalAppointments: totalAppointments || 0,
          appointmentsThisMonth: monthAppointments || 0,
          appointmentsToday: todayCount || 0
        });

        setUpcomingAppointments(todayAppointments || []);
        setNextAppointments(nextAppointmentsData || []);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [tenantId, tenantLoading]);

  const getStatusBadgeConfig = (status: string) => {
    switch (status) {
      case 'agendado':
        return {
          label: 'Agendado',
          className: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
        };
      case 'confirmado':
        return {
          label: 'Confirmado',
          className: 'bg-green-100 text-green-800 hover:bg-green-200'
        };
      case 'realizado':
        return {
          label: 'Realizado',
          className: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        };
      case 'cancelado':
        return {
          label: 'Cancelado',
          className: 'bg-red-100 text-red-800 hover:bg-red-200'
        };
      default:
        return {
          label: 'Agendado',
          className: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        };
    }
  };

  const handleSendReminder = async (appointmentId: string, type: string, clientName: string, phone: string) => {
    const messages = {
      '72h': `Olá! Sua consulta com ${clientConfig?.branding.companyName} está agendada para daqui 3 dias. Confirme sua presença respondendo SIM.`,
      '24h': `Lembrete: Sua consulta é amanhã! Nos vemos em breve.`,
      '2h': `Sua consulta é hoje daqui 2 horas. Estamos te esperando!`
    };

    // Criar link temporário para evitar bloqueios
    const phoneNumber = phone.replace(/\D/g, '');
    const message = messages[type as keyof typeof messages];
    const whatsappLink = `https://api.whatsapp.com/send?phone=55${phoneNumber}&text=${encodeURIComponent(message)}`;
    
    // Usar elemento <a> para evitar bloqueio de popup
    const link = document.createElement('a');
    link.href = whatsappLink;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Marcar como enviado
    await sendReminder(appointmentId, type);
    
    toast({
      title: "Lembrete enviado",
      description: `Lembrete enviado para ${clientName}`
    });
  };

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

          {/* Lembretes Pendentes - Sempre visível */}
          <Card className="shadow-lg border-orange-200 bg-orange-50 rounded-2xl overflow-hidden">
            <CardHeader 
              className="bg-gradient-to-br from-orange-500 to-orange-600 text-white pb-6 cursor-pointer hover:from-orange-600 hover:to-orange-700 transition-all"
              onClick={() => setRemindersExpanded(!remindersExpanded)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Bell className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl font-bold">
                    Lembretes Pendentes {pendingReminders.length > 0 && `(${pendingReminders.length})`}
                  </CardTitle>
                </div>
                {remindersExpanded ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </CardHeader>
            {remindersExpanded && (
              <CardContent className="p-6">
                {/* Aviso sobre problema do WhatsApp */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 flex items-start gap-3">
                  <Bell className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900 mb-1">
                      ⚠️ Problema conhecido com envio via WhatsApp
                    </p>
                    <p className="text-xs text-yellow-700">
                      Estamos trabalhando para resolver o erro de bloqueio ao enviar mensagens. 
                      Por enquanto, copie manualmente a mensagem e envie pelo WhatsApp Web.
                    </p>
                  </div>
                </div>

                {pendingReminders.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600">Nenhum lembrete pendente no momento</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingReminders.map(({ appointment, needsReminders }) => (
                      <div key={appointment.id} className="bg-white p-4 rounded-xl border border-orange-200 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{appointment.clients.name}</h4>
                            <p className="text-sm text-gray-600">
                              {toZonedTime(new Date(appointment.datetime), 'America/Sao_Paulo').toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric'
                              })} às {toZonedTime(new Date(appointment.datetime), 'America/Sao_Paulo').toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <Badge className={getStatusBadgeConfig(appointment.status).className}>
                            {getStatusBadgeConfig(appointment.status).label}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {needsReminders.map(type => (
                            <Button
                              key={type}
                              onClick={() => handleSendReminder(
                                appointment.id,
                                type,
                                appointment.clients.name,
                                appointment.clients.phone
                              )}
                              size="sm"
                              className="bg-orange-500 hover:bg-orange-600 text-white"
                            >
                              <Send className="w-3 h-3 mr-1" />
                              Enviar {type === '72h' ? '3 dias' : type === '24h' ? '1 dia' : '2h'} antes
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          {/* Main Content Grid - Clean layout */}
          <div className="grid grid-cols-1 gap-6 lg:gap-8">
            {/* Consultas - Modern card design */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Consultas de Hoje */}
              <Card className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-blue-500 to-blue-600 text-white pb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-xl font-bold">Consultas de Hoje</CardTitle>
                    </div>
                    <Badge variant="secondary" className="bg-white/20 text-white border-0 hover:bg-white/30">
                      {upcomingAppointments.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {upcomingAppointments.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <Calendar className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium mb-1">Nenhuma consulta hoje</p>
                      <p className="text-sm text-gray-400">Aproveite para se organizar!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upcomingAppointments.map((appointment) => (
                        <div key={appointment.id} className="group relative p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center border border-blue-200">
                                <span className="text-xs font-medium text-blue-600">
                                  {toZonedTime(new Date(appointment.datetime), 'America/Sao_Paulo').toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}
                                </span>
                                <span className="text-xl font-bold text-blue-700">
                                  {toZonedTime(new Date(appointment.datetime), 'America/Sao_Paulo').toLocaleDateString('pt-BR', { day: '2-digit' })}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h4 className="font-semibold text-gray-900 truncate">{appointment.clients?.name || 'Sem nome'}</h4>
                                <Badge className={`flex-shrink-0 ${getStatusBadgeConfig(appointment.status).className}`}>
                                  {getStatusBadgeConfig(appointment.status).label}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span className="font-medium">
                                    {toZonedTime(new Date(appointment.datetime), 'America/Sao_Paulo').toLocaleTimeString('pt-BR', { 
                                      hour: '2-digit', 
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                <span className="text-gray-400">•</span>
                                <span className="capitalize">{appointment.type.replace('_', ' ')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Próximas Consultas */}
              <Card className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-purple-500 to-purple-600 text-white pb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-xl font-bold">Próximas Consultas</CardTitle>
                    </div>
                    <Badge variant="secondary" className="bg-white/20 text-white border-0 hover:bg-white/30">
                      {nextAppointments.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {nextAppointments.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <Calendar className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium mb-1">Nenhuma consulta agendada</p>
                      <p className="text-sm text-gray-400">Comece a agendar consultas!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {nextAppointments.map((appointment) => (
                        <div key={appointment.id} className="group relative p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 bg-white">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 flex flex-col items-center justify-center border border-purple-200">
                                <span className="text-xs font-medium text-purple-600">
                                  {toZonedTime(new Date(appointment.datetime), 'America/Sao_Paulo').toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}
                                </span>
                                <span className="text-xl font-bold text-purple-700">
                                  {toZonedTime(new Date(appointment.datetime), 'America/Sao_Paulo').toLocaleDateString('pt-BR', { day: '2-digit' })}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h4 className="font-semibold text-gray-900 truncate">{appointment.clients?.name || 'Sem nome'}</h4>
                                <Badge className={`flex-shrink-0 ${getStatusBadgeConfig(appointment.status).className}`}>
                                  {getStatusBadgeConfig(appointment.status).label}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span className="font-medium">
                                    {toZonedTime(new Date(appointment.datetime), 'America/Sao_Paulo').toLocaleTimeString('pt-BR', { 
                                      hour: '2-digit', 
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                <span className="text-gray-400">•</span>
                                <span className="capitalize">{appointment.type.replace('_', ' ')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Atividades Recentes - Modern card design */}
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-green-500 to-green-600 text-white pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Activity className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl font-bold">Atividades Recentes</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="group p-4 rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200 bg-white">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center border border-green-200">
                        <Utensils className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 mb-1">Ana Silva</div>
                        <div className="text-sm text-gray-600 mb-1">Novo plano alimentar criado</div>
                        <div className="text-xs text-gray-400">5 min atrás</div>
                      </div>
                    </div>
                  </div>
                  <div className="group p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center border border-blue-200">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 mb-1">João Santos</div>
                        <div className="text-sm text-gray-600 mb-1">Questionário respondido</div>
                        <div className="text-xs text-gray-400">12 min atrás</div>
                      </div>
                    </div>
                  </div>
                  <div className="group p-4 rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all duration-200 bg-white">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center border border-orange-200">
                        <Calendar className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 mb-1">Maria Costa</div>
                        <div className="text-sm text-gray-600 mb-1">Consulta agendada para amanhã</div>
                        <div className="text-xs text-gray-400">25 min atrás</div>
                      </div>
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