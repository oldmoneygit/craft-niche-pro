import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  DollarSign, 
  Activity,
  Download,
  FileText,
  BarChart3,
  PieChart,
  Target,
  Clock,
  Heart,
  Star,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RePieChart, Cell, AreaChart, Area, Pie } from 'recharts';
import { mockAnalytics } from "@/lib/mockData";

export default function AnalyticsReports() {
  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--success))'];

  const sessionTypeData = [
    { name: 'Individual', value: 65, sessions: 156 },
    { name: 'Casal', value: 25, sessions: 60 },
    { name: 'Avaliação', value: 10, sessions: 24 }
  ];

  const monthlyPerformance = [
    { month: 'Jan', consultas: 45, receita: 8400, pacientes: 28 },
    { month: 'Fev', consultas: 52, receita: 10500, pacientes: 35 },
    { month: 'Mar', consultas: 48, receita: 12500, pacientes: 45 },
    { month: 'Abr', consultas: 58, receita: 11800, pacientes: 42 },
    { month: 'Mai', consultas: 65, receita: 13200, pacientes: 48 },
    { month: 'Jun', consultas: 72, receita: 14600, pacientes: 52 }
  ];

  const weeklyAttendance = [
    { day: 'Seg', presente: 12, falta: 2 },
    { day: 'Ter', presente: 10, falta: 1 },
    { day: 'Qua', presente: 14, falta: 3 },
    { day: 'Qui', presente: 11, falta: 1 },
    { day: 'Sex', presente: 13, falta: 2 },
    { day: 'Sáb', presente: 8, falta: 1 }
  ];

  const hourlyDistribution = [
    { hora: '08:00', consultas: 2 },
    { hora: '09:00', consultas: 4 },
    { hora: '10:00', consultas: 6 },
    { hora: '11:00', consultas: 5 },
    { hora: '14:00', consultas: 8 },
    { hora: '15:00', consultas: 7 },
    { hora: '16:00', consultas: 6 },
    { hora: '17:00', consultas: 4 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Relatórios e Analytics</h2>
          <p className="text-muted-foreground">Insights e métricas da sua clínica</p>
        </div>
        <div className="flex gap-3">
          <Select defaultValue="month">
            <SelectTrigger className="w-[180px] rounded-xl">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última Semana</SelectItem>
              <SelectItem value="month">Último Mês</SelectItem>
              <SelectItem value="quarter">Último Trimestre</SelectItem>
              <SelectItem value="year">Último Ano</SelectItem>
            </SelectContent>
          </Select>
          <Button className="action-primary shadow-glow">
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Pacientes</p>
                <p className="text-3xl font-bold text-primary">{mockAnalytics.totalPatients}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+{mockAnalytics.monthlyGrowth.patients}%</span>
                </div>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl">
                <Users className="h-8 w-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sessões Este Mês</p>
                <p className="text-3xl font-bold text-secondary">{mockAnalytics.sessionsThisMonth}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+{mockAnalytics.monthlyGrowth.visits}%</span>
                </div>
              </div>
              <div className="p-3 bg-secondary/10 rounded-xl">
                <Calendar className="h-8 w-8 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receita Mensal</p>
                <p className="text-3xl font-bold text-success">R$ {mockAnalytics.totalRevenue.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+{mockAnalytics.monthlyGrowth.revenue}%</span>
                </div>
              </div>
              <div className="p-3 bg-success/10 rounded-xl">
                <DollarSign className="h-8 w-8 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Presença</p>
                <p className="text-3xl font-bold text-accent">94%</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+2.1%</span>
                </div>
              </div>
              <div className="p-3 bg-accent/10 rounded-xl">
                <Activity className="h-8 w-8 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue & Sessions Trend */}
        <Card className="therapy-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Evolução Mensal
            </CardTitle>
            <CardDescription>Receita e número de consultas por mês</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'receita' ? `R$ ${value}` : value,
                    name === 'receita' ? 'Receita' : 'Consultas'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="receita" 
                  stackId="1"
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary) / 0.3)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="consultas" 
                  stackId="2"
                  stroke="hsl(var(--secondary))" 
                  fill="hsl(var(--secondary) / 0.3)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Session Types Distribution */}
        <Card className="therapy-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Tipos de Sessão
            </CardTitle>
            <CardDescription>Distribuição por tipo de atendimento</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={sessionTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {sessionTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Porcentagem']} />
              </RePieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-4 mt-4">
              {sessionTypeData.map((item, index) => (
                <div key={item.name} className="text-center p-3 bg-muted/30 rounded-xl">
                  <div 
                    className="w-4 h-4 rounded-full mx-auto mb-1"
                    style={{ backgroundColor: COLORS[index] }}
                  ></div>
                  <div className="text-sm font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{item.sessions} sessões</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Attendance */}
        <Card className="therapy-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Presença Semanal
            </CardTitle>
            <CardDescription>Comparativo de presenças vs faltas por dia</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyAttendance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="presente" fill="hsl(var(--success))" name="Presente" />
                <Bar dataKey="falta" fill="hsl(var(--destructive))" name="Falta" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Hourly Distribution */}
        <Card className="therapy-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Distribuição por Horário
            </CardTitle>
            <CardDescription>Preferência de horários dos pacientes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="consultas" fill="hsl(var(--accent))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Patient Satisfaction */}
        <Card className="therapy-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Satisfação dos Pacientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">4.8</div>
              <div className="flex justify-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">Baseado em 127 avaliações</p>
            </div>
            
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-sm">{star}★</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full" 
                      style={{ width: `${star === 5 ? 80 : star === 4 ? 15 : 3}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {star === 5 ? '102' : star === 4 ? '19' : '6'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Treatment Progress */}
        <Card className="therapy-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Progresso dos Tratamentos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Objetivos Alcançados</span>
                <Badge className="bg-green-50 text-green-700 border-green-200">73%</Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '73%' }}></div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Em Andamento</span>
                <Badge className="bg-blue-50 text-blue-700 border-blue-200">38</Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Pacientes com tratamento ativo
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Alta Terapêutica</span>
                <Badge className="bg-purple-50 text-purple-700 border-purple-200">14</Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Pacientes que receberam alta este mês
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card className="therapy-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Resumo Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Receita Confirmada</span>
                <span className="font-semibold text-green-600">R$ 12.350</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Pendente Recebimento</span>
                <span className="font-semibold text-yellow-600">R$ 3.200</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Em Atraso</span>
                <span className="font-semibold text-red-600">R$ 850</span>
              </div>
            </div>
            
            <div className="border-t pt-3">
              <div className="flex items-center justify-between font-semibold">
                <span>Total do Mês</span>
                <span className="text-primary">R$ 16.400</span>
              </div>
            </div>
            
            <div className="pt-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Meta mensal: 89% atingida</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Items */}
      <Card className="therapy-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Itens de Ação
          </CardTitle>
          <CardDescription>Pontos que requerem atenção</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-800">Pagamentos Pendentes</span>
              </div>
              <p className="text-sm text-yellow-700">
                5 pacientes com pagamentos em atraso há mais de 15 dias
              </p>
              <Button size="sm" variant="outline" className="mt-2 text-yellow-700 border-yellow-300">
                Ver Detalhes
              </Button>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Confirmações Pendentes</span>
              </div>
              <p className="text-sm text-blue-700">
                12 consultas desta semana aguardando confirmação dos pacientes
              </p>
              <Button size="sm" variant="outline" className="mt-2 text-blue-700 border-blue-300">
                Enviar Lembretes
              </Button>
            </div>
            
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">Crescimento Acelerado</span>
              </div>
              <p className="text-sm text-green-700">
                Considere expandir horários - demanda 23% acima da capacidade
              </p>
              <Button size="sm" variant="outline" className="mt-2 text-green-700 border-green-300">
                Planejar Expansão
              </Button>
            </div>
            
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-purple-800">Feedback Positivo</span>
              </div>
              <p className="text-sm text-purple-700">
                3 novos depoimentos de 5 estrelas recebidos esta semana
              </p>
              <Button size="sm" variant="outline" className="mt-2 text-purple-700 border-purple-300">
                Ver Avaliações
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}