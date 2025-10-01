import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClientConfig } from '@/core/contexts/ClientConfigContext';
import DashboardTemplate from '@/core/layouts/DashboardTemplate';
import { NutritionCard } from "@/components/ui/nutrition-card";
import { 
  Calendar, 
  Clock, 
  AlertCircle,
  Bell,
  Users,
  Phone,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';

export default function PlatformDashboard() {
  const { clientId } = useParams<{ clientId: string }>();
  const { setClientId, clientConfig, loading: configLoading } = useClientConfig();
  const { tenantId, loading: tenantLoading } = useTenantId();
  const navigate = useNavigate();
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [inactiveClients, setInactiveClients] = useState<any[]>([]);
  const [pendingConfirmations, setPendingConfirmations] = useState<any[]>([]);
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
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Consultas de hoje
      const { data: todayData } = await supabase
        .from('appointments')
        .select('*, clients(name, phone)')
        .eq('tenant_id', tenantId)
        .gte('datetime', today.toISOString())
        .lt('datetime', tomorrow.toISOString())
        .order('datetime', { ascending: true });

      setTodayAppointments(todayData || []);

      // Lembretes pendentes (consultas nas próximas 72h)
      const in72h = new Date();
      in72h.setHours(in72h.getHours() + 72);
      
      const { data: remindersData } = await supabase
        .from('appointments')
        .select('*, clients(name, phone)')
        .eq('tenant_id', tenantId)
        .gte('datetime', new Date().toISOString())
        .lte('datetime', in72h.toISOString())
        .order('datetime', { ascending: true })
        .limit(5);

      setReminders(remindersData || []);

      // Clientes inativos (30+ dias sem consulta)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

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
          if (inactiveList.length >= 5) break;
        }
      }
      setInactiveClients(inactiveList);

      // Confirmações pendentes (consultas em 48h que não foram confirmadas)
      const in48h = new Date();
      in48h.setHours(in48h.getHours() + 48);

      const { data: pendingData } = await supabase
        .from('appointments')
        .select('*, clients(name, phone)')
        .eq('tenant_id', tenantId)
        .gte('datetime', new Date().toISOString())
        .lte('datetime', in48h.toISOString())
        .neq('status', 'confirmado')
        .order('datetime', { ascending: true })
        .limit(5);

      setPendingConfirmations(pendingData || []);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'agendado': 'bg-blue-100 text-blue-800',
      'confirmado': 'bg-green-100 text-green-800',
      'realizado': 'bg-emerald-100 text-emerald-800',
      'cancelado': 'bg-red-100 text-red-800',
      'faltou': 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const isLoading = loading || configLoading || tenantLoading;

  if (isLoading) {
    return (
      <DashboardTemplate title="Dashboard">
        <div className="p-6 space-y-6">
          <div className="skeleton h-32 rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="skeleton h-64 rounded-xl" />)}
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

  return (
    <DashboardTemplate title="Dashboard">
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Hero Header com info do dia */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-8 border-2 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Bem-vindo de volta! 👋
              </h1>
              <p className="text-lg text-muted-foreground">
                Hoje você tem <strong className="text-primary">{todayAppointments.length} consultas agendadas</strong>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Hoje</p>
              <p className="text-2xl font-bold">
                {new Date().toLocaleDateString('pt-BR', { 
                  day: '2-digit', 
                  month: 'long'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Consultas de Hoje - DESTAQUE */}
        <Card className="border-2 border-primary/20">
          <CardHeader className="bg-primary/5">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calendar className="w-6 h-6 text-primary" />
              Consultas de Hoje ({todayAppointments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {todayAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">Nenhuma consulta agendada para hoje</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate(`/platform/${clientConfig?.subdomain}/agendamentos`)}
                >
                  Agendar Consulta
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {todayAppointments.map(apt => (
                  <div 
                    key={apt.id} 
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition border-l-4 border-l-primary"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-primary">
                          {apt.clients?.name.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold">{apt.clients?.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(apt.datetime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">{apt.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(apt.status)}>
                        {apt.status}
                      </Badge>
                      <Button variant="ghost" size="sm" asChild>
                        <a 
                          href={`https://wa.me/55${apt.clients?.phone?.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Grid de Ações Pendentes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Lembretes Pendentes */}
          <NutritionCard
            title="Lembretes a Enviar"
            icon={Bell}
            iconColor="text-amber-600"
            variant="warning"
            action={
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                {reminders.length}
              </Badge>
            }
          >
            {reminders.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                ✓ Todos os lembretes foram enviados
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-3">
                  {reminders.length} consultas precisam de lembrete
                </p>
                <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                  {reminders.slice(0, 3).map(r => (
                    <div key={r.id} className="text-sm p-2 bg-muted rounded flex justify-between">
                      <span>{r.clients?.name}</span>
                      <span className="text-muted-foreground">
                        {new Date(r.datetime).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => navigate(`/platform/${clientConfig?.subdomain}/lembretes`)}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Enviar Lembretes
                </Button>
              </>
            )}
          </NutritionCard>

          {/* Confirmações Pendentes */}
          <NutritionCard
            title="Confirmações Pendentes"
            icon={CheckCircle}
            iconColor="text-blue-600"
            variant="info"
            action={
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {pendingConfirmations.length}
              </Badge>
            }
          >
            {pendingConfirmations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                ✓ Todas as consultas confirmadas
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-3">
                  {pendingConfirmations.length} consultas precisam de confirmação
                </p>
                <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                  {pendingConfirmations.slice(0, 3).map(c => (
                    <div key={c.id} className="text-sm p-2 bg-muted rounded flex justify-between">
                      <span>{c.clients?.name}</span>
                      <span className="text-muted-foreground">
                        {new Date(c.datetime).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => navigate(`/platform/${clientConfig?.subdomain}/agendamentos`)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Ver Consultas
                </Button>
              </>
            )}
          </NutritionCard>

          {/* Pacientes Inativos */}
          <NutritionCard
            title="Pacientes Inativos"
            icon={AlertCircle}
            iconColor="text-red-600"
            variant="warning"
            action={
              <Badge variant="destructive">
                {inactiveClients.length}
              </Badge>
            }
          >
            {inactiveClients.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                ✓ Todos os clientes estão ativos
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-3">
                  {inactiveClients.length} clientes sem consulta há 30+ dias
                </p>
                <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                  {inactiveClients.slice(0, 3).map(c => (
                    <div key={c.id} className="text-sm p-2 bg-muted rounded">
                      {c.name}
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => navigate(`/platform/${clientConfig?.subdomain}/clientes`)}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Ver Clientes
                </Button>
              </>
            )}
          </NutritionCard>

          {/* Feedbacks Pendentes */}
          <NutritionCard
            title="Feedbacks Semanais"
            icon={XCircle}
            iconColor="text-purple-600"
            variant="info"
            action={<Badge className="bg-purple-100 text-purple-800">0</Badge>}
          >
            <p className="text-sm text-muted-foreground mb-4">
              Nenhum feedback semanal pendente
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => navigate(`/platform/${clientConfig?.subdomain}/feedbacks-semanais`)}
            >
              Enviar Feedbacks
            </Button>
          </NutritionCard>
        </div>
      </div>
    </DashboardTemplate>
  );
}
