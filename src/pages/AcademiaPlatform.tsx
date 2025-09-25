import { useState } from "react";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Activity, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  UserPlus, 
  Bell, 
  Target,
  Dumbbell,
  Zap,
  Trophy,
  Timer,
  Flame,
  BarChart3
} from "lucide-react";
import { academiaStats, academiaRecentActivity } from "@/lib/academiaMockData";
import { MembersView } from "@/components/academia/MembersView";
import { ClassesView } from "@/components/academia/ClassesView";
import { AcademiaChatView } from "@/components/academia/AcademiaChatView";
import { AcademiaAnalytics } from "@/components/academia/AcademiaAnalytics";
import { PlansView } from "@/components/academia/PlansView";

export default function AcademiaPlatform() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-background relative">
      {/* Geometric background pattern */}
      <div className="fixed inset-0 geometric-bg pointer-events-none" />
      
      <Header />
      
      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Hero Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-primary rounded-full animate-pulse-glow">
              <Dumbbell className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-montserrat font-bold bg-gradient-primary bg-clip-text text-transparent">
              FitLife Academia
            </h1>
          </div>
          <p className="text-muted-foreground text-lg font-medium">
            Transforme vidas através do fitness 💪
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Enhanced Tab Navigation */}
          <div className="flex justify-center">
            <TabsList className="grid grid-cols-6 w-full max-w-4xl h-14 bg-card border border-border/50 p-1">
              <TabsTrigger 
                value="dashboard" 
                className="font-montserrat font-semibold text-sm data-[state=active]:bg-gradient-primary data-[state=active]:text-white"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="members"
                className="font-montserrat font-semibold text-sm data-[state=active]:bg-gradient-primary data-[state=active]:text-white"
              >
                <Users className="h-4 w-4 mr-2" />
                Membros
              </TabsTrigger>
              <TabsTrigger 
                value="classes"
                className="font-montserrat font-semibold text-sm data-[state=active]:bg-gradient-primary data-[state=active]:text-white"
              >
                <Timer className="h-4 w-4 mr-2" />
                Aulas
              </TabsTrigger>
              <TabsTrigger 
                value="plans"
                className="font-montserrat font-semibold text-sm data-[state=active]:bg-gradient-primary data-[state=active]:text-white"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Planos
              </TabsTrigger>
              <TabsTrigger 
                value="chat"
                className="font-montserrat font-semibold text-sm data-[state=active]:bg-gradient-primary data-[state=active]:text-white"
              >
                <Zap className="h-4 w-4 mr-2" />
                IA Trainer
              </TabsTrigger>
              <TabsTrigger 
                value="analytics"
                className="font-montserrat font-semibold text-sm data-[state=active]:bg-gradient-primary data-[state=active]:text-white"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="space-y-8">
            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="metric-card group cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-montserrat font-semibold text-muted-foreground">
                    Membros Ativos
                  </CardTitle>
                  <div className="p-2 bg-gradient-secondary rounded-full group-hover:animate-pulse-glow">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-montserrat font-bold text-primary mb-1">
                    {academiaStats.activeMembers}
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-success" />
                    <p className="text-xs text-success font-medium">
                      +12% vs mês anterior
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="metric-card group cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-montserrat font-semibold text-muted-foreground">
                    Check-ins Hoje
                  </CardTitle>
                  <div className="p-2 bg-gradient-to-br from-accent to-secondary rounded-full group-hover:animate-pulse-glow">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-montserrat font-bold text-accent mb-1">
                    {academiaStats.todayCheckIns}
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="h-3 w-3 text-warning" />
                    <p className="text-xs text-warning font-medium">
                      +5% vs ontem
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="metric-card group cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-montserrat font-semibold text-muted-foreground">
                    Aulas Hoje
                  </CardTitle>
                  <div className="p-2 bg-gradient-to-br from-warning to-primary rounded-full group-hover:animate-pulse-glow">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-montserrat font-bold text-warning mb-1">
                    {academiaStats.scheduledClasses}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    3 ainda hoje
                  </p>
                </CardContent>
              </Card>

              <Card className="metric-card group cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-montserrat font-semibold text-muted-foreground">
                    Faturamento Mensal
                  </CardTitle>
                  <div className="p-2 bg-gradient-to-br from-success to-accent rounded-full group-hover:animate-pulse-glow">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-montserrat font-bold text-success mb-1">
                    R$ {academiaStats.monthlyRevenue.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-success" />
                    <p className="text-xs text-success font-medium">
                      +8% vs mês anterior
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Quick Actions */}
            <Card className="fitness-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <CardTitle className="font-montserrat font-bold text-xl">Ações Rápidas</CardTitle>
                </div>
                <CardDescription>Principais tarefas do dia</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <Button className="energy-button px-6 py-3 text-base">
                  <UserPlus className="h-5 w-5 mr-2" />
                  Novo Membro
                </Button>
                <Button variant="outline" className="px-6 py-3 text-base font-montserrat font-semibold border-accent text-accent hover:bg-accent hover:text-white">
                  <Calendar className="h-5 w-5 mr-2" />
                  Agendar Aula
                </Button>
                <Button variant="outline" className="px-6 py-3 text-base font-montserrat font-semibold border-secondary text-secondary hover:bg-secondary hover:text-white">
                  <Bell className="h-5 w-5 mr-2" />
                  Enviar Push
                </Button>
                <Button variant="outline" className="px-6 py-3 text-base font-montserrat font-semibold border-primary text-primary hover:bg-primary hover:text-white">
                  <Target className="h-5 w-5 mr-2" />
                  Avaliar Membro
                </Button>
              </CardContent>
            </Card>

            {/* Enhanced Activity and Alerts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="fitness-card">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-accent" />
                    <CardTitle className="font-montserrat font-bold text-xl">Atividade Recente</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {academiaRecentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border/30 hover:border-primary/30 transition-colors">
                      <div>
                        <p className="font-montserrat font-semibold">{activity.member}</p>
                        <p className="text-sm text-muted-foreground">{activity.action}</p>
                      </div>
                      <span className="text-xs text-accent font-medium bg-accent/10 px-2 py-1 rounded-full">
                        {activity.time}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="fitness-card">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-warning" />
                    <CardTitle className="font-montserrat font-bold text-xl">Alertas Importantes</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border border-warning/30 bg-warning/5 rounded-lg neon-border animate-pulse-glow">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="bg-warning text-warning-foreground">
                        Renovações
                      </Badge>
                      <span className="text-sm font-montserrat font-bold text-warning">
                        {academiaStats.pendingRenewals} planos vencendo
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Entrar em contato para renovação
                    </p>
                  </div>
                  <div className="p-4 border border-accent/30 bg-accent/5 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="border-accent text-accent">
                        Equipamento
                      </Badge>
                      <span className="text-sm font-montserrat font-bold text-accent">
                        Bicicleta em manutenção
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Previsão de volta: hoje às 16h
                    </p>
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