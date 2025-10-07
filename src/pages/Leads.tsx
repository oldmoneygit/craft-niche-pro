import { useState, useMemo } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';
import { UserPlus, Plus, AlertCircle } from 'lucide-react';
import { useLeads } from '@/hooks/useLeads';
import { KanbanColumn } from '@/components/leads/KanbanColumn';
import { LeadCard } from '@/components/leads/LeadCard';
import { CreateLeadModal } from '@/components/leads/CreateLeadModal';
import { AgendamentoModal } from '@/components/agendamentos/AgendamentoModal';
import { Skeleton } from '@/components/ui/skeleton';
import './Leads.css';

export function Leads() {
  const { leads, isLoading, error, updateLeadStatus, createLead, deleteLead } = useLeads();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);

  const leadsByStatus = useMemo(() => {
    if (!leads) return { pending: [], contacted: [], scheduled: [] };
    
    return {
      pending: leads.filter(l => l.status === 'pending'),
      contacted: leads.filter(l => l.status === 'contacted'),
      scheduled: leads.filter(l => l.status === 'scheduled')
    };
  }, [leads]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }
    
    const overData = over.data.current;
    const leadId = active.id as string;
    let newStatus: string;
    
    // ✅ Aceitar drop tanto sobre colunas quanto sobre cards
    if (overData?.type === 'column') {
      // Dropou sobre a coluna (área vazia)
      newStatus = overData.status as string;
      console.log('✅ Drop sobre coluna vazia:', { leadId, newStatus });
    } else {
      // Dropou sobre um card - pegar o status do card de destino
      const targetLead = leads?.find(l => l.id === over.id);
      if (!targetLead) {
        console.warn('⚠️ Drop inválido');
        setActiveId(null);
        return;
      }
      newStatus = targetLead.status;
      console.log('✅ Drop sobre card:', { leadId, targetStatus: newStatus });
    }
    
    const currentLead = leads?.find(l => l.id === leadId);
    
    if (!currentLead) {
      console.warn('⚠️ Lead não encontrado:', leadId);
      setActiveId(null);
      return;
    }
    
    // Não fazer nada se já está no status correto
    if (currentLead.status === newStatus) {
      console.log('ℹ️ Lead já está neste status');
      setActiveId(null);
      return;
    }
    
    console.log('🔄 Atualizando status:', {
      leadName: currentLead.name,
      from: currentLead.status,
      to: newStatus
    });
    
    try {
      await updateLeadStatus.mutateAsync({ leadId, newStatus });
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
    }
    
    setActiveId(null);
  };

  const handleContact = async (leadId: string) => {
    const lead = leads?.find(l => l.id === leadId);
    if (!lead) return;
    
    const message = encodeURIComponent(
      `Olá ${lead.name}! Vi que você se interessou pelos nossos serviços de nutrição. Como posso te ajudar?`
    );
    window.open(`https://wa.me/${lead.phone.replace(/\D/g, '')}?text=${message}`, '_blank');
    
    await updateLeadStatus.mutateAsync({ leadId, newStatus: 'contacted' });
  };

  const handleSchedule = (leadId: string) => {
    const lead = leads?.find(l => l.id === leadId);
    if (!lead) return;
    
    setSelectedLead(lead);
    setIsScheduleModalOpen(true);
  };

  const handleScheduleModalClose = () => {
    setIsScheduleModalOpen(false);
    setSelectedLead(null);
  };

  const handleDelete = async (leadId: string) => {
    console.log('🔍 handleDelete chamado para:', leadId);
    
    const lead = leads?.find(l => l.id === leadId);
    
    if (!lead) {
      console.error('❌ Lead não encontrado:', leadId);
      return;
    }
    
    console.log('📋 Lead encontrado:', { id: lead.id, name: lead.name });
    
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o lead "${lead.name}"?\n\nEsta ação não pode ser desfeita.`
    );
    
    console.log('🔍 Usuário confirmou exclusão:', confirmed);
    
    if (confirmed) {
      try {
        console.log('🗑️ Iniciando exclusão...');
        await deleteLead.mutateAsync(leadId);
        console.log('✅ Exclusão concluída com sucesso');
      } catch (error) {
        console.error('❌ Erro ao excluir lead:', error);
      }
    } else {
      console.log('ℹ️ Exclusão cancelada pelo usuário');
    }
  };

  const handleCreateLead = (data: any) => {
    createLead.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="container max-w-[1600px] mx-auto p-6">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <Skeleton 
              key={i}
              className="h-[600px] rounded-2xl"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-[1600px] mx-auto p-6">
        <div 
          className="p-6 rounded-2xl border flex items-center gap-3"
          style={{
            background: 'var(--error-alpha)',
            borderColor: 'var(--destructive)'
          }}
        >
          <AlertCircle className="w-5 h-5 text-red-500" />
          <div>
            <p className="font-semibold text-red-700">Erro ao carregar leads</p>
            <p className="text-sm text-red-600">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  const activeLead = activeId ? leads?.find(l => l.id === activeId) : null;

  return (
    <div className="container max-w-[1600px] mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <UserPlus size={32} className="text-primary" />
          Gestão de Leads
        </h1>
        <p className="text-muted-foreground">
          Acompanhe e gerencie seus leads capturados
        </p>
      </div>

      {/* Kanban Board */}
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <KanbanColumn
            id="pending"
            title="PENDENTES"
            count={leadsByStatus.pending.length}
            leads={leadsByStatus.pending}
            onContact={handleContact}
            onSchedule={handleSchedule}
            onDelete={handleDelete}
          />
          
          <KanbanColumn
            id="contacted"
            title="CONTACTADOS"
            count={leadsByStatus.contacted.length}
            leads={leadsByStatus.contacted}
            onContact={handleContact}
            onSchedule={handleSchedule}
            onDelete={handleDelete}
          />
          
          <KanbanColumn
            id="scheduled"
            title="AGENDADOS"
            count={leadsByStatus.scheduled.length}
            leads={leadsByStatus.scheduled}
            onContact={handleContact}
            onSchedule={handleSchedule}
            onDelete={handleDelete}
          />
        </div>

        <DragOverlay>
          {activeLead && (
            <div style={{ width: '350px' }}>
              <LeadCard 
                lead={activeLead}
                onContact={handleContact}
                onSchedule={handleSchedule}
                onDelete={handleDelete}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* FAB - Adicionar Lead */}
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center z-50"
        style={{
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)'
        }}
      >
        <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
      </button>

      {/* Modal Criar Lead */}
      <CreateLeadModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateLead}
      />

      {/* Modal Agendar Consulta */}
      <AgendamentoModal
        isOpen={isScheduleModalOpen}
        onClose={handleScheduleModalClose}
        leadData={selectedLead}
      />
    </div>
  );
}
