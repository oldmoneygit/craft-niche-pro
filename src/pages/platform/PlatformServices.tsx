import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit2, Trash2, ToggleLeft, CheckCircle2, XCircle, Monitor, Users, Laptop, Calendar } from 'lucide-react';
import PlatformPageWrapper from '@/core/layouts/PlatformPageWrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTenantId } from '@/hooks/useTenantId';
import { cn } from '@/lib/utils';

interface Service {
  id: string;
  name: string;
  duration_type: 'mensal' | 'trimestral' | 'semestral' | 'anual' | 'personalizado';
  duration_days: number | null;
  modality: 'presencial' | 'online' | 'hibrido';
  price: number;
  description: string | null;
  active: boolean;
}

const PlatformServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const { tenantId } = useTenantId();
  const { toast } = useToast();

  const [formData, setFormData] = useState<{
    name: string;
    duration_type: 'mensal' | 'trimestral' | 'semestral' | 'anual' | 'personalizado';
    duration_days: string;
    modality: 'presencial' | 'online' | 'hibrido';
    price: string;
    description: string;
  }>({
    name: '',
    duration_type: 'mensal',
    duration_days: '',
    modality: 'presencial',
    price: '',
    description: '',
  });

  useEffect(() => {
    if (tenantId) {
      fetchServices();
    }
  }, [tenantId]);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices((data || []) as Service[]);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: 'Erro ao carregar serviços',
        description: 'Não foi possível carregar a lista de serviços.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        duration_type: service.duration_type,
        duration_days: service.duration_days?.toString() || '',
        modality: service.modality,
        price: service.price.toString(),
        description: service.description || '',
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        duration_type: 'mensal',
        duration_days: '',
        modality: 'presencial',
        price: '',
        description: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const serviceData = {
        tenant_id: tenantId,
        name: formData.name,
        duration_type: formData.duration_type,
        duration_days: formData.duration_type === 'personalizado' ? parseInt(formData.duration_days) : null,
        modality: formData.modality,
        price: parseFloat(formData.price),
        description: formData.description || null,
      };

      if (editingService) {
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService.id);

        if (error) throw error;

        toast({
          title: 'Serviço atualizado',
          description: 'O serviço foi atualizado com sucesso.',
        });
      } else {
        const { error } = await supabase
          .from('services')
          .insert([serviceData]);

        if (error) throw error;

        toast({
          title: 'Serviço criado',
          description: 'O serviço foi criado com sucesso.',
        });
      }

      setIsModalOpen(false);
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      toast({
        title: 'Erro ao salvar serviço',
        description: 'Não foi possível salvar o serviço.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (service: Service) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ active: !service.active })
        .eq('id', service.id);

      if (error) throw error;

      toast({
        title: service.active ? 'Serviço desativado' : 'Serviço ativado',
        description: `O serviço foi ${service.active ? 'desativado' : 'ativado'} com sucesso.`,
      });

      fetchServices();
    } catch (error) {
      console.error('Error toggling service:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status do serviço.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      toast({
        title: 'Serviço excluído',
        description: 'O serviço foi excluído com sucesso.',
      });

      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o serviço.',
        variant: 'destructive',
      });
    }
  };

  const getDurationLabel = (type: string, days: number | null) => {
    const labels = {
      mensal: 'Mensal',
      trimestral: 'Trimestral',
      semestral: 'Semestral',
      anual: 'Anual',
      personalizado: `${days} dias`,
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getModalityLabel = (modality: string) => {
    const labels = {
      presencial: 'Presencial',
      online: 'Online',
      hibrido: 'Híbrido',
    };
    return labels[modality as keyof typeof labels] || modality;
  };

  if (loading) {
    return (
      <PlatformPageWrapper title="Serviços">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </PlatformPageWrapper>
    );
  }

  const getModalityIcon = (modality: string) => {
    const icons = {
      presencial: Users,
      online: Monitor,
      hibrido: Laptop,
    };
    return icons[modality as keyof typeof icons] || Package;
  };

  const getModalityColor = (modality: string) => {
    const colors = {
      presencial: 'border-l-blue-500',
      online: 'border-l-green-500',
      hibrido: 'border-l-purple-500',
    };
    return colors[modality as keyof typeof colors] || '';
  };

  const getModalityBadgeColor = (modality: string) => {
    const colors = {
      presencial: 'bg-blue-100 text-blue-700 border-blue-200',
      online: 'bg-green-100 text-green-700 border-green-200',
      hibrido: 'bg-purple-100 text-purple-700 border-purple-200',
    };
    return colors[modality as keyof typeof colors] || '';
  };

  return (
    <PlatformPageWrapper title="Serviços">
      <div className="space-y-6">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-8 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Serviços</h1>
              <p className="text-green-50 text-lg">Gerencie os pacotes e planos que você oferece</p>
            </div>
            <Button 
              onClick={() => handleOpenModal()} 
              size="lg"
              className="gap-2 bg-white text-green-600 hover:bg-green-50 shadow-md h-12 px-6"
            >
              <Plus className="h-5 w-5" />
              Novo Serviço
            </Button>
          </div>
        </div>

        {/* Services Grid */}
        {services.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="bg-green-100 p-6 rounded-full mb-6">
                <Package className="h-16 w-16 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Nenhum serviço cadastrado</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Comece criando seu primeiro serviço para oferecer aos seus clientes
              </p>
              <Button onClick={() => handleOpenModal()} size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Criar Primeiro Serviço
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const ModalityIcon = getModalityIcon(service.modality);
              
              return (
                <Card 
                  key={service.id} 
                  className={cn(
                    "border-l-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full",
                    getModalityColor(service.modality),
                    !service.active && 'opacity-60'
                  )}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge 
                        variant={service.active ? 'default' : 'secondary'}
                        className={cn(
                          "gap-1",
                          service.active 
                            ? "bg-green-100 text-green-700 border-green-200" 
                            : "bg-gray-100 text-gray-600 border-gray-200"
                        )}
                      >
                        {service.active ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            Ativo
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" />
                            Inativo
                          </>
                        )}
                      </Badge>
                      <Badge 
                        variant="outline"
                        className={getModalityBadgeColor(service.modality)}
                      >
                        <ModalityIcon className="h-3 w-3 mr-1" />
                        {getModalityLabel(service.modality)}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">
                      {service.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" />
                      {getDurationLabel(service.duration_type, service.duration_days)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                      <p className="text-sm text-green-700 font-medium mb-1">Valor do Pacote</p>
                      <p className="text-3xl font-bold text-green-600">
                        R$ {service.price.toFixed(2)}
                      </p>
                    </div>
                    
                    {service.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3 min-h-[3.5rem]">
                        {service.description}
                      </p>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenModal(service)}
                        className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        <Edit2 className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(service)}
                        className={cn(
                          "border-2",
                          service.active 
                            ? "border-gray-300 text-gray-600 hover:bg-gray-50" 
                            : "border-green-300 text-green-600 hover:bg-green-50"
                        )}
                      >
                        <ToggleLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(service.id)}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingService ? 'Editar Serviço' : 'Novo Serviço'}
              </DialogTitle>
              <DialogDescription>
                Preencha as informações do serviço abaixo
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Nome do Serviço *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Acompanhamento Trimestral"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="duration_type">Duração *</Label>
                  <Select
                    value={formData.duration_type}
                    onValueChange={(value: any) => setFormData({ ...formData, duration_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mensal">Mensal</SelectItem>
                      <SelectItem value="trimestral">Trimestral</SelectItem>
                      <SelectItem value="semestral">Semestral</SelectItem>
                      <SelectItem value="anual">Anual</SelectItem>
                      <SelectItem value="personalizado">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.duration_type === 'personalizado' && (
                  <div>
                    <Label htmlFor="duration_days">Dias *</Label>
                    <Input
                      id="duration_days"
                      type="number"
                      value={formData.duration_days}
                      onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                      placeholder="Ex: 45"
                      required
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="modality">Modalidade *</Label>
                  <Select
                    value={formData.modality}
                    onValueChange={(value: any) => setFormData({ ...formData, modality: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presencial">Presencial</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="hibrido">Híbrido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="price">Valor (R$) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Ex: 500.00"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva o que está incluso no serviço..."
                    rows={4}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingService ? 'Salvar Alterações' : 'Criar Serviço'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </PlatformPageWrapper>
  );
};

export default PlatformServices;
