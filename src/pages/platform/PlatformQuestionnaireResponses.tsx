import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { useToast } from '@/hooks/use-toast';
import { FileText, User, Phone, Mail, Calendar, UserPlus, Eye, Trash2 } from 'lucide-react';
import PlatformPageWrapper from '@/core/layouts/PlatformPageWrapper';
import { useClientConfig } from '@/core/contexts/ClientConfigContext';

export default function PlatformQuestionnaireResponses() {
  const { questionnaireId } = useParams();
  const { tenantId } = useTenantId();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { clientConfig } = useClientConfig();
  const [responses, setResponses] = useState<any[]>([]);
  const [questionnaire, setQuestionnaire] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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

  const deleteResponse = async (responseId: string) => {
    try {
      const { error } = await supabase
        .from('questionnaire_responses')
        .delete()
        .eq('id', responseId);

      if (error) throw error;

      toast({
        title: "Resposta deletada",
        description: "A resposta foi removida com sucesso"
      });

      setDeleteConfirmId(null);
      fetchData();

    } catch (error) {
      console.error('Error deleting:', error);
      toast({
        title: "Erro",
        description: "Não foi possível deletar a resposta",
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
                    onClick={() => {
                      setSelectedResponse(response);
                      setIsModalOpen(true);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    Ver Respostas
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(response.id)}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Deletar
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

      {/* Modal Ver Respostas Detalhadas */}
      {isModalOpen && selectedResponse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">{questionnaire?.title}</h3>
                  <p className="text-green-100 mt-1">
                    Respondido por {selectedResponse.respondent_name}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedResponse(null);
                  }}
                  className="text-white hover:bg-white/20 rounded-lg p-2 text-2xl leading-none"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Informações do Respondente */}
            <div className="bg-gray-50 border-b p-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Nome</p>
                  <p className="font-semibold">{selectedResponse.respondent_name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Telefone</p>
                  <p className="font-semibold">{selectedResponse.respondent_phone}</p>
                </div>
                <div>
                  <p className="text-gray-600">E-mail</p>
                  <p className="font-semibold">{selectedResponse.respondent_email || 'Não informado'}</p>
                </div>
              </div>
            </div>

            {/* Respostas */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {questionnaire?.questions.map((question: any, index: number) => {
                  const answer = selectedResponse.answers[question.id];
                  
                  return (
                    <div key={question.id} className="border-b pb-4">
                      <p className="font-semibold text-gray-900 mb-2">
                        {index + 1}. {question.question}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                      </p>
                      <p className="text-xs text-gray-500 mb-2">
                        Tipo: {
                          question.type === 'text' ? 'Resposta curta' :
                          question.type === 'textarea' ? 'Resposta longa' :
                          question.type === 'radio' ? 'Múltipla escolha' :
                          question.type === 'checkbox' ? 'Caixas de seleção' :
                          'Escala (1-10)'
                        }
                      </p>
                      
                      <div className="bg-green-50 rounded-lg p-4 mt-2">
                        {question.type === 'checkbox' && Array.isArray(answer) ? (
                          <ul className="list-disc list-inside space-y-1">
                            {answer.map((item: string, i: number) => (
                              <li key={i} className="text-gray-900">{item}</li>
                            ))}
                          </ul>
                        ) : question.type === 'scale' ? (
                          <div className="flex items-center gap-2">
                            <span className="text-3xl font-bold text-green-600">{answer}</span>
                            <span className="text-gray-600">/ 10</span>
                          </div>
                        ) : (
                          <p className="text-gray-900 whitespace-pre-wrap">{answer || 'Não respondido'}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer com ações */}
            <div className="border-t p-4 bg-gray-50">
              <div className="flex gap-3">
                {!selectedResponse.client_id && (
                  <button
                    onClick={() => {
                      linkToClient(
                        selectedResponse.id,
                        selectedResponse.respondent_phone,
                        selectedResponse.respondent_name,
                        selectedResponse.respondent_email
                      );
                      setIsModalOpen(false);
                    }}
                    className="flex-1 bg-blue-500 text-white rounded-lg py-3 font-semibold hover:bg-blue-600 flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-5 h-5" />
                    Vincular/Criar Cliente
                  </button>
                )}
                {selectedResponse.client_id && (
                  <button
                    onClick={() => navigate(`/platform/${clientConfig.subdomain}/clientes`)}
                    className="flex-1 bg-green-500 text-white rounded-lg py-3 font-semibold hover:bg-green-600"
                  >
                    Ver Cliente
                  </button>
                )}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Deletar Resposta
                </h3>
                <p className="text-gray-600 text-sm">
                  Tem certeza que deseja deletar esta resposta? Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteResponse(deleteConfirmId)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Deletar
              </button>
            </div>
          </div>
        </div>
      )}
    </PlatformPageWrapper>
  );
}
