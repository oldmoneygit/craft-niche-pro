import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Search, Calendar, User, Send, Printer, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import PlatformPageWrapper from '@/core/layouts/PlatformPageWrapper';
import { useMealPlans, MealPlan } from '@/hooks/useMealPlans';
import { useClients } from '@/hooks/useClients';
import { useTenant } from '@/hooks/useTenant';
import { useClientConfig } from '@/core/contexts/ClientConfigContext';
import { cn } from '@/lib/utils';

export default function PlatformMealPlans() {
  const { clientId } = useParams<{ clientId: string }>();
  const { tenant } = useTenant(clientId || 'gabriel-gandin');
  const { mealPlans, loading, createMealPlan, updateMealPlan, deleteMealPlan } = useMealPlans();
  const { clients } = useClients(tenant?.id);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MealPlan | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    client_id: '',
    start_date: new Date(),
    end_date: new Date(),
    status: 'ativo' as 'ativo' | 'concluido' | 'pausado',
    plan_data: {
      breakfast: [''],
      lunch: [''],
      dinner: [''],
      snacks: ['']
    }
  });

  const filteredPlans = mealPlans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClient = selectedClient === 'all' || plan.client_id === selectedClient;
    return matchesSearch && matchesClient;
  });

  const handleCreatePlan = async () => {
    if (!formData.name || !formData.client_id) return;

    const newPlan = await createMealPlan({
      name: formData.name,
      client_id: formData.client_id,
      start_date: format(formData.start_date, 'yyyy-MM-dd'),
      end_date: format(formData.end_date, 'yyyy-MM-dd'),
      status: formData.status,
      plan_data: formData.plan_data
    });

    if (newPlan) {
      setIsCreateModalOpen(false);
      resetForm();
    }
  };

  const handleUpdatePlan = async () => {
    if (!editingPlan) return;

    const updatedPlan = await updateMealPlan(editingPlan.id, {
      name: formData.name,
      client_id: formData.client_id,
      start_date: format(formData.start_date, 'yyyy-MM-dd'),
      end_date: format(formData.end_date, 'yyyy-MM-dd'),
      status: formData.status,
      plan_data: formData.plan_data
    });

    if (updatedPlan) {
      setEditingPlan(null);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      client_id: '',
      start_date: new Date(),
      end_date: new Date(),
      status: 'ativo',
      plan_data: {
        breakfast: [''],
        lunch: [''],
        dinner: [''],
        snacks: ['']
      }
    });
  };

  const startEdit = (plan: MealPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      client_id: plan.client_id,
      start_date: new Date(plan.start_date),
      end_date: new Date(plan.end_date),
      status: plan.status,
      plan_data: plan.plan_data
    });
  };

  const addMealItem = (mealType: keyof typeof formData.plan_data) => {
    setFormData(prev => ({
      ...prev,
      plan_data: {
        ...prev.plan_data,
        [mealType]: [...prev.plan_data[mealType], '']
      }
    }));
  };

  const updateMealItem = (mealType: keyof typeof formData.plan_data, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      plan_data: {
        ...prev.plan_data,
        [mealType]: prev.plan_data[mealType].map((item, i) => i === index ? value : item)
      }
    }));
  };

  const removeMealItem = (mealType: keyof typeof formData.plan_data, index: number) => {
    setFormData(prev => ({
      ...prev,
      plan_data: {
        ...prev.plan_data,
        [mealType]: prev.plan_data[mealType].filter((_, i) => i !== index)
      }
    }));
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Cliente não encontrado';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-500';
      case 'concluido': return 'bg-blue-500';
      case 'pausado': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const printMealPlan = (plan: MealPlan) => {
    const clientName = getClientName(plan.client_id);
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Plano Alimentar - ${plan.name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #0891b2;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .plan-title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #0891b2;
            }
            .client-info {
              font-size: 18px;
              margin-bottom: 5px;
            }
            .date-info {
              font-size: 14px;
              color: #666;
            }
            .meal-section {
              margin-bottom: 30px;
              break-inside: avoid;
            }
            .meal-title {
              font-size: 18px;
              font-weight: bold;
              background-color: #0891b2;
              color: white;
              padding: 10px;
              margin-bottom: 10px;
            }
            .meal-items {
              padding: 0 15px;
            }
            .meal-item {
              margin-bottom: 8px;
              padding: 5px 0;
              border-bottom: 1px solid #eee;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 15px;
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
              margin-bottom: 10px;
            }
            .status-ativo { background-color: #10b981; color: white; }
            .status-pausado { background-color: #f59e0b; color: white; }
            .status-concluido { background-color: #3b82f6; color: white; }
            @media print {
              body { margin: 0; }
              .header { page-break-after: avoid; }
              .meal-section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="plan-title">${plan.name}</div>
            <div class="client-info">Cliente: ${clientName}</div>
            <div class="date-info">
              Período: ${format(new Date(plan.start_date), 'dd/MM/yyyy', { locale: ptBR })} a ${format(new Date(plan.end_date), 'dd/MM/yyyy', { locale: ptBR })}
            </div>
            <span class="status-badge status-${plan.status}">
              ${plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
            </span>
          </div>

          <div class="meal-section">
            <div class="meal-title">☀️ Café da Manhã</div>
            <div class="meal-items">
              ${plan.plan_data.breakfast.filter(item => item.trim()).map(item => 
                `<div class="meal-item">• ${item}</div>`
              ).join('')}
            </div>
          </div>

          <div class="meal-section">
            <div class="meal-title">🌞 Almoço</div>
            <div class="meal-items">
              ${plan.plan_data.lunch.filter(item => item.trim()).map(item => 
                `<div class="meal-item">• ${item}</div>`
              ).join('')}
            </div>
          </div>

          <div class="meal-section">
            <div class="meal-title">🌙 Jantar</div>
            <div class="meal-items">
              ${plan.plan_data.dinner.filter(item => item.trim()).map(item => 
                `<div class="meal-item">• ${item}</div>`
              ).join('')}
            </div>
          </div>

          <div class="meal-section">
            <div class="meal-title">🍎 Lanches</div>
            <div class="meal-items">
              ${plan.plan_data.snacks.filter(item => item.trim()).map(item => 
                `<div class="meal-item">• ${item}</div>`
              ).join('')}
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  return (
    <PlatformPageWrapper title="Planos Alimentares">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Planos Alimentares</h1>
            <p className="text-muted-foreground">Gerencie os planos alimentares dos seus clientes</p>
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="action-primary" onClick={() => { resetForm(); setEditingPlan(null); }}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Plano
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPlan ? 'Editar Plano Alimentar' : 'Novo Plano Alimentar'}</DialogTitle>
                <DialogDescription>
                  {editingPlan ? 'Edite as informações do plano alimentar.' : 'Crie um novo plano alimentar para seu cliente.'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Plano</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Plano de Emagrecimento - Janeiro"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="client">Cliente</Label>
                    <Select value={formData.client_id} onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Data de Início</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="secondary" className="w-full justify-start text-left font-normal">
                          <Calendar className="mr-2 h-4 w-4" />
                          {format(formData.start_date, 'dd/MM/yyyy', { locale: ptBR })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={formData.start_date}
                          onSelect={(date) => date && setFormData(prev => ({ ...prev, start_date: date }))}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Data de Fim</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="secondary" className="w-full justify-start text-left font-normal">
                          <Calendar className="mr-2 h-4 w-4" />
                          {format(formData.end_date, 'dd/MM/yyyy', { locale: ptBR })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={formData.end_date}
                          onSelect={(date) => date && setFormData(prev => ({ ...prev, end_date: date }))}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="pausado">Pausado</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Tabs defaultValue="breakfast" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="breakfast">Café da Manhã</TabsTrigger>
                    <TabsTrigger value="lunch">Almoço</TabsTrigger>
                    <TabsTrigger value="dinner">Jantar</TabsTrigger>
                    <TabsTrigger value="snacks">Lanches</TabsTrigger>
                  </TabsList>
                  
                  {(['breakfast', 'lunch', 'dinner', 'snacks'] as const).map((mealType) => (
                    <TabsContent key={mealType} value={mealType} className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-lg font-medium">
                          {mealType === 'breakfast' && 'Café da Manhã'}
                          {mealType === 'lunch' && 'Almoço'}
                          {mealType === 'dinner' && 'Jantar'}
                          {mealType === 'snacks' && 'Lanches'}
                        </Label>
                        <Button type="button" className="action-primary" size="sm" onClick={() => addMealItem(mealType)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Item
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {formData.plan_data[mealType].map((item, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={item}
                              onChange={(e) => updateMealItem(mealType, index, e.target.value)}
                              placeholder={`Item ${index + 1}`}
                            />
                            {formData.plan_data[mealType].length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeMealItem(mealType, index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setEditingPlan(null);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="action-primary"
                    onClick={editingPlan ? handleUpdatePlan : handleCreatePlan}
                    disabled={!formData.name || !formData.client_id}
                  >
                    {editingPlan ? 'Salvar Alterações' : 'Criar Plano'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar planos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filtrar por cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os clientes</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPlans.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum plano encontrado</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm || selectedClient !== 'all'
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Comece criando seu primeiro plano alimentar.'}
              </p>
              {!searchTerm && selectedClient === 'all' && (
                <Button className="action-primary" onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeiro Plano
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => (
              <Card key={plan.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <CardDescription className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {getClientName(plan.client_id)}
                      </CardDescription>
                    </div>
                    <Badge className={cn('text-white', getStatusColor(plan.status))}>
                      {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {format(new Date(plan.start_date), 'dd/MM/yyyy', { locale: ptBR })} - {format(new Date(plan.end_date), 'dd/MM/yyyy', { locale: ptBR })}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <div className="font-medium text-foreground">{plan.plan_data.breakfast.filter(item => item.trim()).length}</div>
                        <div className="text-xs">Café</div>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <div className="font-medium text-foreground">{plan.plan_data.lunch.filter(item => item.trim()).length}</div>
                        <div className="text-xs">Almoço</div>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <div className="font-medium text-foreground">{plan.plan_data.dinner.filter(item => item.trim()).length}</div>
                        <div className="text-xs">Jantar</div>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <div className="font-medium text-foreground">{plan.plan_data.snacks.filter(item => item.trim()).length}</div>
                        <div className="text-xs">Lanches</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <div className="flex gap-1">
                    <Button variant="secondary" size="sm" onClick={() => startEdit(plan)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => printMealPlan(plan)}>
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button variant="secondary" size="sm">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => deleteMealPlan(plan.id)}
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingPlan} onOpenChange={(open) => !open && setEditingPlan(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Plano Alimentar</DialogTitle>
            <DialogDescription>
              Edite as informações do plano alimentar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome do Plano</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-client">Cliente</Label>
                <Select value={formData.client_id} onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de Início</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="secondary" className="w-full justify-start text-left font-normal">
                      <Calendar className="mr-2 h-4 w-4" />
                      {format(formData.start_date, 'dd/MM/yyyy', { locale: ptBR })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={formData.start_date}
                      onSelect={(date) => date && setFormData(prev => ({ ...prev, start_date: date }))}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Data de Fim</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="secondary" className="w-full justify-start text-left font-normal">
                      <Calendar className="mr-2 h-4 w-4" />
                      {format(formData.end_date, 'dd/MM/yyyy', { locale: ptBR })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={formData.end_date}
                      onSelect={(date) => date && setFormData(prev => ({ ...prev, end_date: date }))}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="pausado">Pausado</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Tabs defaultValue="breakfast" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="breakfast">Café da Manhã</TabsTrigger>
                <TabsTrigger value="lunch">Almoço</TabsTrigger>
                <TabsTrigger value="dinner">Jantar</TabsTrigger>
                <TabsTrigger value="snacks">Lanches</TabsTrigger>
              </TabsList>
              
              {(['breakfast', 'lunch', 'dinner', 'snacks'] as const).map((mealType) => (
                <TabsContent key={mealType} value={mealType} className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-lg font-medium">
                      {mealType === 'breakfast' && 'Café da Manhã'}
                      {mealType === 'lunch' && 'Almoço'}
                      {mealType === 'dinner' && 'Jantar'}
                      {mealType === 'snacks' && 'Lanches'}
                    </Label>
                    <Button type="button" className="action-primary" size="sm" onClick={() => addMealItem(mealType)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Item
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {formData.plan_data[mealType].map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={item}
                          onChange={(e) => updateMealItem(mealType, index, e.target.value)}
                          placeholder="Ex: Pão integral com ovos"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => removeMealItem(mealType, index)}
                          className="shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditingPlan(null);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button
                className="action-primary"
                onClick={handleUpdatePlan}
                disabled={!formData.name || !formData.client_id}
              >
                Salvar Alterações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PlatformPageWrapper>
  );
}