import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  MessageSquare,
  Users,
  BarChart3,
  Settings,
  Clock,
  Phone,
  MapPin,
  Star,
  CheckCircle,
  ExternalLink,
  Brain,
  Activity,
} from 'lucide-react';
import { mockPlatforms, mockAppointments, mockPatients } from '@/lib/mockData';
import { Link } from 'react-router-dom';
import AppointmentsView from '@/components/platform/AppointmentsView';
import PatientsView from '@/components/platform/PatientsView';
import ChatView from '@/components/platform/ChatView';
import AnalyticsView from '@/components/platform/AnalyticsView';

const PlatformView = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const platform = mockPlatforms[0];

  const stats = [
    {
      title: 'Consultas Hoje',
      value: '8',
      description: '3 restantes',
      icon: Calendar,
      color: 'text-primary',
    },
    {
      title: 'Pacientes Ativos',
      value: mockPatients.length,
      description: '+3 este mês',
      icon: Users,
      color: 'text-success',
    },
    {
      title: 'Mensagens IA',
      value: '12',
      description: 'Hoje',
      icon: MessageSquare,
      color: 'text-accent',
    },
    {
      title: 'Taxa Ocupação',
      value: '85%',
      description: 'Esta semana',
      icon: BarChart3,
      color: 'text-warning',
    },
  ];

  const recentActivity = [
    {
      type: 'appointment',
      message: 'Nova consulta agendada - Ana Costa',
      time: '10 min atrás',
      icon: Calendar,
    },
    {
      type: 'message',
      message: 'IA respondeu consulta sobre horários',
      time: '25 min atrás',
      icon: Brain,
    },
    {
      type: 'patient',
      message: 'Novo paciente cadastrado - Pedro Lima',
      time: '1h atrás',
      icon: Users,
    },
    {
      type: 'system',
      message: 'Backup automático realizado',
      time: '2h atrás',
      icon: Activity,
    },
  ];

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Platform Header */}
      <div className="bg-white border-b shadow-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{platform.name}</h1>
                <div className="flex items-center space-x-4 mt-1">
                  <Badge variant="secondary" className="bg-success/10 text-success">
                    <Activity className="h-3 w-3 mr-1" />
                    Online
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {platform.url}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" asChild>
                <a href={platform.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver Site
                </a>
              </Button>
              <Button variant="outline" asChild>
                <Link to={`/platform/${platform.id}/settings`}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
            <TabsTrigger value="patients">Pacientes</TabsTrigger>
            <TabsTrigger value="chat">Chat IA</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                      <p className="text-xs text-muted-foreground">
                        {stat.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Today's Schedule */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Agenda de Hoje
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockAppointments.slice(0, 3).map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex flex-col items-center text-sm">
                            <span className="font-medium">{appointment.time}</span>
                          </div>
                          <div>
                            <p className="font-medium">{appointment.patientName}</p>
                            <p className="text-sm text-muted-foreground">
                              {appointment.type} • {appointment.duration} min
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            appointment.status === 'confirmed'
                              ? 'secondary'
                              : appointment.status === 'pending'
                              ? 'outline'
                              : 'default'
                          }
                        >
                          {appointment.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4" asChild>
                    <Link to="#" onClick={() => setActiveTab('appointments')}>
                      Ver Agenda Completa
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Atividade Recente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => {
                      const Icon = activity.icon;
                      return (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{activity.message}</p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="hover:shadow-hover transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Novo Agendamento</h3>
                  <p className="text-muted-foreground text-sm">
                    Agendar consulta manualmente
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-hover transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-accent" />
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Treinar IA</h3>
                  <p className="text-muted-foreground text-sm">
                    Adicionar novas informações
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-hover transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-warning" />
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Relatórios</h3>
                  <p className="text-muted-foreground text-sm">
                    Análises detalhadas
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="appointments">
            <AppointmentsView />
          </TabsContent>

          <TabsContent value="patients">
            <PatientsView />
          </TabsContent>

          <TabsContent value="chat">
            <ChatView />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PlatformView;