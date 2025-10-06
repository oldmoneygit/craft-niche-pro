import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  X, User, Mail, Phone, Calendar, Activity, Target, Ruler, Weight,
  Package, FileText, ClipboardList, FileQuestion, Loader2, Eye, Edit, Trash2, Plus
} from 'lucide-react';
import { ClientWithStats } from '@/hooks/useClientsData';
import { format } from 'date-fns';
import { AnamneseForm } from '@/components/platform/AnamneseForm';
import { AnamneseViewer } from '@/components/platform/AnamneseViewer';
import { useDeleteAnamnese } from '@/hooks/useAnamnese';
import { EditClientModal } from './EditClientModal';
import { AgendamentoModal } from '@/components/agendamentos/AgendamentoModal';
import { SendQuestionnaireModal } from '@/components/questionnaires/SendQuestionnaireModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ClientDetailsModalProps {
  client: ClientWithStats;
  onClose: () => void;
}

export function ClientDetailsModal({ client, onClose }: ClientDetailsModalProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'info' | 'services' | 'plans' | 'questionnaires' | 'appointments' | 'anamneses'>('info');
  const [viewingAnamnese, setViewingAnamnese] = useState<any | null>(null);
  const [editingAnamnese, setEditingAnamnese] = useState(false);
  const [deletingAnamneseId, setDeletingAnamneseId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showQuestionnaireModal, setShowQuestionnaireModal] = useState(false);
  
  const deleteAnamnese = useDeleteAnamnese();

  // Fetch services
  const { data: clientServices, isLoading: servicesLoading } = useQuery({
    queryKey: ['client-services', client.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_subscriptions')
        .select(`
          *,
          services (
            name,
            description,
            duration_days,
            price
          )
        `)
        .eq('client_id', client.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: activeTab === 'services'
  });

  // Fetch meal plans
  const { data: mealPlans, isLoading: plansLoading } = useQuery({
    queryKey: ['client-meal-plans', client.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: activeTab === 'plans'
  });

  // Fetch appointments
  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['client-appointments', client.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('client_id', client.id)
        .order('datetime', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: activeTab === 'appointments'
  });

  // Fetch anamneses
  const { data: anamneses, isLoading: anamnesesLoading } = useQuery({
    queryKey: ['client-anamneses', client.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('anamneses')
        .select('*')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as any[];
    },
    enabled: activeTab === 'anamneses'
  });

  // Fetch questionnaires
  const { data: questionnaireResponses, isLoading: questionnairesLoading } = useQuery({
    queryKey: ['client-questionnaires', client.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questionnaire_responses')
        .select(`
          *,
          questionnaires (
            title,
            description
          )
        `)
        .eq('client_id', client.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: activeTab === 'questionnaires'
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não informado';
    return format(new Date(dateString), 'dd/MM/yyyy');
  };

  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '??';
  };

  const goalLabels: Record<string, string> = {
    weight_loss: 'Perda de Peso',
    muscle_gain: 'Ganho de Massa',
    maintenance: 'Manutenção',
    health: 'Saúde'
  };

  const activityLabels: Record<string, string> = {
    sedentary: 'Sedentário',
    light: 'Leve',
    moderate: 'Moderado',
    intense: 'Intenso',
    very_intense: 'Muito Intenso'
  };

  const tabs = [
    { id: 'info', label: 'Informações' },
    { id: 'services', label: 'Serviços' },
    { id: 'plans', label: 'Plano Alimentar' },
    { id: 'questionnaires', label: 'Questionários' },
    { id: 'appointments', label: 'Consultas' },
    { id: 'anamneses', label: 'Anamneses' }
  ] as const;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)'
      }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: 'var(--bg-primary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="p-8 relative"
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          }}
        >
          <div className="flex items-center gap-5">
            <div 
              className="w-18 h-18 rounded-full flex items-center justify-center text-3xl font-bold"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white'
              }}
            >
              {getInitials(client.name)}
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-bold mb-1">{client.name}</h2>
              <p className="text-sm opacity-90">
                Cliente desde {formatDate(client.created_at)}
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Tabs */}
        <div 
          className="flex gap-2 px-8 overflow-x-auto"
          style={{
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border)'
          }}
        >
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-5 py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap"
              style={{
                color: activeTab === tab.id ? '#10b981' : 'var(--text-muted)',
                borderColor: activeTab === tab.id ? '#10b981' : 'transparent'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto max-h-[500px]">
          {activeTab === 'info' && (
            <div>
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                >
                  <Edit size={16} />
                  Editar Informações
                </button>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <InfoItem icon={Phone} label="Telefone" value={client.phone || 'Não informado'} />
                <InfoItem icon={Mail} label="Email" value={client.email || 'Não informado'} />
                <InfoItem 
                  icon={User} 
                  label="Idade" 
                  value={calculateAge(client.birth_date) ? `${calculateAge(client.birth_date)} anos` : 'Não informado'} 
                />
                <InfoItem icon={Calendar} label="Data de Nascimento" value={formatDate(client.birth_date)} />
                <InfoItem icon={Ruler} label="Altura" value={client.height_cm ? `${client.height_cm} cm` : 'Não informado'} />
                <InfoItem icon={Weight} label="Peso Atual" value={client.weight_kg ? `${client.weight_kg} kg` : 'Não informado'} />
                <InfoItem icon={Target} label="Objetivo" value={client.goal ? goalLabels[client.goal] : 'Não informado'} />
                <InfoItem icon={Activity} label="Nível de Atividade" value={client.activity_level ? activityLabels[client.activity_level] : 'Não informado'} />
                
                {client.notes && (
                  <div className="col-span-2">
                    <InfoItem icon={User} label="Observações" value={client.notes} />
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'services' && (
            <div className="space-y-4">
              {servicesLoading ? (
                <div className="animate-pulse space-y-3">
                  {[1,2].map(i => (
                    <div key={i} className="h-24 rounded-xl" style={{ background: 'var(--bg-secondary)' }} />
                  ))}
                </div>
              ) : clientServices && clientServices.length > 0 ? (
                clientServices.map(sub => {
                  const isActive = new Date(sub.end_date) > new Date();
                  const daysLeft = Math.floor(
                    (new Date(sub.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  );
                  
                  return (
                    <div 
                      key={sub.id} 
                      className="p-5 rounded-xl border transition-all hover:shadow-md"
                      style={{
                        background: 'var(--bg-card)',
                        backdropFilter: 'blur(20px)',
                        borderColor: isActive ? '#10b981' : 'var(--border)'
                      }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
                            {sub.services?.name}
                          </h4>
                          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                            {sub.services?.description}
                          </p>
                        </div>
                        <span 
                          className="px-3 py-1 rounded-lg text-xs font-semibold"
                          style={{
                            background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: isActive ? '#10b981' : '#ef4444'
                          }}
                        >
                          {isActive ? `${daysLeft} dias restantes` : 'Expirado'}
                        </span>
                      </div>
                      
                      <div className="flex gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                        <span>Início: {new Date(sub.start_date).toLocaleDateString('pt-BR')}</span>
                        <span>Fim: {new Date(sub.end_date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <Package size={64} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-3" />
                  <p style={{ color: 'var(--text-muted)' }} className="mb-4">Nenhum serviço contratado</p>
                  <button
                    onClick={() => navigate('/servicos')}
                    className="px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105 inline-flex items-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                  >
                    <Plus size={18} />
                    Contratar Serviço
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'plans' && (
            <div className="space-y-4">
              {plansLoading ? (
                <div className="animate-pulse space-y-3">
                  {[1,2].map(i => <div key={i} className="h-32 rounded-xl" style={{ background: 'var(--bg-secondary)' }} />)}
                </div>
              ) : mealPlans && mealPlans.length > 0 ? (
                mealPlans.map(plan => (
                  <div 
                    key={plan.id}
                    className="p-5 rounded-xl border cursor-pointer hover:shadow-md transition-all"
                    style={{
                      background: 'var(--bg-card)',
                      backdropFilter: 'blur(20px)',
                      borderColor: plan.is_active ? '#10b981' : 'var(--border)'
                    }}
                    onClick={() => navigate(`/planos/${plan.id}`)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>{plan.name}</h4>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          Criado em {new Date(plan.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      {plan.is_active && (
                        <span 
                          className="px-3 py-1 rounded-lg text-xs font-semibold"
                          style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}
                        >
                          Ativo
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Calorias</p>
                        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{plan.target_kcal} kcal</p>
                      </div>
                      <div>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Proteína</p>
                        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{plan.target_protein}g</p>
                      </div>
                      <div>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Carboidrato</p>
                        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{plan.target_carbs}g</p>
                      </div>
                      <div>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Gordura</p>
                        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{plan.target_fats}g</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <FileText size={64} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-3" />
                  <p style={{ color: 'var(--text-muted)' }} className="mb-4">Nenhum plano alimentar criado</p>
                  <button
                    onClick={() => navigate(`/planos?clientId=${client.id}`)}
                    className="px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                  >
                    Criar Plano
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'appointments' && (
            <div>
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setShowAppointmentModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                >
                  <Plus size={16} />
                  Criar Consulta
                </button>
              </div>
              <div className="space-y-3">
                {appointmentsLoading ? (
                  <div className="animate-pulse space-y-3">
                    {[1,2,3].map(i => <div key={i} className="h-20 rounded-xl" style={{ background: 'var(--bg-secondary)' }} />)}
                  </div>
                ) : appointments && appointments.length > 0 ? (
                appointments.map(apt => {
                  const statusColors: Record<string, { bg: string; text: string }> = {
                    'agendado': { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6' },
                    'confirmado': { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981' },
                    'realizado': { bg: 'rgba(163, 163, 163, 0.1)', text: '#737373' },
                    'cancelado': { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' }
                  };
                  
                  return (
                    <div 
                      key={apt.id}
                      className="p-4 rounded-xl border transition-all hover:shadow-md"
                      style={{
                        background: 'var(--bg-card)',
                        backdropFilter: 'blur(20px)',
                        borderColor: 'var(--border)'
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                              {new Date(apt.datetime).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </span>
                            <span style={{ color: 'var(--text-muted)' }}>
                              às {new Date(apt.datetime).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                            {apt.type === 'primeira_consulta' ? 'Primeira Consulta' : 'Retorno'}
                          </p>
                        </div>
                        
                        <span 
                          className="px-3 py-1 rounded-lg text-xs font-semibold"
                          style={{
                            background: statusColors[apt.status]?.bg,
                            color: statusColors[apt.status]?.text
                          }}
                        >
                          {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                        </span>
                      </div>
                      
                      {apt.notes && (
                        <p className="text-sm mt-3 pt-3 border-t" style={{ 
                          color: 'var(--text-muted)',
                          borderColor: 'var(--border)'
                        }}>
                          {apt.notes}
                        </p>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <Calendar size={64} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-3" />
                  <p style={{ color: 'var(--text-muted)' }} className="mb-4">Nenhuma consulta registrada</p>
                  <button
                    onClick={() => navigate(`/agendamentos?action=new&clientId=${client.id}`)}
                    className="px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                  >
                    Agendar Consulta
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'anamneses' && (
            <>
              {editingAnamnese ? (
                <div>
                  <button
                    onClick={() => setEditingAnamnese(false)}
                    className="mb-4 text-sm text-green-600 hover:text-green-700 font-semibold"
                  >
                    ← Voltar para lista
                  </button>
                  <AnamneseForm clientId={client.id} />
                </div>
              ) : (
                <div className="space-y-4">
                  {anamnesesLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                    </div>
                  ) : anamneses && anamneses.length > 0 ? (
                    <>
                      {anamneses.map((anamnese: any) => (
                        <div 
                          key={anamnese.id}
                          className="p-5 rounded-xl border transition-all hover:shadow-md"
                          style={{
                            background: 'var(--bg-card)',
                            backdropFilter: 'blur(20px)',
                            borderColor: 'var(--border)'
                          }}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
                                Anamnese - {new Date(anamnese.created_at).toLocaleDateString('pt-BR')}
                              </h4>
                              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                                Última atualização: {new Date(anamnese.updated_at).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-4">
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Objetivo Principal:</p>
                            <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2">
                              {anamnese.main_goal || 'Não informado'}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => setViewingAnamnese(anamnese)}
                              className="flex-1 px-4 py-2 rounded-lg font-semibold text-white transition-all hover:scale-105"
                              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                            >
                              <Eye className="w-4 h-4 inline mr-2" />
                              Ver Relatório
                            </button>
                            <button
                              onClick={() => setEditingAnamnese(true)}
                              className="px-4 py-2 rounded-lg font-semibold border-2 border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
                            >
                              <Edit className="w-4 h-4 inline mr-2" />
                              Editar
                            </button>
                            <button
                              onClick={() => setDeletingAnamneseId(anamnese.id)}
                              className="px-4 py-2 rounded-lg font-semibold border-2 border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                              title="Excluir anamnese"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      <button
                        onClick={() => setEditingAnamnese(true)}
                        className="w-full px-4 py-3 rounded-xl font-semibold border-2 border-dashed border-green-400 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
                      >
                        + Nova Anamnese
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <ClipboardList size={64} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-3" />
                      <p style={{ color: 'var(--text-muted)' }} className="mb-4">Nenhuma anamnese cadastrada</p>
                      <button
                        onClick={() => setEditingAnamnese(true)}
                        className="px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                      >
                        Criar Primeira Anamnese
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {activeTab === 'questionnaires' && (
            <div>
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setShowQuestionnaireModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                >
                  <Plus size={16} />
                  Enviar Questionário
                </button>
              </div>
              <div className="space-y-4">
                {questionnairesLoading ? (
                  <div className="animate-pulse">
                    <div className="h-24 rounded-xl" style={{ background: 'var(--bg-secondary)' }} />
                  </div>
                ) : questionnaireResponses && questionnaireResponses.length > 0 ? (
                  questionnaireResponses.map(response => (
                    <div 
                      key={response.id}
                      className="p-5 rounded-xl border"
                      style={{
                        background: 'var(--bg-card)',
                        backdropFilter: 'blur(20px)',
                        borderColor: 'var(--border)'
                      }}
                    >
                      <h4 className="font-semibold text-base mb-2" style={{ color: 'var(--text-primary)' }}>
                        {response.questionnaires?.title}
                      </h4>
                      <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                        Respondido em {new Date(response.created_at).toLocaleDateString('pt-BR')}
                      </p>
                      
                      {response.answers && typeof response.answers === 'object' && (
                        <div className="space-y-2">
                          {Object.entries(response.answers as Record<string, any>).map(([key, value]) => (
                            <div key={key} className="text-sm">
                              <span style={{ color: 'var(--text-muted)' }}>{key}:</span>
                              <span className="ml-2 font-medium" style={{ color: 'var(--text-primary)' }}>{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                  ) : (
                    <div className="text-center py-12">
                      <FileQuestion size={64} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-3" />
                      <p style={{ color: 'var(--text-muted)' }}>Nenhum questionário respondido</p>
                    </div>
                  )}
                </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de visualização da anamnese */}
      {viewingAnamnese && (
        <AnamneseViewer
          anamnese={viewingAnamnese}
          clientName={client.name}
          onClose={() => setViewingAnamnese(null)}
        />
      )}

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={!!deletingAnamneseId} onOpenChange={(open) => !open && setDeletingAnamneseId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta anamnese? Esta ação não pode ser desfeita e todos os dados da anamnese serão perdidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingAnamneseId) {
                  deleteAnamnese.mutate({ 
                    anamneseId: deletingAnamneseId, 
                    clientId: client.id 
                  });
                  setDeletingAnamneseId(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Client Modal */}
      {showEditModal && (
        <EditClientModal 
          client={client} 
          onClose={() => setShowEditModal(false)} 
        />
      )}

      {/* Appointment Modal */}
      {showAppointmentModal && (
        <AgendamentoModal
          isOpen={showAppointmentModal}
          onClose={() => setShowAppointmentModal(false)}
          clientId={client.id}
          clientName={client.name}
        />
      )}

      {/* Send Questionnaire Modal */}
      <SendQuestionnaireModal
        open={showQuestionnaireModal}
        onOpenChange={setShowQuestionnaireModal}
        questionnaireId={null}
      />
    </div>
  );
}

interface InfoItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

function InfoItem({ icon: Icon, label, value }: InfoItemProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} style={{ color: 'var(--text-muted)' }} />
        <h4 
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'var(--text-muted)' }}
        >
          {label}
        </h4>
      </div>
      <p 
        className="text-base font-medium"
        style={{ color: 'var(--text-primary)' }}
      >
        {value}
      </p>
    </div>
  );
}
