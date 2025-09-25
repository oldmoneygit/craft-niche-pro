import { useState } from 'react';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Scissors,
  Calendar,
  Users,
  Sparkles,
  MessageCircle,
  BarChart3,
  Plus,
  Clock,
  TrendingUp,
  Heart,
  Bell,
  CheckCircle,
  Star,
} from 'lucide-react';
import { mockSalaoAnalytics, mockSalaoData } from '@/lib/salaoMockData';
import { ServicesView } from '@/components/salao/ServicesView';
import { SalaoAppointmentsView } from '@/components/salao/SalaoAppointmentsView';
import { SalaoClientsView } from '@/components/salao/SalaoClientsView';
import { SalaoChatView } from '@/components/salao/SalaoChatView';
import { SalaoAnalytics } from '@/components/salao/SalaoAnalytics';

const SalaoPlatform = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const quickStats = [
    {
      title: 'Agendamentos Hoje',
      value: '15',
      change: '+8%',
      icon: Calendar,
      color: 'text-pink-600',
    },
    {
      title: 'Clientes Ativas',
      value: mockSalaoAnalytics.totalClients.toLocaleString(),
      change: '+12%',
      icon: Users,
      color: 'text-purple-600',
    },
    {
      title: 'Faturamento (Mês)',
      value: `R$ ${(mockSalaoAnalytics.totalRevenue / 1000).toFixed(0)}k`,
      change: '+15%',
      icon: TrendingUp,
      color: 'text-emerald-600',
    },
    {
      title: 'Conversão IA',
      value: `${mockSalaoAnalytics.conversionRate}%`,
      change: '+5.2%',
      icon: MessageCircle,
      color: 'text-blue-600',
    },
  ];

  const todayAppointments = [
    { id: 'AG-004', client: 'Julia Mendes', service: 'Corte + Escova', time: '09:00', professional: 'Isabella', status: 'Concluído', price: 'R$ 75,00' },
    { id: 'AG-005', client: 'Mariana Costa', service: 'Coloração', time: '10:30', professional: 'Maria', status: 'Em Andamento', price: 'R$ 120,00' },
    { id: 'AG-006', client: 'Patricia Silva', service: 'Manicure + Pedicure', time: '14:00', professional: 'Ana', status: 'Agendado', price: 'R$ 60,00' },
  ];

  const professionalHighlights = [
    { name: 'Isabella Santos', appointments: 8, rating: 4.9, speciality: 'Cabeleireira' },
    { name: 'Maria Silva', appointments: 6, rating: 4.8, speciality: 'Colorista' },
    { name: 'Ana Costa', appointments: 12, rating: 4.7, speciality: 'Manicure' },
  ];

  const recentActivity = [
    { action: 'Cliente Julia agendou corte via IA', time: '5 min', type: 'booking' },
    { action: 'Lembrete enviado para Mariana (coloração 10:30)', time: '15 min', type: 'reminder' },
    { action: 'Avaliação 5 estrelas de Patricia Silva', time: '1h', type: 'review' },
    { action: 'Produto em estoque baixo: Shampoo Matizador', time: '2h', type: 'alert' },
  ];

  const quickActions = [
    { label: 'Novo Agendamento', icon: Plus, action: () => setActiveTab('agendamentos') },
    { label: 'Lista de Serviços', icon: Sparkles, action: () => setActiveTab('servicos') },
    { label: 'Chat Cliente', icon: MessageCircle, action: () => setActiveTab('chat') },
    { label: 'Relatórios', icon: BarChart3, action: () => setActiveTab('analytics') },
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-hover transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-success">{stat.change}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-subtle flex items-center justify-center ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agendamentos de Hoje */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">Agendamentos Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{appointment.client}</p>
                    <p className="text-xs text-muted-foreground">{appointment.service}</p>
                    <p className="text-xs text-muted-foreground">{appointment.time} • {appointment.professional}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      appointment.status === 'Concluído' ? 'default' : 
                      appointment.status === 'Em Andamento' ? 'secondary' : 'outline'
                    }>
                      {appointment.status}
                    </Badge>
                    <p className="text-sm font-medium">{appointment.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance dos Profissionais */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">Performance Hoje</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {professionalHighlights.map((prof, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{prof.name}</p>
                    <p className="text-xs text-muted-foreground">{prof.speciality}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">{prof.rating}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{prof.appointments} agendamentos</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Atividade Recente */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">Atividade Recente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'booking' ? 'bg-green-500' :
                    activity.type === 'reminder' ? 'bg-blue-500' :
                    activity.type === 'review' ? 'bg-yellow-500' : 'bg-orange-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-xs">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time} atrás</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.label}
                  variant="outline"
                  className="h-20 flex flex-col space-y-2 hover:shadow-hover"
                  onClick={action.action}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-xs">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/20">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header do Salão */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Scissors className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{mockSalaoData.businessName}</h1>
                <p className="text-muted-foreground">
                  {mockSalaoData.address} • {mockSalaoData.phone}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notificações
              </Button>
              <Badge variant="default" className="bg-pink-500">
                Salão Aberto
              </Badge>
            </div>
          </div>
        </div>

        {/* Navegação por Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Visão Geral</TabsTrigger>
            <TabsTrigger value="agendamentos">Agendamentos</TabsTrigger>
            <TabsTrigger value="servicos">Serviços</TabsTrigger>
            <TabsTrigger value="clientes">Clientes</TabsTrigger>
            <TabsTrigger value="chat">Chat IA</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            {renderDashboard()}
          </TabsContent>

          <TabsContent value="agendamentos">
            <SalaoAppointmentsView />
          </TabsContent>

          <TabsContent value="servicos">
            <ServicesView />
          </TabsContent>

          <TabsContent value="clientes">
            <SalaoClientsView />
          </TabsContent>

          <TabsContent value="chat">
            <SalaoChatView />
          </TabsContent>

          <TabsContent value="analytics">
            <SalaoAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SalaoPlatform;