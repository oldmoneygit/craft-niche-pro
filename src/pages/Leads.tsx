import { useState, useMemo } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';
import { UserPlus, Plus, AlertCircle } from 'lucide-react';
import { useLeads } from '@/hooks/useLeads';
import { KanbanColumn } from '@/components/leads/KanbanColumn';
import { LeadCard } from '@/components/leads/LeadCard';
import { CreateLeadModal } from '@/components/leads/CreateLeadModal';
import { Skeleton } from '@/components/ui/skeleton';
import './Leads.css';

export function Leads() {
  const { leads, isLoading, error, updateLeadStatus, createLead, deleteLead } = useLeads();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
    
    const leadId = active.id as string;
    const newStatus = over.id as string;
    
    console.log('🔍 Drag End Debug:', {
      leadId,
      newStatus,
      overId: over.id,
      activeId: active.id,
      overIdType: typeof over.id,
      newStatusType: typeof newStatus
    });
    
    const lead = leads?.find(l => l.id === leadId);
    
    if (!lead) {
      console.warn('⚠️ Lead não encontrado:', leadId);
      setActiveId(null);
      return;
    }
    
    console.log('📋 Lead encontrado:', { 
      currentStatus: lead.status, 
      newStatus,
      willUpdate: lead.status !== newStatus 
    });
    
    if (lead.status !== newStatus) {
      try {
        await updateLeadStatus.mutateAsync({ leadId, newStatus });
      } catch (error) {
        console.error('❌ Erro ao atualizar status:', error);
      }
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
    
    window.location.href = `/agendamentos?action=new&leadId=${leadId}&name=${encodeURIComponent(lead.name)}&phone=${lead.phone}`;
  };

  const handleDelete = (leadId: string) => {
    if (confirm('Tem certeza que deseja excluir este lead?')) {
      deleteLead.mutate(leadId);
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
            background: 'rgba(239, 68, 68, 0.1)',
            borderColor: '#ef4444'
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
            color="#f59e0b"
            leads={leadsByStatus.pending}
            onContact={handleContact}
            onSchedule={handleSchedule}
            onDelete={handleDelete}
          />
          
          <KanbanColumn
            id="contacted"
            title="CONTACTADOS"
            count={leadsByStatus.contacted.length}
            color="#3b82f6"
            leads={leadsByStatus.contacted}
            onContact={handleContact}
            onSchedule={handleSchedule}
            onDelete={handleDelete}
          />
          
          <KanbanColumn
            id="scheduled"
            title="AGENDADOS"
            count={leadsByStatus.scheduled.length}
            color="#10b981"
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
    </div>
  );
}
