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
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`lead-card status-${lead.status} ${lead.source === 'ai_chat' ? 'ai-captured' : ''}`}
    >
      {/* Área de drag - apenas o conteúdo, não os botões */}
      <div {...listeners} className="cursor-move">
        {/* Header */}
        <div className="lead-header">
          <h4 className="lead-name">{lead.name}</h4>
          {lead.source === 'ai_chat' && (
            <span className="lead-badge">Capturado pela IA</span>
          )}
        </div>

        {/* Info */}
        <div className="lead-info">
          {lead.phone && (
            <div className="info-item">
              <Phone className="w-[18px] h-[18px]" />
              <span>{lead.phone}</span>
            </div>
          )}
          
          {lead.email && (
            <div className="info-item">
              <span className="truncate">{lead.email}</span>
            </div>
          )}
          
          {lead.preferred_time_description && (
            <div className="info-item">
              <Clock className="w-[18px] h-[18px]" />
              <span>Prefere: {lead.preferred_time_description}</span>
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="lead-meta">
          Capturado em {new Date(lead.created_at).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>

      {/* Botões de ação - SEM drag listeners */}
      <div className="lead-actions">
        {lead.status === 'pending' && (
          <>
            <button
              onClick={() => onContact(lead.id)}
              className="btn btn-contact"
            >
              <MessageCircle className="w-4 h-4" />
              Contatar
            </button>
            <button
              onClick={() => onSchedule(lead.id)}
              className="btn btn-schedule"
            >
              <Calendar className="w-4 h-4" />
              Agendar
            </button>
            <button
              onClick={() => onDelete(lead.id)}
              className="btn btn-reject"
              title="Excluir lead"
            >
              <X className="w-4 h-4" color="#ef4444" strokeWidth={2.5} />
            </button>
          </>
        )}
        
        {lead.status === 'contacted' && (
          <>
            <button
              onClick={() => onSchedule(lead.id)}
              className="btn btn-schedule"
            >
              <Calendar className="w-4 h-4" />
              Agendar
            </button>
            <button
              onClick={() => onDelete(lead.id)}
              className="btn btn-reject"
              title="Excluir lead"
            >
              <X className="w-4 h-4" color="#ef4444" strokeWidth={2.5} />
            </button>
          </>
        )}
        
        {lead.status === 'scheduled' && (
          <button
            onClick={() => onDelete(lead.id)}
            className="btn btn-reject"
            title="Excluir lead"
          >
            <X className="w-4 h-4" color="#ef4444" strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
}
