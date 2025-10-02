import { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Calendar, UtensilsCrossed, ClipboardList, Eye, Send, Edit, Package, Plus, RefreshCw, Trash2, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useClientConfig } from '@/core/contexts/ClientConfigContext';
import { Badge } from '@/components/ui/badge';
import { ServiceSubscriptionModal } from '@/components/platform/ServiceSubscriptionModal';
import { RenewServiceModal } from '@/components/platform/RenewServiceModal';
import { 
  formatCurrency, 
  formatDate, 
  calculateDaysRemaining, 
  calculateProgress, 
  getProgressBarColor,
  getDaysRemainingVariant,
  calculateMonthlyEquivalent,
  getModalityVariant,
  getPaymentStatusVariant 
} from '@/lib/serviceCalculations';

interface ClientDetailsModalProps {
  client: any;
  onClose: () => void;
  onUpdate: () => void;
}

export const ClientDetailsModal = ({ client, onClose, onUpdate }: ClientDetailsModalProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { clientConfig } = useClientConfig();
  
  const [activeTab, setActiveTab] = useState<'info' | 'services' | 'plan' | 'questionnaires' | 'appointments'>('info');
  const [activeMealPlan, setActiveMealPlan] = useState<any>(null);
  const [questionnaires, setQuestionnaires] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [activeSubscriptions, setActiveSubscriptions] = useState<any[]>([]);
  const [historicalSubscriptions, setHistoricalSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);

  useEffect(() => {
    fetchClientData();
  }, [client.id]);

  const fetchClientData = async () => {
    setLoading(true);

    // Buscar plano, questionários, consultas

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

    // Buscar serviços contratados
    const { data: subscriptionsData } = await supabase
      .from('service_subscriptions')
      .select(`
        *,
        services (id, name, modality, duration_type, duration_days)
      `)
      .eq('client_id', client.id)
      .order('created_at', { ascending: false });

    const active = subscriptionsData?.filter(s => s.status === 'active' || s.status === 'expiring_soon') || [];
    const historical = subscriptionsData?.filter(s => s.status === 'expired' || s.status === 'cancelled' || s.status === 'renewed') || [];
    
    setActiveSubscriptions(active);
    setHistoricalSubscriptions(historical);

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

  const handleRenewSubscription = (subscription: any) => {
    setSelectedSubscription(subscription);
    setShowRenewModal(true);
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!confirm('Tem certeza que deseja cancelar este serviço?')) return;

    const { error } = await supabase
      .from('service_subscriptions')
      .update({ status: 'cancelled' })
      .eq('id', subscriptionId);

    if (error) {
      toast({ title: 'Erro ao cancelar', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: '✓ Serviço cancelado', description: 'O serviço foi cancelado com sucesso.' });
    fetchClientData();
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    }
    return phone;
  };

  const tabs = [
    { id: 'info', label: 'Informações', icon: User },
    { id: 'services', label: 'Serviços', icon: Package, badge: activeSubscriptions.length },
    { id: 'plan', label: 'Plano Alimentar', icon: UtensilsCrossed },
    { id: 'questionnaires', label: 'Questionários', icon: ClipboardList, badge: questionnaires.length },
    { id: 'appointments', label: 'Consultas', icon: Calendar, badge: appointments.length }
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-background rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
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

          {/* Tabs */}
          <div className="border-b border-border bg-muted/30">
            <div className="flex overflow-x-auto">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-3 font-medium text-sm whitespace-nowrap transition ${
                      activeTab === tab.id
                        ? 'text-green-600 border-b-2 border-green-600 bg-background'
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span className="bg-green-500 text-white text-xs rounded-full px-2 py-0.5">{tab.badge}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Carregando...</div>
            ) : (
              <>
                {/* Tab: Informações */}
                {activeTab === 'info' && (
                  <div className="space-y-6">
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
                  </div>
                )}

                {/* Tab: Serviços Contratados */}
                {activeTab === 'services' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold text-gray-900">Serviços Contratados</h3>
                      <button 
                        onClick={() => setShowSubscriptionModal(true)}
                        className="flex items-center gap-2 bg-gradient-to-br from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
                      >
                        <Plus className="w-5 h-5" />
                        Contratar Serviço
                      </button>
                    </div>

                    {/* Serviços Ativos */}
                    {activeSubscriptions.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeSubscriptions.map(subscription => (
                          <div key={subscription.id} className="bg-white border-2 border-l-4 border-l-green-500 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                            {/* Header do Card */}
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <h4 className="font-bold text-lg text-gray-900">{subscription.services.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant={getModalityVariant(subscription.services.modality)}>
                                    {subscription.services.modality}
                                  </Badge>
                                  <Badge variant={getPaymentStatusVariant(subscription.payment_status)}>
                                    {subscription.payment_status === 'paid' ? 'Pago' : 
                                     subscription.payment_status === 'pending' ? 'Pendente' : 'Atrasado'}
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-green-600">
                                  {formatCurrency(subscription.price)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatCurrency(calculateMonthlyEquivalent(subscription.price, subscription.services.duration_type))}/mês
                                </p>
                              </div>
                            </div>

                            {/* Período */}
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(subscription.start_date)} até {formatDate(subscription.end_date)}</span>
                            </div>

                            {/* Barra de Progresso */}
                            <div className="mb-3">
                              <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>Progresso</span>
                                <span>{calculateDaysRemaining(subscription.end_date)} dias restantes</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${getProgressBarColor(calculateDaysRemaining(subscription.end_date))}`}
                                  style={{ width: `${calculateProgress(subscription.start_date, subscription.end_date)}%` }}
                                />
                              </div>
                            </div>

                            {/* Badge de Status de Tempo */}
                            <div className="mb-4">
                              <Badge variant={getDaysRemainingVariant(calculateDaysRemaining(subscription.end_date))}>
                                {calculateDaysRemaining(subscription.end_date) > 14 ? '✓ No prazo' :
                                 calculateDaysRemaining(subscription.end_date) >= 7 ? '⚠️ Vence em breve' :
                                 '🔴 Vencimento próximo'}
                              </Badge>
                            </div>

                            {/* Botões de Ação */}
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleRenewSubscription(subscription)}
                                className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                              >
                                <RefreshCw className="w-4 h-4" />
                                Renovar
                              </button>
                              <button 
                                onClick={() => handleCancelSubscription(subscription.id)}
                                className="flex items-center justify-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Observações */}
                            {subscription.notes && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xs text-gray-500">Obs: {subscription.notes}</p>
                              </div>
                            )}
                          </div>
                        ))
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhum serviço contratado</h3>
                        <p className="text-gray-500 mb-4">Este cliente ainda não possui serviços ativos</p>
                        <button 
                          onClick={() => setShowSubscriptionModal(true)}
                          className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Contratar Primeiro Serviço
                        </button>
                      </div>
                    )}

                    {/* Histórico */}
                    {historicalSubscriptions.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-semibold text-gray-700 mb-3">Histórico</h4>
                        <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Serviço</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Período</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Valor</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {historicalSubscriptions.map(sub => (
                                <tr key={sub.id} className="border-t border-gray-200">
                                  <td className="px-4 py-2 text-sm">{sub.services.name}</td>
                                  <td className="px-4 py-2 text-sm text-gray-600">
                                    {formatDate(sub.start_date)} - {formatDate(sub.end_date)}
                                  </td>
                                  <td className="px-4 py-2 text-sm font-medium">{formatCurrency(sub.price)}</td>
                                  <td className="px-4 py-2">
                                    <Badge variant={sub.status === 'expired' ? 'secondary' : 'destructive'}>
                                      {sub.status === 'expired' ? 'Finalizado' : sub.status === 'renewed' ? 'Renovado' : 'Cancelado'}
                                    </Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: Plano Alimentar */}
                {activeTab === 'plan' && (
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
                              Criado em {new Date(activeMealPlan.created_at).toLocaleDateString('pt-BR')}</p>
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
                )}

                {/* Tab: Questionários */}
                {activeTab === 'questionnaires' && (
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
                )}

                {/* Tab: Consultas */}
                {activeTab === 'appointments' && (
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
                )}
              </>
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

      {/* Modals */}
      {showSubscriptionModal && (
        <ServiceSubscriptionModal
          clientId={client.id}
          tenantId={client.tenant_id}
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          onSuccess={() => {
            setShowSubscriptionModal(false);
            fetchClientData();
            onUpdate();
          }}
        />
      )}

      {showRenewModal && selectedSubscription && (
        <RenewServiceModal
          subscription={selectedSubscription}
          isOpen={showRenewModal}
          onClose={() => {
            setShowRenewModal(false);
            setSelectedSubscription(null);
          }}
          onSuccess={() => {
            setShowRenewModal(false);
            setSelectedSubscription(null);
            fetchClientData();
            onUpdate();
          }}
        />
      )}
    </>
  );
};
