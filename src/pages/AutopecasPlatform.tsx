import { useState } from 'react';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Car,
  Package,
  ShoppingCart,
  Users,
  MessageCircle,
  BarChart3,
  Plus,
  Search,
  Bell,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { mockAutopecasAnalytics, mockAutopecasData } from '@/lib/autopecasMockData';
import { ProductsView } from '@/components/autopeças/ProductsView';
import { AutopecasOrdersView } from '@/components/autopeças/AutopecasOrdersView';
import { AutopecasCustomersView } from '@/components/autopeças/AutopecasCustomersView';
import { AutopecasChatView } from '@/components/autopeças/AutopecasChatView';
import { AutopecasAnalytics } from '@/components/autopeças/AutopecasAnalytics';

const AutopecasPlatform = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const quickStats = [
    {
      title: 'Pedidos Hoje',
      value: '23',
      change: '+12%',
      icon: ShoppingCart,
      color: 'text-blue-600',
    },
    {
      title: 'Produtos Ativos',
      value: mockAutopecasAnalytics.totalProducts.toLocaleString(),
      change: '+5.2%',
      icon: Package,
      color: 'text-green-600',
    },
    {
      title: 'Faturamento (Mês)',
      value: `R$ ${(mockAutopecasAnalytics.totalRevenue / 1000).toFixed(0)}k`,
      change: '+18%',
      icon: TrendingUp,
      color: 'text-emerald-600',
    },
    {
      title: 'Taxa Conversão IA',
      value: `${mockAutopecasAnalytics.conversionRate}%`,
      change: '+3.1%',
      icon: MessageCircle,
      color: 'text-purple-600',
    },
  ];

  const todayOrders = [
    { id: 'PED-004', customer: 'Mecânica do Zé', time: '09:30', status: 'Entregue', value: 'R$ 234,50' },
    { id: 'PED-005', customer: 'João Motorista', time: '11:15', status: 'Preparando', value: 'R$ 89,90' },
    { id: 'PED-006', customer: 'Auto Socorro 24h', time: '14:20', status: 'Confirmado', value: 'R$ 456,80' },
  ];

  const lowStockItems = [
    { name: 'Amortecedor VW Gol', stock: 4, min: 2, urgency: 'high' },
    { name: 'Filtro Ar Corolla', stock: 6, min: 5, urgency: 'medium' },
    { name: 'Pastilha Freio Civic', stock: 8, min: 3, urgency: 'low' },
  ];

  const recentActivity = [
    { action: 'IA identificou peça compatível para cliente', time: '5 min', type: 'ai' },
    { action: 'Pedido PED-006 confirmado automaticamente', time: '12 min', type: 'order' },
    { action: 'Cliente solicitou orçamento via WhatsApp', time: '25 min', type: 'chat' },
    { action: 'Estoque baixo: Amortecedor VW Gol', time: '1h', type: 'alert' },
  ];

  const quickActions = [
    { label: 'Novo Pedido', icon: Plus, action: () => setActiveTab('pedidos') },
    { label: 'Consultar Estoque', icon: Search, action: () => setActiveTab('produtos') },
    { label: 'Chat IA', icon: MessageCircle, action: () => setActiveTab('chat') },
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
        {/* Pedidos de Hoje */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">Pedidos de Hoje</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{order.customer}</p>
                    <p className="text-xs text-muted-foreground">{order.id} - {order.time}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      order.status === 'Entregue' ? 'default' : 
                      order.status === 'Preparando' ? 'secondary' : 'outline'
                    }>
                      {order.status}
                    </Badge>
                    <p className="text-sm font-medium">{order.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Estoque Baixo */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">Alertas de Estoque</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Mín: {item.min} unidades</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      item.urgency === 'high' ? 'destructive' : 
                      item.urgency === 'medium' ? 'secondary' : 'outline'
                    }>
                      {item.stock} unid.
                    </Badge>
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
                    activity.type === 'ai' ? 'bg-purple-500' :
                    activity.type === 'order' ? 'bg-green-500' :
                    activity.type === 'chat' ? 'bg-blue-500' : 'bg-orange-500'
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
        {/* Header da Loja */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Car className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{mockAutopecasData.businessName}</h1>
                <p className="text-muted-foreground">
                  {mockAutopecasData.address} • {mockAutopecasData.phone}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notificações
              </Button>
              <Badge variant="default" className="bg-green-500">
                Loja Online
              </Badge>
            </div>
          </div>
        </div>

        {/* Navegação por Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Visão Geral</TabsTrigger>
            <TabsTrigger value="produtos">Produtos</TabsTrigger>
            <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
            <TabsTrigger value="clientes">Clientes</TabsTrigger>
            <TabsTrigger value="chat">Chat IA</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            {renderDashboard()}
          </TabsContent>

          <TabsContent value="produtos">
            <ProductsView />
          </TabsContent>

          <TabsContent value="pedidos">
            <AutopecasOrdersView />
          </TabsContent>

          <TabsContent value="clientes">
            <AutopecasCustomersView />
          </TabsContent>

          <TabsContent value="chat">
            <AutopecasChatView />
          </TabsContent>

          <TabsContent value="analytics">
            <AutopecasAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AutopecasPlatform;