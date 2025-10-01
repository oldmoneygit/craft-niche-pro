import { useState, useEffect } from 'react';
import { Calendar, Send, CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { useToast } from '@/hooks/use-toast';
import { useClientConfig } from '@/core/contexts/ClientConfigContext';
import PlatformPageWrapper from '@/core/layouts/PlatformPageWrapper';

interface ClientFeedbackStatus {
  client: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
  lastFeedback: string | null;
  daysSinceLastFeedback: number;
  needsFeedback: boolean;
  status: 'pending' | 'sent' | 'completed';
}

export default function PlatformWeeklyFeedbacks() {
  const { tenantId } = useTenantId();
  const { clientConfig } = useClientConfig();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<ClientFeedbackStatus[]>([]);
  const [feedbackQuestionnaire, setFeedbackQuestionnaire] = useState<any>(null);
  const [sendingBulk, setSendingBulk] = useState(false);

  useEffect(() => {
    if (tenantId) {
      fetchData();
    }
  }, [tenantId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Buscar questionário de feedback (por título)
      const { data: questionnaire } = await supabase
        .from('questionnaires')
        .select('*')
        .eq('tenant_id', tenantId)
        .ilike('title', '%feedback%semanal%')
        .eq('active', true)
        .maybeSingle();

      if (!questionnaire) {
        setFeedbackQuestionnaire(null);
        setLoading(false);
        return;
      }

      setFeedbackQuestionnaire(questionnaire);

      // 2. Buscar todos os clientes ativos
      const { data: allClients } = await supabase
        .from('clients')
        .select(`
          id,
          name,
          phone,
          email,
          created_at
        `)
        .eq('tenant_id', tenantId)
        .order('name');

      if (!allClients) {
        setLoading(false);
        return;
      }

      // 3. Para cada cliente, verificar última resposta de feedback
      const clientsStatus: ClientFeedbackStatus[] = [];

      for (const client of allClients) {
        // Buscar última resposta de feedback deste cliente
        const { data: lastResponse } = await supabase
          .from('questionnaire_responses')
          .select('completed_at')
          .eq('questionnaire_id', questionnaire.id)
          .eq('client_id', client.id)
          .eq('status', 'completed')
          .order('completed_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        const now = new Date();
        let daysSinceLastFeedback = 999;
        let needsFeedback = true;

        if (lastResponse) {
          const lastDate = new Date(lastResponse.completed_at);
          daysSinceLastFeedback = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          needsFeedback = daysSinceLastFeedback >= 7;
        }

        clientsStatus.push({
          client,
          lastFeedback: lastResponse?.completed_at || null,
          daysSinceLastFeedback,
          needsFeedback,
          status: needsFeedback ? 'pending' : 'completed'
        });
      }

      // Ordenar: pendentes primeiro, depois por dias sem responder
      clientsStatus.sort((a, b) => {
        if (a.needsFeedback && !b.needsFeedback) return -1;
        if (!a.needsFeedback && b.needsFeedback) return 1;
        return b.daysSinceLastFeedback - a.daysSinceLastFeedback;
      });

      setClients(clientsStatus);

    } catch (error) {
      console.error('Error fetching feedback data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendFeedbackToClient = async (client: any) => {
    if (!feedbackQuestionnaire) return;

    try {
      // Criar token e resposta pendente
      const publicToken = `${feedbackQuestionnaire.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const { data, error } = await supabase
        .from('questionnaire_responses')
        .insert({
          questionnaire_id: feedbackQuestionnaire.id,
          client_id: client.id,
          tenant_id: tenantId,
          public_token: publicToken,
          answers: {},
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Gerar link público
      const publicLink = `${window.location.origin}/responder/${publicToken}`;

      // Mensagem personalizada
      const message = `Olá ${client.name}! 👋\n\nChegou a hora do seu feedback semanal!\n\nPor favor, responda este questionário rápido para eu avaliar como você está se sentindo e ajustar sua dieta se necessário:\n\n${publicLink}\n\nLeva só 2 minutos! 😊`;

      const whatsappLink = `https://wa.me/55${client.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappLink, '_blank');

      toast({
        title: "Link aberto!",
        description: `WhatsApp aberto para ${client.name}`
      });

      // Atualizar status local (otimista)
      setClients(prev => prev.map(c => 
        c.client.id === client.id 
          ? { ...c, status: 'sent' as const }
          : c
      ));

    } catch (error) {
      console.error('Error sending feedback:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o feedback",
        variant: "destructive"
      });
    }
  };

  const sendBulkFeedback = async () => {
    if (!feedbackQuestionnaire) return;

    const pendingClients = clients.filter(c => c.needsFeedback);

    if (pendingClients.length === 0) {
      toast({
        title: "Nenhum pendente",
        description: "Não há clientes precisando enviar feedback"
      });
      return;
    }

    const confirmMsg = `Enviar feedback semanal para ${pendingClients.length} cliente${pendingClients.length > 1 ? 's' : ''}?\n\nSerá aberta uma aba do WhatsApp para cada um (intervalo de 3 segundos entre cada).`;

    if (!confirm(confirmMsg)) return;

    setSendingBulk(true);

    for (let i = 0; i < pendingClients.length; i++) {
      const clientStatus = pendingClients[i];
      await sendFeedbackToClient(clientStatus.client);
      
      // Aguardar 3 segundos entre cada envio
      if (i < pendingClients.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    setSendingBulk(false);

    toast({
      title: "Envios concluídos!",
      description: `Feedback enviado para ${pendingClients.length} clientes`
    });
  };

  if (loading) {
    return (
      <PlatformPageWrapper>
        <div className="p-6">
          <div className="flex items-center gap-2 text-gray-600">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Carregando...
          </div>
        </div>
      </PlatformPageWrapper>
    );
  }

  if (!feedbackQuestionnaire) {
    return (
      <PlatformPageWrapper>
        <div className="p-6">
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-yellow-900 mb-2">
                  Questionário de Feedback Não Encontrado
                </h3>
                <p className="text-yellow-800 mb-4">
                  Para usar esta funcionalidade, você precisa criar um questionário com título contendo "Feedback Semanal".
                </p>
                <button
                  onClick={() => window.location.href = `/platform/${clientConfig?.subdomain}/questionnaires`}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
                >
                  Ir para Questionários
                </button>
              </div>
            </div>
          </div>
        </div>
      </PlatformPageWrapper>
    );
  }

  const pendingCount = clients.filter(c => c.needsFeedback).length;
  const completedCount = clients.filter(c => !c.needsFeedback).length;

  return (
    <PlatformPageWrapper>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="w-7 h-7" />
              Feedbacks Semanais
            </h2>
            <p className="text-gray-600 mt-1">
              Envie questionários de acompanhamento para seus clientes
            </p>
          </div>
          <button
            onClick={fetchData}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            title="Atualizar"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-3xl font-bold text-orange-600">{pendingCount}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Em dia</p>
                <p className="text-3xl font-bold text-green-600">{completedCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Clientes</p>
                <p className="text-3xl font-bold text-blue-600">{clients.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Ação em massa */}
        {pendingCount > 0 && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg mb-1">
                  {pendingCount} cliente{pendingCount > 1 ? 's precisam' : ' precisa'} responder
                </h3>
                <p className="text-green-100">
                  Envie o feedback semanal para todos de uma vez
                </p>
              </div>
              <button
                onClick={sendBulkFeedback}
                disabled={sendingBulk}
                className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 disabled:opacity-50 flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                {sendingBulk ? 'Enviando...' : `Enviar para ${pendingCount}`}
              </button>
            </div>
          </div>
        )}

        {/* Lista de clientes */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Clientes</h3>
          
          {clients.map(clientStatus => (
            <div 
              key={clientStatus.client.id}
              className={`bg-white rounded-lg shadow p-4 border-l-4 ${
                clientStatus.needsFeedback ? 'border-orange-500' : 'border-green-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-lg">{clientStatus.client.name}</p>
                    {clientStatus.needsFeedback ? (
                      <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium">
                        Pendente há {clientStatus.daysSinceLastFeedback} dias
                      </span>
                    ) : (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                        ✓ Respondido há {clientStatus.daysSinceLastFeedback} dias
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{clientStatus.client.phone}</p>
                  {clientStatus.lastFeedback && (
                    <p className="text-xs text-gray-500 mt-1">
                      Último feedback: {new Date(clientStatus.lastFeedback).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>

                {clientStatus.needsFeedback && (
                  <button
                    onClick={() => sendFeedbackToClient(clientStatus.client)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Enviar Feedback
                  </button>
                )}
              </div>
            </div>
          ))}

          {clients.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Nenhum cliente cadastrado ainda</p>
            </div>
          )}
        </div>
      </div>
    </PlatformPageWrapper>
  );
}
