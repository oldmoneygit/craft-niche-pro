import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardTemplate from '@/core/layouts/DashboardTemplate';
import { useTenant } from '@/hooks/useTenant';
import { useClients } from '@/hooks/useClients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Edit, Trash2, Clock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const appointmentSchema = z.object({
  client_id: z.string().min(1, 'Cliente é obrigatório'),
  datetime: z.string().min(1, 'Data e hora são obrigatórias'),
  type: z.enum(['primeira_consulta', 'retorno']),
  notes: z.string().optional(),
});

interface Appointment {
  id: string;
  tenant_id: string;
  client_id: string;
  datetime: string;
  type: 'primeira_consulta' | 'retorno';
  status: 'agendado' | 'confirmado' | 'realizado' | 'cancelado';
  notes: string | null;
  created_at: string;
  updated_at: string;
  clients?: {
    name: string;
    email: string;
    phone: string;
  };
}

export default function PlatformScheduling() {
  const { clientId } = useParams<{ clientId: string }>();
  const { tenant, loading: tenantLoading } = useTenant(clientId || '');
  const { clients } = useClients(tenant?.id);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    client_id: '',
    datetime: '',
    type: 'primeira_consulta' as 'primeira_consulta' | 'retorno',
    notes: '',
  });
  const { toast } = useToast();

  const fetchAppointments = async () => {
    if (!tenant?.id) return;

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          clients!inner (
            name,
            email,
            phone
          )
        `)
        .eq('tenant_id', tenant.id)
        .order('datetime', { ascending: true });

      if (error) {
        console.error('Error fetching appointments:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os agendamentos.',
          variant: 'destructive',
        });
      } else {
        setAppointments((data || []) as Appointment[]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenant?.id) {
      fetchAppointments();
    }
  }, [tenant?.id]);

  const resetForm = () => {
    setFormData({
      client_id: '',
      datetime: '',
      type: 'primeira_consulta',
      notes: '',
    });
    setEditingAppointment(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = appointmentSchema.parse(formData);

      if (editingAppointment) {
        const { error } = await supabase
          .from('appointments')
          .update(validatedData)
          .eq('id', editingAppointment.id);

        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Agendamento atualizado com sucesso!' });
      } else {
        const { error } = await supabase
          .from('appointments')
          .insert([{
            client_id: validatedData.client_id,
            datetime: validatedData.datetime,
            type: validatedData.type,
            notes: validatedData.notes,
            tenant_id: tenant!.id,
          }]);

        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Agendamento criado com sucesso!' });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchAppointments();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Erro de validação',
          description: error.errors[0].message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Erro',
          description: 'Não foi possível salvar o agendamento.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      client_id: appointment.client_id,
      datetime: appointment.datetime.slice(0, 16), // Format for datetime-local input
      type: appointment.type,
      notes: appointment.notes || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar este agendamento?')) {
      try {
        const { error } = await supabase
          .from('appointments')
          .delete()
          .eq('id', id);

        if (error) throw error;

        toast({ title: 'Sucesso', description: 'Agendamento deletado com sucesso!' });
        fetchAppointments();
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Não foi possível deletar o agendamento.',
          variant: 'destructive',
        });
      }
    }
  };

  const updateStatus = async (id: string, status: Appointment['status']) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({ title: 'Sucesso', description: 'Status atualizado com sucesso!' });
      fetchAppointments();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status.',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado': return 'bg-blue-100 text-blue-800';
      case 'confirmado': return 'bg-green-100 text-green-800';
      case 'realizado': return 'bg-gray-100 text-gray-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    return type === 'primeira_consulta' ? 'Primeira Consulta' : 'Retorno';
  };

  if (tenantLoading) {
    return (
      <DashboardTemplate title="Agendamentos">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </DashboardTemplate>
    );
  }

  if (!tenant) {
    return (
      <DashboardTemplate title="Agendamentos">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Plataforma não encontrada</h1>
            <p className="text-muted-foreground">A plataforma solicitada não existe ou não está disponível.</p>
          </div>
        </div>
      </DashboardTemplate>
    );
  }

  return (
    <DashboardTemplate title="Agendamentos">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Agendamentos</h1>
            <p className="text-muted-foreground">Gerencie suas consultas e agendamentos</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="action-primary flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Novo Agendamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client_id">Cliente *</Label>
                  <Select
                    value={formData.client_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}
                  >
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
                
                <div className="space-y-2">
                  <Label htmlFor="datetime">Data e Hora *</Label>
                  <Input
                    id="datetime"
                    type="datetime-local"
                    value={formData.datetime}
                    onChange={(e) => setFormData(prev => ({ ...prev, datetime: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Consulta *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'primeira_consulta' | 'retorno') => 
                      setFormData(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primeira_consulta">Primeira Consulta</SelectItem>
                      <SelectItem value="retorno">Retorno</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Observações sobre a consulta..."
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="secondary" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="action-primary">
                    {editingAppointment ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Agendamentos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hoje</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {appointments.filter(apt => {
                  const today = new Date().toDateString();
                  const aptDate = new Date(apt.datetime).toDateString();
                  return today === aptDate;
                }).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {appointments.filter(apt => apt.status === 'confirmado').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Realizados</CardTitle>
              <Badge variant="outline" className="h-4 w-4 p-0" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {appointments.filter(apt => apt.status === 'realizado').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointments List */}
        <div className="grid gap-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : appointments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum agendamento encontrado</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Comece criando seu primeiro agendamento.
                </p>
                <Button onClick={() => setIsDialogOpen(true)} className="action-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Agendamento
                </Button>
              </CardContent>
            </Card>
          ) : (
            appointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">
                          {appointment.clients?.name || 'Cliente não encontrado'}
                        </h3>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                        <Badge variant="outline">
                          {getTypeLabel(appointment.type)}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>📅 {new Date(appointment.datetime).toLocaleDateString('pt-BR')}</p>
                        <p>🕐 {new Date(appointment.datetime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                        {appointment.clients?.email && <p>📧 {appointment.clients.email}</p>}
                        {appointment.clients?.phone && <p>📱 {appointment.clients.phone}</p>}
                        {appointment.notes && <p>📝 {appointment.notes}</p>}
                      </div>
                      <div className="flex gap-2 mt-3">
                        {appointment.status === 'agendado' && (
                          <Button size="sm" className="action-success" onClick={() => updateStatus(appointment.id, 'confirmado')}>
                            Confirmar
                          </Button>
                        )}
                        {appointment.status === 'confirmado' && (
                          <Button size="sm" className="action-primary" onClick={() => updateStatus(appointment.id, 'realizado')}>
                            Marcar como Realizado
                          </Button>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => updateStatus(appointment.id, 'cancelado')}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => handleEdit(appointment)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(appointment.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardTemplate>
  );
}