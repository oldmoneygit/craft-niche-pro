import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Truck,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
} from 'lucide-react';
import { mockOrders } from '@/lib/autopecasMockData';

export const AutopecasOrdersView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const statusOptions = ['all', 'Confirmado', 'Preparando', 'Entregue', 'Cancelado'];

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Confirmado':
        return <Clock className="h-4 w-4" />;
      case 'Preparando':
        return <Package className="h-4 w-4" />;
      case 'Entregue':
        return <CheckCircle className="h-4 w-4" />;
      case 'Cancelado':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmado':
        return <Badge variant="secondary">{getStatusIcon(status)} {status}</Badge>;
      case 'Preparando':
        return <Badge variant="outline">{getStatusIcon(status)} {status}</Badge>;
      case 'Entregue':
        return <Badge variant="default">{getStatusIcon(status)} {status}</Badge>;
      case 'Cancelado':
        return <Badge variant="destructive">{getStatusIcon(status)} {status}</Badge>;
      default:
        return <Badge variant="outline">{getStatusIcon(status)} {status}</Badge>;
    }
  };

  const getDeliveryIcon = (type: string) => {
    switch (type) {
      case 'Entrega':
        return <Truck className="h-4 w-4" />;
      case 'Retirada':
        return <Package className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pedidos</h2>
          <p className="text-muted-foreground">
            Gerencie todos os pedidos da sua loja de autopeças
          </p>
        </div>
        <Button className="bg-gradient-primary hover:shadow-hover">
          <Plus className="h-4 w-4 mr-2" />
          Novo Pedido
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por cliente ou número do pedido..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                {statusOptions.slice(1).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pedidos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Pedidos ({filteredOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Entrega</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.date} • {order.time}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customer}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="h-3 w-3 mr-1" />
                          {order.customerPhone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {order.items.map((item, index) => (
                          <div key={index} className="text-sm">
                            <span className="font-medium">{item.quantity}x</span>{' '}
                            {item.product}
                            <div className="text-xs text-muted-foreground">
                              R$ {item.price.toFixed(2)} cada
                            </div>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-lg">
                      R$ {order.total.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(order.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        {getDeliveryIcon(order.deliveryType)}
                        <span className="ml-1">{order.deliveryType}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {order.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {order.deliveryType === 'Entrega' && (
                          <Button variant="ghost" size="sm">
                            <Truck className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pedidos</p>
                <p className="text-2xl font-bold">{mockOrders.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Preparação</p>
                <p className="text-2xl font-bold text-orange-500">
                  {mockOrders.filter(o => o.status === 'Preparando').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Entregues Hoje</p>
                <p className="text-2xl font-bold text-green-500">
                  {mockOrders.filter(o => o.status === 'Entregue').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Faturamento Hoje</p>
                <p className="text-2xl font-bold">
                  R$ {mockOrders.reduce((acc, o) => acc + o.total, 0).toFixed(0)}
                </p>
              </div>
              <Truck className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};