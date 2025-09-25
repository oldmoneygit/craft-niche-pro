import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  TrendingUp,
  MessageSquare,
  Calendar,
  Plus,
  ExternalLink,
  Settings,
  BarChart3,
  Activity,
} from 'lucide-react';
import { mockUser, mockPlatforms, mockAnalytics } from '@/lib/mockData';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Dashboard = () => {
  const [selectedPlatform] = useState(mockPlatforms[0]);

  const stats = [
    {
      title: 'Pacientes Totais',
      value: mockAnalytics.totalPatients,
      change: `+${mockAnalytics.monthlyGrowth.patients}%`,
      icon: Users,
      color: 'text-primary',
    },
    {
      title: 'Visitas do Mês',
      value: mockAnalytics.totalVisits.toLocaleString(),
      change: `+${mockAnalytics.monthlyGrowth.visits}%`,
      icon: TrendingUp,
      color: 'text-success',
    },
    {
      title: 'Receita Mensal',
      value: `R$ ${mockAnalytics.totalRevenue.toLocaleString()}`,
      change: `+${mockAnalytics.monthlyGrowth.revenue}%`,
      icon: BarChart3,
      color: 'text-warning',
    },
    {
      title: 'Interações IA',
      value: mockAnalytics.aiInteractions,
      change: `+${mockAnalytics.monthlyGrowth.interactions}%`,
      icon: MessageSquare,
      color: 'text-accent',
    },
  ];

  return (
    <div className="min-h-screen bg-muted/20 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Bem-vindo de volta, {mockUser.name}
              </p>
            </div>
            <Button className="bg-gradient-primary hover:shadow-hover" asChild>
              <Link to="/create">
                <Plus className="h-4 w-4 mr-2" />
                Nova Plataforma
              </Link>
            </Button>
          </div>
        </div>

        {/* Platform Overview */}
        <div className="mb-8">
          <Card className="bg-gradient-card border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{selectedPlatform.name}</CardTitle>
                  <p className="text-muted-foreground mt-1">
                    Clínica Psicológica • Ativa desde {new Date(selectedPlatform.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-success/10 text-success">
                    <Activity className="h-3 w-3 mr-1" />
                    Online
                  </Badge>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/platform/${selectedPlatform.id}`}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver Plataforma
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/platform/${selectedPlatform.id}/settings`}>
                      <Settings className="h-4 w-4 mr-2" />
                      Configurar
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-hover transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-success">
                    {stat.change} vs. mês anterior
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Visitors Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Visitantes e Pacientes</CardTitle>
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
                    name="Pacientes"
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
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-hover transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                Próximos Agendamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Você tem 8 consultas agendadas para hoje
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link to={`/platform/${selectedPlatform.id}/appointments`}>
                  Ver Agenda
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-hover transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-accent" />
                Chat com IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                3 conversas aguardando resposta
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link to={`/platform/${selectedPlatform.id}/chat`}>
                  Gerenciar Chat
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-hover transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-warning" />
                Relatórios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Análises detalhadas do seu negócio
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link to={`/platform/${selectedPlatform.id}/analytics`}>
                  Ver Relatórios
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;