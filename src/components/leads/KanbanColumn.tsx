import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { MessageCircle, Calendar } from 'lucide-react';
import { Lead } from '@/hooks/useLeads';
import { LeadCard } from './LeadCard';

interface KanbanColumnProps {
  id: string;
  title: string;
  count: number;
  color: string;
  leads: Lead[];
  onContact: (leadId: string) => void;
  onSchedule: (leadId: string) => void;
  onDelete: (leadId: string) => void;
}

export function KanbanColumn({ 
  id, 
  title, 
  count, 
  color, 
  leads,
  onContact,
  onSchedule,
  onDelete
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id });
  
  return (
    <div
      ref={setNodeRef}
      className="flex flex-col h-full min-h-[600px]"
    >
      {/* Header da coluna */}
      <div 
        className="p-4 rounded-t-2xl border-b-2 flex items-center justify-between"
        style={{
          background: 'hsl(var(--card))',
          backdropFilter: 'blur(20px)',
          borderColor: color,
          borderWidth: '0 0 2px 0'
        }}
      >
        <h3 className="font-semibold text-sm uppercase tracking-wide" style={{ color }}>
          {title}
        </h3>
        <span 
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: color }}
        >
          {count}
        </span>
      </div>

      {/* Lista de leads */}
      <div 
        className="flex-1 p-4 space-y-3 overflow-y-auto rounded-b-2xl border border-t-0"
        style={{
          background: 'hsl(var(--card))',
          backdropFilter: 'blur(20px)',
          borderColor: 'hsl(var(--border))'
        }}
      >
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
            <div className="text-center py-12">
              {id === 'pending' && <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />}
              {id === 'contacted' && <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />}
              {id === 'scheduled' && <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />}
              <p className="text-sm text-muted-foreground">
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
