import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { MessageCircle, Calendar } from 'lucide-react';
import { Lead } from '@/hooks/useLeads';
import { LeadCard } from './LeadCard';

interface KanbanColumnProps {
  id: string;
  title: string;
  count: number;
  leads: Lead[];
  onContact: (leadId: string) => void;
  onSchedule: (leadId: string) => void;
  onDelete: (leadId: string) => void;
}

export function KanbanColumn({ 
  id, 
  title, 
  count, 
  leads,
  onContact,
  onSchedule,
  onDelete
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ 
    id,
    data: { type: 'column', status: id } // ✅ Metadados para validação
  });
  
  return (
    <div
      ref={setNodeRef}
      data-status={id}
      className={`kanban-column transition-all ${
        isOver ? 'ring-2 ring-emerald-500 scale-[1.02]' : ''
      }`}
    >
      {/* Header da coluna */}
      <div className="kanban-column-header">
        <div className="kanban-column-title">{title}</div>
        <div className="kanban-column-count">{count}</div>
      </div>

      {/* Lista de leads */}
      <div className="space-y-3">
        <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
          {leads.length > 0 ? (
            leads.map(lead => (
              <LeadCard 
                key={lead.id} 
                lead={lead}
                onContact={onContact}
                onSchedule={onSchedule}
                onDelete={onDelete}
              />
            ))
          ) : (
            <div className="kanban-empty-state">
              {id === 'pending' && <MessageCircle />}
              {id === 'contacted' && <MessageCircle />}
              {id === 'scheduled' && <Calendar />}
              <p>
                {id === 'pending' && 'Nenhum lead pendente'}
                {id === 'contacted' && 'Nenhum lead contactado'}
                {id === 'scheduled' && 'Nenhum agendamento realizado'}
              </p>
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}
