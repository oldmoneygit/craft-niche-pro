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
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';

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
  const [loading, setLoading] = useState(true);
  
  const [expandedSections, setExpandedSections] = useState({
    reminders: false,
    sentReminders: false,
    confirmations: false,
    today: false,
    upcoming: false
  });

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

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
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
                  <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                    <Send className="w-4 h-4 mr-2" />
                    Pedir Confirmação
                  </Button>
                </div>
              ))}
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
                  <div key={apt.id} className="bg-white rounded-lg p-3 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900">{apt.clients?.name}</span>
                    <span className="text-gray-600">
                      {new Date(apt.datetime).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
              <Button 
                className="w-full bg-orange-600 hover:bg-orange-700"
                onClick={() => navigate(`/platform/${clientConfig?.subdomain}/lembretes`)}
              >
                <Bell className="w-4 h-4 mr-2" />
                Enviar Lembretes
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
