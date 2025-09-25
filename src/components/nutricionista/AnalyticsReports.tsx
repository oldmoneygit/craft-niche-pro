import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  Target, 
  Download, 
  Calendar,
  Award,
  Activity,
  Percent
} from "lucide-react";
import { mockNutriData } from "@/lib/mockDataNutricionista";

const AnalyticsReports = () => {
  const { analyticsData, dashboardMetrics } = mockNutriData;

  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Relatórios & Analytics</h2>
          <p className="text-muted-foreground">Análise detalhada do desempenho da clínica</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="30days">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Últimos 7 dias</SelectItem>
              <SelectItem value="30days">Últimos 30 dias</SelectItem>
              <SelectItem value="3months">Últimos 3 meses</SelectItem>
              <SelectItem value="6months">Últimos 6 meses</SelectItem>
              <SelectItem value="year">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="metric-card gradient-primary text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Taxa de Retenção</CardTitle>
            <Percent className="h-5 w-5 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.renewalRate}%</div>
            <p className="text-xs text-white/80">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +5% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Novos Pacientes</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+40%</span> vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="metric-card border-success/20 bg-success/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-success">Meta de Peso</CardTitle>
            <Target className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">78%</div>
            <p className="text-xs text-muted-foreground">
              Pacientes alcançaram objetivos
            </p>
          </CardContent>
        </Card>

        <Card className="metric-card border-warning/20 bg-warning/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-warning">Perda Média</CardTitle>
            <Activity className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2 kg</div>
            <p className="text-xs text-muted-foreground">
              Por paciente/mês
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução de Pacientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Evolução de Pacientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData.patientsEvolution}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    name="Total"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="active" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    name="Ativos"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="new" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    name="Novos"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribuição de Planos */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Tipo de Plano</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.planDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analyticsData.planDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-4 text-center">
              {analyticsData.planDistribution.map((plan) => (
                <div key={plan.name} className="space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: plan.color }}></div>
                    <span className="text-sm font-medium">{plan.name}</span>
                  </div>
                  <div className="text-lg font-bold">{plan.value}</div>
                  <div className="text-xs text-muted-foreground">pacientes</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Perda de Peso Média */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Perda de Peso Média por Mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.averageWeight}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" />
                <YAxis />
                <Bar 
                  dataKey="avgLoss" 
                  fill="#22c55e"
                  name="Perda Média (kg)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Detalhadas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance Mensal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Consultas Realizadas</span>
              <span className="font-bold">89</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Taxa de Comparecimento</span>
              <span className="font-bold text-success">94%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Planos Criados</span>
              <span className="font-bold">23</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Renovações</span>
              <span className="font-bold text-primary">18</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resultados dos Pacientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Objetivo Alcançado</span>
              <Badge className="status-active">78%</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Em Progresso</span>
              <Badge className="status-expiring">18%</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Sem Progresso</span>
              <Badge className="status-inactive">4%</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Satisfação Média</span>
              <div className="flex items-center gap-1">
                <Award className="h-4 w-4 text-warning" />
                <span className="font-bold">4.7/5</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Próximas Ações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-warning/10 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-warning" />
                <span className="font-medium text-sm">10 Renovações</span>
              </div>
              <p className="text-xs text-muted-foreground">Vencem nos próximos 7 dias</p>
            </div>
            
            <div className="p-3 bg-info/10 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-info" />
                <span className="font-medium text-sm">5 Follow-ups</span>
              </div>
              <p className="text-xs text-muted-foreground">Pacientes para acompanhar</p>
            </div>
            
            <div className="p-3 bg-success/10 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-success" />
                <span className="font-medium text-sm">Meta Mensal</span>
              </div>
              <p className="text-xs text-muted-foreground">87% concluída</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsReports;