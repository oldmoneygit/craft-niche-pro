import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart
} from "recharts";
import { TrendingUp, TrendingDown, Users, Activity, Calendar, DollarSign } from "lucide-react";

// Mock data for charts
const membershipData = [
  { month: "Jul", members: 198, revenue: 18420 },
  { month: "Ago", members: 212, revenue: 19890 },
  { month: "Set", members: 225, revenue: 21150 },
  { month: "Out", members: 234, revenue: 22100 },
  { month: "Nov", members: 241, revenue: 22890 },
  { month: "Dez", members: 247, revenue: 23450 }
];

const checkinData = [
  { day: "Seg", checkins: 89 },
  { day: "Ter", checkins: 76 },
  { day: "Qua", checkins: 82 },
  { day: "Qui", checkins: 94 },
  { day: "Sex", checkins: 101 },
  { day: "Sab", checkins: 65 },
  { day: "Dom", checkins: 32 }
];

const planDistribution = [
  { name: "Mensal Musculação", value: 45, color: "#8884d8" },
  { name: "Anual Premium", value: 30, color: "#82ca9d" },
  { name: "Mensal Crossfit", value: 15, color: "#ffc658" },
  { name: "Outros", value: 10, color: "#ff7300" }
];

const hourlyData = [
  { hour: "06h", frequency: 15 },
  { hour: "07h", frequency: 35 },
  { hour: "08h", frequency: 28 },
  { hour: "09h", frequency: 22 },
  { hour: "10h", frequency: 18 },
  { hour: "17h", frequency: 42 },
  { hour: "18h", frequency: 56 },
  { hour: "19h", frequency: 48 },
  { hour: "20h", frequency: 32 },
  { hour: "21h", frequency: 19 }
];

export function AcademiaAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Analytics da Academia</h2>
        <p className="text-muted-foreground">Acompanhe o desempenho e métricas da sua academia</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Retenção</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">94.2%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Frequência Média</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">3.2</div>
            <p className="text-xs text-muted-foreground">
              check-ins por semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ocupação Média</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">78%</div>
            <p className="text-xs text-muted-foreground">
              capacidade utilizada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ 95</div>
            <p className="text-xs text-muted-foreground">
              +R$ 8 vs mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Membership Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Crescimento de Membros</CardTitle>
            <CardDescription>Evolução nos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={membershipData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="members" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Faturamento Mensal</CardTitle>
            <CardDescription>Receita nos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={membershipData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`R$ ${value}`, "Faturamento"]} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#82ca9d" 
                  strokeWidth={3}
                  dot={{ fill: "#82ca9d" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Check-ins */}
        <Card>
          <CardHeader>
            <CardTitle>Check-ins por Dia da Semana</CardTitle>
            <CardDescription>Padrão de frequência semanal</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={checkinData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="checkins" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Planos</CardTitle>
            <CardDescription>Percentual por tipo de plano</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={planDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Horários de Pico</CardTitle>
          <CardDescription>Frequência por horário do dia</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="frequency" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Aulas Mais Populares</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Crossfit Iniciante</span>
              <Badge variant="secondary">92% ocupação</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Yoga Matinal</span>
              <Badge variant="secondary">88% ocupação</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Zumba Noite</span>
              <Badge variant="secondary">85% ocupação</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Equipamentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Funcionando</span>
              <Badge className="bg-green-100 text-green-800">47</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Manutenção</span>
              <Badge variant="secondary">3</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Próxima revisão</span>
              <Badge variant="outline">Esta semana</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Metas do Mês</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Novos membros</span>
                <span>18/25</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: "72%" }} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Faturamento</span>
                <span>R$ 22k/25k</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: "88%" }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}