import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Clock,
  MapPin,
  Phone,
  CheckCircle,
  Truck,
  ChefHat,
  Package,
  AlertCircle
} from 'lucide-react';
import { recentOrders } from '@/lib/restaurantMockData';

const OrdersView = () => {
  const [orders] = useState(recentOrders);

  const getStatusConfig = (status: string) => {
    const configs = {
      preparing: {
        label: 'Preparando',
        variant: 'secondary',
        icon: ChefHat,
        color: 'text-orange-600'
      },
      ready: {
        label: 'Pronto',
        variant: 'default',
        icon: Package,
        color: 'text-blue-600'
      },
      out_for_delivery: {
        label: 'Saiu para Entrega',
        variant: 'secondary',
        icon: Truck,
        color: 'text-purple-600'
      },
      delivered: {
        label: 'Entregue',
        variant: 'secondary',
        icon: CheckCircle,
        color: 'text-green-600'
      },
      cancelled: {
        label: 'Cancelado',
        variant: 'destructive',
        icon: AlertCircle,
        color: 'text-red-600'
      }
    };
    return configs[status] || configs.preparing;
  };

  const getEstimatedTime = (orderTime: string, status: string) => {
    const now = new Date();
    const order = new Date(orderTime);
    const diffMinutes = Math.floor((now.getTime() - order.getTime()) / (1000 * 60));
    
    if (status === 'delivered') return 'Entregue';
    if (status === 'cancelled') return 'Cancelado';
    
    const remainingTime = Math.max(0, 45 - diffMinutes);
    return remainingTime > 0 ? `${remainingTime} min restantes` : 'Atrasado';
  };

  const ordersByStatus = {
    active: orders.filter(o => ['preparing', 'ready', 'out_for_delivery'].includes(o.status)),
    completed: orders.filter(o => ['delivered'].includes(o.status)),
    cancelled: orders.filter(o => ['cancelled'].includes(o.status))
  };

  const OrderCard = ({ order }) => {
    const statusConfig = getStatusConfig(order.status);
    const StatusIcon = statusConfig.icon;
    
    return (
      <Card className="hover:shadow-hover transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">#{order.id}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {new Date(order.orderTime).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <Badge variant={statusConfig.variant} className="flex items-center gap-1">
              <StatusIcon className="h-3 w-3" />
              {statusConfig.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Informações do cliente */}
          <div className="space-y-2">
            <div className="font-medium">{order.customer}</div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Phone className="h-4 w-4 mr-2" />
              {order.phone}
            </div>
            <div className="flex items-start text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              {order.address}
            </div>
          </div>

          {/* Itens do pedido */}
          <div className="space-y-1">
            <div className="font-medium text-sm">Itens:</div>
            {order.items.map((item, index) => (
              <div key={index} className="text-sm text-muted-foreground">
                {item.quantity}x {item.name} - R$ {item.price.toFixed(2)}
              </div>
            ))}
          </div>

          {/* Total e tempo */}
          <div className="flex justify-between items-center pt-2 border-t">
            <div>
              <div className="font-bold text-lg">R$ {order.total.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">{order.paymentMethod}</div>
            </div>
            <div className="text-right">
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-1" />
                {getEstimatedTime(order.orderTime, order.status)}
              </div>
            </div>
          </div>

          {/* Ações */}
          {order.status === 'preparing' && (
            <div className="flex gap-2">
              <Button size="sm" className="flex-1">
                Marcar como Pronto
              </Button>
              <Button size="sm" variant="outline">
                Cancelar
              </Button>
            </div>
          )}
          {order.status === 'ready' && (
            <Button size="sm" className="w-full">
              Saiu para Entrega
            </Button>
          )}
          {order.status === 'out_for_delivery' && (
            <Button size="sm" className="w-full" variant="outline">
              Marcar como Entregue
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Pedidos</h1>
        <p className="text-muted-foreground">
          Gerencie todos os pedidos em tempo real
        </p>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {ordersByStatus.active.filter(o => o.status === 'preparing').length}
            </div>
            <div className="text-sm text-muted-foreground">Preparando</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {ordersByStatus.active.filter(o => o.status === 'ready').length}
            </div>
            <div className="text-sm text-muted-foreground">Prontos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {ordersByStatus.active.filter(o => o.status === 'out_for_delivery').length}
            </div>
            <div className="text-sm text-muted-foreground">Entregando</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {ordersByStatus.completed.length}
            </div>
            <div className="text-sm text-muted-foreground">Entregues Hoje</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de pedidos */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Ativos ({ordersByStatus.active.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Concluídos ({ordersByStatus.completed.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {ordersByStatus.active.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ordersByStatus.active.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground">
                  Nenhum pedido ativo no momento
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {ordersByStatus.completed.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ordersByStatus.completed.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground">
                  Nenhum pedido concluído hoje
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrdersView;