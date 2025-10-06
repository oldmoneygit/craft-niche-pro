import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Phone, Clock, MessageCircle, Calendar, X } from 'lucide-react';
import { Lead } from '@/hooks/useLeads';

interface LeadCardProps {
  lead: Lead;
  onContact: (leadId: string) => void;
  onSchedule: (leadId: string) => void;
  onDelete: (leadId: string) => void;
}

export function LeadCard({ lead, onContact, onSchedule, onDelete }: LeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'move'
  };

  const cardStyle = {
    background: 'hsl(var(--card))',
    backdropFilter: 'blur(20px)',
    borderColor: 'hsl(var(--border))',
    ...style
  };

  return (
    <div
      ref={setNodeRef}
      style={cardStyle}
      {...attributes}
      className="p-4 rounded-xl border hover:shadow-lg transition-all"
    >
      {/* Área de drag - apenas o conteúdo, não os botões */}
      <div {...listeners} className="cursor-move mb-3">
        {/* Nome */}
        <h4 className="font-semibold text-base mb-2 text-foreground">
          {lead.name}
        </h4>

        {/* Badge "Capturado pela IA" */}
        {lead.source === 'ai_chat' && (
          <span className="inline-block px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-lg mb-3">
            Capturado pela IA
          </span>
        )}

        {/* Telefone */}
        {lead.phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Phone className="w-4 h-4" />
            <span>{lead.phone}</span>
          </div>
        )}

        {/* Email */}
        {lead.email && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span className="truncate">{lead.email}</span>
          </div>
        )}

        {/* Preferência de horário */}
        {lead.preferred_time_description && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Clock className="w-4 h-4" />
            <span>Prefere: {lead.preferred_time_description}</span>
          </div>
        )}

        {/* Data de captura */}
        <p className="text-xs text-muted-foreground">
          Capturado em {new Date(lead.created_at).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>

      {/* Botões de ação - SEM drag listeners */}
      <div className="flex gap-2">
        {lead.status === 'pending' && (
          <button
            onClick={() => onContact(lead.id)}
            className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Contatar
          </button>
        )}
        
        {lead.status === 'contacted' && (
          <button
            onClick={() => onSchedule(lead.id)}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Agendar
          </button>
        )}
        
        <button
          onClick={() => onDelete(lead.id)}
          className="p-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          title="Excluir lead"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
