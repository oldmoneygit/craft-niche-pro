import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Clock, CheckCircle, Calendar, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { useToast } from '@/hooks/use-toast';
import DashboardTemplate from '@/core/layouts/DashboardTemplate';

export default function PlatformFinancial() {
  const { tenantId } = useTenantId();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    paymentStatus: 'all'
  });

  useEffect(() => {
    if (tenantId) {
      fetchFinancialData();
    }
  }, [tenantId, filters]);

  const fetchFinancialData = async () => {
    setLoading(true);

    // Buscar estatísticas via função
    const { data: statsData } = await supabase.rpc('get_financial_stats', {
      p_tenant_id: tenantId,
      p_start_date: filters.startDate,
      p_end_date: filters.endDate
    });

    if (statsData && statsData.length > 0) {
      setStats(statsData[0]);
    }

    // Buscar consultas com filtros
    let query = supabase
      .from('appointments')
      .select('*, clients(name)')
      .eq('tenant_id', tenantId)
      .gte('datetime', filters.startDate)
      .lte('datetime', filters.endDate)
      .not('value', 'is', null)
      .order('datetime', { ascending: false });

    if (filters.paymentStatus !== 'all') {
      query = query.eq('payment_status', filters.paymentStatus);
    }

    const { data: appointmentsData } = await query;
    setAppointments(appointmentsData || []);

    // Buscar dados mensais dos últimos 6 meses
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: monthlyStats } = await supabase
      .from('financial_summary')
      .select('*')
      .eq('tenant_id', tenantId)
      .gte('month', sixMonthsAgo.toISOString())
      .order('month', { ascending: true });

    setMonthlyData(monthlyStats || []);

    setLoading(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const handleMarkAsPaid = async (appointmentId: string, value: number) => {
    const { error } = await supabase
      .from('appointments')
      .update({
        payment_status: 'paid',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'dinheiro'
      })
      .eq('id', appointmentId);

    if (error) {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    } else {
      toast({ title: "Pagamento registrado", description: formatCurrency(value) });
      fetchFinancialData();
    }
  };

  if (loading) {
    return (
      <DashboardTemplate title="Financeiro">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </DashboardTemplate>
    );
  }

  return (
    <DashboardTemplate title="Financeiro">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="w-7 h-7" />
            Financeiro
          </h2>
          <p className="text-muted-foreground mt-1">
            Controle de pagamentos e receitas
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-card rounded-lg shadow p-4 border">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <span className="font-semibold">Filtros</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Data Início
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={e => setFilters({...filters, startDate: e.target.value})}
                className="w-full border rounded-lg p-2 bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Data Fim
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={e => setFilters({...filters, endDate: e.target.value})}
                className="w-full border rounded-lg p-2 bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Status
              </label>
              <select
                value={filters.paymentStatus}
                onChange={e => setFilters({...filters, paymentStatus: e.target.value})}
                className="w-full border rounded-lg p-2 bg-background"
              >
                <option value="all">Todos</option>
                <option value="paid">Pagos</option>
                <option value="pending">Pendentes</option>
                <option value="cancelled">Cancelados</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-lg shadow p-5">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 opacity-80" />
              <span className="text-sm opacity-90">Recebido</span>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(stats?.total_received || 0)}</p>
            <p className="text-sm opacity-90 mt-1">{stats?.paid_appointments || 0} consultas pagas</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-lg shadow p-5">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 opacity-80" />
              <span className="text-sm opacity-90">A Receber</span>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(stats?.total_pending || 0)}</p>
            <p className="text-sm opacity-90 mt-1">{stats?.pending_appointments || 0} pendentes</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-lg shadow p-5">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 opacity-80" />
              <span className="text-sm opacity-90">Valor Médio</span>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(stats?.average_value || 0)}</p>
            <p className="text-sm opacity-90 mt-1">por consulta</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-lg shadow p-5">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 opacity-80" />
              <span className="text-sm opacity-90">Taxa de Pagamento</span>
            </div>
            <p className="text-3xl font-bold">{Math.round(stats?.payment_rate || 0)}%</p>
            <p className="text-sm opacity-90 mt-1">{stats?.total_appointments || 0} consultas</p>
          </div>
        </div>

        {/* Gráfico Mensal Simples */}
        <div className="bg-card rounded-lg shadow p-6 border">
          <h3 className="font-bold text-lg mb-4">Receita dos Últimos 6 Meses</h3>
          <div className="space-y-3">
            {monthlyData.map(month => {
              const maxValue = Math.max(...monthlyData.map(m => m.total_received || 0));
              const percentage = maxValue > 0 ? ((month.total_received || 0) / maxValue) * 100 : 0;
              
              return (
                <div key={month.month}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">
                      {new Date(month.month).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-sm font-bold text-green-600">
                      {formatCurrency(month.total_received || 0)}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lista de Consultas */}
        <div className="bg-card rounded-lg shadow border">
          <div className="p-4 border-b">
            <h3 className="font-bold text-lg">Consultas no Período</h3>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {appointments.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Nenhuma consulta com valor no período selecionado
              </div>
            ) : (
              appointments.map(apt => (
                <div key={apt.id} className="p-4 hover:bg-muted/50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{apt.clients?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(apt.datetime).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {apt.payment_method && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Pago via {apt.payment_method}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="text-lg font-bold text-foreground">
                          {formatCurrency(apt.value)}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          apt.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                          apt.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          apt.payment_status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {apt.payment_status === 'paid' ? 'Pago' :
                           apt.payment_status === 'pending' ? 'Pendente' :
                           apt.payment_status === 'cancelled' ? 'Cancelado' :
                           'Reembolsado'}
                        </span>
                      </div>
                      {apt.payment_status === 'pending' && (
                        <button
                          onClick={() => handleMarkAsPaid(apt.id, apt.value)}
                          className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition"
                        >
                          Marcar como Pago
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardTemplate>
  );
}