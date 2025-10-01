import { useState, useEffect } from 'react';
import { Users, Phone, Calendar, Check, X, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import DashboardTemplate from '@/core/layouts/DashboardTemplate';
import { useClientConfig } from '@/core/contexts/ClientConfigContext';

interface Lead {
  id: string;
  tenant_id: string;
  name: string;
  phone: string;
  email?: string;
  preferred_datetime?: string;
  preferred_time_description?: string;
  source: string;
  conversation_summary?: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export default function PlatformLeads() {
  const { tenantId } = useTenantId();
  const { clientConfig } = useClientConfig();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    if (tenantId) fetchLeads();
  }, [tenantId, filter]);

  const fetchLeads = async () => {
    if (!tenantId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('status', filter)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: "Erro", description: "Não foi possível carregar leads", variant: "destructive" });
    } else {
      setLeads(data || []);
    }
    setLoading(false);
  };

  const handleContact = async (lead: Lead) => {
    const message = `Olá ${lead.name}! Aqui é do consultório de nutrição. Vi que você tem interesse em agendar uma consulta. Podemos conversar?`;
    const whatsappLink = `https://wa.me/55${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, '_blank');

    // Atualizar status para "contacted"
    await updateLeadStatus(lead.id, 'contacted');
  };

  const handleSchedule = async (lead: Lead) => {
    if (!clientConfig?.subdomain) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar configuração",
        variant: "destructive"
      });
      return;
    }

    try {
      // Verificar se já existe cliente com esse telefone
      const { data: existingClients } = await supabase
        .from('clients')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('phone', lead.phone)
        .maybeSingle();

      let clientId = existingClients?.id;

      if (!clientId) {
        // Criar cliente novo
        const { data: newClient, error } = await supabase
          .from('clients')
          .insert({
            tenant_id: tenantId,
            name: lead.name,
            phone: lead.phone,
            email: lead.email || null
          })
          .select()
          .single();

        if (error) {
          toast({
            title: "Erro",
            description: "Não foi possível criar cliente",
            variant: "destructive"
          });
          return;
        }

        clientId = newClient.id;
      }

      // Atualizar status do lead para "scheduled"
      await supabase
        .from('leads')
        .update({ status: 'scheduled' })
        .eq('id', lead.id);

      // Navegar para agendamentos com dados pré-preenchidos
      navigate(`/platform/${clientConfig.subdomain}/appointments`, {
        state: {
          prefilledClientId: clientId,
          prefilledNotes: `Lead convertido - Horário preferido: ${lead.preferred_time_description}`
        }
      });

      toast({
        title: "Redirecionando",
        description: "Abrindo página de agendamentos..."
      });
    } catch (error) {
      console.error('Error scheduling lead:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar o agendamento",
        variant: "destructive"
      });
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    const { error } = await supabase
      .from('leads')
      .update({ status: newStatus })
      .eq('id', leadId);

    if (error) {
      toast({ title: "Erro", description: "Não foi possível atualizar", variant: "destructive" });
    } else {
      toast({ title: "Atualizado", description: `Lead marcado como ${newStatus}` });
      fetchLeads();
    }
  };

  const pendingCount = leads.filter(l => l.status === 'pending').length;
  const contactedCount = leads.filter(l => l.status === 'contacted').length;
  const scheduledCount = leads.filter(l => l.status === 'scheduled').length;

  return (
    <DashboardTemplate title="Gestão de Leads">
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-7 h-7" />
            Gestão de Leads
          </h2>
          <p className="text-gray-600 mt-1">
            Leads capturados pela IA Assistente
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div 
            onClick={() => setFilter('pending')}
            className={`bg-white p-4 rounded-lg shadow cursor-pointer transition-all ${filter === 'pending' ? 'ring-2 ring-green-500' : 'hover:shadow-md'}`}
          >
            <p className="text-sm text-gray-600">Pendentes</p>
            <p className="text-3xl font-bold text-orange-600">{pendingCount}</p>
          </div>
          <div 
            onClick={() => setFilter('contacted')}
            className={`bg-white p-4 rounded-lg shadow cursor-pointer transition-all ${filter === 'contacted' ? 'ring-2 ring-green-500' : 'hover:shadow-md'}`}
          >
            <p className="text-sm text-gray-600">Contatados</p>
            <p className="text-3xl font-bold text-blue-600">{contactedCount}</p>
          </div>
          <div 
            onClick={() => setFilter('scheduled')}
            className={`bg-white p-4 rounded-lg shadow cursor-pointer transition-all ${filter === 'scheduled' ? 'ring-2 ring-green-500' : 'hover:shadow-md'}`}
          >
            <p className="text-sm text-gray-600">Agendados</p>
            <p className="text-3xl font-bold text-green-600">{scheduledCount}</p>
          </div>
        </div>

        {/* Lista de Leads */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : leads.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum lead {filter} no momento</p>
            </div>
          ) : (
            leads.map(lead => (
              <div key={lead.id} className="bg-white p-5 rounded-lg shadow hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{lead.name}</h3>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        Capturado pela IA
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {lead.phone}
                      </p>
                      <p className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Prefere: {lead.preferred_time_description}
                      </p>
                      <p className="text-xs text-gray-500">
                        Capturado em {new Date(lead.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>

                    {lead.conversation_summary && (
                      <p className="mt-2 text-sm bg-gray-50 p-2 rounded">
                        {lead.conversation_summary}
                      </p>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex flex-col gap-2 ml-4">
                    {lead.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleContact(lead)}
                          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2 text-sm"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Contatar
                        </button>
                        <button
                          onClick={() => handleSchedule(lead)}
                          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2 text-sm"
                        >
                          <Check className="w-4 h-4" />
                          Agendar
                        </button>
                        <button
                          onClick={() => updateLeadStatus(lead.id, 'rejected')}
                          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-2 text-sm"
                        >
                          <X className="w-4 h-4" />
                          Rejeitar
                        </button>
                      </>
                    )}
                    
                    {lead.status === 'contacted' && (
                      <button
                        onClick={() => handleSchedule(lead)}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2 text-sm"
                      >
                        <Check className="w-4 h-4" />
                        Agendar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardTemplate>
  );
}