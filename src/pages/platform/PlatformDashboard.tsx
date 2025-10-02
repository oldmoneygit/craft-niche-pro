import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClientConfig } from '@/core/contexts/ClientConfigContext';
import DashboardTemplate from '@/core/layouts/DashboardTemplate';
import { 
  Calendar, 
  Clock, 
  AlertCircle,
  Bell,
  Users,
  Phone,
  CheckCircle,
  ChevronDown,
  Send,
  Activity,
  Loader2,
  DollarSign,
  TrendingUp,
  RefreshCw,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { useWhatsAppMessaging } from '@/hooks/useWhatsAppMessaging';
import { useFinancialMetrics } from '@/hooks/useFinancialMetrics';
import { formatCurrency } from '@/lib/serviceCalculations';
import { ServiceExpirationAlerts } from '@/components/platform/ServiceExpirationAlerts';

export default function PlatformDashboard() {
  const { clientId } = useParams<{ clientId: string }>();
  const { setClientId, clientConfig, loading: configLoading } = useClientConfig();
  const { tenantId, loading: tenantLoading } = useTenantId();
  const navigate = useNavigate();
  
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [confirmations, setConfirmations] = useState<any[]>([]);
  const [sentReminders, setSentReminders] = useState<any[]>([]);
  const [inactiveClients, setInactiveClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [expandedSections, setExpandedSections] = useState({
    reminders: false,
    sentReminders: false,
    confirmations: false,
    inactiveClients: false,
    today: false,
    upcoming: false,
    finance: false,
    expiringServices: true
  });

  const financialMetrics = useFinancialMetrics(tenantId);

  const { 
    sendReminder, 
    sendConfirmationRequest, 
    sendRemindersInBatch, 
    sendConfirmationsInBatch,
    sending 
  } = useWhatsAppMessaging();

  useEffect(() => {
    if (clientId && clientId.trim()) {
      setClientId(clientId);
    }
  }, [clientId, setClientId]);

  useEffect(() => {
    if (tenantId) fetchDashboardData();
  }, [tenantId]);

  // Atualizar seções expandidas baseado em dados
  useEffect(() => {
    setExpandedSections({
      reminders: reminders.length > 0,
      sentReminders: sentReminders.length > 0,
      confirmations: confirmations.length > 0,
      inactiveClients: inactiveClients.length > 0,
      today: todayAppointments.length > 0,
      upcoming: upcomingAppointments.length > 0,
      finance: financialMetrics.upcomingRenewals.count > 0 || financialMetrics.pendingPayments.count > 0,
      expiringServices: true
    });
  }, [reminders, sentReminders, confirmations, inactiveClients, todayAppointments, upcomingAppointments, financialMetrics]);

  const fetchDashboardData = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const next7Days = new Date(today);
      next7Days.setDate(next7Days.getDate() + 7);

      // Consultas de hoje
      const { data: todayData } = await supabase
        .from('appointments')
        .select('*, clients(name, phone)')
        .eq('tenant_id', tenantId)
        .gte('datetime', today.toISOString())
        .lt('datetime', tomorrow.toISOString())
        .order('datetime', { ascending: true });
      setTodayAppointments(todayData || []);

      // Próximas consultas (próximos 7 dias, exceto hoje)
      const { data: upcomingData } = await supabase
        .from('appointments')
        .select('*, clients(name, phone)')
        .eq('tenant_id', tenantId)
        .gte('datetime', tomorrow.toISOString())
        .lte('datetime', next7Days.toISOString())
        .order('datetime', { ascending: true });
      setUpcomingAppointments(upcomingData || []);

      // Lembretes pendentes
      const in72h = new Date();
      in72h.setHours(in72h.getHours() + 72);
      const { data: remindersData } = await supabase
        .from('appointments')
        .select('*, clients(name, phone)')
        .eq('tenant_id', tenantId)
        .gte('datetime', new Date().toISOString())
        .lte('datetime', in72h.toISOString())
        .order('datetime', { ascending: true });
      setReminders(remindersData || []);

      // Confirmações pendentes (48h)
      const in48h = new Date();
      in48h.setHours(in48h.getHours() + 48);
      const { data: confirmData } = await supabase
        .from('appointments')
        .select('*, clients(name, phone)')
        .eq('tenant_id', tenantId)
        .gte('datetime', new Date().toISOString())
        .lte('datetime', in48h.toISOString())
        .neq('status', 'confirmado')
        .order('datetime', { ascending: true });
      setConfirmations(confirmData || []);

      // Lembretes enviados (últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data: sentData } = await supabase
        .from('appointment_reminders')
        .select('*, appointments(*, clients(name, phone))')
        .eq('tenant_id', tenantId)
        .gte('sent_at', thirtyDaysAgo.toISOString())
        .order('sent_at', { ascending: false })
        .limit(10);
      setSentReminders(sentData || []);

      // Clientes inativos (30+ dias sem consulta)
      const { data: allClients } = await supabase
        .from('clients')
        .select('id, name, phone')
        .eq('tenant_id', tenantId);

      const inactiveList = [];
      for (const client of allClients || []) {
        const { data: lastAppointment } = await supabase
          .from('appointments')
          .select('datetime')
          .eq('client_id', client.id)
          .order('datetime', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!lastAppointment || new Date(lastAppointment.datetime) < thirtyDaysAgo) {
          inactiveList.push(client);
          if (inactiveList.length >= 10) break;
        }
      }
      setInactiveClients(inactiveList);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSendReminder = async (appointment: any) => {
    const success = await sendReminder(appointment);
    if (success) {
      fetchDashboardData();
    }
  };

  const handleSendConfirmation = async (appointment: any) => {
    const success = await sendConfirmationRequest(appointment);
    if (success) {
      fetchDashboardData();
    }
  };

  const handleSendAllReminders = async () => {
    if (reminders.length === 0) return;
    
    if (confirm(`Deseja enviar ${reminders.length} lembretes em massa?`)) {
      await sendRemindersInBatch(reminders);
      fetchDashboardData();
    }
  };

  const handleSendAllConfirmations = async () => {
    if (confirmations.length === 0) return;
    
    if (confirm(`Deseja solicitar confirmação para ${confirmations.length} consultas?`)) {
      await sendConfirmationsInBatch(confirmations);
      fetchDashboardData();
    }
  };

  const isLoading = loading || configLoading || tenantLoading;

  if (isLoading) {
    return (
      <DashboardTemplate title="Dashboard">
        <div className="p-6 space-y-4">
          <div className="skeleton h-32 rounded-xl" />
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}
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

  return (
    <DashboardTemplate title="Dashboard">
      <div className="p-6 space-y-4 max-w-7xl mx-auto">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Bem-vindo de volta! 👋
              </h1>
              <p className="text-lg text-slate-300">
                Hoje você tem <span className="font-bold text-white">{todayAppointments.length}</span> consultas agendadas
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">Hoje</p>
              <p className="text-2xl font-bold">
                {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
              </p>
            </div>
          </div>
        </div>

        {/* SEÇÃO FINANCEIRA */}
        <div className="bg-gradient-to-br from-emerald-600 to-green-700 rounded-xl border-2 border-emerald-500 overflow-hidden shadow-lg">
          <button
            onClick={() => toggleSection('finance')}
            className="w-full px-6 py-4 flex items-center justify-between text-white hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <DollarSign className="w-6 h-6" />
              <div className="text-left">
                <h3 className="font-bold text-lg">Visão Financeira</h3>
                <p className="text-sm text-emerald-100">
                  Receita, previsões e indicadores financeiros
                </p>
              </div>
            </div>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${
                expandedSections.finance ? 'rotate-180' : ''
              }`}
            />
          </button>

          {expandedSections.finance && (
            <div className="p-6 bg-white space-y-6">
              
              {/* KPIs Principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* MRR */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-green-700">MRR</p>
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-3xl font-bold text-green-900">
                    {financialMetrics.loading ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      formatCurrency(financialMetrics.mrr)
                    )}
                  </p>
                  <p className="text-xs text-green-600 mt-1">Receita Recorrente Mensal</p>
                </div>

                {/* Próximo Mês */}
                <div className="bg-gradient-to-br from-blue-50 to-sky-50 border-2 border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-blue-700">Próximo Mês</p>
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold text-blue-900">
                    {financialMetrics.loading ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      formatCurrency(financialMetrics.nextMonthRevenue)
                    )}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">Previsão de Receita</p>
                </div>

                {/* Pagamentos Pendentes */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-orange-700">Pendentes</p>
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                  </div>
                  <p className="text-3xl font-bold text-orange-900">
                    {financialMetrics.loading ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      formatCurrency(financialMetrics.pendingPayments.total)
                    )}
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    {financialMetrics.pendingPayments.count} pagamento(s)
                  </p>
                </div>

                {/* Renovações Próximas */}
                <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 border-2 border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-purple-700">Renovações</p>
                    <RefreshCw className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-3xl font-bold text-purple-900">
                    {financialMetrics.loading ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      formatCurrency(financialMetrics.upcomingRenewals.total)
                    )}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    {financialMetrics.upcomingRenewals.count} próximos 30 dias
                  </p>
                </div>
              </div>

              {/* Alertas Financeiros */}
              <div className="space-y-3">
                <h4 className="font-bold text-gray-900">Alertas e Ações</h4>
                
                {financialMetrics.upcomingRenewals.count > 0 && (
                  <div className="flex items-center justify-between p-4 rounded-lg border-2 bg-purple-50 border-purple-200">
                    <div className="flex items-center gap-3">
                      <RefreshCw className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-900">{financialMetrics.upcomingRenewals.count} renovações pendentes</p>
                        <p className="text-sm text-gray-600">{formatCurrency(financialMetrics.upcomingRenewals.total)} em renovações nos próximos 30 dias</p>
                      </div>
                    </div>
                  </div>
                )}

                {financialMetrics.pendingPayments.count > 0 && (
                  <div className="flex items-center justify-between p-4 rounded-lg border-2 bg-orange-50 border-orange-200">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="font-medium text-gray-900">{financialMetrics.pendingPayments.count} pagamentos pendentes</p>
                        <p className="text-sm text-gray-600">{formatCurrency(financialMetrics.pendingPayments.total)} aguardando confirmação</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 rounded-lg border-2 bg-green-50 border-green-200">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Receita projetada</p>
                      <p className="text-sm text-gray-600">{formatCurrency(financialMetrics.nextMonthRevenue)} esperado para próximo mês</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botão para Página Completa */}
              <div className="text-center pt-4 border-t border-gray-200">
                <button
                  onClick={() => navigate(`/platform/${clientId}/finances`)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                >
                  <BarChart3 className="w-5 h-5" />
                  Ver Relatório Financeiro Completo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ALERTAS DE VENCIMENTO DE SERVIÇOS */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-lg overflow-hidden">
          <div 
            className="p-6 cursor-pointer flex items-center justify-between text-white"
            onClick={() => toggleSection('expiringServices')}
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6" />
              <div>
                <h3 className="text-xl font-bold">Alertas de Vencimento de Serviços</h3>
                <p className="text-sm text-orange-100">Serviços contratados próximos do vencimento (7 dias)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.expiringServices ? 'rotate-180' : ''}`} />
            </div>
          </div>
          {expandedSections.expiringServices && tenantId && (
            <div className="bg-orange-50 p-4">
              <ServiceExpirationAlerts 
                tenantId={tenantId} 
                daysThreshold={7} 
              />
            </div>
          )}
        </div>

        {/* Confirmações Pendentes */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg overflow-hidden">
          <div 
            className="p-6 cursor-pointer flex items-center justify-between text-white"
            onClick={() => toggleSection('confirmations')}
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6" />
              <div>
                <h3 className="text-xl font-bold">Confirmações Pendentes ({confirmations.length})</h3>
                <p className="text-sm text-blue-100">Consultas nas próximas 48h que ainda não foram confirmadas</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 text-white border-0">
                {confirmations.length}
              </Badge>
              <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.confirmations ? 'rotate-180' : ''}`} />
            </div>
          </div>
          {expandedSections.confirmations && confirmations.length > 0 && (
            <div className="bg-blue-50 p-4 space-y-2">
              {confirmations.map(apt => (
                <div key={apt.id} className="bg-white rounded-lg p-4 flex items-center justify-between shadow-sm">
                  <div>
                    <p className="font-semibold text-gray-900">{apt.clients?.name}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(apt.datetime).toLocaleDateString('pt-BR')} às {' '}
                      {new Date(apt.datetime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-blue-500 hover:bg-blue-600"
                    onClick={() => handleSendConfirmation(apt)}
                    disabled={sending}
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Pedir Confirmação
                  </Button>
                </div>
              ))}
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 mt-4"
                onClick={handleSendAllConfirmations}
                disabled={sending}
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Todas Confirmações
                  </>
                )}
              </Button>
            </div>
          )}
          {expandedSections.confirmations && confirmations.length === 0 && (
            <div className="bg-blue-50 p-4 text-center text-gray-600">
              ✓ Todas as consultas estão confirmadas
            </div>
          )}
        </div>

        {/* Lembretes Pendentes */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg overflow-hidden">
          <div 
            className="p-6 cursor-pointer flex items-center justify-between text-white"
            onClick={() => toggleSection('reminders')}
          >
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6" />
              <div>
                <h3 className="text-xl font-bold">Lembretes Pendentes ({reminders.length})</h3>
                <p className="text-sm text-orange-100">Consultas nas próximas 72h precisam de lembrete</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 text-white border-0">
                {reminders.length}
              </Badge>
              <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.reminders ? 'rotate-180' : ''}`} />
            </div>
          </div>
          {expandedSections.reminders && reminders.length > 0 && (
            <div className="bg-orange-50 p-4">
              <div className="space-y-2 mb-4">
                {reminders.map(apt => (
                  <div key={apt.id} className="bg-white rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-900">{apt.clients?.name}</span>
                      <p className="text-xs text-gray-500">
                        {new Date(apt.datetime).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} às{' '}
                        {new Date(apt.datetime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleSendReminder(apt)}
                      disabled={sending}
                    >
                      {sending ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Send className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
              <Button 
                className="w-full bg-orange-600 hover:bg-orange-700"
                onClick={handleSendAllReminders}
                disabled={sending}
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4 mr-2" />
                    Enviar Todos os Lembretes
                  </>
                )}
              </Button>
            </div>
          )}
          {expandedSections.reminders && reminders.length === 0 && (
            <div className="bg-orange-50 p-4 text-center text-gray-600">
              ✓ Todos os lembretes foram enviados
            </div>
          )}
        </div>

        {/* Lembretes Enviados */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg overflow-hidden">
          <div 
            className="p-6 cursor-pointer flex items-center justify-between text-white"
            onClick={() => toggleSection('sentReminders')}
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6" />
              <div>
                <h3 className="text-xl font-bold">Lembretes Enviados (últimos 30 dias)</h3>
                <p className="text-sm text-green-100">Histórico de lembretes já enviados</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 text-white border-0">
                {sentReminders.length}
              </Badge>
              <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.sentReminders ? 'rotate-180' : ''}`} />
            </div>
          </div>
          {expandedSections.sentReminders && sentReminders.length > 0 && (
            <div className="bg-green-50 p-4 space-y-2">
              {sentReminders.map(reminder => (
                <div key={reminder.id} className="bg-white rounded-lg p-3 flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900">{reminder.appointments?.clients?.name}</span>
                  <span className="text-gray-600">
                    Enviado em {new Date(reminder.sent_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          )}
          {expandedSections.sentReminders && sentReminders.length === 0 && (
            <div className="bg-green-50 p-4 text-center text-gray-600">
              Nenhum lembrete enviado nos últimos 30 dias
            </div>
          )}
        </div>

        {/* Clientes Inativos */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg overflow-hidden">
          <div 
            className="p-6 cursor-pointer flex items-center justify-between text-white"
            onClick={() => toggleSection('inactiveClients')}
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6" />
              <div>
                <h3 className="text-xl font-bold">Pacientes Inativos ({inactiveClients.length})</h3>
                <p className="text-sm text-red-100">Clientes sem consulta há mais de 30 dias</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 text-white border-0">
                {inactiveClients.length}
              </Badge>
              <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.inactiveClients ? 'rotate-180' : ''}`} />
            </div>
          </div>
          {expandedSections.inactiveClients && inactiveClients.length > 0 && (
            <div className="bg-red-50 p-4">
              <div className="space-y-2 mb-4">
                {inactiveClients.map(client => (
                  <div key={client.id} className="bg-white rounded-lg p-4 flex items-center justify-between shadow-sm">
                    <div>
                      <p className="font-semibold text-gray-900">{client.name}</p>
                      <p className="text-sm text-gray-600">{client.phone}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-50"
                      asChild
                    >
                      <a 
                        href={`https://wa.me/55${client.phone?.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Entrar em Contato
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
              <Button 
                variant="outline"
                className="w-full border-red-600 text-red-700 hover:bg-red-50"
                onClick={() => navigate(`/platform/${clientConfig?.subdomain}/clientes`)}
              >
                <Users className="w-4 h-4 mr-2" />
                Ver Todos os Clientes
              </Button>
            </div>
          )}
          {expandedSections.inactiveClients && inactiveClients.length === 0 && (
            <div className="bg-red-50 p-4 text-center text-gray-600">
              ✓ Todos os clientes estão ativos
            </div>
          )}
        </div>

        {/* Grid: Consultas de Hoje + Próximas Consultas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Consultas de Hoje */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg overflow-hidden">
            <div 
              className="p-6 cursor-pointer flex items-center justify-between text-white"
              onClick={() => toggleSection('today')}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6" />
                <h3 className="text-xl font-bold">Consultas de Hoje</h3>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-white/20 text-white border-0">
                  {todayAppointments.length}
                </Badge>
                <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.today ? 'rotate-180' : ''}`} />
              </div>
            </div>
            {expandedSections.today && (
              <div className="bg-blue-50 p-4 space-y-2">
                {todayAppointments.length === 0 ? (
                  <p className="text-center text-gray-600 py-4">Nenhuma consulta hoje</p>
                ) : (
                  todayAppointments.map(apt => (
                    <div key={apt.id} className="bg-white rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{apt.clients?.name}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(apt.datetime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • {apt.type}
                          </p>
                        </div>
                        <Badge className={
                          apt.status === 'realizado' ? 'bg-green-100 text-green-800' :
                          apt.status === 'confirmado' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {apt.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Próximas Consultas */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg overflow-hidden">
            <div 
              className="p-6 cursor-pointer flex items-center justify-between text-white"
              onClick={() => toggleSection('upcoming')}
            >
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6" />
                <h3 className="text-xl font-bold">Próximas Consultas</h3>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-white/20 text-white border-0">
                  {upcomingAppointments.length}
                </Badge>
                <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.upcoming ? 'rotate-180' : ''}`} />
              </div>
            </div>
            {expandedSections.upcoming && (
              <div className="bg-purple-50 p-4 space-y-2">
                {upcomingAppointments.length === 0 ? (
                  <p className="text-center text-gray-600 py-4">Nenhuma consulta agendada</p>
                ) : (
                  upcomingAppointments.slice(0, 5).map(apt => (
                    <div key={apt.id} className="bg-white rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{apt.clients?.name}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(apt.datetime).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} às {' '}
                            {new Date(apt.datetime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <Badge className="bg-purple-100 text-purple-800">
                          {apt.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardTemplate>
  );
}
