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
  DollarSign,
  UserPlus,
  Heart,
  FileText,
  MessageCircle,
  Stethoscope,
} from 'lucide-react';
import { mockPlatforms, mockAppointments, mockPatients, mockAnalytics } from '@/lib/mockData';
import { Link } from 'react-router-dom';
import AppointmentsView from '@/components/platform/AppointmentsView';
import PatientsView from '@/components/platform/PatientsView';
import ChatView from '@/components/platform/ChatView';
import AnalyticsView from '@/components/platform/AnalyticsView';
import NotificationCenter from '@/components/platform/NotificationCenter';

const PlatformView = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const platform = mockPlatforms[0];

  const todayAppointments = mockAppointments.filter(apt => 
    new Date(apt.date).toDateString() === new Date().toDateString()
  );

  const stats = [
    {
      title: 'Sessões Hoje',
      value: todayAppointments.length.toString(),
      description: `${todayAppointments.filter(a => a.status === 'pending').length} pendentes`,
      icon: Calendar,
      color: 'text-primary',
    },
    {
      title: 'Pacientes Ativos',
      value: mockPatients.length.toString(),
      description: '+3 este mês',
      icon: Users,
      color: 'text-success',
    },
    {
      title: 'Novos Pacientes',
      value: '4',
      description: 'Este mês',
      icon: UserPlus,
      color: 'text-accent',
    },
    {
      title: 'Faturamento Previsto',
      value: 'R$ 8.400',
      description: 'Este mês',
      icon: DollarSign,
      color: 'text-warning',
    },
    {
      title: 'Sessões Recorrentes',
      value: mockAnalytics.recurringPatients.toString(),
      description: '95% dos pacientes',
      icon: Heart,
      color: 'text-rose-500',
    },
    {
      title: 'Taxa Comparecimento',
      value: '92%',
      description: 'Esta semana',
      icon: CheckCircle,
      color: 'text-emerald-500',
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
    <div className="min-h-screen bg-background therapeutic-bg">
      {/* Platform Header */}
      <div className="bg-card border-b shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
                <Heart className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-poppins font-semibold text-foreground">{platform.name}</h1>
                <div className="flex items-center space-x-4 mt-1">
                  <Badge variant="secondary" className="bg-success/15 text-success border-success/20 rounded-full">
                    <Activity className="h-3 w-3 mr-1" />
                    Online
                  </Badge>
                  <span className="text-sm text-muted-foreground font-inter">
                    {platform.url}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <NotificationCenter />
              <Button variant="outline" className="rounded-xl font-inter" asChild>
                <a href={platform.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver Site
                </a>
              </Button>
              <Button variant="outline" className="rounded-xl font-inter" asChild>
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
          <TabsList className="grid w-full grid-cols-5 bg-card shadow-soft rounded-2xl p-2 font-poppins">
            <TabsTrigger value="overview" className="rounded-xl font-medium">Visão Geral</TabsTrigger>
            <TabsTrigger value="appointments" className="rounded-xl font-medium">Agendamentos</TabsTrigger>
            <TabsTrigger value="patients" className="rounded-xl font-medium">Pacientes</TabsTrigger>
            <TabsTrigger value="chat" className="rounded-xl font-medium">Chat IA</TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-xl font-medium">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="therapy-card hover:animate-slide-up">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                      <CardTitle className="text-sm font-poppins font-medium text-muted-foreground">
                        {stat.title}
                      </CardTitle>
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-poppins font-semibold text-foreground">{stat.value}</div>
                      <p className="text-sm text-muted-foreground font-inter mt-1">
                        {stat.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Today's Schedule */}
              <Card className="lg:col-span-2 therapy-card">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-poppins font-semibold">Agenda de Hoje</span>
                    </div>
                    <Badge variant="outline" className="rounded-full border-primary/30 text-primary">{todayAppointments.length} sessões</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {todayAppointments.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Nenhuma sessão agendada para hoje</p>
                      </div>
                    ) : (
                      todayAppointments.slice(0, 4).map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex items-center justify-between p-4 border border-border/50 rounded-xl hover:bg-primary/5 hover:border-primary/30 transition-all duration-200"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex flex-col items-center text-sm">
                              <span className="font-medium">{appointment.time}</span>
                            </div>
                            <div>
                              <p className="font-medium">{appointment.patientName}</p>
                              <p className="text-sm text-muted-foreground">
                                {appointment.type} • {appointment.duration} min • Sessão #{appointment.sessionNumber}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant="outline"
                              className={appointment.paymentStatus === 'paid' ? 'text-success border-success/20 bg-success/10' : 'text-warning border-warning/20 bg-warning/10'}
                            >
                              {appointment.paymentStatus === 'paid' ? 'Pago' : 'Pendente'}
                            </Badge>
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
                        </div>
                      ))
                    )}
                  </div>
                  <Button variant="outline" className="w-full mt-4 rounded-xl font-poppins hover:bg-primary/5" onClick={() => setActiveTab('appointments')}>
                    Ver Agenda Completa
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="therapy-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center mr-3">
                      <Activity className="h-4 w-4 text-secondary" />
                    </div>
                    <span className="font-poppins font-semibold">Atividade Recente</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => {
                      const Icon = activity.icon;
                      return (
                        <div key={index} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-muted/30 transition-colors">
                          <div className="w-9 h-9 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Icon className="h-4 w-4 text-accent" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-poppins font-medium text-foreground">{activity.message}</p>
                            <p className="text-xs text-muted-foreground font-inter">{activity.time}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="therapy-card hover:shadow-glow transition-all duration-300 cursor-pointer group" onClick={() => setActiveTab('appointments')}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Calendar className="h-7 w-7 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-lg font-poppins font-semibold mb-2 text-foreground">Nova Sessão</h3>
                  <p className="text-muted-foreground text-sm font-inter">
                    Agendar consulta manualmente
                  </p>
                </CardContent>
              </Card>

              <Card className="therapy-card hover:shadow-glow transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                      <FileText className="h-7 w-7 text-secondary" />
                    </div>
                  </div>
                  <h3 className="text-lg font-poppins font-semibold mb-2 text-foreground">Abrir Prontuário</h3>
                  <p className="text-muted-foreground text-sm font-inter">
                    Acessar dados do paciente
                  </p>
                </CardContent>
              </Card>

              <Card className="therapy-card hover:shadow-glow transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-success/10 rounded-2xl flex items-center justify-center group-hover:bg-success/20 transition-colors">
                      <MessageCircle className="h-7 w-7 text-success" />
                    </div>
                  </div>
                  <h3 className="text-lg font-poppins font-semibold mb-2 text-foreground">Enviar Lembrete</h3>
                  <p className="text-muted-foreground text-sm font-inter">
                    WhatsApp para sessões
                  </p>
                </CardContent>
              </Card>

              <Card className="therapy-card hover:shadow-glow transition-all duration-300 cursor-pointer group" onClick={() => setActiveTab('chat')}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                      <Brain className="h-7 w-7 text-accent" />
                    </div>
                  </div>
                  <h3 className="text-lg font-poppins font-semibold mb-2 text-foreground">Treinar IA</h3>
                  <p className="text-muted-foreground text-sm font-inter">
                    Base de conhecimento
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