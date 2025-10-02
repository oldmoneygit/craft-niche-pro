import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit2, Trash2, ToggleLeft } from 'lucide-react';
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

  return (
    <PlatformPageWrapper title="Serviços">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Serviços</h1>
            <p className="text-muted-foreground">Gerencie os pacotes e planos que você oferece</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Serviço
          </Button>
        </div>

        {/* Services Grid */}
        {services.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum serviço cadastrado</h3>
              <p className="text-muted-foreground mb-4">Comece criando seu primeiro serviço</p>
              <Button onClick={() => handleOpenModal()}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Serviço
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card key={service.id} className={!service.active ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {service.name}
                        <Badge variant={service.active ? 'default' : 'secondary'}>
                          {service.active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {getDurationLabel(service.duration_type, service.duration_days)} • {getModalityLabel(service.modality)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      R$ {service.price.toFixed(2)}
                    </p>
                  </div>
                  
                  {service.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {service.description}
                    </p>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenModal(service)}
                      className="flex-1"
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(service)}
                    >
                      <ToggleLeft className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(service.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
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
