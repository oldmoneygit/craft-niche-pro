import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Apple,
  MessageSquare,
  FileText,
  BarChart3,
  Plus,
  Bell,
  Settings,
  Heart,
  Leaf,
  Activity
} from "lucide-react";
import { mockNutriData } from "@/lib/mockDataNutricionista";
import PatientsManagement from "@/components/nutricionista/PatientsManagement";
import AppointmentScheduler from "@/components/nutricionista/AppointmentScheduler";
import MealPlansManager from "@/components/nutricionista/MealPlansManager";
import FinancialDashboard from "@/components/nutricionista/FinancialDashboard";
import ChatAI from "@/components/nutricionista/ChatAI";
import AnalyticsReports from "@/components/nutricionista/AnalyticsReports";

const NutricionistaDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { dashboardMetrics, recentActivity, clinicInfo } = mockNutriData;

  const MetricCard = ({ title, value, icon: Icon, trend, color = "primary" }: any) => (
    <Card className="metric-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-5 w-5 text-${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground">
            <span className="text-success">+{trend}%</span> em relação ao mês anterior
          </p>
        )}
      </CardContent>
    </Card>
  );

  const QuickActionButton = ({ icon: Icon, label, onClick, variant = "outline" }: any) => (
    <Button onClick={onClick} variant={variant} className="h-20 flex-col gap-2 action-primary">
      <Icon className="h-6 w-6" />
      <span className="text-xs">{label}</span>
    </Button>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Gabriel Gandin Nutricionista</h1>
              <p className="text-sm text-muted-foreground">CRN-3 45678</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">GG</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-card border-r p-4">
          <nav className="space-y-2">
            {[
              { id: "dashboard", label: "Dashboard", icon: BarChart3 },
              { id: "patients", label: "Pacientes", icon: Users },
              { id: "appointments", label: "Agenda", icon: Calendar },
              { id: "meal-plans", label: "Planos Alimentares", icon: Apple },
              { id: "financial", label: "Financeiro", icon: DollarSign },
              { id: "chat-ai", label: "Chat IA", icon: MessageSquare },
              { id: "analytics", label: "Relatórios", icon: FileText }
            ].map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <MetricCard
                  title="Pacientes Ativos"
                  value={dashboardMetrics.patientsActive}
                  icon={Users}
                  trend={8}
                  color="primary"
                />
                <MetricCard
                  title="Consultas Hoje"
                  value={dashboardMetrics.consultationsToday}
                  icon={Calendar}
                  color="info"
                />
                <MetricCard
                  title="Próximas Consultas"
                  value={`${dashboardMetrics.nextWeekConsultations} esta semana`}
                  icon={Activity}
                  color="warning"
                />
                <MetricCard
                  title="Faturamento Mensal"
                  value={`R$ ${dashboardMetrics.monthlyRevenue.toLocaleString()}`}
                  icon={DollarSign}
                  trend={12}
                  color="success"
                />
                <MetricCard
                  title="Taxa de Renovação"
                  value={`${dashboardMetrics.renovationRate}%`}
                  icon={TrendingUp}
                  trend={5}
                  color="primary"
                />
              </div>

              {/* Alerts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-warning/20 bg-warning/5">
                  <CardHeader>
                    <CardTitle className="text-warning flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Planos a Vencer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardMetrics.plansExpiring}</div>
                    <p className="text-sm text-muted-foreground">Próximos 7 dias</p>
                  </CardContent>
                </Card>

                <Card className="border-destructive/20 bg-destructive/5">
                  <CardHeader>
                    <CardTitle className="text-destructive flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Pacientes Inativos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardMetrics.inactivePatients}</div>
                    <p className="text-sm text-muted-foreground">Há mais de 30 dias</p>
                  </CardContent>
                </Card>

                <Card className="border-info/20 bg-info/5">
                  <CardHeader>
                    <CardTitle className="text-info flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Tarefas Pendentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardMetrics.pendingTasks}</div>
                    <p className="text-sm text-muted-foreground">Planos para revisar</p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <QuickActionButton
                      icon={Plus}
                      label="Nova Consulta"
                      onClick={() => setActiveTab("appointments")}
                    />
                    <QuickActionButton
                      icon={MessageSquare}
                      label="Enviar Mensagem"
                      onClick={() => setActiveTab("chat-ai")}
                    />
                    <QuickActionButton
                      icon={Apple}
                      label="Criar Plano"
                      onClick={() => setActiveTab("meal-plans")}
                    />
                    <QuickActionButton
                      icon={DollarSign}
                      label="Registrar Pagamento"
                      onClick={() => setActiveTab("financial")}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Atividade Recente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Heart className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{activity.message}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "patients" && <PatientsManagement />}
          {activeTab === "appointments" && <AppointmentScheduler />}
          {activeTab === "meal-plans" && <MealPlansManager />}
          {activeTab === "financial" && <FinancialDashboard />}
          {activeTab === "chat-ai" && <ChatAI />}
          {activeTab === "analytics" && <AnalyticsReports />}
        </main>
      </div>
    </div>
  );
};

export default NutricionistaDashboard;