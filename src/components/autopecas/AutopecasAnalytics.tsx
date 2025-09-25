import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  TrendingUp,
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  Bot,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { mockAutopecasAnalytics } from '@/lib/autopecasMockData';

export const AutopecasAnalytics = () => {
  const kpiData = [
    {
      title: 'Faturamento Total',
      value: `R$ ${mockAutopecasAnalytics.totalRevenue.toLocaleString()}`,
      change: '+22.5%',
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Pedidos Realizados',
      value: mockAutopecasAnalytics.totalOrders.toLocaleString(),
      change: '+18.2%',
      icon: ShoppingCart,
      color: 'text-blue-600',
    },
    {
      title: 'Produtos Ativos',
      value: mockAutopecasAnalytics.totalProducts.toLocaleString(),
      change: '+5.1%',
      icon: Package,
      color: 'text-purple-600',
    },
    {
      title: 'Interações IA',
      value: mockAutopecasAnalytics.aiInteractions.toLocaleString(),
      change: '+32.8%',
      icon: Bot,
      color: 'text-orange-600',
    },
  ];

  const pieColors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Analytics da Loja</h2>
        <p className="text-muted-foreground">
          Acompanhe o desempenho da sua loja de autopeças
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title} className="hover:shadow-hover transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {kpi.title}
                    </p>
                    <p className="text-2xl font-bold">{kpi.value}</p>
                    <p className="text-xs text-success flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {kpi.change}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-subtle flex items-center justify-center ${kpi.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Faturamento Mensal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Faturamento Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockAutopecasAnalytics.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`R$ ${value}`, 'Faturamento']} />
                <Bar dataKey="revenue" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pedidos por Mês */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Pedidos por Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockAutopecasAnalytics.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [value, 'Pedidos']} />
                <Line 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#06B6D4" 
                  strokeWidth={3}
                  dot={{ fill: '#06B6D4', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categorias */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Categorias Mais Vendidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockAutopecasAnalytics.topCategories}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="sales"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {mockAutopecasAnalytics.topCategories.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Vendas']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Métricas de Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Métricas de Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Taxa de Conversão IA</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="default">{mockAutopecasAnalytics.conversionRate}%</Badge>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-gradient-primary h-2 rounded-full" 
                  style={{ width: `${mockAutopecasAnalytics.conversionRate}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Ticket Médio</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">R$ {mockAutopecasAnalytics.avgTicket}</Badge>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Produtos com Estoque Baixo</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="destructive">4 itens</Badge>
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Crescimento Mensal</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="default">+18.5%</Badge>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo das Top Categorias */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAutopecasAnalytics.topCategories.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: pieColors[index % pieColors.length] }}
                  />
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-muted-foreground">{category.sales} vendas</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">R$ {category.revenue.toLocaleString()}</p>
                  <p className="text-sm text-success">
                    +{Math.floor(Math.random() * 20 + 5)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};