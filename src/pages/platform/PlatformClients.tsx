import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PlatformPageWrapper from '@/core/layouts/PlatformPageWrapper';
import { useTenant } from '@/hooks/useTenant';
import { useClients } from '@/hooks/useClients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Trash2, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { ClientDetailsModal } from '@/components/platform/ClientDetailsModal';
import { calculateDaysRemaining } from '@/lib/serviceCalculations';

const clientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  birth_date: z.string().optional(),
  weight_current: z.number().positive('Peso deve ser positivo').optional(),
  height: z.number().positive('Altura deve ser positiva').optional(),
  goal: z.string().optional(),
  allergies: z.string().optional(),
});

export default function PlatformClients() {
  const { clientId } = useParams<{ clientId: string }>();
  const actualClientId = clientId && clientId !== ':clientId' ? clientId : 'gabriel-gandin';
  
  const { tenant, loading: tenantLoading } = useTenant(actualClientId);
  const { clients, loading: clientsLoading, createClient, updateClient, deleteClient, refetch: fetchClients } = useClients(tenant?.id);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedClientForDetails, setSelectedClientForDetails] = useState<any>(null);
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);
  const [clientServices, setClientServices] = useState<Record<string, any[]>>({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birth_date: '',
    weight_current: '',
    height: '',
    goal: '',
    allergies: '',
  });
  const { toast } = useToast();

  // Calcular ativos vs inativos E buscar serviços
  useEffect(() => {
    const calculateActiveStatus = async () => {
      if (!clients.length) {
        setActiveCount(0);
        setInactiveCount(0);
        return;
      }

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      let active = 0;
      let inactive = 0;
      const servicesMap: Record<string, any[]> = {};

      for (const client of clients) {
        const { data: appointments } = await supabase
          .from('appointments')
          .select('datetime')
          .eq('client_id', client.id)
          .order('datetime', { ascending: false })
          .limit(1);

        if (appointments && appointments.length > 0) {
          const lastDate = new Date(appointments[0].datetime);
          if (lastDate >= thirtyDaysAgo) {
            active++;
          } else {
            inactive++;
          }
        } else {
          inactive++;
        }

        // Buscar serviços ativos do cliente
        const { data: activeServices } = await supabase
          .from('service_subscriptions')
          .select('*, services(name, modality)')
          .eq('client_id', client.id)
          .eq('status', 'active')
          .order('start_date', { ascending: false });

        if (activeServices) {
          servicesMap[client.id] = activeServices;
        }
      }

      setActiveCount(active);
      setInactiveCount(inactive);
      setClientServices(servicesMap);
    };

    calculateActiveStatus();
  }, [clients]);

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return '';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} anos`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const newThisMonth = clients.filter(client => {
    const created = new Date(client.created_at);
    const now = new Date();
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length;

  // Filtrar clientes
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.phone && client.phone.includes(searchTerm));
    
    // Por simplicidade, não implementamos filtro ativo/inativo ainda
    return matchesSearch;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      birth_date: '',
      weight_current: '',
      height: '',
      goal: '',
      allergies: '',
    });
    setEditingClient(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = clientSchema.parse({
        ...formData,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        birth_date: formData.birth_date || undefined,
        weight_current: formData.weight_current ? parseFloat(formData.weight_current) : undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
        goal: formData.goal || undefined,
        allergies: formData.allergies || undefined,
      });

      if (editingClient) {
        await updateClient(editingClient.id, validatedData);
      } else {
        await createClient({
          name: validatedData.name,
          email: validatedData.email || null,
          phone: validatedData.phone || null,
          birth_date: validatedData.birth_date || null,
          weight_current: validatedData.weight_current || null,
          height: validatedData.height || null,
          goal: validatedData.goal || null,
          allergies: validatedData.allergies || null,
          tenant_id: tenant!.id,
        });
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Erro de validação',
          description: error.errors[0].message,
          variant: 'destructive',
        });
      }
    }
  };

  const handleEdit = (client: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingClient(client);
    setFormData({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      birth_date: client.birth_date || '',
      weight_current: client.weight_current?.toString() || '',
      height: client.height?.toString() || '',
      goal: client.goal || '',
      allergies: client.allergies || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja deletar este cliente?')) {
      await deleteClient(id);
    }
  };

  if (tenantLoading) {
    return (
      <PlatformPageWrapper title="Clientes">
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando clientes...</p>
          </div>
        </div>
      </PlatformPageWrapper>
    );
  }

  if (!tenant) {
    return (
      <PlatformPageWrapper title="Clientes">
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Plataforma não encontrada</h1>
            <p className="text-muted-foreground">A plataforma "{actualClientId}" não existe ou não está disponível.</p>
          </div>
        </div>
      </PlatformPageWrapper>
    );
  }

  return (
    <PlatformPageWrapper title="Clientes">
      <div className="min-h-screen bg-gray-50/50 p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Clientes</h1>
          <p className="text-gray-600">Gerencie todos os seus pacientes em um só lugar</p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-blue-700 mb-1">Total de Clientes</p>
                <p className="text-4xl font-bold text-blue-700">{clients.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Novos este mês */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-green-700 mb-1">Novos Este Mês</p>
                <p className="text-4xl font-bold text-green-700">{newThisMonth}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Plus className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Ativos */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-orange-700 mb-1">Ativos</p>
                <p className="text-4xl font-bold text-orange-700">{activeCount}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <User className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Inativos */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Inativos</p>
                <p className="text-4xl font-bold text-gray-700">{inactiveCount}</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <User className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Busca */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Buscar por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-0 focus-visible:ring-0"
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setActiveFilter('all')}
            className={activeFilter === 'all' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
          >
            Todos
          </Button>
          <Button
            onClick={() => setActiveFilter('active')}
            className={activeFilter === 'active' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
          >
            Ativos
          </Button>
          <Button
            onClick={() => setActiveFilter('inactive')}
            className={activeFilter === 'inactive' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
          >
            Inativos
          </Button>
        </div>

        {/* Lista de Clientes */}
        <div className="space-y-3">
          {clientsLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum cliente encontrado</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Tente ajustar os filtros ou buscar com outros termos' : 'Adicione seu primeiro cliente'}
              </p>
            </div>
          ) : (
            filteredClients.map(client => (
              <div 
                key={client.id} 
                onClick={() => setSelectedClientForDetails(client)}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  {/* Avatar e Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {getInitials(client.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 text-lg">{client.name}</h3>
                        {client.birth_date && (
                          <span className="text-sm text-gray-500">{calculateAge(client.birth_date)}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="truncate">{client.email || 'Sem email'}</span>
                      </div>
                      
                      {/* Badges de Serviços Ativos */}
                      {clientServices[client.id] && clientServices[client.id].length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {clientServices[client.id].map((sub: any) => {
                            const daysRemaining = calculateDaysRemaining(sub.end_date);
                            return (
                              <Badge 
                                key={sub.id}
                                variant={daysRemaining > 14 ? 'default' : daysRemaining >= 7 ? 'secondary' : 'destructive'}
                                className="text-xs"
                              >
                                {sub.services?.name} • {daysRemaining}d
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ações (visíveis no hover) */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleEdit(client, e)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(client.id, e)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Ícone principal (sempre visível) */}
                  <div className="shrink-0 ml-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                      <User className="w-5 h-5 text-gray-500 group-hover:text-emerald-600" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Botão FAB - Adicionar Cliente */}
        <button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
          className="fixed bottom-8 right-8 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-full p-5 shadow-xl hover:shadow-2xl transition-all hover:scale-110 z-50"
          title="Adicionar novo cliente"
        >
          <Plus className="w-7 h-7" />
        </button>

        {/* Modal de Adicionar/Editar Cliente */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birth_date">Data de Nascimento</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight_current">Peso Atual (kg)</Label>
                  <Input
                    id="weight_current"
                    type="number"
                    step="0.1"
                    value={formData.weight_current}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight_current: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Altura (m)</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.01"
                    value={formData.height}
                    onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                    placeholder="Ex: 1.75"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal">Objetivo</Label>
                <Textarea
                  id="goal"
                  value={formData.goal}
                  onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))}
                  placeholder="Ex: Perder peso, ganhar massa muscular..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allergies">Alergias/Restrições</Label>
                <Textarea
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) => setFormData(prev => ({ ...prev, allergies: e.target.value }))}
                  placeholder="Ex: Lactose, glúten..."
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600">
                  {editingClient ? 'Atualizar' : 'Criar Cliente'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal de Detalhes do Cliente */}
        {selectedClientForDetails && (
          <ClientDetailsModal
            client={selectedClientForDetails}
            onClose={() => setSelectedClientForDetails(null)}
            onUpdate={() => {
              fetchClients();
              setSelectedClientForDetails(null);
            }}
          />
        )}
      </div>
    </PlatformPageWrapper>
  );
}
