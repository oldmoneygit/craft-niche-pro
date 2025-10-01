import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { useToast } from '@/hooks/use-toast';
import { FileText, User, Phone, Mail, Calendar, UserPlus, Eye } from 'lucide-react';
import PlatformPageWrapper from '@/core/layouts/PlatformPageWrapper';

export default function PlatformQuestionnaireResponses() {
  const { questionnaireId } = useParams();
  const { tenantId } = useTenantId();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [responses, setResponses] = useState<any[]>([]);
  const [questionnaire, setQuestionnaire] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenantId && questionnaireId) {
      fetchData();
    }
  }, [tenantId, questionnaireId]);

  const fetchData = async () => {
    try {
      // Buscar questionário
      const { data: qData } = await supabase
        .from('questionnaires')
        .select('*')
        .eq('id', questionnaireId)
        .single();

      setQuestionnaire(qData);

      // Buscar respostas
      const { data: rData } = await supabase
        .from('questionnaire_responses')
        .select(`
          *,
          clients(id, name, phone)
        `)
        .eq('questionnaire_id', questionnaireId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      setResponses(rData || []);
      setLoading(false);

    } catch (error) {
      console.error('Error fetching:', error);
      setLoading(false);
    }
  };

  const linkToClient = async (responseId: string, phone: string, name: string, email?: string) => {
    try {
      // Buscar cliente existente pelo telefone
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('phone', phone)
        .maybeSingle();

      let clientId;

      if (existingClient) {
        clientId = existingClient.id;
        toast({
          title: "Cliente encontrado",
          description: "Resposta vinculada ao cliente existente"
        });
      } else {
        // Criar novo cliente
        const { data: newClient, error } = await supabase
          .from('clients')
          .insert({
            tenant_id: tenantId,
            name: name,
            phone: phone,
            email: email || null
          })
          .select()
          .single();

        if (error) throw error;

        clientId = newClient.id;
        toast({
          title: "Cliente criado",
          description: "Novo cliente adicionado automaticamente"
        });
      }

      // Atualizar resposta com client_id
      await supabase
        .from('questionnaire_responses')
        .update({ client_id: clientId })
        .eq('id', responseId);

      fetchData();

    } catch (error) {
      console.error('Error linking:', error);
      toast({
        title: "Erro",
        description: "Não foi possível vincular ao cliente",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <PlatformPageWrapper title="Respostas do Questionário">
        <div className="p-6">Carregando...</div>
      </PlatformPageWrapper>
    );
  }

  return (
    <PlatformPageWrapper title="Respostas do Questionário">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-green-600 hover:text-green-700 mb-4"
          >
            ← Voltar
          </button>
          <h2 className="text-2xl font-bold">{questionnaire?.title}</h2>
          <p className="text-gray-600 mt-1">
            {responses.length} resposta{responses.length !== 1 ? 's' : ''} recebida{responses.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Lista de Respostas */}
        <div className="space-y-4">
          {responses.map(response => (
            <div key={response.id} className="bg-white rounded-lg shadow p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="font-semibold text-lg">
                      {response.respondent_name || response.clients?.name || 'Nome não informado'}
                    </span>
                    {response.client_id && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        Cliente vinculado
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    {response.respondent_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {response.respondent_phone}
                      </div>
                    )}
                    {response.respondent_email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {response.respondent_email}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Respondido em {new Date(response.completed_at).toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!response.client_id && response.respondent_phone && (
                    <button
                      onClick={() => linkToClient(
                        response.id,
                        response.respondent_phone,
                        response.respondent_name,
                        response.respondent_email
                      )}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 text-sm"
                    >
                      <UserPlus className="w-4 h-4" />
                      Vincular/Criar Cliente
                    </button>
                  )}
                  <button
                    onClick={() => {/* TODO: modal com respostas completas */}}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    Ver Respostas
                  </button>
                </div>
              </div>

              {/* Preview das respostas */}
              <div className="border-t pt-4 mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Resumo das respostas:</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {Object.entries(response.answers || {}).slice(0, 4).map(([key, value]: any) => {
                    const question = questionnaire?.questions.find((q: any) => q.id === key);
                    return (
                      <div key={key} className="bg-gray-50 p-2 rounded">
                        <p className="text-gray-600 text-xs mb-1">{question?.question}</p>
                        <p className="text-gray-900 font-medium truncate">
                          {Array.isArray(value) ? value.join(', ') : value}
                        </p>
                      </div>
                    );
                  })}
                </div>
                {Object.keys(response.answers || {}).length > 4 && (
                  <p className="text-xs text-gray-500 mt-2">
                    + {Object.keys(response.answers).length - 4} respostas adicionais
                  </p>
                )}
              </div>
            </div>
          ))}

          {responses.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Nenhuma resposta recebida ainda</p>
            </div>
          )}
        </div>
      </div>
    </PlatformPageWrapper>
  );
}
