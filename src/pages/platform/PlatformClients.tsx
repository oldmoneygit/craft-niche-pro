import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import PlatformPageWrapper from '@/core/layouts/PlatformPageWrapper';
import { useTenant } from '@/hooks/useTenant';
import { useClients } from '@/hooks/useClients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Trash2, User, Send, FileText, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import ClientStats from '@/components/platform/ClientStats';
import { supabase } from '@/integrations/supabase/client';
import { useClientConfig } from '@/core/contexts/ClientConfigContext';
import { ClientDetailsModal } from '@/components/platform/ClientDetailsModal';

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
  const location = useLocation();
  const navigate = useNavigate();
  const { clientConfig } = useClientConfig();
  const filterType = location.state?.filter;
  
  // Use gabriel-gandin as fallback if clientId is invalid
  const actualClientId = clientId && clientId !== ':clientId' ? clientId : 'gabriel-gandin';
  
  const { tenant, loading: tenantLoading } = useTenant(actualClientId);
  const { clients, loading: clientsLoading, createClient, updateClient, deleteClient, refetch: fetchClients } = useClients(tenant?.id);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState<string>(filterType || 'all');
  const [inactiveClients, setInactiveClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [clientQuestionnaires, setClientQuestionnaires] = useState<any[]>([]);
  const [selectedQuestionnaireResponse, setSelectedQuestionnaireResponse] = useState<any>(null);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [selectedClientForDetails, setSelectedClientForDetails] = useState<any>(null);
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

  useEffect(() => {
    if (filterType === 'inactive' && clients.length > 0) {
      filterInactiveClients();
    }
  }, [filterType, clients]);

  const fetchClientQuestionnaires = async (clientId: string) => {
    const { data } = await supabase
      .from('questionnaire_responses')
      .select(`
        *,
        questionnaires(id, title, description)
      `)
      .eq('client_id', clientId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false });

    setClientQuestionnaires(data || []);
  };

  const openQuestionnaireModal = async (responseId: string) => {
    try {
      // Buscar resposta completa com dados do questionário
      const { data: response } = await supabase
        .from('questionnaire_responses')
        .select(`
          *,
          questionnaires(id, title, description, questions)
        `)
        .eq('id', responseId)
        .single();

      if (response) {
        setSelectedQuestionnaireResponse(response);
        setIsResponseModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching response details:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as respostas",
        variant: "destructive"
      });
    }
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (cleaned.length === 10) {
      return cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
    }
    return phone;
  };

  useEffect(() => {
    if (selectedClientId) {
      fetchClientQuestionnaires(selectedClientId);
    }
  }, [selectedClientId]);

  const filterInactiveClients = async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const inactive = [];

    for (const client of clients) {
      const { data: appointments } = await supabase
        .from('appointments')
        .select('datetime, status')
        .eq('client_id', client.id)
        .eq('status', 'realizado')
        .order('datetime', { ascending: false })
        .limit(1);

      if (appointments && appointments.length > 0) {
        const lastDate = new Date(appointments[0].datetime);
        if (lastDate < thirtyDaysAgo) {
          const daysInactive = Math.floor((new Date().getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          
          inactive.push({
            ...client,
            lastAppointmentDate: lastDate,
            daysInactive
          });
        }
      }
    }

    inactive.sort((a, b) => b.daysInactive - a.daysInactive);
    setInactiveClients(inactive);
    setActiveFilter('inactive');
  };

  const handleSendFollowUp = (client: any) => {
    const daysText = client.daysInactive 
      ? `Faz ${client.daysInactive} dias que não nos falamos` 
      : 'Faz um tempo que não nos falamos';

    const message = `Olá ${client.name}! ${daysText} 😊\n\nComo você está? Gostaria de agendar um retorno para avaliarmos sua evolução?\n\nEstou aqui para te ajudar!`;
    
    const whatsappLink = `https://wa.me/55${client.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, '_blank');

    toast({
      title: "WhatsApp Aberto",
      description: `Mensagem de follow-up para ${client.name}`
    });
  };

  const displayedClients = activeFilter === 'inactive' ? inactiveClients : clients;

  const filteredClients = displayedClients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

  const handleEdit = (client: any) => {
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

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar este cliente?')) {
      await deleteClient(id);
    }
  };

  console.log('PlatformClients - ClientId:', actualClientId);
  console.log('PlatformClients - Tenant:', tenant);
  console.log('PlatformClients - Clients:', clients.length);

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
            <p className="text-sm text-muted-foreground mt-2">ClientId: {actualClientId}</p>
          </div>
        </div>
      </PlatformPageWrapper>
    );
  }

  return (
    <PlatformPageWrapper title="Clientes">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
            <p className="text-muted-foreground">Gerencie seus clientes e pacientes</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="action-primary flex items-center gap-2" onClick={resetForm}>
                <Plus className="w-4 h-4" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
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
                    <Label htmlFor="height">Altura (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allergies">Alergias/Restrições</Label>
                  <Textarea
                    id="allergies"
                    value={formData.allergies}
                    onChange={(e) => setFormData(prev => ({ ...prev, allergies: e.target.value }))}
                    placeholder="Ex: Lactose, glúten..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="secondary" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button className="action-primary" type="submit">
                    {editingClient ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar clientes por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Filtros */}
        <div className="flex gap-2">
          <Button
            onClick={() => setActiveFilter('all')}
            variant={activeFilter === 'all' ? 'default' : 'outline'}
            size="sm"
          >
            Todos ({clients.length})
          </Button>
          <Button
            onClick={() => filterInactiveClients()}
            variant={activeFilter === 'inactive' ? 'default' : 'outline'}
            size="sm"
            className={activeFilter === 'inactive' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
          >
            Inativos ({inactiveClients.length})
          </Button>
        </div>

        {activeFilter === 'inactive' && inactiveClients.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              ⚠️ Mostrando clientes há mais de 30 dias sem consulta
            </p>
          </div>
        )}

        {/* Stats */}
        <ClientStats clients={clients} />

        {/* Clients List */}
        <div className="grid gap-4">
          {clientsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredClients.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <User className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum cliente encontrado</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchTerm ? 'Nenhum cliente corresponde à sua busca.' : 'Comece adicionando seu primeiro cliente.'}
                </p>
                {!searchTerm && (
                  <Button className="action-primary" onClick={() => setIsDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Cliente
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredClients.map((client) => (
              <Card 
                key={client.id} 
                onClick={() => setSelectedClientForDetails(client)}
                className={`hover:shadow-md transition-shadow relative cursor-pointer ${
                  activeFilter === 'inactive' ? 'border-2 border-yellow-300' : ''
                }`}
              >
                <CardContent className="pt-6">
                  {activeFilter === 'inactive' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendFollowUp(client);
                      }}
                      className="absolute top-3 right-3 p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition z-10"
                      title="Enviar mensagem de follow-up"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                  <div className="flex justify-between items-start">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{client.name}</h3>
                            {activeFilter === 'inactive' && client.daysInactive && (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                {client.daysInactive} dias inativo
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Cliente desde {new Date(client.created_at).toLocaleDateString('pt-BR')}
                          </p>
                          {activeFilter === 'inactive' && client.lastAppointmentDate && (
                            <p className="text-xs text-gray-500 mt-1">
                              Última consulta: {new Date(client.lastAppointmentDate).toLocaleDateString('pt-BR')}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                        {client.email && (
                          <div className="flex items-center gap-2">
                            <span>📧</span>
                            <span>{client.email}</span>
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center gap-2">
                            <span>📱</span>
                            <span>{client.phone}</span>
                          </div>
                        )}
                        {client.birth_date && (
                          <div className="flex items-center gap-2">
                            <span>🎂</span>
                            <span>{new Date(client.birth_date).toLocaleDateString('pt-BR')}</span>
                          </div>
                        )}
                        {(client.weight_current || client.height) && (
                          <div className="flex items-center gap-2">
                            <span>📏</span>
                            <span>
                              {client.weight_current && `${client.weight_current}kg`}
                              {client.weight_current && client.height && ' • '}
                              {client.height && `${client.height}cm`}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {client.goal && (
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-sm">
                            <span className="font-medium">🎯 Objetivo:</span> {client.goal}
                          </p>
                        </div>
                      )}
                      
                      {client.allergies && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <p className="text-sm text-yellow-800">
                            <span className="font-medium">⚠️ Restrições:</span> {client.allergies}
                          </p>
                        </div>
                      )}

                      {/* Seção de Questionários Respondidos */}
                      {selectedClientId === client.id && clientQuestionnaires.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Questionários Respondidos ({clientQuestionnaires.length})
                          </h4>
                          
                          <div className="space-y-2">
                            {clientQuestionnaires.map(response => (
                              <div key={response.id} className="bg-gray-50 rounded-lg p-3 border text-sm">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className="font-semibold text-gray-900">
                                      {response.questionnaires.title}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">
                                      Respondido em {new Date(response.completed_at).toLocaleDateString('pt-BR', {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openQuestionnaireModal(response.id);
                                    }}
                                    className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-white ml-2"
                                  >
                                    Ver Respostas
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className={`flex gap-2 ${activeFilter === 'inactive' ? 'mt-8' : ''}`}>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (selectedClientId === client.id) {
                            setSelectedClientId(null);
                          } else {
                            setSelectedClientId(client.id);
                          }
                        }} 
                        className="h-8 px-3"
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        {selectedClientId === client.id ? 'Ocultar' : 'Questionários'}
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleEdit(client)} className="h-8 w-8 p-0">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(client.id)} className="h-8 w-8 p-0">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Botão flutuante de ação em massa */}
        {activeFilter === 'inactive' && inactiveClients.length > 0 && (
          <div className="fixed bottom-6 right-6 z-50">
            <Button
              onClick={() => {
                if (confirm(`Enviar mensagem de follow-up para ${inactiveClients.length} clientes?`)) {
                  inactiveClients.forEach((client, index) => {
                    setTimeout(() => {
                      handleSendFollowUp(client);
                    }, index * 2000);
                  });
                }
              }}
              className="bg-green-500 text-white hover:bg-green-600 px-6 py-3 rounded-full shadow-lg flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Enviar para Todos ({inactiveClients.length})
            </Button>
          </div>
        )}

        {/* Modal Ver Respostas do Cliente */}
        {isResponseModalOpen && selectedQuestionnaireResponse && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">
                      {selectedQuestionnaireResponse.questionnaires.title}
                    </h3>
                    <p className="text-green-100 mt-1">
                      Respondido por {selectedQuestionnaireResponse.respondent_name}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsResponseModalOpen(false);
                      setSelectedQuestionnaireResponse(null);
                    }}
                    className="text-white hover:bg-white/20 rounded-lg p-2 transition"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Informações do Respondente */}
              <div className="bg-gray-50 border-b p-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 text-xs uppercase">Nome</p>
                    <p className="font-semibold">{selectedQuestionnaireResponse.respondent_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs uppercase">Telefone</p>
                    <p className="font-semibold">{formatPhone(selectedQuestionnaireResponse.respondent_phone)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs uppercase">E-mail</p>
                    <p className="font-semibold">{selectedQuestionnaireResponse.respondent_email || 'Não informado'}</p>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  Respondido em {new Date(selectedQuestionnaireResponse.completed_at).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              {/* Respostas */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {selectedQuestionnaireResponse.questionnaires.questions.map((question: any, index: number) => {
                    const answer = selectedQuestionnaireResponse.answers[question.id];
                    
                    return (
                      <div key={question.id} className="border-b pb-4 last:border-b-0">
                        <p className="font-semibold text-gray-900 mb-2">
                          {index + 1}. {question.question}
                          {question.required && <span className="text-red-500 ml-1">*</span>}
                        </p>
                        <p className="text-xs text-gray-500 mb-3">
                          Tipo: {
                            question.type === 'text' ? 'Resposta curta' :
                            question.type === 'textarea' ? 'Resposta longa' :
                            question.type === 'radio' ? 'Múltipla escolha' :
                            question.type === 'checkbox' ? 'Caixas de seleção' :
                            'Escala (1-10)'
                          }
                        </p>
                        
                        <div className="bg-green-50 rounded-lg p-4">
                          {question.type === 'checkbox' && Array.isArray(answer) ? (
                            <ul className="list-disc list-inside space-y-1">
                              {answer.map((item: string, i: number) => (
                                <li key={i} className="text-gray-900">{item}</li>
                              ))}
                            </ul>
                          ) : question.type === 'scale' ? (
                            <div className="flex items-center gap-3">
                              <span className="text-4xl font-bold text-green-600">{answer}</span>
                              <span className="text-gray-600 text-lg">/ 10</span>
                            </div>
                          ) : (
                            <p className="text-gray-900 whitespace-pre-wrap">
                              {answer || 'Não respondido'}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t p-4 bg-gray-50 flex justify-end">
                <button
                  onClick={() => {
                    setIsResponseModalOpen(false);
                    setSelectedQuestionnaireResponse(null);
                  }}
                  className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de detalhes */}
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