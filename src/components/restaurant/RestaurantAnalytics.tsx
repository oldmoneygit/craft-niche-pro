import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Users,
  Clock,
  MapPin,
  Star,
  Utensils
} from 'lucide-react';
import { restaurantAnalytics, customerReviews } from '@/lib/restaurantMockData';

const RestaurantAnalytics = () => {
  const { today, thisWeek, thisMonth, peakHours, topItems, deliveryZones } = restaurantAnalytics;

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  const revenueData = [
    { name: 'Seg', revenue: 2847 },
    { name: 'Ter', revenue: 3124 },
    { name: 'Qua', revenue: 2956 },
    { name: 'Qui', revenue: 3387 },
    { name: 'Sex', revenue: 4234 },
    { name: 'Sáb', revenue: 4567 },
    { name: 'Dom', revenue: 3876 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Acompanhe o desempenho do seu restaurante
        </p>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div className="text-sm text-muted-foreground">Receita Hoje</div>
            </div>
            <div className="text-2xl font-bold mt-2">
              R$ {today.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center text-sm text-green-600 mt-1">
              <TrendingUp className="h-4 w-4 mr-1" />
              +12% vs ontem
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
              <div className="text-sm text-muted-foreground">Pedidos Hoje</div>
            </div>
            <div className="text-2xl font-bold mt-2">{today.orders}</div>
            <div className="flex items-center text-sm text-blue-600 mt-1">
              <TrendingUp className="h-4 w-4 mr-1" />
              +8% vs ontem
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <div className="text-sm text-muted-foreground">Ticket Médio</div>
            </div>
            <div className="text-2xl font-bold mt-2">
              R$ {today.avgOrderValue.toFixed(2)}
            </div>
            <div className="flex items-center text-sm text-purple-600 mt-1">
              <TrendingUp className="h-4 w-4 mr-1" />
              +3% vs ontem
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-orange-600" />
              <div className="text-sm text-muted-foreground">Novos Clientes</div>
            </div>
            <div className="text-2xl font-bold mt-2">{thisWeek.newCustomers}</div>
            <div className="text-sm text-muted-foreground mt-1">Esta semana</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de análises */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Receita</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="delivery">Entrega</TabsTrigger>
          <TabsTrigger value="reviews">Avaliações</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Gráfico de receita semanal */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Receita Semanal</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`R$ ${value}`, 'Receita']}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Horários de pico */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Horários de Pico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={peakHours}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="orders" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Resumo mensal */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Mês</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Receita Total</span>
                  <span className="font-bold">
                    R$ {thisMonth.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total de Pedidos</span>
                  <span className="font-bold">{thisMonth.orders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Ticket Médio</span>
                  <span className="font-bold">R$ {thisMonth.avgOrderValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Retenção de Clientes</span>
                  <Badge variant="secondary">{thisMonth.customerRetention}%</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Produtos mais vendidos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Utensils className="h-5 w-5 mr-2" />
                  Pratos Mais Vendidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.orders} pedidos
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">
                          R$ {item.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Gráfico de pizza - categorias */}
            <Card>
              <CardHeader>
                <CardTitle>Vendas por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Principais', value: 45 },
                        { name: 'Massas', value: 25 },
                        { name: 'Entradas', value: 15 },
                        { name: 'Sobremesas', value: 15 }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[1,2,3,4].map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="delivery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Análise de Entregas por Região
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deliveryZones.map((zone, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{zone.zone}</div>
                      <div className="text-sm text-muted-foreground">
                        {zone.orders} pedidos este mês
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{zone.avgTime}</div>
                      <div className="text-sm text-muted-foreground">tempo médio</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Resumo de avaliações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Resumo de Avaliações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <div className="text-4xl font-bold">4.8</div>
                  <div className="flex justify-center">
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} className="h-5 w-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Baseado em 342 avaliações
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Avaliações recentes */}
            <Card>
              <CardHeader>
                <CardTitle>Avaliações Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customerReviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{review.customer}</div>
                        <div className="flex">
                          {[1,2,3,4,5].map((star) => (
                            <Star 
                              key={star} 
                              className={`h-4 w-4 ${
                                star <= review.rating 
                                  ? 'text-yellow-500 fill-current' 
                                  : 'text-gray-300'
                              }`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {review.comment}
                      </p>
                      <div className="text-xs text-muted-foreground mt-2">
                        {new Date(review.date).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RestaurantAnalytics;