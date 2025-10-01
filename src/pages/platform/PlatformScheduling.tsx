import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import DashboardTemplate from '@/core/layouts/DashboardTemplate';
import { useTenant } from '@/hooks/useTenant';
import { useClients } from '@/hooks/useClients';
import { useClientConfig } from '@/core/contexts/ClientConfigContext';
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
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

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
  const location = useLocation();
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
    value: '',
    payment_status: 'pending',
    payment_method: '',
    payment_date: '',
    payment_notes: ''
  });
  const { toast } = useToast();

  // Handle prefilled data from leads
  useEffect(() => {
    if (location.state?.prefilledClientId) {
      setFormData(prev => ({
        ...prev,
        client_id: location.state.prefilledClientId,
        notes: location.state.prefilledNotes || ''
      }));
      setIsDialogOpen(true);
    }
  }, [location.state]);

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
      value: '',
      payment_status: 'pending',
      payment_method: '',
      payment_date: '',
      payment_notes: ''
    });
    setEditingAppointment(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = appointmentSchema.parse(formData);
      
      // Convert local datetime to UTC, preserving the actual time entered by the user
      const localDateTime = new Date(validatedData.datetime);
      const utcDateTime = fromZonedTime(localDateTime, 'America/Sao_Paulo');

      if (editingAppointment) {
        const { error } = await supabase
          .from('appointments')
          .update({
            ...validatedData,
            datetime: utcDateTime.toISOString(),
            value: formData.value ? parseFloat(formData.value) : null,
            payment_status: formData.payment_status,
            payment_method: formData.payment_method || null,
            payment_date: formData.payment_date || null,
            payment_notes: formData.payment_notes || null
          })
          .eq('id', editingAppointment.id);

        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Agendamento atualizado com sucesso!' });
      } else {
        const { error } = await supabase
          .from('appointments')
          .insert([{
            client_id: validatedData.client_id,
            datetime: utcDateTime.toISOString(),
            type: validatedData.type,
            notes: validatedData.notes,
            tenant_id: tenant!.id,
            value: formData.value ? parseFloat(formData.value) : null,
            payment_status: formData.payment_status,
            payment_method: formData.payment_method || null,
            payment_date: formData.payment_date || null,
            payment_notes: formData.payment_notes || null
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
    
    // Convert UTC datetime to local timezone for the datetime-local input
    const utcDate = new Date(appointment.datetime);
    const localDate = toZonedTime(utcDate, 'America/Sao_Paulo');
    const formattedDate = localDate.toISOString().slice(0, 16);
    
    setFormData({
      client_id: appointment.client_id,
      datetime: formattedDate,
      type: appointment.type,
      notes: appointment.notes || '',
      value: (appointment as any).value?.toString() || '',
      payment_status: (appointment as any).payment_status || 'pending',
      payment_method: (appointment as any).payment_method || '',
      payment_date: (appointment as any).payment_date || '',
      payment_notes: (appointment as any).payment_notes || ''
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

                {/* Seção Financeira */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    💰 Informações Financeiras
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="value">Valor da Consulta</Label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          R$
                        </span>
                        <Input
                          id="value"
                          type="number"
                          step="0.01"
                          value={formData.value}
                          onChange={e => setFormData({...formData, value: e.target.value})}
                          placeholder="0,00"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="payment_status">Status do Pagamento</Label>
                      <Select
                        value={formData.payment_status}
                        onValueChange={(value) => setFormData({...formData, payment_status: value})}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="paid">Pago</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                          <SelectItem value="refunded">Reembolsado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {formData.payment_status === 'paid' && (
                    <>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <Label htmlFor="payment_method">Forma de Pagamento</Label>
                          <Select
                            value={formData.payment_method}
                            onValueChange={(value) => setFormData({...formData, payment_method: value})}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="dinheiro">Dinheiro</SelectItem>
                              <SelectItem value="pix">PIX</SelectItem>
                              <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                              <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                              <SelectItem value="transferencia">Transferência</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="payment_date">Data do Pagamento</Label>
                          <Input
                            id="payment_date"
                            type="date"
                            value={formData.payment_date}
                            onChange={e => setFormData({...formData, payment_date: e.target.value})}
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <Label htmlFor="payment_notes">Observações do Pagamento (opcional)</Label>
                        <Textarea
                          id="payment_notes"
                          value={formData.payment_notes}
                          onChange={e => setFormData({...formData, payment_notes: e.target.value})}
                          placeholder="Ex: Recebido via PIX"
                          rows={2}
                          className="mt-1"
                        />
                      </div>
                    </>
                  )}
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
                        <p>📅 {toZonedTime(new Date(appointment.datetime), 'America/Sao_Paulo').toLocaleDateString('pt-BR')}</p>
                        <p>🕐 {toZonedTime(new Date(appointment.datetime), 'America/Sao_Paulo').toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                        {appointment.clients?.email && <p>📧 {appointment.clients.email}</p>}
                        {appointment.clients?.phone && <p>📱 {appointment.clients.phone}</p>}
                        {appointment.notes && <p>📝 {appointment.notes}</p>}
                      </div>
                      {(appointment as any).value && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm font-bold text-foreground">
                            R$ {((appointment as any).value as number).toFixed(2)}
                          </span>
                          <Badge className={
                            (appointment as any).payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                            (appointment as any).payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {(appointment as any).payment_status === 'paid' ? '✓ Pago' :
                             (appointment as any).payment_status === 'pending' ? '⏱ Pendente' :
                             '✗ Cancelado'}
                          </Badge>
                        </div>
                      )}
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