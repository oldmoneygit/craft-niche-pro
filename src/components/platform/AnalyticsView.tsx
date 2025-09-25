import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  MessageSquare,
  DollarSign,
  Clock,
  Target,
  Activity,
  Brain,
} from 'lucide-react';
import { mockAnalytics } from '@/lib/mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const AnalyticsView = () => {
  const stats = [
    {
      title: 'Visitantes Únicos',
      value: mockAnalytics.totalVisits.toLocaleString(),
      change: mockAnalytics.monthlyGrowth.visits,
      changeType: 'increase',
      icon: Users,
      description: 'Este mês',
    },
    {
      title: 'Taxa Conversão',
      value: `${mockAnalytics.conversionRate}%`,
      change: 2.4,
      changeType: 'increase',
      icon: Target,
      description: 'Visitantes → Pacientes',
    },
    {
      title: 'Receita Mensal',
      value: `R$ ${mockAnalytics.totalRevenue.toLocaleString()}`,
      change: mockAnalytics.monthlyGrowth.revenue,
      changeType: 'increase',
      icon: DollarSign,
      description: 'Faturamento total',
    },
    {
      title: 'Interações IA',
      value: mockAnalytics.aiInteractions,
      change: mockAnalytics.monthlyGrowth.interactions,
      changeType: 'increase',
      icon: Brain,
      description: 'Conversas automatizadas',
    },
    {
      title: 'Tempo Médio Sessão',
      value: mockAnalytics.averageSessionTime,
      change: -8.2,
      changeType: 'decrease',
      icon: Clock,
      description: 'Engajamento do site',
    },
    {
      title: 'Taxa Rejeição',
      value: `${mockAnalytics.bounceRate}%`,
      change: -4.1,
      changeType: 'decrease',
      icon: Activity,
      description: 'Visitantes que saem rápido',
    },
  ];

  const pieData = [
    { name: 'Terapia Individual', value: 65, color: 'hsl(var(--primary))' },
    { name: 'Terapia de Casal', value: 20, color: 'hsl(var(--accent))' },
    { name: 'Avaliação Psicológica', value: 10, color: 'hsl(var(--warning))' },
    { name: 'Outros', value: 5, color: 'hsl(var(--muted-foreground))' },
  ];

  const hourlyData = [
    { hour: '08:00', sessions: 2 },
    { hour: '09:00', sessions: 4 },
    { hour: '10:00', sessions: 6 },
    { hour: '11:00', sessions: 3 },
    { hour: '12:00', sessions: 1 },
    { hour: '13:00', sessions: 0 },
    { hour: '14:00', sessions: 5 },
    { hour: '15:00', sessions: 7 },
    { hour: '16:00', sessions: 8 },
    { hour: '17:00', sessions: 4 },
    { hour: '18:00', sessions: 2 },
  ];

  const sourceData = [
    { source: 'Google', visitors: 450, percentage: 36 },
    { source: 'WhatsApp', visitors: 380, percentage: 30 },
    { source: 'Instagram', visitors: 250, percentage: 20 },
    { source: 'Indicação', visitors: 120, percentage: 10 },
    { source: 'Outros', visitors: 50, percentage: 4 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Analytics</h2>
          <p className="text-muted-foreground">
            Análise detalhada do desempenho da sua plataforma
          </p>
        </div>
        <Select defaultValue="30days">
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Últimos 7 dias</SelectItem>
            <SelectItem value="30days">Últimos 30 dias</SelectItem>
            <SelectItem value="90days">Últimos 90 dias</SelectItem>
            <SelectItem value="1year">Último ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isPositiveChange = stat.changeType === 'increase';
          const TrendIcon = isPositiveChange ? TrendingUp : TrendingDown;
          
          return (
            <Card key={index} className="hover:shadow-hover transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="flex items-center space-x-1">
                  <TrendIcon 
                    className={`h-3 w-3 ${
                      isPositiveChange ? 'text-success' : 'text-destructive'
                    }`} 
                  />
                  <span 
                    className={`text-xs font-medium ${
                      isPositiveChange ? 'text-success' : 'text-destructive'
                    }`}
                  >
                    {Math.abs(stat.change)}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    vs. período anterior
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Visitors and Patients Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Visitantes e Novos Pacientes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockAnalytics.chartData.visits}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="visits" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Visitantes"
                />
                <Line 
                  type="monotone" 
                  dataKey="patients" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth={2}
                  name="Novos Pacientes"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Receita Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockAnalytics.chartData.revenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="revenue" 
                  fill="hsl(var(--success))"
                  name="Receita (R$)"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Session Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Tipos de Consulta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}</span>
                  <Badge variant="outline" className="ml-auto">
                    {item.value}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Peak Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Horários de Maior Demanda</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="sessions" 
                  fill="hsl(var(--warning))"
                  name="Consultas"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Sources */}
      <Card>
        <CardHeader>
          <CardTitle>Fontes de Tráfego</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sourceData.map((source, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="font-medium">{source.source}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-1 bg-muted rounded-full h-2 w-24">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium min-w-0">
                    {source.visitors}
                  </span>
                  <Badge variant="outline" className="min-w-0">
                    {source.percentage}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsView;