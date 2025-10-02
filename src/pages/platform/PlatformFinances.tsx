import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DollarSign, TrendingUp, Percent, TrendingDown, Download, Search, Check, Eye, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTenantId } from '@/hooks/useTenantId';
import PlatformPageWrapper from '@/core/layouts/PlatformPageWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatDate, calculateMonthlyEquivalent, calculateDaysRemaining } from '@/lib/serviceCalculations';

export default function PlatformFinances() {
  const { clientId } = useParams();
  const { tenantId } = useTenantId();
  const { toast } = useToast();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filters, setFilters] = useState({
    period: 'this_month',
    status: 'all',
    search: ''
  });

  // KPIs
  const [kpis, setKpis] = useState({
    totalRevenue: 0,
    conversionRate: 0,
    averageTicket: 0,
    churnRate: 0
  });

  // Dados para gráficos
  const [revenueChartData, setRevenueChartData] = useState<any[]>([]);
  const [paymentMethodsData, setPaymentMethodsData] = useState<any[]>([]);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (tenantId) fetchTransactions();
  }, [tenantId]);

  useEffect(() => {
    applyFilters();
  }, [filters, transactions]);

  const fetchTransactions = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('service_subscriptions')
      .select(`
        *,
        clients (id, name, email, phone),
        services (id, name, modality, duration_type)
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Erro ao carregar transações', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    setTransactions(data || []);
    setFilteredTransactions(data || []);
    calculateKPIs(data || []);
    generateChartData(data || []);
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    // Filtro de período
    const today = new Date();
    if (filters.period === 'today') {
      filtered = filtered.filter(t => {
        const date = new Date(t.created_at);
        return date.toDateString() === today.toDateString();
      });
    } else if (filters.period === 'this_week') {
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(t => new Date(t.created_at) >= weekAgo);
    } else if (filters.period === 'this_month') {
      filtered = filtered.filter(t => {
        const date = new Date(t.created_at);
        return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
      });
    } else if (filters.period === 'this_year') {
      filtered = filtered.filter(t => {
        const date = new Date(t.created_at);
        return date.getFullYear() === today.getFullYear();
      });
    }

    // Filtro de status
    if (filters.status !== 'all') {
      filtered = filtered.filter(t => t.payment_status === filters.status);
    }

    // Busca
    if (filters.search) {
      filtered = filtered.filter(t =>
        t.clients?.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        t.services?.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
    setCurrentPage(1);
  };

  const calculateKPIs = (data: any[]) => {
    const totalRevenue = data
      .filter(t => t.payment_status === 'paid')
      .reduce((sum, t) => sum + t.price, 0);

    const totalSubscriptions = data.length;
    const activeSubscriptions = data.filter(t => t.status === 'active').length;
    const conversionRate = totalSubscriptions > 0 ? (activeSubscriptions / totalSubscriptions) * 100 : 0;

    const averageTicket = activeSubscriptions > 0 ? totalRevenue / activeSubscriptions : 0;

    const cancelledSubscriptions = data.filter(t => t.status === 'cancelled').length;
    const churnRate = totalSubscriptions > 0 ? (cancelledSubscriptions / totalSubscriptions) * 100 : 0;

    setKpis({ totalRevenue, conversionRate, averageTicket, churnRate });
  };

  const generateChartData = (data: any[]) => {
    // Gráfico de receita por mês
    const monthlyRevenue: Record<string, number> = {};
    data.forEach(t => {
      const month = new Date(t.start_date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      if (!monthlyRevenue[month]) monthlyRevenue[month] = 0;
      if (t.payment_status === 'paid') monthlyRevenue[month] += t.price;
    });

    const revenueData = Object.entries(monthlyRevenue).map(([month, receita]) => ({ month, receita }));
    setRevenueChartData(revenueData);

    // Gráfico de formas de pagamento
    const paymentMethods: Record<string, number> = {};
    data.forEach(t => {
      const method = t.payment_method || 'Não informado';
      if (!paymentMethods[method]) paymentMethods[method] = 0;
      paymentMethods[method]++;
    });

    const paymentData = Object.entries(paymentMethods).map(([method, count]) => ({
      name: method === 'pix' ? 'PIX' :
            method === 'credit_card' ? 'Cartão Crédito' :
            method === 'debit_card' ? 'Cartão Débito' :
            method === 'boleto' ? 'Boleto' :
            method === 'cash' ? 'Dinheiro' :
            method === 'transfer' ? 'Transferência' : method,
      value: count
    }));
    setPaymentMethodsData(paymentData);
  };

  const handleMarkAsPaid = async (id: string) => {
    const { error } = await supabase
      .from('service_subscriptions')
      .update({ payment_status: 'paid' })
      .eq('id', id);

    if (error) {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: '✓ Pagamento confirmado', description: 'O status foi atualizado com sucesso.' });
    fetchTransactions();
  };

  const handleExportCSV = () => {
    const csv = [
      ['Cliente', 'Serviço', 'Valor', 'Vencimento', 'Status', 'Forma de Pagamento'].join(','),
      ...filteredTransactions.map(t => [
        t.clients?.name,
        t.services?.name,
        t.price,
        t.end_date,
        t.payment_status,
        t.payment_method || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financeiro_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    toast({ title: '✓ Exportado com sucesso', description: 'Arquivo CSV baixado.' });
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  return (
    <PlatformPageWrapper title="Finanças">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finanças</h1>
          <p className="text-gray-600">Visão completa da saúde financeira do seu negócio</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-green-700">Receita Total</p>
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-900">{formatCurrency(kpis.totalRevenue)}</p>
            <p className="text-xs text-green-600 mt-1">Este período</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-sky-50 border-2 border-blue-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-blue-700">Taxa de Conversão</p>
              <Percent className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-blue-900">{kpis.conversionRate.toFixed(1)}%</p>
            <p className="text-xs text-blue-600 mt-1">Serviços ativos / total</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-orange-700">Ticket Médio</p>
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-orange-900">{formatCurrency(kpis.averageTicket)}</p>
            <p className="text-xs text-orange-600 mt-1">Por contrato</p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-red-700">Taxa de Churn</p>
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-red-900">{kpis.churnRate.toFixed(1)}%</p>
            <p className="text-xs text-red-600 mt-1">Taxa de cancelamento</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Buscar por cliente ou serviço..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>

            <select
              value={filters.period}
              onChange={(e) => setFilters(prev => ({ ...prev, period: e.target.value }))}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
            >
              <option value="today">Hoje</option>
              <option value="this_week">Esta Semana</option>
              <option value="this_month">Este Mês</option>
              <option value="this_year">Este Ano</option>
              <option value="all">Todos</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
            >
              <option value="all">Todos Status</option>
              <option value="paid">Pago</option>
              <option value="pending">Pendente</option>
              <option value="overdue">Atrasado</option>
            </select>

            <Button onClick={handleExportCSV} variant="outline" className="gap-2">
              <Download className="w-5 h-5" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg border-2 border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Receita ao Longo do Tempo</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: 'white', border: '2px solid #10b981', borderRadius: '8px' }} />
                <Bar dataKey="receita" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Formas de Pagamento</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethodsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentMethodsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabela de Transações */}
        <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-900">Transações ({filteredTransactions.length})</h3>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando transações...</p>
            </div>
          ) : currentItems.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">Nenhuma transação encontrada</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Cliente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Serviço</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Valor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Vencimento</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{transaction.clients?.name}</div>
                          <div className="text-xs text-gray-500">{transaction.clients?.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{transaction.services?.name}</div>
                          <div className="text-xs text-gray-500 capitalize">{transaction.services?.modality}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-gray-900">{formatCurrency(transaction.price)}</div>
                          <div className="text-xs text-gray-500">
                            {formatCurrency(calculateMonthlyEquivalent(transaction.price, transaction.services?.duration_type))}/mês
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{formatDate(transaction.end_date)}</div>
                          <div className="text-xs text-gray-500">
                            {calculateDaysRemaining(transaction.end_date) > 0 
                              ? `${calculateDaysRemaining(transaction.end_date)} dias restantes`
                              : 'Vencido'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {transaction.payment_status === 'paid' ? (
                            <Badge variant="default">Pago</Badge>
                          ) : transaction.payment_status === 'pending' ? (
                            <Badge variant="secondary">Pendente</Badge>
                          ) : (
                            <Badge variant="destructive">Atrasado</Badge>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {transaction.payment_status !== 'paid' && (
                              <button
                                onClick={() => handleMarkAsPaid(transaction.id)}
                                className="text-green-600 hover:text-green-900 transition-colors"
                                title="Marcar como Pago"
                              >
                                <Check className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredTransactions.length)} de {filteredTransactions.length} transações
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                    >
                      Anterior
                    </Button>
                    <span className="px-4 py-2 text-gray-700 font-medium">
                      Página {currentPage} de {totalPages}
                    </span>
                    <Button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      variant="outline"
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PlatformPageWrapper>
  );
}
