import { useState } from 'react';
import { 
  UserPlus, Phone, Clock, MessageCircle, 
  Calendar, X
} from 'lucide-react';
import './Leads.css';

interface Lead {
  id: string;
  name: string;
  phone: string;
  preferredTime: string;
  capturedAt: string;
  status: 'pending' | 'contacted' | 'scheduled';
  aiCaptured: boolean;
}

export function Leads() {
  const [leads] = useState<Lead[]>([
    {
      id: '1',
      name: 'Pamela Ferreira',
      phone: '19 982403342',
      preferredTime: 'quinta às 09h',
      capturedAt: '01/10/2025, 20:12:23',
      status: 'pending',
      aiCaptured: true
    }
  ]);

  const getLeadsByStatus = (status: Lead['status']) => {
    return leads.filter(lead => lead.status === status);
  };

  const handleContact = (leadId: string) => {
    console.log('Contact lead:', leadId);
  };

  const handleSchedule = (leadId: string) => {
    console.log('Schedule lead:', leadId);
  };

  const handleReject = (leadId: string) => {
    console.log('Reject lead:', leadId);
  };

  const pendingLeads = getLeadsByStatus('pending');
  const contactedLeads = getLeadsByStatus('contacted');
  const scheduledLeads = getLeadsByStatus('scheduled');

  return (
    <div className="leads-page">
      {/* Header */}
      <div className="leads-header">
        <div className="header-content">
          <h1>
            <UserPlus size={32} />
            Gestão de Leads
          </h1>
          <p>Acompanhe e gerencie seus leads capturados</p>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="kanban-board">
        {/* PENDENTES */}
        <div className="kanban-column column-pendentes">
          <div className="kanban-header">
            <div className="kanban-title">Pendentes</div>
            <div className="kanban-count">{pendingLeads.length}</div>
          </div>

          {pendingLeads.length > 0 ? (
            pendingLeads.map((lead) => (
              <div key={lead.id} className="lead-card ai-captured">
                <div className="lead-header">
                  <div className="lead-name">{lead.name}</div>
                  {lead.aiCaptured && (
                    <div className="lead-badge">Capturado pela IA</div>
                  )}
                </div>

                <div className="lead-info">
                  <div className="info-item">
                    <Phone size={18} />
                    <span>{lead.phone}</span>
                  </div>
                  <div className="info-item">
                    <Clock size={18} />
                    <span>Prefere: {lead.preferredTime}</span>
                  </div>
                </div>

                <div className="lead-meta">
                  Capturado em {lead.capturedAt}
                </div>

                <div className="lead-actions">
                  <button 
                    className="btn btn-contact"
                    onClick={() => handleContact(lead.id)}
                  >
                    <MessageCircle size={16} />
                    Contatar
                  </button>
                  <button 
                    className="btn btn-schedule"
                    onClick={() => handleSchedule(lead.id)}
                  >
                    <Calendar size={16} />
                    Agendar
                  </button>
                  <button 
                    className="btn btn-reject"
                    onClick={() => handleReject(lead.id)}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <MessageCircle size={56} />
              <p>Nenhum lead pendente</p>
            </div>
          )}
        </div>

        {/* CONTACTADOS */}
        <div className="kanban-column column-contactados">
          <div className="kanban-header">
            <div className="kanban-title">Contactados</div>
            <div className="kanban-count">{contactedLeads.length}</div>
          </div>

          {contactedLeads.length > 0 ? (
            contactedLeads.map((lead) => (
              <div key={lead.id} className="lead-card">
                <div className="lead-header">
                  <div className="lead-name">{lead.name}</div>
                </div>
                <div className="lead-info">
                  <div className="info-item">
                    <Phone size={18} />
                    <span>{lead.phone}</span>
                  </div>
                </div>
                <div className="lead-meta">
                  Contactado em {lead.capturedAt}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <MessageCircle size={56} />
              <p>Nenhum lead contactado</p>
            </div>
          )}
        </div>

        {/* AGENDADOS */}
        <div className="kanban-column column-agendados">
          <div className="kanban-header">
            <div className="kanban-title">Agendados</div>
            <div className="kanban-count">{scheduledLeads.length}</div>
          </div>

          {scheduledLeads.length > 0 ? (
            scheduledLeads.map((lead) => (
              <div key={lead.id} className="lead-card">
                <div className="lead-header">
                  <div className="lead-name">{lead.name}</div>
                </div>
                <div className="lead-info">
                  <div className="info-item">
                    <Phone size={18} />
                    <span>{lead.phone}</span>
                  </div>
                </div>
                <div className="lead-meta">
                  Agendado para {lead.preferredTime}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <Calendar size={56} />
              <p>Nenhum agendamento realizado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
