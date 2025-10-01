import { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Calendar, UtensilsCrossed, ClipboardList, Eye, Send, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useClientConfig } from '@/core/contexts/ClientConfigContext';

interface ClientDetailsModalProps {
  client: any;
  onClose: () => void;
  onUpdate: () => void;
}

export const ClientDetailsModal = ({ client, onClose, onUpdate }: ClientDetailsModalProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { clientConfig } = useClientConfig();
  
  const [activeMealPlan, setActiveMealPlan] = useState<any>(null);
  const [questionnaires, setQuestionnaires] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientData();
  }, [client.id]);

  const fetchClientData = async () => {
    setLoading(true);

    // Buscar plano ativo
    const { data: mealPlanData } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('client_id', client.id)
      .eq('active', true)
      .maybeSingle();

    setActiveMealPlan(mealPlanData);

    // Buscar questionários respondidos
    const { data: questionnairesData } = await supabase
      .from('questionnaire_responses')
      .select(`
        *,
        questionnaires(id, title)
      `)
      .eq('client_id', client.id)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(5);

    setQuestionnaires(questionnairesData || []);

    // Buscar últimas consultas
    const { data: appointmentsData } = await supabase
      .from('appointments')
      .select('*')
      .eq('client_id', client.id)
      .order('datetime', { ascending: false })
      .limit(5);

    setAppointments(appointmentsData || []);

    setLoading(false);
  };

  const handleSendPlan = async () => {
    if (!activeMealPlan) return;

    if (!activeMealPlan.public_token) {
      const token = `${activeMealPlan.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await supabase
        .from('meal_plans')
        .update({ public_token: token })
        .eq('id', activeMealPlan.id);
      
      activeMealPlan.public_token = token;
    }

    const publicLink = `${window.location.origin}/plano/${activeMealPlan.public_token}`;
    const message = `Olá ${client.name}! 🥗\n\nSeu plano alimentar está pronto:\n\n${publicLink}\n\nQualquer dúvida, estou à disposição!`;
    
    const whatsappLink = `https://wa.me/55${client.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, '_blank');

    toast({ title: "WhatsApp aberto", description: "Envie o plano para o cliente" });
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    }
    return phone;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{client.name}</h2>
                <p className="text-green-100">Cliente desde {new Date(client.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Carregando...</div>
          ) : (
            <div className="space-y-6">
              {/* Informações básicas */}
              <div className="bg-muted rounded-lg p-4">
                <h3 className="font-bold text-foreground mb-3">Informações de Contato</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{formatPhone(client.phone)}</span>
                  </div>
                  {client.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{client.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Plano alimentar ativo */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    <UtensilsCrossed className="w-5 h-5" />
                    Plano Alimentar
                  </h3>
                  <button
                    onClick={() => navigate(`/platform/${clientConfig?.subdomain}/planos-alimentares/novo`)}
                    className="text-sm text-green-600 hover:text-green-700"
                  >
                    + Criar Novo
                  </button>
                </div>

                {activeMealPlan ? (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-2 border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{activeMealPlan.title}</p>
                        {activeMealPlan.calories_target && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Meta: {activeMealPlan.calories_target} kcal/dia
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Criado em {new Date(activeMealPlan.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/platform/${clientConfig?.subdomain}/planos-alimentares/${activeMealPlan.id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleSendPlan}
                          className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 rounded"
                          title="Enviar"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <UtensilsCrossed className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">Nenhum plano ativo</p>
                    <button
                      onClick={() => navigate(`/platform/${clientConfig?.subdomain}/planos-alimentares/novo`)}
                      className="mt-2 text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      Criar primeiro plano
                    </button>
                  </div>
                )}
              </div>

              {/* Questionários respondidos */}
              <div>
                <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" />
                  Questionários Respondidos ({questionnaires.length})
                </h3>

                {questionnaires.length > 0 ? (
                  <div className="space-y-2">
                    {questionnaires.map(response => (
                      <div key={response.id} className="bg-muted rounded-lg p-3 border border-border hover:border-green-300 dark:hover:border-green-700 transition">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-foreground text-sm">
                              {response.questionnaires.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Respondido em {new Date(response.completed_at).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                          {response.score !== null && response.score !== undefined && (
                            <span className={`text-sm px-3 py-1 rounded-full font-semibold ml-2 ${
                              response.score >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200' :
                              response.score >= 60 ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200' :
                              response.score >= 40 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200' :
                              'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
                            }`}>
                              {response.score}%
                            </span>
                          )}
                          <button
                            onClick={() => {
                              toast({ title: "Em breve", description: "Visualização de respostas" });
                            }}
                            className="ml-2 p-2 text-muted-foreground hover:bg-muted rounded"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-muted rounded-lg p-6 text-center">
                    <p className="text-muted-foreground text-sm">Nenhum questionário respondido ainda</p>
                  </div>
                )}
              </div>

              {/* Histórico de consultas */}
              <div>
                <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Últimas Consultas ({appointments.length})
                </h3>

                {appointments.length > 0 ? (
                  <div className="space-y-2">
                    {appointments.map(apt => (
                      <div key={apt.id} className="bg-muted rounded-lg p-3 border border-border">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {new Date(apt.datetime).toLocaleDateString('pt-BR', {
                                weekday: 'short',
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })} às {new Date(apt.datetime).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{apt.type}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            apt.status === 'realizado' ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200' :
                            apt.status === 'confirmado' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200' :
                            apt.status === 'agendado' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200' :
                            'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
                          }`}>
                            {apt.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-muted rounded-lg p-6 text-center">
                    <p className="text-muted-foreground text-sm">Nenhuma consulta registrada</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 bg-muted flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-lg hover:bg-background"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
