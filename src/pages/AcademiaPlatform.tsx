import { useState } from "react";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Activity, Calendar, TrendingUp, DollarSign, UserPlus, Bell, Target } from "lucide-react";
import { academiaStats, academiaRecentActivity } from "@/lib/academiaMockData";
import { MembersView } from "@/components/academia/MembersView";
import { ClassesView } from "@/components/academia/ClassesView";
import { AcademiaChatView } from "@/components/academia/AcademiaChatView";
import { AcademiaAnalytics } from "@/components/academia/AcademiaAnalytics";
import { PlansView } from "@/components/academia/PlansView";

export default function AcademiaPlatform() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">FitLife Academia</h1>
          <p className="text-muted-foreground">Gestão completa da sua academia</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="members">Membros</TabsTrigger>
            <TabsTrigger value="classes">Aulas</TabsTrigger>
            <TabsTrigger value="plans">Planos</TabsTrigger>
            <TabsTrigger value="chat">Chat IA</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Membros Ativos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{academiaStats.activeMembers}</div>
                  <p className="text-xs text-muted-foreground">
                    +12% vs mês anterior
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Check-ins Hoje</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{academiaStats.todayCheckIns}</div>
                  <p className="text-xs text-muted-foreground">
                    +5% vs ontem
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Aulas Hoje</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{academiaStats.scheduledClasses}</div>
                  <p className="text-xs text-muted-foreground">
                    3 ainda hoje
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Faturamento Mensal</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ {academiaStats.monthlyRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +8% vs mês anterior
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>Principais tarefas do dia</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <Button className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Novo Membro
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Agendar Aula
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Enviar Notificação
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Avaliar Membro
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity and Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Atividade Recente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {academiaRecentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{activity.member}</p>
                        <p className="text-sm text-muted-foreground">{activity.action}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Alertas Importantes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 border border-yellow-200 bg-yellow-50 rounded-md">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Renovações</Badge>
                      <span className="text-sm font-medium">{academiaStats.pendingRenewals} planos vencendo</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Entrar em contato para renovação</p>
                  </div>
                  <div className="p-3 border border-blue-200 bg-blue-50 rounded-md">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Equipamento</Badge>
                      <span className="text-sm font-medium">Biciclga em manutenção</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Previsão de volta: hoje às 16h</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="members">
            <MembersView />
          </TabsContent>

          <TabsContent value="classes">
            <ClassesView />
          </TabsContent>

          <TabsContent value="plans">
            <PlansView />
          </TabsContent>

          <TabsContent value="chat">
            <AcademiaChatView />
          </TabsContent>

          <TabsContent value="analytics">
            <AcademiaAnalytics />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}