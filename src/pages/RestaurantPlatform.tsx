import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Clock,
  Settings,
  BarChart3,
  MenuSquare,
  MessageCircle,
  Star,
  Utensils,
  Truck,
  Phone
} from 'lucide-react';
import { restaurantData, restaurantAnalytics, recentOrders } from '@/lib/restaurantMockData';
import MenuView from '@/components/restaurant/MenuView';
import OrdersView from '@/components/restaurant/OrdersView';
import RestaurantAnalytics from '@/components/restaurant/RestaurantAnalytics';
import RestaurantChatView from '@/components/restaurant/RestaurantChatView';

const RestaurantPlatform = () => {
  const [currentView, setCurrentView] = useState('dashboard');

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: BarChart3,
      description: 'Visão geral do restaurante'
    },
    { 
      id: 'menu', 
      label: 'Cardápio', 
      icon: MenuSquare,
      description: 'Gerencie pratos e categorias'
    },
    { 
      id: 'orders', 
      label: 'Pedidos', 
      icon: ShoppingBag,
      description: 'Acompanhe pedidos em tempo real'
    },
    { 
      id: 'chat', 
      label: 'Chat IA', 
      icon: MessageCircle,
      description: 'Conversas com clientes'
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: BarChart3,
      description: 'Relatórios e métricas'
    }
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Header do Dashboard */}
      <div className="bg-gradient-card p-6 rounded-lg border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{restaurantData.name}</h1>
            <p className="text-white/80 mt-1">Chef {restaurantData.owner}</p>
            <div className="flex items-center mt-2 text-white/70">
              <Phone className="h-4 w-4 mr-2" />
              {restaurantData.phone}
            </div>
          </div>
          <div className="text-right">
            <Badge variant="secondary" className="mb-2">
              <Utensils className="h-4 w-4 mr-1" />
              Delivery Ativo
            </Badge>
            <div className="text-white/80 text-sm">
              Tempo médio: {restaurantData.avgDeliveryTime}
            </div>
          </div>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-hover transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div className="text-sm text-muted-foreground">Receita Hoje</div>
            </div>
            <div className="text-2xl font-bold mt-2">
              R$ {restaurantAnalytics.today.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center text-sm text-green-600 mt-1">
              <TrendingUp className="h-4 w-4 mr-1" />
              +12% vs ontem
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-hover transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
              <div className="text-sm text-muted-foreground">Pedidos Hoje</div>
            </div>
            <div className="text-2xl font-bold mt-2">{restaurantAnalytics.today.orders}</div>
            <div className="flex items-center text-sm text-blue-600 mt-1">
              <TrendingUp className="h-4 w-4 mr-1" />
              +8% vs ontem
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-hover transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <div className="text-sm text-muted-foreground">Ticket Médio</div>
            </div>
            <div className="text-2xl font-bold mt-2">
              R$ {restaurantAnalytics.today.avgOrderValue.toFixed(2)}
            </div>
            <div className="flex items-center text-sm text-purple-600 mt-1">
              <TrendingUp className="h-4 w-4 mr-1" />
              +3% vs ontem
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-hover transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <div className="text-sm text-muted-foreground">Avaliação</div>
            </div>
            <div className="text-2xl font-bold mt-2">4.8</div>
            <div className="text-sm text-muted-foreground mt-1">342 avaliações</div>
          </CardContent>
        </Card>
      </div>

      {/* Pedidos recentes e informações */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Pedidos Ativos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Pedidos Ativos</span>
              <Badge variant="secondary">
                {recentOrders.filter(o => ['preparing', 'ready', 'out_for_delivery'].includes(o.status)).length} ativos
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.filter(o => ['preparing', 'ready', 'out_for_delivery'].includes(o.status)).slice(0, 3).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">#{order.id}</div>
                    <div className="text-sm text-muted-foreground">{order.customer}</div>
                    <div className="text-sm font-bold">R$ {order.total.toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      order.status === 'preparing' ? 'secondary' :
                      order.status === 'ready' ? 'default' :
                      'outline'
                    }>
                      {order.status === 'preparing' ? 'Preparando' :
                       order.status === 'ready' ? 'Pronto' :
                       'Saiu para Entrega'}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {new Date(order.orderTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => setCurrentView('orders')}
            >
              Ver Todos os Pedidos
            </Button>
          </CardContent>
        </Card>

        {/* Informações do Delivery */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Truck className="h-5 w-5 mr-2" />
              Informações de Delivery
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Tempo Médio de Entrega</span>
              <span className="font-bold">{restaurantData.avgDeliveryTime}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Taxa de Entrega</span>
              <span className="font-bold">R$ {restaurantData.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Pedido Mínimo</span>
              <span className="font-bold">R$ {restaurantData.minOrderValue.toFixed(2)}</span>
            </div>
            
            <div className="pt-2 border-t">
              <div className="text-sm font-medium mb-2">Regiões de Entrega:</div>
              <div className="flex flex-wrap gap-1">
                {restaurantData.deliveryZones.map((zone) => (
                  <Badge key={zone} variant="outline" className="text-xs">
                    {zone}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t">
              <div className="text-sm font-medium mb-2">Horários de Funcionamento:</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Seg-Qui:</span>
                  <span>{restaurantData.businessHours.seg}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sex-Sáb:</span>
                  <span>{restaurantData.businessHours.sex}</span>
                </div>
                <div className="flex justify-between">
                  <span>Domingo:</span>
                  <span>{restaurantData.businessHours.dom}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return renderDashboard();
      case 'menu':
        return <MenuView />;
      case 'orders':
        return <OrdersView />;
      case 'chat':
        return <RestaurantChatView />;
      case 'analytics':
        return <RestaurantAnalytics />;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Utensils className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{restaurantData.name}</h1>
                <p className="text-sm text-muted-foreground">Painel Administrativo</p>
              </div>
            </div>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar de navegação */}
          <Card className="lg:col-span-1 h-fit">
            <CardHeader>
              <CardTitle className="text-lg">Menu Principal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentView === item.id ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setCurrentView(item.id)}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    <div className="text-left">
                      <div>{item.label}</div>
                    </div>
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          {/* Conteúdo principal */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantPlatform;