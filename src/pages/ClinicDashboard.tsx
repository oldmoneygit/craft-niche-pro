import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar,
  Users,
  MessageCircle,
  BarChart3,
  Clock,
  Heart,
  Brain,
  UserPlus,
  CalendarPlus,
  Bell,
  FileText,
  Phone,
  MapPin,
  Star,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Timer,
  DollarSign
} from "lucide-react";

export default function ClinicDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-br from-therapeutic-soft via-therapeutic-light to-therapeutic-muted">
      {/* Geometric Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-therapeutic-primary/20"></div>
        <div className="absolute top-40 right-20 w-16 h-16 rounded-lg bg-therapeutic-secondary/20 rotate-45"></div>
        <div className="absolute bottom-40 left-1/4 w-12 h-12 rounded-full bg-therapeutic-accent/20"></div>
        <div className="absolute bottom-20 right-1/3 w-24 h-24 rounded-lg bg-therapeutic-primary/10 rotate-12"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/90 backdrop-blur-sm border-b border-therapeutic-border shadow-soft">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-therapeutic rounded-xl shadow-glow">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-therapeutic bg-clip-text text-transparent">
                  Clínica Sorriso
                </h1>
                <p className="text-sm text-muted-foreground">Psicologia & Bem-estar</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="calm-button">
                <Bell className="h-4 w-4 mr-2" />
                Notificações
              </Button>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium">Dra. Sofia Sorriso</p>
                  <p className="text-xs text-muted-foreground">CRP 06/123456</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-therapeutic flex items-center justify-center">
                  <Heart className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Navigation Tabs */}
          <TabsList className="grid w-full grid-cols-5 bg-white/90 backdrop-blur-sm shadow-card rounded-2xl p-2 h-auto border border-border">
            <TabsTrigger 
              value="dashboard" 
              className="flex flex-col items-center gap-2 py-4 px-6 rounded-xl text-muted-foreground hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow transition-all duration-300"
            >
              <BarChart3 className="h-5 w-5" />
              <span className="text-sm font-medium">Início</span>
            </TabsTrigger>
            <TabsTrigger 
              value="patients" 
              className="flex flex-col items-center gap-2 py-4 px-6 rounded-xl text-muted-foreground hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow transition-all duration-300"
            >
              <Users className="h-5 w-5" />
              <span className="text-sm font-medium">Pacientes</span>
            </TabsTrigger>
            <TabsTrigger 
              value="appointments" 
              className="flex flex-col items-center gap-2 py-4 px-6 rounded-xl text-muted-foreground hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow transition-all duration-300"
            >
              <Calendar className="h-5 w-5" />
              <span className="text-sm font-medium">Agenda</span>
            </TabsTrigger>
            <TabsTrigger 
              value="chat" 
              className="flex flex-col items-center gap-2 py-4 px-6 rounded-xl text-muted-foreground hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow transition-all duration-300"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm font-medium">IA Terapêutica</span>
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="flex flex-col items-center gap-2 py-4 px-6 rounded-xl text-muted-foreground hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow transition-all duration-300"
            >
              <BarChart3 className="h-5 w-5" />
              <span className="text-sm font-medium">Relatórios</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Content */}
          <TabsContent value="dashboard" className="space-y-8">
            {/* Welcome Section */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Bem-vinda de volta, Dra. Sofia!</h2>
              <p className="text-muted-foreground">Aqui está um resumo do seu dia na clínica</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="therapy-card hover:shadow-hover transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pacientes Ativos</CardTitle>
                  <Users className="h-4 w-4 text-therapeutic-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-therapeutic-primary mb-1">52</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    +8% este mês
                  </div>
                </CardContent>
              </Card>

              <Card className="therapy-card hover:shadow-hover transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Consultas Hoje</CardTitle>
                  <Calendar className="h-4 w-4 text-therapeutic-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-therapeutic-secondary mb-1">8</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    Próxima: 14:30h
                  </div>
                </CardContent>
              </Card>

              <Card className="therapy-card hover:shadow-hover transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Presença</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600 mb-1">94%</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    +2% esta semana
                  </div>
                </CardContent>
              </Card>

              <Card className="therapy-card hover:shadow-hover transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
                  <DollarSign className="h-4 w-4 text-therapeutic-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-therapeutic-accent mb-1">R$ 18.500</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    +12% este mês
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="therapy-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-therapeutic-primary" />
                  Ações Rápidas
                </CardTitle>
                <CardDescription>Principais tarefas do dia a dia</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button className="action-primary h-auto p-4 flex flex-col items-center gap-3 rounded-xl shadow-card">
                    <UserPlus className="h-6 w-6" />
                    <div className="text-center">
                      <div className="font-medium">Novo Paciente</div>
                      <div className="text-xs opacity-90">Cadastrar paciente</div>
                    </div>
                  </Button>
                  <Button className="action-secondary h-auto p-4 flex flex-col items-center gap-3 rounded-xl shadow-card">
                    <CalendarPlus className="h-6 w-6" />
                    <div className="text-center">
                      <div className="font-medium">Agendar Consulta</div>
                      <div className="text-xs opacity-90">Nova consulta</div>
                    </div>
                  </Button>
                  <Button className="action-accent h-auto p-4 flex flex-col items-center gap-3 rounded-xl shadow-card">
                    <FileText className="h-6 w-6" />
                    <div className="text-center">
                      <div className="font-medium">Relatório</div>
                      <div className="text-xs opacity-90">Gerar relatório</div>
                    </div>
                  </Button>
                  <Button className="action-success h-auto p-4 flex flex-col items-center gap-3 rounded-xl shadow-card">
                    <MessageCircle className="h-6 w-6" />
                    <div className="text-center">
                      <div className="font-medium">IA Terapêutica</div>
                      <div className="text-xs opacity-90">Assistente virtual</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Today's Schedule & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Today's Schedule */}
              <Card className="therapy-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-therapeutic-secondary" />
                    Agenda de Hoje
                  </CardTitle>
                  <CardDescription>Próximas consultas agendadas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-therapeutic-light rounded-lg">
                    <div className="text-center">
                      <div className="text-sm font-medium">14:30</div>
                      <div className="text-xs text-muted-foreground">50min</div>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Ana Costa</div>
                      <div className="text-sm text-muted-foreground">Terapia Individual - Ansiedade</div>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Confirmado
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 p-3 bg-therapeutic-light rounded-lg">
                    <div className="text-center">
                      <div className="text-sm font-medium">16:00</div>
                      <div className="text-xs text-muted-foreground">60min</div>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">João & Maria Santos</div>
                      <div className="text-sm text-muted-foreground">Terapia de Casal</div>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Confirmado
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-center">
                      <div className="text-sm font-medium">17:30</div>
                      <div className="text-xs text-muted-foreground">50min</div>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Pedro Lima</div>
                      <div className="text-sm text-muted-foreground">Terapia Individual - Pânico</div>
                    </div>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Pendente
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="therapy-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-therapeutic-accent" />
                    Atividade Recente
                  </CardTitle>
                  <CardDescription>Últimas atualizações da clínica</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Nova consulta agendada</div>
                      <div className="text-xs text-muted-foreground">Carla Oliveira • há 15 minutos</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Pagamento recebido</div>
                      <div className="text-xs text-muted-foreground">Ana Costa - R$ 120,00 • há 1 hora</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">IA Terapêutica ativada</div>
                      <div className="text-xs text-muted-foreground">Novo paciente via WhatsApp • há 2 horas</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Lembrete de consulta enviado</div>
                      <div className="text-xs text-muted-foreground">Pedro Lima • há 3 horas</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="patients">
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Gestão de Pacientes</h3>
              <p className="text-muted-foreground">Visualização completa em desenvolvimento</p>
            </div>
          </TabsContent>

          <TabsContent value="appointments">
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Agenda Completa</h3>
              <p className="text-muted-foreground">Sistema de agendamento em desenvolvimento</p>
            </div>
          </TabsContent>

          <TabsContent value="chat">
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">IA Terapêutica</h3>
              <p className="text-muted-foreground">Assistente inteligente em desenvolvimento</p>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Relatórios e Analytics</h3>
              <p className="text-muted-foreground">Dashboard completo em desenvolvimento</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
