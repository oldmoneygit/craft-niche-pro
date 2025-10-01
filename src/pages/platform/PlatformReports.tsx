import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Calendar, DollarSign, Activity, Target, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import PlatformPageWrapper from '@/core/layouts/PlatformPageWrapper';

export default function PlatformReports() {
  const { tenantId } = useTenantId();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [generalMetrics, setGeneralMetrics] = useState<any>(null);
  const [monthsToShow, setMonthsToShow] = useState(6);

  useEffect(() => {
    if (tenantId) {
      fetchAnalytics();
    }
  }, [tenantId, monthsToShow]);

  const fetchAnalytics = async () => {
    setLoading(true);

    // Buscar dados de analytics
    const { data: analyticsResult } = await supabase.rpc('get_analytics_data', {
      p_tenant_id: tenantId,
      p_months: monthsToShow
    });

    setAnalyticsData(analyticsResult || []);

    // Buscar métricas gerais
    const { data: metricsResult } = await supabase.rpc('get_general_metrics', {
      p_tenant_id: tenantId
    });

    if (metricsResult && metricsResult.length > 0) {
      setGeneralMetrics(metricsResult[0]);
    }

    setLoading(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatMonth = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      month: 'short',
      year: '2-digit'
    }).replace('.', '');
  };

  if (loading) {
    return (
      <PlatformPageWrapper title="Relatórios">
        <div className="p-6">Carregando relatórios...</div>
      </PlatformPageWrapper>
    );
  }

  // Calcular máximos para escalas dos gráficos
  const maxAppointments = Math.max(...analyticsData.map(d => d.total_appointments));
  const maxRevenue = Math.max(...analyticsData.map(d => d.total_revenue));
  const maxClients = Math.max(...analyticsData.map(d => d.new_clients));

  return (
    <PlatformPageWrapper title="Relatórios">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="w-7 h-7" />
              Relatórios e Analytics
            </h2>
            <p className="text-muted-foreground mt-1">
              Acompanhe a evolução do seu consultório
            </p>
          </div>
          <select
            value={monthsToShow}
            onChange={e => setMonthsToShow(parseInt(e.target.value))}
            className="border-2 border-input rounded-lg px-4 py-2 bg-background"
          >
            <option value={3}>Últimos 3 meses</option>
            <option value={6}>Últimos 6 meses</option>
            <option value={12}>Último ano</option>
          </select>
        </div>

        {/* Cards de Métricas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-lg shadow-lg p-5">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 opacity-80" />
              <span className="text-sm opacity-90">Total de Clientes</span>
            </div>
            <p className="text-4xl font-bold">{generalMetrics?.total_clients || 0}</p>
            <p className="text-sm opacity-90 mt-1">
              {generalMetrics?.active_clients || 0} ativos (60 dias)
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-lg shadow-lg p-5">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 opacity-80" />
              <span className="text-sm opacity-90">Consultas Realizadas</span>
            </div>
            <p className="text-4xl font-bold">{generalMetrics?.completed_appointments_all_time || 0}</p>
            <p className="text-sm opacity-90 mt-1">
              de {generalMetrics?.total_appointments_all_time || 0} agendadas
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-lg shadow-lg p-5">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 opacity-80" />
              <span className="text-sm opacity-90">Taxa de Comparecimento</span>
            </div>
            <p className="text-4xl font-bold">
              {Math.round(generalMetrics?.overall_attendance_rate || 0)}%
            </p>
            <p className="text-sm opacity-90 mt-1">
              histórico geral
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-lg shadow-lg p-5">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 opacity-80" />
              <span className="text-sm opacity-90">Receita Total</span>
            </div>
            <p className="text-4xl font-bold">
              {formatCurrency(generalMetrics?.total_revenue_all_time || 0).replace('R$', '')}
            </p>
            <p className="text-sm opacity-90 mt-1">
              todo o período
            </p>
          </div>
        </div>

        {/* Cards de Engajamento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card rounded-lg shadow p-5 border-l-4 border-green-500">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-6 h-6 text-green-600" />
              <h3 className="font-bold text-lg">Planos Alimentares Ativos</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">
              {generalMetrics?.active_meal_plans || 0}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              clientes com plano ativo
            </p>
          </div>

          <div className="bg-card rounded-lg shadow p-5 border-l-4 border-blue-500">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-6 h-6 text-blue-600" />
              <h3 className="font-bold text-lg">Questionários Respondidos</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">
              {generalMetrics?.completed_questionnaires || 0}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              respostas completas
            </p>
          </div>
        </div>

        {/* Gráfico de Consultas por Mês */}
        <div className="bg-card rounded-lg shadow p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Consultas por Mês
          </h3>
          <div className="space-y-4">
            {analyticsData.map(month => {
              const totalPercentage = maxAppointments > 0 ? (month.total_appointments / maxAppointments) * 100 : 0;
              const completedPercentage = month.total_appointments > 0 ? (month.completed_appointments / month.total_appointments) * 100 : 0;
              
              return (
                <div key={month.month}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground min-w-[80px]">
                      {formatMonth(month.month)}
                    </span>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-muted rounded-full h-8 relative">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-8 rounded-full flex items-center justify-end pr-3 transition-all"
                          style={{ width: `${totalPercentage}%` }}
                        >
                          <span className="text-xs font-bold text-white">
                            {month.total_appointments}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right min-w-[120px]">
                      <span className="text-sm font-bold text-green-600">
                        {month.completed_appointments} realizadas
                      </span>
                      <span className="text-xs text-muted-foreground block">
                        ({Math.round(completedPercentage)}% comparecimento)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gráfico de Receita por Mês */}
        <div className="bg-card rounded-lg shadow p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Receita por Mês
          </h3>
          <div className="space-y-4">
            {analyticsData.map(month => {
              const percentage = maxRevenue > 0 ? (month.total_revenue / maxRevenue) * 100 : 0;
              
              return (
                <div key={month.month}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground min-w-[80px]">
                      {formatMonth(month.month)}
                    </span>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-muted rounded-full h-8 relative">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-8 rounded-full flex items-center justify-end pr-3 transition-all"
                          style={{ width: `${percentage}%` }}
                        >
                          <span className="text-xs font-bold text-white">
                            {formatCurrency(month.total_revenue).replace('R$', '')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right min-w-[120px]">
                      <span className="text-xs text-muted-foreground">
                        Média: {formatCurrency(month.avg_revenue_per_appointment)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gráfico de Novos Clientes por Mês */}
        <div className="bg-card rounded-lg shadow p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Novos Clientes por Mês
          </h3>
          <div className="space-y-4">
            {analyticsData.map(month => {
              const percentage = maxClients > 0 ? (month.new_clients / maxClients) * 100 : 0;
              
              return (
                <div key={month.month}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground min-w-[80px]">
                      {formatMonth(month.month)}
                    </span>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-muted rounded-full h-8 relative">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-8 rounded-full flex items-center justify-end pr-3 transition-all"
                          style={{ width: `${percentage}%` }}
                        >
                          <span className="text-xs font-bold text-white">
                            {month.new_clients}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right min-w-[120px]">
                      <span className="text-xs text-muted-foreground">
                        novos clientes
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Taxa de Comparecimento Mensal */}
        <div className="bg-card rounded-lg shadow p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Taxa de Comparecimento Mensal
          </h3>
          <div className="space-y-4">
            {analyticsData.map(month => {
              const rate = month.attendance_rate || 0;
              const color = rate >= 80 ? 'from-green-500 to-emerald-500' :
                           rate >= 60 ? 'from-blue-500 to-indigo-500' :
                           rate >= 40 ? 'from-yellow-500 to-orange-500' :
                           'from-red-500 to-pink-500';
              
              return (
                <div key={month.month}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground min-w-[80px]">
                      {formatMonth(month.month)}
                    </span>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-muted rounded-full h-8 relative">
                        <div
                          className={`bg-gradient-to-r ${color} h-8 rounded-full flex items-center justify-end pr-3 transition-all`}
                          style={{ width: `${rate}%` }}
                        >
                          <span className="text-xs font-bold text-white">
                            {Math.round(rate)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right min-w-[150px] text-xs text-muted-foreground">
                      {month.completed_appointments} de {month.total_appointments} consultas
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detalhamento do Último Mês */}
        {analyticsData.length > 0 && (
          <div className="bg-gradient-to-br from-muted/50 to-muted rounded-lg border-2 border-border p-6">
            <h3 className="font-bold text-lg mb-4">Detalhamento do Último Mês</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card rounded-lg p-4 shadow">
                <p className="text-sm text-muted-foreground mb-1">Total de Consultas</p>
                <p className="text-2xl font-bold text-foreground">
                  {analyticsData[0].total_appointments}
                </p>
              </div>
              <div className="bg-card rounded-lg p-4 shadow">
                <p className="text-sm text-muted-foreground mb-1">Realizadas</p>
                <p className="text-2xl font-bold text-green-600">
                  {analyticsData[0].completed_appointments}
                </p>
              </div>
              <div className="bg-card rounded-lg p-4 shadow">
                <p className="text-sm text-muted-foreground mb-1">Canceladas</p>
                <p className="text-2xl font-bold text-red-600">
                  {analyticsData[0].cancelled_appointments}
                </p>
              </div>
              <div className="bg-card rounded-lg p-4 shadow">
                <p className="text-sm text-muted-foreground mb-1">Faltas</p>
                <p className="text-2xl font-bold text-orange-600">
                  {analyticsData[0].no_show_appointments}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </PlatformPageWrapper>
  );
}
