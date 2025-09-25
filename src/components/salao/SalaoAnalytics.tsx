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
  Calendar,
  Users,
  DollarSign,
  Scissors,
  Bot,
  Star,
  Heart,
  Clock,
} from 'lucide-react';
import { mockSalaoAnalytics } from '@/lib/salaoMockData';

export const SalaoAnalytics = () => {
  const kpiData = [
    {
      title: 'Faturamento Total',
      value: `R$ ${mockSalaoAnalytics.totalRevenue.toLocaleString()}`,
      change: '+15.8%',
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Agendamentos',
      value: mockSalaoAnalytics.totalAppointments.toLocaleString(),
      change: '+12.3%',
      icon: Calendar,
      color: 'text-blue-600',
    },
    {
      title: 'Clientes Ativas',
      value: mockSalaoAnalytics.totalClients.toLocaleString(),
      change: '+8.7%',
      icon: Users,
      color: 'text-purple-600',
    },
    {
      title: 'Interações IA',
      value: mockSalaoAnalytics.aiInteractions.toLocaleString(),
      change: '+28.4%',
      icon: Bot,
      color: 'text-pink-600',
    },
  ];

  const pieColors = ['#EC4899', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Analytics do Salão</h2>
        <p className="text-muted-foreground">
          Acompanhe o desempenho e crescimento do seu salão
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
              <BarChart data={mockSalaoAnalytics.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`R$ ${value}`, 'Faturamento']} />
                <Bar dataKey="revenue" fill="#EC4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Agendamentos por Mês */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Agendamentos por Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockSalaoAnalytics.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [value, 'Agendamentos']} />
                <Line 
                  type="monotone" 
                  dataKey="appointments" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Serviços */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Scissors className="h-5 w-5 mr-2" />
              Serviços Mais Procurados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockSalaoAnalytics.topServices}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="bookings"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {mockSalaoAnalytics.topServices.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Agendamentos']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Métricas de Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2" />
              Métricas de Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Taxa de Conversão IA</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="default">{mockSalaoAnalytics.conversionRate}%</Badge>
                  <Heart className="h-4 w-4 text-pink-500" />
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full" 
                  style={{ width: `${mockSalaoAnalytics.conversionRate}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Ticket Médio</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">R$ {mockSalaoAnalytics.avgTicket}</Badge>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Taxa de Retenção</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="default">87%</Badge>
                  <Heart className="h-4 w-4 text-pink-500" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Tempo Médio Atendimento</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">75min</Badge>
                  <Clock className="h-4 w-4 text-blue-500" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo dos Top Serviços */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Serviço</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockSalaoAnalytics.topServices.map((service, index) => (
              <div key={service.name} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: pieColors[index % pieColors.length] }}
                  />
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-muted-foreground">{service.bookings} agendamentos</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">R$ {service.revenue.toLocaleString()}</p>
                  <p className="text-sm text-success">
                    +{Math.floor(Math.random() * 25 + 10)}%
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